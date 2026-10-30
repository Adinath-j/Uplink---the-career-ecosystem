
import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  Compass,
  BriefcaseBusiness,
  CircleHelp,
  UsersRound,
  Network,
  ArrowUpRight,
} from "lucide-react";

const MODULES = [
  {
    id: "01",
    icon: Compass,
    title: "Discover & Home",
    role: "Campus Pulse",
    summary:
      "Stay connected with campus activity, announcements, events and featured opportunities through an information-first feed.",
    details: [
      "Search across roles and skills",
      "Campus notices and event updates",
      "Featured opportunities",
    ],
  },
  {
    id: "02",
    icon: BriefcaseBusiness,
    title: "Explore Opportunities",
    role: "Career Hub",
    summary:
      "Explore opportunities across 10 student-focused categories, from internships and jobs to hackathons, scholarships and research.",
    details: [
      "10 opportunity categories",
      "Remote, hybrid and on-site filters",
      "Application tracking and external handoffs",
    ],
  },
  {
    id: "03",
    icon: CircleHelp,
    title: "Structured Q&A",
    role: "Knowledge Sharing",
    summary:
      "Ask questions, share knowledge and learn from peers through a structured academic discussion experience.",
    details: [
      "For You, Unanswered, Trending and My Questions",
      "Topic-based questions and answers",
      "Same-Doubt interaction",
    ],
  },
  {
    id: "04",
    icon: UsersRound,
    title: "Mentor Directory",
    role: "Guidance Network",
    summary:
      "Discover alumni and industry professionals, explore their areas of expertise and connect through mentoring requests.",
    details: [
      "Explore professional domains",
      "Browse mentor profiles",
      "Send structured mentoring requests",
    ],
  },
];

