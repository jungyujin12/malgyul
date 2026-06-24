export interface Script {
  id: string;
  name: string;
  text: string;
  charCount: number;
}

export interface PracticeSession {
  id: string;
  time: string;
  scriptId: string;
  scriptName: string;
  score: number; // Overall weighted score
  matchRate: number; // Pronunciation match rate % (60% weight)
  wpm: number; // 말 속도 (Words Per Minute / syllables per minute) (20% weight)
  continuity: number; // Capped at 100% (20% weight)
  text: string; // original script text
  recognizedText: string; // STT result text
  matchedWords: string[]; // green highlights
  missedWords: string[]; // orange highlights
  feedback: string[]; // auto-generated sentences
}
