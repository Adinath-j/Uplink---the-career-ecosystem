
import React from "react";
import {
  Download,
  ArrowUpRight,
  Compass,
  BriefcaseBusiness,
  CircleHelp,
  UsersRound,
  Network,
} from "lucide-react";

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";

const PILLARS = [
  { icon: Compass, label: "Discover" },
  { icon: BriefcaseBusiness, label: "Opportunities" },
  { icon: CircleHelp, label: "Knowledge" },
  { icon: UsersRound, label: "Mentorship" },
];

export function FinalCTA() {
  const hasDownloadUrl = Boolean(siteConfig.androidDownloadUrl);

  return (
    <section
      id="download"
      className="relative isolate scroll-mt-28 overflow-hidden bg-[#104BC2] py-24 text-white sm:py-28"
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">

        <div className="absolute -right-40 -top-60 h-[650px] w-[650px] rounded-full border border-white/[0.09]" />

        <div className="absolute -right-20 -top-40 h-[480px] w-[480px] rounded-full border border-white/[0.10]" />

        <div className="absolute -bottom-52 left-[-10%] h-[500px] w-[500px] rounded-full border border-white/[0.08]" />

        <div className="absolute right-[15%] top-0 h-[400px] w-[400px] rounded-full bg-blue-300/15 blur-[120px]" />

        {/* Decorative network paths */}
        <svg
          viewBox="0 0 700 500"
          fill="none"
          className="absolute -right-20 top-0 h-full w-[700px] opacity-[0.15]"
          aria-hidden="true"
        >
          <path
            d="M350 250 L150 90 L80 90 M350 250 L550 90 L620 90 M350 250 L150 410 L80 410 M350 250 L550 410 L620 410"
            stroke="white"
            strokeWidth="1.5"
            strokeDasharray="5 8"
          />

          <circle cx="350" cy="250" r="100" stroke="white" />
          <circle cx="350" cy="250" r="150" stroke="white" />
          <circle cx="150" cy="90" r="5" fill="white" />
          <circle cx="550" cy="90" r="5" fill="white" />
          <circle cx="150" cy="410" r="5" fill="white" />
          <circle cx="550" cy="410" r="5" fill="white" />
        </svg>
      </div>

      <Container className="relative z-10">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">

          {/* Left: Closing message */}
          <div>

            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide text-blue-100 backdrop-blur-md">
              <Network className="h-4 w-4" />
              ONE CONNECTED ECOSYSTEM
            </div>

            <h2 className="max-w-2xl text-4xl font-extrabold leading-[1.1] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Your next opportunity starts{" "}
              <span className="text-blue-200">here.</span>
            </h2>

            <p className="mt-6 max-w-xl text-base leading-7 text-blue-100 sm:text-lg sm:leading-8">
              Bring your student profile, career opportunities,
              knowledge sharing and mentorship together with UPLINK.
              One platform built around your professional journey.
            </p>

            {/* Actions */}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">

              {hasDownloadUrl ? (
                <Button
                  href={siteConfig.androidDownloadUrl}
                  external
                  size="lg"
                  variant="secondary"
                  className="w-full border-white bg-white font-bold text-uplink-blue hover:bg-blue-50 sm:w-auto"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Android App
                </Button>
              ) : (
                <div className="inline-flex items-center justify-center gap-3 rounded-lg border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-amber-300" />
                  Android Release Coming Soon
                </div>
              )}

              <Button
                href="#showcase"
                size="lg"
                variant="outline"
                className="w-full border-white/40 bg-transparent text-white hover:border-white hover:bg-white/10 sm:w-auto"
              >
                Explore UPLINK
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>

            </div>

            <p className="mt-6 text-xs text-blue-200">
              UPLINK · Connecting Potential
            </p>
          </div>

          {/* Right: Four connected pillars */}
          <div className="relative mx-auto w-full max-w-[430px]">

            <div className="relative rounded-2xl border border-white/20 bg-white/[0.08] p-5 shadow-[0_25px_80px_-30px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-7">

              {/* Panel heading */}
              <div className="mb-7 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-200">
                    The UPLINK Ecosystem
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-white">
                    Everything connects.
                  </h3>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10">
                  <Network className="h-5 w-5 text-white" />
                </div>
              </div>

              {/* Pillar grid */}
              <div className="grid grid-cols-2 gap-3">
                {PILLARS.map((pillar, index) => {
                  const Icon = pillar.icon;

                  return (
                    <div
                      key={pillar.label}
                      className="group rounded-xl border border-white/15 bg-white/[0.07] p-5 transition-colors duration-300 hover:border-white/40 hover:bg-white/[0.14]"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white transition-colors group-hover:bg-white group-hover:text-uplink-blue">
                        <Icon className="h-5 w-5" strokeWidth={1.8} />
                      </div>

                      <p className="mt-5 text-sm font-semibold text-white">
                        {pillar.label}
                      </p>

                      <p className="mt-1 text-[11px] text-blue-200">
                        0{index + 1} / 04
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Bottom message */}
              <div className="mt-5 flex items-center gap-3 border-t border-white/15 pt-5">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-200" />
                <p className="text-xs text-blue-100">
                  Connected around the student journey
                </p>
              </div>

            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}
