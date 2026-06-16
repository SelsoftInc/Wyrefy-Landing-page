"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "motion/react";

const techStack = [
  { name: "Figma", iconSrc: "/features_icon/figma.svg" },
  { name: "Next.js", iconSrc: "/features_icon/nextjs.svg" },
  { name: "React", iconSrc: "/features_icon/react.svg" },
  { name: "Angular", iconSrc: "/features_icon/angular.svg" },
  { name: "Vue", iconSrc: "/features_icon/vue-js.svg" },
] as const;

export function BrandsSection() {
  const [hoveredTech, setHoveredTech] = useState<string | null>(null);

  return (
    <section className="pt-24 pb-12 px-5 relative z-10 w-full overflow-hidden">
      <div className="max-w-[1200px] mx-auto flex flex-col items-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          className="text-white/80 text-sm font-semibold mb-8 tracking-wide uppercase drop-shadow-sm"
        >
          Works with your favorite technologies
        </motion.p>

        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 w-full mt-2">
          {techStack.map((tech, i) => {
            const isHovered = hoveredTech === tech.name;
            const isOtherHovered = hoveredTech !== null && !isHovered;

            return (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.15, y: -8 }}
                viewport={{ once: false }}
                transition={{
                  delay: i * 0.1,
                  type: "spring",
                  stiffness: 400,
                  damping: 17,
                }}
                onHoverStart={() => setHoveredTech(tech.name)}
                onHoverEnd={() => setHoveredTech(null)}
                className={`flex items-center gap-3 cursor-pointer transition-all duration-200 ease-out ${isHovered ? "drop-shadow-[0_4px_15px_rgba(59,130,246,0.3)]" : ""
                  } ${isOtherHovered ? "opacity-40 grayscale" : "opacity-100 grayscale-0"}`}
              >
                <div className="shrink-0 flex items-center justify-center">
                  <Image
                    src={tech.iconSrc}
                    alt=""
                    aria-hidden="true"
                    width={26}
                    height={26}
                    className={`size-6 object-contain brightness-0 invert`}
                  />
                </div>
                <span className="text-white drop-shadow-sm font-bold text-xl tracking-tight">{tech.name}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
