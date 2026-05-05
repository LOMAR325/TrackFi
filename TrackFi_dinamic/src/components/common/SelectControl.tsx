import type { ReactNode } from "react";
import { Icon } from "../icons/Icon";

type SelectControlProps = {
  children: ReactNode;
  className?: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
};

export function SelectControl({ children, className = "", label, onChange, value }: SelectControlProps) {
  return (
    <label className={`select-control ${className}`} aria-label={label}>
      <select className="filter-control select-control__select" value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
      <span className="filter-control__chevron select-control__chevron" aria-hidden="true">
        <Icon name="chevron" />
      </span>
    </label>
  );
}
