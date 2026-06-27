"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      const renderTimer = setTimeout(() => {
        setShouldRender(true);
        timer = setTimeout(() => setIsVisible(true), 10);
      }, 0);

      document.body.style.overflow = "hidden";
      return () => {
        clearTimeout(renderTimer);
        if (timer) clearTimeout(timer);
      };
    } else {
      const closeTimer = setTimeout(() => {
        setIsVisible(false);
        timer = setTimeout(() => setShouldRender(false), 200);
      }, 0);

      document.body.style.overflow = "unset";
      return () => {
        clearTimeout(closeTimer);
        if (timer) clearTimeout(timer);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!mounted || !shouldRender) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 text-left">
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full max-w-md transform overflow-hidden rounded-2xl bg-surface-dark border border-border-subtle shadow-2xl transition-all duration-200 ease-out ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
