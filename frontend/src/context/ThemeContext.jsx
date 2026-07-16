import { createContext, useContext, useEffect, useState } from 'react';
import { THEMES, DEFAULT_THEME } from '../lib/themes';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => localStorage.getItem('ember-theme') || DEFAULT_THEME);

  const theme = THEMES[themeId] || THEMES[DEFAULT_THEME];

  useEffect(() => {
    localStorage.setItem('ember-theme', themeId);
    const d = theme.dashboard;
    const root = document.documentElement;
    root.style.setProperty('--bg', d.bg);
    root.style.setProperty('--surface', d.surface);
    root.style.setProperty('--surface-hover', d.surfaceHover);
    root.style.setProperty('--border', d.border);
    root.style.setProperty('--text', d.text);
    root.style.setProperty('--text-muted', d.textMuted);
    root.style.setProperty('--accent', d.accent);
    root.style.setProperty('--gradient', d.gradient);
    document.body.style.background = d.bg;
    document.body.style.color = d.text;
  }, [themeId, theme]);

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
