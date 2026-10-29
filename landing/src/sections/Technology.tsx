import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Smartphone, Server, Database, ShieldCheck, Cpu } from "lucide-react";

export function Technology() {
  return (
    <section id="technology" className="py-20 bg-white border-t border-uplink-border">
      <Container>
        <SectionHeading
          badge="Platform Architecture"
          title="Modern technology designed for long-term scalability"
          description="Built with a strict separation between client-side user experience, core transactional services, and future specialized processing capabilities."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card 1: Mobile Client */}
          <div className="bg-uplink-bg-secondary rounded-xl border border-uplink-border p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-uplink-blue-soft border border-uplink-blue/20 flex items-center justify-center text-uplink-blue">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-uplink-text">Mobile Application</h3>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Implemented (Milestone 1)
                </span>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-uplink-text-secondary mb-6">
              High-performance React Native 0.88 native client utilizing the New Architecture (Fabric & TurboModules), React 19, TypeScript, Reanimated 4, and Lucide vector icons.
            </p>

            <ul className="space-y-2.5 text-xs text-uplink-text font-medium pt-6 border-t border-uplink-border">
              <li>• Single root SafeAreaProvider & NavigationContainer</li>
              <li>• Exactly 4 bottom tabs (Home, Jobs, Q&A, Mentors)</li>
              <li>• Decoupled Zustand state management</li>
              <li>• Native Android Gradle debug & release verification</li>
            </ul>
          </div>

          {/* Card 2: Core Backend */}
          <div className="bg-uplink-bg-secondary rounded-xl border border-uplink-border p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-uplink-text">Core Backend API</h3>
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                  Planned Architecture
                </span>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-uplink-text-secondary mb-6">
              A Spring Boot 3 modular monolith delivering secure REST endpoints (`/api/v1/*`), stateless JWT authentication, and Flyway database migrations.
            </p>

            <ul className="space-y-2.5 text-xs text-uplink-text font-medium pt-6 border-t border-uplink-border">
              <li>• Spring Security role-based access (Student, Recruiter, Admin)</li>
              <li>• Modular packages: auth, profile, opportunity, application, qa</li>
              <li>• Spring Data JPA & Hibernate persistence</li>
              <li>• Mobile client strictly communicates with API controllers only</li>
            </ul>
          </div>

          {/* Card 3: Database & Future Services */}
          <div className="bg-uplink-bg-secondary rounded-xl border border-uplink-border p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-uplink-text">Data & Future Services</h3>
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  Roadmap & Boundaries
                </span>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-uplink-text-secondary mb-6">
              PostgreSQL database hosted through Supabase. Advanced AI, OCR resume extraction, and ATS match analysis are strictly planned as future isolated services.
            </p>

            <ul className="space-y-2.5 text-xs text-uplink-text font-medium pt-6 border-t border-uplink-border">
              <li>• Strict boundary: Mobile NEVER connects directly to Supabase</li>
              <li>• Relational integrity with foreign keys & indexes</li>
              <li>• Auxiliary FastAPI services planned for heavy compute (Milestone 4)</li>
              <li>• Zero premature microservice complexity</li>
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
