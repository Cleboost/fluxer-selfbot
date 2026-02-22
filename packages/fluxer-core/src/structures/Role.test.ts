import { describe, it, expect } from 'vitest';
import { Role } from './Role.js';
import { PermissionFlags } from '@fluxer-selfbot/util';

/** Minimal client mock — Role.has() only uses role.permissions, not client. */
function createMockClient() {
  return {} as Parameters<typeof Role>[0];
}

function createRole(permissions: string, overrides: Partial<{ id: string; name: string }> = {}) {
  return new Role(
    createMockClient(),
    {
      permissions,
      id: overrides.id ?? '1',
      name: overrides.name ?? 'Role',
      color: 0,
      position: 0,
      hoist: false,
      mentionable: false,
    },
    'guild1',
  );
}

describe('Role', () => {
  describe('has()', () => {
    it('returns true when role has Administrator (grants all permissions)', () => {
      const role = createRole('8'); // 1 << 3 = Administrator
      expect(role.has(PermissionFlags.Administrator)).toBe(true);
      expect(role.has(PermissionFlags.SendMessages)).toBe(true);
      expect(role.has(PermissionFlags.BanMembers)).toBe(true);
      expect(role.has(PermissionFlags.ManageChannels)).toBe(true);
    });

    it('returns true when role has specific permission', () => {
      const role = createRole('2048'); // SendMessages
      expect(role.has(PermissionFlags.SendMessages)).toBe(true);
      expect(role.has(PermissionFlags.BanMembers)).toBe(false);
      expect(role.has(PermissionFlags.ViewChannel)).toBe(false);
    });

    it('returns true for string permission name', () => {
      const role = createRole('2048');
      expect(role.has('SendMessages')).toBe(true);
      expect(role.has('BanMembers')).toBe(false);
    });

    it('returns false when role has no permissions', () => {
      const role = createRole('0');
      expect(role.has(PermissionFlags.SendMessages)).toBe(false);
      expect(role.has(PermissionFlags.Administrator)).toBe(false);
    });

    it('returns false for undefined or invalid permission name', () => {
      const role = createRole('2048');
      expect(role.has('NonExistent' as never)).toBe(false);
    });

    it('handles combined permission bitfield', () => {
      // SendMessages (2048) | ViewChannel (1024) = 3072
      const role = createRole('3072');
      expect(role.has(PermissionFlags.SendMessages)).toBe(true);
      expect(role.has(PermissionFlags.ViewChannel)).toBe(true);
      expect(role.has(PermissionFlags.BanMembers)).toBe(false);
    });
  });

  describe('toString()', () => {
    it('returns role mention format', () => {
      const role = createRole('0', { id: '123456789' });
      expect(role.toString()).toBe('<@&123456789>');
    });
  });
});
