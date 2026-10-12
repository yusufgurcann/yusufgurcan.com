/**
 * Plays the "let's talk" thread like a live conversation: each message appears
 * as it scrolls into view, with a short typing indicator before answers.
 *
 * Messages are revealed in order through a small queue, so a fast scroll
 * catches up quickly instead of leaving blank space on screen (important on
 * phones, where the thread is long). Skipped entirely with reduced motion.
 */
const QUESTION_DELAY_MS = 160;
const TYPING_MS = 520;

type State = 'hidden' | 'typing' | 'shown';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function setState(message: HTMLElement, state: State): void {
  if (state === 'shown') delete message.dataset['state'];
  else message.dataset['state'] = state;
}

function initThread(thread: HTMLElement): void {
  const messages = [...thread.querySelectorAll<HTMLElement>('[data-chat-message]')];
  for (const message of messages) setState(message, 'hidden');

  /** Index of the next message to reveal; messages always appear in order. */
  let next = 0;
  /** Highest message index that has been on screen. */
  let target = -1;
  let playing = false;

  async function play(): Promise<void> {
    if (playing) return;
    playing = true;
    while (next <= target && next < messages.length) {
      const message = messages[next]!;
      // Catching up from far behind? Skip the theatre.
      const behind = target - next > 2;
      if ('chatAnswer' in message.dataset && !behind) {
        setState(message, 'typing');
        await wait(TYPING_MS);
      } else if (!behind) {
        await wait(QUESTION_DELAY_MS);
      }
      setState(message, 'shown');
      next += 1;
    }
    playing = false;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const index = messages.indexOf(entry.target as HTMLElement);
        target = Math.max(target, index);
        observer.unobserve(entry.target);
      }
      void play();
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  for (const message of messages) observer.observe(message);

  // Anyone tabbing into the thread gets everything immediately.
  thread.addEventListener(
    'focusin',
    () => {
      observer.disconnect();
      target = messages.length - 1;
      next = messages.length;
      for (const message of messages) setState(message, 'shown');
    },
    { once: true },
  );
}

export function initChat(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (const thread of document.querySelectorAll<HTMLElement>('[data-chat]')) initThread(thread);
}
