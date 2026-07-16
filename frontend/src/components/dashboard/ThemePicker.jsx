import { useTheme } from '../../context/ThemeContext';
import { THEME_LIST } from '../../lib/themes';

export default function ThemePicker() {
  const { themeId, setThemeId, theme } = useTheme();
  const d = theme.dashboard;

  return (
    <div className="mb-6">
      <p className="text-sm mb-3 font-medium" style={{ color: d.textMuted }}>Tema dashboard</p>
      <div className="grid grid-cols-3 gap-2">
        {THEME_LIST.map(t => (
          <button
            key={t.id}
            onClick={() => setThemeId(t.id)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              background: themeId === t.id ? t.dashboard.accent + '22' : t.dashboard.surface,
              border: `1.5px solid ${themeId === t.id ? t.dashboard.accent : t.dashboard.border}`,
              color: themeId === t.id ? t.dashboard.accent : t.dashboard.textMuted,
              transform: themeId === t.id ? 'scale(1.04)' : 'scale(1)',
            }}
          >
            <span>{t.emoji}</span>
            <span>{t.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
