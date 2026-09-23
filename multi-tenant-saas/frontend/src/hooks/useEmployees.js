import { useState } from "react";
import apiClient from "../api/client";



export const useEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/employees/all");
      console.log("Fetched employees:", response);
      if (response.data.success) {
        setEmployees(response.data.employees);
      } else {
        setError("Failed to fetch employees.");
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError("An error occurred while fetching employees.");
    } finally {
      setLoading(false);
    }
  };

  return { employees, loading, error, fetchEmployees };
};