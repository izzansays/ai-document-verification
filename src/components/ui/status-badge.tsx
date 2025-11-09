import { CheckCircle2, Clock, XCircle } from "lucide-react";

type ClaimStatus = "pending" | "approved" | "rejected";

type StatusBadgeProps = {
  status: ClaimStatus;
  size?: "sm" | "md";
};

const getStatusConfig = (status: ClaimStatus) => {
  switch (status) {
    case "approved":
      return {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle2,
      };
    case "rejected":
      return {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
      };
    case "pending":
      return {
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
      };
    default:
      return {
        color: "bg-gray-100 text-gray-800",
        icon: Clock,
      };
  }
};

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeClasses = size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1 text-sm";
  const iconSize = size === "sm" ? 12 : 14;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${config.color} ${sizeClasses}`}
    >
      <Icon size={iconSize} />
      {status.toUpperCase()}
    </span>
  );
}
