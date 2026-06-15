(() => {
  try {
    const stored = localStorage.getItem("wyrefy-theme") || "system";
    const systemDark = globalThis.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolved = systemDark ? "dark" : "light";
    document.documentElement.dataset.theme = stored === "system" ? resolved : stored;
  } catch {
    document.documentElement.dataset.theme = "light";
  }
})();
