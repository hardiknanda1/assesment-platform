"use client";

import * as React from "react";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig } from "@/config/site";

/**
 * Client-side only: this composes a `mailto:` link and hands off to the
 * visitor's mail app. There's no backend endpoint for contact messages yet —
 * if that's added later (e.g. `POST /api/contact` writing to a table or
 * forwarding via an email provider), swap the `onSubmit` body for a fetch
 * call; the form markup and validation below don't need to change.
 */
export function ContactForm() {
  const [pending, setPending] = React.useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    if (!name || !email || !message) {
      toast.error("Please fill in every field.");
      return;
    }

    setPending(true);
    const subject = encodeURIComponent(`Message from ${name} via ${siteConfig.name}`);
    const body = encodeURIComponent(`${message}\n\n—\n${name}\n${email}`);
    window.location.href = `mailto:${siteConfig.supportEmail}?subject=${subject}&body=${body}`;

    toast.success("Opening your mail app…", {
      description: "Send the email that just opened and we'll get back to you within a couple of days.",
    });
    form.reset();
    window.setTimeout(() => setPending(false), 600);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-neutral-700">
            Name
          </Label>
          <Input id="name" name="name" autoComplete="name" required placeholder="Your full name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-neutral-700">
            Email
          </Label>
          <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message" className="text-neutral-700">
          Message
        </Label>
        <Textarea id="message" name="message" required placeholder="What can we help with?" className="min-h-36" />
      </div>
      <Button type="submit" size="lg" variant="mono" disabled={pending} className="group w-full sm:w-auto">
        Send message
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </Button>
    </form>
  );
}
