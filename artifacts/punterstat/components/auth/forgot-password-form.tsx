"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { resetPassword } from "@/lib/auth/actions";
import type { ApiResponse } from "@/types";

export function ForgotPasswordForm() {
  const [state, action, isPending] = useActionState<
    ApiResponse<void> | null,
    FormData
  >(resetPassword, null);

  if (state?.success) {
    return (
      <Card className="border-[#0b1713]/10 bg-white text-center shadow-[0_20px_60px_rgba(11,23,19,.08)]">
        <CardHeader className="space-y-3 pb-4">
          <div className="flex justify-center">
            <Mail className="h-12 w-12 text-[#ff7653]" />
          </div>
          <CardTitle className="text-3xl font-black tracking-[-0.04em] text-[#0b1713]">
            Check your inbox
          </CardTitle>
          <CardDescription>
            If an account exists for that email, you&apos;ll receive a password
            reset link shortly.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link href="/login" className="text-sm text-[#ff7653] hover:underline">
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-[#0b1713]/10 bg-white shadow-[0_20px_60px_rgba(11,23,19,.08)]">
      <CardHeader className="space-y-1">
        <CardTitle className="text-3xl font-black tracking-[-0.04em] text-[#0b1713]">
          Reset your password
        </CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a reset link.
        </CardDescription>
      </CardHeader>

      <form action={action}>
        <CardContent className="space-y-4">
          {state && !state.success && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full bg-[#0b1713] text-white hover:bg-[#1b3124]"
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send reset link
          </Button>
          <Link
            href="/login"
            className="text-center text-sm text-[#1e293b]/60 hover:text-[#ff7653]"
          >
            ← Back to sign in
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
