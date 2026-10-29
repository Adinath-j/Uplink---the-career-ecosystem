"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ArrowUpRight, Download } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [mobileMenuOpen]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "border-b border-uplink-border bg-white/95 backdrop-blur-md shadow-subtle py-3"
          : "bg-transparent py-5"
      )}
    >
      <Container className="flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-uplink-blue rounded-md">
          <Image
            src="/brand/logo.svg"
            alt="UPLINK"
            width={130}
            height={34}
            priority
            className="h-8 w-auto"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Main Navigation">
          {siteConfig.navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-uplink-text-secondary transition-colors duration-200 hover:text-uplink-text hover:text-uplink-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-uplink-blue rounded-sm py-1"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA Action */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            href="#download"
            size="sm"
            variant="primary"
            className="group"
          >
            <Download className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
            <span>Get the App</span>
          </Button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-uplink-text hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-uplink-blue"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </Container>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[60px] bg-white z-40 border-t border-uplink-border px-6 py-8 flex flex-col justify-between animate-in fade-in duration-200">
          <nav className="flex flex-col gap-5">
            {siteConfig.navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-semibold text-uplink-text hover:text-uplink-blue py-2 border-b border-slate-100"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-6">
            <Button
              href="#download"
              onClick={() => setMobileMenuOpen(false)}
              size="lg"
              variant="primary"
              className="w-full justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              <span>Get Android App</span>
            </Button>
            <p className="mt-3 text-center text-xs text-uplink-text-muted">
              UPLINK Student Ecosystem • Milestone 1
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
