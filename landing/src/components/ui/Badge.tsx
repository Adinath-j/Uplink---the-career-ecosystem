import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: "blue" | "neutral" | "success" | "warning";
  className?: string;
}

export function Badge({
  children,
  variant = "blue",
  className,
  ...props
}: BadgeProps) {
  const variantStyles = {
    blue: "bg-uplink-blue-soft text-uplink-blue border-uplink-blue/20",
    neutral: "bg-uplink-bg-secondary text-uplink-text-secondary border-uplink-border",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
