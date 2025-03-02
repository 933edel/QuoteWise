import React, { useEffect, useState } from "react";

const themes = ["light", "dark"];

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="relative">
      <select
        id="theme-select"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="px-3 py-1 text-sm rounded-xl focus:outline-none transition-colors duration-300"
        style={{
          backgroundColor: `var(--bg-color)`,
          color: `var(--text-color)`,
          borderColor: `var(--border-color)`,
        }}
      >
        {themes.map((t) => (
          <option key={t} value={t} style={{ color: `var(--text-color)` }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ThemeSwitcher;
