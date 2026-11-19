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
  | 'close'
  | 'trail'
  | 'quiz'
  | 'compare'
  | 'download'
  | 'book'
  | 'sun'
  | 'moon'
  | 'kcx'
  | 'pause'
  | 'upload'
  | 'layers';

/**
 * Ícones SVG de traço único (24×24, stroke 1.8) — consistentes em
 * qualquer sistema, ao contrário dos símbolos Unicode.
 * Uso: <kx-icon name="play" />
 */
@Component({
  selector: 'kx-icon',
  host: { class: 'kx-icon', 'aria-hidden': 'true' },
  template: `
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      @switch (name()) {
        @case ('home') {
          <path d="M3 11l9-7 9 7" />
          <path d="M5 10v10h14V10" />
          <path d="M10 20v-6h4v6" />
        }
        @case ('library') {
          <rect x="3" y="4" width="7" height="7" rx="1.5" />
          <rect x="14" y="4" width="7" height="7" rx="1.5" />
          <rect x="3" y="15" width="7" height="5" rx="1.5" />
          <rect x="14" y="15" width="7" height="5" rx="1.5" />
        }
        @case ('palette') {
          <path
            d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-1.3-1.2-1.6-1.2-2.8 0-.9.7-1.6 1.6-1.6H16a5 5 0 0 0 5-5c0-3.9-4-7-9-7z"
          />
          <circle cx="7.5" cy="11" r="1" />
          <circle cx="10.5" cy="7" r="1" />
          <circle cx="15" cy="7.5" r="1" />
        }
        @case ('route') {
          <circle cx="6" cy="18" r="2" />
          <circle cx="18" cy="6" r="2" />
          <path d="M8 18h6a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h6" />
        }
        @case ('play') {
          <path d="M7 4.5v15l12-7.5z" />
        }
        @case ('reset') {
          <path d="M4 12a8 8 0 1 0 2.4-5.7" />
          <path d="M4 4v4h4" />
        }
        @case ('copy') {
          <rect x="8" y="8" width="12" height="12" rx="2" />
          <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
        }
        @case ('check') {
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        }
        @case ('lock') {
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        }
        @case ('arrow-left') {
          <path d="M19 12H5" />
          <path d="M11 6l-6 6 6 6" />
        }
        @case ('arrow-right') {
          <path d="M5 12h14" />
          <path d="M13 6l6 6-6 6" />
        }
        @case ('menu') {
          <path d="M4 7h16M4 12h16M4 17h16" />
        }
        @case ('close') {
          <path d="M6 6l12 12M18 6L6 18" />
        }
        @case ('trail') {
          <circle cx="5" cy="19" r="2" />
          <circle cx="19" cy="5" r="2" />
          <path d="M7 19h4a3 3 0 0 0 3-3V8a3 3 0 0 1 3-3" />
          <path d="M5 5h.01M9 5h.01M19 19h.01M15 19h.01" />
        }
        @case ('book') {
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
          <path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" />
          <path d="M9 8h7M9 12h5" />
        }
        @case ('sun') {
          <circle cx="12" cy="12" r="4" />
          <path
            d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
          />
        }
        @case ('moon') {
          <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
        }
        @case ('quiz') {
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14" />
          <path d="M12 17h.01" />
        }
        @case ('download') {
          <path d="M12 4v11" />
          <path d="M7 10l5 5 5-5" />
          <path d="M5 20h14" />
        }
        @case ('kcx') {
          <path d="M4 8h13" />
          <path d="M14 4l4 4-4 4" />
          <path d="M20 16H7" />
          <path d="M10 12l-4 4 4 4" />
        }
        @case ('pause') {
          <path d="M8 5v14M16 5v14" />
        }
        @case ('upload') {
          <path d="M12 16V5" />
          <path d="M7 10l5-5 5 5" />
          <path d="M5 20h14" />
        }
        @case ('layers') {
          <path d="M12 3l9 5-9 5-9-5z" />
          <path d="M3 13l9 5 9-5" />
        }
        @case ('compare') {
          <rect x="3" y="4" width="7" height="16" rx="1.5" />
          <rect x="14" y="4" width="7" height="16" rx="1.5" />
          <path d="M6.5 9v6M17.5 12v3" />
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex-shrink: 0;
      line-height: 0;
    }
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
}
