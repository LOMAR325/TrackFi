import {
  Link,
  Outlet,
  RouterProvider,
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  useNavigate,
} from "@tanstack/react-router";
import type { FormEvent, MouseEvent, ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import "./App.css";
import {
  analyticsChartData,
  analyticsSpending,
  dashboardChartData,
  dashboardSpending,
  dashboardStats,
  navigationItems,
  pageSummary,
} from "./data";
import type {
  Category,
  ChartData,
  Goal,
  NavId,
  SpendingCategory,
  Theme,
  Transaction,
  TransactionType,
} from "./data";
import {
  createInitialState,
  saveStoredValue,
  storageKeys,
  trackFiReducer,
} from "./state";
import type { ModalKind } from "./state";
import { UiButton, UiModal } from "./ui";
import {
  categorySchema,
  contributionSchema,
  getValidationMessage,
  goalSchema,
  loginSchema,
  passwordSchema,
  settingsSchema,
  transactionSchema,
} from "./validation";

type AppState = {
  userName: string;
  userEmail: string;
  theme: Theme;
  transactions: Transaction[];
  categories: Category[];
  goals: Goal[];
  openModal: (kind: ModalKind) => void;
  closeModal: () => void;
  activeModal: ModalKind | null;
  editingCategory: Category | null;
  editingGoal: Goal | null;
  selectedGoal: Goal | null;
  setTheme: (theme: Theme) => void;
  setUserName: (name: string) => void;
  setUserEmail: (email: string) => void;
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  startCategoryCreate: () => void;
  startCategoryEdit: (category: Category) => void;
  saveCategory: (name: string) => void;
  deleteCategory: (id: string) => void;
  startGoalCreate: () => void;
  startGoalEdit: (goal: Goal) => void;
  startGoalContribution: (goal: Goal) => void;
  saveGoal: (goal: Omit<Goal, "id">) => void;
  saveContribution: (amount: number) => void;
  deleteGoal: (id: string) => void;
};

const AppContext = createContext<AppState | null>(null);

function useAppState() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppState must be used inside AppProvider");
  }

  return context;
}

function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(trackFiReducer, undefined, createInitialState);

  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
    saveStoredValue(storageKeys.theme, state.theme);
  }, [state.theme]);

  useEffect(() => saveStoredValue(storageKeys.userName, state.userName), [state.userName]);
  useEffect(() => saveStoredValue(storageKeys.userEmail, state.userEmail), [state.userEmail]);
  useEffect(() => saveStoredValue(storageKeys.transactions, state.transactions), [state.transactions]);
  useEffect(() => saveStoredValue(storageKeys.categories, state.categories), [state.categories]);
  useEffect(() => saveStoredValue(storageKeys.goals, state.goals), [state.goals]);

  useEffect(() => {
    document.body.classList.toggle("modal-open", state.activeModal !== null);

    return () => document.body.classList.remove("modal-open");
  }, [state.activeModal]);

  function openModal(kind: ModalKind) {
    dispatch({ type: "openModal", kind });
  }

  function closeModal() {
    dispatch({ type: "closeModal" });
  }

  function addTransaction(transaction: Omit<Transaction, "id">) {
    dispatch({ type: "addTransaction", transaction });
  }

  function startCategoryCreate() {
    dispatch({ type: "startCategoryCreate" });
  }

  function startCategoryEdit(category: Category) {
    dispatch({ type: "startCategoryEdit", category });
  }

  function saveCategory(name: string) {
    dispatch({ type: "saveCategory", name });
  }

  function deleteCategory(id: string) {
    if (window.confirm("Delete this category?")) {
      dispatch({ type: "deleteCategory", id });
    }
  }

  function startGoalCreate() {
    dispatch({ type: "startGoalCreate" });
  }

  function startGoalEdit(goal: Goal) {
    dispatch({ type: "startGoalEdit", goal });
  }

  function startGoalContribution(goal: Goal) {
    dispatch({ type: "startGoalContribution", goal });
  }

  function saveGoal(goal: Omit<Goal, "id">) {
    dispatch({ type: "saveGoal", goal });
  }

  function saveContribution(amount: number) {
    dispatch({ type: "saveContribution", amount });
  }

  function deleteGoal(id: string) {
    if (window.confirm("Delete this goal?")) {
      dispatch({ type: "deleteGoal", id });
    }
  }

  const value: AppState = {
    userName: state.userName,
    userEmail: state.userEmail,
    theme: state.theme,
    transactions: state.transactions,
    categories: state.categories,
    goals: state.goals,
    openModal,
    closeModal,
    activeModal: state.activeModal,
    editingCategory: state.editingCategory,
    editingGoal: state.editingGoal,
    selectedGoal: state.selectedGoal,
    setTheme: (theme) => dispatch({ type: "setTheme", theme }),
    setUserName: (name) => dispatch({ type: "setUserName", name }),
    setUserEmail: (email) => dispatch({ type: "setUserEmail", email }),
    addTransaction,
    startCategoryCreate,
    startCategoryEdit,
    saveCategory,
    deleteCategory,
    startGoalCreate,
    startGoalEdit,
    startGoalContribution,
    saveGoal,
    saveContribution,
    deleteGoal,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

function formatCurrency(value: number) {
  const hasCents = !Number.isInteger(value);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatSignedCurrency(transaction: Transaction) {
  const sign = transaction.type === "income" ? "+" : "-";
  return `${sign}${formatCurrency(transaction.amount)}`;
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(value));
}

function formatLongDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric" }).format(new Date(value));
}

function getGoalProgress(goal: Goal) {
  return Math.min(Math.max((goal.current / goal.target) * 100, 0), 100);
}

function getGoalProgressColor(progress: number) {
  const hue = Math.round((progress / 100) * 120);
  const lightness = progress < 8 ? 52 : 42;

  return `hsl(${hue} 78% ${lightness}%)`;
}

function RootComponent() {
  return <Outlet />;
}

function DashboardRoute() {
  return (
    <AppLayout activeId="dashboard">
      <DashboardPage />
    </AppLayout>
  );
}

function TransactionsRoute() {
  return (
    <AppLayout activeId="transactions">
      <TransactionsPage />
    </AppLayout>
  );
}

function CategoriesRoute() {
  return (
    <AppLayout activeId="categories">
      <CategoriesPage />
    </AppLayout>
  );
}

function AnalyticsRoute() {
  return (
    <AppLayout activeId="analytics">
      <AnalyticsPage />
    </AppLayout>
  );
}

function GoalsRoute() {
  return (
    <AppLayout activeId="goals">
      <GoalsPage />
    </AppLayout>
  );
}

function SettingsRoute() {
  return (
    <AppLayout activeId="settings">
      <SettingsPage />
    </AppLayout>
  );
}

const rootRoute = createRootRoute({ component: RootComponent });
const loginIndexRoute = createRoute({ getParentRoute: () => rootRoute, path: "/", component: LoginPage });
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardRoute,
});
const transactionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/transactions",
  component: TransactionsRoute,
});
const categoriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/categories",
  component: CategoriesRoute,
});
const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/analytics",
  component: AnalyticsRoute,
});
const goalsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/goals", component: GoalsRoute });
const settingsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/settings", component: SettingsRoute });
const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: "/login", component: LoginPage });

const routeTree = rootRoute.addChildren([
  loginIndexRoute,
  dashboardRoute,
  transactionsRoute,
  categoriesRoute,
  analyticsRoute,
  goalsRoute,
  settingsRoute,
  loginRoute,
]);

