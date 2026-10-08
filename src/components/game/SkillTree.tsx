"use client";

import { useAppStore } from "@/lib/store";
import { getAllCourses, getCourseProgress } from "@/lib/modules";
import Link from "next/link";
import type { Course } from "@/types";

function CourseNode({
  course,
  index,
  isUnlocked,
  isCompleted,
  progress,
}: {
  course: Course;
  index: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  progress: { completed: number; total: number; percentage: number };
}) {
  return (
    <div className="relative">
      {index > 0 && (
        <div className="absolute left-1/2 -top-8 w-px h-8 bg-border" />
      )}

      <Link
        href={isUnlocked ? `/courses/${course.id}` : "#"}
        className={`block w-full max-w-xs mx-auto p-4 rounded-xl border transition-all duration-300 ${
          isCompleted
            ? "border-neon bg-neon/5 glow-neon"
            : isUnlocked
            ? "border-border bg-surface hover:border-neon/50 hover:bg-surface-alt"
            : "border-border/50 bg-surface/50 opacity-50 cursor-not-allowed"
        }`}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
            style={{
              backgroundColor: `${course.color}20`,
              color: course.color,
              border: `1px solid ${course.color}40`,
            }}
          >
            {isCompleted ? "✓" : course.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold truncate">{course.title}</h3>
            <span
              className="text-xs font-mono uppercase"
              style={{ color: course.color }}
            >
              {course.technology}
            </span>
          </div>
        </div>

        <p className="text-xs text-zinc-400 mb-3 line-clamp-2">
          {course.description}
        </p>

        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500">
            {progress.completed}/{progress.total} retos
          </span>
          <span className="font-mono" style={{ color: course.color }}>
            {progress.percentage}%
          </span>
        </div>

        <div className="mt-2 h-1.5 bg-surface-alt rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progress.percentage}%`,
              backgroundColor: course.color,
            }}
          />
        </div>
      </Link>
    </div>
  );
}

export function SkillTree() {
  const user = useAppStore((s) => s.user);
  const courses = getAllCourses();

  if (!user) return null;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col items-center gap-8">
        {courses.map((course, index) => {
          const progress = getCourseProgress(course, user.completedChallenges);
          const isCompleted = progress.percentage === 100;

          const isUnlocked =
            index === 0 ||
            courses.slice(0, index).every((prevCourse) => {
              const prevProgress = getCourseProgress(prevCourse, user.completedChallenges);
              return prevProgress.percentage > 0;
            });

          return (
            <CourseNode
              key={course.id}
              course={course}
              index={index}
              isUnlocked={isUnlocked}
              isCompleted={isCompleted}
              progress={progress}
            />
          );
        })}
      </div>
    </div>
  );
}