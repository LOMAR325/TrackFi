import type { FormEvent } from "react";
import { useState } from "react";
import { useAppState } from "../../app/useAppState";
import type { TransactionType } from "../../data";
import { categorySchema, contributionSchema, getValidationMessage, goalSchema, passwordSchema, transactionSchema } from "../../validation";
import { Icon } from "../icons/Icon";
import { Button, Modal } from "../ui";

type ModalProps = {
  onClose: () => void;
};

export function TransactionModal({ onClose }: ModalProps) {
  const { addTransaction, categories } = useAppState();
  const [type, setType] = useState<TransactionType>("expense");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const parsedTransaction = transactionSchema.safeParse({
      amount: formData.get("amount"),
      category: formData.get("category"),
      date: formData.get("date"),
      description: String(formData.get("note") || "New transaction"),
      type,
    });

    if (!parsedTransaction.success) {
      window.alert(getValidationMessage(parsedTransaction.error));
      return;
    }

    addTransaction({
      amount: parsedTransaction.data.amount,
      category: parsedTransaction.data.category,
      date: parsedTransaction.data.date,
      description: parsedTransaction.data.description,
      type: parsedTransaction.data.type,
    });
    onClose();
  }

  return (
    <Modal onClose={onClose} open title="Add Transaction">
      <form className="transaction-modal__form" onSubmit={handleSubmit}>
        <label className="transaction-modal__field" htmlFor="transactionType">
          <span className="transaction-modal__label">Type</span>
          <span className="transaction-modal__select-wrap" data-tone={type}>
            <select
              className="transaction-modal__control transaction-modal__control--select"
              id="transactionType"
              name="type"
              value={type}
              onChange={(event) => setType(event.target.value as TransactionType)}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <span className="transaction-modal__chevron" aria-hidden="true">
              <Icon name="chevron" />
            </span>
          </span>
        </label>
        <label className="transaction-modal__field" htmlFor="transactionCategory">
          <span className="transaction-modal__label">Category</span>
          <span className="transaction-modal__select-wrap">
            <select className="transaction-modal__control transaction-modal__control--select" id="transactionCategory" name="category">
              {categories.map((category) => (
                <option key={category.id}>{category.name}</option>
              ))}
              <option>Other</option>
            </select>
            <span className="transaction-modal__chevron" aria-hidden="true">
              <Icon name="chevron" />
            </span>
          </span>
        </label>
        <label className="transaction-modal__field transaction-modal__field--date" htmlFor="transactionDate">
          <span className="transaction-modal__label">Date</span>
          <span className="transaction-modal__input-wrap transaction-modal__input-wrap--date">
            <span className="transaction-modal__input-icon" aria-hidden="true">
              <Icon name="calendar" />
            </span>
            <input className="transaction-modal__control transaction-modal__control--text" defaultValue="2026-04-01" id="transactionDate" name="date" type="date" />
          </span>
        </label>
        <label className="transaction-modal__field" htmlFor="transactionAmount">
          <span className="transaction-modal__label">Amount</span>
          <span className="transaction-modal__input-wrap transaction-modal__input-wrap--money">
            <span className="transaction-modal__prefix" aria-hidden="true">
              $
            </span>
            <input className="transaction-modal__control transaction-modal__control--text" id="transactionAmount" min="0" name="amount" placeholder="Amount" required step="0.01" type="number" />
          </span>
        </label>
        <label className="transaction-modal__field" htmlFor="transactionNote">
          <span className="transaction-modal__label">Note</span>
          <span className="transaction-modal__input-wrap transaction-modal__input-wrap--icon transaction-modal__input-wrap--note">
            <span className="transaction-modal__input-icon" aria-hidden="true">
              <Icon name="edit" />
            </span>
            <input className="transaction-modal__control transaction-modal__control--text" id="transactionNote" name="note" placeholder="Note" type="text" />
          </span>
        </label>
        <ModalActions primaryText="Add Transaction" onClose={onClose} />
      </form>
    </Modal>
  );
}

export function CategoryModal({ onClose }: ModalProps) {
  const { editingCategory, saveCategory } = useAppState();
  const [name, setName] = useState(editingCategory?.name ?? "");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedCategory = categorySchema.safeParse({ name });

    if (!parsedCategory.success) {
      window.alert(getValidationMessage(parsedCategory.error));
      return;
    }

    saveCategory(parsedCategory.data.name);
  }

  return (
    <Modal onClose={onClose} open title={editingCategory ? "Edit Category" : "New Category"}>
      <form className="transaction-modal__form" onSubmit={handleSubmit}>
        <label className="transaction-modal__field" htmlFor="categoryName">
          <span className="transaction-modal__label">Name</span>
          <span className="transaction-modal__input-wrap">
            <input className="transaction-modal__control transaction-modal__control--text" id="categoryName" value={name} onChange={(event) => setName(event.target.value)} />
          </span>
        </label>
        <ModalActions primaryText="Save Category" onClose={onClose} />
      </form>
    </Modal>
  );
}

