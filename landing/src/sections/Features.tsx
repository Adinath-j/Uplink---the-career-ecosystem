import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  UserCheck,
  Briefcase,
  Bookmark,
  Layers,
  HelpCircle,
  ThumbsUp,
  Users,
  Bell,
} from "lucide-react";

const FEATURES = [
  {
    icon: UserCheck,
    title: "Student Academic Profiles",
    desc: "Complete academic records including institution, department, graduation year, CGPA, verified skill tags, projects, and certifications.",
  },
  {
    icon: Briefcase,
    title: "10 Opportunity Categories",
    desc: "Full coverage across Internships, Jobs, Hackathons, Competitions, Scholarships, Workshops, Certifications, Training, Research, and Apprenticeships.",
  },
  {
    icon: Bookmark,
    title: "Offline-First Bookmarking",
    desc: "Save opportunities to your local device with AsyncStorage persistence for instant retrieval even without an active internet connection.",
  },
  {
    icon: Layers,
    title: "Application Stage Tracking",
    desc: "Auditable status lifecycles (Applied, In Review, Shortlisted, Offered, Closed) with explicit external-link handoffs.",
  },
  {
    icon: HelpCircle,
    title: "Structured Q&A Feed",
    desc: "4 specialized feed views (For You, Unanswered, Trending, My Questions) with technical taxonomy tags and clean question detail views.",
  },
  {
    icon: ThumbsUp,
    title: "Same-Doubt Interaction",
    desc: "Single-signal doubt escalation allowing students to surface shared blockers without creating duplicate forum questions.",
  },
  {
    icon: Users,
    title: "Verified Mentor Directory",
    desc: "Directory of alumni and senior industry practitioners with verified graduation context and direct structured session booking requests.",
  },
  {
    icon: Bell,
    title: "In-App Notifications",
    desc: "Centralized notification feed for application status progressions, mentor session confirmations, and urgent campus updates.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 bg-uplink-bg-secondary border-t border-uplink-border">
      <Container>
        <SectionHeading
          badge="Product Capabilities"
          title="Engineered for student professional acceleration"
          description="Every capability in UPLINK is strictly mapped to genuine student needs, verified against the mobile application source code."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-lg border border-uplink-border p-6 shadow-subtle hover:shadow-card transition-shadow duration-200"
              >
                <div className="w-10 h-10 rounded-md bg-uplink-blue-soft border border-uplink-blue/20 flex items-center justify-center text-uplink-blue mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-uplink-text mb-2">
                  {feat.title}
                </h3>
                <p className="text-xs leading-relaxed text-uplink-text-secondary">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
