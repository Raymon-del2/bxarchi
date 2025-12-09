export interface BookTheme {
  id: string;
  name: string;
  bg: string; // Tailwind bg color class or custom
  text: string;
  accent?: string;
  extraClasses?: string;
}

export const BOOK_THEMES: BookTheme[] = [
  {
    id: 'vintage',
    name: 'Old / Vintage',
    bg: 'bg-[#E8DCC2]',
    text: 'text-[#3A2A1A]',
    accent: 'text-[#6B4F2F]',
    extraClasses: 'font-serif',
  },
  {
    id: 'minimal',
    name: 'Modern Minimal',
    bg: 'bg-white',
    text: 'text-[#1E1E1E]',
    accent: 'text-cyan-500',
    extraClasses: 'font-sans',
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    bg: 'bg-[#0D0D0D]',
    text: 'text-[#CFCFCF]',
    accent: 'text-cyan-400',
    extraClasses: 'font-sans',
  },
  {
    id: 'newspaper',
    name: 'Old Newspaper',
    bg: 'bg-[#F7F1DF]',
    text: 'text-black',
    extraClasses: 'font-serif',
  },
  {
    id: 'storybook',
    name: 'Fantasy Storybook',
    bg: 'bg-[#F5ECD9]',
    text: 'text-[#3E7FA6]',
    accent: 'text-[#C44A4A]',
    extraClasses: 'font-serif',
  },
  {
    id: 'scifi',
    name: 'Sci-Fi Digital',
    bg: 'bg-[#0F172A]',
    text: 'text-cyan-300',
    accent: 'text-[#38BDF8]',
    extraClasses: 'font-mono',
  },
  {
    id: 'comic',
    name: 'Manga / Comic',
    bg: 'bg-white',
    text: 'text-black',
    extraClasses: 'font-comic',
  },
];
