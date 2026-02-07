import { createClient } from "@/lib/supabase/server";
import { CourseCard } from "@/components/learn/course-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Course } from "@/lib/types/courses";

export default async function LearnPage() {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("*, category:course_categories(*)")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const { data: categories } = await supabase
    .from("course_categories")
    .select("*")
    .order("display_order", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Learning Center</h1>
        <p className="text-muted-foreground">AI coursework designed for pet industry executives</p>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Courses</TabsTrigger>
          {categories?.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.slug}>{cat.name}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses?.map((course) => (
              <CourseCard key={course.id} course={course as unknown as Course} />
            ))}
            {(!courses || courses.length === 0) && (
              <p className="col-span-3 text-center py-8 text-muted-foreground">
                No courses available yet. Check back soon!
              </p>
            )}
          </div>
        </TabsContent>
        {categories?.map((cat) => (
          <TabsContent key={cat.id} value={cat.slug} className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses
                ?.filter((c) => c.category_id === cat.id)
                .map((course) => (
                  <CourseCard key={course.id} course={course as unknown as Course} />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
