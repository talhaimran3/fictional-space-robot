import { useEffect, useState } from "react";
import apiClient from "../api/client";
import { useAuth } from "../context/authContext";

export const useShifts = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();
  useEffect(() => {
    async function fetchShifts() {
      try {
        setLoading(true);
        setError(null);

        const res = await apiClient.get("/admin/shifts/all", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Fetched all shifts : ", res.data.data);
        setShifts(res.data?.data || []);
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
    fetchShifts();
  }, []);

  return {
    shifts,
    loading,
    error,
  };
};
