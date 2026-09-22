export interface AzkarItem {
  id: string;
  text: string;
  category: string;
  count: number;
  arabic: string;
  transliteration: string;
  translation: string;
  reward: string;
}

export const AZKAR_DATA: AzkarItem[] = [];
