import { Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    quote:
      "I spent years watching football without really understanding why teams made the decisions they did. Sports University changed that — I can now explain pressing traps, defensive blocks, and transition play to anyone.",
    name: "Ademola F.",
    role: "Football coach, Lagos",
  },
  {
    quote:
      "The Betting Academy module finally made implied probability click for me. I'd heard the term a hundred times but never truly understood what it meant until I went through the odds chapter.",
    name: "Chike O.",
    role: "Sports analyst student",
  },
  {
    quote:
      "Running 200-bet simulations showed me exactly how variance works in practice. Seeing your bankroll chart over thousands of outcomes teaches you more than any article can.",
    name: "Tunde A.",
    role: "Data science graduate",
  },
  {
    quote:
      "The Match Breakdown Engine helped me structure my analysis workflow. I now approach every fixture with a six-factor checklist rather than gut feeling.",
    name: "Seun B.",
    role: "Fantasy football enthusiast",
  },
];

export function Testimonials() {
  return (
    <section className="bg-[#f8fafc] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#3D2DFF]">
            From our learners
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl">
            What people are learning
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {testimonials.map((t) => (
            <Card key={t.name} className="border-border/50 bg-white shadow-sm">
              <CardContent className="p-6">
                <Quote className="mb-4 h-6 w-6 text-[#3D2DFF]/30" />
                <p className="mb-5 text-sm leading-[1.8] text-[#1e293b]/70">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#3D2DFF]/10 text-xs font-bold text-[#3D2DFF]">
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0f172a]">{t.name}</p>
                    <p className="text-xs text-[#1e293b]/45">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
