"use client";

import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface DeleteProteinLogModalProps {
  logId: string | null;
  foodName: string;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export default function DeleteProteinLogModal({
  logId,
  foodName,
  isOpen,
  onClose,
  onDelete,
}: DeleteProteinLogModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const supabase = createClient();

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isDeleting) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isDeleting, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleDelete = async () => {
    if (!logId) return;

    setIsDeleting(true);

    try {
      const { error: deleteError } = await supabase
        .from("protein_logs")
        .delete()
        .eq("id", logId);

      if (deleteError) {
        toast.error(`Failed to delete: ${deleteError.message}`);
        setIsDeleting(false);
        return;
      }

      toast.success(`Deleted ${foodName} successfully`);
      onDelete();
      onClose();
    } catch (err) {
      toast.error("An unexpected error occurred");
      console.error(err);
      setIsDeleting(false);
    }
  };

  if (!isOpen || !logId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      aria-describedby="delete-modal-description"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!isDeleting ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-xl bg-surface p-6 shadow-2xl">
        {/* Warning Icon */}
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-muted">
            <AlertTriangle className="h-6 w-6 text-danger" />
          </div>
        </div>

        {/* Content */}
        <div className="mb-6 text-center">
          <h2
            id="delete-modal-title"
            className="mb-2 text-xl font-bold text-charcoal"
          >
            Delete Food Entry
          </h2>
          <p id="delete-modal-description" className="text-slate">
            Delete <span className="font-semibold text-charcoal">{foodName}</span>?
            <br />
            This action cannot be undone.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-md border border-line-strong px-4 py-2 font-medium text-charcoal transition-colors hover:bg-cloud focus:outline-none focus:ring-2 focus:ring-primary/25 focus:ring-opacity-50"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex-1 rounded-md bg-danger px-4 py-2 font-medium text-white transition-all hover:bg-danger/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-danger/40 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isDeleting}
          >
            {isDeleting ? (
              "Deleting..."
            ) : (
              <span className="flex items-center justify-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Delete
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

