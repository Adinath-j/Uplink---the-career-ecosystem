import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const runtime = "edge";
export const alt = "UPLINK — Connecting Potential";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#FFFFFF",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
          border: "16px solid #135BEC",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              background: "#135BEC",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "36px",
              fontWeight: "bold",
            }}
          >
            U
          </div>
          <span
            style={{
              fontSize: "42px",
              fontWeight: 800,
              color: "#111827",
              letterSpacing: "-0.04em",
            }}
          >
            UPLINK
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <span
            style={{
              fontSize: "20px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#135BEC",
            }}
          >
            Connecting Potential
          </span>
          <span
            style={{
              fontSize: "56px",
              fontWeight: 800,
              color: "#111827",
              lineHeight: 1.15,
              maxWidth: "960px",
              letterSpacing: "-0.03em",
            }}
          >
            Unified Campus Career & Professional Ecosystem
          </span>
          <span
            style={{
              fontSize: "24px",
              color: "#64748B",
              maxWidth: "880px",
            }}
          >
            Connecting verified student profiles, 10 opportunity categories, structured peer Q&A, and alumni mentorship.
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "30px",
            borderTop: "2px solid #E5E7EB",
            width: "100%",
            paddingTop: "30px",
            fontSize: "18px",
            color: "#94A3B8",
            fontWeight: 600,
          }}
        >
          <span>React Native 0.88 Mobile Client</span>
          <span>•</span>
          <span>Spring Boot Modular Monolith (Planned)</span>
          <span>•</span>
          <span>100% Verified Campus Tracking</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
