"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
        <CardHeader>
          <CardTitle>{project.name}</CardTitle>
          {project.content && (
            <CardDescription className="line-clamp-2">
              {project.content}
            </CardDescription>
          )}
        </CardHeader>
      </Card>
    </Link>
  );
}
