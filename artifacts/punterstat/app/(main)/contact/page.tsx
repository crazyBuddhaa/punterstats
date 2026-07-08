import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageSquare, Clock, HelpCircle } from "lucide-react";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the PunterStat team. We typically respond within 24 hours.",
};

const contactInfo = [
  {
    icon: Mail,
    label: "General enquiries",
    value: "hello@punterstat.com",
    href: "mailto:hello@punterstat.com",
  },
  {
    icon: MessageSquare,
    label: "Support",
    value: "support@punterstat.com",
    href: "mailto:support@punterstat.com",
  },
  {
    icon: Clock,
    label: "Response time",
    value: "Within 24 hours",
    href: null,
  },
  {
    icon: HelpCircle,
    label: "Frequently asked questions",
    value: "Browse the FAQ →",
    href: "/faq",
  },
];

export default function ContactPage() {
  return (
    <PageShell>
      <PageHeader
        title="Get in touch"
        description="We typically respond within 24 hours on business days."
      />

      <div className="mx-auto max-w-5xl pb-20">
        <div className="grid gap-12 lg:grid-cols-5">
          {/* Form */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-border/50 bg-white p-6 sm:p-8">
              <h2 className="mb-1.5 text-base font-semibold text-[#0f172a]">
                Send us a message
              </h2>
              <p className="mb-6 text-sm text-[#475569]">
                Use the form below for general enquiries, support questions, or
                partnership requests.
              </p>
              <ContactForm />
            </div>
          </div>

          {/* Side info */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {contactInfo.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-border/50 bg-white p-5"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#3D2DFF]/8 text-[#3D2DFF]">
                      <item.icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#1e293b]/50">
                      {item.label}
                    </span>
                  </div>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="text-sm font-medium text-[#0f172a] hover:text-[#3D2DFF] transition-colors"
                    >
                      {item.value}
                    </Link>
                  ) : (
                    <p className="text-sm font-medium text-[#0f172a]">
                      {item.value}
                    </p>
                  )}
                </div>
              ))}

              {/* Legal notice */}
              <div className="rounded-xl border border-border/50 bg-[#f8fafc] p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#1e293b]/40 mb-2">
                  Legal
                </p>
                <p className="text-xs leading-relaxed text-[#475569]">
                  PunterStat is an educational platform. We do not provide
                  betting advice, process transactions, or facilitate gambling.
                  For legal matters:{" "}
                  <Link
                    href="mailto:legal@punterstat.com"
                    className="text-[#3D2DFF]"
                  >
                    legal@punterstat.com
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
