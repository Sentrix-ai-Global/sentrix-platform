export type RiskLevel = "critical" | "high" | "medium" | "low";
export type DisasterStatus = "critical" | "alert" | "monitoring" | "safe";
export type AlertStatus = "sent" | "pending" | "scheduled";

export const levelConfig: Record<RiskLevel, { color: string; bg: string; border: string }> = {
  critical: { color: "#ef4444", bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.3)"  },
  high:     { color: "#ef4444", bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.3)"  },
  medium:   { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" },
  low:      { color: "#22c55e", bg: "rgba(34,197,94,0.1)",  border: "rgba(34,197,94,0.3)"  },
};

export const statusConfig: Record<DisasterStatus, { color: string; label: string }> = {
  critical:   { color: "#ef4444", label: "critical"   },
  alert:      { color: "#f97316", label: "alert"      },
  monitoring: { color: "#06b6d4", label: "monitoring" },
  safe:       { color: "#22c55e", label: "safe"       },
};