const router = createRouter({
  routeTree,
  history: createHashHistory(),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}

function AppLayout({ activeId, children }: { activeId: NavId; children: ReactNode }) {
  const { activeModal, closeModal } = useAppState();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("sidebar-open", sidebarOpen);

    return () => document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  return (
    <div className="app-shell">
      <Header sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((open) => !open)} />
      <div className="app-layout">
        <Sidebar activeId={activeId} onNavigate={() => setSidebarOpen(false)} />
        {children}
      </div>
      <button
        className="sidebar-backdrop"
        type="button"
        aria-label="Close navigation"
        onClick={() => setSidebarOpen(false)}
      />
      {activeModal === "transaction" && <TransactionModal onClose={closeModal} />}
      {activeModal === "category" && <CategoryModal onClose={closeModal} />}
      {activeModal === "goal" && <GoalModal onClose={closeModal} />}
      {activeModal === "contribution" && <ContributionModal onClose={closeModal} />}
      {activeModal === "password" && <PasswordModal onClose={closeModal} />}
    </div>
  );
}

function Header({
  sidebarOpen,
  onToggleSidebar,
}: {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}) {
  const { userName } = useAppState();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="app-header">
      <div className="app-header__left">
        <button
          className="header-menu-toggle"
          type="button"
          aria-label="Toggle navigation"
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          onClick={onToggleSidebar}
        >
          <Icon name="menu" />
        </button>
        <Link className="brand" to="/dashboard" aria-label="TrackFi dashboard">
          <span className="brand__icon" aria-hidden="true">
            <BrandIcon />
          </span>
          <span className="brand__label">TrackFi</span>
        </Link>
      </div>

      <div className={`user-dropdown ${menuOpen ? "is-open" : ""}`}>
        <button
          className="user-dropdown__trigger"
          type="button"
          aria-haspopup="true"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="user-dropdown__avatar" aria-hidden="true">
            {userName.slice(0, 1).toUpperCase()}
          </span>
          <span className="user-dropdown__name">{userName}</span>
          <span className="user-dropdown__chevron" aria-hidden="true">
            <Icon name="chevron" />
          </span>
        </button>
        <div className="user-dropdown__menu" role="menu" aria-label="User menu">
          <Link className="user-dropdown__menu-item" role="menuitem" to="/" onClick={() => setMenuOpen(false)}>
            Sign Out
          </Link>
        </div>
      </div>
    </header>
  );
}

function Sidebar({ activeId, onNavigate }: { activeId: NavId; onNavigate: () => void }) {
  const primaryItems = navigationItems.filter((item) => item.id !== "settings");
  const secondaryItems = navigationItems.filter((item) => item.id === "settings");

  return (
    <aside className="sidebar" id="sidebar">
      <nav className="sidebar__nav" aria-label="Primary navigation">
        <div className="sidebar__groups">
          <SidebarList activeId={activeId} items={primaryItems} onNavigate={onNavigate} />
          <SidebarList activeId={activeId} extraClassName="sidebar__list--secondary" items={secondaryItems} onNavigate={onNavigate} />
        </div>
      </nav>
    </aside>
  );
}

