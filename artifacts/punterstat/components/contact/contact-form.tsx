"use client";

import { useActionState } from "react";
import { submitContact, type ContactFormState } from "@/lib/contact/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Loader2 } from "lucide-react";

const initialState: ContactFormState = {};

export function ContactForm() {
  const [state, action, isPending] = useActionState(submitContact, initialState);

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-green-200 bg-green-50 px-8 py-14 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-7 w-7 text-green-600" />
        </div>
        <h3 className="text-base font-semibold text-green-900">Message sent!</h3>
        <p className="max-w-xs text-sm leading-relaxed text-green-700">
          We&apos;ve received your message and sent a confirmation to your email. We&apos;ll get back to you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      {state.error && !state.fieldErrors && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Your name"
            disabled={isPending}
            aria-describedby={state.fieldErrors?.name ? "name-error" : undefined}
            className={state.fieldErrors?.name ? "border-red-400" : ""}
          />
          {state.fieldErrors?.name && (
            <p id="name-error" className="text-xs text-red-600">{state.fieldErrors.name}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            disabled={isPending}
            aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
            className={state.fieldErrors?.email ? "border-red-400" : ""}
          />
          {state.fieldErrors?.email && (
            <p id="email-error" className="text-xs text-red-600">{state.fieldErrors.email}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          name="subject"
          placeholder="What can we help with?"
          disabled={isPending}
          aria-describedby={state.fieldErrors?.subject ? "subject-error" : undefined}
          className={state.fieldErrors?.subject ? "border-red-400" : ""}
        />
        {state.fieldErrors?.subject && (
          <p id="subject-error" className="text-xs text-red-600">{state.fieldErrors.subject}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Tell us more..."
          disabled={isPending}
          aria-describedby={state.fieldErrors?.message ? "message-error" : undefined}
          className={state.fieldErrors?.message ? "border-red-400" : ""}
        />
        {state.fieldErrors?.message && (
          <p id="message-error" className="text-xs text-red-600">{state.fieldErrors.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#3D2DFF] hover:bg-[#3D2DFF]/90"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          "Send message"
        )}
      </Button>
    </form>
  );
}
