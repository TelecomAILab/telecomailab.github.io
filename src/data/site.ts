// Site-wide singletons (identity, contact, social, navigation).
// Kept here rather than in a content collection so layout components can
// import them directly.
//
// ⚙️  EDIT THIS FIRST: replace every placeholder below with your lab's details.
//    (Tip: ask Claude to "fill in src/data/site.ts for my lab" and paste your
//    name, institution, and a one-line mission.)

export interface NavItem {
  label: string;
  href: string;
}

export interface SiteConfig {
  name: string;
  shortName: string;
  pi: string;
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
  };
  nav: NavItem[];
}

export const site: SiteConfig = {
  name: "TelecomAI Lab",
  shortName: "TelecomAI",
  pi: "Vu Nguyen HA",
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
    // twitter: "https://twitter.com/yourhandle",
    github: "https://github.com/TelecomAILab",
  },
  nav: [
    { label: "People", href: "/people" },
    { label: "Research", href: "/research" },
    { label: "Funding", href: "/funding" },
    { label: "Publications", href: "/publications" },
    { label: "Figures", href: "/figures" },
    { label: "Materials & Resources", href: "/mare" },
    { label: "Lab Life", href: "/lab-life" },
    { label: "Contact", href: "/contact" },
  ],
};
