import { buildSidebarItems } from "./data.js";

export const categoriesPageContent = {
  title: "Categories",
  subtitle: "Review all your categories",
  ctaLabel: "New Category",
};

export const categoriesSidebarItems = buildSidebarItems("categories");

export const categoriesList = [
  {
    id: "housing",
    name: "Housing",
    editLabel: "Edit",
    deleteLabel: "Delete",
  },
  {
    id: "food-drinks",
    name: "Food & Drinks",
    editLabel: "Edit",
    deleteLabel: "Delete",
  },
  {
    id: "transportation",
    name: "Transportation",
    editLabel: "Edit",
    deleteLabel: "Delete",
  },
  {
    id: "shopping",
    name: "Shopping",
    editLabel: "Edit",
    deleteLabel: "Delete",
  },
];
