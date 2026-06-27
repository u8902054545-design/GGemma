import React from 'react';
import { Drawer } from 'vaul';
import { useLanguage } from '../../hooks/useLanguage';
import '@material/web/list/list.js';
import '@material/web/list/list-item.js';
import '@material/web/divider/divider.js';

interface StyleItem {
  id: string;
  titleRu: string;
  titleEn: string;
  descRu: string;
  descEn: string;
  icon: string;
}

export const COMMUNICATION_STYLES: StyleItem[] = [
  {
    id: '',
    titleRu: 'Не используется',
    titleEn: 'Not used',
    descRu: 'Буду общаться в стандартной манере без применения дополнительных правил стиля.',
    descEn: 'I will communicate in my default tone without any additional style rules.',
    icon: ''
  },
  {
    id: 'analytical',
    titleRu: 'Аналитический',
    titleEn: 'Analytical',
    descRu: 'Отвечаю детально и логично. Предоставляю подробную информацию, опираюсь на факты и логику, помогаю глубоко разобраться в вопросе.',
    descEn: 'I respond in a detailed and logical manner. I provide detailed information, rely on facts and logic, and help you deeply understand the issue.',
    icon: 'analytics'
  },
  {
    id: 'concise',
    titleRu: 'Лаконичный',
    titleEn: 'Concise',
    descRu: 'Отвечаю кратко и точно. Формулирую ответы максимально конкретно и по существу, экономя ваше время и не отвлекая на лишние детали.',
    descEn: 'I respond briefly and precisely. I formulate answers as specifically and to the point as possible, saving your time and avoiding unnecessary details.',
    icon: 'short_text'
  },
  {
    id: 'friendly',
    titleRu: 'Доброжелательный',
    titleEn: 'Friendly',
    descRu: 'Общаюсь открыто и доброжелательно. Пишу в тёплой, поддерживающей манере, создавая комфортную атмосферу для диалога.',
    descEn: 'I communicate openly and warmly. I write in a supportive manner, creating a comfortable atmosphere for our dialogue.',
    icon: 'sentiment_satisfied'
  },
  {
    id: 'creative',
    titleRu: 'Творческий',
    titleEn: 'Creative',
    descRu: 'Мыслю нестандартно и творчески. Помогаю находить оригинальные идеи, предлагаю необычные подходы к задачам и развиваю воображение.',
    descEn: 'I think creatively and unconventionally. I help find original ideas, suggest unusual approaches to tasks, and spark your imagination.',
    icon: 'psychology'
  },
  {
    id: 'realistic',
    titleRu: 'Реалистичный',
    titleEn: 'Realistic',
    descRu: 'Смотрю на вещи объективно и критически. Помогаю трезво оценить ситуацию, указываю на возможные риски и слабые места, избегая излишнего оптимизма.',
    descEn: 'I look at things objectively and critically. I help soberly assess the situation, point out potential risks and weaknesses, and avoid excessive optimism.',
    icon: 'balance'
  },
  {
    id: 'guiding',
    titleRu: 'Направляющий',
    titleEn: 'Guiding',
    descRu: 'Направляю и мотивирую. Помогаю вам самостоятельно прийти к решению с помощью наводящих вопросов и полезных советов.',
    descEn: 'I guide and motivate you. I help you independently arrive at the correct solution using leading questions and helpful tips.',
    icon: 'explore'
  }
];

interface CommStyleBottomSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStyle: string;
  onStyleSelect: (styleId: string) => void;
}

export const CommStyleBottomSheet: React.FC<CommStyleBottomSheetProps> = ({
  isOpen,
  onOpenChange,
  selectedStyle,
  onStyleSelect
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
              {t('personalization.behavior.comm_style.title')}
            </h2>
            <p className="text-[var(--md-sys-color-on-surface-variant)] text-xs">
              {t('personalization.behavior.comm_style.desc')}
            </p>
          </div>

          <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden pb-8 mt-2">
            <md-list style={{ '--md-list-container-color': 'transparent' }}>
              {COMMUNICATION_STYLES.map((style, idx) => {
                const isSelected = (selectedStyle || '').toLowerCase() === style.id;
                return (
                  <React.Fragment key={style.id}>
                    {idx > 0 && <md-divider style={{ opacity: 0.05, margin: '4px 16px' }} />}
                    <md-list-item
                      type="button"
                      onClick={() => {
                        onStyleSelect(style.id);
                        onOpenChange(false);
                      }}
                      style={{
                        '--md-list-item-label-text-color': isSelected ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface)'
                      }}
                    >
                      <div slot="headline" className="flex items-center gap-2">
                        <span className="font-semibold text-[15px]">
                          {language === 'ru' ? style.titleRu : style.titleEn}
                        </span>
                      </div>
                      <div slot="supporting-text" className="flex flex-col gap-1 mt-1 pr-4">
                        <span className={`text-[12.5px] leading-tight ${isSelected ? 'text-[var(--md-sys-color-primary)]/80' : 'text-[var(--md-sys-color-on-surface-variant)]'}`}>
                          {language === 'ru' ? style.descRu : style.descEn}
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
