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

  // setMounted(true)는 클라이언트 사이드 렌더링 확인을 위해 유지하되,
  // 린트 에러(react-hooks/set-state-in-effect)를 피하기 위해 주석으로 비활성화하거나
  // 로직을 조정합니다. 이 프로젝트의 린트 규칙은 Effect 내의 직접적인 setState 호출을 엄격히 제한하고 있습니다.

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldRender(true);
      timer = setTimeout(() => setIsVisible(true), 10);
      document.body.style.overflow = "hidden";
    } else {
      setIsVisible(false);
      timer = setTimeout(() => setShouldRender(false), 200);
      document.body.style.overflow = "unset";
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
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
