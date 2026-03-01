import { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole } from '../utils/permissions';

/**
 * PermissionGuard - Conditionally renders children based on permissions
 * 
 * @param {Array} permissions - User's permissions array
 * @param {string|Array} require - Required permission(s) or role(s)
 * @param {boolean} requireAll - If true, requires all permissions (default: false, any)
 * @param {boolean} checkRole - If true, checks roles instead of permissions
 * @param {ReactNode} children - Children to render if permission check passes
 * @param {ReactNode} fallback - Optional fallback to render if permission check fails
 */
export function PermissionGuard({
  permissions = [],
  roles = [],
  require,
  requireAll = false,
  checkRole = false,
  children,
  fallback = null,
}) {
  if (!require) {
    return children;
  }

  const source = checkRole ? roles : permissions;
  const requirements = Array.isArray(require) ? require : [require];

  let hasAccess = false;

  if (checkRole) {
    hasAccess = requireAll
      ? requirements.every(role => hasRole(roles, role))
      : hasAnyRole(roles, ...requirements);
  } else {
    hasAccess = requireAll
      ? hasAllPermissions(permissions, ...requirements)
      : hasAnyPermission(permissions, ...requirements);
  }

  return hasAccess ? children : fallback;
}

/**
 * RequirePermission - Shorthand for permission-based rendering
 */
export function RequirePermission({ permissions, permission, children, fallback = null }) {
  return (
    <PermissionGuard
      permissions={permissions}
      require={permission}
      children={children}
      fallback={fallback}
    />
  );
}

/**
 * RequireAnyPermission - Renders if user has any of the specified permissions
 */
export function RequireAnyPermission({ permissions, permissions: perms, children, fallback = null }) {
  return (
    <PermissionGuard
      permissions={permissions}
      require={perms}
      requireAll={false}
      children={children}
      fallback={fallback}
    />
  );
}

/**
 * RequireAllPermissions - Renders if user has all specified permissions
 */
export function RequireAllPermissions({ permissions, permissions: perms, children, fallback = null }) {
  return (
    <PermissionGuard
      permissions={permissions}
      require={perms}
      requireAll={true}
      children={children}
      fallback={fallback}
    />
  );
}

/**
 * RequireRole - Shorthand for role-based rendering
 */
export function RequireRole({ roles, role, children, fallback = null }) {
  return (
    <PermissionGuard
      roles={roles}
      require={role}
      checkRole={true}
      children={children}
      fallback={fallback}
    />
  );
}

