import { PlaceSuggestion } from './gemini-service-place';

export interface FoodSuggestion {
  suggestion: string;
  generatedImage: string | null;
}

interface HistoryEntry {
  suggestion: FoodSuggestion;
  imageCaption: string | null;
  placeSuggestion: PlaceSuggestion[];
  date: string;
}

const HISTORY_KEY = 'myoutfood_history';

export function saveToHistory(entry: HistoryEntry): void {
  try {
    const existingHistory = getHistory();
    const updatedHistory = [entry, ...existingHistory];
    
    // Keep only the last 50 entries
    const limitedHistory = updatedHistory.slice(0, 50);
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error('Error saving to history:', error);
  }
}

export function getHistory(): HistoryEntry[] {
  try {
    const historyString = localStorage.getItem(HISTORY_KEY);
    if (!historyString) return [];
    
    return JSON.parse(historyString);
  } catch (error) {
    console.error('Error getting history:', error);
    return [];
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing history:', error);
  }
}

export function deleteHistoryEntry(date: string): void {
  try {
    const history = getHistory();
    const updatedHistory = history.filter(entry => entry.date !== date);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error deleting history entry:', error);
  }
}
