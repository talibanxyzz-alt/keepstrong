"use client";

import { useEffect, useState } from "react";
import { Toaster } from "sonner";

/**
 * Phone-first: centered toasts clear the notch and are easier to read one-handed.
 * Desktop keeps the usual top-right placement.
 */
export function AppToaster() {
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <Toaster
      position={wide ? "top-right" : "top-center"}
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "text-[15px] sm:text-sm",
        },
      }}
    />
  );
}
