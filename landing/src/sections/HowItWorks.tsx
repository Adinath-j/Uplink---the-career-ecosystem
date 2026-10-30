
import React from "react";
import {
  UserRound,
  Search,
  MessageCircle,
  TrendingUp,
} from "lucide-react";

import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const STEPS = [
  {
    step: "01",
    title: "Build Your Academic Profile",
    desc: "Complete your student profile with institution credentials, department, graduation batch, CGPA, and skill tags.",
    icon: UserRound,
  },
  {
    step: "02",
    title: "Discover Opportunities",
    desc: "Explore opportunities across internships, hackathons, scholarships, research roles, and other student categories.",
    icon: Search,
  },
  {
    step: "03",
    title: "Learn & Connect",
    desc: "Resolve academic doubts through structured Q&A and discover alumni and industry mentors for career guidance.",
    icon: MessageCircle,
  },
  {
    step: "04",
    title: "Track & Grow",
    desc: "Keep track of your applications and follow your progress throughout your professional journey.",
    icon: TrendingUp,
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden border-t border-uplink-border bg-uplink-bg-secondary py-24 sm:py-28"
    >
      <Container>

        <SectionHeading
          badge="HOW IT WORKS"
          title="Four steps. One connected journey."
          description="From building your professional profile to discovering opportunities, learning with peers and connecting with mentors."
        />

        <div className="relative mt-16 lg:mt-20">

          {/* Horizontal connector - desktop */}
          <div className="absolute left-[12.5%] right-[12.5%] top-7 hidden border-t border-dashed border-blue-200 lg:block" />

          {/* Vertical connector - mobile */}
          <div className="absolute bottom-12 left-[27px] top-8 w-px bg-blue-200 md:hidden" />

          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-x-12 md:gap-y-14 lg:grid-cols-4 lg:gap-8">

            {STEPS.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.step}
                  className="relative z-10 grid grid-cols-[56px_minmax(0,1fr)] items-start gap-5 md:block lg:text-center"
                >

                  {/* Icon */}
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-white text-uplink-blue shadow-sm lg:mx-auto">
                    <Icon
                      className="h-6 w-6"
                      strokeWidth={1.8}
                    />
                  </div>

                  <div className="min-w-0 lg:mt-5">

                    {/* Step number */}
                    <span className="mb-2 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold tracking-wider text-uplink-blue">
                      STEP {item.step}
                    </span>

                    {/* Title */}
                    <h3 className="text-lg font-bold tracking-tight text-uplink-text sm:text-xl">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="mx-auto mt-3 max-w-xs text-sm leading-7 text-uplink-text-secondary">
                      {item.desc}
                    </p>

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
