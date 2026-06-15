"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Megaphone, Send } from "lucide-react";
import {  useState } from "react";

import { Button } from "@/src/components/ui/button";
import { SelectField, TextareaField, TextField } from "@/src/components/ui/form-field";
import { announcements, createAnnouncement, deleteAnnouncement, replySupportTicket, supportTicket, supportTickets, updateSupportTicket } from "@/src/features/admin-ops/api";
import type { SupportTicket } from "@/src/features/admin-ops/types";
import { formString } from "@/src/shared/form-data";

export function AdminNotificationsOps() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <SupportInbox />
        <AnnouncementManager />
      </div>
    </div>
  );
}

function SupportInbox() {
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const queryClient = useQueryClient();
  const tickets = useQuery({ queryKey: ["support-tickets"], queryFn: supportTickets });
  const detail = useQuery({ queryKey: ["support-ticket", selected?.id], queryFn: () => supportTicket(selected!.id), enabled: Boolean(selected) });
  const update = useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => updateSupportTicket(id, { status }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["support-tickets"] }) });
  const reply = useMutation({ mutationFn: ({ id, body }: { id: string; body: string }) => replySupportTicket(id, { body, visibility: "public" }), onSuccess: () => selected && queryClient.invalidateQueries({ queryKey: ["support-ticket", selected.id] }) });

  function onReply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const body = formString(new FormData(form), "body");
    if (selected) reply.mutate({ id: selected.id, body });
    form.reset();
  }

  return (
    <section className="glass-card flex h-full flex-col rounded-[2rem] p-8">
      <div className="shrink-0">
        <h2 className="text-2xl font-semibold tracking-tight">Support inbox</h2>
        <p className="mt-1 text-sm font-medium text-[var(--muted)]">Manage and resolve incoming platform requests.</p>
      </div>
      
      <div className="mt-8 flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
        {(tickets.data ?? []).map((ticket) => (
          <button 
            type="button"
            key={ticket.id} 
            onClick={() => setSelected(ticket)} 
            className={`w-full rounded-2xl border p-4 text-left transition-all duration-300 ${
              selected?.id === ticket.id 
                ? "border-[var(--accent)] bg-[var(--accent)]/5 shadow-sm" 
                : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/50"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-sm">{ticket.subject}</p>
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                ticket.status === "open" ? "bg-green-500/10 text-green-500" : "bg-[var(--muted)]/10 text-[var(--muted)]"
              }`}>
                {ticket.status}
              </span>
            </div>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Priority: {ticket.priority}</p>
          </button>
        ))}
        {tickets.data?.length === 0 && <p className="text-sm font-medium text-[var(--muted)] py-4">No active tickets.</p>}
      </div>

      {selected && (
        <div className="mt-8 shrink-0 space-y-6 rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] p-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold tracking-tight">{detail.data?.subject ?? selected.subject}</h3>
            <Button variant="secondary" onClick={() => update.mutate({ id: selected.id, status: "closed" })} className="h-9 text-xs">Close Ticket</Button>
          </div>
          
          <div className="max-h-48 space-y-3 overflow-y-auto pr-1">
            {(detail.data?.messages ?? []).map((msg) => (
              <div key={msg.id} className="rounded-xl border border-[var(--border)]/50 bg-[var(--background)] p-4 text-sm font-medium leading-relaxed">
                {msg.body}
              </div>
            ))}
            {detail.isLoading && <p className="text-xs font-medium text-[var(--muted)] animate-pulse">Loading messages…</p>}
          </div>

          <form onSubmit={onReply} className="pt-4 border-t border-[var(--border)]/50">
            <TextareaField label="Quick reply" name="body" placeholder="Type your response here..." required className="mb-4" />
            <Button type="submit" loading={reply.isPending} icon={<Send size={16} />} className="w-full h-11">Send Reply</Button>
          </form>
        </div>
      )}
    </section>
  );
}

function AnnouncementManager() {
  const queryClient = useQueryClient();
  const rows = useQuery({ queryKey: ["announcements"], queryFn: announcements });
  const create = useMutation({ mutationFn: createAnnouncement, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["announcements"] }) });
  const archive = useMutation({ mutationFn: deleteAnnouncement, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["announcements"] }) });
  const [preview, setPreview] = useState({ title: "", body: "", audience_type: "all" });

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    create.mutate({
      title: formString(data, "title"),
      body: formString(data, "body"),
      status: "published",
      audience_type: formString(data, "audience_type", "all"),
      audience_json: {},
      publish_at: null,
      confirmation: "PUBLISH",
    });
    event.currentTarget.reset();
  }

  return (
    <section className="glass-card flex h-full flex-col rounded-[2rem] p-8">
      <div className="shrink-0 flex items-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20">
          <Megaphone size={24} strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Announcement center</h2>
          <p className="text-sm font-medium text-[var(--muted)]">Broadcast updates to your users.</p>
        </div>
      </div>

      <div className="mt-8 flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
        <form 
          onSubmit={onSubmit} 
          onChange={(event) => {
            const data = new FormData(event.currentTarget as HTMLFormElement);
            setPreview({
              title: formString(data, "title"),
              body: formString(data, "body"),
              audience_type: formString(data, "audience_type", "all")
            });
          }} 
          className="space-y-5"
        >
          <TextField label="Headline" name="title" placeholder="What's new?" required />
          <TextareaField label="Message content" name="body" placeholder="Provide more details about this update..." required rows={4} />
          <SelectField label="Target Audience" name="audience_type">
            <option value="all">Everyone</option>
            <option value="individual">Individual Users</option>
            <option value="organization">Organization Users</option>
            <option value="platform_admin">Platform Admins</option>
          </SelectField>
          <Button type="submit" loading={create.isPending} className="w-full h-12 !text-base">Broadcast Now</Button>
        </form>

        {/* Preview Section */}
        <div className="rounded-[1.5rem] border-2 border-dashed border-[var(--border)] p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Live Preview · Targeting {preview.audience_type}</p>
          <div className="mt-4">
            <h3 className="text-xl font-semibold tracking-tight">{preview.title || "Announcement headline"}</h3>
            <p className="mt-3 text-sm font-medium leading-relaxed text-[var(--muted)]">{preview.body || "Your message content will appear here..."}</p>
          </div>
        </div>

        {/* History List */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] px-1">Recent broadcasts</p>
          {(rows.data ?? []).map((row) => (
            <div key={row.id} className="group flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-all hover:border-[var(--accent)]/50">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{row.title}</p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[var(--muted)]">{row.status} · {row.audience_type}</p>
              </div>
              <button 
                type="button"
                onClick={() => archive.mutate(row.id)} 
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500/10"
              >
                Archive
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
