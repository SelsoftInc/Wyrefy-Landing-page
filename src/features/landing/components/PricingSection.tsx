"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import PixelCard from "@/src/components/ui/PixelCard";
import type { Plan } from "@/src/features/auth/types";

type PricingSectionProps = Readonly<{
  plans: Plan[];
  onSelectPlan: (slug: string) => void;
}>;

export function PricingSection({ plans, onSelectPlan }: PricingSectionProps) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const imgY = useTransform(scrollYProgress, [0, 1], [-200, 200]);
  const imgRotate = useTransform(scrollYProgress, [0, 1], [-180, 180]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [0.8, 1.2]);
  const imgXRight = useTransform(scrollYProgress, [0, 1], [100, -100]);

  const enterprisePlan: Plan = {
    id: "enterprise-plan",
    name: "Enterprise",
    slug: "enterprise",
    tenant_type: "organization",
    price_cents: null as unknown as number,
    billing_interval: "month",
    included_credits: "Custom",
    limits_json: { projects: "Unlimited", credits: "Custom" },
    status: "active",
    is_public: true,
    organization_id: null,
  };

  const displayPlans = [...plans, enterprisePlan];

  return (
    <>
      <style>{`
        .plan-card {
          border-radius: 20px;
          padding: 32px;
          display: flex;
          flex-direction: column;
          transition: all 0.25s;
          position: relative;
          overflow: hidden;
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid rgba(59, 130, 246, 0.15);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255,255,255,0.8);
        }
        .plan-card:hover {
          transform: translateY(-8px) scale(1.02);
          border-color: rgba(59, 130, 246, 0.35);
          box-shadow: 0 30px 60px -12px rgba(59, 130, 246, 0.08), 0 0 30px rgba(59, 130, 246, 0.03);
        }
        .plan-card.featured {
          background: linear-gradient(180deg, #f5f3ff 0%, #ffffff 100%);
          border: 1px solid rgba(82, 39, 255, 0.3);
          transform: scale(1.03);
          box-shadow: 0 0 40px rgba(82, 39, 255, 0.05), inset 0 1px 0 rgba(255,255,255,0.8);
        }
        .plan-card.featured:hover {
          transform: scale(1.05) translateY(-8px);
          border-color: rgba(82, 39, 255, 0.6);
          box-shadow: 0 30px 60px -12px rgba(82, 39, 255, 0.12), 0 0 40px rgba(82, 39, 255, 0.12);
        }
        .plan-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.2), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .plan-card:hover::before {
          opacity: 1;
        }
      `}</style>

      <div className="h-[1px] bg-slate-200 max-w-[1160px] mx-auto"></div>
      <div className="relative overflow-visible" ref={containerRef}>
        {/* Floating 3D Image Parallax - Right Side */}
        <motion.div 
          style={{ y: imgY, x: imgXRight, rotate: imgRotate, scale: imgScale }}
          className="absolute right-0 top-[10%] translate-x-[15%] md:translate-x-[20%] w-[180px] md:w-[250px] lg:w-[350px] opacity-20 pointer-events-none z-0"
        >
          <Image 
            src="/3D_Element.png" 
            alt="Floating 3D Element Pricing" 
            fill
            className="object-contain"
            style={{ animation: 'spin 35s linear infinite' }}
            unoptimized
          />
        </motion.div>

        <div className="max-w-[1160px] mx-auto pt-24 pb-48 px-10 relative" id="pricing">

          <div className="text-center mb-[100px] relative z-10">
          <div className="inline-flex items-center gap-[7px] text-[10px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-4 py-1.5 px-3 border border-slate-200 rounded-full mx-auto">
            <span className="text-[#5227FF]">Pricing</span>
          </div>
          <h2 className="text-[clamp(30px,3.8vw,52px)] font-bold text-slate-900 leading-[1.07] tracking-[-0.025em] mb-3 mx-auto">
            Choose your plan
          </h2>
          <p
            className="text-slate-650 text-center mx-auto max-w-[420px]"
          >
            Transparent pricing that scales with your projects.
          </p>
        </div>
        <div className="relative z-10">
          <div className="absolute top-1/2 left-1/2 w-[800px] h-[500px] -translate-x-1/2 -translate-y-1/2 blur-[80px] -z-10 pointer-events-none rounded-full bg-[radial-gradient(circle,rgba(82,39,255,0.06)_0%,rgba(180,151,207,0.02)_50%,transparent_70%)]"></div>
          <div className="flex flex-col md:flex-row flex-wrap justify-center gap-4 items-stretch max-w-[960px] mx-auto">
          {displayPlans.map((plan) => {
            const isFeatured =
              plan.slug === "pro" || plan.name.toLowerCase().includes("pro");
            const isEnterprise = plan.slug === "enterprise";
            let description =
              "For individuals starting with Figma-assisted project generation.";
            if (isEnterprise) {
              description =
                "For organizations that need custom limits, support, and billing terms.";
            } else if (isFeatured) {
              description =
                "For teams building more projects with larger included credit pools.";
            }

            return (
              <PixelCard
                key={plan.slug}
                variant={isFeatured ? "blue" : "default"}
                gap={15}
                speed={30}
                colors={isFeatured ? "#6366f1,#8b5cf6,#a855f7" : "#cbd5e1,#94a3b8,#64748b"}
                className={`plan-card w-full md:w-[300px] ${isFeatured ? "featured" : ""}`}
              >
                <div className="relative z-10 w-full flex flex-col h-full pointer-events-none">
                  {isFeatured && <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[9px] font-bold tracking-[0.1em] uppercase py-1 px-3.5 bg-[#5227FF] text-white rounded-b-lg pointer-events-auto">Most popular</div>}
                  <div className="text-[13px] font-semibold text-slate-500 mb-2 mt-4 pointer-events-auto">{plan.name}</div>
                {plan.price_cents !== null && plan.price_cents !== undefined ? (
                  <div className="text-5xl font-extrabold tracking-[-0.04em] text-slate-900 leading-none">
                    <sup className="text-[20px] font-medium align-super mr-[1px]">$</sup>
                    {Math.round(plan.price_cents / 100)}
                    <span className="text-[16px] font-normal text-slate-500 ml-[2px]">/mo</span>
                  </div>
                ) : (
                  <div
                    className="text-5xl font-extrabold tracking-[-0.04em] text-slate-900 leading-none"
                    style={{ fontSize: "36px", paddingTop: "6px" }}
                  >
                    Custom
                  </div>
                )}
                <p className="text-[12.5px] text-slate-500 leading-[1.6] my-3.5 mb-6">{description}</p>
                <div className="flex flex-col gap-2.5 flex-1 mb-7">
                  <div className="flex items-center gap-[9px] text-[12.5px] font-medium text-slate-700">
                    <div className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center shrink-0 ${isFeatured ? 'border-indigo-500/30 text-indigo-600' : 'border-slate-200'}`}>
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                      >
                        <path
                          d="M2 5l2 2 4-4"
                          stroke={isFeatured ? "rgba(79, 70, 229, 0.9)" : "currentColor"}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    {isEnterprise
                      ? "Unlimited projects"
                      : `Up to ${String(plan.limits_json.projects ?? "Unlimited")} projects`}
                  </div>
                  <div className="flex items-center gap-[9px] text-[12.5px] font-medium text-slate-700">
                    <div className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center shrink-0 ${isFeatured ? 'border-indigo-500/30 text-indigo-600' : 'border-slate-200'}`}>
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                      >
                        <path
                          d="M2 5l2 2 4-4"
                          stroke={isFeatured ? "rgba(79, 70, 229, 0.9)" : "currentColor"}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    {isEnterprise
                      ? "Custom credit allocation"
                      : `${String(
                          plan.limits_json.credits ?? plan.included_credits
                        )} included credits`}
                  </div>
                  <div className="flex items-center gap-[9px] text-[12.5px] font-medium text-slate-700">
                    <div className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center shrink-0 ${isFeatured ? 'border-indigo-500/30 text-indigo-600' : 'border-slate-200'}`}>
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                      >
                        <path
                          d="M2 5l2 2 4-4"
                          stroke={isFeatured ? "rgba(79, 70, 229, 0.9)" : "currentColor"}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    Live frontend preview
                  </div>
                  {(isFeatured || isEnterprise) && (
                    <div className="flex items-center gap-[9px] text-[12.5px] font-medium text-slate-700">
                      <div className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center shrink-0 ${isFeatured ? 'border-indigo-500/30 text-indigo-600' : 'border-slate-200'}`}>
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          fill="none"
                        >
                          <path
                            d="M2 5l2 2 4-4"
                            stroke={isFeatured ? "rgba(79, 70, 229, 0.9)" : "currentColor"}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      {isEnterprise
                        ? "Custom support & billing terms"
                        : "Organization-ready workspace"}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onSelectPlan(plan.slug)}
                  className={`w-full py-[11px] rounded-[9px] text-[13px] font-semibold cursor-pointer transition-all duration-300 pointer-events-auto ${
                    isFeatured 
                      ? "bg-[#5227FF] text-white border-none hover:bg-[#623eff] hover:shadow-[0_10px_20px_-5px_rgba(82,39,255,0.4)] hover:-translate-y-1" 
                      : "bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200 hover:border-slate-300 hover:shadow-[0_10px_20px_-5px_rgba(0,0,0,0.05)] hover:-translate-y-1"
                  }`}
                >
                  {isEnterprise ? "Contact us" : isFeatured ? "Choose Plan" : "Get started"}
                </button>
                </div>
              </PixelCard>
            );
          })}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
