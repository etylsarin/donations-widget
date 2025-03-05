import { createContext } from 'preact';

export const Translations = createContext<((name: string, value?: Date | string) => string)>(() => '');
