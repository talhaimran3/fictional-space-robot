import React from "react";
import { useApiStatus } from "../hooks/useApiStatus";
import { useNavigatorOnline } from "../hooks/useNavigatorOnline";

const backendURL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000";

export function HealthDashboard() {
  const isBrowserOnline = useNavigatorOnline();

  const {
    status,
    latency,
    error,
    services,
    refetch,
  } = useApiStatus(
    `${backendURL}/health-check`,
  );

  const getStatusLabel = (serviceStatus) => {
    if (serviceStatus === "checking") {
      return "🔄 Checking...";
    }

    if (serviceStatus === "healthy") {
      return "🟢 Operational";
    }

    return "🔴 Down";
  };

  const getStatusColor = (serviceStatus) => {
    if (serviceStatus === "checking") {
      return "#777";
    }

    if (serviceStatus === "healthy") {
      return "green";
    }

    return "red";
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "500px",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <h3>System Health</h3>

      {/* Internet */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <span>Internet Connection</span>

        <strong
          style={{
            color: isBrowserOnline
              ? "green"
              : "red",
          }}
        >
          {isBrowserOnline
            ? "🌐 Connected"
            : "❌ Disconnected"}
        </strong>
      </div>

      {/* API */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <span>Backend API</span>

        <strong
          style={{
            color: !isBrowserOnline
              ? "orange"
              : getStatusColor(services.api),
          }}
        >
          {!isBrowserOnline
            ? "⚠️ Unknown"
            : getStatusLabel(services.api)}
        </strong>
      </div>

      {/* PostgreSQL */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <span>PostgreSQL</span>

        <strong
          style={{
            color: !isBrowserOnline
              ? "orange"
              : getStatusColor(
                  services.postgres,
                ),
          }}
        >
          {!isBrowserOnline
            ? "⚠️ Unknown"
            : getStatusLabel(
                services.postgres,
              )}
        </strong>
      </div>

      {/* Latency */}

      {isBrowserOnline &&
        status === "healthy" && (
          <p
            style={{
              fontSize: "12px",
              color: "#555",
            }}
          >
            Response Latency: {latency}ms
          </p>
        )}

      {/* Error */}

      {isBrowserOnline &&
        status === "unhealthy" &&
        error && (
          <p
            style={{
              fontSize: "12px",
              color: "red",
            }}
          >
            Error: {error}
          </p>
        )}

      {/* Recheck */}

      <button
        onClick={refetch}
        disabled={!isBrowserOnline}
        style={{
          marginTop: "10px",
          width: "100%",
          padding: "8px",
          cursor: isBrowserOnline
            ? "pointer"
            : "not-allowed",
        }}
      >
        Force Recheck
      </button>
    </div>
  );
}