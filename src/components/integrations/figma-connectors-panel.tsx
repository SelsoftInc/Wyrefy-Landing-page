"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { FigmaIcon, GithubIcon, VercelIcon, AwsIcon } from "@/src/components/ui/brand-icons";

import { Button } from "@/src/components/ui/button";
import { useToast } from "@/src/components/ui/toast";
import { queryKeys } from "@/src/features/query-keys";
import { useAuthStore } from "@/src/features/auth/store";
import { figmaConnections, startFigmaOAuth } from "@/src/features/runtime/api";

export function FigmaConnectorsPanel() {
  const { showToast } = useToast();
  const userId = useAuthStore((state) => state.user?.id);
  const connections = useQuery({ queryKey: queryKeys.figmaConnections(userId ?? ""), queryFn: figmaConnections, enabled: Boolean(userId) });
  const connect = useMutation({
    mutationFn: () => startFigmaOAuth(),
    onSuccess: (result) => {
      globalThis.location.href = result.auth_url;
    },
    onError: (error) => showToast(error instanceof Error ? error.message : "Unable to start Figma OAuth.", "error"),
  });
  const active = connections.data?.find((item) => item.status === "connected");

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16 animate-page-enter">
      <style>{`
        @keyframes logo-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>

      {/* Page Title & Context */}
      <div className="space-y-2">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
          Integration <span className="text-blue-500">Hub</span>
        </h2>
        <p className="text-sm font-medium text-[var(--muted)] max-w-2xl leading-relaxed">
          Connect your design and deployment tools to power Wyrefy workflows. Each user connects their own account for private import access.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Primary Integration - Figma */}
        <section className="glass-panel relative overflow-hidden rounded-[2.5rem] p-8 shadow-2xl transition-all duration-500 hover:shadow-[0_0_50px_rgba(59,130,246,0.15)] hover:border-blue-500/30 group flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="relative z-10 flex flex-col h-full justify-between gap-10">
            <div className="flex flex-col sm:flex-row items-start gap-8">
              <div className="flex size-20 shrink-0 items-center justify-center rounded-[1.75rem] bg-[#F24E1E]/10 relative transition-transform duration-500 group-hover:scale-105">
                <FigmaIcon className="h-10 w-auto" />
                <div className="absolute inset-0 rounded-[1.75rem] bg-blue-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">Figma</h2>
                  <ConnectionBadge loading={connections.isLoading} connected={Boolean(active)} />
                </div>
                
                <p className="text-sm font-medium leading-relaxed text-[var(--muted)] max-w-sm">
                  Connect your Figma account so Wyrefy can import project designs before the agent starts. 
                  Imports run as deterministic project revisions.
                </p>

                <div className="grid gap-x-6 gap-y-3 pt-3">
                  <BenefitItem text="Import selected files" />
                  <BenefitItem text="Sync design revisions" />
                  <BenefitItem text="Agent-ready context" />
                </div>

                {active && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 w-fit">
                    <div className="size-1.5 rounded-full bg-blue-400" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                      Connected as {active.figma_handle || active.figma_email || active.figma_user_id}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => connect.mutate()}
                loading={connect.isPending}
                className="!rounded-2xl h-14 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/20 px-8 text-white font-medium uppercase tracking-widest text-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-blue-500/35 hover:from-blue-500 hover:to-indigo-500 active:translate-y-0"
              >
                {active ? "Reconnect Account" : "Connect Figma"}
              </Button>
              <Button variant="secondary" className={`!rounded-2xl h-14 font-medium uppercase tracking-widest text-[10px] transition-all duration-300 ${active ? "opacity-30 blur-[4px] pointer-events-none" : ""}`} disabled>
                {!active && "Configure Later"}
              </Button>
            </div>
          </div>
        </section>

        {/* Upcoming Integrations */}
        <div className="glass-panel rounded-[2rem] p-8 border border-[var(--border)] relative overflow-hidden transition-all duration-500 bg-[var(--surface)]/30 group flex flex-col justify-between hover:shadow-[0_0_50px_rgba(59,130,246,0.15)] hover:border-blue-500/30">
          <div>
            <div className="absolute top-8 right-8">
              <span className="bg-[var(--surface)] text-[var(--muted)] text-[8px] font-medium px-3 py-1 rounded-md border border-[var(--border)] uppercase tracking-widest shadow-sm">Coming Soon</span>
            </div>
            
            <div className="flex items-center mb-6 pt-2">
              <div className="z-30 animate-[logo-float_4s_ease-in-out_infinite]">
                <div className="flex size-14 items-center justify-center rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-sm group-hover:-translate-y-2 group-hover:rotate-[-8deg] transition-all duration-500">
                  <GithubIcon className="size-7" />
                </div>
              </div>
              <div className="z-20 -ml-4 animate-[logo-float_4s_ease-in-out_infinite_0.8s]">
                <div className="flex size-14 items-center justify-center rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-sm group-hover:-translate-y-3 transition-all duration-500">
                  <VercelIcon className="size-7 text-black dark:text-white" />
                </div>
              </div>
              <div className="z-10 -ml-4 animate-[logo-float_4s_ease-in-out_infinite_1.6s]">
                <div className="flex size-14 items-center justify-center rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-sm group-hover:-translate-y-2 group-hover:rotate-[8deg] transition-all duration-500">
                  <AwsIcon className="h-6 w-auto opacity-90" />
                </div>
              </div>
            </div>
            
            <h3 className="text-2xl font-semibold text-[var(--foreground)]/90 tracking-tight">Ecosystem Integrations</h3>
            <p className="text-sm font-medium text-[var(--muted)] mt-2 leading-relaxed max-w-md">
              We are actively building native integrations with GitHub, Vercel, AWS, and other vital platforms. Repository sync, hosted previews, and operational controls are coming in later-phase delivery workflows.
            </p>
          </div>
          
          <div className="mt-8 flex items-center gap-2 text-[10px] font-bold text-[var(--muted)]/60 uppercase tracking-widest">
            <Sparkles size={14} />
            In Development
          </div>
        </div>
      </div>
    </div>
  );
}

function BenefitItem({ text }: Readonly<{ text: string }>) {
  return (
    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
      <CheckCircle2 size={12} className="text-emerald-500" />
      {text}
    </div>
  );
}

function ConnectionBadge({ loading, connected }: Readonly<{ loading: boolean; connected: boolean }>) {
  if (loading) {
    return (
      <span className="bg-blue-500/10 text-blue-400 text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest border border-blue-500/20 flex items-center gap-1.5 shadow-sm">
        <Loader2 size={10} className="animate-spin" /> Checking
      </span>
    );
  }
  return (
    <span className={`${connected ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"} text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest border shadow-sm`}>
      {connected ? "Connected" : "Not Connected"}
    </span>
  );
}

