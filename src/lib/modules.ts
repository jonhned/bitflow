import modulesData from "@/content/modules.json";
import type { Course, CourseModule, Challenge, Skin } from "@/types";

export function getAllCourses(): Course[] {
  return modulesData.courses as Course[];
}

export function getCourseById(id: string): Course | undefined {
  return getAllCourses().find((c) => c.id === id);
}

export function getModuleById(courseId: string, moduleId: string): CourseModule | undefined {
  const course = getCourseById(courseId);
  return course?.modules.find((m) => m.id === moduleId);
}

export function getSkins(): Skin[] {
  return (modulesData as Record<string, unknown>).skins as Skin[] || [];
}

export function getChallengeById(challengeId: string): {
  challenge: Challenge;
  course: Course;
  module: CourseModule;
} | null {
  for (const course of getAllCourses()) {
    for (const mod of course.modules) {
      const challenge = mod.challenges.find((c) => c.id === challengeId);
      if (challenge) return { challenge, course, module: mod };
    }
  }
  return null;
}

export function getNextChallengeId(currentChallengeId: string): string | null {
  const allCourses = getAllCourses();
  for (const course of allCourses) {
    for (const mod of course.modules) {
      for (let i = 0; i < mod.challenges.length; i++) {
        if (mod.challenges[i].id === currentChallengeId && i + 1 < mod.challenges.length) {
          return mod.challenges[i + 1].id;
        }
      }
    }
  }
  return null;
}

export function getCourseProgress(course: Course, completedChallenges: string[]): {
  completed: number;
  total: number;
  percentage: number;
} {
  const allIds = course.modules.flatMap((m) => m.challenges.map((c) => c.id));
  const completed = allIds.filter((id) => completedChallenges.includes(id)).length;
  return {
    completed,
    total: allIds.length,
    percentage: allIds.length > 0 ? Math.round((completed / allIds.length) * 100) : 0,
  };
}