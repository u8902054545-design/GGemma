export const GREETING_VARIANTS: string[] = [
  "Shall we proceed?",
  "Ready to get started?",
  "Let's dive in, shall we?",
  "Shall we begin?",
  "Ready to work?",
  "Let's get down to business.",
  "What's the plan for today?",
  "Shall we start creating?",
  "Ready for some progress?",
  "Shall we get to work?",
  "Let's make something great.",
  "Ready to collaborate?",
  "Shall we turn ideas into reality?",
  "Ready for your commands.",
  "Let's get started, shall we?",
  "Shall we explore new ideas?",
  "Ready to assist you.",
  "Shall we make some magic?",
  "Ready for a productive session?",
  "Let's begin our journey."
];

export const getRandomGreeting = (userName: string | null) => {
  const phrase = GREETING_VARIANTS[Math.floor(Math.random() * GREETING_VARIANTS.length)];
  const showName = Math.random() > 0.5 && !!userName;
  const firstName = userName?.split(' ')[0] || '';

  if (showName) {
    const nameFirst = Math.random() > 0.5;
    if (nameFirst) {
      return `${firstName}, ${phrase.charAt(0).toLowerCase() + phrase.slice(1)}`;
    } else {
      const cleanPhrase = phrase.replace(/[.?]$/, '');
      const punctuation = phrase.slice(-1);
      return `${cleanPhrase}, ${firstName}${punctuation}`;
    }
  }

  return phrase;
};
