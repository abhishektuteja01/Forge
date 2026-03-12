import { Routine } from "./database";

export interface ScorecardSummary {
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  positivePercentage: number;
  negativePercentage: number;
  neutralPercentage: number;
  totalCount: number;
}

export interface DailyCheckInItem {
  routine: Routine;
  checkInId: string | null;
  completed: boolean;
  date: string; // YYYY-MM-DD format
}
