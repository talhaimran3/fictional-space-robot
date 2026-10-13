import { useEffect, useState } from "react";
import apiClient from "../api/client";
import { useAuth } from "../context/authContext";

export const useShifts = (organizationId) => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(Boolean(organizationId));
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const { token } = useAuth();

  useEffect(() => {
    let cancelled = false;

    const fetchShifts = async () => {
      if (!token || !organizationId) {
        setShifts([]);
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
        if (!cancelled) setShifts(response.data?.data || []);
      } catch (fetchError) {
        if (!cancelled) {
          setShifts([]);
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

  return { shifts, loading, error, refetch };
};
