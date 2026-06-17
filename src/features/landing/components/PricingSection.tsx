"use client";

import { Check, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

interface Plan {
  name: string;
  slug: string;
  price: string;
  desc: string;
  features: string[];
  isFeatured?: boolean;
}

export function PricingSection({ onSelectPlan }: { onSelectPlan: (slug: string) => void }) {
  const plans: Plan[] = [
    {
      name: "Starter",
      slug: "starter",
      price: "$0",
      desc: "For individuals starting with Figma-assisted project generation.",
      features: [
        "Up to 1 active project",
        "0.5 included credits monthly",
        "Live frontend preview access",
        "Isolated development sandbox"
      ]
    },
    {
      name: "Pro",
      slug: "pro",
      price: "$29",
      desc: "For teams building more projects with larger credit pools.",
      isFeatured: true,
      features: [
        "Up to 5 active projects",
        "100 included credits monthly",
        "Live frontend preview access",
        "Organization-ready workspace",
        "Shared folder structures"
      ]
    },
    {
      name: "Enterprise",
      slug: "enterprise",
      price: "Custom",
      desc: "For organizations that need custom limits, support, and billing.",
      features: [
        "Unlimited projects workspace",
        "Custom credit allocation",
        "Live frontend preview access",
        "Organization-ready workspace",
        "Custom support & billing terms"
      ]
    }
  ];

  return (
    <section className="w-full px-6 py-20 bg-white text-slate-800 min-h-screen flex flex-col justify-center" id="pricing">
      <div className="w-full max-w-[1400px] mx-auto">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-[#6836E1] text-[10px] font-black uppercase tracking-widest mb-4">
            <ShieldCheck size={12} />
            <span>Pricing plans</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight mb-4">
            Choose your plan
          </h2>
          <p className="text-sm md:text-base font-semibold text-slate-500">
            Flexible pricing options to scale your AI development workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1200px] mx-auto items-stretch">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30, scale: plan.isFeatured ? 1.03 : 1 }}
              whileInView={{ opacity: 1, y: 0, scale: plan.isFeatured ? 1.03 : 1 }}
              whileHover={{ 
                y: -10, 
                scale: plan.isFeatured ? 1.05 : 1.02, 
                transition: { duration: 0.2, ease: "easeOut" } 
              }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className={`group rounded-[2.5rem] p-8 flex flex-col justify-between relative overflow-hidden border-2 transition-colors duration-300 ${
                plan.isFeatured 
                  ? "bg-[#1E1B2E] text-white border-white/10 shadow-2xl hover:shadow-[0_20px_60px_rgba(104,54,225,0.25)] hover:border-indigo-500/50" 
                  : "bg-slate-50 text-slate-800 border-slate-300 shadow-lg hover:border-indigo-300 hover:bg-white hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
              }`}
            >
              {/* Optional Subtle Glow Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-transparent to-indigo-500/0 transition-opacity duration-500 opacity-0 group-hover:opacity-100 ${plan.isFeatured ? 'from-indigo-500/10' : 'from-indigo-500/5'}`} />

              {/* Featured Badge */}
              {plan.isFeatured && (
                <div className="absolute top-0 right-8 bg-[#6836E1] text-white font-bold uppercase text-[9px] tracking-widest px-4 py-1.5 rounded-b-xl shadow-md">
                  Most popular
                </div>
              )}

              <div className="relative z-10">
                <span className={`text-xs font-extrabold uppercase tracking-widest transition-colors duration-300 ${plan.isFeatured ? "text-indigo-400 group-hover:text-indigo-300" : "text-[#6836E1]"}`}>
                  {plan.name}
                </span>

                <div className="flex items-baseline mt-4 mb-3">
                  <span className="text-5xl font-extrabold tracking-tight leading-none">
                    {plan.price}
                  </span>
                  {plan.price !== "Custom" && (
                    <span className={`text-sm ml-1.5 ${plan.isFeatured ? "text-white/60" : "text-slate-500"}`}>
                      /mo
                    </span>
                  )}
                </div>

                <p className={`text-xs md:text-sm font-semibold leading-relaxed mb-6 ${plan.isFeatured ? "text-white/75" : "text-slate-500"}`}>
                  {plan.desc}
                </p>

                <div className={`w-full h-[1px] mb-6 transition-colors duration-300 ${plan.isFeatured ? 'bg-white/10 group-hover:bg-white/20' : 'bg-slate-200 group-hover:bg-indigo-100'}`} />

                <ul className="space-y-4">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${
                        plan.isFeatured ? "bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500/30 group-hover:text-indigo-300" : "bg-indigo-50 text-[#6836E1] group-hover:bg-indigo-100"
                      }`}>
                        <Check size={12} className="stroke-[3]" />
                      </div>
                      <span className={`text-xs md:text-sm font-semibold ${plan.isFeatured ? "text-white/90" : "text-slate-700"}`}>
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => onSelectPlan(plan.slug)}
                className={`w-full py-4 mt-8 rounded-full text-xs md:text-sm font-bold uppercase tracking-widest cursor-pointer shadow-sm transition-all duration-300 relative z-10 ${
                  plan.isFeatured 
                    ? "bg-[#6836E1] text-white hover:bg-[#582bca] hover:shadow-lg hover:-translate-y-0.5" 
                    : "bg-slate-900 text-white hover:bg-[#6836E1] hover:shadow-lg hover:-translate-y-0.5"
                }`}
              >
                {plan.price === "Custom" ? "Contact us" : plan.isFeatured ? "Choose Plan" : "Get started"}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
