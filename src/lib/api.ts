import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isAppError } from "@/lib/errors";

export type ApiErrorBody = {
  error: { code: string; message: string; details?: unknown };
};

/** Maps any thrown error to a consistent JSON error response. */
export function errorResponse(error: unknown): NextResponse<ApiErrorBody> {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "The request is invalid.",
          details: z.flattenError(error).fieldErrors,
        },
      },
      { status: 422 },
    );
  }
  if (isAppError(error)) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message, details: error.details } },
      { status: error.status },
    );
  }
  console.error("[api] unhandled error", error);
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "Something went wrong. Please try again." } },
    { status: 500 },
  );
}

/** Wraps a route handler so domain/validation errors become JSON responses. */
export function withErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>,
): (...args: Args) => Promise<Response> {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (error) {
      return errorResponse(error);
    }
  };
}

/** Parses a JSON request body, returning a 400-style validation error on malformed JSON. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new z.ZodError([
      { code: "custom", message: "Request body must be valid JSON.", path: [], input: undefined },
    ]);
  }
}
