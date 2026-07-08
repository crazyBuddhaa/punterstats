import Link from "next/link";
import {
  Trophy, BookOpen, Zap, Target, BarChart2, Shield,
  Activity, Globe, Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CourseCategory } from "@/types";

function TopicIcon({ name }: { name: string | null }) {
  const cls = "h-5 w-5";
  if (name === "trophy")   return <Trophy    className={cls} />;
  if (name === "zap")      return <Zap       className={cls} />;
  if (name === "target")   return <Target    className={cls} />;
  if (name === "chart")    return <BarChart2  className={cls} />;
  if (name === "shield")   return <Shield    className={cls} />;
  if (name === "activity") return <Activity  className={cls} />;
  if (name === "globe")    return <Globe     className={cls} />;
  if (name === "layers")   return <Layers    className={cls} />;
  return <BookOpen className={cls} />;
}

interface Props {
  topic: CourseCategory;
  moduleCount: number;
}

export function TopicCard({ topic, moduleCount }: Props) {
  return (
    <Link href={`/betting-academy/${topic.slug}`} className="group block">
      <Card className="h-full border-border/50 transition-all duration-200 hover:border-emerald-500/40 hover:shadow-md hover:-translate-y-0.5">
        <CardHeader className="pb-3">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 transition-colors group-hover:bg-emerald-500/15">
            <TopicIcon name={topic.iconName} />
          </div>
          <h3 className="font-semibold text-[#0f172a] leading-snug group-hover:text-emerald-600 transition-colors">
            {topic.name}
          </h3>
        </CardHeader>
        <CardContent className="pt-0">
          {topic.description && (
            <p className="mb-4 text-sm text-[#1e293b]/60 leading-relaxed line-clamp-2">
              {topic.description}
            </p>
          )}
          <Badge variant="secondary" className="text-xs font-normal">
            {moduleCount} {moduleCount === 1 ? "module" : "modules"}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}
