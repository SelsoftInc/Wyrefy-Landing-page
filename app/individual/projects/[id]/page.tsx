"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { projectDetail } from "@/src/features/auth/api";
import { queryKeys } from "@/src/features/query-keys";
import { AgentView } from "@/src/components/project/project-agent-view";
import { Loader2 } from "lucide-react";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { push } = useRouter();
  
  const { data: project, isLoading, error } = useQuery({
    queryKey: queryKeys.projectDetail(id as string),
    queryFn: () => projectDetail(id as string),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="size-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex h-[calc(100vh-10rem)] flex-col items-center justify-center gap-4">
        <p className="text-xl font-semibold opacity-50">Project not found</p>
        <button type="button" onClick={() => push("/individual/projects")} className="text-blue-500 hover:underline">Back to Library</button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full">
      <AgentView project={project} onBack={() => push("/individual/projects")} />
    </div>
  );
}
