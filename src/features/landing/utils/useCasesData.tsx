import React from "react";
import { FolderPlus, UploadCloud, Bot, MonitorPlay } from "lucide-react";

/* ─────────────── Tech stack data ─────────────── */
export const techStack = [
  { name: "Figma",   iconSrc: "/features_icon/figma.svg"   },
  { name: "Next.js", iconSrc: "/features_icon/nextjs.svg"  },
  { name: "React",   iconSrc: "/features_icon/react.svg"   },
  { name: "Angular", iconSrc: "/features_icon/angular.svg" },
  { name: "Vue",     iconSrc: "/features_icon/vue-js.svg"  },
] as const;

/* ─────────────── Step data ─────────────── */
export const steps = [
  {
    num: "01", title: "Open a Project",
    desc: "Create or select a project workspace where development begins.",
    icon: <FolderPlus  className="w-5 h-5" />,
    iconBg: "bg-[#00C3FF]/10 text-[#00C3FF] border-[#00C3FF]/30",
    accent: "#00C3FF", glow: "rgba(0,195,255,0.3)",
    imageSrc: "/process/image1.png",
  },
  {
    num: "02", title: "Import Context",
    desc: "Upload designs, requirements, documentation, repositories, and assets.",
    icon: <UploadCloud className="w-5 h-5" />,
    iconBg: "bg-[#A200FF]/10 text-[#A200FF] border-[#A200FF]/30",
    accent: "#A200FF", glow: "rgba(162,0,255,0.3)",
    imageSrc: "/process/image2.png",
  },
  {
    num: "03", title: "Iterate in Chat",
    desc: "Collaborate with AI agents through natural language conversations.",
    icon: <Bot         className="w-5 h-5" />,
    iconBg: "bg-[#FF007F]/10 text-[#FF007F] border-[#FF007F]/30",
    accent: "#FF007F", glow: "rgba(255,0,127,0.3)",
    imageSrc: "/process/image3.png",
  },
  {
    num: "04", title: "Review Live Preview",
    desc: "Instantly inspect and validate the running application without leaving the workspace.",
    icon: <MonitorPlay className="w-5 h-5" />,
    iconBg: "bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30",
    accent: "#00E676", glow: "rgba(0,230,118,0.3)",
    imageSrc: "/process/image4.png",
  },
];
