"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
  Bot,
} from "lucide-react";
import type { ProjectWithStats } from "@/lib/types";

const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-emerald-600",
  "bg-violet-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-cyan-600",
  "bg-indigo-600",
  "bg-pink-600",
  "bg-teal-600",
  "bg-orange-600",
];

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

interface ProjectCardProps {
  project: ProjectWithStats;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const initials = getInitials(project.name);
  const avatarColor = getAvatarColor(project.name);
  const totalTasks = project.taskCounts.total;

  return (
    <Link href={`/projects/${project.id}`} className="group">
      <Card className="h-full transition-all duration-200 hover:ring-foreground/20 hover:shadow-md">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div
              className={`${avatarColor} flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white`}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="truncate">{project.name}</CardTitle>
              {project.content && (
                <CardDescription className="mt-0.5 line-clamp-2">
                  {project.content}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {totalTasks === 0 && project.activeAgents === 0 ? (
              <span>No tasks yet</span>
            ) : (
              <>
                {project.taskCounts.todo > 0 && (
                  <span className="flex items-center gap-1">
                    <Circle className="size-3" />
                    {project.taskCounts.todo} to do
                  </span>
                )}
                {project.taskCounts.inProgress > 0 && (
                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <Loader2 className="size-3" />
                    {project.taskCounts.inProgress} in progress
                  </span>
                )}
                {project.taskCounts.done > 0 && (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-3" />
                    {project.taskCounts.done} done
                  </span>
                )}
              </>
            )}
          </div>
        </CardContent>

        <CardFooter className="text-xs text-muted-foreground">
          <div className="flex w-full items-center justify-between">
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {formatRelativeTime(project.lastActivity)}
            </span>
            {project.activeAgents > 0 && (
              <span className="flex items-center gap-1 text-violet-600 dark:text-violet-400">
                <Bot className="size-3" />
                {project.activeAgents} agent{project.activeAgents !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
