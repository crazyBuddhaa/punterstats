import { requireAdmin } from "@/lib/auth/helpers";
import { getAllCourses, getAllCategories } from "@/lib/admin/queries";
import { CoursesClientPage } from "@/components/admin/courses-client-page";

export default async function AdminCoursesPage() {
  await requireAdmin();
  const [courses, categories] = await Promise.all([getAllCourses(), getAllCategories()]);

  return <CoursesClientPage courses={courses} categories={categories} />;
}
