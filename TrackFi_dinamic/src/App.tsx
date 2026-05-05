import { RouterProvider } from "@tanstack/react-router";
import "./App.css";
import { AppProvider } from "./app/AppContext";
import { router } from "./app/router";

function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}

export default App;
