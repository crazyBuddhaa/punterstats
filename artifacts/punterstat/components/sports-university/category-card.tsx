import type { ComponentType } from "react";
import Link from "next/link";
import {
  Trophy, BookOpen, Zap, Target, BarChart2, Shield,
  Activity, Globe, Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CourseCategory } from "@/types";

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  trophy: Trophy,
  book: BookOpen,
  zap: Zap,
  target: Target,
  chart: BarChart2,
  shield: Shield,
  activity: Activity,
  globe: Globe,
  layers: Layers,
};

interface Props {
  category: CourseCategory;
  courseCount: number;
}

export function CategoryCard({ category, courseCount }: Props) {
  const Icon = (category.iconName && ICON_MAP[category.iconName]) ?? BookOpen;

  return (
    <Link href={`/sports-university/${category.slug}`} className="group block">
      <Card className="h-full border-border/50 transition-all duration-200 hover:border-[#3D2DFF]/40 hover:shadow-md hover:-translate-y-0.5">
        <CardHeader className="pb-3">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#3D2DFF]/10 text-[#3D2DFF] transition-colors group-hover:bg-[#3D2DFF]/15">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-[#0f172a] leading-snug group-hover:text-[#3D2DFF] transition-colors">
            {category.name}
          </h3>
        </CardHeader>
        <CardContent className="pt-0">
          {category.description && (
            <p className="mb-4 text-sm text-[#1e293b]/60 leading-relaxed line-clamp-2">
              {category.description}
            </p>
          )}
          <Badge variant="secondary" className="text-xs font-normal">
            {courseCount} {courseCount === 1 ? "course" : "courses"}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}
