import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  external?: boolean;
  className?: string;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  external,
  className,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-uplink-blue focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2.5 gap-2",
    lg: "text-base px-6 py-3 gap-2.5",
  };

  const variantStyles = {
    primary:
      "bg-uplink-blue text-white shadow-subtle hover:bg-uplink-blue-pressed hover:shadow",
    secondary:
      "bg-uplink-bg-secondary text-uplink-text border border-uplink-border hover:bg-slate-100 hover:border-slate-300",
    outline:
      "border border-uplink-border bg-white text-uplink-text hover:bg-uplink-bg-secondary hover:border-slate-400",
    ghost:
      "text-uplink-text-secondary hover:text-uplink-text hover:bg-uplink-bg-secondary",
  };

  const combinedClasses = cn(
    baseStyles,
    sizeStyles[size],
    variantStyles[variant],
    className
  );

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={combinedClasses}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={combinedClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
}
