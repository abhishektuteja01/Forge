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
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm font-black uppercase tracking-widest">Loading identities...</span>
        </div>
      </div>
    );
  }

  // --------------- Error state ---------------
  if (error && identities.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <p className="rounded-xl bg-negative/10 px-4 py-2 text-sm font-bold text-negative">{error}</p>
          <p className="text-sm font-medium text-slate-500">
            Check your connection and try refreshing.
          </p>
        </div>
      </div>
    );
  }

  // --------------- Render ---------------
  return (
    <div className="flex flex-col gap-10">
      {/* Page heading */}
      <div className="space-y-4">
        <h1 className="font-display text-5xl font-black tracking-tight text-slate-900 sm:text-6xl">
          Your <span className="text-primary italic">Identity</span>
        </h1>
        <p className="text-lg leading-relaxed text-slate-500 max-w-xl">
          Every action is a vote for the person you want to become. <span className="font-bold text-slate-900 underline decoration-primary/30">Define</span> who that is, one habit at a time.
        </p>
      </div>

      {/* Identity cards */}
      {identities.length > 0 ? (
        <div className="space-y-8">
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
        /* Empty state - Unique personality for identity */
        <div className="relative overflow-hidden rounded-[2.5rem] border border-black/[0.03] bg-white p-12 text-center shadow-premium">
          {/* Subtle background decorative element */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-50 blur-3xl" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-slate-50 shadow-inner ring-1 ring-black/[0.03]">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
                <Fingerprint className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <h3 className="mb-4 font-display text-3xl font-black tracking-tight text-slate-900">
              Who do you want to become?
            </h3>
            <p className="mx-auto mb-10 max-w-sm text-lg font-medium leading-relaxed text-slate-500">
              Define a statement of who you are. Link habits that prove it.
              <span className="mt-2 block italic text-slate-400">&ldquo;I am someone who never misses a workout.&rdquo;</span>
            </p>
            
            <button
              type="button"
              onClick={handleCreate}
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-slate-900 px-10 py-5 text-lg font-bold text-white shadow-xl transition-all hover:scale-105 hover:bg-slate-800 active:scale-95"
            >
              <Plus className="h-5 w-5" strokeWidth={3} />
              Define First Identity
            </button>
          </div>
        </div>
      )}

      {/* Floating action button — visible when identities exist */}
      {identities.length > 0 && (
        <button
          type="button"
          onClick={handleCreate}
          aria-label="Create identity"
          className="fixed bottom-24 right-5 z-40 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-2xl shadow-primary/40 transition-all hover:scale-110 hover:bg-indigo-700 active:scale-90 md:bottom-10 md:right-10"
        >
          <Plus className="h-8 w-8" strokeWidth={3} />
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
