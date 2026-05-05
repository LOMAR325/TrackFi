import {
  initialCategories,
  initialGoals,
  initialTransactions,
  initialUser,
} from "./data";
import type { Category, Goal, Theme, Transaction } from "./data";

export type ModalKind = "transaction" | "category" | "goal" | "contribution" | "password";

export type TrackFiState = {
  activeModal: ModalKind | null;
  categories: Category[];
  editingCategory: Category | null;
  editingGoal: Goal | null;
  goals: Goal[];
  selectedGoal: Goal | null;
  theme: Theme;
  transactions: Transaction[];
  userEmail: string;
  userName: string;
};

export type TrackFiAction =
  | { type: "openModal"; kind: ModalKind }
  | { type: "closeModal" }
  | { type: "setTheme"; theme: Theme }
  | { type: "setUserName"; name: string }
  | { type: "setUserEmail"; email: string }
  | { type: "addTransaction"; transaction: Omit<Transaction, "id"> }
  | { type: "startCategoryCreate" }
  | { type: "startCategoryEdit"; category: Category }
  | { type: "saveCategory"; name: string }
  | { type: "deleteCategory"; id: string }
  | { type: "startGoalCreate" }
  | { type: "startGoalEdit"; goal: Goal }
  | { type: "startGoalContribution"; goal: Goal }
  | { type: "saveGoal"; goal: Omit<Goal, "id"> }
  | { type: "saveContribution"; amount: number }
  | { type: "deleteGoal"; id: string };

export const storageKeys = {
  categories: "trackfi-react:categories",
  goals: "trackfi-react:goals",
  theme: "trackfi-react:theme",
  transactions: "trackfi-react:transactions",
  userEmail: "trackfi-react:userEmail",
  userName: "trackfi-react:userName:v2",
};

export function createInitialState(): TrackFiState {
  return {
    activeModal: null,
    categories: readStoredValue(storageKeys.categories, initialCategories),
    editingCategory: null,
    editingGoal: null,
    goals: readStoredValue(storageKeys.goals, initialGoals),
    selectedGoal: null,
    theme: getInitialTheme(),
    transactions: readStoredValue(storageKeys.transactions, initialTransactions),
    userEmail: readStoredValue(storageKeys.userEmail, initialUser.email),
    userName: readStoredValue(storageKeys.userName, initialUser.name),
  };
}

export function readStoredValue<T>(key: string, fallback: T) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveStoredValue<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The app can still work if storage is unavailable.
  }
}

export function trackFiReducer(state: TrackFiState, action: TrackFiAction): TrackFiState {
  switch (action.type) {
    case "openModal":
      return { ...state, activeModal: action.kind };

    case "closeModal":
      return { ...state, activeModal: null, editingCategory: null, editingGoal: null, selectedGoal: null };

    case "setTheme":
      return { ...state, theme: action.theme };

    case "setUserName":
      return { ...state, userName: action.name.trim() || state.userName };

    case "setUserEmail":
      return { ...state, userEmail: action.email.trim() };

    case "addTransaction":
      return {
        ...state,
        transactions: [{ ...action.transaction, id: createId("transaction") }, ...state.transactions],
      };

    case "startCategoryCreate":
      return { ...state, activeModal: "category", editingCategory: null };

    case "startCategoryEdit":
      return { ...state, activeModal: "category", editingCategory: action.category };

    case "saveCategory": {
      const name = action.name.trim();

      if (!name) {
        return state;
      }

      const categories = state.editingCategory
        ? state.categories.map((category) =>
            category.id === state.editingCategory?.id ? { ...category, name } : category,
          )
        : [...state.categories, { id: createId("category"), name }];

      return { ...state, activeModal: null, categories, editingCategory: null };
    }

    case "deleteCategory":
      return { ...state, categories: state.categories.filter((category) => category.id !== action.id) };

    case "startGoalCreate":
      return { ...state, activeModal: "goal", editingGoal: null };

    case "startGoalEdit":
      return { ...state, activeModal: "goal", editingGoal: action.goal };

    case "startGoalContribution":
      return { ...state, activeModal: "contribution", selectedGoal: action.goal };

    case "saveGoal": {
      const goal = {
        ...action.goal,
        current: Math.max(0, action.goal.current),
        name: action.goal.name.trim(),
        target: Math.max(1, action.goal.target),
      };

      if (!goal.name) {
        return state;
      }

      const goals = state.editingGoal
        ? state.goals.map((item) => (item.id === state.editingGoal?.id ? { ...goal, id: item.id } : item))
        : [...state.goals, { ...goal, id: createId("goal") }];

      return { ...state, activeModal: null, editingGoal: null, goals };
    }

    case "saveContribution":
      if (!state.selectedGoal || action.amount <= 0) {
        return state;
      }

      return {
        ...state,
        activeModal: null,
        goals: state.goals.map((goal) =>
          goal.id === state.selectedGoal?.id
            ? { ...goal, current: Math.min(goal.target, goal.current + action.amount) }
            : goal,
        ),
        selectedGoal: null,
      };

    case "deleteGoal":
      return { ...state, goals: state.goals.filter((goal) => goal.id !== action.id) };
  }
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getInitialTheme(): Theme {
  const storedTheme = readStoredValue<Theme>(storageKeys.theme, "dark");

  return storedTheme === "light" || storedTheme === "dark" ? storedTheme : "dark";
}
