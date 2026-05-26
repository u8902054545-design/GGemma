
export type GreetingVariant = {
  en: string;
  ru: string;
};

export const GREETING_VARIANTS: GreetingVariant[] = [
  { en: "Shall we proceed?", ru: "Приступим?" },
  { en: "Ready to get started?", ru: "Готов начать?" },
  { en: "Let's dive in, shall we?", ru: "Погрузимся в работу?" },
  { en: "Shall we begin?", ru: "Начнем?" },
  { en: "Ready to work?", ru: "Готов к работе?" },
  { en: "Let's get down to business.", ru: "Приступим к делу." },
  { en: "What's the plan for today?", ru: "Какой план на сегодня?" },
  { en: "Shall we start creating?", ru: "Начнем творить?" },
  { en: "Ready for some progress?", ru: "Готов к прогрессу?" },
  { en: "Shall we get to work?", ru: "Приступим к работе?" },
  { en: "Let's make something great.", ru: "Давай создадим что-то великое." },
  { en: "Ready to collaborate?", ru: "Готов к сотрудничеству?" },
  { en: "Shall we turn ideas into reality?", ru: "Воплотим идеи в реальность?" },
  { en: "Ready for your commands.", ru: "Жду твоих команд." },
  { en: "Let's get started, shall we?", ru: "Давай начнем?" },
  { en: "Shall we explore new ideas?", ru: "Изучим новые идеи?" },
  { en: "Ready to assist you.", ru: "Готов помочь." },
  { en: "Shall we make some magic?", ru: "Сотворим магию?" },
  { en: "Ready for a productive session?", ru: "Готов к продуктивной сессии?" },
  { en: "Let's begin our journey.", ru: "Начнем наше путешествие." }
];

export const getRandomGreeting = (userName: string | null, language: 'en' | 'ru') => {
  const variant = GREETING_VARIANTS[Math.floor(Math.random() * GREETING_VARIANTS.length)];
  const phrase = variant[language];
  const showName = Math.random() > 0.5 && !!userName;
  const firstName = userName?.split(' ')[0] || '';

  if (showName) {
    // English: "Name, shall we proceed?" or "Shall we proceed, Name?"
    // Russian: "Name, приступим?" or "Приступим, Name?"
    const nameFirst = Math.random() > 0.5;
    if (nameFirst) {
      return `${firstName}, ${phrase.charAt(0).toLowerCase() + phrase.slice(1)}`;
    } else {
      // Remove trailing dot/question mark and append name
      const cleanPhrase = phrase.replace(/[.?]$/, '');
      const punctuation = phrase.slice(-1);
      return `${cleanPhrase}, ${firstName}${punctuation}`;
    }
  }

  return phrase;
};
