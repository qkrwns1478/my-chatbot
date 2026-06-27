"use client";

import React from "react";
import Modal from "./Modal";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "primary";
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "primary",
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <div className="p-6">
        <h3 className="text-[18px] font-medium text-text-primary mb-2">
          {title}
        </h3>
        <p className="text-[15px] text-text-tertiary leading-relaxed">
          {message}
        </p>
        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-[14px] text-text-muted hover:text-text-primary transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 rounded-xl text-[14px] font-medium transition-all ${
              variant === "danger"
                ? "bg-error/10 text-error hover:bg-error/20"
                : "bg-brand-green/10 text-brand-green hover:bg-brand-green/20"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
