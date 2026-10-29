"use client";

import React, { useState } from "react";
import { Compass, Briefcase, HelpCircle, Users, CheckCircle2, ChevronRight } from "lucide-react";
import { PhoneMockup } from "./PhoneMockup";
import { cn } from "@/lib/utils";

const SCREENS = [
  {
    id: "home",
    label: "Discover Feed",
    badge: "Core Experience",
    title: "Discover Campus Activity & Verified Openings",
    description:
      "A distraction-free dashboard showing verified opportunities, campus tech symposium notices, and academic announcements without artificial recommendation scores or fake ATS percentages.",
    icon: Compass,
    screenSrc: "/screenshots/discover-feed.svg",
    features: [
      "No repeated brand headings or fake metrics",
      "Immediate search entry point across roles & skills",
      "Curated campus notices and conference announcements",
    ],
  },
  {
    id: "jobs",
    label: "Explore Opportunities",
    badge: "10 Campus Categories",
    title: "Internships, Hackathons, and Placements",
    description:
      "Structured listings covering 10 distinct student opportunity categories with work-mode filters (Remote, Hybrid, On-site) and auditable application lifecycles.",
    icon: Briefcase,
    screenSrc: "/screenshots/explore-jobs.svg",
    features: [
      "10 verified categories (Internships, Hackathons, Scholarships, etc.)",
      "Direct internal applications & explicit external handoffs",
      "Real-time bookmarking and application stage tracking",
    ],
  },
  {
    id: "qa",
    label: "Structured Q&A",
    badge: "Knowledge Sharing",
    title: "Peer & Senior Academic Problem Solving",
    description:
      "Structured doubt resolution categorized by technical topics (System Design, Cloud, Web, MLOps) featuring single-signal Same-Doubt upvotes and accepted answer verification.",
    icon: HelpCircle,
    screenSrc: "/screenshots/qa-feed.svg",
    features: [
      "4 specialized tabs: For You, Unanswered, Trending, My Doubts",
      "Single-vote Same-Doubt counter prevents vote manipulation",
      "Verified accepted answers from experienced seniors",
    ],
  },
  {
    id: "mentors",
    label: "Mentor Directory",
    badge: "Guidance Network",
    title: "Alumni & Industry Guidance on Demand",
    description:
      "Connect with alumni and industry engineers at leading technology firms. View verified profiles, domain specialties, and schedule structured mentoring sessions.",
    icon: Users,
    screenSrc: "/screenshots/mentors-feed.svg",
    features: [
      "Domain filtering across Software, Cloud, AI/ML, and Placement",
      "Authentic industry bios and verified graduation batch context",
      "Structured session requests with topic agendas",
    ],
  },
];

export function ProductShowcaseInteractive() {
  const [activeTab, setActiveTab] = useState(0);
  const activeScreen = SCREENS[activeTab];

  return (
    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
      {/* Left Column: Screen Selector & Details */}
      <div className="lg:col-span-7">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 p-1.5 bg-uplink-bg-secondary rounded-lg border border-uplink-border mb-8">
          {SCREENS.map((s, index) => {
            const Icon = s.icon;
            const isSelected = activeTab === index;
            return (
              <button
                key={s.id}
                onClick={() => setActiveTab(index)}
                className={cn(
                  "flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-uplink-blue",
                  isSelected
                    ? "bg-white text-uplink-blue shadow-subtle border border-uplink-border/60"
                    : "text-uplink-text-secondary hover:text-uplink-text"
                )}
              >
                <Icon className={cn("w-4 h-4", isSelected ? "text-uplink-blue" : "text-uplink-text-muted")} />
                <span className="truncate">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Screen Details */}
        <div className="bg-white rounded-xl border border-uplink-border p-6 sm:p-8 shadow-card">
          <div className="inline-flex items-center gap-2 rounded-full border border-uplink-blue/20 bg-uplink-blue-soft px-3 py-1 text-xs font-semibold text-uplink-blue">
            {activeScreen.badge}
          </div>
          <h3 className="mt-4 text-2xl font-bold tracking-tight text-uplink-text sm:text-3xl">
            {activeScreen.title}
          </h3>
          <p className="mt-3 text-base leading-relaxed text-uplink-text-secondary">
            {activeScreen.description}
          </p>

          <div className="mt-6 space-y-3 pt-6 border-t border-slate-100">
            {activeScreen.features.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-uplink-blue shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-uplink-text">{feat}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-uplink-text-muted">
              Screen {activeTab + 1} of {SCREENS.length}
            </span>
            <div className="flex gap-1.5">
              {SCREENS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  aria-label={`View screen ${i + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    activeTab === i ? "w-6 bg-uplink-blue" : "w-1.5 bg-slate-300 hover:bg-slate-400"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Phone Mockup */}
      <div className="lg:col-span-5 flex justify-center">
        <div className="relative">
          {/* Subtle Ambient Glow */}
          <div className="absolute -inset-4 rounded-full bg-uplink-blue/5 blur-2xl" />
          <PhoneMockup
            screenSrc={activeScreen.screenSrc}
            alt={`${activeScreen.label} screen`}
          />
        </div>
      </div>
    </div>
  );
}
