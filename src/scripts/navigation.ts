const header = document.querySelector<HTMLElement>("[data-site-header]");
if (header) {
  const toggle = header.querySelector<HTMLButtonElement>("#nav-toggle")!;
  const mobile = header.querySelector<HTMLElement>("#mobile-menu")!;
  const disclosures = [...header.querySelectorAll<HTMLElement>("[data-nav-disclosure]")].map((root) => ({
    root,
    trigger: root.querySelector<HTMLButtonElement>("[data-nav-disclosure-trigger]")!,
    panel: root.querySelector<HTMLElement>("[data-nav-panel]")!,
  }));
  const closeDisclosure = (item: typeof disclosures[number], restore = false) => {
    item.panel.hidden = true;
    item.trigger.setAttribute("aria-expanded", "false");
    if (restore) item.trigger.focus();
  };
  const closeMobile = (restore = false) => {
    mobile.classList.add("hidden");
    toggle.setAttribute("aria-expanded", "false");
    disclosures.forEach((item) => closeDisclosure(item));
    if (restore) toggle.focus();
  };
  disclosures.forEach((item) => {
    const open = () => {
      disclosures.filter((other) => other !== item).forEach((other) => closeDisclosure(other));
      item.panel.hidden = false;
      item.trigger.setAttribute("aria-expanded", "true");
    };
    const links = [...item.panel.querySelectorAll<HTMLAnchorElement>("a")];
    item.trigger.addEventListener("click", () => item.panel.hidden ? open() : closeDisclosure(item));
    item.trigger.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault(); open();
        (event.key === "ArrowDown" ? links[0] : links.at(-1))?.focus();
      }
    });
    item.panel.addEventListener("keydown", (event) => {
      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
      const index = links.indexOf(document.activeElement as HTMLAnchorElement);
      if (index < 0) return;
      event.preventDefault();
      const next = event.key === "Home" ? 0 : event.key === "End" ? links.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + links.length) % links.length;
      links[next]?.focus();
    });
    links.forEach((link) => link.addEventListener("click", () => closeDisclosure(item)));
  });
  toggle.addEventListener("click", () => {
    const opening = toggle.getAttribute("aria-expanded") !== "true";
    if (!opening) closeMobile();
    else { disclosures.forEach((item) => closeDisclosure(item)); mobile.classList.remove("hidden"); toggle.setAttribute("aria-expanded", "true"); }
  });
  mobile.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeMobile()));
  const dismissOutside = (target: EventTarget | null) => {
    if (!(target instanceof Node)) return;
    disclosures.forEach((item) => { if (!item.root.contains(target)) closeDisclosure(item); });
    if (!header.contains(target)) closeMobile();
  };
  document.addEventListener("click", (event) => dismissOutside(event.target));
  document.addEventListener("focusin", (event) => dismissOutside(event.target));
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || event.defaultPrevented) return;
    const expanded = disclosures.find((item) => !item.panel.hidden);
    if (expanded) { event.preventDefault(); closeDisclosure(expanded, true); }
    else if (toggle.getAttribute("aria-expanded") === "true") { event.preventDefault(); closeMobile(true); }
  });
  window.matchMedia("(min-width: 80rem)").addEventListener("change", () => closeMobile());
}
export {};
