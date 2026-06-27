import React from 'react';
import { Drawer } from 'vaul';
import { useLanguage } from '../../hooks/useLanguage';
import '@material/web/list/list.js';
import '@material/web/list/list-item.js';
import '@material/web/divider/divider.js';

interface RoleItem {
  id: string;
  titleRu: string;
  titleEn: string;
  descRu: string;
  descEn: string;
}

export const ASSISTANT_ROLES: RoleItem[] = [
  {
    id: '',
    titleRu: 'Не используется',
    titleEn: 'Not used',
    descRu: 'Буду общаться в стандартной роли без дополнительных правил поведения.',
    descEn: 'I will communicate in my default role without additional behavior rules.'
  },
  {
    id: 'erudite',
    titleRu: 'Эрудит (Академический эксперт)',
    titleEn: 'Erudite (Academic Expert)',
    descRu: 'Обладаю широким кругозором и глубокими академическими знаниями. Разбираюсь в сложных научных темах, теориях и фактах.',
    descEn: 'I possess a broad perspective and deep academic knowledge. I excel in complex scientific topics, theories, and facts.'
  },
  {
    id: 'pragmatist',
    titleRu: 'Прагматик (Бизнес-ассистент)',
    titleEn: 'Pragmatist (Business Assistant)',
    descRu: 'Ориентирован на практический результат, структуру и эффективность. Помогаю оптимизировать процессы и решать бизнес-задачи.',
    descEn: 'I focus on practical results, structure, and efficiency. I help optimize processes and solve business tasks.'
  },
  {
    id: 'mentor',
    titleRu: 'Наставник (Понятный учитель)',
    titleEn: 'Mentor (Understandable Teacher)',
    descRu: 'Терпеливо и понятно объясняю даже самые сложные концепции. Помогаю вам развиваться и учиться в комфортном темпе.',
    descEn: 'I explain even the most complex concepts patiently and clearly. I help you grow and learn at a comfortable pace.'
  },
  {
    id: 'interlocutor',
    titleRu: 'Собеседник (Приятель на равных)',
    titleEn: 'Interlocutor (Friend on equal terms)',
    descRu: 'Общаюсь легко, открыто и по-дружески. Готов выслушать, поддержать беседу на любую тему и быть с вами на одной волне.',
    descEn: 'I communicate easily, openly, and in a friendly manner. I am ready to listen, support conversations on any topic, and stay on your wavelength.'
  },
  {
    id: 'creative',
    titleRu: 'Креативщик (Генератор идей)',
    titleEn: 'Creative (Idea Generator)',
    descRu: 'Генерирую нестандартные идеи, вдохновляю на творчество и предлагаю оригинальные подходы к решению любых задач.',
    descEn: 'I generate non-standard ideas, inspire creativity, and offer original approaches to solving any task.'
  },
  {
    id: 'critic',
    titleRu: 'Критик (Адвокат дьявола)',
    titleEn: 'Critic (Devil\'s Advocate)',
    descRu: 'Помогаю трезво оценить ваши идеи, указываю на риски, слабые места и скрытые проблемы, чтобы помочь вам избежать ошибок.',
    descEn: 'I help soberly evaluate your ideas, pointing out risks, weak spots, and hidden issues to help you avoid mistakes.'
  },
  {
    id: 'sparring_partner',
    titleRu: 'Спарринг-партнёр (Коуч по развитию)',
    titleEn: 'Sparring Partner (Development Coach)',
    descRu: 'Задаю глубокие вопросы, помогаю вам сформулировать цели и мотивирую находить лучшие решения для личностного роста.',
    descEn: 'I ask deep questions, help you formulate goals, and motivate you to find the best solutions for personal growth.'
  },
  {
    id: 'laconic',
    titleRu: 'Лаконик (Минималист)',
    titleEn: 'Laconic (Minimalist)',
    descRu: 'Ценю лаконичность и краткость. Даю ответы по существу, отсекая все лишние слова и отступления.',
    descEn: 'I value brevity and conciseness. I give direct answers, cutting out all unnecessary words and digressions.'
  }
];

interface AssistRoleBottomSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRole: string;
  onRoleSelect: (roleId: string) => void;
}

export const AssistRoleBottomSheet: React.FC<AssistRoleBottomSheetProps> = ({
  isOpen,
  onOpenChange,
  selectedRole,
  onRoleSelect
}) => {
  const { t, language } = useLanguage();

  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[100005]" />
        <Drawer.Content className="bg-[var(--md-sys-color-surface)] flex flex-col rounded-t-[28px] h-auto fixed bottom-0 left-0 right-0 z-[100006] outline-none border-none max-w-lg mx-auto">
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[var(--md-sys-color-outline)] my-4" />
          
          <div className="px-6 py-2">
            <h2 className="text-[var(--md-sys-color-on-surface)] text-xl font-medium mb-1">
              {t('personalization.behavior.assist_role.title') || (language === 'ru' ? 'Конфигурация ассистента' : 'Assistant configuration')}
            </h2>
            <p className="text-[var(--md-sys-color-on-surface-variant)] text-xs">
              {t('personalization.behavior.assist_role.desc') || (language === 'ru' ? 'Выберите роль, которую будет выполнять Gemma' : 'Select the role Gemma will perform')}
            </p>
          </div>

          <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden pb-8 mt-2">
            <md-list style={{ '--md-list-container-color': 'transparent' }}>
              {ASSISTANT_ROLES.map((role, idx) => {
                const isSelected = (selectedRole || '').toLowerCase() === role.id.toLowerCase();
                return (
                  <React.Fragment key={role.id}>
                    {idx > 0 && <md-divider style={{ opacity: 0.05, margin: '4px 16px' }} />}
                    <md-list-item
                      type="button"
                      onClick={() => {
                        onRoleSelect(role.id);
                        onOpenChange(false);
                      }}
                      style={{
                        '--md-list-item-label-text-color': isSelected ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface)'
                      }}
                    >
                      <div slot="headline" className="flex items-center gap-2">
                        <span className="font-semibold text-[15px]">
                          {language === 'ru' ? role.titleRu : role.titleEn}
                        </span>
                      </div>
                      <div slot="supporting-text" className="flex flex-col gap-1 mt-1 pr-4">
                        <span className={`text-[12.5px] leading-tight ${isSelected ? 'text-[var(--md-sys-color-primary)]/80' : 'text-[var(--md-sys-color-on-surface-variant)]'}`}>
                          {language === 'ru' ? role.descRu : role.descEn}
                        </span>
                      </div>
                    </md-list-item>
                  </React.Fragment>
                );
              })}
            </md-list>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
