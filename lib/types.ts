export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type Gender = 'Male' | 'Female' | 'Other';
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show';
export type AppointmentType = 'consultation' | 'follow-up' | 'check-up' | 'emergency' | 'procedure';

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
