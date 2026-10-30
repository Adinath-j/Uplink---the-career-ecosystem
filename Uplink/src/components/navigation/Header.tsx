
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ArrowUpRight } from "lucide-react";

import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-5 z-50 px-4">
      <div className="relative mx-auto max-w-[1160px]">

        {/* Floating Glass Container */}
        <div
          className={cn(
            "pointer-events-auto relative isolate",
            "flex h-[72px] items-center justify-between",
            "overflow-hidden rounded-2xl",
            "border border-white/30",
            "backdrop-blur-[30px] backdrop-saturate-[180%]",
            "ring-1 ring-slate-900/[0.04]",
            "transition-all duration-500 ease-out",

            isScrolled
              ? "bg-white/15 shadow-[0_12px_40px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.6)]"
              : "bg-white/[0.06] shadow-[0_8px_32px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.5)]"
          )}
        >

          {/* Glass reflection / light layer */}
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-white/20 via-white/5 to-transparent" />

          {/* Top glass highlight */}
          <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-90" />

          {/* Navigation content */}
          <div className="relative z-10 flex h-full w-full items-center justify-between px-5 sm:px-7">

            {/* Animated UPLINK Logo */}
            <Link
              href="/"
              onClick={closeMenu}
              aria-label="UPLINK home"
              className="flex shrink-0 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-uplink-blue"
            >
              <span
                className={cn(
                  "relative block shrink-0 overflow-hidden",
                  "transition-[width,height] duration-500 ease-in-out",
                  isScrolled
                    ? "h-10 w-10"
                    : "h-[52px] w-[148px] sm:h-[56px] sm:w-[160px]"
                )}
              >
                {/* Horizontal logo */}
                <Image
                  src="/brand/uplink-horizontal-logo.png"
                  alt=""
                  width={2048}
                  height={717}
                  priority
                  className={cn(
                    "absolute inset-0 h-full w-full object-contain",
                    "transition-all duration-300 ease-in-out",
                    isScrolled
                      ? "scale-95 opacity-0"
                      : "scale-100 opacity-100"
                  )}
                />

                {/* Icon-only logo */}
                <Image
                  src="/brand/Uplink-logo.png"
                  alt=""
                  width={2000}
                  height={2000}
                  className={cn(
                    "absolute inset-0 h-full w-full object-contain",
                    "transition-all duration-300 ease-in-out",
                    isScrolled
                      ? "scale-100 opacity-100"
                      : "scale-75 opacity-0"
                  )}
                />
              </span>
            </Link>


            {/* Desktop navigation */}
            <nav
              className="hidden items-center gap-8 lg:flex"
              aria-label="Main navigation"
            >
              {siteConfig.navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[13px] font-medium text-slate-600 transition-colors duration-200 hover:text-uplink-blue"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex">
              <Button
                href="#download"
                size="sm"
                variant="primary"
                className="group"
              >
                Get the App
                <ArrowUpRight className="ml-1.5 h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-3 lg:hidden">
              <div className="hidden sm:block md:block lg:hidden">
                <Button href="#download" size="sm" variant="primary">
                  Get the App
                </Button>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((open) => !open)}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-uplink-blue"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Floating Glass Mobile Menu */}
        {mobileMenuOpen && (
          <div
            id="mobile-navigation"
            className={cn(
              "pointer-events-auto absolute left-0 right-0 top-[calc(100%+12px)]",
              "overflow-hidden rounded-2xl border border-white/50",
              "bg-white/[0.12] backdrop-blur-[30px] backdrop-saturate-[180%]",
              "shadow-[0_16px_45px_rgba(15,23,42,0.14),inset_0_1px_0_rgba(255,255,255,0.8)]",
              "lg:hidden"
            )}
          >
            <div className="bg-gradient-to-b from-white/45 to-white/10 p-5">

              <nav className="flex flex-col" aria-label="Mobile links">
                {siteConfig.navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="flex items-center justify-between border-b border-white/30 py-4 text-base font-semibold text-slate-700 transition-colors hover:text-uplink-blue last:border-b-0"
                  >
                    {link.label}
                    <ArrowUpRight className="h-4 w-4 text-slate-400" />
                  </Link>
                ))}
              </nav>

              <div className="mt-5 sm:hidden">
                <Button
                  href="#download"
                  onClick={closeMenu}
                  size="lg"
                  variant="primary"
                  className="w-full justify-center"
                >
                  Get Android App
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <p className="mt-4 text-center text-xs tracking-wide text-slate-500">
                UPLINK · Connecting Potential
              </p>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
