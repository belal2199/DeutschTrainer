import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface VocabEntry {
  word: string;
  english: string;
  perfekt?: string;
  category: string;
}

const ESC_RE = /[.*+?^${}()|[\]\\]/g;
function escapeRegex(s: string): string { return s.replace(ESC_RE, '\\$&'); }
function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, '&#39;');
}

@Pipe({ name: 'vocabHighlight', standalone: true, pure: true })
export class VocabHighlightPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  transform(text: string | null | undefined, vocab: VocabEntry[] | null | undefined): SafeHtml {
    if (!text) return '';
    const safeText = escapeHtml(text);
    if (!vocab || vocab.length === 0) return this.sanitizer.bypassSecurityTrustHtml(safeText);

    const lookup = new Map<string, VocabEntry>();
    for (const v of vocab) {
      const stripped = v.word.replace(/^(der|die|das)\s+/i, '').trim();
      if (stripped) lookup.set(stripped.toLowerCase(), v);
    }

    const keys = [...lookup.keys()].sort((a, b) => b.length - a.length);
    if (keys.length === 0) return this.sanitizer.bypassSecurityTrustHtml(safeText);

    const re = new RegExp(`\\b(${keys.map(escapeRegex).join('|')})\\b`, 'gi');
    const html = safeText.replace(re, (match) => {
      const entry = lookup.get(match.toLowerCase());
      if (!entry) return match;
      const perfekt = entry.perfekt ? ` data-perfekt="${escapeAttr(entry.perfekt)}"` : '';
      return `<span class="vocab-highlight" data-word="${escapeAttr(entry.word)}" data-en="${escapeAttr(entry.english)}"${perfekt} data-cat="${escapeAttr(entry.category)}">${match}</span>`;
    });

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
