// Site-wide singletons (identity, contact, social, navigation).
// Kept here rather than in a content collection so layout components can
// import them directly.
//
// ⚙️  EDIT THIS FIRST: replace every placeholder below with your lab's details.
//    (Tip: ask Claude to "fill in src/data/site.ts for my lab" and paste your
//    name, institution, and a one-line mission.)

export interface NavLink {
  label: string;
  href: string;
}
export interface NavGroup {
  label: string;
  children: NavLink[];
}
export type NavItem = NavLink | NavGroup;

export interface SiteConfig {
  name: string;
  shortName: string;
  pi: string;
  researchGroup: string;
  institution: string;
  university: string;
  url: string;
  description: string;
  email: string;
  phone: string;
  address: string[];
  mapQuery: string;
  social: {
    scholar?: string;
    twitter?: string;
    github?: string;
    facebook?: string;
    linkedin?: string;
    slack?: string;
    youtube?: string;
    telegram?: string;
    rss?: string;
  };
  nav: NavItem[];
}

export const site: SiteConfig = {
  name: "TelecomAI Lab",
  shortName: "TelecomAI",
  pi: "Vu Nguyen HA",
  researchGroup: "SigCOM",
  institution: "Interdisciplinary Centre for Security, Reliability and Trust (SnT)", 
  university: "University of Luxembourg",
  // Your production URL (used for canonical links + sitemap). Set your domain.
  url: "https://example.com",
  description:
    "The TelecomAI-Lab is a cutting-edge research hub dedicated to advancing artificial intelligence for next-generation telecommunications." + 
    "Our mission is to develop intelligent, energy-efficient solutions for wireless and satellite communication systems by leveraging the synergy of AI " + 
    "with cloud and edge computing.", 
  email: "vu-nguyen.ha@uni.lu",
  phone: "+352 46 66 44 6855",
  address: [
    "Université du Luxembourg",
    "SnT, JFK Building",
    "29, avenue John F. Kennedy, ",
    "L-1855 Luxembourg",
  ],
  mapQuery: "SnT JFK Building University of Luxembourg",
  social: {
    scholar: "https://scholar.google.com/citations?user=ZKYvTCgAAAAJ&hl=en",
    github: "https://github.com/TelecomAILab",
    // Reserved .invalid URLs visibly mark replaceable placeholders, never real accounts.
    facebook: "https://placeholder.invalid/telecomai/facebook",
    twitter: "https://placeholder.invalid/telecomai/x",
    linkedin: "https://placeholder.invalid/telecomai/linkedin",
    slack: "https://placeholder.invalid/telecomai/slack",
    youtube: "https://placeholder.invalid/telecomai/youtube",
    telegram: "https://placeholder.invalid/telecomai/telegram",
    rss: "https://placeholder.invalid/telecomai/rss.xml", // Placeholder; no feed is implemented.
  },
  nav: [
    { label: "People", href: "/people" },
    { label: "Research", href: "/research" },
    { label: "Funding", href: "/funding" },
    { label: "Publications", href: "/publications" },
    { label: "Talks & Seminars", href: "/talks" },
    { label: "Resources", children: [
      { label: "Materials", href: "/mare" },
      { label: "Blog", href: "/blog" },
      { label: "Notes", href: "/notes" },
    ] },
    { label: "About", href: "/about" },
  ],
};
