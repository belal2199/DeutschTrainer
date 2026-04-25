import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'timeAgo', standalone: true, pure: true })
export class TimeAgoPipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return '';

    const diffMs = Date.now() - d.getTime();
    const sec = Math.floor(diffMs / 1000);
    if (sec < 60) return 'gerade eben';
    const min = Math.floor(sec / 60);
    if (min < 60) return `vor ${min} Minute${min === 1 ? '' : 'n'}`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `vor ${hr} Stunde${hr === 1 ? '' : 'n'}`;
    const day = Math.floor(hr / 24);
    if (day < 7) return `vor ${day} Tag${day === 1 ? '' : 'en'}`;

    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}.${mm}.${d.getFullYear()}`;
  }
}