export function GoalModal({ onClose }: ModalProps) {
  const { editingGoal, saveGoal } = useAppState();
  const [name, setName] = useState(editingGoal?.name ?? "");
  const [current, setCurrent] = useState(String(editingGoal?.current ?? 0));
  const [target, setTarget] = useState(String(editingGoal?.target ?? 1000));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedGoal = goalSchema.safeParse({ current, name, target });

    if (!parsedGoal.success) {
      window.alert(getValidationMessage(parsedGoal.error));
      return;
    }

    saveGoal(parsedGoal.data);
  }

  return (
    <Modal onClose={onClose} open title={editingGoal ? "Edit Goal" : "New Goal"}>
      <form className="transaction-modal__form" onSubmit={handleSubmit}>
        <label className="transaction-modal__field" htmlFor="goalName">
          <span className="transaction-modal__label">Name</span>
          <span className="transaction-modal__input-wrap">
            <input className="transaction-modal__control transaction-modal__control--text" id="goalName" value={name} onChange={(event) => setName(event.target.value)} />
          </span>
        </label>
        <label className="transaction-modal__field" htmlFor="goalCurrent">
          <span className="transaction-modal__label">Current Amount</span>
          <span className="transaction-modal__input-wrap transaction-modal__input-wrap--money">
            <span className="transaction-modal__prefix" aria-hidden="true">
              $
            </span>
            <input className="transaction-modal__control transaction-modal__control--text" id="goalCurrent" min="0" step="0.01" type="number" value={current} onChange={(event) => setCurrent(event.target.value)} />
          </span>
        </label>
        <label className="transaction-modal__field" htmlFor="goalTarget">
          <span className="transaction-modal__label">Target Amount</span>
          <span className="transaction-modal__input-wrap transaction-modal__input-wrap--money">
            <span className="transaction-modal__prefix" aria-hidden="true">
              $
            </span>
            <input className="transaction-modal__control transaction-modal__control--text" id="goalTarget" min="1" step="0.01" type="number" value={target} onChange={(event) => setTarget(event.target.value)} />
          </span>
        </label>
        <ModalActions primaryText="Save Goal" onClose={onClose} />
      </form>
    </Modal>
  );
}

export function ContributionModal({ onClose }: ModalProps) {
  const { saveContribution, selectedGoal } = useAppState();
  const [amount, setAmount] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedContribution = contributionSchema.safeParse({ amount });

    if (!parsedContribution.success) {
      window.alert(getValidationMessage(parsedContribution.error));
      return;
    }

    saveContribution(parsedContribution.data.amount);
  }

  return (
    <Modal onClose={onClose} open title={`Contribute${selectedGoal ? ` to ${selectedGoal.name}` : ""}`}>
      <form className="transaction-modal__form" onSubmit={handleSubmit}>
        <label className="transaction-modal__field" htmlFor="contributionAmount">
          <span className="transaction-modal__label">Amount</span>
          <span className="transaction-modal__input-wrap transaction-modal__input-wrap--money">
            <span className="transaction-modal__prefix" aria-hidden="true">
              $
            </span>
            <input className="transaction-modal__control transaction-modal__control--text" id="contributionAmount" min="1" required step="0.01" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} />
          </span>
        </label>
        <ModalActions primaryText="Add Money" onClose={onClose} />
      </form>
    </Modal>
  );
}

export function PasswordModal({ onClose }: ModalProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const parsedPassword = passwordSchema.safeParse({ password: formData.get("password") });

    if (!parsedPassword.success) {
      window.alert(getValidationMessage(parsedPassword.error));
      return;
    }

    window.alert("Password changed");
    onClose();
  }

  return (
    <Modal onClose={onClose} open title="Change Password">
      <form className="transaction-modal__form" onSubmit={handleSubmit}>
        <label className="transaction-modal__field" htmlFor="newPassword">
          <span className="transaction-modal__label">New password</span>
          <span className="transaction-modal__input-wrap">
            <input className="transaction-modal__control transaction-modal__control--text" id="newPassword" minLength={4} name="password" required type="password" />
          </span>
        </label>
        <ModalActions primaryText="Save Password" onClose={onClose} />
      </form>
    </Modal>
  );
}

function ModalActions({ onClose, primaryText }: { onClose: () => void; primaryText: string }) {
  return (
    <div className="transaction-modal__actions">
      <Button className="transaction-modal__button transaction-modal__button--secondary" type="button" onClick={onClose} variant="secondary">
        Cancel
      </Button>
      <Button className="transaction-modal__button transaction-modal__button--primary" type="submit">
        {primaryText}
      </Button>
    </div>
  );
}
