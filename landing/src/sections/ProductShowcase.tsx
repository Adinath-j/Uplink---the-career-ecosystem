import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductShowcaseInteractive } from "@/components/product/ProductShowcaseInteractive";

export function ProductShowcase() {
  return (
    <section id="showcase" className="py-20 bg-white border-t border-uplink-border">
      <Container>
        <SectionHeading
          badge="Product Demonstration"
          title="Designed for clarity, focus, and authentic campus progress"
          description="Interactive previews of the real UPLINK mobile application screens. Tap through each experience to view genuine data structures, cards, and workflows."
        />

        <ProductShowcaseInteractive />
      </Container>
    </section>
  );
}
