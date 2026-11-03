import type { Locale } from './locales';

/**
 * Interface strings (navigation, labels, section headings).
 * Biographical content lives in `src/content/*.yaml`, not here.
 *
 * The Turkish dictionary is the source of truth for keys; every other
 * locale must provide exactly the same keys (enforced by the type below).
 */
const tr = {
  'meta.title': 'Yusuf Gürcan — iOS & Flutter Developer',
  'meta.description':
    'Yusuf Gürcan: iOS ve Flutter geliştirici. Flutter ile stajlarda, freelance ve gönüllü projelerde mobil uygulamalar geliştirdi; iOS’ta Swift ve SwiftUI ile geliştirdiği oyunu Blokla App Store’da yayında.',

  'a11y.skip': 'İçeriğe geç',
  'a11y.mainNav': 'Ana menü',
  'a11y.openMenu': 'Menüyü aç',
  'a11y.closeMenu': 'Menüyü kapat',
  'a11y.themeToggle': 'Açık / koyu tema',
  'a11y.languageSwitch': 'Dil seçimi',
  'a11y.external': '(yeni sekmede açılır)',

  'nav.why': 'Neden ben?',
  'nav.chat': 'Tanışalım',
  'nav.journey': 'Yol',
  'nav.projects': 'Projeler',
  'nav.skills': 'Beceriler',
  'nav.contact': 'İletişim',

  'hero.eyebrow': 'Merhaba, ben',
  'hero.cta.secondary': 'Benimle iletişime geç',
  'hero.cta.projects': 'Projelerimi gör',
  'hero.cta.cv': 'CV’yi indir',
  'hero.available': 'İş ve staj fırsatlarına açığım',

  'why.kicker': 'Neden ben?',
  'why.reasons': 'Bunu neye dayanarak söylüyorum',
  'why.evidence': 'Kanıtı',
  'why.cta': 'Bir iş verin, görün',

  'chat.kicker': 'Tanışalım',
  'chat.title': 'Bir mülakattan önce, kısa bir sohbet.',
  'chat.lead': 'İşe alım sürecinde en çok sorulan soruları kendime sordum. Cevaplar kısa ve dürüst.',
  'chat.visitor': 'Siz',
  'chat.me': 'Yusuf',
  'chat.typing': 'Yusuf yazıyor…',
  'chat.end': 'Gerisini birlikte konuşalım',

  'journey.kicker': 'Yol',
  'journey.title': 'Deneyim zaman çizelgesi',
  'journey.lead': 'Her durak bir öncekinin üzerine oturdu. Kesin olmayan tarihleri yaklaşık olarak işaretledim.',
  'journey.approx': 'yaklaşık',
  'journey.now': 'şu an',
  'journey.kind.education': 'Eğitim',
  'journey.kind.work': 'Çalışma',
  'journey.kind.internship': 'Staj',
  'journey.kind.freelance': 'Freelance',
  'journey.kind.volunteer': 'Eğitim & gönüllü proje',
  'journey.kind.growth': 'Bugün',
  'journey.learned': 'Bana kazandırdığı',
  'journey.work': 'Neler yaptım',
  'journey.highlights': 'Yer aldığım projeler',

  'projects.kicker': 'Projeler',
  'projects.title': 'Üzerinde çalıştığım işler',
  'projects.lead': 'Önce kendi ürünüm Blokla. Stajlarda ve freelance olarak çalıştığım ürünler hemen aşağıda, Yol bölümünde.',
  'projects.purpose': 'Amaç',
  'projects.role': 'Rolüm',
  'projects.stack': 'Teknolojiler',
  'projects.status': 'Durum',
  'projects.focus': 'Odaklandığım konular',
  'projects.work': 'Neler yaptım',
  'projects.links': 'Bağlantılar',
  'projects.also': 'Ayrıca',
  'projects.featured': 'Şu an üzerinde çalıştığım',
  'projects.previewNote': 'Oyunun mantığını gösteren kısa, temsili bir tekrar',
  'projects.replay': 'Tekrar izle',

  'skills.kicker': 'Beceriler',
  'skills.languages': 'Diller',
  'skills.title': 'Nerede öğrendim, nerede kullandım',
  'skills.lead': 'Burada yüzdelik çubuklar yok. Her teknolojinin yanında onunla nasıl tanıştığımı yazdım.',

  'education.kicker': 'Eğitim',
  'education.title': 'Eğitim',

  'contact.kicker': 'İletişim',
  'contact.title': 'Sıradaki görev sizinki olsun.',
  'contact.lead':
    'Ekibinizde, haftanızı yiyen işleri üstlenecek ve verdiğiniz işi gönül rahatlığıyla teslim edecek bir geliştirici arıyorsanız yazın. İş, staj ve proje iş birliklerine açığım.',
  'contact.email': 'E-posta',
  'contact.github': 'GitHub',
  'contact.linkedin': 'LinkedIn',
  'contact.cv': 'CV (PDF)',

  'cv.title': 'Özgeçmiş',
  'cv.profile': 'Profil',
  'cv.experience': 'Deneyim',
  'cv.projects': 'Projeler',
  'cv.education': 'Eğitim',
  'cv.skills': 'Beceriler',
  'cv.languages': 'Diller',
  'cv.products': 'Yer aldığım projeler',

  'placeholder.pending': 'eklenecek',

  'footer.top': 'Başa dön',
} as const;

