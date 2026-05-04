const STORAGE_PREFIX = "trackfi-static";

export const STORAGE_KEYS = {
  theme: `${STORAGE_PREFIX}:theme`,
  user: `${STORAGE_PREFIX}:user`,
  transactions: `${STORAGE_PREFIX}:transactions`,
  categories: `${STORAGE_PREFIX}:categories`,
  goals: `${STORAGE_PREFIX}:goals`,
};

const DISPLAY_DATE = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
});

const DISPLAY_DATE_WITH_YEAR = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

const SHORT_DATE = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

export function readState(key, fallback) {
  try {
    const rawValue = localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch {
    return fallback;
  }
}

export function writeState(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Static demo mode keeps working even when storage is unavailable.
  }
}

export function generateId(prefix = "item") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getSavedUserProfile(defaultProfile) {
  const savedUser = readState(STORAGE_KEYS.user, {});
  const name = savedUser.name || defaultProfile.name;

  return {
    ...defaultProfile,
    ...savedUser,
    name,
    initials: getInitials(name),
  };
}

export function saveUserProfile(profile) {
  writeState(STORAGE_KEYS.user, {
    name: profile.name,
    email: profile.email,
  });
}

export function getInitials(name) {
  return String(name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U";
}

export function formatCurrency(value, options = {}) {
  const absoluteValue = Math.abs(Number(value) || 0);
  const hasCents = !Number.isInteger(absoluteValue);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: options.forceCents || hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(absoluteValue);
}

export function formatSignedCurrency(value) {
  const numericValue = Number(value) || 0;
  const sign = numericValue >= 0 ? "+" : "-";
  return `${sign}${formatCurrency(numericValue)}`;
}

export function parseCurrency(value) {
  return Number(String(value).replace(/[^0-9.-]/g, "")) || 0;
}

export function toIsoDate(date) {
  const safeDate = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
  const year = safeDate.getFullYear();
  const month = String(safeDate.getMonth() + 1).padStart(2, "0");
  const day = String(safeDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function parseDate(value, fallback = new Date()) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

export function formatDisplayDate(value, includeYear = false) {
  const date = parseDate(value);
  return (includeYear ? DISPLAY_DATE_WITH_YEAR : DISPLAY_DATE).format(date);
}

export function formatShortDate(value) {
  return SHORT_DATE.format(parseDate(value));
}

export function normalizeTransactions(rows) {
  return rows.map((row, index) => {
    const rawAmount = parseCurrency(row.amount);
    const tone = row.tone ? (row.tone === "income" ? "income" : "expense") : rawAmount >= 0 ? "income" : "expense";
    const amount = Math.abs(rawAmount) * (tone === "income" ? 1 : -1);
    const dateIso = row.dateIso || toIsoDate(parseDate(`${row.date}, 2026`, new Date(2026, 3, 25)));

    return {
      id: row.id || generateId(`transaction-${index + 1}`),
      dateIso,
      type: tone,
      category: row.category || (tone === "income" ? "Salary" : "Other"),
      description: row.description || row.title || "",
      amount,
      account: row.account || "Main Account",
    };
  });
}

export function readTransactions(fallbackRows = []) {
  return readState(STORAGE_KEYS.transactions, normalizeTransactions(fallbackRows));
}

export function writeTransactions(transactions) {
  writeState(STORAGE_KEYS.transactions, transactions);
}

export function createTransactionFromForm(values) {
  const type = values.type === "income" ? "income" : "expense";
  const rawAmount = Math.abs(parseCurrency(values.amount));

  return {
    id: generateId("transaction"),
    dateIso: values.dateIso || toIsoDate(parseDate(values.date)),
    type,
    category: values.category || (type === "income" ? "Salary" : "Other"),
    description: values.note || values.description || "Manual transaction",
    amount: type === "income" ? rawAmount : -rawAmount,
    account: values.account || "Main Account",
  };
}

export function transactionToTableRow(transaction) {
  const isIncome = transaction.type === "income" || transaction.amount >= 0;

  return {
    id: transaction.id,
    date: formatDisplayDate(transaction.dateIso),
    type: isIncome ? "INCOME" : "EXPENSE",
    category: transaction.category,
    description: transaction.description,
    amount: formatCurrency(transaction.amount, { forceCents: !Number.isInteger(Math.abs(transaction.amount)) }),
    tone: isIncome ? "income" : "expense",
  };
}

export function transactionToRecentItem(transaction) {
  return {
    id: transaction.id,
    title: transaction.category,
    category: transaction.description,
    amount: transaction.amount,
    date: formatShortDate(transaction.dateIso),
  };
}

export function calculateTransactionSummary(transactions) {
  const income = transactions
    .filter((transaction) => transaction.amount >= 0)
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const expenses = transactions
    .filter((transaction) => transaction.amount < 0)
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  const balance = income - expenses;

  return [
    { label: "Income", value: formatCurrency(income), tone: "income" },
    { label: "Expenses", value: formatCurrency(expenses), tone: "expense" },
    { label: "Balance", value: formatCurrency(balance), tone: "balance" },
  ];
}
