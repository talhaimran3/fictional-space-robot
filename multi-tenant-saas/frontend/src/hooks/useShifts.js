import { useEffect, useState } from "react";
import apiClient from "../api/client";
import { useAuth } from "../context/authContext";

export const useShifts = (organizationId) => {
  const [result, setResult] = useState({
    organizationId: "",
    token: null,
    shifts: [],
  });
  const [loading, setLoading] = useState(Boolean(organizationId));
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const { token } = useAuth();

  useEffect(() => {
    let cancelled = false;

    const fetchShifts = async () => {
      if (!token || !organizationId) {
        setResult({ organizationId, token, shifts: [] });
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get(
          `/organizations/${encodeURIComponent(organizationId)}/all-shifts`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!cancelled) {
          setResult({
            organizationId,
            token,
            shifts: response.data?.data || [],
          });
        }
      } catch (fetchError) {
        if (!cancelled) {
          setResult({ organizationId, token, shifts: [] });
          setError(
            fetchError?.response?.data?.error ||
              fetchError?.response?.data?.message ||
              fetchError.message ||
              "Unable to load shifts."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchShifts();
    return () => {
      cancelled = true;
    };
  }, [organizationId, token, reloadKey]);

  const refetch = () => setReloadKey((value) => value + 1);
  const resultMatchesCurrentSelection =
    result.organizationId === organizationId && result.token === token;
  const currentShifts = resultMatchesCurrentSelection ? result.shifts : [];
  const isLoading =
    loading ||
    (Boolean(organizationId) && !resultMatchesCurrentSelection);

  return { shifts: currentShifts, loading: isLoading, error, refetch };
};
