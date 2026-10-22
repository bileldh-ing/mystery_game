import type { Ending, EndingId, FlagValue } from '../game/types';

const accusedName = (f: Record<string, FlagValue>) =>
  ({ brennan: 'Sgt. Dale Brennan', jonah: 'Jonah Price', maya: 'Maya Okafor' } as Record<string, string>)[
    String(f.accused)
  ] ?? 'the wrong person';

export const ENDINGS: Record<EndingId, Ending> = {
  bad: {
    id: 'bad',
    title: 'Still Water',
    tagline: 'The sea keeps what the town remembers.',
    art: require('../../assets/images/art/end_bad.jpg'),
    body: (f) => {
      const out: string[] = [];
      if (f.accused && f.accused !== 'walt') {
        out.push(
          `Police spent the night at ${accusedName(f)}’s door. By the time anyone thought of Gull Rock, the causeway was under four metres of black water.`,
        );
      } else {
        out.push(
          'You had the right name. You trusted it to the wrong place. Somewhere in the fog, an engine with no lights went out past the breakwater and came back lighter.',
        );
      }
      out.push(
        'Ivy Calder’s file stays closed: voluntary departure. Every March, Walt Danner reads five names at the harbour wall now, and his voice never shakes.',
        'TIDE never messages you again. Some nights you open the thread and type, and delete it, and type.',
        'You got it wrong. Again. But this time, nobody will ever know — except you.',
      );
      return out;
    },
  },
  good: {
    id: 'good',
    title: 'Low Tide',
    tagline: 'She came home.',
    art: require('../../assets/images/art/end_good.jpg'),
    body: (f) => {
      const out = [
        'At 03:47 a coastguard team cut the chain on the generator-room door of the Gull Rock fog station. Ivy Calder walked out on her own two feet, wrapped in foil, asking for her brother.',
        'Walt Danner was charged with kidnapping and false imprisonment.',
      ];
      if (!f.logbookSecured) {
        out.push(
          'But the logbook was never found. Without it, the Merrow stays a “freak wave” on paper, and Danner’s lawyers call Ivy’s blurry photograph “the obsession of a grieving girl”.',
        );
      } else {
        out.push('The logbook sits in an evidence locker in the county town, waiting for a reopened inquiry.');
      }
      if (!f.tideIdentified) {
        out.push('TIDE’s thread goes quiet. You never learn who they were. Maybe that’s the deal.');
      } else if (!f.theoToldDad) {
        out.push(
          'Theo still hasn’t told his dad about the night he fell asleep. He carries it around like a stone in his pocket.',
        );
      }
      out.push('There’s a version of this where everything comes out. You can feel it, just past the fog.');
      return out;
    },
  },
  true: {
    id: 'true',
    title: 'The Fog Lifts',
    tagline: 'Everyone answered.',
    art: require('../../assets/images/art/end_true.jpg'),
    body: () => [
      'Martin Calder led the coastguard across the causeway in the dark, stone by stone, the way his wife taught him twenty years ago. He was the first through the generator-room door.',
      'Walt Danner was charged with kidnapping, false imprisonment and — once Inspection Log Vol. 9 reached the county — four counts of gross negligence manslaughter for the Merrow. The inquiry was reopened in December. The plaque on the harbour wall got a new line: “The truth, at last.”',
      'Sgt. Dale Brennan took early retirement. Maya and Ivy said goodbye to each other every day of the hospital stay, and then hello again.',
      'Theo still feels it — the controller in his lap, the message at 01:21. But he said it out loud, to the people who mattered, and they stayed.',
      'Three months later, a new episode of Dead Air goes up. Episode 41: “Read 2:14.” Two hosts. One of them types in lowercase.',
    ],
  },
};
