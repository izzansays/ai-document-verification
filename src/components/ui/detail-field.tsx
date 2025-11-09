import type { ReactNode } from "react";

type DetailFieldProps = {
  label: string;
  children: ReactNode;
  span?: "single" | "full";
};

export function DetailField({
  label,
  children,
  span = "single",
}: DetailFieldProps) {
  const spanClass = span === "full" ? "md:col-span-2" : "";

  return (
    <div className={spanClass}>
      <label className="mb-1 block font-medium text-gray-700 text-sm">
        {label}
      </label>
      {children}
    </div>
  );
}
