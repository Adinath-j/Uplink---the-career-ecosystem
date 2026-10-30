import React from "react";
import { Hero } from "@/sections/Hero";
import { Problem } from "@/sections/Problem";
import { Ecosystem } from "@/sections/Ecosystem";
import { Features } from "@/sections/Features";
import { ProductShowcase } from "@/sections/ProductShowcase";
import { HowItWorks } from "@/sections/HowItWorks";
import { Technology } from "@/sections/Technology";
import { FinalCTA } from "@/sections/FinalCTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Problem />
      <Ecosystem />
      <Features />
      <ProductShowcase />
      <HowItWorks />
      <Technology />
      <FinalCTA />
    </>
  );
}
