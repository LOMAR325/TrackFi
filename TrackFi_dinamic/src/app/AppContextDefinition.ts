import { createContext } from "react";
import type { Category, Goal, Theme, Transaction } from "../data";
import type { ModalKind } from "../state";

export type AppState = {
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

export const AppContext = createContext<AppState | null>(null);
