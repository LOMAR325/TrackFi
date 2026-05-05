import { useState } from "react";
import { Icon } from "../icons/Icon";
import { Button } from "../ui";

type DateRangeFilterProps = {
  dateFrom: string;
  dateTo: string;
  setDateFrom: (value: string) => void;
  setDateTo: (value: string) => void;
};

export function DateRangeFilter({ dateFrom, dateTo, setDateFrom, setDateTo }: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(dateFrom);
  const [draftTo, setDraftTo] = useState(dateTo);
  const label = `${new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(dateFrom))} - ${new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(dateTo))}`;

  function applyRange() {
    setDateFrom(draftFrom);
    setDateTo(draftTo);
    setOpen(false);
  }

  function resetRange() {
    setDraftFrom("2026-04-01");
    setDraftTo("2026-04-30");
    setDateFrom("2026-04-01");
    setDateTo("2026-04-30");
    setOpen(false);
  }

  return (
    <div className="date-filter">
      <button className="filter-control filter-control--date" type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <span className="filter-control__icon" aria-hidden="true">
          <Icon name="calendar" />
        </span>
        <span className="filter-control__text">{label}</span>
        <span className="filter-control__chevron" aria-hidden="true">
          <Icon name="chevron" />
        </span>
      </button>
      {open && (
        <div className="date-popover">
          <label className="date-popover__field" htmlFor="dateFrom">
            <span>From</span>
            <input id="dateFrom" type="date" value={draftFrom} onChange={(event) => setDraftFrom(event.target.value)} />
          </label>
          <label className="date-popover__field" htmlFor="dateTo">
            <span>To</span>
            <input id="dateTo" type="date" value={draftTo} onChange={(event) => setDraftTo(event.target.value)} />
          </label>
          <div className="date-popover__actions">
            <Button className="transaction-modal__button transaction-modal__button--secondary" type="button" onClick={resetRange} variant="secondary">
              Reset
            </Button>
            <Button className="transaction-modal__button transaction-modal__button--primary" type="button" onClick={applyRange}>
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
