// TODO: no backend endpoint for collaboration proposals yet (see
// CollaborationProposalForm). This is a client-only mock store so /admin can
// list and approve them; replace with a real API once one exists.

export type CollaborationStatus = "pending" | "approved";

export type CollaborationProposal = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  collaborationType: string;
  proposal: string;
  website: string;
  fileName: string | null;
  status: CollaborationStatus;
  createdAt: string;
};

const STORAGE_KEY = "pinata-monde:collaboration-proposals";

function readAll(): CollaborationProposal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CollaborationProposal[]) : [];
  } catch {
    return [];
  }
}

function writeAll(items: CollaborationProposal[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function listCollaborationProposals(): CollaborationProposal[] {
  return readAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function saveCollaborationProposal(
  input: Omit<CollaborationProposal, "id" | "status" | "createdAt">,
): CollaborationProposal {
  const proposal: CollaborationProposal = {
    ...input,
    id: crypto.randomUUID(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  const items = readAll();
  items.push(proposal);
  writeAll(items);
  return proposal;
}

export function approveCollaborationProposal(id: string): void {
  writeAll(readAll().map((item) => (item.id === id ? { ...item, status: "approved" as const } : item)));
}
