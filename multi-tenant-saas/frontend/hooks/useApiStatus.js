// fictional-space-robot/multi-tenant-saas/frontend/hooks/useApiStatus.js
import { useState, useEffect, useCallback } from "react";

export function useApiStatus(endpointUrl, pollIntervalMs = 15000) {
  const [status, setStatus] = useState("checking");
  const [latency, setLatency] = useState(0);
  const [error, setError] = useState(null);

  const [services, setServices] = useState({
    api: "checking",
    postgres: "checking",
  });

  const checkHealth = useCallback(async () => {
    const startTime = performance.now();

    setStatus("checking");
    setError(null);

    setServices({
      api: "checking",
      postgres: "checking",
    });

    try {
      const response = await fetch(endpointUrl, {
        method: "GET",
        signal: AbortSignal.timeout(4000),
      });

      if (!response.ok) {
        throw new Error(
          `Server returned status code: ${response.status}`,
        );
      }

      const payload = await response.json();

      const apiStatus =
        payload?.services?.api?.status === "up"
          ? "healthy"
          : "unhealthy";

      const postgresStatus =
        payload?.services?.postgres?.status === "up"
          ? "healthy"
          : "unhealthy";

      setServices({
        api: apiStatus,
        postgres: postgresStatus,
      });

      const overallHealthy =
        apiStatus === "healthy" &&
        postgresStatus === "healthy";

      const postgresError =
        payload?.services?.postgres?.error;

      const endTime = performance.now();

      setLatency(
        Math.round(endTime - startTime),
      );

      setStatus(
        overallHealthy
          ? "healthy"
          : "unhealthy",
      );

      setError(
        postgresError ||
          (payload?.status === "unhealthy"
            ? "Service reported unhealthy"
            : null),
      );
    } catch (err) {
      setServices({
        api: "unhealthy",
        postgres: "unhealthy",
      });

      setStatus("unhealthy");

      setError(
        err.message || "Network error",
      );
    }
  }, [endpointUrl]);

  useEffect(() => {
    checkHealth();

    const interval = setInterval(
      checkHealth,
      pollIntervalMs,
    );

    return () => clearInterval(interval);
  }, [checkHealth, pollIntervalMs]);

  return {
    status,
    latency,
    error,
    services,
    refetch: checkHealth,
  };
}