function SidebarList({
  activeId,
  extraClassName = "",
  items,
  onNavigate,
}: {
  activeId: NavId;
  extraClassName?: string;
  items: typeof navigationItems;
  onNavigate: () => void;
}) {
  return (
    <ul className={`sidebar__list ${extraClassName}`}>
      {items.map((item) => (
        <li className="sidebar__list-item" key={item.id}>
          <Link
            className={`sidebar__item ${item.id === activeId ? "is-active" : ""}`}
            to={item.to}
            aria-current={item.id === activeId ? "page" : undefined}
            onClick={onNavigate}
          >
            <span className={`sidebar__icon sidebar__icon--${item.icon}`} aria-hidden="true">
              <Icon name={item.icon} />
            </span>
            <span className="sidebar__label">{item.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function PageHero({
  className,
  title,
  subtitle,
  action,
}: {
  className: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <section className={`${className}__hero`} aria-labelledby={`${className}Title`}>
      <div className={`${className}__hero-copy`}>
        <h1 className={`${className}__title`} id={`${className}Title`}>
          {title}
        </h1>
        <p className={`${className}__subtitle`}>{subtitle}</p>
      </div>
      {action}
    </section>
  );
}

function DashboardPage() {
  const { goals, openModal, transactions, userName } = useAppState();
  const recentTransactions = transactions.slice(0, 6);

  return (
    <main className="dashboard">
      <section className="dashboard-hero" aria-labelledby="dashboardHeading">
        <div className="dashboard-hero__content">
          <h1 className="dashboard-hero__title" id="dashboardHeading">
            Welcome back, <span>{userName}</span>!
          </h1>
          <p className="dashboard-hero__subtitle">Here&apos;s your financial overview.</p>
        </div>
        <PrimaryAction label="New Transaction" onClick={() => openModal("transaction")} />
      </section>

      <section className="dashboard-stats" aria-label="Financial highlights">
        {dashboardStats.map((card) => (
          <article className={`stat-card stat-card--span-${card.columnSpan} stat-card--${card.tone}`} key={card.title}>
            <p className="stat-card__label">{card.title}</p>
            <p className="stat-card__value">{card.valueText}</p>
          </article>
        ))}
      </section>

      <section className="dashboard-columns" aria-label="Dashboard insights">
        <div className="dashboard-column">
          <OverviewCard data={dashboardChartData} title="Income & Expense Overview" />
          <SpendingCard categories={dashboardSpending} title="Spending Breakdown" />
        </div>

        <div className="dashboard-column">
          <article className="card recent-transactions-card" aria-labelledby="recentTransactionsTitle">
            <CardHeader actionTo="/transactions" actionText="View All" id="recentTransactionsTitle" title="Recent Transactions" />
            <div className="card__body">
              <TransactionList transactions={recentTransactions} />
            </div>
          </article>

          <article className="card budget-goals-card" aria-labelledby="budgetGoalsTitle">
            <CardHeader actionTo="/goals" actionText="View All" id="budgetGoalsTitle" title="Budget Goals" />
            <div className="card__body">
              <div className="budget-goals-list">
                {goals.slice(0, 5).map((goal) => (
                  <BudgetGoalItem goal={goal} key={goal.id} />
                ))}
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

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
        action={<PrimaryAction label="New Transaction" onClick={() => openModal("transaction")} />}
        className="transactions-page"
        subtitle="Review all your financial transactions."
        title="All Transactions"
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

function CategoriesPage() {
  const { categories, deleteCategory, startCategoryCreate, startCategoryEdit } = useAppState();

  return (
    <main className="categories-page">
      <PageHero
        action={<PrimaryAction className="new-transaction-button--compact" label="New Category" onClick={startCategoryCreate} />}
        className="categories-page"
        subtitle="Review all your categories"
        title="Categories"
      />

      <section className="categories-card" aria-label="Categories list">
        <div className="categories-list" role="list">
          {categories.map((category) => (
            <article className="category-row" key={category.id} role="listitem">
              <p className="category-row__name">{category.name}</p>
              <div className="category-row__actions" role="group" aria-label={`${category.name} actions`}>
                <button className="category-action" type="button" onClick={() => startCategoryEdit(category)}>
                  Edit
                </button>
                <button className="category-action category-action--delete" type="button" onClick={() => deleteCategory(category.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function AnalyticsPage() {
  return (
    <main className="analytics-page">
      <PageHero className="analytics-page" subtitle="Review all your Analytics" title="Analytics" />
      <section className="transactions-summary-card analytics-summary-card" aria-label="Financial summary">
        <SummaryList />
      </section>
      <OverviewCard cardClassName="analytics-overview-card" chartClassName="analytics-overview-card__chart" data={analyticsChartData} title="Income & Expense Overview" />
      <SpendingCard
        cardClassName="analytics-spending-card"
        categories={analyticsSpending}
        legendClassName="analytics-spending-card__legends"
        title="Spending Breakdown"
      />
    </main>
  );
}

function GoalsPage() {
  const { deleteGoal, goals, startGoalContribution, startGoalCreate, startGoalEdit } = useAppState();

  return (
    <main className="goals-page">
      <PageHero
        action={<PrimaryAction className="new-transaction-button--goal" label="New Goal" onClick={startGoalCreate} />}
        className="goals-page"
        subtitle="Review all your goals."
        title="Goals"
      />

      <section className="transactions-summary-card goals-summary-card" aria-label="Financial summary">
        <SummaryList />
      </section>

      <section className="goals-manager-card" aria-label="Goals list">
        <div className="goals-manager" role="list">
          {goals.map((goal) => {
            const progress = getGoalProgress(goal);
            const progressColor = getGoalProgressColor(progress);

            return (
              <article className="goal-row" key={goal.id} role="listitem">
                <div className="goal-row__content">
                  <div className="goal-row__meta">
                    <div className="goal-row__title-group">
                      <p className="goal-row__name">{goal.name}</p>
                      <p className="goal-row__label">Savings Progress</p>
                    </div>
                    <p className="goal-row__value">
                      <span className="goal-row__value-current">{formatCurrency(goal.current)}</span>
                      <span className="goal-row__value-separator"> / </span>
                      <span className="goal-row__value-target">{formatCurrency(goal.target)}</span>
                    </p>
                  </div>
                  <ProgressBar color={progressColor} label={`${goal.name} progress`} progress={progress} trackClassName="goal-row__track" barClassName="goal-row__bar" />
                </div>
                <div className="goal-row__actions" role="group" aria-label={`${goal.name} actions`}>
                  <button className="goal-row__contribute" type="button" onClick={() => startGoalContribution(goal)}>
                    Contribute
                  </button>
                  <div className="goal-row__minor-actions">
                    <button className="category-action" type="button" onClick={() => startGoalEdit(goal)}>
                      Edit
                    </button>
                    <button className="category-action category-action--delete" type="button" onClick={() => deleteGoal(goal.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function SettingsPage() {
  const { openModal, setTheme, setUserName, theme, userEmail, userName } = useAppState();
  const [draftName, setDraftName] = useState(userName);
  const nameInputRef = useRef<HTMLInputElement>(null);

  function saveSettings() {
    const parsedSettings = settingsSchema.safeParse({ name: draftName });

    if (!parsedSettings.success) {
      window.alert(getValidationMessage(parsedSettings.error));
      nameInputRef.current?.focus();
      return;
    }

    setUserName(parsedSettings.data.name);
    window.alert("Settings saved");
  }

  return (
    <main className="settings-page">
      <section className="settings-page__hero" aria-labelledby="settingsPageTitle">
        <h1 className="settings-page__title" id="settingsPageTitle">
          Settings
        </h1>
      </section>

      <section className="settings-layout" aria-label="Settings panels">
        <article className="settings-card account-settings-card">
          <div className="settings-card__header">
            <h2 className="settings-card__title">Account Settings</h2>
          </div>
          <div className="account-settings-card__body">
            <div className="account-settings-card__row">
              <label className="settings-field" htmlFor="settingsName">
                <span className="settings-field__label">Name</span>
                <input
                  className="settings-field__input"
                  id="settingsName"
                  ref={nameInputRef}
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                />
              </label>
              <p className="settings-field__email">{userEmail}</p>
              <button
                className="settings-edit-button"
                type="button"
                onClick={() => {
                  nameInputRef.current?.focus();
                  nameInputRef.current?.select();
                }}
              >
                Edit
              </button>
            </div>
            <button className="settings-link" type="button" onClick={() => openModal("password")}>
              Change password
            </button>
          </div>
        </article>

        <article className="settings-card appearance-card">
          <div className="settings-card__header">
            <h2 className="settings-card__title">Appearance</h2>
          </div>
          <div className="appearance-card__body">
            <div className="appearance-card__group">
              <p className="appearance-card__label">Theme</p>
              <div className="theme-toggle" role="group" aria-label="Theme">
                <button
                  className={`theme-toggle__option ${theme === "light" ? "is-active" : ""}`}
                  type="button"
                  onClick={() => setTheme("light")}
                >
                  <span className="theme-toggle__icon" aria-hidden="true">
                    <Icon name="sun" />
                  </span>
                  <span className="theme-toggle__label">Light</span>
                </button>
                <button
                  className={`theme-toggle__option ${theme === "dark" ? "is-active" : ""}`}
                  type="button"
                  onClick={() => setTheme("dark")}
                >
                  <span className="theme-toggle__icon" aria-hidden="true">
                    <Icon name="moon" />
                  </span>
                  <span className="theme-toggle__label">Dark</span>
                </button>
              </div>
            </div>
          </div>
        </article>
      </section>

      <div className="settings-actions">
        <UiButton className="save-settings-button" type="button" onClick={saveSettings}>
          Save Changes
        </UiButton>
      </div>
    </main>
  );
}

function LoginPage() {
  const { setUserEmail } = useAppState();
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const parsedLogin = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsedLogin.success) {
      window.alert(getValidationMessage(parsedLogin.error));
      return;
    }

    setUserEmail(parsedLogin.data.email);
    void navigate({ to: "/dashboard" });
  }

  return (
    <div className="login-page">
      <header className="app-header login-page__header">
        <Link className="brand" to="/" aria-label="TrackFi home">
          <span className="brand__icon" aria-hidden="true">
            <BrandIcon />
          </span>
          <span className="brand__label">TrackFi</span>
        </Link>
      </header>

      <main className="login-page__main">
        <section className="login-card" aria-labelledby="loginTitle">
          <div className="login-card__intro">
            <h1 className="login-card__title" id="loginTitle">
              Welcome back
            </h1>
            <p className="login-card__subtitle">Log in to manage your finances</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-field" htmlFor="loginEmail">
              <span className="login-field__label">Email</span>
              <span className="login-field__control">
                <span className="login-field__icon login-field__icon--mail" aria-hidden="true">
                  <Icon name="mail" />
                </span>
                <input
                  autoComplete="email"
                  className="login-field__input"
                  id="loginEmail"
                  name="email"
                  placeholder="Email address"
                  required
                  type="email"
                />
              </span>
            </label>
            <label className="login-field" htmlFor="loginPassword">
              <span className="login-field__label">Password</span>
              <span className="login-field__control">
                <span className="login-field__icon login-field__icon--password" aria-hidden="true">
                  <Icon name="lock" />
                </span>
                <input
                  autoComplete="current-password"
                  className="login-field__input"
                  id="loginPassword"
                  name="password"
                  placeholder="Password"
                  required
                  type="password"
                />
              </span>
            </label>
            <UiButton className="login-submit" type="submit">
              Log in
            </UiButton>
          </form>
        </section>
      </main>
    </div>
  );
}

function PrimaryAction({
  className = "",
  label,
  onClick,
}: {
  className?: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <UiButton className={`new-transaction-button ${className}`} type="button" onClick={onClick}>
      <span className="new-transaction-button__icon" aria-hidden="true">
        <Icon name="plus" />
      </span>
      <span>{label}</span>
    </UiButton>
  );
}

function CardHeader({
  actionText,
  actionTo,
  id,
  title,
}: {
  actionText: string;
  actionTo: string;
  id: string;
  title: string;
}) {
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

function SummaryList() {
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

function TransactionList({ transactions }: { transactions: Transaction[] }) {
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

function BudgetGoalItem({ goal }: { goal: Goal }) {
  const progress = getGoalProgress(goal);
  const progressColor = getGoalProgressColor(progress);

  return (
    <article className="budget-goal">
      <div className="budget-goal__meta">
        <p className="budget-goal__name">{goal.name}</p>
        <p className="budget-goal__value">
          <span className="budget-goal__value-current">{formatCurrency(goal.current)}</span>
          <span className="budget-goal__value-separator"> / </span>
          <span className="budget-goal__value-target">{formatCurrency(goal.target)}</span>
        </p>
      </div>
      <ProgressBar color={progressColor} label={`${goal.name} progress`} progress={progress} trackClassName="budget-goal__track" barClassName="budget-goal__bar" />
    </article>
  );
}

function ProgressBar({
  barClassName,
  color,
  label,
  progress,
  trackClassName,
}: {
  barClassName: string;
  color: string;
  label: string;
  progress: number;
  trackClassName: string;
}) {
  return (
    <div className={trackClassName} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
      <span className={barClassName} style={{ width: `${progress}%`, background: color }} />
    </div>
  );
}

function OverviewCard({
  cardClassName = "overview-card",
  chartClassName = "",
  data,
  title,
}: {
  cardClassName?: string;
  chartClassName?: string;
  data: ChartData;
  title: string;
}) {
  const articleClassName = `card overview-card ${cardClassName === "overview-card" ? "" : cardClassName}`.trim();

  return (
    <article className={articleClassName} aria-labelledby={`${cardClassName}Title`}>
      <div className="card__header">
        <h2 className="card__title" id={`${cardClassName}Title`}>
          {title}
        </h2>
      </div>
      <div className="card__body">
        <div className={`chart-shell chart-shell--overview ${chartClassName}`}>
          <OverviewChart data={data} />
        </div>
        <div className="overview-card__legend" aria-label="Overview chart legend">
          <span className="overview-card__legend-item">
            <span className="overview-card__legend-swatch overview-card__legend-swatch--income" />
            <span>Income</span>
          </span>
          <span className="overview-card__legend-item">
            <span className="overview-card__legend-swatch overview-card__legend-swatch--expenses" />
            <span>Expenses</span>
          </span>
        </div>
      </div>
    </article>
  );
}

function SpendingCard({
  cardClassName = "spending-card",
  categories,
  legendClassName = "spending-card__legend",
  title,
}: {
  cardClassName?: string;
  categories: SpendingCategory[];
  legendClassName?: string;
  title: string;
}) {
  const legendGroups = legendClassName === "analytics-spending-card__legends" ? [categories.slice(0, 3), categories.slice(3)] : [categories];
  const articleClassName = `card spending-card ${cardClassName === "spending-card" ? "" : cardClassName}`.trim();

  return (
    <article className={articleClassName} aria-labelledby={`${cardClassName}Title`}>
      <div className="card__header">
        <h2 className="card__title" id={`${cardClassName}Title`}>
          {title}
        </h2>
      </div>
      <div className={`card__body ${cardClassName}__body`}>
        <div className="chart-shell chart-shell--spending">
          <PieChart categories={categories} />
        </div>
        <div className={legendClassName}>
          {legendGroups.map((group, index) => (
            <div className={legendGroups.length > 1 ? "analytics-spending-card__legend-column" : ""} key={index}>
              <SpendingLegend categories={group} />
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function SpendingLegend({ categories }: { categories: SpendingCategory[] }) {
  return (
    <>
      {categories.map((category) => (
        <div className="spending-legend__item" key={category.label}>
          <div className="spending-legend__label-group">
            <span className="spending-legend__swatch" style={{ background: category.color }} />
            <p className="spending-legend__label">{category.label}</p>
          </div>
          <p className="spending-legend__value">{formatCurrency(category.value)}</p>
        </div>
      ))}
    </>
  );
}

function OverviewChart({ data }: { data: ChartData }) {
  const { theme } = useAppState();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hitTargetsRef = useRef<{ x: number; y: number; width: number; height: number; text: string }[]>([]);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const draw = () => {
      const context = canvas.getContext("2d");

      if (!context) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, rect.width, rect.height);

      const styles = getComputedStyle(document.documentElement);
      const text = styles.getPropertyValue("--text").trim() || "#1f2937";
      const divider = styles.getPropertyValue("--divider").trim() || "#f4f4f4";
      const surface = styles.getPropertyValue("--surface").trim() || "#ffffff";
      const success = styles.getPropertyValue("--success").trim() || "#2f7c33";
      const danger = styles.getPropertyValue("--danger").trim() || "#cd1f2e";
      const padding = {
        top: 10,
        right: data.labels.length > 6 ? 24 : 18,
        bottom: 34,
        left: 52,
      };
      const chartWidth = rect.width - padding.left - padding.right;
      const chartHeight = rect.height - padding.top - padding.bottom;
      const bottom = padding.top + chartHeight;
      const maxValue = data.suggestedMax;
      const slot = chartWidth / data.labels.length;
      const barWidth = Math.min(data.labels.length > 6 ? 16 : 18, slot / 5);
      const barGap = Math.min(8, slot / 10);

      const yAt = (value: number) => bottom - (value / maxValue) * chartHeight;
      const centerXAt = (index: number) => padding.left + slot * index + slot / 2;
      const targets: typeof hitTargetsRef.current = [];

      context.lineWidth = 1;
      context.strokeStyle = divider;
      context.fillStyle = text;
      context.font = '400 16px "Inter", system-ui, sans-serif';
      context.textAlign = "right";
      context.textBaseline = "middle";

      [0, 1000, 2000, 3000, 4000].forEach((value) => {
        const y = yAt(value);
        context.beginPath();
        context.moveTo(padding.left, y);
        context.lineTo(rect.width - padding.right, y);
        context.stroke();
        context.fillText(value === 0 ? "0" : `${value / 1000}k`, padding.left - 14, y);
      });

      context.textAlign = "center";
      context.textBaseline = "top";
      data.labels.forEach((label, index) => {
        context.fillText(label, centerXAt(index), bottom + 14);
      });

      data.labels.forEach((label, index) => {
        const center = centerXAt(index);
        const incomeValue = data.incomeBars[index] ?? 0;
        const expenseValue = data.expenseBars[index] ?? 0;
        const incomeX = center - barGap / 2 - barWidth;
        const expenseX = center + barGap / 2;
        const incomeY = yAt(incomeValue);
        const expenseY = yAt(expenseValue);

        context.fillStyle = success;
        context.fillRect(incomeX, incomeY, barWidth, bottom - incomeY);
        context.fillStyle = danger;
        context.fillRect(expenseX, expenseY, barWidth, bottom - expenseY);

        targets.push({
          x: incomeX - 5,
          y: incomeY,
          width: barWidth + 10,
          height: bottom - incomeY,
          text: `${label}: Income ${formatCurrency(incomeValue)}`,
        });
        targets.push({
          x: expenseX - 5,
          y: expenseY,
          width: barWidth + 10,
          height: bottom - expenseY,
          text: `${label}: Expenses ${formatCurrency(expenseValue)}`,
        });
      });

      drawLine(context, data.incomeLine, success, surface, padding.left, slot, bottom, chartHeight, maxValue);
      drawLine(context, data.expenseLine, danger, surface, padding.left, slot, bottom, chartHeight, maxValue);

      data.labels.forEach((label, index) => {
        const x = centerXAt(index);
        const incomeY = yAt(data.incomeLine[index] ?? 0);
        const expenseY = yAt(data.expenseLine[index] ?? 0);

        targets.push({
          x: x - 12,
          y: incomeY - 12,
          width: 24,
          height: 24,
          text: `${label}: Income trend ${formatCurrency(data.incomeLine[index] ?? 0)}`,
        });
        targets.push({
          x: x - 12,
          y: expenseY - 12,
          width: 24,
          height: 24,
          text: `${label}: Expense trend ${formatCurrency(data.expenseLine[index] ?? 0)}`,
        });
      });

      hitTargetsRef.current = targets;
    };

    draw();

    const observer = new ResizeObserver(draw);
    observer.observe(canvas);

    return () => observer.disconnect();
  }, [data, theme]);

  function handlePointerMove(event: MouseEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const target = hitTargetsRef.current.find(
      (item) => x >= item.x && x <= item.x + item.width && y >= item.y && y <= item.y + item.height,
    );

    if (target) {
      setTooltip({ x, y, text: target.text });
    } else {
      setTooltip(null);
    }
  }

  return (
    <>
      <canvas
        className="chart-canvas"
        ref={canvasRef}
        role="img"
        aria-label="Income and expenses chart"
        onMouseMove={handlePointerMove}
        onMouseLeave={() => setTooltip(null)}
      />
      {tooltip && (
        <div className="chart-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          {tooltip.text}
        </div>
      )}
    </>
  );
}

function PieChart({ categories }: { categories: SpendingCategory[] }) {
  const { theme } = useAppState();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const slicesRef = useRef<{ start: number; end: number; text: string }[]>([]);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const draw = () => {
      const context = canvas.getContext("2d");

      if (!context) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const total = categories.reduce((sum, category) => sum + category.value, 0);
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const radius = Math.max(20, Math.min(rect.width, rect.height) / 2 - 10);
      let start = -Math.PI / 2;

      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, rect.width, rect.height);
      context.font = '700 18px "Inter", system-ui, sans-serif';
      context.textAlign = "center";
      context.textBaseline = "middle";

      const slices: typeof slicesRef.current = [];

      categories.forEach((category) => {
        const share = total ? category.value / total : 0;
        const end = start + share * Math.PI * 2;
        const middle = start + (end - start) / 2;

        context.beginPath();
        context.moveTo(centerX, centerY);
        context.arc(centerX, centerY, radius, start, end);
        context.closePath();
        context.fillStyle = category.color;
        context.fill();
        context.strokeStyle = "#ffffff";
        context.lineWidth = 2;
        context.stroke();

        if (share > 0.07) {
          context.fillStyle = "#ffffff";
          context.fillText(`${Math.round(share * 100)}%`, centerX + Math.cos(middle) * radius * 0.58, centerY + Math.sin(middle) * radius * 0.58);
        }

        slices.push({ start, end, text: `${category.label}: ${formatCurrency(category.value)}` });
        start = end;
      });

      slicesRef.current = slices;
    };

    draw();

    const observer = new ResizeObserver(draw);
    observer.observe(canvas);

    return () => observer.disconnect();
  }, [categories, theme]);

  function handlePointerMove(event: MouseEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.max(20, Math.min(rect.width, rect.height) / 2 - 10);
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.hypot(dx, dy);

    if (distance > radius) {
      setTooltip(null);
      return;
    }

    let angle = Math.atan2(dy, dx);

    if (angle < -Math.PI / 2) {
      angle += Math.PI * 2;
    }

    const target = slicesRef.current.find((slice) => angle >= slice.start && angle <= slice.end);

    if (target) {
      setTooltip({ x, y, text: target.text });
    } else {
      setTooltip(null);
    }
  }

  return (
    <>
      <canvas
        className="chart-canvas"
        ref={canvasRef}
        role="img"
        aria-label="Spending breakdown chart"
        onMouseMove={handlePointerMove}
        onMouseLeave={() => setTooltip(null)}
      />
      {tooltip && (
        <div className="chart-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          {tooltip.text}
        </div>
      )}
    </>
  );
}

function drawLine(
  context: CanvasRenderingContext2D,
  values: number[],
  color: string,
  surface: string,
  left: number,
  slot: number,
  bottom: number,
  chartHeight: number,
  maxValue: number,
) {
  const points = values.map((value, index) => ({
    x: left + slot * index + slot / 2,
    y: bottom - (value / maxValue) * chartHeight,
  }));

  context.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      context.moveTo(point.x, point.y);
      return;
    }

    context.lineTo(point.x, point.y);
  });
  context.strokeStyle = color;
  context.lineWidth = 2.5;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.stroke();

  points.forEach((point) => {
    context.beginPath();
    context.arc(point.x, point.y, 5.2, 0, Math.PI * 2);
    context.fillStyle = surface;
    context.fill();
    context.strokeStyle = color;
    context.lineWidth = 2.4;
    context.stroke();
  });
}

function DateRangeFilter({
  dateFrom,
  dateTo,
  setDateFrom,
  setDateTo,
}: {
  dateFrom: string;
  dateTo: string;
  setDateFrom: (value: string) => void;
  setDateTo: (value: string) => void;
}) {
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
            <UiButton className="transaction-modal__button transaction-modal__button--secondary" type="button" onClick={resetRange} variant="secondary">
              Reset
            </UiButton>
            <UiButton className="transaction-modal__button transaction-modal__button--primary" type="button" onClick={applyRange}>
              Apply
            </UiButton>
          </div>
        </div>
      )}
    </div>
  );
}

function SelectControl({
  children,
  className = "",
  label,
  onChange,
  value,
}: {
  children: ReactNode;
  className?: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
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

function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
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

function Modal({ children, onClose, title }: { children: ReactNode; onClose: () => void; title: string }) {
  return (
    <UiModal onClose={onClose} open title={title}>
      {children}
    </UiModal>
  );
}

function TransactionModal({ onClose }: { onClose: () => void }) {
  const { addTransaction, categories } = useAppState();
  const [type, setType] = useState<TransactionType>("expense");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const parsedTransaction = transactionSchema.safeParse({
      amount: formData.get("amount"),
      category: formData.get("category"),
      date: formData.get("date"),
      description: String(formData.get("note") || "New transaction"),
      type,
    });

    if (!parsedTransaction.success) {
      window.alert(getValidationMessage(parsedTransaction.error));
      return;
    }

    addTransaction({
      amount: parsedTransaction.data.amount,
      category: parsedTransaction.data.category,
      date: parsedTransaction.data.date,
      description: parsedTransaction.data.description,
      type: parsedTransaction.data.type,
    });
    onClose();
  }

  return (
    <Modal onClose={onClose} title="Add Transaction">
      <form className="transaction-modal__form" onSubmit={handleSubmit}>
        <label className="transaction-modal__field" htmlFor="transactionType">
          <span className="transaction-modal__label">Type</span>
          <span className="transaction-modal__select-wrap" data-tone={type}>
            <select
              className="transaction-modal__control transaction-modal__control--select"
              id="transactionType"
              name="type"
              value={type}
              onChange={(event) => setType(event.target.value as TransactionType)}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <span className="transaction-modal__chevron" aria-hidden="true">
              <Icon name="chevron" />
            </span>
          </span>
        </label>
        <label className="transaction-modal__field" htmlFor="transactionCategory">
          <span className="transaction-modal__label">Category</span>
          <span className="transaction-modal__select-wrap">
            <select className="transaction-modal__control transaction-modal__control--select" id="transactionCategory" name="category">
              {categories.map((category) => (
                <option key={category.id}>{category.name}</option>
              ))}
              <option>Other</option>
            </select>
            <span className="transaction-modal__chevron" aria-hidden="true">
              <Icon name="chevron" />
            </span>
          </span>
        </label>
        <label className="transaction-modal__field transaction-modal__field--date" htmlFor="transactionDate">
          <span className="transaction-modal__label">Date</span>
          <span className="transaction-modal__input-wrap transaction-modal__input-wrap--date">
            <span className="transaction-modal__input-icon" aria-hidden="true">
              <Icon name="calendar" />
            </span>
            <input className="transaction-modal__control transaction-modal__control--text" defaultValue="2026-04-01" id="transactionDate" name="date" type="date" />
          </span>
        </label>
        <label className="transaction-modal__field" htmlFor="transactionAmount">
          <span className="transaction-modal__label">Amount</span>
          <span className="transaction-modal__input-wrap transaction-modal__input-wrap--money">
            <span className="transaction-modal__prefix" aria-hidden="true">
              $
            </span>
            <input className="transaction-modal__control transaction-modal__control--text" id="transactionAmount" min="0" name="amount" placeholder="Amount" required step="0.01" type="number" />
          </span>
        </label>
        <label className="transaction-modal__field" htmlFor="transactionNote">
          <span className="transaction-modal__label">Note</span>
          <span className="transaction-modal__input-wrap transaction-modal__input-wrap--icon transaction-modal__input-wrap--note">
            <span className="transaction-modal__input-icon" aria-hidden="true">
              <Icon name="edit" />
            </span>
            <input className="transaction-modal__control transaction-modal__control--text" id="transactionNote" name="note" placeholder="Note" type="text" />
          </span>
        </label>
        <ModalActions primaryText="Add Transaction" onClose={onClose} />
      </form>
    </Modal>
  );
}

function CategoryModal({ onClose }: { onClose: () => void }) {
  const { editingCategory, saveCategory } = useAppState();
  const [name, setName] = useState(editingCategory?.name ?? "");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedCategory = categorySchema.safeParse({ name });

    if (!parsedCategory.success) {
      window.alert(getValidationMessage(parsedCategory.error));
      return;
    }

    saveCategory(parsedCategory.data.name);
  }

  return (
    <Modal onClose={onClose} title={editingCategory ? "Edit Category" : "New Category"}>
      <form className="transaction-modal__form" onSubmit={handleSubmit}>
        <label className="transaction-modal__field" htmlFor="categoryName">
          <span className="transaction-modal__label">Name</span>
          <span className="transaction-modal__input-wrap">
            <input className="transaction-modal__control transaction-modal__control--text" id="categoryName" value={name} onChange={(event) => setName(event.target.value)} />
          </span>
        </label>
        <ModalActions primaryText="Save Category" onClose={onClose} />
      </form>
    </Modal>
  );
}

function GoalModal({ onClose }: { onClose: () => void }) {
  const { editingGoal, saveGoal } = useAppState();
  const [name, setName] = useState(editingGoal?.name ?? "");
  const [current, setCurrent] = useState(String(editingGoal?.current ?? 0));
  const [target, setTarget] = useState(String(editingGoal?.target ?? 1000));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedGoal = goalSchema.safeParse({ current, name, target });

    if (!parsedGoal.success) {
      window.alert(getValidationMessage(parsedGoal.error));
      return;
    }

    saveGoal(parsedGoal.data);
  }

  return (
    <Modal onClose={onClose} title={editingGoal ? "Edit Goal" : "New Goal"}>
      <form className="transaction-modal__form" onSubmit={handleSubmit}>
        <label className="transaction-modal__field" htmlFor="goalName">
          <span className="transaction-modal__label">Name</span>
          <span className="transaction-modal__input-wrap">
            <input className="transaction-modal__control transaction-modal__control--text" id="goalName" value={name} onChange={(event) => setName(event.target.value)} />
          </span>
        </label>
        <label className="transaction-modal__field" htmlFor="goalCurrent">
          <span className="transaction-modal__label">Current Amount</span>
          <span className="transaction-modal__input-wrap transaction-modal__input-wrap--money">
            <span className="transaction-modal__prefix" aria-hidden="true">
              $
            </span>
            <input className="transaction-modal__control transaction-modal__control--text" id="goalCurrent" min="0" step="0.01" type="number" value={current} onChange={(event) => setCurrent(event.target.value)} />
          </span>
        </label>
        <label className="transaction-modal__field" htmlFor="goalTarget">
          <span className="transaction-modal__label">Target Amount</span>
          <span className="transaction-modal__input-wrap transaction-modal__input-wrap--money">
            <span className="transaction-modal__prefix" aria-hidden="true">
              $
            </span>
            <input className="transaction-modal__control transaction-modal__control--text" id="goalTarget" min="1" step="0.01" type="number" value={target} onChange={(event) => setTarget(event.target.value)} />
          </span>
        </label>
        <ModalActions primaryText="Save Goal" onClose={onClose} />
      </form>
    </Modal>
  );
}

function ContributionModal({ onClose }: { onClose: () => void }) {
  const { saveContribution, selectedGoal } = useAppState();
  const [amount, setAmount] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedContribution = contributionSchema.safeParse({ amount });

    if (!parsedContribution.success) {
      window.alert(getValidationMessage(parsedContribution.error));
      return;
    }

    saveContribution(parsedContribution.data.amount);
  }

  return (
    <Modal onClose={onClose} title={`Contribute${selectedGoal ? ` to ${selectedGoal.name}` : ""}`}>
      <form className="transaction-modal__form" onSubmit={handleSubmit}>
        <label className="transaction-modal__field" htmlFor="contributionAmount">
          <span className="transaction-modal__label">Amount</span>
          <span className="transaction-modal__input-wrap transaction-modal__input-wrap--money">
            <span className="transaction-modal__prefix" aria-hidden="true">
              $
            </span>
            <input className="transaction-modal__control transaction-modal__control--text" id="contributionAmount" min="1" required step="0.01" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} />
          </span>
        </label>
        <ModalActions primaryText="Add Money" onClose={onClose} />
      </form>
    </Modal>
  );
}

function PasswordModal({ onClose }: { onClose: () => void }) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const parsedPassword = passwordSchema.safeParse({ password: formData.get("password") });

    if (!parsedPassword.success) {
      window.alert(getValidationMessage(parsedPassword.error));
      return;
    }

    window.alert("Password changed");
    onClose();
  }

  return (
    <Modal onClose={onClose} title="Change Password">
      <form className="transaction-modal__form" onSubmit={handleSubmit}>
        <label className="transaction-modal__field" htmlFor="newPassword">
          <span className="transaction-modal__label">New password</span>
          <span className="transaction-modal__input-wrap">
            <input className="transaction-modal__control transaction-modal__control--text" id="newPassword" minLength={4} name="password" required type="password" />
          </span>
        </label>
        <ModalActions primaryText="Save Password" onClose={onClose} />
      </form>
    </Modal>
  );
}

function ModalActions({ onClose, primaryText }: { onClose: () => void; primaryText: string }) {
  return (
    <div className="transaction-modal__actions">
      <UiButton className="transaction-modal__button transaction-modal__button--secondary" type="button" onClick={onClose} variant="secondary">
        Cancel
      </UiButton>
      <UiButton className="transaction-modal__button transaction-modal__button--primary" type="submit">
        {primaryText}
      </UiButton>
    </div>
  );
}

function BrandIcon() {
  return (
    <svg viewBox="0 0 25 22">
      <path
        d="M8.66667 9.75V21M8.66667 9.75H3.04444C2.32889 9.75 1.97111 9.75 1.69767 9.88625C1.45725 10.0061 1.26178 10.1973 1.13928 10.4325C1 10.7 1 11.05 1 11.75V21H8.66667M8.66667 9.75V3C8.66667 2.3 8.66667 1.95 8.80594 1.6825C8.92845 1.44731 9.12391 1.25609 9.36433 1.13625C9.63778 1 9.99556 1 10.7111 1H14.2889C15.0044 1 15.3622 1 15.6357 1.13625C15.8759 1.25625 16.0701 1.4475 16.1941 1.6825C16.3333 1.95 16.3333 2.3 16.3333 3V6M8.66667 21H16.3333M16.3333 6H21.9556C22.6711 6 23.0289 6 23.3036 6.13625C23.5431 6.25651 23.7376 6.44769 23.8594 6.6825C24 6.95 24 7.3 24 8V21H16.3333M16.3333 6V21"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function Icon({ name }: { name: NavId | "arrowRight" | "calendar" | "chevron" | "close" | "edit" | "lock" | "mail" | "menu" | "moon" | "plus" | "search" | "sun" }) {
  const commonProps = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 2,
  };

  if (name === "dashboard") {
    return (
      <svg viewBox="0 0 18 19" aria-hidden="true">
        <path d="M17.0002 14.3425V8.7945C17.0002 8.2605 17.0002 7.9935 16.9352 7.7445C16.8777 7.52441 16.783 7.31575 16.6552 7.1275C16.5102 6.9145 16.3102 6.7375 15.9072 6.3865L11.1072 2.1865C10.3612 1.5335 9.98724 1.2065 9.56724 1.0825C9.19724 0.9725 8.80324 0.9725 8.43224 1.0825C8.01224 1.2065 7.64024 1.5325 6.89424 2.1845L2.09324 6.3865C1.69124 6.7385 1.49024 6.9145 1.34624 7.1265C1.21804 7.31498 1.12301 7.52399 1.06524 7.7445C1.00024 7.9925 1.00024 8.2605 1.00024 8.7945V14.3425C1.00024 15.2745 1.00024 15.7405 1.15224 16.1075C1.25264 16.3502 1.39987 16.5708 1.58552 16.7566C1.77117 16.9424 1.99161 17.0899 2.23424 17.1905C2.60224 17.3425 3.06824 17.3425 4.00024 17.3425C4.93224 17.3425 5.39824 17.3425 5.76624 17.1905C6.00888 17.0899 6.22932 16.9424 6.41497 16.7566C6.60062 16.5708 6.74785 16.3502 6.84824 16.1075C7.00024 15.7405 7.00024 15.2745 7.00024 14.3425V13.3425C7.00024 12.8121 7.21096 12.3034 7.58603 11.9283C7.9611 11.5532 8.46981 11.3425 9.00024 11.3425C9.53068 11.3425 10.0394 11.5532 10.4145 11.9283C10.7895 12.3034 11.0002 12.8121 11.0002 13.3425V14.3425C11.0002 15.2745 11.0002 15.7405 11.1522 16.1075C11.2526 16.3502 11.3999 16.5708 11.5855 16.7566C11.7712 16.9424 11.9916 17.0899 12.2342 17.1905C12.6022 17.3425 13.0682 17.3425 14.0002 17.3425C14.9322 17.3425 15.3982 17.3425 15.7662 17.1905C16.0089 17.0899 16.2293 16.9424 16.415 16.7566C16.6006 16.5708 16.7478 16.3502 16.8482 16.1075C17.0002 15.7405 17.0002 15.2745 17.0002 14.3425Z" {...commonProps} />
      </svg>
    );
  }

  if (name === "transactions") {
    return (
      <svg viewBox="0 0 20 16" aria-hidden="true">
        <path d="M1 7V11.8C1 12.92 1 13.48 1.218 13.908C1.40974 14.2843 1.71569 14.5903 2.092 14.782C2.519 15 3.079 15 4.197 15H15.803C16.921 15 17.48 15 17.907 14.782C18.284 14.59 18.59 14.284 18.782 13.908C19 13.48 19 12.922 19 11.804V7M1 7V5M1 7H19M19 7V5M1 5V4.2C1 3.08 1 2.52 1.218 2.092C1.41 1.715 1.715 1.41 2.092 1.218C2.52 1 3.08 1 4.2 1H15.8C16.92 1 17.48 1 17.907 1.218C18.284 1.41 18.59 1.715 18.782 2.092C19 2.519 19 3.079 19 4.197V5M1 5H19M5 11H9" {...commonProps} />
      </svg>
    );
  }

  if (name === "categories") {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="M10 1C8.21997 1 6.47991 1.52784 4.99987 2.51677C3.51983 3.50571 2.36628 4.91131 1.68509 6.55585C1.0039 8.20038 0.82567 10.01 1.17294 11.7558C1.5202 13.5016 2.37737 15.1053 3.63604 16.364C4.89472 17.6226 6.49836 18.4798 8.24419 18.8271C9.99002 19.1743 11.7996 18.9961 13.4442 18.3149C15.0887 17.6337 16.4943 16.4802 17.4832 15.0001C18.4722 13.5201 19 11.78 19 10M10 1C12.387 1 14.6761 1.94821 16.364 3.63604C18.0518 5.32387 19 7.61305 19 10M10 1V10M19 10H10M10 10L16 16.5" {...commonProps} />
      </svg>
    );
  }

  if (name === "analytics") {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="M3 15.5h14M4.5 12.5l4-4 2.9 2.9 4-5.1" {...commonProps} />
      </svg>
    );
  }

  if (name === "goals") {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="M5.5 10H10M10 10H14.5M10 10V14.5M10 10V5.5M1 15.4V4.6C1 3.34 1 2.71 1.24525 2.2285C1.46125 1.80438 1.80438 1.46125 2.2285 1.24525C2.71 1 3.34 1 4.6 1H15.4C16.66 1 17.29 1 17.7715 1.24525C18.1948 1.46096 18.539 1.80515 18.7547 2.2285C19 2.71 19 3.34 19 4.6V15.4C19 16.66 19 17.29 18.7547 17.7715C18.539 18.1948 18.1948 18.539 17.7715 18.7547C17.29 19 16.6623 19 15.4045 19H4.59663C3.33887 19 2.70887 19 2.2285 18.7547C1.80515 18.539 1.46096 18.1948 1.24525 17.7715C1 17.29 1 16.66 1 15.4Z" {...commonProps} />
      </svg>
    );
  }

  if (name === "settings") {
    return (
      <svg viewBox="0 0 22 21" aria-hidden="true">
        <path d="M19.3464 7.3503L18.9804 7.1463L18.8674 7.08229C18.5948 6.91868 18.3651 6.69242 18.1974 6.4223C18.1794 6.3953 18.1634 6.3663 18.1314 6.3103C17.9158 5.96422 17.8111 5.56053 17.8314 5.1533L17.8374 4.7283C17.8494 4.0483 17.8554 3.7063 17.7594 3.4003C17.6745 3.12804 17.5323 2.87709 17.3424 2.6643C17.1284 2.4243 16.8314 2.2523 16.2364 1.9103L15.7424 1.6253C15.1504 1.2843 14.8534 1.1133 14.5384 1.0483C14.2601 0.990707 13.9727 0.993093 13.6954 1.0553C13.3824 1.1253 13.0894 1.3013 12.5044 1.6513L12.5014 1.6533L12.1474 1.8643C12.0914 1.8983 12.0624 1.9143 12.0344 1.9303C11.7564 2.0853 11.4464 2.1703 11.1274 2.1803C11.0954 2.1823 11.0624 2.1823 10.9974 2.1823L10.8674 2.1813C10.5483 2.17113 10.2363 2.08472 9.95742 1.9293C9.92942 1.9143 9.90242 1.8973 9.84642 1.8633L9.48942 1.6493C8.90042 1.2953 8.60542 1.1193 8.29042 1.0483C8.01207 0.985991 7.72362 0.983946 7.44442 1.0423C7.12842 1.1083 6.83242 1.2803 6.23942 1.6243L6.23642 1.6253L5.74842 1.9083L5.74342 1.9123C5.15542 2.2523 4.86042 2.4243 4.64842 2.6633C4.45949 2.87569 4.31802 3.12592 4.23342 3.3973C4.13842 3.7043 4.14342 4.0463 4.15542 4.7303L4.16242 5.1543C4.16242 5.2193 4.16542 5.2513 4.16442 5.2823C4.15924 5.64562 4.05518 6.00066 3.86342 6.3093C3.83042 6.3653 3.81542 6.3933 3.79842 6.4193C3.62981 6.69147 3.39832 6.91918 3.12342 7.0833L3.01142 7.1463L2.65042 7.34629C2.04842 7.67929 1.74742 7.84629 1.52942 8.08429C1.3356 8.29413 1.18898 8.54305 1.09942 8.8143C0.999418 9.1213 0.999418 9.4643 1.00042 10.1523L1.00242 10.7153C1.00342 11.3983 1.00542 11.7393 1.10642 12.0443C1.1956 12.3139 1.34116 12.5613 1.53342 12.7703C1.75142 13.0063 2.04942 13.1723 2.64642 13.5043L3.00442 13.7033C3.06542 13.7373 3.09642 13.7533 3.12542 13.7713C3.43879 13.9591 3.69472 14.2293 3.86542 14.5523L3.93242 14.6723C4.10133 14.9912 4.1808 15.3499 4.16242 15.7103L4.15542 16.1173C4.14342 16.8033 4.13842 17.1473 4.23442 17.4543C4.31942 17.7263 4.46142 17.9773 4.65142 18.1903C4.86542 18.4303 5.16342 18.6013 5.75742 18.9443L6.25142 19.2293C6.84442 19.5703 7.14042 19.7413 7.45542 19.8063C7.73372 19.8639 8.02111 19.8615 8.29842 19.7993C8.61242 19.7293 8.90542 19.5533 9.49242 19.2013L9.84642 18.9893L9.95942 18.9233C10.2374 18.7693 10.5474 18.6833 10.8664 18.6733L10.9964 18.6723H11.1264C11.4444 18.6823 11.7564 18.7693 12.0364 18.9243L12.1284 18.9793L12.5044 19.2053C13.0944 19.5593 13.3884 19.7353 13.7034 19.8053C13.9816 19.8683 14.2701 19.871 14.5494 19.8133C14.8644 19.7473 15.1624 19.5743 15.7554 19.2303L16.2504 18.9433C16.8384 18.6013 17.1334 18.4303 17.3454 18.1913C17.5354 17.9783 17.6754 17.7283 17.7604 17.4573C17.8554 17.1523 17.8504 16.8133 17.8384 16.1393L17.8304 15.6993V15.5723C17.8351 15.2087 17.9388 14.8533 18.1304 14.5443L18.1954 14.4343C18.364 14.1621 18.5955 13.9344 18.8704 13.7703L18.9804 13.7093L18.9824 13.7083L19.3434 13.5083C19.9454 13.1743 20.2464 13.0083 20.4654 12.7703C20.6594 12.5603 20.8054 12.3103 20.8944 12.0403C20.9944 11.7353 20.9944 11.3933 20.9924 10.7133L20.9904 10.1393C20.9894 9.4563 20.9884 9.1143 20.8874 8.8093C20.7978 8.54 20.6519 8.29286 20.4594 8.08429C20.2424 7.84829 19.9444 7.68229 19.3484 7.35129L19.3464 7.3503Z" {...commonProps} />
        <path d="M6.99634 10.4273C6.99634 11.4882 7.41777 12.5056 8.16791 13.2557C8.91806 14.0059 9.93547 14.4273 10.9963 14.4273C12.0572 14.4273 13.0746 14.0059 13.8248 13.2557C14.5749 12.5056 14.9963 11.4882 14.9963 10.4273C14.9963 9.36643 14.5749 8.34901 13.8248 7.59886C13.0746 6.84872 12.0572 6.42729 10.9963 6.42729C9.93547 6.42729 8.91806 6.84872 8.16791 7.59886C7.41777 8.34901 6.99634 9.36643 6.99634 10.4273Z" {...commonProps} />
      </svg>
    );
  }

  const paths: Record<string, string> = {
    arrowRight: "m9 6 6 6-6 6",
    calendar: "M6 1.5v3M14 1.5v3M2.5 7h15M4.7 4h10.6C16.42 4 17 4.58 17 5.7v9.6c0 1.12-.58 1.7-1.7 1.7H4.7C3.58 17 3 16.42 3 15.3V5.7C3 4.58 3.58 4 4.7 4Z",
    chevron: "m5.5 7.5 4.5 4.5 4.5-4.5",
    close: "m5 5 10 10M15 5 5 15",
    edit: "M4.16667 1.72222H2.45556C1.77111 1.72222 1.42889 1.72222 1.16733 1.85544C0.937368 1.97262 0.750399 2.15959 0.633222 2.38956C0.5 2.65111 0.5 2.99333 0.5 3.67778V9.54444C0.5 10.2289 0.5 10.5711 0.633222 10.8327C0.750399 11.0626 0.937368 11.2496 1.16733 11.3668C1.42828 11.5 1.7705 11.5 2.45372 11.5H8.32406C9.00728 11.5 9.34889 11.5 9.60983 11.3668C9.84022 11.2494 10.0272 11.0624 10.1446 10.8327C10.2778 10.5711 10.2778 10.2295 10.2778 9.54628V7.83333M7.83333 2.33333L4.16667 6V7.83333H6L9.66667 4.16667M7.83333 2.33333L9.66667 0.5L11.5 2.33333L9.66667 4.16667M7.83333 2.33333L9.66667 4.16667",
    lock: "M6 8V6a4 4 0 0 1 8 0v2M5 8h10v9H5z",
    mail: "M3 5h14v10H3zM3 6l7 5 7-5",
    menu: "M4 7h16M4 12h16M4 17h16",
    moon: "M14.5 18.2A8 8 0 0 1 5.8 5.5a7 7 0 1 0 8.7 12.7Z",
    plus: "M6.19126 10H10.3443M10.3443 10H14.4973M10.3443 10V14M10.3443 10V6M10.3443 19C9.11716 19 7.90207 18.7672 6.76837 18.3149C5.63467 17.8626 4.60457 17.1997 3.73687 16.364C2.86918 15.5282 2.18088 14.5361 1.71129 13.4442C1.2417 12.3522 1 11.1819 1 10C1 8.8181 1.2417 7.64778 1.71129 6.55585C2.18088 5.46392 2.86918 4.47177 3.73687 3.63604C4.60457 2.80031 5.63467 2.13738 6.76837 1.68508C7.90207 1.23279 9.11716 1 10.3443 1C12.8225 1 15.1993 1.94821 16.9517 3.63604C18.704 5.32387 19.6885 7.61305 19.6885 10C19.6885 12.3869 18.704 14.6761 16.9517 16.364C15.1993 18.0518 12.8225 19 10.3443 19Z",
    search: "m14.5 14.5 3 3M16 9a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z",
    sun: "M10 3v1.4M10 15.6V17M3 10h1.4M15.6 10H17M5.05 5.05l1 1M13.95 13.95l1 1M14.95 5.05l-1 1M6.05 13.95l-1 1M10 7a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z",
  };
  const viewBox = name === "edit" ? "0 0 12 12" : "0 0 20 20";

  return (
    <svg viewBox={viewBox} aria-hidden="true">
      <path d={paths[name]} {...commonProps} />
    </svg>
  );
}

export default App;
