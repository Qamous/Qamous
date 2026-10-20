export const stripTashkil = (value: string) => value.normalize('NFC').replace(/[\u064b-\u0652\u0670\u0640]/gu,'').trim().replace(/\s+/gu,' ');
export const hasTashkil = (value: string) => /[\u064b-\u0652\u0670]/u.test(value);
export const hasArabicLetter = (value: string) => [...value].some(c=>/\p{Script=Arabic}/u.test(c)&&/\p{L}/u.test(c));
