export const CATCHY_AI_MESSAGES = [
  "Aligning the stars for your new goal...",
  "Orbiting through possibilities...",
  "Calculating the optimal trajectory...",
  "Mapping out your journey to success...",
  "Igniting the engines of productivity...",
  "Consulting the AI oracle for your roadmap...",
  "Synthesizing your master plan...",
  "Fueling your ambition with data...",
];

export const getRandomCatchyMessage = () => {
  return CATCHY_AI_MESSAGES[Math.floor(Math.random() * CATCHY_AI_MESSAGES.length)];
};
