import { useState, useEffect } from 'react';
import { getUserPermissions, getUserRoles } from '../utils/permissions';

export function usePermissions(token) {
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Reset state immediately when token changes
    if (!token) {
      setPermissions([]);
      setRoles([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    async function fetchPermissions() {
      try {
        setLoading(true);
        setError(null);
        const [perms, userRoles] = await Promise.all([
          getUserPermissions(token),
          getUserRoles(token),
        ]);
        
        // Only update if not cancelled (token might have changed)
        if (!cancelled) {
          setPermissions(perms);
          setRoles(userRoles);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setPermissions([]);
          setRoles([]);
          console.error('Error loading permissions:', err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPermissions();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return { permissions, roles, loading, error };
}

