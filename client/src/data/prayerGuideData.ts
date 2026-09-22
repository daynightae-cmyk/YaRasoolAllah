export interface PrayerStep {
  id: string;
  title: string;
  description: string;
  arabicText?: string;
  transliteration?: string;
  category: "preparation" | "positions" | "recitations" | "completion";
  order: number;
  isRequired: boolean;
}

export const PRAYER_GUIDE_STEPS: PrayerStep[] = [];
