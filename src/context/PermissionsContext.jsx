import { createContext, useContext, useState, useEffect } from 'react';
import { usePermissions } from '../hooks/usePermissions';

const PermissionsContext = createContext(null);

export function PermissionsProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // Listen for token changes (login/logout)
  useEffect(() => {
    const handleTokenChange = () => {
      const newToken = localStorage.getItem('token');
      setToken(newToken);
    };

    // Check token on mount
    handleTokenChange();

    // Listen for custom token change event
    window.addEventListener('tokenChanged', handleTokenChange);
    
    // Also listen for storage events (cross-tab)
    window.addEventListener('storage', handleTokenChange);

    // Poll localStorage as a fallback (check every 500ms)
    const interval = setInterval(handleTokenChange, 500);

    return () => {
      window.removeEventListener('tokenChanged', handleTokenChange);
      window.removeEventListener('storage', handleTokenChange);
      clearInterval(interval);
    };
  }, []);

  const { permissions, roles, loading, error } = usePermissions(token);

  return (
    <PermissionsContext.Provider value={{ permissions, roles, loading, error }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissionsContext() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissionsContext must be used within PermissionsProvider');
  }
  return context;
}

