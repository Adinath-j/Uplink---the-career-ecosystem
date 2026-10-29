import React from "react";
import { Badge } from "./Badge";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  badge?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  badge,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  const isCenter = align === "center";

  return (
    <div
      className={cn(
        "mb-12 md:mb-16",
        isCenter ? "mx-auto max-w-3xl text-center" : "max-w-2xl text-left",
        className
      )}
    >
      {badge && (
        <div className={cn("mb-4", isCenter ? "flex justify-center" : "")}>
          <Badge variant="blue">{badge}</Badge>
        </div>
      )}
      <h2 className="text-3xl font-extrabold tracking-tight text-uplink-text sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-uplink-text-secondary sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
