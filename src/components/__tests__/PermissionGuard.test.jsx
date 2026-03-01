import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RequirePermission } from '../PermissionGuard';

describe('PermissionGuard Component', () => {
  it('renders children when user has the required permission', () => {
    const permissions = ['admin:users', 'admin:roles'];

    render(
      <RequirePermission permissions={permissions} permission="admin:users">
        <div>Protected Content</div>
      </RequirePermission>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('does not render children when user lacks permission', () => {
    const permissions = ['vendor:view'];

    render(
      <RequirePermission permissions={permissions} permission="admin:users">
        <div>Protected Content</div>
      </RequirePermission>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when user has any of the required permissions', () => {
    const permissions = ['vendor:view', 'vendor:manage'];

    render(
      <RequirePermission permissions={permissions} permission={['admin:users', 'vendor:manage']}>
        <div>Protected Content</div>
      </RequirePermission>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
