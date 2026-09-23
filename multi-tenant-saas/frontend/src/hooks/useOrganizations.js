import { useAuth } from "../context/authContext";
import apiClient from "../api/client";
import { useEffect, useState } from "react";

export const useOrganizations = () => {
  const [organizations, setorganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchorganizations = async () => {
      try {
        const res = await apiClient.get("/admin/organizations/all", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        console.log('fetched organizations : ', res.data.data)
        setorganizations(res.data.data || []);
      } catch (error) {
        setError("Error fetching organizations");
        console.error("Error fetching organizations:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchorganizations();
    }
  }, [token]);

  return { organizations, loading, error };
};
