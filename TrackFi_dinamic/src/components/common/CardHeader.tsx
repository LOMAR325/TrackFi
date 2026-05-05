import { Link } from "@tanstack/react-router";
import { Icon } from "../icons/Icon";

type CardHeaderProps = {
  actionText: string;
  actionTo: string;
  id: string;
  title: string;
};

export function CardHeader({ actionText, actionTo, id, title }: CardHeaderProps) {
  return (
    <div className="card__header">
      <h2 className="card__title" id={id}>
        {title}
      </h2>
      <Link className="card__action-link" to={actionTo}>
        <span>{actionText}</span>
        <Icon name="arrowRight" />
      </Link>
    </div>
  );
}
