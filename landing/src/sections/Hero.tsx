
import React from "react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PhoneMockup } from "@/components/product/PhoneMockup";
import {
  ArrowRight,
  Download,
  Sparkles,
  BriefcaseBusiness,
  MessageSquareText,
  UsersRound,
  Search,
} from "lucide-react";

const highlights = [
  {
    icon: BriefcaseBusiness,
    title: "Opportunities",
    description: "Jobs & internships",
  },
  {
    icon: MessageSquareText,
    title: "Learn",
    description: "Q&A & knowledge",
  },
  {
    icon: UsersRound,
    title: "Connect",
    description: "Mentorship",
  },
];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-white pt-28 pb-16 md:pt-32 md:pb-20 lg:pt-36">

      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-0 top-20 h-[600px] w-[600px] rounded-full bg-blue-100/50 blur-[120px]" />
        <div className="absolute left-0 top-1/2 h-80 w-80 rounded-full bg-blue-50/70 blur-[100px]" />
      </div>

      <Container className="relative">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-8">

          {/* LEFT: Hero content */}
          <div className="relative z-10 text-center lg:text-left">

            <div className="mb-7 flex justify-center lg:justify-start">
              <Badge variant="blue">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Campus Career & Professional Ecosystem
              </Badge>
            </div>

            <h1 className="mx-auto max-w-[680px] text-[2.65rem] font-extrabold leading-[1.08] tracking-[-0.045em] text-uplink-text sm:text-5xl md:text-6xl lg:mx-0 xl:text-[4.3rem]">
              Your skills.
              <br />
              Your opportunities.
              <br />
              <span className="text-uplink-blue">
                One connected
                <br />
                journey.
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-uplink-text-secondary sm:text-lg lg:mx-0">
              UPLINK brings professional profiles, career opportunities,
              knowledge sharing and mentorship together in one connected
              ecosystem for students.
            </p>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button
                href="#showcase"
                size="lg"
                variant="primary"
                className="w-full sm:w-auto"
              >
                Explore UPLINK
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button
                href="#download"
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Download className="mr-2 h-4 w-4 text-uplink-blue" />
                Get Android App
              </Button>
            </div>

            <p className="mt-2 text-xs text-slate-400 sm:text-left">
              Android release coming soon
            </p>

            {/* Product highlights */}
            <div className="mt-11 flex flex-wrap justify-center gap-x-7 gap-y-5 border-t border-slate-200/80 pt-7 lg:justify-start">
              {highlights.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-uplink-blue">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="text-left">
                      <p className="text-sm font-semibold text-uplink-text">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-xs text-uplink-text-secondary">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Two overlapping device mockups */}
          <div className="relative mx-auto w-full max-w-[580px]">

            <div className="relative h-[480px] sm:h-[560px] lg:h-[620px]">

              {/* Blue glow */}
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-100/80 blur-3xl sm:h-[470px] sm:w-[470px]" />

              {/* Connected circuit paths */}
              <svg
                viewBox="0 0 580 620"
                fill="none"
                className="pointer-events-none absolute inset-0 h-full w-full"
                aria-hidden="true"
              >
                <circle
                  cx="290"
                  cy="310"
                  r="245"
                  stroke="#135BEC"
                  strokeOpacity=".2"
                  strokeWidth="1.5"
                  strokeDasharray="5 9"
                />
                <circle
                  cx="290"
                  cy="310"
                  r="205"
                  stroke="#135BEC"
                  strokeOpacity=".12"
                  strokeWidth="1"
                />
                <path
                  d="M40 170H115V115H190"
                  stroke="#135BEC"
                  strokeOpacity=".25"
                  strokeWidth="1.5"
                />
                <path
                  d="M390 490H470V425H540"
                  stroke="#135BEC"
                  strokeOpacity=".25"
                  strokeWidth="1.5"
                />
                <circle cx="115" cy="115" r="5" fill="#135BEC" />
                <circle cx="470" cy="425" r="5" fill="#135BEC" />
                <circle cx="290" cy="65" r="5" fill="#135BEC" />
              </svg>

              {/* Rear phone: Opportunities */}
              <div className="absolute right-[5%] top-[14%] z-10 w-[195px] rotate-[8deg] drop-shadow-2xl sm:right-[7%] sm:w-[235px] lg:w-[250px]">
                <PhoneMockup
                  screenSrc="/screenshots/opportunities.png"
                  alt="UPLINK Explore Opportunities mobile screen"
                />
              </div>

              {/* Front phone: Feed */}
              <div className="absolute left-[7%] top-[4%] z-20 w-[205px] -rotate-[7deg] drop-shadow-2xl sm:left-[8%] sm:w-[245px] lg:w-[265px]">
                <PhoneMockup
                  screenSrc="/screenshots/feed.png"
                  alt="UPLINK student home feed mobile screen"
                  priority
                />
              </div>

              {/* Discover callout */}
              <div className="absolute left-0 top-[13%] z-30 hidden items-center gap-3 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-lg shadow-slate-200/50 backdrop-blur-md md:flex">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-uplink-blue">
                  <Search className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Discover
                  </p>
                  <p className="text-xs text-slate-500">
                    Real opportunities
                  </p>
                </div>
              </div>

              {/* Connect callout */}
              <div className="absolute bottom-[13%] right-0 z-30 hidden items-center gap-3 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-lg shadow-slate-200/50 backdrop-blur-md md:flex">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-uplink-blue">
                  <UsersRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Connect
                  </p>
                  <p className="text-xs text-slate-500">
                    With mentors
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
