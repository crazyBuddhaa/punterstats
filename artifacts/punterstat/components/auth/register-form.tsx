"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2 } from "lucide-react";
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
import { signUp } from "@/lib/auth/actions";
import type { ApiResponse } from "@/types";

interface Props {
  checkEmail?: boolean;
}

export function RegisterForm({ checkEmail }: Props) {
  const [state, action, isPending] = useActionState<
    ApiResponse<void> | null,
    FormData
  >(signUp, null);

  if (checkEmail) {
    return (
      <Card className="border-border/50 shadow-sm text-center">
        <CardHeader className="space-y-3 pb-4">
          <div className="flex justify-center">
            <CheckCircle2 className="h-12 w-12 text-[#3D2DFF]" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#0f172a]">
            Check your email
          </CardTitle>
          <CardDescription>
            We sent a confirmation link to your email address. Click it to
            activate your account.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link href="/login" className="text-sm text-[#3D2DFF] hover:underline">
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-[#0f172a]">
          Create your account
        </CardTitle>
        <CardDescription>
          Free forever. No credit card required.
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
            <Label htmlFor="displayName">Full name</Label>
            <Input
              id="displayName"
              name="displayName"
              type="text"
              placeholder="Alex Johnson"
              autoComplete="name"
              required
            />
          </div>

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

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create free account
          </Button>
          <p className="text-center text-xs text-[#1e293b]/50 leading-relaxed px-2">
            By creating an account you agree to our{" "}
            <Link href="/terms" className="text-[#3D2DFF] hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-[#3D2DFF] hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
          <p className="text-center text-sm text-[#1e293b]/60">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-[#3D2DFF] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
