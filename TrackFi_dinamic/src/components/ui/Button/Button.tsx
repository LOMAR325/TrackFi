import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className = "", variant = "primary", ...props }: ButtonProps) {
  const variantClass = {
    ghost: "ui-button--ghost",
    primary: "ui-button--primary",
    secondary: "ui-button--secondary",
  }[variant];

  return <button className={`ui-button ${variantClass} ${className}`.trim()} {...props} />;
}
