import { Button } from "../ui";
import { Icon } from "../icons/Icon";

type PrimaryActionProps = {
  className?: string;
  label: string;
  onClick: () => void;
};

export function PrimaryAction({ className = "", label, onClick }: PrimaryActionProps) {
  return (
    <Button className={`new-transaction-button ${className}`} type="button" onClick={onClick}>
      <span className="new-transaction-button__icon" aria-hidden="true">
        <Icon name="plus" />
      </span>
      <span>{label}</span>
    </Button>
  );
}
