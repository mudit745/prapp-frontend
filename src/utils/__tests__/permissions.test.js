import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  hasAnyRole,
  getUserPermissions,
  getUserRoles,
} from '../permissions';

// Mock fetch
global.fetch = vi.fn();

describe('Permission Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('hasPermission', () => {
    it('returns true for exact permission match', () => {
      const permissions = ['admin:users', 'vendor:view'];
      expect(hasPermission(permissions, 'admin:users')).toBe(true);
    });

    it('returns true for wildcard permission', () => {
      const permissions = ['requisition:*'];
      expect(hasPermission(permissions, 'requisition:create')).toBe(true);
    });

    it('returns false for non-existent permission', () => {
      const permissions = ['admin:users'];
      expect(hasPermission(permissions, 'vendor:view')).toBe(false);
    });

    it('returns false for invalid permissions array', () => {
      expect(hasPermission(null, 'admin:users')).toBe(false);
      expect(hasPermission('not-array', 'admin:users')).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('returns true if user has any of the permissions', () => {
      const permissions = ['admin:users', 'vendor:view'];
      expect(hasAnyPermission(permissions, 'admin:users', 'po:create')).toBe(true);
    });

    it('returns false if user has none of the permissions', () => {
      const permissions = ['admin:users'];
      expect(hasAnyPermission(permissions, 'po:create', 'invoice:view')).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('returns true if user has all permissions', () => {
      const permissions = ['admin:users', 'admin:roles', 'vendor:view'];
      expect(hasAllPermissions(permissions, 'admin:users', 'admin:roles')).toBe(true);
    });

    it('returns false if user missing any permission', () => {
      const permissions = ['admin:users'];
      expect(hasAllPermissions(permissions, 'admin:users', 'admin:roles')).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('returns true for exact role match', () => {
      const roles = ['Admin', 'User'];
      expect(hasRole(roles, 'Admin')).toBe(true);
    });

    it('returns false for non-existent role', () => {
      const roles = ['Admin'];
      expect(hasRole(roles, 'Manager')).toBe(false);
    });
  });

  describe('hasAnyRole', () => {
    it('returns true if user has any of the roles', () => {
      const roles = ['Admin', 'User'];
      expect(hasAnyRole(roles, 'Admin', 'Manager')).toBe(true);
    });

    it('returns false if user has none of the roles', () => {
      const roles = ['User'];
      expect(hasAnyRole(roles, 'Admin', 'Manager')).toBe(false);
    });
  });

  describe('getUserPermissions', () => {
    it('fetches permissions from API', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ permissions: ['admin:users', 'vendor:view'] }),
      });

      const result = await getUserPermissions('test-token');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/permissions',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
        })
      );
      expect(result).toEqual(['admin:users', 'vendor:view']);
    });

    it('returns empty array on API error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await getUserPermissions('test-token');

      expect(result).toEqual([]);
    });

    it('returns empty array on non-ok response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      const result = await getUserPermissions('test-token');

      expect(result).toEqual([]);
    });
  });

  describe('getUserRoles', () => {
    it('fetches roles from API', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ roles: ['Admin', 'User'] }),
      });

      const result = await getUserRoles('test-token');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/roles',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
        })
      );
      expect(result).toEqual(['Admin', 'User']);
    });

    it('returns empty array on error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await getUserRoles('test-token');

      expect(result).toEqual([]);
    });
  });
});

