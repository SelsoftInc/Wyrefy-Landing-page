"use client";

import { AnimatePresence, MotionValue, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";
import { Menu } from "lucide-react";

import { usePathname } from "next/navigation";

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
}: Readonly<{
  items: { title: string; icon: React.ReactNode; href: string; onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void }[];
  desktopClassName?: string;
  mobileClassName?: string;
}>) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className,
}: Readonly<{
  items: { title: string; icon: React.ReactNode; href: string; onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void }[];
  className?: string;
}>) => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className={cn("relative block md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute inset-x-0 bottom-full mb-2 flex flex-col gap-2"
          >
            {items.map((item, idx) => {
              const active = pathname === item.href;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: 10,
                    transition: {
                      delay: idx * 0.05,
                    },
                  }}
                  transition={{ delay: (items.length - 1 - idx) * 0.05 }}
                >
                  <Link
                    href={item.href}
                    onClick={item.onClick}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border shadow-lg transition-colors",
                      active 
                        ? "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-strong)] text-white border-blue-400/20" 
                        : "bg-slate-900 border-white/5 text-slate-400"
                    )}
                  >
                    <div className="size-4 flex items-center justify-center">{item.icon}</div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex size-10 items-center justify-center rounded-full bg-slate-900 border border-white/10 text-slate-400"
      >
        <Menu className="size-5" />
      </button>
    </div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
}: Readonly<{
  items: { title: string; icon: React.ReactNode; href: string; onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void }[];
  className?: string;
}>) => {
  const mouseY = useMotionValue(Infinity);
  const pathname = usePathname();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isDockHovered, setIsDockHovered] = useState(false);

  return (
    <motion.div
      onMouseMove={(e) => mouseY.set(e.clientY)}
      onMouseEnter={() => setIsDockHovered(true)}
      onMouseLeave={() => {
        mouseY.set(Infinity);
        setHoveredIdx(null);
        setIsDockHovered(false);
      }}
      className={cn(
        "my-auto hidden w-16 flex-col items-center gap-2.5 py-4 px-2 md:flex justify-center bg-white/30 dark:bg-black/20 border border-slate-300/45 dark:border-white/10 rounded-[2rem] shadow-xl backdrop-blur-md",
        className
      )}
    >
      {items.map((item, idx) => {
        const active = pathname === item.href;
        return (
          <IconContainer 
            mouseY={mouseY} 
            key={item.title} 
            active={active}
            isHovered={hoveredIdx === idx}
            anyHovered={isDockHovered}
            onHoverStart={() => setHoveredIdx(idx)}
            onHoverEnd={() => setHoveredIdx(null)}
            {...item} 
          />
        );
      })}
    </motion.div>
  );
};

function IconContainer({
  mouseY,
  title,
  icon,
  href,
  onClick,
  active,
  isHovered,
  anyHovered,
  onHoverStart,
  onHoverEnd,
}: Readonly<{
  mouseY: MotionValue;
  title: string;
  icon: React.ReactNode;
  href: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  active: boolean;
  isHovered: boolean;
  anyHovered: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}>) {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseY, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { y: 0, height: 0 };
    return val - bounds.y - bounds.height / 2;
  });

  const widthTransform = useTransform(distance, [-150, 0, 150], [40, 60, 40]);
  const heightTransform = useTransform(distance, [-150, 0, 150], [40, 60, 40]);

  const widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 30, 20]);
  const heightTransformIcon = useTransform(distance, [-150, 0, 150], [20, 30, 20]);

  const width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 200,
    damping: 22,
  });
  const height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 200,
    damping: 22,
  });

  const widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 200,
    damping: 22,
  });
  const heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 200,
    damping: 22,
  });

  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = () => {
    setHovered(true);
    onHoverStart();
  };

  const handleMouseLeave = () => {
    setHovered(false);
    onHoverEnd();
  };

  return (
    <Link href={href} onClick={onClick}>
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "relative flex aspect-square items-center justify-center rounded-full border transition-all duration-300 ease-out bg-transparent",
          active 
            ? "border-[var(--accent)] text-[var(--accent)] shadow-[0_0_15px_rgba(59,130,246,0.15)] shadow-blue-500/10" 
            : "border-slate-300/80 dark:border-white/20 text-slate-500 hover:text-slate-800 hover:border-slate-500/40 dark:text-slate-300 dark:hover:text-white dark:hover:border-white/20",
          anyHovered && !isHovered && "opacity-40 scale-[0.92]"
        )}
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, x: -10, y: "-50%" }}
              animate={{ opacity: 1, x: 0, y: "-50%" }}
              exit={{ opacity: 0, x: -2, y: "-50%" }}
              className="absolute left-full ml-4 top-1/2 w-fit rounded-lg border border-white/10 bg-slate-950 px-2.5 py-1 text-xs whitespace-pre text-slate-200 shadow-xl backdrop-blur-md z-[100]"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center"
        >
          {icon}
        </motion.div>
      </motion.div>
    </Link>
  );
}
