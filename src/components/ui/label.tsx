import * as React from "react";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`mb-2 block font-medium text-gray-700 text-sm ${className || ""}`}
        {...props}
      />
    );
  }
);
Label.displayName = "Label";

export { Label };
