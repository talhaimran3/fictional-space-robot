import { useEffect, useState } from "react";
import apiClient from "../api/client";

export const useShifts = (tenantId) => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchShifts() {
      console.log("Fetching shifts for tenant:", tenantId);
      try {
        setLoading(true);
        setError(null);

        const res = await apiClient.get("/shifts", {
          headers: {
            "X-Tenant-ID": tenantId,
          },
        });

        console.log("Fetched shifts for tenant:", tenantId, res.data);
        setShifts(res.data?.shifts || []);
      } catch (error) {
        setError(
          error?.response?.data?.message ||
            error.message ||
            "Unable to load shifts",
        );
      } finally {
        setLoading(false);
      }
    }

    if (tenantId) {
      fetchShifts();
    } else {
      setLoading(false);
    }
  }, [tenantId]);

  return {
    shifts,
    loading,
    error,
  };
};
