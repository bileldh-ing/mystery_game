// Registry of all story content. To add a chapter: create chapters/chN.ts and append it here.
import type { Chapter } from '../game/types';
import { ch1 } from './chapters/ch1';
import { ch2 } from './chapters/ch2';
import { ch3 } from './chapters/ch3';

export const CHAPTERS: Chapter[] = [ch1, ch2, ch3];

export const chapterByN = (n: number) => CHAPTERS.find((c) => c.n === n);

export { CHARACTERS, THREAD_META, AV } from './characters';
export { PHOTOS } from './photos';
export { CLUES } from './clues';
export { NOTES } from './notes';
export { ARTICLES } from './news';
export { IVY_THREADS, DELETED_NOTICE } from './ivyArchive';
export { PUZZLES } from './puzzles';
export { ENDINGS } from './endings';

export const WALLPAPER = require('../../assets/images/art/wallpaper.jpg');
export const GAME_TITLE = 'Read 2:14';
