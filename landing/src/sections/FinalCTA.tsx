import React from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";
import { Download, Compass, Smartphone, ArrowRight } from "lucide-react";

export function FinalCTA() {
  const hasDownloadUrl = Boolean(siteConfig.androidDownloadUrl);

  return (
    <section id="download" className="py-20 bg-uplink-blue text-white relative overflow-hidden">
      {/* Background Decorative Graphic */}
      <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
        <svg width="800" height="400" viewBox="0 0 800 400" fill="none">
          <circle cx="400" cy="200" r="180" stroke="white" strokeWidth="2" strokeDasharray="8 8" />
          <circle cx="400" cy="200" r="300" stroke="white" strokeWidth="1.5" strokeOpacity="0.5" />
        </svg>
      </div>

      <Container className="relative z-10 text-center max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-blue-100 mb-6 border border-white/20">
          <Smartphone className="w-3.5 h-3.5" />
          <span>Android Mobile Application</span>
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
          Your next opportunity starts here.
        </h2>

        <p className="mt-4 text-base leading-relaxed text-blue-100 sm:text-lg max-w-xl mx-auto">
          Join the unified campus ecosystem built for student career advancement, verified skill matching, and alumni mentorship.
        </p>

        {/* Action Controls */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          {hasDownloadUrl ? (
            <Button
              href={siteConfig.androidDownloadUrl}
              external
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto bg-white text-uplink-blue hover:bg-blue-50 border-white font-bold"
            >
              <Download className="w-4 h-4 mr-2" />
              <span>Download Android APK</span>
            </Button>
          ) : (
            <div className="rounded-lg border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              <span>Android Release Coming Soon</span>
            </div>
          )}

          <Button
            href="#showcase"
            size="lg"
            variant="outline"
            className="w-full sm:w-auto border-white/30 text-white bg-transparent hover:bg-white/10 hover:border-white"
          >
            <span>Explore Platform Showcase</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <p className="mt-8 text-xs text-blue-200">
          Student Mobile MVP (React Native 0.88) • Verified & Build Tested
        </p>
      </Container>
    </section>
  );
}
