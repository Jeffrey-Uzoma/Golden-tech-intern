
export type Role = 'admin' | 'intern';

export interface AppUser {
  uid: string;
  name: string;
  whatsapp: string;
  role: Role;
  createdAt: number;
}

export interface Submission {
  fileName: string;
  fileUrl: string;
  submittedAt: number;
}

export interface TaskAttachment {
  fileName: string;
  fileUrl: string;
  publicId?: string;
  resourceType?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: number; // epoch millis
  assignedTo: string; // intern uid
  assignedToName: string;
  assignedToWhatsapp: string;
  createdBy: string;
  createdAt: number;
  submission: Submission | null;

  // Optional file uploaded by the administrator
  adminAttachment?: TaskAttachment;
}