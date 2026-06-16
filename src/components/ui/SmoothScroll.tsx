"use client";

import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";

export function SmoothScroll({ 
  children, 
  root = true,
  className,
  id
}: { 
  children: React.ReactNode;
  root?: boolean;
  className?: string;
  id?: string;
}) {
  return (
    <ReactLenis root={root} options={{ autoRaf: true, lerp: 0.1 }} className={className} id={id}>
      {children}
    </ReactLenis>
  );
}
