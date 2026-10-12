/**
 * Header behaviour (progressive enhancement; the header works without it):
 *  - mobile menu: toggle, close on link click / Escape / wider viewport
 *  - scroll state: hairline border once the page is scrolled
 *  - scroll spy: marks the nav link of the section in view with aria-current
 *  - language links keep the current #section when switching language
 */
const COMPACT_QUERY = '(max-width: 60rem)';

function initMenu(header: HTMLElement): void {
  const button = header.querySelector<HTMLButtonElement>('[data-menu-button]');
  const panel = header.querySelector<HTMLElement>('[data-menu-panel]');
  const label = header.querySelector<HTMLElement>('[data-menu-label]');
  if (!button || !panel || !label) return;

  const setOpen = (open: boolean) => {
    button.setAttribute('aria-expanded', String(open));
    panel.toggleAttribute('data-open', open);
    label.textContent = (open ? button.dataset['labelClose'] : button.dataset['labelOpen']) ?? '';
  };

  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
  panel.addEventListener('click', (event) => {
    if ((event.target as Element).closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && panel.hasAttribute('data-open')) {
      setOpen(false);
      button.focus();
    }
  });
  window.matchMedia(COMPACT_QUERY).addEventListener('change', () => setOpen(false));
}

function initScrollState(header: HTMLElement): void {
  const update = () => header.toggleAttribute('data-scrolled', window.scrollY > 8);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

function initScrollSpy(header: HTMLElement): void {
  const links = new Map<string, HTMLAnchorElement>();
  for (const link of header.querySelectorAll<HTMLAnchorElement>('[data-nav-link]')) {
    links.set(link.hash.slice(1), link);
  }
  const sections = [...links.keys()]
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => el !== null);
  if (sections.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const [id, link] of links) {
          if (id === entry.target.id) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        }
      }
    },
    // A thin band across the upper middle of the viewport decides the "current" section.
    { rootMargin: '-35% 0px -60% 0px' },
  );
  for (const section of sections) observer.observe(section);
}

function initLanguageLinks(header: HTMLElement): void {
  for (const link of header.querySelectorAll<HTMLAnchorElement>('[data-keep-hash]')) {
    link.addEventListener('click', () => {
      link.hash = window.location.hash;
    });
  }
}

export function initHeader(): void {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;
  initMenu(header);
  initScrollState(header);
  initScrollSpy(header);
  initLanguageLinks(header);
}
