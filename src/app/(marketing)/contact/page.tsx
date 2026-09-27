import type { Metadata } from "next";
import { Clock3, Mail, MessageCircle } from "lucide-react";
import { ContactForm } from "@/components/landing/contact-form";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with the ${siteConfig.name} team.`,
};

export default function ContactPage() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div>
            <p className="text-xs font-medium tracking-[0.14em] text-neutral-500 uppercase">Get in touch</p>
            <h1 className="font-serif mt-4 text-4xl font-medium tracking-tight text-neutral-950 sm:text-5xl">
              Let&apos;s talk.
            </h1>
            <p className="mt-5 max-w-sm text-base text-neutral-500">
              Questions about eligibility, the exam format, or the prizes? Write to us &mdash; a real person reads
              every message.
            </p>

            <ul className="mt-10 space-y-6 border-t border-neutral-950/10 pt-8">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4.5 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-950">Email</p>
                  <a
                    href={`mailto:${siteConfig.supportEmail}`}
                    className="text-sm text-neutral-500 underline-offset-4 hover:text-neutral-950 hover:underline"
                  >
                    {siteConfig.supportEmail}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock3 className="mt-0.5 size-4.5 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-950">Response time</p>
                  <p className="text-sm text-neutral-500">Usually within 1&ndash;2 business days.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MessageCircle className="mt-0.5 size-4.5 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-950">Before you write in</p>
                  <p className="text-sm text-neutral-500">
                    Most eligibility and format questions are already covered on the{" "}
                    <a href="/about" className="underline underline-offset-4 hover:text-neutral-950">
                      about page
                    </a>
                    .
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-neutral-950/10 p-8 sm:p-10">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
