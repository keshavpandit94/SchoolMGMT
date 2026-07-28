export interface Student {
  _id: string;
  name: string;
  rollNumber: string;
  class: string;
  section: string;
  dateOfBirth: string | Date;
  gender: 'Male' | 'Female' | 'Other';
  address?: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  photoUrl?: string;
  status: 'Pending Approval' | 'Information Requested' | 'Approved' | 'Rejected' | 'Active' | 'On Leave' | 'Suspended' | 'Graduated';
  approvedBy?: any;
  createdBy?: any;
  createdAt?: string;
  updatedAt?: string;
}
