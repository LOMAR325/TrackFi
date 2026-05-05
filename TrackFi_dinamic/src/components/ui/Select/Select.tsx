import type { ReactNode, SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  children: ReactNode;
  chevron?: ReactNode;
  wrapperClassName?: string;
};

export function Select({ children, className = "", chevron, wrapperClassName = "", ...props }: SelectProps) {
  return (
    <span className={`ui-control-wrap ${wrapperClassName}`.trim()}>
      <select className={`ui-select ${className}`.trim()} {...props}>
        {children}
      </select>
      {chevron && <span className="ui-control-wrap__chevron">{chevron}</span>}
    </span>
  );
}
