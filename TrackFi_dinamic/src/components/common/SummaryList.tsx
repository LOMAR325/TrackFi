import { pageSummary } from "../../data";

export function SummaryList() {
  return (
    <div className="transactions-summary">
      {pageSummary.map((item) => (
        <article className={`transactions-summary__item transactions-summary__item--${item.tone}`} key={item.label}>
          <p className="transactions-summary__label">{item.label}</p>
          <p className="transactions-summary__value">{item.value}</p>
        </article>
      ))}
    </div>
  );
}
