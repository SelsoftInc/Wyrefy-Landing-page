import React from "react";
import Image from "next/image";

export interface ProcessStep {
  id: string;
  number: string;
  title: string;
  description: string;
  visual: React.ReactNode;
}

export const processData: ProcessStep[] = [
  {
    id: "step-1",
    number: "01",
    title: "Open a Project",
    description:
      "Create or select a project workspace where development begins.",
    visual: (
      <Image src="/process/image1.png" alt="Open a Project" width={800} height={600} className="process-visual-img" unoptimized />
    ),
  },
  {
    id: "step-2",
    number: "02",
    title: "Import Context",
    description:
      "Upload designs, requirements, documentation, repositories, and assets.",
    visual: (
      <Image src="/process/image2.png" alt="Import Context" width={800} height={600} className="process-visual-img" unoptimized />
    ),
  },
  {
    id: "step-3",
    number: "03",
    title: "Iterate in Chat",
    description:
      "Collaborate with AI agents through natural language conversations.",
    visual: (
      <Image src="/process/image3.png" alt="Iterate in Chat" width={800} height={600} className="process-visual-img" unoptimized />
    ),
  },
  {
    id: "step-4",
    number: "04",
    title: "Review Live Preview",
    description:
      "Instantly inspect and validate the running application without leaving the workspace.",
    visual: (
      <Image src="/process/image4.png" alt="Review Live Preview" width={800} height={600} className="process-visual-img" unoptimized />
    ),
  },
];
