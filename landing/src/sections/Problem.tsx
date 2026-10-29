import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FileText, Link2, Clock, Users2, HelpCircle } from "lucide-react";

const PROBLEMS = [
  {
    icon: FileText,
    title: "Scattered Academic Profiles",
    description:
      "Student skills, projects, and CGPA are trapped in static PDF resumes with no verified institutional linkage or real-time skill matching.",
  },
  {
    icon: Link2,
    title: "Fragmented Opportunities",
    description:
      "Internships, hackathons, and scholarships are dispersed across unvetted chat groups and departmental notice boards with duplicate postings.",
  },
  {
    icon: Clock,
    title: "Opaque Application Tracking",
    description:
      "External application links leave students without confirmation or progress tracking, creating uncertainty about submission lifecycles.",
  },
  {
    icon: Users2,
    title: "Inaccessible Alumni Guidance",
    description:
      "Junior students struggle to connect with experienced alumni and seniors who can provide actionable domain guidance and placement preparation.",
  },
  {
    icon: HelpCircle,
    title: "Lost Technical Discussions",
    description:
      "Valuable interview preparation and coursework doubts are lost in transient group messages instead of forming a searchable academic knowledge base.",
  },
];

export function Problem() {
  return (
    <section id="about" className="py-20 bg-uplink-bg-secondary border-y border-uplink-border">
      <Container>
        <SectionHeading
          badge="The Campus Challenge"
          title="Campus professional growth is fragmented across isolated tools"
          description="Students manage coursework, internships, doubts, and career planning across separate, uncoordinated platforms. UPLINK unifies these essentials into one disciplined ecosystem."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROBLEMS.map((prob, idx) => {
            const Icon = prob.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-lg border border-uplink-border p-6 shadow-subtle hover:border-slate-300 transition-colors"
              >
                <div className="w-10 h-10 rounded-md bg-uplink-blue-soft border border-uplink-blue/20 flex items-center justify-center text-uplink-blue mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-uplink-text mb-2">
                  {prob.title}
                </h3>
                <p className="text-sm leading-relaxed text-uplink-text-secondary">
                  {prob.description}
                </p>
              </div>
            );
          })}

          {/* Unified Solution Summary Card */}
          <div className="bg-uplink-blue text-white rounded-lg p-6 shadow-card flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                The UPLINK Solution
              </span>
              <h3 className="text-xl font-extrabold mt-2 mb-3">
                One Unified Architecture
              </h3>
              <p className="text-sm leading-relaxed text-blue-100">
                A structured mobile client connecting profiles, verified opportunities, collaborative Q&A, and direct mentorship requests in 4 focused tabs.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-blue-400/40 text-xs text-blue-200">
              Designed for transparency, auditability, and academic integrity.
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
