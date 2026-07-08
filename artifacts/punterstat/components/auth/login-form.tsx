"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
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
import { signIn } from "@/lib/auth/actions";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import type { ApiResponse } from "@/types";

interface Props {
  redirectTo?: string;
  serverError?: string;
}

export function LoginForm({ redirectTo: _redirectTo, serverError }: Props) {
  const [state, action, isPending] = useActionState<
    ApiResponse<void> | null,
    FormData
  >(signIn, null);

  const errorMessage =
    (state && !state.success && state.error) ||
    (serverError ? "Authentication error. Please try again." : null);

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-[#0f172a]">
          Welcome back
        </CardTitle>
        <CardDescription>
          Sign in to continue your learning journey
        </CardDescription>
      </CardHeader>

      <form action={action}>
        <CardContent className="space-y-4">
          {errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
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

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-[#3D2DFF] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign in
          </Button>

          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-[#1e293b]/40">or</span>
            </div>
          </div>

          <GoogleSignInButton />

          <p className="text-center text-sm text-[#1e293b]/60">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-[#3D2DFF] hover:underline"
            >
              Create one free
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
