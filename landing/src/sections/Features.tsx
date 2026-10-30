
import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

import {
  UserCheck,
  Briefcase,
  Bookmark,
  Layers,
  HelpCircle,
  ThumbsUp,
  Users,
  Bell,
  ArrowUpRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: UserCheck,
    number: "01",
    title: "Student Academic Profiles",
    desc: "Complete academic records including institution, department, graduation year, CGPA, verified skill tags, projects, and certifications.",
    featured: true,
  },
  {
    icon: Briefcase,
    number: "02",
    title: "10 Opportunity Categories",
    desc: "Explore internships, jobs, hackathons, competitions, scholarships, workshops, certifications, training, research, and apprenticeships.",
    featured: true,
  },
  {
    icon: Bookmark,
    number: "03",
    title: "Offline-First Bookmarking",
    desc: "Save opportunities locally with AsyncStorage persistence for quick access, even without an active internet connection.",
  },
  {
    icon: Layers,
    number: "04",
    title: "Application Tracking",
    desc: "Follow application progress through stages such as Applied, In Review, Shortlisted, Offered, and Closed, with explicit external-link handoffs.",
  },
  {
    icon: HelpCircle,
    number: "05",
    title: "Structured Q&A Feed",
    desc: "Explore For You, Unanswered, Trending, and My Questions views, with technical topic tags and dedicated question details.",
  },
  {
    icon: ThumbsUp,
    number: "06",
    title: "Same-Doubt Interaction",
    desc: "Help surface shared questions and academic blockers through a single-signal interaction, without creating duplicate discussions.",
  },
  {
    icon: Users,
    number: "07",
    title: "Mentor Directory",
    desc: "Discover alumni and industry professionals through profiles, domain specialties, and structured mentoring requests.",
    featured: true,
  },
  {
    icon: Bell,
    number: "08",
    title: "In-App Notifications",
    desc: "Stay informed about relevant application updates, mentor interactions, and campus announcements.",
    featured: true,
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="relative overflow-hidden border-t border-uplink-border bg-white py-24 sm:py-28"
    >
      <Container>

        {/* Section heading */}
        <SectionHeading
          badge="PRODUCT CAPABILITIES"
          title="Everything students need to move forward."
          description="One connected ecosystem bringing academic profiles, career opportunities, knowledge sharing, and mentorship together."
        />

        {/* Feature grid */}
        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">

          {FEATURES.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.number}
                className={cn(
                  "group relative overflow-hidden rounded-xl border border-uplink-border bg-white p-6 transition-all duration-300",
                  "hover:-translate-y-1 hover:border-uplink-blue/30 hover:shadow-[0_12px_35px_-18px_rgba(19,91,236,0.22)]",
                  feature.featured &&
                  "lg:col-span-2 lg:grid lg:grid-cols-[auto_minmax(0,1fr)] lg:items-start lg:gap-6 lg:p-8"
                )}
              >
                {/* Icon */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-uplink-blue/10 bg-uplink-blue-soft text-uplink-blue transition-colors duration-300 group-hover:bg-uplink-blue group-hover:text-white">
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </div>

                <div className={cn(feature.featured && "lg:min-w-0")}>
                  {/* Number and arrow */}
                  <div className="mb-5 mt-5 flex items-center justify-between lg:mt-0">
                    <span className="text-xs font-semibold tracking-[0.16em] text-slate-400">
                      {feature.number} / 08
                    </span>

                    <ArrowUpRight className="h-4 w-4 text-slate-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-uplink-blue" />
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold leading-snug tracking-tight text-uplink-text sm:text-lg">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-3 text-sm leading-6 text-uplink-text-secondary">
                    {feature.desc}
                  </p>
                </div>

                {/* Subtle corner decoration */}
                <div className="pointer-events-none absolute -bottom-12 -right-12 h-28 w-28 rounded-full border border-blue-100/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </article>
            );
          })}

        </div>
      </Container>
    </section>
  );
}
