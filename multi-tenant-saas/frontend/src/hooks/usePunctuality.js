import { useEffect, useState } from "react";
import apiClient from "../api/client";

const EMPTY_SUMMARY = {
  punctual: 0,
  late: 0,
  absent: 0,
  awaiting_clock_in: 0,
  evaluated: 0,
  percentages: { punctual: 0, late: 0, absent: 0 },
};

export function usePunctuality() {
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [date, setDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadPunctuality() {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get("/punctuality/today");
        if (!active) return;

        setSummary({ ...EMPTY_SUMMARY, ...(response.data?.data || {}) });
        setDate(response.data?.date || null);
      } catch (requestError) {
        if (!active) return;
        setError(
          requestError?.response?.data?.error ||
            requestError?.response?.data?.message ||
            requestError.message ||
            "Unable to load punctuality data.",
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadPunctuality();
    return () => {
      active = false;
    };
  }, []);

  return { summary, date, loading, error };
}
