import { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import apiClient from "../api/client";

export const useOrganizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    let cancelled = false;

    const fetchOrganizations = async () => {
      if (!token) {
        setOrganizations([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get("/admin/organizations/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancelled) {
          setOrganizations(response.data?.data || []);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(
            fetchError?.response?.data?.error ||
              fetchError?.response?.data?.message ||
              fetchError.message ||
              "Unable to load organizations."
          );
          setOrganizations([]);
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

  return { organizations, loading, error };
};
