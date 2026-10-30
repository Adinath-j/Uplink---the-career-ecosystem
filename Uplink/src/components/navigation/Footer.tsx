
import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  ArrowRight,
  Compass,
  BriefcaseBusiness,
  CircleHelp,
  UsersRound,
} from "lucide-react";

import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/Container";

const productLinks = [
  { label: "Discover Feed", href: "#showcase", icon: Compass },
  { label: "Explore Opportunities", href: "#ecosystem", icon: BriefcaseBusiness },
  { label: "Knowledge Sharing", href: "#features", icon: CircleHelp },
  { label: "Mentor Network", href: "#ecosystem", icon: UsersRound },
];

const aboutLinks = [
  { label: "About UPLINK", href: "#about" },
  { label: "Our Ecosystem", href: "#ecosystem" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Technology", href: "#technology" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-uplink-border bg-uplink-bg-secondary">

      <Container>

        {/* Main footer */}
        <div className="grid grid-cols-1 gap-12 py-16 md:grid-cols-2 lg:grid-cols-12 lg:gap-10 lg:py-20">

          {/* Brand column */}
          <div className="lg:col-span-5">

            <Link
              href="/"
              className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-uplink-blue"
              aria-label="UPLINK home"
            >
              <Image
                src="/brand/logo.svg"
                alt="UPLINK"
                width={130}
                height={34}
                className="h-8 w-auto"
              />
            </Link>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-uplink-blue">
              {siteConfig.tagline}
            </p>

            <p className="mt-4 max-w-sm text-sm leading-7 text-uplink-text-secondary">
              A unified campus career and professional ecosystem connecting
              student profiles, opportunities, knowledge sharing and
              mentorship in one place.
            </p>

            {/* Closing message */}
            <Link
              href="#showcase"
              className="group mt-7 inline-flex items-center gap-2 text-sm font-semibold text-uplink-text transition-colors hover:text-uplink-blue"
            >
              Explore UPLINK
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>

          </div>

          {/* Product links */}
          <div className="lg:col-span-3">

            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-uplink-text">
              Explore UPLINK
            </h3>

            <ul className="mt-5 space-y-4">
              {productLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="group inline-flex items-center gap-3 text-sm text-uplink-text-secondary transition-colors hover:text-uplink-blue"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-uplink-blue" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

          </div>

          {/* About links */}
          <div className="lg:col-span-2">

            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-uplink-text">
              About
            </h3>

            <ul className="mt-5 space-y-4">
              {aboutLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-uplink-text-secondary transition-colors hover:text-uplink-blue"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

          </div>

          {/* Closing CTA */}
          <div className="lg:col-span-2">

            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-uplink-text">
              Get Started
            </h3>

            <div className="mt-5 rounded-xl border border-uplink-border bg-white p-5">

              <p className="text-base font-bold tracking-tight text-uplink-text">
                Your next opportunity starts here.
              </p>

              <p className="mt-2 text-xs leading-6 text-uplink-text-secondary">
                Discover a more connected way to navigate your student career journey.
              </p>

              <Link
                href="#download"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-uplink-blue px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-uplink-blue/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-uplink-blue focus-visible:ring-offset-2"
              >
                Get the App
                <ArrowRight className="h-4 w-4" />
              </Link>

            </div>

          </div>

        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-4 border-t border-uplink-border py-6 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-xs leading-relaxed text-uplink-text-muted">
            © {currentYear} UPLINK. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-uplink-text-muted">
            <span>Connecting Potential</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span>Built for the student journey</span>
          </div>

        </div>

      </Container>
    </footer>
  );
}
