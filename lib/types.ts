export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type Gender = 'Male' | 'Female' | 'Other';
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show';
export type AppointmentType = 'consultation' | 'follow-up' | 'check-up' | 'emergency' | 'procedure';
export type RequestStatus = 'pending' | 'approved' | 'rejected';
export type RequestUrgency = 'low' | 'normal' | 'urgent';

export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: Gender;
  phone: string;
  email: string;
  address: string;
  bloodType: BloodType;
  allergies: string[];
  conditions: string[];
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  type: AppointmentType;
  status: AppointmentStatus;
  notes: string;
  createdAt: string;
}

export interface AgentAnalysis {
  intakeNotes: string;
  schedulingSuggestion: string;
  triagePriority: string;
  supervisorSummary: string;
  appointmentNotes?: string;
}

export interface AppointmentRequest {
  id: string;
  patientId: string;
  patientName: string;
  preferredDate: string;
  preferredTime: string;
  type: AppointmentType;
  reason: string;
  urgency: RequestUrgency;
  status: RequestStatus;
  agentAnalysis?: AgentAnalysis;
  agentStatus: 'pending' | 'running' | 'done' | 'error';
  reviewNotes?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  diagnosis: string;
  symptoms: string;
  treatment: string;
  medications: string;
  notes: string;
  followUp: string;
  createdAt: string;
}
