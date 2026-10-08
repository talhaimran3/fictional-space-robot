import { createContext, useContext, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "./authContext";

const OrganizationContext = createContext(null);

export function OrganizationProvider({ children }) {
  const { organizationId } = useParams();
  const { user } = useAuth();

  const organization = useMemo(() => {
    if (!organizationId) return null;

    return {
      id: organizationId,
      name: user?.organization_name || user?.organizationName || "Organization",
      slug: user?.organization_slug || user?.organizationSlug || null,
    };
  }, [organizationId, user]);

  return (
    <OrganizationContext.Provider value={organization}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);

  if (!context) {
    throw new Error("useOrganization must be used inside OrganizationProvider");
  }

  return context;
}
