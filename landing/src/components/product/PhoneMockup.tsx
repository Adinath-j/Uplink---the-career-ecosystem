import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface PhoneMockupProps {
  screenSrc: string;
  alt: string;
  priority?: boolean;
  className?: string;
}

export function PhoneMockup({
  screenSrc,
  alt,
  priority = false,
  className,
}: PhoneMockupProps) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[320px] sm:max-w-[340px] md:max-w-[360px] drop-shadow-2xl transition-transform duration-500 hover:scale-[1.01]",
        className
      )}
    >
      <Image
        src={screenSrc}
        alt={alt}
        width={380}
        height={780}
        priority={priority}
        className="w-full h-auto object-contain"
        sizes="(max-width: 640px) 320px, (max-width: 768px) 340px, 360px"
      />
    </div>
  );
}
