"use client";

import { ReactLenis } from "lenis/react";

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
    <ReactLenis root={root} options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }} className={className} id={id}>
      {children}
    </ReactLenis>
  );
}
