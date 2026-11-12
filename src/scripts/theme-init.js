// Runs synchronously in <head>, before styles/paint. No storage access is assumed.
(() => {
  const key = "telecomai-theme";
  const root = document.documentElement;
  const valid = (value) => ["light", "dark", "auto"].includes(value) ? value : "auto";
  let preference = "auto";
  try { preference = valid(localStorage.getItem(key)); } catch { /* Private/storage-blocked sessions use memory. */ }
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const apply = () => {
    const resolved = preference === "auto" ? (media.matches ? "dark" : "light") : preference;
    root.dataset.theme = resolved;
    root.dataset.themePreference = preference;
    root.style.colorScheme = resolved;
    window.dispatchEvent(new CustomEvent("telecomai:theme", { detail: { preference, resolved } }));
  };
  window.telecomaiTheme = {
    set(value) {
      preference = valid(value);
      try { localStorage.setItem(key, preference); } catch { /* Continue switching without persistence. */ }
      apply();
    },
  };
  media.addEventListener("change", () => { if (preference === "auto") apply(); });
  window.addEventListener("storage", (event) => {
    if (event.key === key || event.key === null) { preference = valid(event.newValue); apply(); }
  });
  apply();
})();
