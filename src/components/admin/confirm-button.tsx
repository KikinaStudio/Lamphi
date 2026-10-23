"use client";

import type { ReactNode } from "react";

// Bouton d'action destructrice, avec demande de confirmation.
export function ConfirmButton({
  action,
  message,
  children,
  className = "btn btn-danger btn-sm",
  formClassName,
}: {
  action: () => Promise<void>;
  message: string;
  children: ReactNode;
  className?: string;
  formClassName?: string;
}) {
  return (
    <form
      action={action}
      className={formClassName}
      onSubmit={(event) => {
        if (!confirm(message)) event.preventDefault();
      }}
    >
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}
