"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { NavBar } from "@/components/nav-bar";
import { KanbanBoard } from "@/components/kanban-board";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { TaskDetailDialog } from "@/components/task-detail-dialog";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/lib/hooks/use-tasks";
import { useAgents } from "@/lib/hooks/use-agents";
import { Plus, Archive, Bot } from "lucide-react";

export default function ProjectPage() {
  const params = useParams<{ id: string }>();
  const projectId = Number(params.id);
  const [isDragging, setIsDragging] = useState(false);
  const { tasks, loading, refresh, reorderTask } = useTasks(projectId, isDragging);
  const { agents } = useAgents(projectId);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [archiving, setArchiving] = useState(false);

  async function handleStatusChange(
    taskId: number,
    status: string,
    previousTaskId: number | null,
    nextTaskId: number | null
  ) {
    await fetch(`/api/tasks/${taskId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, previousTaskId, nextTaskId }),
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

        {agents.length > 0 && (
          <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
            <Bot className="size-4" />
            <span>
              {agents.length} active agent{agents.length !== 1 ? "s" : ""}:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {agents.map((agent) => (
                <span
                  key={agent.id}
                  className="inline-flex items-center gap-1 rounded-md bg-muted/70 px-2 py-0.5 text-xs font-medium"
                  title={agent.currentTaskId ? `Working on task #${agent.currentTaskId}` : "Idle"}
                >
                  <span className={`size-1.5 rounded-full ${agent.currentTaskId ? "bg-amber-400" : "bg-emerald-400"}`} />
                  {agent.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <KanbanBoard
            tasks={tasks}
            onStatusChange={handleStatusChange}
            onTaskClick={(id) => setSelectedTaskId(id)}
            onReorder={reorderTask}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
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
