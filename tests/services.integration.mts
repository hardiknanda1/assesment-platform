/**
 * Service-layer integration tests against a real PostgreSQL database.
 * Creates throwaway users/enrollments — run against a local or test DB only:
 *
 *   npm run db:deploy && npm run db:seed && npm run test:integration
 */
import "dotenv/config";
import assert from "node:assert/strict";
import { db } from "@/lib/db";
import { syncUser } from "@/lib/services/user.service";
import { enrollStudent, listEnrollments, getEnrollmentDetail, updateEnrollmentStatus, iterateEnrollmentsForExport, countEnrollments, getEnrollmentByApplicationNumber } from "@/lib/services/enrollment.service";
import { getDashboardStats } from "@/lib/services/admin.service";
// tsx may load src modules twice (ESM+CJS), so match on error.code rather than instanceof.
type Err = { code?: string; status?: number; applicationNumber?: string } | undefined;
const is = (code: string) => (e: unknown) => (e as Err)?.code === code;
const DUP = "DUPLICATE_ENROLLMENT";
import { EnrollmentSchema, EnrollmentListQuerySchema } from "@/lib/validations/enrollment";
import { csvRow } from "@/lib/utils/csv";

const run = Date.now().toString(36);
let passed = 0;
async function t(name: string, fn: () => Promise<void> | void) { await fn(); passed++; console.log("  ✓", name); }

const fa = await db.exam.findUniqueOrThrow({ where: { code: "FA26" } });
const base = { name: "Test Student", phone: "+91 98765-43210", school: "Test School", grade: "10", city: "Pune", examId: fa.id };

await t("zod: valid input normalises phone + email", () => {
  const p = EnrollmentSchema.parse({ ...base, email: "  Foo@Example.COM " });
  assert.equal(p.phone, "+919876543210"); assert.equal(p.email, "foo@example.com");
});
await t("zod: rejects bad phone/grade/empty name", () => {
  const r = EnrollmentSchema.safeParse({ ...base, email: "x@y.com", phone: "123", grade: "13", name: "" });
  assert.equal(r.success, false);
  const keys = Object.keys((r.error ? r.error.flatten().fieldErrors : {})).sort();
  assert.deepEqual(keys, ["grade", "name", "phone"]);
});
await t("zod: list query falls back on garbage", () => {
  const q = EnrollmentListQuerySchema.parse({ page: "-4", limit: "7", status: "NOPE" });
  assert.deepEqual([q.page, q.limit, q.status], [1, 25, undefined]);
});

const u1 = await syncUser({ clerkId: `ck_${run}_1`, email: `s1_${run}@test.dev`, bootstrapAdmin: false });
const admin = await syncUser({ clerkId: `ck_${run}_a`, email: `admin_${run}@test.dev`, bootstrapAdmin: true });

await t("syncUser: bootstrap admin + idempotent", async () => {
  assert.equal(admin.role, "ADMIN"); assert.equal(u1.role, "STUDENT");
  const again = await syncUser({ clerkId: `ck_${run}_1`, email: `s1_${run}@test.dev`, bootstrapAdmin: false });
  assert.equal(again.id, u1.id);
});

