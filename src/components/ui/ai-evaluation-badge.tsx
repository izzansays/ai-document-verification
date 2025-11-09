import { CheckCircle2, AlertTriangle } from "lucide-react";

type AIEvaluationBadgeProps = {
  approved: boolean;
  size?: "sm" | "md";
};

export function AIEvaluationBadge({
  approved,
  size = "sm",
}: AIEvaluationBadgeProps) {
  const config = approved
    ? {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle2,
        label: "APPROVED",
      }
    : {
        color: "bg-red-100 text-red-800",
        icon: AlertTriangle,
        label: "FLAGGED",
      };

  const Icon = config.icon;
  const sizeClasses = size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1 text-sm";
  const iconSize = size === "sm" ? 12 : 14;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${config.color} ${sizeClasses}`}
    >
      <Icon size={iconSize} />
      {config.label}
    </span>
  );
}
