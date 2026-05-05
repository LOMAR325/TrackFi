import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useAppState } from "../app/AppContext";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import {
  CategoryModal,
  ContributionModal,
  GoalModal,
  PasswordModal,
  TransactionModal,
} from "../components/modals/FinanceModals";
import type { NavId } from "../data";

type MainLayoutProps = {
  activeId: NavId;
  children: ReactNode;
};

function MainLayout({ activeId, children }: MainLayoutProps) {
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

export default MainLayout;
