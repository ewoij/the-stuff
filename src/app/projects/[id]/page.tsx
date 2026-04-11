"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { NavBar } from "@/components/nav-bar";
import { KanbanBoard } from "@/components/kanban-board";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { TaskDetailDialog } from "@/components/task-detail-dialog";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/lib/hooks/use-tasks";
import { Plus, Archive } from "lucide-react";

export default function ProjectPage() {
  const params = useParams<{ id: string }>();
  const projectId = Number(params.id);
  const { tasks, loading, refresh, reorderTasks } = useTasks(projectId);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [archiving, setArchiving] = useState(false);

  async function handleStatusChange(taskId: number, status: string) {
    await fetch(`/api/tasks/${taskId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    refresh();
  }

  async function handleArchiveMerged() {
    setArchiving(true);
    try {
      await fetch(`/api/projects/${projectId}/tasks/archive-merged`, {
        method: "POST",
      });
      refresh();
    } finally {
      setArchiving(false);
    }
  }

  return (
    <>
      <NavBar />
      <main className="flex flex-col flex-1 px-4 py-6 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleArchiveMerged}
              disabled={archiving}
            >
              <Archive className="size-4 mr-2" />
              {archiving ? "Archiving…" : "Archive Merged"}
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <KanbanBoard
            tasks={tasks}
            onStatusChange={handleStatusChange}
            onTaskClick={(id) => setSelectedTaskId(id)}
            onReorder={reorderTasks}
          />
        )}

        <TaskFormDialog
          projectId={projectId}
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSaved={refresh}
        />

        <TaskDetailDialog
          taskId={selectedTaskId}
          open={selectedTaskId !== null}
          onOpenChange={(open) => {
            if (!open) setSelectedTaskId(null);
          }}
          onChanged={refresh}
        />
      </main>
    </>
  );
}
