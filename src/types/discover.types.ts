export type Phrase = {
  id: string;
  kanji: string;
  romaji: string;
  meaning: string;
  cultural_note: string | null;
  level: string;
  published_on: string;
};

export type HiringPost = {
  id: string;
  company: string;
  role: string;
  location: string;
  url: string | null;
  tags: string[];
  published_on: string;
};

export type CulturalInsight = {
  id: string;
  title: string;
  concept: string;
  body: string;
  published_on: string;
};

export type WeatherData = {
  city: string;
  temp_c: number;
  condition: string;
  high_c: number;
  low_c: number;
};