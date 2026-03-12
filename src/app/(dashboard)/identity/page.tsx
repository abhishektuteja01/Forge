"use client";

import { useState, useCallback } from "react";
import { Plus, Fingerprint, Loader2 } from "lucide-react";
import { useIdentities } from "@/hooks/useIdentities";
import { IdentityCard } from "@/components/identity/IdentityCard";
import { IdentityForm } from "@/components/identity/IdentityForm";
import { Modal } from "@/components/ui/Modal";
import type { IdentityWithDetails } from "@/types/identity";

type ModalMode = "create" | "edit" | "links";

export default function IdentityPage() {
  // --------------- State ---------------
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [activeIdentity, setActiveIdentity] =
    useState<IdentityWithDetails | null>(null);

  // --------------- Data ---------------
  const {
    identities,
    routines,
    loading,
    error,
    addIdentity,
    updateIdentity,
    deleteIdentity,
    updateLinks,
  } = useIdentities();

  // --------------- Modal helpers ---------------
  const openModal = useCallback(
    (mode: ModalMode, identity?: IdentityWithDetails) => {
      setModalMode(mode);
      setActiveIdentity(identity ?? null);
      setIsModalOpen(true);
    },
    []
  );

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setActiveIdentity(null);
  }, []);

  // --------------- Handlers ---------------
  const handleCreate = useCallback(() => {
    openModal("create");
  }, [openModal]);

  const handleEdit = useCallback(
    (identity: IdentityWithDetails) => {
      openModal("edit", identity);
    },
    [openModal]
  );

  const handleManageLinks = useCallback(
    (identity: IdentityWithDetails) => {
      openModal("links", identity);
    },
    [openModal]
  );

  const handleDelete = useCallback(
    async (identityId: string) => {
      const confirmed = window.confirm(
        "Are you sure you want to delete this identity? Your vote history will be preserved through your check-ins."
      );
      if (!confirmed) return;

      try {
        await deleteIdentity(identityId);
      } catch {
        // Error logged inside hook
      }
    },
    [deleteIdentity]
  );

  // Form submission handlers — passed directly to IdentityForm
  const handleSubmitCreate = useCallback(
    async (statement: string, routineIds: string[]) => {
      await addIdentity(statement, routineIds);
    },
    [addIdentity]
  );

  const handleSubmitEdit = useCallback(
    async (id: string, statement: string) => {
      await updateIdentity(id, statement);
    },
    [updateIdentity]
  );

  const handleSubmitLinks = useCallback(
    async (identityId: string, routineIds: string[]) => {
      await updateLinks(identityId, routineIds);
    },
    [updateLinks]
  );

  // --------------- Modal title ---------------
  const modalTitle = {
    create: "New Identity",
    edit: "Edit Identity",
    links: "Manage Linked Habits",
  }[modalMode];

  // --------------- Loading state ---------------
  if (loading && identities.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm font-medium">Loading identities...</span>
        </div>
      </div>
    );
  }

  // --------------- Error state ---------------
  if (error && identities.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex max-w-sm flex-col items-center gap-3 text-center">
          <p className="text-sm font-medium text-negative">{error}</p>
          <p className="text-sm text-gray-500">
            Check your connection and try refreshing.
          </p>
        </div>
      </div>
    );
  }

  // --------------- Render ---------------
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6">
      {/* Page heading */}
      <h1 className="mb-2 font-display text-2xl font-bold tracking-tight text-gray-900">
        Identity
      </h1>
      <p className="mb-8 text-sm text-gray-500">
        Every action is a vote for the person you want to become. Define who
        that is, link your habits, and watch the votes add up.
      </p>

      {/* Identity cards */}
      {identities.length > 0 ? (
        <div className="space-y-4">
          {identities.map((identity) => (
            <IdentityCard
              key={identity.id}
              identity={identity}
              onEdit={handleEdit}
              onManageLinks={handleManageLinks}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
            <Fingerprint className="h-7 w-7 text-primary" />
          </div>
          <h3 className="mb-2 font-display text-lg font-bold text-gray-900">
            Who do you want to become?
          </h3>
          <p className="mb-6 max-w-xs text-sm text-gray-500">
            Define an identity statement and link habits to it. Every completed
            habit is a vote — and the votes never reset.
          </p>
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-600"
          >
            <Plus className="h-4 w-4" />
            Define your first identity
          </button>
        </div>
      )}

      {/* Floating action button — visible when identities exist */}
      {identities.length > 0 && (
        <button
          type="button"
          onClick={handleCreate}
          aria-label="Create identity"
          className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all hover:bg-indigo-600 hover:shadow-xl active:scale-95 md:bottom-8 md:right-8"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </button>
      )}

      {/* Form modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={modalTitle}>
        <IdentityForm
          key={`${modalMode}-${activeIdentity?.id ?? "new"}`}
          mode={modalMode}
          identity={activeIdentity ?? undefined}
          routines={routines}
          onSubmitCreate={handleSubmitCreate}
          onSubmitEdit={handleSubmitEdit}
          onSubmitLinks={handleSubmitLinks}
          onClose={closeModal}
        />
      </Modal>
    </div>
  );
}
