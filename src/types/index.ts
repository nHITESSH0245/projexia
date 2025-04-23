
export type UserRole = 'student' | 'mentor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Student extends User {
  role: 'student';
  teamId?: string;
}

export interface Mentor extends User {
  role: 'mentor';
  department: string;
  specialization: string;
  assignedTeamIds: string[];
}

export interface Admin extends User {
  role: 'admin';
}

export interface Team {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  memberIds: string[];
  mentorId?: string;
  projectId?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  teamId: string;
  status: ProjectStatus;
  createdAt: string;
  deliverables: Deliverable[];
}

export type ProjectStatus = 'planning' | 'in_progress' | 'completed';

export type DeliverableStatus = 'pending' | 'submitted' | 'needs_changes' | 'approved';

export interface Deliverable {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: DeliverableStatus;
  fileUrl?: string;
  feedback?: string;
  submittedAt?: string;
  updatedAt?: string;
}

export interface Comment {
  id: string;
  deliverableId: string;
  userId: string;
  text: string;
  createdAt: string;
}
