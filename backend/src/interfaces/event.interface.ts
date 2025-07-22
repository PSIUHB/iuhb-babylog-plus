import { MilestoneCategory } from './milestone.interface';

export enum EventType {
  FEEDING = 'feeding',
  DIAPER = 'diaper',
  SLEEP = 'sleep',
  MEDICINE = 'medicine',
  TEMPERATURE = 'temperature',
  WEIGHT = 'weight',
  HEIGHT = 'height',
  ACTIVITY = 'activity',
  NOTE = 'note',
  MILESTONE = 'milestone'
}

export interface Event {
  id: string;
  childId: string;
  createdByUserId: string;
  type: EventType;
  data: Record<string, any>;
  occurredAt: Date;
  notes?: string;
  attachments?: Array<{
    url: string;
    type: string;
    name: string;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface EventCreateDto {
  childId: string;
  type: EventType;
  data: Record<string, any>;
  occurredAt: Date;
  notes?: string;
  attachments?: Array<{
    url: string;
    type: string;
    name: string;
  }>;
}

export interface EventUpdateDto {
  type?: EventType;
  data?: Record<string, any>;
  occurredAt?: Date;
  notes?: string;
  attachments?: Array<{
    url: string;
    type: string;
    name: string;
  }>;
}

export interface EventQueryParams {
  startDate?: string;
  endDate?: string;
  type?: EventType | EventType[];
  limit?: number;
  offset?: number;
}

// Specific event data interfaces
export interface FeedingEventData {
  method: 'breast' | 'bottle' | 'solid';
  amount_ml?: number;
  duration_minutes?: number;
  side?: 'left' | 'right' | 'both';
  food_type?: string;
}

export interface DiaperEventData {
  type: 'wet' | 'dirty' | 'both';
  consistency?: string;
  color?: string;
}

export interface SleepEventData {
  status: 'start' | 'end';
  duration_minutes?: number;
  quality?: 'poor' | 'fair' | 'good';
  location?: string;
}

export interface MedicineEventData {
  name: string;
  dosage: string;
  unit: string;
  reason?: string;
}

export interface TemperatureEventData {
  value: number;
  unit: 'celsius' | 'fahrenheit';
  location?: 'oral' | 'rectal' | 'armpit' | 'ear' | 'forehead';
}

export interface WeightEventData {
  value: number;
  unit: 'kg' | 'lb';
}

export interface HeightEventData {
  value: number;
  unit: 'cm' | 'in';
}

export interface ActivityEventData {
  name: string;
  duration_minutes?: number;
  description?: string;
}

export interface NoteEventData {
  title?: string;
  content: string;
}

export interface MilestoneEventData {
  milestoneId: string;
  category: MilestoneCategory;
  milestone: string;
  expectedAgeMonths: number;
  ageRangeMonths: [number, number];
  achievedDate: string;
}