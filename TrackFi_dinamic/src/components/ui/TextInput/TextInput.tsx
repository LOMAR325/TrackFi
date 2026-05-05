import type { InputHTMLAttributes, ReactNode } from "react";

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: ReactNode;
  prefix?: ReactNode;
  wrapperClassName?: string;
};

export function TextInput({ className = "", icon, prefix, wrapperClassName = "", ...props }: TextInputProps) {
  return (
    <span className={`ui-control-wrap ${wrapperClassName}`.trim()}>
      {icon && <span className="ui-control-wrap__icon">{icon}</span>}
      {prefix && <span className="ui-control-wrap__prefix">{prefix}</span>}
      <input className={`ui-input ${className}`.trim()} {...props} />
    </span>
  );
}
