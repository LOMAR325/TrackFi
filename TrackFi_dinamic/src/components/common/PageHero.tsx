import { PrimaryAction } from "./PrimaryAction";

type PageHeroProps = {
  actionLabel?: string;
  onAction?: () => void;
  subtitle?: string;
  title: string;
  titleId: string;
  variant: "dashboard" | "transactions" | "categories" | "analytics" | "goals" | "settings";
};

export function PageHero({ actionLabel, onAction, subtitle, title, titleId, variant }: PageHeroProps) {
  return (
    <section className={`${variant}-page__hero`} aria-labelledby={titleId}>
      <div>
        <h1 className={`${variant}-page__title`} id={titleId}>
          {title}
        </h1>
        {subtitle && <p className={`${variant}-page__subtitle`}>{subtitle}</p>}
      </div>
      {actionLabel && onAction && <PrimaryAction className={`${variant}-page__action`} label={actionLabel} onClick={onAction} />}
    </section>
  );
}
