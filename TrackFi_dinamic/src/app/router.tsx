import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import LoginPage from "../pages/LoginPage";
import {
  AnalyticsRoute,
  CategoriesRoute,
  DashboardRoute,
  GoalsRoute,
  RootComponent,
  SettingsRoute,
  TransactionsRoute,
} from "./RouteComponents";

const rootRoute = createRootRoute({ component: RootComponent });
const loginIndexRoute = createRoute({ getParentRoute: () => rootRoute, path: "/", component: LoginPage });
const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: "/login", component: LoginPage });
const dashboardRoute = createRoute({ getParentRoute: () => rootRoute, path: "/dashboard", component: DashboardRoute });
const transactionsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/transactions", component: TransactionsRoute });
const categoriesRoute = createRoute({ getParentRoute: () => rootRoute, path: "/categories", component: CategoriesRoute });
const analyticsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/analytics", component: AnalyticsRoute });
const goalsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/goals", component: GoalsRoute });
const settingsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/settings", component: SettingsRoute });

const routeTree = rootRoute.addChildren([
  loginIndexRoute,
  loginRoute,
  dashboardRoute,
  transactionsRoute,
  categoriesRoute,
  analyticsRoute,
  goalsRoute,
  settingsRoute,
]);

export const router = createRouter({
  routeTree,
  history: createHashHistory(),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
