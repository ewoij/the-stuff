"use client";

import { useState } from "react";
import { NavBar } from "@/components/nav-bar";
import { ProjectCard } from "@/components/project-card";
import { ProjectFormDialog } from "@/components/project-form-dialog";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/lib/hooks/use-projects";
import { Plus, FolderKanban } from "lucide-react";

function ProjectCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-card py-4 ring-1 ring-foreground/10 animate-pulse">
      <div className="px-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 rounded bg-muted" />
            <div className="h-3 w-full rounded bg-muted" />
          </div>
        </div>
      </div>
      <div className="px-4">
        <div className="flex gap-3">
          <div className="h-3 w-16 rounded bg-muted" />
          <div className="h-3 w-20 rounded bg-muted" />
        </div>
      </div>
      <div className="flex items-center border-t bg-muted/50 p-4">
        <div className="h-3 w-14 rounded bg-muted" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const { projects, loading, refresh } = useProjects();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold">Projects</h1>
            {!loading && projects.length > 0 && (
              <p className="mt-1 text-sm text-muted-foreground">
                {projects.length} project{projects.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="size-4 mr-2" />
            New Project
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 px-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
              <FolderKanban className="size-7 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-medium mb-1">No projects yet</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Create your first project to start organizing tasks and tracking
              progress.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="size-4 mr-2" />
              Create Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} onDeleted={refresh} />
            ))}
          </div>
        )}

        <ProjectFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSaved={refresh}
        />
      </main>
    </>
  );
}
