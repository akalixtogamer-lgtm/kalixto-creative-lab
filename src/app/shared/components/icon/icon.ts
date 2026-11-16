import { Component, input } from '@angular/core';

export type IconName =
  | 'home'
  | 'library'
  | 'palette'
  | 'route'
  | 'play'
  | 'reset'
  | 'copy'
  | 'check'
  | 'lock'
  | 'arrow-left'
  | 'arrow-right'
  | 'menu'
  | 'close';

/**
 * Ícones SVG de traço único (24×24, stroke 1.8) — consistentes em
 * qualquer sistema, ao contrário dos símbolos Unicode.
 * Uso: <kx-icon name="play" />
 */
@Component({
  selector: 'kx-icon',
  host: { class: 'kx-icon', 'aria-hidden': 'true' },
  template: `
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor"
      stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      @switch (name()) {
        @case ('home') { <path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/> }
        @case ('library') { <rect x="3" y="4" width="7" height="7" rx="1.5"/><rect x="14" y="4" width="7" height="7" rx="1.5"/><rect x="3" y="15" width="7" height="5" rx="1.5"/><rect x="14" y="15" width="7" height="5" rx="1.5"/> }
        @case ('palette') { <path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-1.3-1.2-1.6-1.2-2.8 0-.9.7-1.6 1.6-1.6H16a5 5 0 0 0 5-5c0-3.9-4-7-9-7z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10.5" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/> }
        @case ('route') { <circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h6"/> }
        @case ('play') { <path d="M7 4.5v15l12-7.5z"/> }
        @case ('reset') { <path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4"/> }
        @case ('copy') { <rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/> }
        @case ('check') { <path d="M5 12.5l4.5 4.5L19 7.5"/> }
        @case ('lock') { <rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/> }
        @case ('arrow-left') { <path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/> }
        @case ('arrow-right') { <path d="M5 12h14"/><path d="M13 6l6 6-6 6"/> }
        @case ('menu') { <path d="M4 7h16M4 12h16M4 17h16"/> }
        @case ('close') { <path d="M6 6l12 12M18 6L6 18"/> }
      }
    </svg>
  `,
  styles: `:host { display: inline-flex; flex-shrink: 0; line-height: 0; }`,
})
export class Icon {
  readonly name = input.required<IconName>();
}
