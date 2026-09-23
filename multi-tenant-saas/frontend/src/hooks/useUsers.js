import { useEffect, useState } from "react";
import apiClient from "../api/client";
import { useAuth } from "../context/authContext";

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiClient.get("/admin/users/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Fetched users:", res.data.data);
        setUsers(res.data.data || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUsers();
    }
  }, [token]);

  return { users, loading };
};
