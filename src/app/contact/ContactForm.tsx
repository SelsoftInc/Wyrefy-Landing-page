"use client";

import { useState } from "react";
import { ChevronDown, Loader2, CheckCircle2 } from "lucide-react";

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");
    setErrorMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message.");
      }

      setStatus("success");
      form.reset();
    } catch (error: any) {
      console.error(error);
      setStatus("error");
      setErrorMessage(error.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status === "success") {
    return (
      <div className="relative z-10 rounded-[2.5rem] p-8 lg:p-10 bg-white border-2 border-green-200 shadow-xl flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]">
        <div className="size-20 rounded-full bg-green-50 flex items-center justify-center text-green-500">
          <CheckCircle2 size={40} />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h3>
          <p className="text-slate-600">
            Thank you for reaching out. We will get back to you shortly.
          </p>
        </div>
        <button
          onClick={() => setStatus("idle")}
          className="mt-4 rounded-full bg-slate-100 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200 transition-colors"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div className="relative z-10 rounded-[2.5rem] p-8 lg:p-10 bg-white border-2 border-slate-200 shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-indigo-200">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-bold text-slate-700 uppercase tracking-widest">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              aria-label="Full Name"
              placeholder="John Doe"
              className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-5 py-4 font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#6836E1] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#6836E1]/10 transition-all shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-bold text-slate-700 uppercase tracking-widest">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              aria-label="Email Address"
              placeholder="john@example.com"
              className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-5 py-4 font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#6836E1] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#6836E1]/10 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="subject" className="text-sm font-bold text-slate-700 uppercase tracking-widest">Subject</label>
          <div className="relative">
            <select
              id="subject"
              name="subject"
              aria-label="Subject"
              className="w-full appearance-none rounded-2xl border-2 border-slate-200 bg-slate-50 px-5 py-4 font-semibold text-slate-900 focus:border-[#6836E1] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#6836E1]/10 transition-all shadow-sm"
            >
              <option className="bg-white text-slate-900">General Inquiry</option>
              <option className="bg-white text-slate-900">Enterprise Sales</option>
              <option className="bg-white text-slate-900">Technical Support</option>
            </select>
            <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-bold text-slate-700 uppercase tracking-widest">Message</label>
          <textarea
            id="message"
            name="message"
            rows={4}
            required
            aria-label="Message"
            placeholder="How can we help you?"
            className="w-full resize-none rounded-2xl border-2 border-slate-200 bg-slate-50 px-5 py-4 font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#6836E1] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#6836E1]/10 transition-all shadow-sm"
          ></textarea>
        </div>

        {status === "error" && (
          <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-semibold border border-red-200">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-6 flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-5 text-sm uppercase tracking-widest font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-[#6836E1] hover:shadow-[0_20px_40px_rgba(104,54,225,0.25)] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Sending...
            </>
          ) : (
            "Send Message"
          )}
        </button>
      </form>
    </div>
  );
}
