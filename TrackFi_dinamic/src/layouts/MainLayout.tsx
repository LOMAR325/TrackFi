import type { ReactNode } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

type MainLayoutProps = {
    children: ReactNode;
};

function MainLayout({ children }: MainLayoutProps) {
    return (
        <div className="layout">
            <Sidebar />

            <div className="layout__content">
                <Header />

                <main className="main">{children}</main>
            </div>
        </div>
    ); 
}

export default MainLayout;
