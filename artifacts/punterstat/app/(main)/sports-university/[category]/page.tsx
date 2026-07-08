import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, BookOpen } from "lucide-react";
import { CourseCard } from "@/components/sports-university/course-card";
import {
  getCategoryBySlug,
  getCoursesByCategory,
  getLessonCount,
} from "@/lib/sports-university/queries";
import { getUser } from "@/lib/auth/helpers";

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Not Found" };
  return {
    title: category.name,
    description: category.description ?? undefined,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params;
  const [category, user] = await Promise.all([getCategoryBySlug(slug), getUser()]);
  if (!category) notFound();

  const courses = await getCoursesByCategory(category.id);

  const coursesWithMeta = await Promise.all(
    courses.map(async (course) => ({
      course,
      lessonCount: await getLessonCount(course.id),
    }))
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <section className="bg-[#0f172a] px-4 py-12">
        <div className="container mx-auto max-w-6xl">
          <nav className="mb-4 flex items-center gap-1.5 text-xs text-white/40">
            <Link href="/sports-university" className="hover:text-white/70 transition-colors">
              Sports University
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/70">{category.name}</span>
          </nav>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">{category.name}</h1>
          {category.description && (
            <p className="mt-2 text-sm text-white/60 max-w-xl leading-relaxed">
              {category.description}
            </p>
          )}
          <p className="mt-3 text-xs text-white/30">
            {courses.length} {courses.length === 1 ? "course" : "courses"}
          </p>
        </div>
      </section>

      {/* Courses */}
      <section className="container mx-auto max-w-6xl px-4 py-10">
        {coursesWithMeta.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
            <BookOpen className="mb-4 h-12 w-12 text-[#1e293b]/20" />
            <h2 className="mb-2 text-lg font-semibold text-[#0f172a]">No courses yet</h2>
            <p className="text-sm text-[#1e293b]/50">Courses in this category are being prepared.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {coursesWithMeta.map(({ course, lessonCount }) => (
              <CourseCard
                key={course.id}
                course={course}
                categorySlug={slug}
                lessonCount={lessonCount}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
