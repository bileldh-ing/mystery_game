import type { Article } from '../game/types';

// "Saltmere Herald" — the in-game browser.
export const ARTICLES: Record<string, Article> = {
  a_runaway: {
    id: 'a_runaway',
    title: 'Police: missing Saltmere teen “left of her own accord”',
    date: 'Wed 7 Oct',
    source: 'Saltmere Herald',
    body:
      'Saltmere Police have scaled back the search for Ivy Calder, 19, who has not been seen since the early hours of Saturday 3 October.\n\nMs Calder’s silver hatchback was found at the ferry terminal car park on Saturday morning. Her family received a message from her phone at 2:14am that night saying she “couldn’t do this anymore”.\n\n“All the indications are that Ivy chose to leave,” said Sgt. Dale Brennan. “She is an adult. We respect her right to privacy and we would ask the community to do the same.”\n\nHer father, Martin Calder, declined to comment. Harbour master Walt Danner, a close family friend, said: “We just want her to know she can come home. Nobody’s angry. Nobody.”',
  },
  a_merrow: {
    id: 'a_merrow',
    title: 'Six years on, Saltmere remembers the Merrow',
    date: '17 Mar',
    source: 'Saltmere Herald',
    photo: 'merrow',
    body:
      'Flowers were laid at the harbour wall this morning to mark six years since the ferry MV Merrow went down two miles off Gull Rock, taking four lives: Nora Calder, Edwin Holt, Agnes Pike and Samuel Reid.\n\nThe memorial plaque, unveiled the following spring, gives the date in the old Roman style favoured by the harbour’s founders.\n\nHarbour master Walt Danner, who coordinated the search that night, read the names aloud. “The sea doesn’t give reasons,” he told those gathered. “We just have to keep each other close.”\n\nNora’s daughter Ivy, now 19, was seen leaving early.',
  },
  a_inquiry: {
    id: 'a_inquiry',
    title: 'Merrow inquiry: “freak wave” to blame',
    date: '2 Sep 2020',
    source: 'Saltmere Herald · archive',
    body:
      'The inquiry into the loss of the MV Merrow has concluded that the vessel was overwhelmed by “an exceptional and unforeseeable wave”.\n\nThe ferry, registration SM-4127, operated by Callow Line Ltd, had passed its harbour authority safety inspection on 3 March, two weeks before the sinking. “There is no evidence of any mechanical or structural failure,” the report states.\n\nThe inquiry team included harbour master Walter Danner and Constable Dale Brennan of Saltmere Police.\n\nCallow Line ceased trading the following year. Its owner, Rupert Callow, died in 2023.',
  },
  a_relays: {
    id: 'a_relays',
    title: 'Harbour goes smart: tide sensors switch on',
    date: '4 Jun 2025',
    source: 'Saltmere Herald',
    photo: 'relaymap',
    body:
      'Eight Bluetooth relay stations now ring Saltmere harbour, feeding live tide and swell readings to the harbour office.\n\nThe relays also pick up registered staff devices — radios, phones and wearables — so the office can “see who’s where on a rough night”, harbour master Walt Danner explained.\n\nThe furthest, R7, sits on the old Gull Rock fog station and runs off a small solar panel. “On a foggy week it might only wake up once a day,” admitted a technician.',
  },
  a_foghorn: {
    id: 'a_foghorn',
    title: 'Gull Rock fog station to stay shut',
    date: '11 Nov 2023',
    source: 'Saltmere Herald',
    photo: 'gullrock',
    body:
      'The Victorian fog-signal station on Gull Rock will remain closed to the public, the harbour committee has confirmed.\n\nThe island can only be reached on foot across a tidal causeway that floods quickly. “People have drowned out there,” said harbour master Walt Danner, who holds the only keys. “There’s nothing on that rock but rust and gulls.”\n\nThe station has been locked since 2011.',
  },
};
