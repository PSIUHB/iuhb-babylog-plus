/**
 * Trackable related interfaces
 */
export interface Trackable {
  id: string;
  childId: string;
  createdByUserId: string;
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
  child?: any;
  createdByUser?: any;
}
export interface TrackableCreateDto {
  childId: string;
  occurredAt: Date;
  notes?: string;
  attachments?: Array<{
    url: string;
    type: string;
    name: string;
  }>;
}
export interface TrackableUpdateDto {
  occurredAt?: Date;
  notes?: string;
  attachments?: Array<{
    url: string;
    type: string;
    name: string;
  }>;
}
export enum FeedingMethod {
  BREAST = 'breast',
  BOTTLE = 'bottle',
  SOLID = 'solid'
}
export enum BreastSide {
  LEFT = 'left',
  RIGHT = 'right',
  BOTH = 'both'
}
export interface Feed extends Trackable {
  method: FeedingMethod;
  amount_ml?: number;
  duration_minutes?: number;
  side?: BreastSide;
  food_type?: string;
}
export interface FeedCreateDto extends TrackableCreateDto {
  method: FeedingMethod;
  amount_ml?: number;
  duration_minutes?: number;
  side?: BreastSide;
  food_type?: string;
}
export interface FeedUpdateDto extends TrackableUpdateDto {
  method?: FeedingMethod;
  amount_ml?: number;
  duration_minutes?: number;
  side?: BreastSide;
  food_type?: string;
}
export enum SleepStatus {
  START = 'start',
  END = 'end'
}
export enum SleepQuality {
  POOR = 'poor',
  FAIR = 'fair',
  GOOD = 'good'
}
export enum SleepType {
  NAP = 'nap',
  NIGHT = 'night',
  OTHER = 'other'
}
export enum FallAsleepMethod {
  ROCKING = 'rocking',
  NURSING = 'nursing',
  BOTTLE = 'bottle',
  PACIFIER = 'pacifier',
  SELF_SOOTHING = 'self_soothing',
  OTHER = 'other'
}
export enum WakeUpBehavior {
  CALM = 'calm',
  CRYING = 'crying',
  FUSSY = 'fussy',
  HAPPY = 'happy'
}
export enum WakeUpReason {
  NATURAL = 'natural',
  NOISE = 'noise',
  HUNGER = 'hunger',
  DIAPER = 'diaper',
  DISCOMFORT = 'discomfort',
  OTHER = 'other'
}
export interface Sleep extends Trackable {
  status: SleepStatus;
  sleepType?: SleepType;
  startTime?: Date;
  endTime?: Date;
  quality?: SleepQuality;
  location?: string;
  fallAsleepMethod?: FallAsleepMethod;
  startNotes?: string;
  environment?: string;
  wakeUpBehavior?: WakeUpBehavior;
  wakeUpReason?: WakeUpReason;
  isEstimated?: boolean;
}
export interface SleepCreateDto extends TrackableCreateDto {
  status: SleepStatus;
  sleepType?: SleepType;
  startTime?: Date;
  endTime?: Date;
  quality?: SleepQuality;
  location?: string;
  fallAsleepMethod?: FallAsleepMethod;
  startNotes?: string;
  environment?: string;
  wakeUpBehavior?: WakeUpBehavior;
  wakeUpReason?: WakeUpReason;
  isEstimated?: boolean;
}
export interface SleepUpdateDto extends TrackableUpdateDto {
  status?: SleepStatus;
  sleepType?: SleepType;
  startTime?: Date;
  endTime?: Date;
  quality?: SleepQuality;
  location?: string;
  fallAsleepMethod?: FallAsleepMethod;
  startNotes?: string;
  environment?: string;
  wakeUpBehavior?: WakeUpBehavior;
  wakeUpReason?: WakeUpReason;
  isEstimated?: boolean;
}
export enum DiaperType {
  WET = 'wet',
  DIRTY = 'dirty',
  BOTH = 'both'
}
export interface Diaper extends Trackable {
  type: DiaperType;
  consistency?: string;
  color?: string;
}
export interface DiaperCreateDto extends TrackableCreateDto {
  type: DiaperType;
  consistency?: string;
  color?: string;
}
export interface DiaperUpdateDto extends TrackableUpdateDto {
  type?: DiaperType;
  consistency?: string;
  color?: string;
}
export enum TemperatureUnit {
  CELSIUS = 'celsius',
  FAHRENHEIT = 'fahrenheit'
}
export enum TemperatureLocation {
  ORAL = 'oral',
  RECTAL = 'rectal',
  ARMPIT = 'armpit',
  EAR = 'ear',
  FOREHEAD = 'forehead'
}
export interface Temperature extends Trackable {
  value: number;
  unit: TemperatureUnit;
  location?: TemperatureLocation;
}
export interface TemperatureCreateDto extends TrackableCreateDto {
  value: number;
  unit: TemperatureUnit;
  location?: TemperatureLocation;
}
export interface TemperatureUpdateDto extends TrackableUpdateDto {
  value?: number;
  unit?: TemperatureUnit;
  location?: TemperatureLocation;
}
export enum WeightUnit {
  KG = 'kg',
  LB = 'lb'
}
export interface Weight extends Trackable {
  value: number;
  unit: WeightUnit;
}
export interface WeightCreateDto extends TrackableCreateDto {
  value: number;
  unit: WeightUnit;
}
export interface WeightUpdateDto extends TrackableUpdateDto {
  value?: number;
  unit?: WeightUnit;
}
export interface Bath extends Trackable {
  duration_minutes?: number;
  water_temperature?: number;
  products_used?: string;
}
export interface BathCreateDto extends TrackableCreateDto {
  duration_minutes?: number;
  water_temperature?: number;
  products_used?: string;
}
export interface BathUpdateDto extends TrackableUpdateDto {
  duration_minutes?: number;
  water_temperature?: number;
  products_used?: string;
}
export interface ITrackableService<T extends Trackable, CreateDto extends TrackableCreateDto, UpdateDto extends TrackableUpdateDto> {
  create(data: CreateDto): Promise<T>;
  findAll(childId: string): Promise<T[]>;
  findOne(id: string): Promise<T>;
  update(id: string, data: UpdateDto): Promise<T>;
  remove(id: string): Promise<void>;
}
export interface IFeedsService extends ITrackableService<Feed, FeedCreateDto, FeedUpdateDto> {
  getStatistics(childId: string): Promise<any>;
}
export interface ISleepsService extends ITrackableService<Sleep, SleepCreateDto, SleepUpdateDto> {
  getStatistics(childId: string): Promise<any>;
}
export interface IDiapersService extends ITrackableService<Diaper, DiaperCreateDto, DiaperUpdateDto> {
  getStatistics(childId: string): Promise<any>;
}
export interface ITemperaturesService extends ITrackableService<Temperature, TemperatureCreateDto, TemperatureUpdateDto> {
  getStatistics(childId: string): Promise<any>;
}
export interface IWeightsService extends ITrackableService<Weight, WeightCreateDto, WeightUpdateDto> {
  getStatistics(childId: string): Promise<any>;
}
export interface IBathsService extends ITrackableService<Bath, BathCreateDto, BathUpdateDto> {
  getStatistics(childId: string): Promise<any>;
}