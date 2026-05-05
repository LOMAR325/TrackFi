import type { Transaction } from "../../data";
import { formatCurrency, formatLongDate } from "../../utils/formatters";

export function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
  return (
    <table className="transactions-table">
      <colgroup>
        <col />
        <col />
        <col />
        <col />
        <col />
      </colgroup>
      <thead>
        <tr>
          <th className="transactions-table__head">Date</th>
          <th className="transactions-table__head">Type</th>
          <th className="transactions-table__head">Category</th>
          <th className="transactions-table__head">Description</th>
          <th className="transactions-table__head is-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((transaction) => (
          <tr className="transactions-table__row" key={transaction.id}>
            <td className="transactions-table__cell transactions-table__cell--date" data-label="Date">
              {formatLongDate(transaction.date)}
            </td>
            <td className="transactions-table__cell transactions-table__cell--type" data-label="Type">
              <span className={`transaction-badge transaction-badge--${transaction.type}`}>{transaction.type.toUpperCase()}</span>
            </td>
            <td className="transactions-table__cell transactions-table__cell--category" data-label="Category">
              {transaction.category}
            </td>
            <td className="transactions-table__cell transactions-table__cell--description" data-label="Description">
              {transaction.description}
            </td>
            <td className={`transactions-table__cell transactions-table__cell--amount ${transaction.type === "income" ? "is-income" : "is-expense"}`} data-label="Amount">
              {formatCurrency(transaction.amount)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
