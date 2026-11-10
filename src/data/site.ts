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
  name: "Example Laboratory",
  shortName: "Example Lab",
  pi: "Jane Doe, PhD",
  institution: "Your Institution",
  university: "Your University",
  // Your production URL (used for canonical links + sitemap). Set your domain.
  url: "https://example.com",
  description:
    "One or two sentences describing what your lab studies and why it matters. " +
    "This shows as the homepage lead and the default meta description.",
  email: "lab@example.edu",
  phone: "000-000-0000",
  address: [
    "Example Laboratory",
    "Your Department",
    "123 University Way",
    "City, ST 00000",
  ],
  mapQuery: "123 University Way, City, ST 00000",
  social: {
    scholar: "https://scholar.google.com/citations?user=XXXXXXXX&hl=en",
    // twitter: "https://twitter.com/yourhandle",
    // github: "https://github.com/yourorg",
  },
  nav: [
    { label: "People", href: "/people" },
    { label: "Research", href: "/research" },
    { label: "Publications", href: "/publications" },
    { label: "Figures", href: "/figures" },
    { label: "Lab Life", href: "/lab-life" },
    { label: "Contact", href: "/contact" },
  ],
};
