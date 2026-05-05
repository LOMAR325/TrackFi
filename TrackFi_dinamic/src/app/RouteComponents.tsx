import { Outlet } from "@tanstack/react-router";
import MainLayout from "../layouts/MainLayout";
import AnalyticsPage from "../pages/AnalyticsPage";
import CategoriesPage from "../pages/CategoriesPage";
import DashboardPage from "../pages/DashboardPage";
import GoalsPage from "../pages/GoalsPage";
import SettingsPage from "../pages/SettingsPage";
import TransactionsPage from "../pages/TransactionsPage";

export function RootComponent() {
  return <Outlet />;
}

export function DashboardRoute() {
  return (
    <MainLayout activeId="dashboard">
      <DashboardPage />
    </MainLayout>
  );
}

export function TransactionsRoute() {
  return (
    <MainLayout activeId="transactions">
      <TransactionsPage />
    </MainLayout>
  );
}

export function CategoriesRoute() {
  return (
    <MainLayout activeId="categories">
      <CategoriesPage />
    </MainLayout>
  );
}

export function AnalyticsRoute() {
  return (
    <MainLayout activeId="analytics">
      <AnalyticsPage />
    </MainLayout>
  );
}

export function GoalsRoute() {
  return (
    <MainLayout activeId="goals">
      <GoalsPage />
    </MainLayout>
  );
}

export function SettingsRoute() {
  return (
    <MainLayout activeId="settings">
      <SettingsPage />
    </MainLayout>
  );
}
