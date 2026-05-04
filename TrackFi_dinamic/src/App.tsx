import { useState } from "react";
import "./App.css";
import MainLayout from "./layouts/MainLayout";
import DashboardPage from "./pages/DashboardPage";

function App() {
    const [page, setPage] = useState("dashboard");

    return <MainLayout>{page === "dashboard" && <DashboardPage />}</MainLayout>;
}

export default App;
