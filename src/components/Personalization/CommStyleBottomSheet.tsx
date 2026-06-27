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
    descRu: 'Ассистент будет общаться в стандартной манере без применения дополнительных правил стиля.',
    descEn: 'Disables style customization. The assistant will communicate in its default tone.',
    icon: ''
  },
  {
    id: 'analytical',
    titleRu: 'Аналитический',
    titleEn: 'Analytical',
    descRu: 'Детальный и логичный. Предоставляет подробную информацию, опирается на факты и логику, помогает глубоко разобраться в вопросе.',
    descEn: 'Detailed and logical. Provides detailed information, relies on facts and logic, helps to deeply understand the issue.',
    icon: 'analytics'
  },
  {
    id: 'concise',
    titleRu: 'Лаконичный',
    titleEn: 'Concise',
    descRu: 'Краткий и точный. Формулирует ответы максимально конкретно и по существу, экономя время пользователя и не отвлекая на лишние детали.',
    descEn: 'Brief and precise. Formulates answers as specifically and to the point as possible, saving user\'s time and not distracting with unnecessary details.',
    icon: 'short_text'
  },
  {
    id: 'friendly',
    titleRu: 'Доброжелательный',
    titleEn: 'Friendly',
    descRu: 'Открытый и располагающий. Общается в тёплой, поддерживающей манере, создавая комфортную атмосферу для диалога.',
    descEn: 'Open and welcoming. Communicates in a warm, supportive manner, creating a comfortable atmosphere for dialogue.',
    icon: 'sentiment_satisfied'
  },
  {
    id: 'creative',
    titleRu: 'Творческий',
    titleEn: 'Creative',
    descRu: 'Вдохновляющий и нестандартный. Помогает находить оригинальные идеи, предлагает необычные подходы к решению задач и развивает воображение.',
    descEn: 'Inspiring and unconventional. Helps to find original ideas, suggests unusual approaches to problem solving, and develops imagination.',
    icon: 'psychology'
  },
  {
    id: 'realistic',
    titleRu: 'Реалистичный',
    titleEn: 'Realistic',
    descRu: 'Объективный и критический. Помогает трезво оценить ситуацию, указывает на возможные риски и слабые места, избегая излишнего оптимизма.',
    descEn: 'Objective and critical. Helps to soberly assess the situation, points to possible risks and weaknesses, avoiding excessive optimism.',
    icon: 'balance'
  },
  {
    id: 'guiding',
    titleRu: 'Направляющий',
    titleEn: 'Guiding',
    descRu: 'Поучительный и мотивирующий. Помогает пользователю самостоятельно прийти к верному решению с помощью наводящих вопросов и полезных советов.',
    descEn: 'Instructive and motivating. Helps the user to independently come to the right decision with the help of leading questions and useful tips.',
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
  const { t } = useLanguage();

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
                        <span className="font-semibold text-[15px]">{style.titleRu}</span>
                        <span className="text-[12px] opacity-40">/ {style.titleEn}</span>
                      </div>
                      <div slot="supporting-text" className="flex flex-col gap-1 mt-1 pr-4">
                        <span className="text-[12.5px] leading-tight text-[var(--md-sys-color-on-surface-variant)]">{style.descRu}</span>
                        <span className="text-[11px] leading-tight text-[var(--md-sys-color-on-surface-variant)]/60 italic">{style.descEn}</span>
                      </div>
                      {style.icon ? (
                        <span slot="start" className={`material-symbols-outlined text-[20px] ${isSelected ? 'text-[var(--md-sys-color-primary)]' : 'text-[var(--md-sys-color-on-surface-variant)]'}`}>
                          {style.icon}
                        </span>
                      ) : (
                        <div slot="start" className="w-[20px] h-[20px] flex-shrink-0" />
                      )}
                      {isSelected && (
                        <span slot="end" className="material-symbols-outlined text-[var(--md-sys-color-primary)]">
                          check
                        </span>
                      )}
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
