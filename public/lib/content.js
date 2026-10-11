// Fixed wording. Offline mode shows exactly this; live mode may replace only the action
// explanations (checked by validate.js). Titles, tags, engineer questions and the
// "cannot judge" list always come from here.

export const START = {
  title: 'Before the Shake',
  lead:
    'A short, calm interview about your home that ends in one card: what to do this week, ' +
    'what to ask an engineer, and what this app cannot judge.',
  notThis:
    'It does not tell you whether your building is safe. Only a licensed engineer with a proper assessment can say that.',
  emergencyLine: 'In an emergency, call 112.',
};

export const ACTIONS = {
  A1: {
    title: 'Fix heavy furniture to the wall',
    source: 1,
    explanation:
      'Tall wardrobes, bookshelves and cabinets can tip over in strong shaking. Fix them to the wall with brackets or straps, ' +
      'starting with the bedrooms, and move heavy things off high shelves.',
  },
  A2: {
    title: 'Practice Drop, Cover, Hold On with everyone at home',
    source: 2,
    explanation:
      'When the shaking starts, drop to your hands and knees, cover your head and neck under a sturdy table or next to an inside wall, ' +
      'and hold on until it stops. Try it together once this week in the rooms where you spend the most time.',
  },
  A3: {
    title: 'Pack or complete your emergency bag',
    source: 3,
    explanation:
      'Put water, food that keeps, a torch, a whistle, a charged power bank, a small first-aid kit, copies of your documents ' +
      'and the medicines you need into one bag, and keep it near the door.',
  },
  A4: {
    title: 'Look up your assembly area',
    source: 4,
    explanation:
      'Find the emergency assembly area closest to your home on the official e-Devlet lookup, then walk there once so everyone knows the way.',
  },
  A5: {
    title: 'Make the household plan',
    source: 5,
    explanation:
      'Agree where you will meet if you are apart when it happens, and choose one contact outside the city that everyone can reach. ' +
      'Write both down and keep a copy in the bag.',
  },
  A6: {
    title: 'Learn the gas, water and electricity shut-offs',
    source: 5,
    explanation:
      'Find where the gas, water and electricity shut-offs are and how they turn. Turn the gas off only if you smell gas or hear a leak; otherwise leave it on.',
  },
};

// Extra lines added to an action by the household rules.
export const VARIANTS = {
  childs_room: 'Start with the child\'s room.',
  child_items: 'Add what a small child needs: diapers, food and any medicine.',
  pet_items: 'Add pet food and a leash.',
  who_helps: 'Decide who helps whom, and the way out.',
  who_helps_neighbour: 'Agree on one person who helps and on the way out; if nobody at home can help, ask a neighbour.',
  stairs: 'Plan the stairs route, never the lift.',
};

// "Why" lines, always tagged "App rule": they explain the app's own ordering logic.
export const WHY = {
  child_first: 'Because you said there is a child under 5, this stays first: children sleep in the rooms where furniture can fall.',
  needs_help_second: 'Because you said someone at home needs help moving, the plan moves up to second place.',
  needs_help_first: 'Because you said someone at home needs help moving, the plan moves to the top.',
};

export const ORDER_NOTE = 'The order is a suggestion from simple rules in this app, not an official ranking.';

export const ENGINEER = {
  general_assessment: 'Has this building ever had a professional earthquake performance assessment, and can I see the result?',
  general_code: 'Which seismic design code was this building designed under?',
  general_who: 'What would a licensed engineer need to look at in this building, and who can do that?',
  pre_2000: 'Which seismic code was the building designed under, and has it ever had a performance assessment?',
  removed: 'Was the renovation checked by an engineer, and was the removed element load-bearing?',
  removed_my_flat: 'Was the renovation in my flat checked by an engineer, and was the removed wall or column load-bearing?',
  removed_other_unit: 'Was the renovation in the shop or flat below or nearby checked by an engineer, and was the removed wall or column load-bearing?',
  cracks: 'Are these cracks structural? Can you inspect them?',
  rust: 'Is there corrosion in the reinforcement?',
};

// Statements about the official process, under "The official process" below the engineer questions.
export const PROCESS_TITLE = 'The official process';

export const PROCESS = {
  law_6306_owner:
    'Under Turkey\'s Law 6306, building owners can have a risky-building assessment done, at their own cost, by an institution licensed by the Urban Transformation Presidency.',
  rent: 'Ask the owner or building manager whether an assessment was done.',
};

export const PROCESS_SOURCE = { law_6306_owner: 6 };

// Building facts as plain sentences, for the Honest Panel.
export const FACTS = {
  built_before_2000: 'Built before 2000',
  built_2000_to_2018: 'Built between 2000 and 2018',
  built_after_2018: 'Built after 2018',
  removed: 'A wall or column was removed in a renovation',
  removed_my_flat: 'A wall or column was removed in your flat',
  removed_other_unit: 'A wall or column was removed in a shop or another flat',
  cracks: 'You noticed cracks in columns or beams',
  rust: 'You noticed rust or exposed steel in concrete',
};

export const CANNOT_JUDGE = [
  'Whether your building is safe in an earthquake. Only a licensed engineer with a proper assessment can say that.',
  'The ground under your building or the hazard at your address. This app does not ask for your address.',
  'The official status of your building, for example whether it has been declared risky.',
  'Whether this order is right for every household. It comes from simple rules, not from an expert who knows your home.',
];

export const HONEST_PANEL = {
  title: 'Can this app tell you if your building is safe?',
  body:
    'No. Only a licensed engineer with a proper assessment can say whether a building is safe. ' +
    'This app will not guess, and it will not give a score.',
  factsLead: 'What you told us about the building goes on your card as questions for an engineer:',
  noFacts: 'You have not told us anything about the building yet. Your card will list general questions for an engineer.',
  close: 'Back to the question',
};

export const EMERGENCY = {
  title: 'Call 112 now',
  back: 'Back to the questions',
};

export const LIVE_DISCLOSURE =
  'Live mode: some of your answers are sent to Claude, Anthropic\'s AI, to write the wording. This app saves nothing on a server.';
export const WRITING_NOTE = 'Claude is writing the explanations. The fixed wording is shown until then.';
export const OFFLINE_NOTICE = 'Live connection lost. Continuing in offline mode; your answers are kept.';
export const FIXED_WORDING_NOTE = 'Fixed wording';