export type UiKey = keyof typeof tr;
type Dictionary = Record<UiKey, string>;

const en: Dictionary = {
  'meta.title': 'Yusuf Gürcan — iOS & Flutter Developer',
  'meta.description':
    'Yusuf Gürcan: iOS and Flutter developer. Built mobile apps with Flutter in internships, freelance and volunteer projects; his iOS game Blokla, built with Swift and SwiftUI, is live on the App Store.',

  'a11y.skip': 'Skip to content',
  'a11y.mainNav': 'Main navigation',
  'a11y.openMenu': 'Open menu',
  'a11y.closeMenu': 'Close menu',
  'a11y.themeToggle': 'Light / dark theme',
  'a11y.languageSwitch': 'Language',
  'a11y.external': '(opens in a new tab)',

  'nav.why': 'Why me?',
  'nav.chat': 'Let’s talk',
  'nav.journey': 'Path',
  'nav.projects': 'Projects',
  'nav.skills': 'Skills',
  'nav.contact': 'Contact',

  'hero.eyebrow': 'Hi, I’m',
  'hero.cta.secondary': 'Get in touch',
  'hero.cta.projects': 'See my projects',
  'hero.cta.cv': 'Download CV',
  'hero.available': 'Open to job and internship opportunities',

  'why.kicker': 'Why me?',
  'why.reasons': 'What I base this on',
  'why.evidence': 'Proof',
  'why.cta': 'Give me a task and see',

  'chat.kicker': 'Let’s talk',
  'chat.title': 'A short chat, before any interview.',
  'chat.lead': 'I asked myself the questions recruiters ask most often. The answers are short and honest.',
  'chat.visitor': 'You',
  'chat.me': 'Yusuf',
  'chat.typing': 'Yusuf is typing…',
  'chat.end': 'Let’s talk about the rest together',

  'journey.kicker': 'Path',
  'journey.title': 'Experience timeline',
  'journey.lead': 'Each stop sits on top of the one before it. Dates that aren’t exact are marked as approximate.',
  'journey.approx': 'approx.',
  'journey.now': 'now',
  'journey.kind.education': 'Education',
  'journey.kind.work': 'Work',
  'journey.kind.internship': 'Internship',
  'journey.kind.freelance': 'Freelance',
  'journey.kind.volunteer': 'Training & volunteer project',
  'journey.kind.growth': 'Today',
  'journey.learned': 'What it gave me',
  'journey.work': 'What I did',
  'journey.highlights': 'Projects I worked on',

  'projects.kicker': 'Projects',
  'projects.title': 'Things I’ve worked on',
  'projects.lead': 'My own product, Blokla, comes first. The products I worked on in internships and freelance are right below, in the Path section.',
  'projects.purpose': 'Purpose',
  'projects.role': 'My role',
  'projects.stack': 'Technologies',
  'projects.status': 'Status',
  'projects.focus': 'What I focus on',
  'projects.work': 'What I built',
  'projects.links': 'Links',
  'projects.also': 'Also',
  'projects.featured': 'What I’m working on now',
  'projects.previewNote': 'A short, illustrative replay of how the game plays',
  'projects.replay': 'Watch again',

  'skills.kicker': 'Skills',
  'skills.languages': 'Languages',
  'skills.title': 'Where I learned it, where I used it',
  'skills.lead': 'No percentage bars here. Next to each technology I wrote down how I came to know it.',

  'education.kicker': 'Education',
  'education.title': 'Education',

  'contact.kicker': 'Contact',
  'contact.title': 'Let the next task be yours.',
  'contact.lead':
    'If your team needs a developer who takes on the work that eats your week and hands it over without you having to worry, get in touch. I’m open to jobs, internships and project collaborations.',
  'contact.email': 'Email',
  'contact.github': 'GitHub',
  'contact.linkedin': 'LinkedIn',
  'contact.cv': 'CV (PDF)',

  'cv.title': 'Résumé',
  'cv.profile': 'Profile',
  'cv.experience': 'Experience',
  'cv.projects': 'Projects',
  'cv.education': 'Education',
  'cv.skills': 'Skills',
  'cv.languages': 'Languages',
  'cv.products': 'Products worked on',

  'placeholder.pending': 'to be added',

  'footer.top': 'Back to top',
};

export const dictionaries: Record<Locale, Dictionary> = { tr, en };
