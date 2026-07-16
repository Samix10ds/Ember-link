import { useState } from 'react';

export default function LinkCard({ link, accent, theme, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all duration-300"
      style={{
        background: hovered ? theme.cardHover : theme.cardBg,
        border: `1px solid ${hovered ? accent + '60' : theme.cardBorder}`,
        boxShadow: hovered ? `0 4px 24px ${accent}22, 0 0 0 1px ${accent}20` : 'none',
        transform: hovered ? 'translateY(-2px) scale(1.01)' : 'translateY(0) scale(1)',
        backdropFilter: 'blur(12px)',
      }}>
      {link.og_image && (
        <img src={link.og_image} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
          style={{ boxShadow: `0 2px 8px rgba(0,0,0,0.3)` }} />
      )}
      <div className="min-w-0 flex-1">
        <p className="font-medium truncate text-sm" style={{ color: theme.text }}>{link.title}</p>
        {link.og_description && (
          <p className="text-xs truncate mt-0.5" style={{ color: theme.textMuted }}>{link.og_description}</p>
        )}
      </div>
      <span className="flex-shrink-0 text-sm transition-transform duration-200"
        style={{ color: accent, transform: hovered ? 'translateX(3px)' : 'translateX(0)' }}>
        →
      </span>
    </button>
  );
}
