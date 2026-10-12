/**
 * Theme toggle. The initial theme is applied by the inline script in
 * BaseLayout's <head>; this module only handles user changes.
 */
type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

function currentTheme(): Theme {
  return document.documentElement.dataset['theme'] === 'dark' ? 'dark' : 'light';
}

function persist(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage can be unavailable (private mode, blocked cookies); the choice just won't persist.
  }
}

function apply(theme: Theme, buttons: Iterable<HTMLButtonElement>): void {
  document.documentElement.dataset['theme'] = theme;
  for (const button of buttons) button.setAttribute('aria-pressed', String(theme === 'dark'));
}

export function initThemeToggle(): void {
  const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')];
  apply(currentTheme(), buttons);

  for (const button of buttons) {
    button.addEventListener('click', () => {
      const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
      apply(next, buttons);
      persist(next);
    });
  }
}
