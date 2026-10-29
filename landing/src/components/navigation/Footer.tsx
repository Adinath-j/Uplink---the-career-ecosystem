import React from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/Container";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-uplink-border bg-uplink-bg-secondary pt-16 pb-12">
      <Container>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:gap-12 pb-12 border-b border-uplink-border">
          {/* Column 1: Brand Info */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block">
              <Image
                src="/brand/logo.svg"
                alt="UPLINK"
                width={120}
                height={32}
                className="h-7 w-auto"
              />
            </Link>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-uplink-blue">
              {siteConfig.tagline}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-uplink-text-secondary">
              A Unified Campus Career and Professional Ecosystem for skill matching, opportunity management, and verified industry interaction.
            </p>
          </div>

          {/* Column 2: Ecosystem */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-uplink-text">
              Student Ecosystem
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-uplink-text-secondary">
              <li>
                <Link href="#showcase" className="hover:text-uplink-blue transition-colors">
                  Discover Feed
                </Link>
              </li>
              <li>
                <Link href="#showcase" className="hover:text-uplink-blue transition-colors">
                  10 Opportunity Categories
                </Link>
              </li>
              <li>
                <Link href="#showcase" className="hover:text-uplink-blue transition-colors">
                  Peer Q&A Knowledge Hub
                </Link>
              </li>
              <li>
                <Link href="#showcase" className="hover:text-uplink-blue transition-colors">
                  Alumni & Mentor Directory
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-uplink-blue transition-colors">
                  Application Lifecycle Tracker
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform Architecture */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-uplink-text">
              Architecture & Tech
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-uplink-text-secondary">
              <li>
                <Link href="#technology" className="hover:text-uplink-blue transition-colors">
                  React Native 0.88 Client
                </Link>
              </li>
              <li>
                <Link href="#technology" className="hover:text-uplink-blue transition-colors">
                  Spring Boot Modular Monolith
                </Link>
              </li>
              <li>
                <Link href="#technology" className="hover:text-uplink-blue transition-colors">
                  PostgreSQL Data Boundary
                </Link>
              </li>
              <li>
                <Link href="#technology" className="hover:text-uplink-blue transition-colors">
                  Lucide Vector Iconography
                </Link>
              </li>
              <li>
                <Link href="#technology" className="hover:text-uplink-blue transition-colors">
                  Zustand State Architecture
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Project Status */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-uplink-text">
              Project Status
            </h3>
            <div className="mt-4 rounded-md border border-uplink-border bg-white p-3.5 shadow-subtle">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-uplink-text">
                  Milestone 1 Complete
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-uplink-text-secondary">
                The student mobile client is verified and build-tested. Core Spring Boot backend is in active milestone planning.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 text-xs text-uplink-text-muted sm:flex-row">
          <p>© {currentYear} UPLINK. All rights reserved. Campus Professional Ecosystem.</p>
          <div className="flex items-center gap-6">
            <span>Built with Next.js 15 & React 19</span>
            <span>•</span>
            <span>Designed for Core Web Vitals</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
