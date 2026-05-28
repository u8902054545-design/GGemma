import React from 'react';
import { Drawer } from 'vaul';
import { GemmaIcon } from '../IconsApp/GemmaIcon';
import { useLanguage } from '../../hooks/useLanguage';

interface GenerationDetailsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  modelName?: string;
}

export const GenerationDetails: React.FC<GenerationDetailsProps> = ({
  isOpen,
  onOpenChange,
  modelName
}) => {
  const { t } = useLanguage();

  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[200]" />
        <Drawer.Content className="bg-[var(--md-sys-color-surface)] flex flex-col rounded-t-[28px] h-auto fixed bottom-0 left-0 right-0 z-[210] outline-none border-none max-w-lg mx-auto">
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[var(--md-sys-color-outline)] my-4" />
          
          <div className="px-6 pb-2">
            <h2 className="text-[var(--md-sys-color-on-surface)] text-center text-lg font-medium">
              {t('message.generation_details.title')}
            </h2>
          </div>

          <div className="px-6 py-6 flex items-center gap-4">
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
              <GemmaIcon className="w-10 h-10" />
            </div>
            
            <div className="flex-1">
              <p className="text-[var(--md-sys-color-on-surface-variant)] text-sm leading-snug">
                {t('message.generation_details.description').replace('{model}', modelName || 'Gemma')}
              </p>
            </div>
          </div>
          <div className="pb-8" />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
