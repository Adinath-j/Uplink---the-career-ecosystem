
import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

import {
  Smartphone,
  Server,
  Database,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Check,
  Layers,
  Workflow,
  Code2,
} from "lucide-react";

const ARCHITECTURE = [
  {
    number: "01",
    title: "Mobile Application",
    subtitle: "Student Experience",
    status: "Implemented",
    statusStyle: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: Smartphone,
    description:
      "A cross-platform mobile client focused on delivering a consistent and accessible student experience.",
    technologies: [
      "React Native 0.88",
      "React 19",
      "TypeScript",
      "React Navigation",
      "Zustand",
      "Reanimated",
    ],
    capabilities: [
      "Four focused student navigation tabs",
      "Modular screen and component architecture",
      "Centralized state management",
    ],
  },
  {
    number: "02",
    title: "Core Backend API",
    subtitle: "Business Logic Layer",
    status: "Planned",
    statusStyle: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Server,
    description:
      "A modular Spring Boot backend designed to manage authentication, student profiles, opportunities and platform workflows.",
    technologies: [
      "Spring Boot 3",
      "Spring Security",
      "REST API",
      "Spring Data JPA",
      "Hibernate",
      "Flyway",
    ],
    capabilities: [
      "JWT-based authentication",
      "Role-based access control",
      "Modular business logic and API validation",
    ],
  },
  {
    number: "03",
    title: "Data & Future Services",
    subtitle: "Persistence & Extensions",
    status: "Planned",
    statusStyle: "bg-slate-100 text-slate-600 border-slate-200",
    icon: Database,
    description:
      "A relational data foundation with room for specialized services as the platform's processing requirements evolve.",
    technologies: [
      "PostgreSQL",
      "Supabase",
      "FastAPI",
      "Object Storage",
    ],
    capabilities: [
      "Relational integrity and database indexing",
      "Backend-controlled data access",
      "Future OCR and document processing",
    ],
  },
];

export function Technology() {
  return (
    <section
      id="technology"
      className="relative overflow-hidden border-t border-uplink-border bg-uplink-bg-secondary py-24 sm:py-28"
    >
      <Container>

        {/* Section heading */}
        <SectionHeading
          badge="PLATFORM ARCHITECTURE"
          title="Built on a foundation designed to scale."
          description="A modular architecture that separates the mobile experience, core business logic and data infrastructure, while keeping room for future capabilities."
        />

        {/* Architecture flow */}
        <div className="mt-14">

          <div className="mb-5 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-uplink-text-secondary">
              System architecture
            </p>

            <div className="flex items-center gap-2 text-xs text-uplink-text-muted">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Implemented</span>
              <span className="ml-2 h-2 w-2 rounded-full bg-amber-500" />
              <span>Planned</span>
            </div>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">

            {ARCHITECTURE.map((layer, index) => {
              const Icon = layer.icon;

              return (
                <React.Fragment key={layer.number}>

                  {/* Architecture layer */}
                  <article className="group relative flex flex-col rounded-xl border border-uplink-border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-uplink-blue/30 hover:shadow-[0_16px_40px_-25px_rgba(19,91,236,0.25)] sm:p-7">

                    {/* Number and status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-semibold tracking-wider text-slate-400">
                        LAYER {layer.number}
                      </span>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${layer.statusStyle}`}
                      >
                        {layer.status}
                      </span>
                    </div>

                    {/* Icon */}
                    <div className="mt-7 flex h-12 w-12 items-center justify-center rounded-xl border border-uplink-blue/15 bg-uplink-blue-soft text-uplink-blue transition-colors duration-300 group-hover:bg-uplink-blue group-hover:text-white">
                      <Icon className="h-6 w-6" strokeWidth={1.7} />
                    </div>

                    {/* Title */}
                    <div className="mt-6">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-uplink-blue">
                        {layer.subtitle}
                      </p>

                      <h3 className="mt-2 text-xl font-bold tracking-tight text-uplink-text">
                        {layer.title}
                      </h3>

                      <p className="mt-3 min-h-[88px] text-sm leading-6 text-uplink-text-secondary">
                        {layer.description}
                      </p>
                    </div>

                    {/* Technology stack */}
                    <div className="mt-6 border-t border-uplink-border pt-5">
                      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-uplink-text-muted">
                        Technology Stack
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {layer.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="rounded-md border border-uplink-border bg-slate-50 px-2.5 py-1.5 text-[11px] font-medium text-slate-600"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Capabilities */}
                    <div className="mt-6 border-t border-uplink-border pt-5">
                      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-uplink-text-muted">
                        Architecture Focus
                      </p>

                      <ul className="space-y-3">
                        {layer.capabilities.map((capability) => (
                          <li
                            key={capability}
                            className="flex items-start gap-2.5 text-xs leading-relaxed text-uplink-text-secondary"
                          >
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-uplink-blue" />
                            <span>{capability}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </article>

                  {/* Connector */}
                  {index !== ARCHITECTURE.length - 1 && (
                    <div className="hidden items-center justify-center lg:flex">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-100 bg-white text-uplink-blue shadow-sm">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  )}

                </React.Fragment>
              );
            })}

          </div>
        </div>

        {/* Architecture principles */}
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">

          <div className="flex items-start gap-4 rounded-xl border border-uplink-border bg-white p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-uplink-blue">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-uplink-text">
                Controlled Data Access
              </h4>
              <p className="mt-1 text-xs leading-5 text-uplink-text-secondary">
                Application data is accessed through the backend API, not direct mobile database operations.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-xl border border-uplink-border bg-white p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-uplink-blue">
              <Layers className="h-5 w-5" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-uplink-text">
                Modular by Design
              </h4>
              <p className="mt-1 text-xs leading-5 text-uplink-text-secondary">
                A modular monolith keeps core services organized without premature microservice complexity.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-xl border border-uplink-border bg-white p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-uplink-blue">
              <Workflow className="h-5 w-5" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-uplink-text">
                Extensible Architecture
              </h4>
              <p className="mt-1 text-xs leading-5 text-uplink-text-secondary">
                Specialized processing services can be introduced independently when future workloads require them.
              </p>
            </div>
          </div>

        </div>

        {/* Future development note */}
        <div className="mt-8 flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-uplink-blue">
              <Cpu className="h-5 w-5" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-uplink-text">
                Designed for future capabilities
              </h4>
              <p className="mt-1 max-w-2xl text-xs leading-6 text-uplink-text-secondary">
                Document processing, OCR and specialized AI workloads are planned extensions, not prerequisites for the core platform.
              </p>
            </div>
          </div>

          <span className="shrink-0 text-xs font-semibold text-uplink-blue">
            Future Roadmap
          </span>
        </div>

      </Container>
    </section>
  );
}
