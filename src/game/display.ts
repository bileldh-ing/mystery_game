import { AV, CHARACTERS, THREAD_META } from '../content';
import type { ThreadId } from './types';

export function threadDisplay(t: ThreadId, flags: Record<string, unknown>) {
  if (t === 'tide' && flags.tideIdentified) return { name: 'Theo (TIDE)', avatar: AV.theo };
  return { name: THREAD_META[t].name, avatar: CHARACTERS[THREAD_META[t].char].avatar };
}
