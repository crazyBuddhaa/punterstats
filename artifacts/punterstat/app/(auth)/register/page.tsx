import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Create Account" };

interface Props {
  searchParams: Promise<{ message?: string }>;
}

export default async function RegisterPage({ searchParams }: Props) {
  const params = await searchParams;
  return <RegisterForm checkEmail={params.message === "check-email"} />;
}
