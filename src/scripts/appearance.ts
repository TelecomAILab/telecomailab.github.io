const trigger = document.querySelector<HTMLButtonElement>("#appearance-toggle");
const menu = document.querySelector<HTMLElement>("#appearance-options");
if (trigger && menu) {
  const options = [...menu.querySelectorAll<HTMLButtonElement>("[data-theme-option]")];
  const close = (restore = false) => { menu.hidden = true; trigger.setAttribute("aria-expanded", "false"); if (restore) trigger.focus(); };
  const update = () => {
    const preference = document.documentElement.dataset.themePreference ?? "auto";
    const selected = options.find((option) => option.dataset.themeOption === preference)!;
    options.forEach((option) => option.setAttribute("aria-checked", String(option === selected)));
    trigger.setAttribute("aria-label", `Appearance: ${selected.textContent?.replace("✓", "").trim()}`);
  };
  const open = () => {
    menu.hidden = false; trigger.setAttribute("aria-expanded", "true");
    options.find((option) => option.getAttribute("aria-checked") === "true")?.focus();
  };
  trigger.addEventListener("click", () => menu.hidden ? open() : close());
  trigger.addEventListener("keydown", (event) => { if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); open(); } });
  menu.addEventListener("keydown", (event) => {
    const index = options.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === "Escape") { event.preventDefault(); close(true); }
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
      options[next]?.focus();
    }
  });
  options.forEach((option) => option.addEventListener("click", () => {
    window.telecomaiTheme?.set(option.dataset.themeOption as "light" | "dark" | "auto");
    close(true);
  }));
  document.addEventListener("click", (event) => { if (!(event.target instanceof Node) || !trigger.parentElement?.contains(event.target)) close(); });
  document.addEventListener("focusin", (event) => { if (event.target instanceof Node && !trigger.parentElement?.contains(event.target)) close(); });
  window.addEventListener("telecomai:theme", update);
  update();
}
export {};
