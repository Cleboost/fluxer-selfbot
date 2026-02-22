import { describe, it, expect } from 'vitest';
import { computePermissions, hasPermission } from './permissions.js';
import { OverwriteType } from '@fluxer-selfbot/types';
import { PermissionFlags } from '@fluxer-selfbot/util';

const SendMessages = BigInt(PermissionFlags.SendMessages);
const ViewChannel = BigInt(PermissionFlags.ViewChannel);
const Administrator = BigInt(PermissionFlags.Administrator);
const BanMembers = BigInt(PermissionFlags.BanMembers);

describe('hasPermission', () => {
  it('returns true when Administrator is set (grants all permissions)', () => {
    expect(hasPermission(Administrator, Administrator)).toBe(true);
    expect(hasPermission(Administrator, SendMessages)).toBe(true);
  });

  it('returns true when specific permission is set', () => {
    expect(hasPermission(SendMessages, SendMessages)).toBe(true);
  });

  it('returns false when permission not set', () => {
    expect(hasPermission(0n, SendMessages)).toBe(false);
    expect(hasPermission(0n, Administrator)).toBe(false);
  });

  it('returns false when Administrator not set but other permission is', () => {
    expect(hasPermission(BanMembers, Administrator)).toBe(false);
  });
});

describe('computePermissions', () => {
  it('returns base permissions when no overwrites', () => {
    const base = SendMessages | ViewChannel;
    const perms = computePermissions(base, [], [], 'user1', false);
    expect(hasPermission(perms, SendMessages)).toBe(true);
    expect(hasPermission(perms, ViewChannel)).toBe(true);
    expect(hasPermission(perms, BanMembers)).toBe(false);
  });

  it('returns full permissions when owner (including high-bit Fluxer perms)', () => {
    const perms = computePermissions(0n, [], [], 'user1', true);
    expect(hasPermission(perms, SendMessages)).toBe(true);
    expect(hasPermission(perms, BanMembers)).toBe(true);
    expect(hasPermission(perms, BigInt(PermissionFlags.ManageRoles))).toBe(true);
    expect(hasPermission(perms, BigInt(PermissionFlags.PinMessages))).toBe(true);
    expect(hasPermission(perms, BigInt(PermissionFlags.BypassSlowmode))).toBe(true);
  });

  it('applies role deny overwrite', () => {
    const base = SendMessages;
    const overwrites = [{ id: 'role1', type: OverwriteType.Role, allow: '0', deny: '2048' }];
    const perms = computePermissions(base, overwrites, ['role1'], 'user1', false);
    expect(hasPermission(perms, SendMessages)).toBe(false);
  });

  it('applies role allow overwrite', () => {
    const base = 0n;
    const overwrites = [{ id: 'role1', type: OverwriteType.Role, allow: '2048', deny: '0' }];
    const perms = computePermissions(base, overwrites, ['role1'], 'user1', false);
    expect(hasPermission(perms, SendMessages)).toBe(true);
  });

  it('applies member overwrite', () => {
    const base = 0n;
    const overwrites = [{ id: 'user1', type: OverwriteType.Member, allow: '2048', deny: '0' }];
    const perms = computePermissions(base, overwrites, [], 'user1', false);
    expect(hasPermission(perms, SendMessages)).toBe(true);
  });

  it('member overwrite can deny base permission', () => {
    const base = SendMessages;
    const overwrites = [{ id: 'user1', type: OverwriteType.Member, allow: '0', deny: '2048' }];
    const perms = computePermissions(base, overwrites, [], 'user1', false);
    expect(hasPermission(perms, SendMessages)).toBe(false);
  });

  it('ignores overwrites that do not apply to member', () => {
    const base = SendMessages;
    const overwrites = [{ id: 'role99', type: OverwriteType.Role, allow: '0', deny: '2048' }];
    const perms = computePermissions(base, overwrites, ['role1'], 'user1', false);
    expect(hasPermission(perms, SendMessages)).toBe(true);
  });

  it('applies both role and member overwrites (member overwrite wins for same permission)', () => {
    const base = 0n;
    const overwrites = [
      { id: 'role1', type: OverwriteType.Role, allow: '2048', deny: '0' },
      { id: 'user1', type: OverwriteType.Member, allow: '0', deny: '2048' },
    ];
    const perms = computePermissions(base, overwrites, ['role1'], 'user1', false);
    // Member deny overwrites role allow
    expect(hasPermission(perms, SendMessages)).toBe(false);
  });

  it('empty overwrites returns base unchanged', () => {
    const base = 2048n;
    const perms = computePermissions(base, [], [], 'user1', false);
    expect(perms).toBe(base);
  });
});
