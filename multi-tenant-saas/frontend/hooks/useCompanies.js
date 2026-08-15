import { useAuth } from "../context/authContext";
import apiClient from "../api/client";
import { useEffect, useState } from "react";

export const useCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await apiClient.get("/admin/companies/all", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        console.log('fetched compies : ', res.data.data)
        setCompanies(res.data.data || []);
      } catch (error) {
        setError("Error fetching companies");
        console.error("Error fetching companies:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchCompanies();
    }
  }, [token]);

  return { companies, loading, error };
};
