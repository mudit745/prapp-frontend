// Permission utilities for frontend

const API_BASE = '/api/v1';

// Get user permissions from API
export async function getUserPermissions(token) {
  try {
    const response = await fetch(`${API_BASE}/permissions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch permissions');
    }

    const data = await response.json();
    return data.permissions || [];
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return [];
  }
}

// Get user roles from API
export async function getUserRoles(token) {
  try {
    const response = await fetch(`${API_BASE}/roles`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch roles');
    }

    const data = await response.json();
    return data.roles || [];
  } catch (error) {
    console.error('Error fetching roles:', error);
    return [];
  }
}

// Check if user has a specific permission
export function hasPermission(permissions, permission) {
  if (!permissions || !Array.isArray(permissions)) {
    return false;
  }

  // Exact match
  if (permissions.includes(permission)) {
    return true;
  }

  // Wildcard match (e.g., "requisition:*" matches "requisition:create")
  const wildcardPermission = permission.split(':')[0] + ':*';
  if (permissions.includes(wildcardPermission)) {
    return true;
  }

  return false;
}

// Check if user has any of the specified permissions
export function hasAnyPermission(permissions, ...requiredPermissions) {
  if (!permissions || !Array.isArray(permissions)) {
    return false;
  }

  return requiredPermissions.some(perm => hasPermission(permissions, perm));
}

// Check if user has all of the specified permissions
export function hasAllPermissions(permissions, ...requiredPermissions) {
  if (!permissions || !Array.isArray(permissions)) {
    return false;
  }

  return requiredPermissions.every(perm => hasPermission(permissions, perm));
}

// Check if user has a specific role
export function hasRole(roles, role) {
  if (!roles || !Array.isArray(roles)) {
    return false;
  }

  return roles.includes(role);
}

// Check if user has any of the specified roles
export function hasAnyRole(roles, ...requiredRoles) {
  if (!roles || !Array.isArray(roles)) {
    return false;
  }

  return requiredRoles.some(role => hasRole(roles, role));
}

// Permission constants for easy reference
export const PERMISSIONS = {
  // Requisitions
  REQUISITION_CREATE: 'requisition:create',
  REQUISITION_VIEW: 'requisition:view',
  REQUISITION_VIEW_ALL: 'requisition:view_all',
  REQUISITION_UPDATE: 'requisition:update',
  REQUISITION_UPDATE_ALL: 'requisition:update_all',
  REQUISITION_DELETE: 'requisition:delete',
  REQUISITION_SUBMIT: 'requisition:submit',
  REQUISITION_APPROVE: 'requisition:approve',
  REQUISITION_REJECT: 'requisition:reject',
  REQUISITION_CANCEL: 'requisition:cancel',
  
  // Purchase Orders
  PO_CREATE: 'po:create',
  PO_VIEW: 'po:view',
  PO_VIEW_ALL: 'po:view_all',
  PO_UPDATE: 'po:update',
  PO_APPROVE: 'po:approve',
  PO_CANCEL: 'po:cancel',
  PO_SEND_TO_VENDOR: 'po:send_to_vendor',
  
  // Invoices
  INVOICE_CREATE: 'invoice:create',
  INVOICE_VIEW: 'invoice:view',
  INVOICE_VIEW_ALL: 'invoice:view_all',
  INVOICE_PROCESS: 'invoice:process',
  INVOICE_APPROVE: 'invoice:approve',
  INVOICE_REJECT: 'invoice:reject',
  INVOICE_POST_TO_SAP: 'invoice:post_to_sap',
  INVOICE_RESOLVE_EXCEPTION: 'invoice:resolve_exception',
  
  // Goods Receipt
  GR_CREATE: 'gr:create',
  GR_VIEW: 'gr:view',
  GR_VIEW_ALL: 'gr:view_all',
  GR_UPDATE: 'gr:update',
  GR_COMPLETE: 'gr:complete',
  
  // Vendors
  VENDOR_VIEW: 'vendor:view',
  VENDOR_CREATE: 'vendor:create',
  VENDOR_UPDATE: 'vendor:update',
  VENDOR_DELETE: 'vendor:delete',
  VENDOR_MANAGE: 'vendor:manage',
  
  // Products
  PRODUCT_VIEW: 'product:view',
  PRODUCT_CREATE: 'product:create',
  PRODUCT_UPDATE: 'product:update',
  PRODUCT_DELETE: 'product:delete',
  PRODUCT_MANAGE: 'product:manage',
  
  // Budget
  BUDGET_VIEW: 'budget:view',
  BUDGET_VIEW_ALL: 'budget:view_all',
  BUDGET_CREATE: 'budget:create',
  BUDGET_UPDATE: 'budget:update',
  BUDGET_ADJUST: 'budget:adjust',
  
  // Master Data
  MASTER_DATA_VIEW: 'master_data:view',
  MASTER_DATA_MANAGE: 'master_data:manage',
  
  // Reports
  REPORT_VIEW: 'report:view',
  REPORT_EXPORT: 'report:export',
  REPORT_CREATE: 'report:create',
  
  // Workflow
  WORKFLOW_VIEW: 'workflow:view',
  WORKFLOW_MANAGE: 'workflow:manage',

  // Integration (view monitors)
  INTEGRATION_VIEW: 'integration:view',

  // Administration
  ADMIN_USERS: 'admin:users',
  ADMIN_ROLES: 'admin:roles',
  ADMIN_SYSTEM: 'admin:system',
};

// Role constants
export const ROLES = {
  REQUESTOR: 'Requestor',
  APPROVER: 'Approver',
  PROCUREMENT_ADMIN: 'Procurement Admin',
  FINANCE: 'Finance',
  FINANCE_MANAGER: 'Finance Manager',
  SYSTEM_ADMIN: 'System Admin',
  VENDOR_MANAGER: 'Vendor Manager',
  GR_CLERK: 'GR Clerk',
  BUDGET_MANAGER: 'Budget Manager',
  VIEWER: 'Viewer',
};

