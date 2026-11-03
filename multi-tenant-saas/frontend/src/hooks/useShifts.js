import { useEffect, useState } from "react";
import apiClient from "../api/client";
import { useAuth } from "../context/authContext";

const EMPTY_COUNTS = {
  unassigned_shifts: 0,
  assigned_shifts: 0,
};

const countShifts = (shifts) =>
  shifts.reduce(
    (counts, shift) => {
      if (shift.status === "cancelled") {
        return counts;
      }

      if (shift.employee_id == null) {
        counts.unassigned_shifts += 1;
      } else {
        counts.assigned_shifts += 1;
      }

      return counts;
    },
    { ...EMPTY_COUNTS }
  );

export const useShifts = (organizationId) => {
  const selectedOrganizationId = organizationId || null;
  const [result, setResult] = useState({
    organizationId: selectedOrganizationId,
    token: null,
    shifts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [shiftsCounts, setShiftsCounts] = useState({ ...EMPTY_COUNTS });
  const { token } = useAuth();

  useEffect(() => {
    let cancelled = false;

    const fetchShifts = async () => {
      if (!token) {
        setResult({
          organizationId: selectedOrganizationId,
          token: null,
          shifts: [],
        });
        setShiftsCounts({ ...EMPTY_COUNTS });
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setShiftsCounts({ ...EMPTY_COUNTS });

        // The admin endpoint is role-aware:
        // developers receive all organizations; other users receive their own.
        const endpoint = selectedOrganizationId
          ? `/organizations/${encodeURIComponent(selectedOrganizationId)}/all-shifts`
          : "/admin/shifts/all";

        const response = await apiClient.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (cancelled) return;

        const fetchedShifts = Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        // The admin endpoint returns counts alongside the shifts.
        // The organization endpoint returns only the shift list, so count it here.
        const fetchedCounts = selectedOrganizationId
          ? countShifts(fetchedShifts)
          : response.data?.counts || countShifts(fetchedShifts);

        setResult({
          organizationId: selectedOrganizationId,
          token,
          shifts: fetchedShifts,
        });
        setShiftsCounts(fetchedCounts);
      } catch (fetchError) {
        if (!cancelled) {
          setResult({
            organizationId: selectedOrganizationId,
            token,
            shifts: [],
          });
          setShiftsCounts({ ...EMPTY_COUNTS });
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
  }, [selectedOrganizationId, token, reloadKey]);

  const refetch = () => setReloadKey((value) => value + 1);
  const resultMatchesCurrentSelection =
    result.organizationId === selectedOrganizationId && result.token === token;
  const currentShifts = resultMatchesCurrentSelection ? result.shifts : [];
  const isLoading = loading || !resultMatchesCurrentSelection;

  return {
    shifts: currentShifts,
    loading: isLoading,
    error,
    refetch,
    shiftsCounts,
  };
};
