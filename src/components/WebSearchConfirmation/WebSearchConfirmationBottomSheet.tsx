import React from 'react';
import { Drawer } from 'vaul';
import { useLanguage } from '../../hooks/useLanguage';
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';

interface WebSearchConfirmationBottomSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onDecline: () => void;
}

export const WebSearchConfirmationBottomSheet: React.FC<WebSearchConfirmationBottomSheetProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  onDecline,
}) => {
  const { language } = useLanguage();

  const isRu = language === 'ru';

  const title = isRu
    ? 'В прошлом запросе вы использовали поиск в интернете. Нужно ли обновить или уточнить данные через интернет для этого запроса?'
    : 'In your previous request, you used the web search feature. Do you need to update or clarify the data via the internet for this request?';

  const warning = isRu
    ? 'Если вы нажмёте «Да», это автоматически включит «Поиск в интернете». Если вы откажетесь, запрос отправится без этой функции'
    : "Clicking 'Yes' will automatically enable Web Search. If you decline, your request will be sent without this feature.";

  const yesLabel = isRu ? 'Да, включить и отправить' : 'Yes, enable and send';
  const noLabel = isRu ? 'Нет, отправить' : 'No, send';

  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[200]" />
        <Drawer.Content className="bg-[var(--md-sys-color-surface)] flex flex-col rounded-t-[28px] h-auto fixed bottom-0 left-0 right-0 z-[210] outline-none border-none max-w-lg mx-auto">
          {/* Drag Handle */}
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[var(--md-sys-color-outline)] my-4" />
          
          <div className="px-6 pb-8 pt-2 flex flex-col items-center text-center">
            {/* Visual Icon Header */}
            <div className="w-14 h-14 rounded-full bg-[var(--md-sys-color-primary-container)] flex items-center justify-center text-[var(--md-sys-color-primary)] mb-4 shadow-sm">
              <span className="material-symbols-outlined text-[28px]">
                travel_explore
              </span>
            </div>

            {/* Question Title */}
            <h2 className="text-[var(--md-sys-color-on-surface)] text-lg font-medium leading-normal mb-4 px-2">
              {title}
            </h2>

            {/* Warning Text Block */}
            <div className="w-full bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)]/40 p-4 rounded-2xl flex items-start gap-3 text-left mb-6">
              <span className="material-symbols-outlined text-[var(--md-sys-color-primary)] text-[20px] shrink-0 mt-0.5">
                info
              </span>
              <p className="text-xs leading-normal text-[var(--md-sys-color-on-surface-variant)]">
                {warning}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 w-full">
              <md-filled-button
                onClick={onConfirm}
                className="w-full h-11 text-[14px] font-medium"
              >
                {yesLabel}
              </md-filled-button>
              
              <md-outlined-button
                onClick={onDecline}
                className="w-full h-11 text-[14px] font-medium"
              >
                {noLabel}
              </md-outlined-button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
