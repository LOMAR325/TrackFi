import { useMemo, useState } from "react";
import { useAppState } from "../app/useAppState";
import { PageHero } from "../components/common/PageHero";
import { SelectControl } from "../components/common/SelectControl";
import { SummaryList } from "../components/common/SummaryList";
import { Icon } from "../components/icons/Icon";
import { DateRangeFilter } from "../components/transactions/DateRangeFilter";
import { TransactionsTable } from "../components/transactions/TransactionsTable";
import type { TransactionType } from "../data";

function TransactionsPage() {
  const { categories, openModal, transactions } = useAppState();
  const [type, setType] = useState<"all" | TransactionType>("all");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date-desc");
  const [dateFrom, setDateFrom] = useState("2026-04-01");
  const [dateTo, setDateTo] = useState("2026-04-30");

  const categoryOptions = useMemo(() => {
    const names = new Set([...categories.map((item) => item.name), ...transactions.map((item) => item.category)]);
    return Array.from(names).filter(Boolean).sort();
  }, [categories, transactions]);

  const visibleTransactions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return transactions
      .filter((transaction) => {
        const matchesType = type === "all" || transaction.type === type;
        const matchesCategory = category === "all" || transaction.category === category;
        const matchesDate = transaction.date >= dateFrom && transaction.date <= dateTo;
        const text = `${transaction.description} ${transaction.category}`.toLowerCase();
        return matchesType && matchesCategory && matchesDate && text.includes(normalizedSearch);
      })
      .toSorted((first, second) => {
        if (sort === "amount-desc") {
          return second.amount - first.amount;
        }

        if (sort === "amount-asc") {
          return first.amount - second.amount;
        }

        return second.date.localeCompare(first.date);
      });
  }, [category, dateFrom, dateTo, search, sort, transactions, type]);

  return (
    <main className="transactions-page">
      <PageHero
        actionLabel="New Transaction"
        onAction={() => openModal("transaction")}
        subtitle="Review all your financial transactions."
        title="All Transactions"
        titleId="transactionsPageTitle"
        variant="transactions"
      />

      <section className="transactions-filters-card" aria-label="Transaction filters">
        <div className="transactions-filters">
          <DateRangeFilter dateFrom={dateFrom} dateTo={dateTo} setDateFrom={setDateFrom} setDateTo={setDateTo} />
          <SelectControl label="All Types" value={type} onChange={(value) => setType(value as "all" | TransactionType)}>
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </SelectControl>
          <SelectControl label="All Categories" value={category} onChange={setCategory}>
            <option value="all">All Categories</option>
            {categoryOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </SelectControl>
          <label className="search-control" htmlFor="transactionsSearch">
            <span className="search-control__icon" aria-hidden="true">
              <Icon name="search" />
            </span>
            <input
              className="search-control__input"
              id="transactionsSearch"
              type="search"
              autoComplete="off"
              placeholder="Search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="transactions-summary-card" aria-label="Financial summary">
        <SummaryList />
        <SelectControl className="transactions-summary__sort" label="Sort by: Date" value={sort} onChange={setSort}>
          <option value="date-desc">Sort by: Date</option>
          <option value="amount-desc">Amount high</option>
          <option value="amount-asc">Amount low</option>
        </SelectControl>
      </section>

      <section className="transactions-table-card" aria-label="Transactions list">
        <div className="transactions-table-wrap">
          <TransactionsTable transactions={visibleTransactions} />
        </div>
      </section>
    </main>
  );
}

export default TransactionsPage;
