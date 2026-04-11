"use client";

import { useState } from "react";
import { NavBar } from "@/components/nav-bar";
import { ProjectCard } from "@/components/project-card";
import { ProjectFormDialog } from "@/components/project-form-dialog";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/lib/hooks/use-projects";
import { Plus } from "lucide-react";

export default function HomePage() {
  const { projects, loading, refresh } = useProjects();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Projects</h1>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="size-4 mr-2" />
            New Project
          </Button>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : projects.length === 0 ? (
          <p className="text-muted-foreground">
            No projects yet. Create one to get started.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
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
