// CSS-only packages imported for side effects; preserve the existing declarations.
declare module "@fontsource-variable/*";

interface Window {
  telecomaiTheme?: { set(preference: "light" | "dark" | "auto"): void };
}
