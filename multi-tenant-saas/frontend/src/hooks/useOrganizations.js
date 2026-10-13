import { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import apiClient from "../api/client";

export const useOrganizations = () => {
  const [result, setResult] = useState({ token: null, organizations: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    let cancelled = false;

    const fetchOrganizations = async () => {
      if (!token) {
        setResult({ token: null, organizations: [] });
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get("/admin/organizations/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("useOrganizations response:", response);
        if (!cancelled) {
          setResult({
            token,
            organizations: response.data?.data || [],
          });
        }
      } catch (fetchError) {
        if (!cancelled) {
          setResult({ token, organizations: [] });
          setError(
            fetchError?.response?.data?.error ||
              fetchError?.response?.data?.message ||
              fetchError.message ||
              "Unable to load organizations."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOrganizations();
    return () => {
      cancelled = true;
    };
  }, [token]);

  // Do not carry tenant names/staff data between sessions while a new token loads.
  const resultMatchesSession = result.token === token;
  return {
    organizations: resultMatchesSession ? result.organizations : [],
    loading: loading || (Boolean(token) && !resultMatchesSession),
    error,
  };
};
