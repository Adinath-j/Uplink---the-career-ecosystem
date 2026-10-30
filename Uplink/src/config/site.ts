export const siteConfig = {
  name: "UPLINK",
  tagline: "Connecting Potential",
  title: "UPLINK — Connecting Potential | Student Career and Opportunity Platform",
  description:
    "UPLINK connects students with verified academic profiles, career opportunities, structured Q&A, and alumni mentorship through one unified campus ecosystem.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://uplink-campus.vercel.app",
  androidDownloadUrl: process.env.NEXT_PUBLIC_ANDROID_DOWNLOAD_URL || "",
  navLinks: [
    { label: "About", href: "#about" },
    { label: "Ecosystem", href: "#ecosystem" },
    { label: "Features", href: "#features" },
    { label: "Showcase", href: "#showcase" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Technology", href: "#technology" },
  ],
  modules: [
    {
      id: "discover",
      title: "Discover & Home",
      shortDesc: "Campus notices, verified opportunities, and event updates in a clean, information-first feed.",
      badge: "Core Experience",
    },
    {
      id: "opportunities",
      title: "Explore Opportunities",
      shortDesc: "Internships, hackathons, scholarships, and jobs across 10 campus categories with transparent status tracking.",
      badge: "Career Hub",
    },
    {
      id: "qa",
      title: "Structured Q&A",
      shortDesc: "Topic-organized student academic discussions with Same-Doubt signaling and accepted answers.",
      badge: "Knowledge Sharing",
    },
    {
      id: "mentors",
      title: "Mentor Directory",
      shortDesc: "Verified alumni and industry mentors accessible through direct, structured session requests.",
      badge: "Guidance Network",
    },
  ],
  stats: {
    opportunityCategories: 10,
    navigationTabs: 4,
    designSystem: "Linear & Stripe inspired",
  },
};
