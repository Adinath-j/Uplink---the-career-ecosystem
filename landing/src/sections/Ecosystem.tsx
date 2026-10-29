import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Compass, Briefcase, HelpCircle, Users, CheckCircle } from "lucide-react";

const MODULES = [
  {
    icon: Compass,
    title: "1. Discover & Home",
    role: "Central Campus Pulse",
    summary:
      "A clean, information-first feed displaying verified campus events, conferences, and featured openings without fabricated recommendation percentages.",
    details: [
      "Compact top toolbar with bookmark & notification access",
      "Immediate search entry point across roles & skills",
      "Notice board for departmental symposiums & hackathons",
    ],
  },
  {
    icon: Briefcase,
    title: "2. Explore Opportunities",
    role: "Career Hub",
    summary:
      "Full spectrum opportunity listings covering 10 verified campus categories with work-mode filters (Remote, Hybrid, On-site) and direct application tracking.",
    details: [
      "10 categories: Internships, Jobs, Hackathons, Scholarships, etc.",
      "Internal application management & explicit external handoffs",
      "Centralized 'My Applications' stage tracker",
    ],
  },
  {
    icon: HelpCircle,
    title: "3. Structured Q&A",
    role: "Knowledge Sharing",
    summary:
      "Topic-organized student academic problem solving with 4 feed tabs, single-signal Same-Doubt upvotes, and verified accepted answers.",
    details: [
      "Tabs: For You, Unanswered, Trending, My Questions",
      "Single-vote Same-Doubt prevents algorithmic manipulation",
      "Structured topic tags: System Design, Web, Cloud, AI",
    ],
  },
  {
    icon: Users,
    title: "4. Mentor Directory",
    role: "Guidance Network",
    summary:
      "Verified alumni and industry engineers accessible through structured booking requests with domain specialties and authentic graduation context.",
    details: [
      "Domain filtering across Software, Cloud, AI/ML, and Placement",
      "Authentic career roadmaps and verified industry backgrounds",
      "Structured session requests with specific student agendas",
    ],
  },
];

export function Ecosystem() {
  return (
    <section id="ecosystem" className="py-20 bg-white">
      <Container>
        <SectionHeading
          badge="One Connected Ecosystem"
          title="Four core student pillars, seamlessly interconnected"
          description="UPLINK organizes student career acceleration into exactly four bottom navigation tabs. Student profile is accessed via the header avatar, maintaining focus and clarity."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {MODULES.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-uplink-border p-8 shadow-card hover:border-uplink-blue/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-lg bg-uplink-blue-soft border border-uplink-blue/20 flex items-center justify-center text-uplink-blue">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-uplink-blue bg-uplink-blue-soft/60 px-3 py-1 rounded-full">
                    {mod.role}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-uplink-text mb-3">
                  {mod.title}
                </h3>
                <p className="text-sm leading-relaxed text-uplink-text-secondary mb-6">
                  {mod.summary}
                </p>

                <div className="space-y-2.5 pt-6 border-t border-slate-100">
                  {mod.details.map((item, itemIdx) => (
                    <div key={itemIdx} className="flex items-start gap-2.5 text-xs text-uplink-text">
                      <CheckCircle className="w-4 h-4 text-uplink-blue shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
