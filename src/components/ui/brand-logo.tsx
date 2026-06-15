"use client";

import Image from "next/image";

export function BrandLogo({ className = "size-10" }: Readonly<{ className?: string }>) {
  return (
    <span className={`relative flex shrink-0 items-center justify-center ${className}`}>
      <Image
        src="/black_wyrefy_logo.png"
        alt="Wyrefy"
        width={96}
        height={96}
        className="brand-logo-light h-full w-full object-contain object-center"
        priority
      />
      <Image
        src="/white_wyrefy_logo.png"
        alt="Wyrefy"
        width={96}
        height={96}
        className="brand-logo-dark hidden h-full w-full object-contain object-center"
        priority
      />
    </span>
  );
}
