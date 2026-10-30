
import React from "react";
import { Container } from "@/components/ui/Container";
import {
  FileText,
  Link2,
  Clock3,
  UsersRound,
  CircleHelp,
  ArrowRight,
  Network,
} from "lucide-react";

const PROBLEMS = [
  {
    number: "01",
    icon: FileText,
    title: "Scattered Academic Profiles",
    description:
      "Academic details, skills, projects and achievements are often spread across resumes and separate platforms, making a student's professional journey difficult to view in one place.",
  },
  {
    number: "02",
    icon: Link2,
    title: "Fragmented Opportunities",
    description:
      "Internships, hackathons, scholarships and jobs appear across different websites, social groups and departmental announcements.",
  },
  {
    number: "03",
    icon: Clock3,
    title: "Disconnected Application Tracking",
    description:
      "Students may apply through different platforms and external links, making it difficult to maintain a clear overview of application progress.",
  },
  {
    number: "04",
    icon: UsersRound,
    title: "Limited Access to Guidance",
    description:
      "Finding experienced seniors, alumni and industry professionals for relevant career guidance can be difficult without a structured discovery channel.",
  },
  {
    number: "05",
    icon: CircleHelp,
    title: "Knowledge Lost in Conversations",
    description:
      "Technical doubts, interview preparation and academic discussions often disappear into chat groups instead of remaining organized and searchable.",
  },
];

export function Problem() {
  return (
    <section
      id="about"
      className="relative overflow-hidden border-y border-uplink-border bg-uplink-bg-secondary py-24 sm:py-28"
    >
      <Container>
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">

          {/* LEFT: Editorial introduction */}
          <div className="lg:sticky lg:top-32">

            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-uplink-blue">
              <span className="h-px w-6 bg-uplink-blue" />
              The Campus Challenge
            </div>

            <h2 className="mt-6 max-w-xl text-3xl font-extrabold leading-[1.15] tracking-[-0.035em] text-uplink-text sm:text-4xl lg:text-[3.25rem]">
              Student career growth is{" "}
              <span className="text-uplink-blue">
                fragmented.
              </span>
            </h2>

            <p className="mt-6 max-w-lg text-base leading-7 text-uplink-text-secondary">
              Building a professional profile, finding opportunities,
              resolving academic doubts and connecting with mentors
              often means navigating multiple disconnected platforms.
            </p>

            <div className="mt-9 flex items-center gap-3 border-l-2 border-uplink-blue pl-4">
              <div>
                <p className="text-sm font-bold text-uplink-text">
                  One connected student journey
                </p>
                <p className="mt-1 text-xs leading-relaxed text-uplink-text-secondary">
                  The need for a more organized career ecosystem.
                </p>
              </div>
            </div>

          </div>

          {/* RIGHT: Problem list */}
          <div className="overflow-hidden rounded-2xl border border-uplink-border bg-white">

            {PROBLEMS.map((problem, index) => {
              const Icon = problem.icon;

              return (
                <article
                  key={problem.number}
                  className="group relative flex gap-4 border-b border-uplink-border p-5 transition-colors duration-200 last:border-b-0 hover:bg-slate-50 sm:gap-5 sm:p-6"
                >

                  {/* Number */}
                  <span className="pt-1 font-mono text-xs font-semibold tracking-wide text-slate-400">
                    {problem.number}
                  </span>

                  {/* Icon */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-uplink-blue transition-colors duration-200 group-hover:bg-uplink-blue group-hover:text-white">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold tracking-tight text-uplink-text sm:text-lg">
                      {problem.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-uplink-text-secondary">
                      {problem.description}
                    </p>
                  </div>

                  <div className="hidden shrink-0 pt-1 sm:block">
                    <ArrowRight className="h-4 w-4 text-slate-300 transition-all duration-200 group-hover:translate-x-1 group-hover:text-uplink-blue" />
                  </div>

                </article>
              );
            })}

          </div>
        </div>

        {/* BOTTOM: UPLINK solution banner */}
        <div className="relative mt-12 overflow-hidden rounded-2xl bg-uplink-blue p-7 text-white sm:p-10">

          {/* Decorative graphic */}
          <div className="pointer-events-none absolute -right-16 -top-28 h-80 w-80 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-6 -top-16 h-60 w-60 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-36 right-36 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-7 md:flex-row md:items-center md:justify-between">

            <div className="max-w-2xl">
              <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
                <Network className="h-4 w-4" />
                Introducing UPLINK
              </div>

              <h3 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
                Different needs.
                <br className="hidden sm:block" /> One connected ecosystem.
              </h3>

              <p className="mt-4 max-w-xl text-sm leading-7 text-blue-100 sm:text-base">
                UPLINK is designed to bring student profiles, career
                opportunities, structured knowledge sharing and mentorship
                together through four focused experiences.
              </p>
            </div>

            {/* Four pillars */}
            <div className="relative flex shrink-0 flex-wrap gap-2 md:max-w-[250px] md:justify-end">
              {["Feed", "Jobs", "Q&A", "Mentors"].map((item) => (
                <span
                  key={item}
                  className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm"
                >
                  {item}
                </span>
              ))}
            </div>

          </div>
        </div>

      </Container>
    </section>
  );
}
