import React from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PhoneMockup } from "@/components/product/PhoneMockup";
import { ArrowRight, Download, Sparkles, ShieldCheck } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28 lg:pt-44">
      {/* Background Subtle Circuit Pattern */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-70">
        <Image
          src="/images/hero-circuit.svg"
          alt=""
          width={800}
          height={800}
          priority
          className="w-full max-w-4xl object-contain"
        />
      </div>

      <Container className="relative z-10">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Headline & Value Proposition */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 mb-6">
              <Badge variant="blue">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Campus Career & Professional Ecosystem
              </Badge>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-uplink-text sm:text-5xl md:text-6xl lg:leading-[1.1]">
              Your skills. <br className="hidden sm:inline" />
              Your opportunities. <br />
              <span className="text-uplink-blue">One connected journey.</span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-uplink-text-secondary sm:text-xl max-w-2xl mx-auto lg:mx-0">
              UPLINK brings verified student profiles, career opportunities across 10 campus categories, structured peer Q&A, and alumni mentorship together in one unified ecosystem.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button href="#showcase" size="lg" variant="primary" className="w-full sm:w-auto">
                <span>Explore UPLINK</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>

              <Button href="#download" size="lg" variant="outline" className="w-full sm:w-auto">
                <Download className="w-4 h-4 mr-2 text-uplink-blue" />
                <span>Get Android App</span>
              </Button>
            </div>

            {/* Credibility Notes (Strictly truthful, no fake metrics) */}
            <div className="mt-10 pt-8 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-left max-w-lg mx-auto lg:mx-0">
              <div>
                <div className="text-xl font-bold text-uplink-text">10</div>
                <div className="text-xs text-uplink-text-secondary mt-0.5">Opportunity Types</div>
              </div>
              <div>
                <div className="text-xl font-bold text-uplink-text">4 Tabs</div>
                <div className="text-xs text-uplink-text-secondary mt-0.5">Focused UI</div>
              </div>
              <div>
                <div className="text-xl font-bold text-uplink-text">100% Verified</div>
                <div className="text-xs text-uplink-text-secondary mt-0.5">Auditable Tracking</div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Phone Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm">
              {/* Subtle Blue Glow behind device */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-uplink-blue/10 blur-3xl pointer-events-none" />
              <PhoneMockup
                screenSrc="/screenshots/discover-feed.svg"
                alt="UPLINK Discover Home Feed on mobile"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
