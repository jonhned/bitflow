"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useAppStore } from "@/lib/store";
import { getAllCourses, getCourseProgress } from "@/lib/modules";
import Link from "next/link";

export default function CoursesPage() {
  const user = useAppStore((s) => s.user);
  const courses = getAllCourses();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Cursos Disponibles</h1>
          <p className="text-sm text-zinc-400">
            Aprende desarrollo web completo con proyectos prácticos
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {courses.map((course) => {
            const progress = user
              ? getCourseProgress(course, user.completedChallenges)
              : { completed: 0, total: 0, percentage: 0 };

            return (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group p-5 bg-surface rounded-xl border border-border hover:border-neon/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{
                      backgroundColor: `${course.color}15`,
                      border: `1px solid ${course.color}30`,
                    }}
                  >
                    {course.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-lg mb-1 group-hover:text-neon transition-colors">
                      {course.title}
                    </h2>
                    <p className="text-xs text-zinc-400 mb-3 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs px-2 py-0.5 rounded-full border" style={{ borderColor: `${course.color}40`, color: course.color }}>
                        {course.modules.length} módulos
                      </span>
                      <span className="text-xs text-zinc-500">
                        {progress.total} retos
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-surface-alt rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${progress.percentage}%`,
                            backgroundColor: course.color,
                          }}
                        />
                      </div>
                      <span className="text-xs font-mono" style={{ color: course.color }}>
                        {progress.percentage}%
                      </span>
                    </div>

                    <div className="mt-3 text-xs text-zinc-500">
                      Proyecto final: <span className="text-zinc-300">{course.finalProject.title}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}