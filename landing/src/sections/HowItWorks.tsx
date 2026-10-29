import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const STEPS = [
  {
    step: "01",
    title: "Build Your Academic Profile",
    desc: "Complete your student profile with institution credentials, department, graduation batch, CGPA, and verified skill tags.",
  },
  {
    step: "02",
    title: "Discover Verified Opportunities",
    desc: "Filter through 10 categories—from internships and hackathons to research roles—with remote, hybrid, and on-site options.",
  },
  {
    step: "03",
    title: "Learn & Connect with Mentors",
    desc: "Resolve academic blockers in topic-organized Q&A and schedule 1-on-1 career guidance sessions with verified alumni mentors.",
  },
  {
    step: "04",
    title: "Track Applications & Grow",
    desc: "Monitor your internal application progress across screening, interviews, and offers through a transparent status lifecycle.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-uplink-bg-secondary border-t border-uplink-border">
      <Container>
        <SectionHeading
          badge="The Student Journey"
          title="A clear, structured path from campus to industry"
          description="UPLINK guides students through four continuous phases of academic verification, opportunity discovery, peer learning, and professional placement."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {STEPS.map((s, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg border border-uplink-border p-6 shadow-subtle flex flex-col justify-between relative z-10 hover:border-uplink-blue/50 transition-colors"
            >
              <div>
                <span className="text-3xl font-extrabold text-uplink-blue/20 font-mono">
                  {s.step}
                </span>
                <h3 className="text-lg font-bold text-uplink-text mt-3 mb-2">
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed text-uplink-text-secondary">
                  {s.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-uplink-blue">
                <span>Phase {idx + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
