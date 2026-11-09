import { PlacementDrive } from '../types';
import { apiFetch } from './apiFetch';

export interface CreatePlacementDriveInput {
  companyId: string;
  roleTitle: string;
  ctcLPA: number;
  minCGPA: number;
  maxBacklogsAllowed: number;
  driveDate: string;
  startTime: string;
  endTime: string;
  meetingType: NonNullable<PlacementDrive['meetingType']>;
  teamsMeetingLink: string;
  venue: string;
  targetBranches: string[];
  requiredSkills: string[];
  jobDescription: string;
  status: PlacementDrive['status'];
  isPublished: boolean;
  rounds: {
    roundNumber: number;
    roundName: string;
    date: string;
    venue: string;
  }[];
}

export function getTodayDateInIST(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const part = (type: 'year' | 'month' | 'day') =>
    parts.find(value => value.type === type)?.value || '';

  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function formatDriveDate(date: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return date;

  const [, year, month, day] = match;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
    .toLocaleDateString('en-IN', {
      timeZone: 'UTC',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
}

export function formatMeetingTimeIST(time?: string): string {
  if (!time) return 'Time not set';

  const twentyFourHour = /^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/.exec(time);
  if (twentyFourHour) {
    const hour = Number(twentyFourHour[1]);
    const minute = twentyFourHour[2];
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute} ${period} IST`;
  }

  const twelveHour = /^(\d{1,2}:\d{2}\s*[AP]M)(?:\s+IST)?$/i.exec(time);
  if (twelveHour) return `${twelveHour[1].toUpperCase()} IST`;

  return `${time} IST`;
}

export function isPastMeetingInIST(date: string, time?: string): boolean {
  const dateKey = date.slice(0, 10);
  const today = getTodayDateInIST();
  if (dateKey < today) return true;
  if (dateKey > today || !time) return false;

  const currentTimeParts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(new Date());
  const currentTime = `${currentTimeParts.find(part => part.type === 'hour')?.value || '00'}:${currentTimeParts.find(part => part.type === 'minute')?.value || '00'}`;
  const twentyFourHour = /^([01]\d|2[0-3]):([0-5]\d)/.exec(time);
  if (twentyFourHour) return `${twentyFourHour[1]}:${twentyFourHour[2]}` < currentTime;

  const twelveHour = /^(\d{1,2}):([0-5]\d)\s*([AP]M)$/i.exec(time);
  if (!twelveHour) return false;
  const hour = Number(twelveHour[1]) % 12 + (twelveHour[3].toUpperCase() === 'PM' ? 12 : 0);
  return `${String(hour).padStart(2, '0')}:${twelveHour[2]}` < currentTime;
}

export async function createPlacementDrive(
  input: CreatePlacementDriveInput,
  idempotencyKey: string
): Promise<PlacementDrive> {
  const response = await apiFetch('/api/drives', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey
    },
    credentials: 'same-origin',
    body: JSON.stringify(input)
  });

  const result = await response.json() as {
    success?: boolean;
    message?: string;
    drive?: PlacementDrive;
  };

  if (!response.ok || !result.success || !result.drive) {
    throw new Error(result.message || 'Failed to save the scheduled drive.');
  }

  return result.drive;
}
