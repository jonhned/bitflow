"use client";

import { Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { ProjectWorkspace } from "@/components/game/ProjectWorkspace";
import { getAllCourses } from "@/lib/modules";
import Link from "next/link";

export default function ProjectPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-neon animate-pulse">Cargando proyecto...</div>
        </div>
      }
    >
      <ProjectPage />
    </Suspense>
  );
}

function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  const router = useRouter();

  const courses = getAllCourses();
  let project = null;
  let course = null;

  for (const c of courses) {
    if (c.finalProject.id === projectId) {
      project = c.finalProject;
      course = c;
      break;
    }
  }

  if (!project || !course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-56px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Proyecto no encontrado</h1>
            <Link href="/courses" className="text-neon hover:underline">
              Ver cursos disponibles
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <ProjectWorkspace project={project} course={course} />
    </div>
  );
}