"use client";

import { useActionState } from "react";
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
import { updatePassword } from "@/lib/auth/actions";
import type { ApiResponse } from "@/types";

export function UpdatePasswordForm() {
  const [state, action, isPending] = useActionState<
    ApiResponse<void> | null,
    FormData
  >(updatePassword, null);

  return (
    <Card className="border-[#0b1713]/10 bg-white shadow-[0_20px_60px_rgba(11,23,19,.08)]">
      <CardHeader className="space-y-1">
        <CardTitle className="text-3xl font-black tracking-[-0.04em] text-[#0b1713]">
          Set new password
        </CardTitle>
        <CardDescription>
          Choose a strong password for your account.
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
            <Label htmlFor="password">New password</Label>
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

        <CardFooter>
          <Button
            type="submit"
            className="w-full bg-[#0b1713] text-white hover:bg-[#1b3124]"
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update password
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
