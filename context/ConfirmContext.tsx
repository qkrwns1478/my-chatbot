"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: "",
    message: "",
  });

  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((newOptions: ConfirmOptions) => {
    setOptions(newOptions);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    resolver.current?.(true);
  }, []);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    resolver.current?.(false);
  }, []);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmModal
        isOpen={isOpen}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        variant={options.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (context === undefined) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
}
