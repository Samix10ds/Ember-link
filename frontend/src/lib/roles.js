// Ruoli e permessi
export const ROLES = {
  owner: 'owner',
  admin: 'admin',
  user: 'user',
};

export function isOwner(profile) {
  return profile?.role === 'owner';
}

export function isAdmin(profile) {
  return profile?.role === 'admin' || profile?.role === 'owner';
}

export function canModerate(profile) {
  return isAdmin(profile);
}

// Badge di sistema automatici per owner/admin
export function getSystemBadge(role) {
  if (role === 'owner') return { emoji: '👑', label: 'Owner', color: '#f59e0b' };
  if (role === 'admin') return { emoji: '⚡', label: 'Admin', color: '#818cf8' };
  return null;
}
