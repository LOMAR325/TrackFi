import type { Transaction } from "../../data";
import { formatShortDate, formatSignedCurrency } from "../../utils/formatters";

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  return (
    <div className="transaction-list">
      {transactions.map((transaction) => (
        <article className="transaction" key={transaction.id}>
          <div className="transaction__copy">
            <p className="transaction__title">{transaction.description}</p>
            {transaction.category && <p className="transaction__category">{transaction.category}</p>}
          </div>
          <p className={`transaction__amount ${transaction.type === "income" ? "is-income" : "is-expense"}`}>
            {formatSignedCurrency(transaction)}
          </p>
          <p className="transaction__date">{formatShortDate(transaction.date)}</p>
        </article>
      ))}
    </div>
  );
}
