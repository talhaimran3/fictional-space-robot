import { useAuth } from "../context/authContext";
import apiClient from "../api/client";
import { useEffect, useState } from "react";

export const useCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await apiClient.get("/admin/companies/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      setCompanies(res.data.data || []);
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchCompanies();
    }
  }, [token]);

  return { companies, loading };
};