export function Ecosystem() {
  return (
    <section
      id="ecosystem"
      className="relative overflow-hidden border-y border-uplink-border bg-white py-24 sm:py-28"
    >
      <Container>
        <SectionHeading
          badge="ONE CONNECTED ECOSYSTEM"
          title="Four experiences. One connected journey."
          description="UPLINK brings discovery, career opportunities, knowledge sharing and mentorship together in one student-focused ecosystem."
        />

        <div className="mt-16 grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">

          {/* LEFT: Connected ecosystem illustration */}
          <div className="relative mx-auto w-full max-w-[470px]">

            <div className="relative min-h-[440px] overflow-hidden rounded-2xl border border-uplink-border bg-uplink-bg-secondary sm:min-h-[480px]">

              {/* Background decoration */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-200/60" />
                <div className="absolute left-1/2 top-1/2 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-blue-200/70" />
              </div>

              {/* Connections */}
              <svg
                viewBox="0 0 470 480"
                className="pointer-events-none absolute inset-0 h-full w-full"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M235 240 L105 105 M235 240 L365 105 M235 240 L105 375 M235 240 L365 375"
                  stroke="#135BEC"
                  strokeWidth="1.5"
                  strokeDasharray="5 7"
                  strokeOpacity="0.35"
                />

                <circle cx="105" cy="105" r="4" fill="#135BEC" />
                <circle cx="365" cy="105" r="4" fill="#135BEC" />
                <circle cx="105" cy="375" r="4" fill="#135BEC" />
                <circle cx="365" cy="375" r="4" fill="#135BEC" />
              </svg>

              {/* Discover node */}
              <div className="absolute left-3 top-5 z-10 flex w-[43%] max-w-[180px] items-center gap-2.5 rounded-xl border border-uplink-border bg-white p-3 shadow-sm sm:left-5 sm:top-7 sm:gap-3 sm:p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-uplink-blue">
                  <Compass className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-uplink-text sm:text-sm">
                    Discover
                  </p>
                  <p className="mt-0.5 text-[10px] text-uplink-text-secondary sm:text-xs">
                    Campus feed
                  </p>
                </div>
              </div>

              {/* Opportunities node */}
              <div className="absolute right-3 top-5 z-10 flex w-[43%] max-w-[180px] items-center gap-2.5 rounded-xl border border-uplink-border bg-white p-3 shadow-sm sm:right-5 sm:top-7 sm:gap-3 sm:p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-uplink-blue">
                  <BriefcaseBusiness className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-uplink-text sm:text-sm">
                    Opportunities
                  </p>
                  <p className="mt-0.5 text-[10px] text-uplink-text-secondary sm:text-xs">
                    Jobs & internships
                  </p>
                </div>
              </div>

              {/* Q&A node */}
              <div className="absolute bottom-5 left-3 z-10 flex w-[43%] max-w-[180px] items-center gap-2.5 rounded-xl border border-uplink-border bg-white p-3 shadow-sm sm:bottom-7 sm:left-5 sm:gap-3 sm:p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-uplink-blue">
                  <CircleHelp className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-uplink-text sm:text-sm">
                    Q&A
                  </p>
                  <p className="mt-0.5 text-[10px] text-uplink-text-secondary sm:text-xs">
                    Learn together
                  </p>
                </div>
              </div>

              {/* Mentors node */}
              <div className="absolute bottom-5 right-3 z-10 flex w-[43%] max-w-[180px] items-center gap-2.5 rounded-xl border border-uplink-border bg-white p-3 shadow-sm sm:bottom-7 sm:right-5 sm:gap-3 sm:p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-uplink-blue">
                  <UsersRound className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-uplink-text sm:text-sm">
                    Mentors
                  </p>
                  <p className="mt-0.5 text-[10px] text-uplink-text-secondary sm:text-xs">
                    Guidance network
                  </p>
                </div>
              </div>

              {/* Central UPLINK hub */}
              <div className="absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                <div className="flex h-[90px] w-[90px] items-center justify-center rounded-full border border-blue-100 bg-white shadow-[0_8px_35px_-12px_rgba(19,91,236,0.3)] sm:h-[108px] sm:w-[108px]">
                  <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-uplink-blue text-white sm:h-[82px] sm:w-[82px]">
                    <Network className="h-8 w-8 sm:h-9 sm:w-9" strokeWidth={1.6} />
                  </div>
                </div>
                <span className="mt-3 text-sm font-extrabold tracking-[0.12em] text-uplink-text">
                  UPLINK
                </span>
                <span className="mt-1 text-[10px] text-uplink-text-secondary">
                  Connected ecosystem
                </span>
              </div>

            </div>

            <p className="mt-5 text-center text-xs leading-relaxed text-uplink-text-secondary">
              Four focused experiences, connected through one student platform.
            </p>
          </div>

          {/* RIGHT: Module explanations */}
          <div className="divide-y divide-uplink-border">

            {MODULES.map((mod) => {
              const Icon = mod.icon;

              return (
                <article
                  key={mod.id}
                  className="group py-7 first:pt-0 last:pb-0"
                >
                  <div className="flex items-start gap-4">

                    {/* Icon */}
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-uplink-blue transition-colors duration-300 group-hover:bg-uplink-blue group-hover:text-white">
                      <Icon className="h-5 w-5" strokeWidth={1.8} />
                    </div>

                    <div className="min-w-0 flex-1">

                      {/* Number and role */}
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold tracking-wider text-uplink-blue">
                          {mod.id}
                        </span>
                        <span className="text-[11px] text-slate-300">/</span>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-uplink-text-muted">
                          {mod.role}
                        </span>
                      </div>

                      {/* Title */}
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-bold tracking-tight text-uplink-text sm:text-xl">
                          {mod.title}
                        </h3>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-uplink-blue" />
                      </div>

                      {/* Summary */}
                      <p className="mt-2 text-sm leading-6 text-uplink-text-secondary">
                        {mod.summary}
                      </p>

                      {/* Details */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {mod.details.map((detail) => (
                          <span
                            key={detail}
                            className="rounded-md border border-uplink-border bg-uplink-bg-secondary px-2.5 py-1.5 text-[11px] font-medium leading-relaxed text-uplink-text-secondary"
                          >
                            {detail}
                          </span>
                        ))}
                      </div>

                    </div>
                  </div>
                </article>
              );
            })}

          </div>
        </div>
      </Container>
    </section>
  );
}
