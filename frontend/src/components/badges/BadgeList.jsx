import { getSystemBadge } from '../../lib/roles';

export default function BadgeList({ profile, badges = [], size = 'sm' }) {
  const systemBadge = getSystemBadge(profile?.role);
  const allBadges = systemBadge
    ? [{ id: 'system', ...systemBadge, is_system: true }, ...badges]
    : badges;

  if (allBadges.length === 0) return null;

  const padding = size === 'sm' ? '2px 8px' : '4px 12px';
  const fontSize = size === 'sm' ? 11 : 13;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
      {allBadges.map(badge => (
        <span key={badge.id}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding, fontSize, fontWeight: 600, borderRadius: 999,
            background: badge.color + '22',
            border: `1.5px solid ${badge.color}55`,
            color: badge.color,
          }}>
          {badge.emoji} {badge.label}
        </span>
      ))}
    </div>
  );
}