let appNo = "";
await t("enroll: creates student + enrollment with server-side app number", async () => {
  const seqBefore = (await db.exam.findUniqueOrThrow({ where: { id: fa.id } })).applicationSeq;
  const r = await enrollStudent(u1, EnrollmentSchema.parse({ ...base, email: u1.email }));
  appNo = r.applicationNumber;
  assert.equal(appNo, `FA26-${String(seqBefore + 1).padStart(6, "0")}`);
  const st = await db.student.findUniqueOrThrow({ where: { userId: u1.id } });
  assert.equal(st.phone, "+919876543210");
});
await t("enroll: duplicate for same student/exam is rejected with existing number", async () => {
  await assert.rejects(enrollStudent(u1, EnrollmentSchema.parse({ ...base, email: u1.email })),
    (e: unknown) => (e as Err)?.code === DUP && (e as Err)?.applicationNumber === appNo);
});
await t("enroll: email mismatch rejected", async () => {
  const u = await syncUser({ clerkId: `ck_${run}_m`, email: `m_${run}@test.dev`, bootstrapAdmin: false });
  await assert.rejects(enrollStudent(u, EnrollmentSchema.parse({ ...base, email: "other@test.dev" })), (e: unknown) => (e as Err)?.status === 422);
});
await t("enroll: admin cannot enroll", async () => {
  await assert.rejects(enrollStudent(admin, EnrollmentSchema.parse({ ...base, email: admin.email })), (e: unknown) => (e as Err)?.status === 422);
});
await t("enroll: non-OPEN exam rejected; unknown exam 404", async () => {
  const draft = await db.exam.create({ data: { code: `D${run.slice(-6).toUpperCase()}`.slice(0, 10), name: "Draft exam", status: "DRAFT" } });
  const u = await syncUser({ clerkId: `ck_${run}_d`, email: `d_${run}@test.dev`, bootstrapAdmin: false });
  await assert.rejects(enrollStudent(u, EnrollmentSchema.parse({ ...base, email: u.email, examId: draft.id })), (e: unknown) => (e as Err)?.status === 422);
  await assert.rejects(enrollStudent(u, EnrollmentSchema.parse({ ...base, email: u.email, examId: "nope" })), is("NOT_FOUND"));
  await db.exam.delete({ where: { id: draft.id } });
});
await t("concurrency: 60 students enrolling at once get unique, gap-free numbers", async () => {
  const users = await Promise.all(Array.from({ length: 60 }, (_, i) =>
    syncUser({ clerkId: `ck_${run}_c${i}`, email: `c${i}_${run}@test.dev`, bootstrapAdmin: false })));
  const before = (await db.exam.findUniqueOrThrow({ where: { id: fa.id } })).applicationSeq;
  const res = await Promise.all(users.map((u) => enrollStudent(u, EnrollmentSchema.parse({ ...base, email: u.email }))));
  const nums = res.map((r) => Number(r.applicationNumber.split("-")[1])).sort((a, b) => a - b);
  assert.equal(new Set(nums).size, 60);
  assert.deepEqual(nums, Array.from({ length: 60 }, (_, i) => before + 1 + i));
});
await t("concurrency: same student double-submit → exactly one enrollment", async () => {
  const u = await syncUser({ clerkId: `ck_${run}_dbl`, email: `dbl_${run}@test.dev`, bootstrapAdmin: false });
  const input = EnrollmentSchema.parse({ ...base, email: u.email });
  const out = await Promise.allSettled(Array.from({ length: 5 }, () => enrollStudent(u, input)));
  const ok = out.filter((o) => o.status === "fulfilled");
  const dup = out.filter((o) => o.status === "rejected" && (o.reason as Err)?.code === DUP);
  assert.equal(ok.length, 1); assert.equal(dup.length, 4);
  assert.equal(await db.enrollment.count({ where: { student: { userId: u.id } } }), 1);
});
await t("ownership: other student can't read confirmation; owner + admin can", async () => {
  const other = await syncUser({ clerkId: `ck_${run}_o`, email: `o_${run}@test.dev`, bootstrapAdmin: false });
  await assert.rejects(getEnrollmentByApplicationNumber(other, appNo), is("NOT_FOUND"));
  assert.equal((await getEnrollmentByApplicationNumber(u1, appNo.toLowerCase())).applicationNumber, appNo);
  assert.ok(await getEnrollmentByApplicationNumber(admin, appNo));
});
await t("authz: students can't call admin services", async () => {
  const q = EnrollmentListQuerySchema.parse({});
  await assert.rejects(listEnrollments(u1, q), is("FORBIDDEN"));
  await assert.rejects(getDashboardStats(u1), is("FORBIDDEN"));
  await assert.rejects(countEnrollments(u1, {}), is("FORBIDDEN"));
});
await t("admin list: pagination, search, filters", async () => {
  const total = await db.enrollment.count();
  const p1 = await listEnrollments(admin, EnrollmentListQuerySchema.parse({ limit: "10" }));
  assert.equal(p1.total, total); assert.equal(p1.items.length, 10); assert.equal(p1.pageCount, Math.ceil(total / 10));
  const p2 = await listEnrollments(admin, EnrollmentListQuerySchema.parse({ limit: "10", page: "2" }));
  assert.equal(new Set([...p1.items, ...p2.items].map((i) => i.id)).size, 20);
  const byNo = await listEnrollments(admin, EnrollmentListQuerySchema.parse({ q: appNo.toLowerCase() }));
  assert.equal(byNo.total, 1); assert.equal(byNo.items[0].applicationNumber, appNo);
  const byEmail = await listEnrollments(admin, EnrollmentListQuerySchema.parse({ q: `S1_${run}` }));
  assert.equal(byEmail.total, 1);
  const byPhone = await listEnrollments(admin, EnrollmentListQuerySchema.parse({ q: "98765 43210" }));
  assert.ok(byPhone.total >= 62);
  const cancelled = await listEnrollments(admin, EnrollmentListQuerySchema.parse({ status: "CANCELLED" }));
  assert.ok(cancelled.items.every((i) => i.status === "CANCELLED"));
  const g10fa = await listEnrollments(admin, EnrollmentListQuerySchema.parse({ grade: "10", examId: fa.id, limit: "100" }));
  assert.ok(g10fa.items.every((i) => i.student.grade === "10" && i.exam.id === fa.id));
});
await t("status update is audited", async () => {
  const e = await db.enrollment.findUniqueOrThrow({ where: { applicationNumber: appNo } });
  const r = await updateEnrollmentStatus(admin, e.id, { status: "WAITLISTED" });
  assert.equal(r.status, "WAITLISTED");
  const log = await db.auditLog.findFirst({ where: { entityId: e.id, action: "enrollment.status_updated" } });
  assert.deepEqual(log?.metadata, { from: "CONFIRMED", to: "WAITLISTED" });
  const d = await getEnrollmentDetail(admin, e.id);
  assert.equal(d.student.user.email, u1.email);
});
await t("export iterator: batches cover all filtered rows exactly once", async () => {
  const filters = { status: "CONFIRMED" as const };
  const expected = await countEnrollments(admin, filters);
  const ids: string[] = [];
  for await (const batch of iterateEnrollmentsForExport(admin, filters, 7)) ids.push(...batch.map((b) => b.id));
  assert.equal(ids.length, expected); assert.equal(new Set(ids).size, expected);
});
await t("csv: escaping + formula injection guard", () => {
  assert.equal(csvRow(['a,b', 'he said "hi"', "=SUM(A1)", "+91", null]), '"a,b","he said ""hi""",\'=SUM(A1),\'+91,\r\n');
});
await t("dashboard stats", async () => {
  const s = await getDashboardStats(admin);
  assert.equal(s.totals.enrollments, await db.enrollment.count());
  assert.equal(s.trend.length, 14);
  assert.ok(s.trend.at(-1)!.count >= 60);
  assert.equal(Object.values(s.byStatus).reduce((a, b) => a + b, 0), s.totals.enrollments);
});

console.log(`\n${passed} checks passed`);
await db.$disconnect();
