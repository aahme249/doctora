import { pgTable, text, jsonb } from 'drizzle-orm/pg-core';

export const patients = pgTable('patients', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  dateOfBirth: text('date_of_birth').notNull(),
  gender: text('gender').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull().default(''),
  address: text('address').notNull().default(''),
  bloodType: text('blood_type').notNull(),
  allergies: text('allergies').array().notNull().default([]),
  conditions: text('conditions').array().notNull().default([]),
  createdAt: text('created_at').notNull(),
});

export const appointments = pgTable('appointments', {
  id: text('id').primaryKey(),
  patientId: text('patient_id').notNull(),
  patientName: text('patient_name').notNull(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  type: text('type').notNull(),
  status: text('status').notNull().default('scheduled'),
  notes: text('notes').notNull().default(''),
  createdAt: text('created_at').notNull(),
});

export const records = pgTable('records', {
  id: text('id').primaryKey(),
  patientId: text('patient_id').notNull(),
  patientName: text('patient_name').notNull(),
  date: text('date').notNull(),
  diagnosis: text('diagnosis').notNull(),
  symptoms: text('symptoms').notNull().default(''),
  treatment: text('treatment').notNull().default(''),
  medications: text('medications').notNull().default(''),
  notes: text('notes').notNull().default(''),
  followUp: text('follow_up').notNull().default(''),
  createdAt: text('created_at').notNull(),
});

export const appointmentRequests = pgTable('appointment_requests', {
  id: text('id').primaryKey(),
  patientId: text('patient_id').notNull(),
  patientName: text('patient_name').notNull(),
  preferredDate: text('preferred_date').notNull(),
  preferredTime: text('preferred_time').notNull(),
  type: text('type').notNull(),
  reason: text('reason').notNull().default(''),
  urgency: text('urgency').notNull().default('normal'),
  status: text('status').notNull().default('pending'),
  agentAnalysis: jsonb('agent_analysis'),
  agentStatus: text('agent_status').notNull().default('pending'),
  reviewNotes: text('review_notes'),
  createdAt: text('created_at').notNull(),
  reviewedAt: text('reviewed_at'),
});
