import { requireAdmin } from "@/lib/auth/helpers";
import { getLessonsForCourse, getCourseWithDetails, getAllCategories } from "@/lib/admin/queries";
import { notFound } from "next/navigation";
import { LessonsClientPage } from "@/components/admin/lessons-client-page";

export default async function AdminLessonsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  await requireAdmin();
  const { courseId } = await params;

  const [course, lessons, categories] = await Promise.all([
    getCourseWithDetails(courseId),
    getLessonsForCourse(courseId),
    getAllCategories(),
  ]);

  if (!course) notFound();

  return <LessonsClientPage course={course} lessons={lessons} categories={categories} />;
}
