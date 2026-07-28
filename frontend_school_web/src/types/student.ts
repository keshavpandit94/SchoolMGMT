export interface Student {
  _id?: string;
  name: string;
  rollNumber?: string;
  class: string;
  section?: string;
  dateOfBirth: string;
  gender: string;
  address?: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  photoUrl?: string;
  status?: 'Pending Approval' | 'Information Requested' | 'Approved' | 'Rejected' | 'Active' | 'On Leave' | 'Suspended' | 'Graduated';
  createdAt?: string;
  updatedAt?: string;
}
