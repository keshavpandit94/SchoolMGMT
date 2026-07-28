export interface Student {
  _id: string;
  name: string;
  rollNumber: string;
  class: string;
  section: string;
  photoUrl?: string;
  status: 'Pending Approval' | 'Information Requested' | 'Approved' | 'Rejected' | 'Active' | 'On Leave' | 'Suspended' | 'Graduated';
  attendance?: { date: string; status: 'Present' | 'Absent' | 'Late' | 'Excused' }[];
}
