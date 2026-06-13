import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SuggestionService {
  private suggestions = signal<Record<string, string[]>>({});

  constructor() {
    this.loadFromLocalStorage();
    effect(() => {
      localStorage.setItem('cv_suggestions', JSON.stringify(this.suggestions()));
    });
  }

  getSuggestions(key: string): string[] {
    return this.suggestions()[key] || [];
  }

  addSuggestion(key: string, value: string): void {
    if (!value || value.trim().length < 2) return;
    
    const val = value.trim();
    this.suggestions.update(s => {
      const list = s[key] || [];
      if (list.includes(val)) return s;
      
      const newList = [val, ...list].slice(0, 20);
      return { ...s, [key]: newList };
    });
  }

  private loadFromLocalStorage(): void {
    try {
      const saved = localStorage.getItem('cv_suggestions');
      if (saved) {
        this.suggestions.set(JSON.parse(saved));
      }
    } catch {}
  }
}
