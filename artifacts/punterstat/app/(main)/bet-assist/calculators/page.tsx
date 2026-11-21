import { redirect } from "next/navigation";

export default function CalculatorsRedirectPage() {
  redirect("/bet-assist/slip-checker?tab=cashout");
}
