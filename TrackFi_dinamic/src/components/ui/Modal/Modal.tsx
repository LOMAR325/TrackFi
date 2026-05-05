import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import type { ReactNode } from "react";
import { Button } from "../Button";

type ModalProps = {
  children: ReactNode;
  onClose: () => void;
  open: boolean;
  title: string;
};

export function Modal({ children, onClose, open, title }: ModalProps) {
  return (
    <Dialog className="transaction-modal" onClose={onClose} open={open}>
      <div className="transaction-modal__backdrop" aria-hidden="true" />
      <DialogPanel className="transaction-modal__dialog">
        <div className="transaction-modal__header">
          <DialogTitle className="transaction-modal__title">{title}</DialogTitle>
          <Button
            aria-label={`Close ${title} dialog`}
            className="transaction-modal__close"
            onClick={onClose}
            type="button"
            variant="ghost"
          >
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path
                d="m5 5 10 10M15 5 5 15"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          </Button>
        </div>
        {children}
      </DialogPanel>
    </Dialog>
  );
}
