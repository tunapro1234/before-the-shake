// The fixed interview: base questions Q1-Q11 and follow-ups F1-F3.
// Every chip list ends with "Not sure". Ids are what the rules read; text is what people see.

export const NOT_SURE = { id: 'not_sure', label: 'Not sure' };

export const QUESTIONS = {
  Q1: {
    id: 'Q1',
    text: 'Who lives with you?',
    hint: 'Choose all that apply.',
    multi: true,
    exclusive: ['not_sure'],
    chips: [
      { id: 'only_adults', label: 'Only adults' },
      { id: 'child_under_5', label: 'A child under 5' },
      { id: 'needs_help', label: 'Someone older or who needs help moving' },
      { id: 'pet', label: 'A pet' },
      NOT_SURE,
    ],
  },
  Q2: {
    id: 'Q2',
    text: 'Which floor is your flat on?',
    chips: [
      { id: 'ground_to_2', label: 'Ground to 2nd' },
      { id: 'floor_3_to_6', label: '3rd to 6th' },
      { id: 'floor_7_plus', label: '7th or higher' },
      NOT_SURE,
    ],
  },
  Q3: {
    id: 'Q3',
    text: 'Is there heavy furniture (wardrobe, bookshelf, tall cabinet) in a bedroom that is not fixed to the wall?',
    chips: [
      { id: 'not_fixed', label: 'Yes, not fixed' },
      { id: 'fixed', label: 'It is fixed' },
      { id: 'none', label: 'No heavy furniture there' },
      NOT_SURE,
    ],
  },
  Q4: {
    id: 'Q4',
    text: 'Do you have an emergency bag ready?',
    chips: [
      { id: 'yes', label: 'Yes' },
      { id: 'partly', label: 'Partly' },
      { id: 'no', label: 'No' },
      NOT_SURE,
    ],
  },
  Q5: {
    id: 'Q5',
    text: 'Do you know your nearest assembly area?',
    chips: [
      { id: 'yes', label: 'Yes' },
      { id: 'no', label: 'No' },
      NOT_SURE,
    ],
  },
  Q6: {
    id: 'Q6',
    text: 'Does your household have a plan: where to meet, and one contact outside the city?',
    chips: [
      { id: 'yes', label: 'Yes' },
      { id: 'partly', label: 'Partly' },
      { id: 'no', label: 'No' },
      NOT_SURE,
    ],
  },
  Q7: {
    id: 'Q7',
    text: 'Do you know how to shut off the gas, water and electricity at home?',
    chips: [
      { id: 'yes', label: 'Yes' },
      { id: 'no', label: 'No' },
      NOT_SURE,
    ],
  },
  Q8: {
    id: 'Q8',
    text: 'Roughly when was your building built?',
    chips: [
      { id: 'before_2000', label: 'Before 2000' },
      { id: 'from_2000_to_2018', label: '2000 to 2018' },
      { id: 'after_2018', label: 'After 2018' },
      NOT_SURE,
    ],
  },
  Q9: {
    id: 'Q9',
    text: 'Have you noticed any of these?',
    hint: 'Choose all that apply.',
    multi: true,
    exclusive: ['none', 'not_sure'],
    chips: [
      { id: 'cracks', label: 'Cracks in columns or beams' },
      { id: 'removed', label: 'A wall or column removed in a renovation (also in shops on the ground floor)' },
      { id: 'rust', label: 'Rust or exposed steel in concrete' },
      { id: 'none', label: 'None of these' },
      NOT_SURE,
    ],
  },
  Q10: {
    id: 'Q10',
    text: 'Do you own or rent your flat?',
    chips: [
      { id: 'own', label: 'Own' },
      { id: 'rent', label: 'Rent' },
      NOT_SURE,
    ],
  },
  Q11: {
    id: 'Q11',
    text: 'Anything else about your home?',
    hint: 'Optional. Write as much or as little as you like.',
    freeText: true,
  },
};

// Follow-ups. `reason` is the fixed "Because you said ..." line; `text` is the fixed question,
// which live mode may reword (the reason line and chips never change).
export const FOLLOWUPS = {
  F1: {
    id: 'F1',
    after: 'Q3',
    reason: 'Because you said there is a child under 5:',
    text: 'Does the child sleep in a room with that furniture?',
    chips: [
      { id: 'yes', label: 'Yes' },
      { id: 'no', label: 'No' },
      NOT_SURE,
    ],
  },
  F2: {
    id: 'F2',
    after: 'Q1',
    reason: 'Because you said someone at home needs help moving:',
    text: 'Who would help them get out?',
    chips: [
      { id: 'someone_at_home', label: 'Someone at home' },
      { id: 'neighbour', label: 'A neighbour' },
      { id: 'nobody_yet', label: 'Nobody yet' },
      NOT_SURE,
    ],
  },
  F3: {
    id: 'F3',
    after: 'Q9',
    reason: 'Because you said a wall or column was removed:',
    text: 'Where was it?',
    chips: [
      { id: 'my_flat', label: 'In my flat' },
      { id: 'other_unit', label: 'In a shop or another flat' },
      NOT_SURE,
    ],
  },
};

export const BASE_ORDER = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10', 'Q11'];

export function getQuestion(id) {
  return QUESTIONS[id] || FOLLOWUPS[id];
}
