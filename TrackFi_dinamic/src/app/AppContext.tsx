import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useReducer } from "react";
import type { Category, Goal, Theme, Transaction } from "../data";
import {
  createInitialState,
  saveStoredValue,
  storageKeys,
  trackFiReducer,
} from "../state";
import type { ModalKind } from "../state";

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

export function useAppState() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppState must be used inside AppProvider");
  }

  return context;
}

export function AppProvider({ children }: { children: ReactNode }) {
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

  function deleteCategory(id: string) {
    if (window.confirm("Delete this category?")) {
      dispatch({ type: "deleteCategory", id });
    }
  }

  function deleteGoal(id: string) {
    if (window.confirm("Delete this goal?")) {
      dispatch({ type: "deleteGoal", id });
    }
  }

  const value: AppState = {
    activeModal: state.activeModal,
    addTransaction: (transaction) => dispatch({ type: "addTransaction", transaction }),
    categories: state.categories,
    closeModal: () => dispatch({ type: "closeModal" }),
    deleteCategory,
    deleteGoal,
    editingCategory: state.editingCategory,
    editingGoal: state.editingGoal,
    goals: state.goals,
    openModal: (kind) => dispatch({ type: "openModal", kind }),
    saveCategory: (name) => dispatch({ type: "saveCategory", name }),
    saveContribution: (amount) => dispatch({ type: "saveContribution", amount }),
    saveGoal: (goal) => dispatch({ type: "saveGoal", goal }),
    selectedGoal: state.selectedGoal,
    setTheme: (theme) => dispatch({ type: "setTheme", theme }),
    setUserEmail: (email) => dispatch({ type: "setUserEmail", email }),
    setUserName: (name) => dispatch({ type: "setUserName", name }),
    startCategoryCreate: () => dispatch({ type: "startCategoryCreate" }),
    startCategoryEdit: (category) => dispatch({ type: "startCategoryEdit", category }),
    startGoalContribution: (goal) => dispatch({ type: "startGoalContribution", goal }),
    startGoalCreate: () => dispatch({ type: "startGoalCreate" }),
    startGoalEdit: (goal) => dispatch({ type: "startGoalEdit", goal }),
    theme: state.theme,
    transactions: state.transactions,
    userEmail: state.userEmail,
    userName: state.userName,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
