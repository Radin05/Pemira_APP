import { apiGet, apiPostJson, apiPatchJson, apiPut, apiDelete } from "@/lib/api/client";

export const ROLE_OPTIONS = [
  { value: "MAHASISWA", label: "Mahasiswa" },
  { value: "HUKUM_SEKRETARIAT", label: "Hukum & Sekretariat" },
  { value: "KETUA_KP", label: "Ketua KP" },
  { value: "PDD", label: "PDD" },
  { value: "ADMIN", label: "Admin" },
] as const;

export const ROLE_LABEL: Record<string, string> = Object.fromEntries(
  ROLE_OPTIONS.map((r) => [r.value, r.label]),
);

export type AdminUser = {
  id: number;
  email: string;
  fullName: string;
  npm: string | null;
  studyProgram: string | null;
  active: boolean;
  roles: string[];
  createdAt: string;
};

export type CreateUserPayload = {
  email: string;
  fullName: string;
  password: string;
  studyProgram?: string;
  roles: string[];
};

export type Candidate = {
  id: number;
  candidateNumber: number;
  electionType: "BEM" | "BPM";
  chiefName: string;
  viceName: string | null;
  studyProgram: string | null;
  photoUrl: string | null;
  vision: string | null;
  mission: string | null;
  workPrograms: string | null;
  active: boolean;
};

export type CandidatePayload = {
  candidateNumber: number;
  electionType: "BEM" | "BPM";
  chiefName: string;
  viceName?: string;
  studyProgram?: string;
  photoUrl?: string;
  vision?: string;
  mission?: string;
  workPrograms?: string;
  active: boolean;
};

export const adminUsers = {
  list: () => apiGet<AdminUser[]>("/users", true),
  create: (payload: CreateUserPayload) => apiPostJson<{ id: number }>("/users", payload, true),
  updateRoles: (id: number, roles: string[]) =>
    apiPatchJson<null>(`/users/${id}/roles`, { roles }, true),
  setActive: (id: number, active: boolean) =>
    apiPatchJson<null>(`/users/${id}/active`, { active }, true),
};

export const adminCandidates = {
  list: () => apiGet<Candidate[]>("/candidates", true),
  create: (payload: CandidatePayload) =>
    apiPostJson<{ id: number }>("/candidates", payload, true),
  update: (id: number, payload: CandidatePayload) =>
    apiPut<null>(`/candidates/${id}`, payload, true),
  remove: (id: number) => apiDelete<null>(`/candidates/${id}`, true),
};
