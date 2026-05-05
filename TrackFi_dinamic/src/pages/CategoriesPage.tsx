import { useAppState } from "../app/useAppState";
import { PageHero } from "../components/common/PageHero";

function CategoriesPage() {
  const { categories, deleteCategory, startCategoryCreate, startCategoryEdit } = useAppState();

  return (
    <main className="categories-page">
      <PageHero
        actionClassName="new-transaction-button--compact"
        actionLabel="New Category"
        onAction={startCategoryCreate}
        subtitle="Review all your categories"
        title="Categories"
        titleId="categoriesPageTitle"
        variant="categories"
      />

      <section className="categories-card" aria-label="Categories list">
        <div className="categories-list" role="list">
          {categories.map((category) => (
            <article className="category-row" key={category.id} role="listitem">
              <p className="category-row__name">{category.name}</p>
              <div className="category-row__actions" role="group" aria-label={`${category.name} actions`}>
                <button className="category-action" type="button" onClick={() => startCategoryEdit(category)}>
                  Edit
                </button>
                <button className="category-action category-action--delete" type="button" onClick={() => deleteCategory(category.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default CategoriesPage;
