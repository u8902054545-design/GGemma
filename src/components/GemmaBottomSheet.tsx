import React from 'react';
import { Drawer } from 'vaul';
import { SelectedModel } from '../hooks/chatTypes';
import { useLanguage } from '../hooks/useLanguage';
import '@material/web/list/list.js';
import '@material/web/list/list-item.js';

interface GemmaBottomSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedModel: SelectedModel;
  onModelSelect: (model: SelectedModel) => void;
  models: SelectedModel[];
}

export const GemmaBottomSheet: React.FC<GemmaBottomSheetProps> = ({
  isOpen,
  onOpenChange,
  selectedModel,
  onModelSelect,
  models
}) => {
  const { t } = useLanguage();

  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[200]" />
        <Drawer.Content className="bg-[var(--md-sys-color-surface)] flex flex-col rounded-t-[28px] h-auto fixed bottom-0 left-0 right-0 z-[210] outline-none border-none max-w-lg mx-auto">
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[var(--md-sys-color-outline)] my-4" />
          
          <div className="px-6 py-2">
            <h2 className="text-[var(--md-sys-color-on-surface)] text-xl font-medium mb-2">{t('model.selector.title')}</h2>
          </div>

          <div className="max-h-[70vh] overflow-y-auto pb-8">
            <md-list style={{ '--md-list-container-color': 'transparent' }}>
               <md-list-item
                  type="button"
                  onClick={() => {
                    onModelSelect({ id: 'auto', name: t('model.selector.auto.name') });
                    onOpenChange(false);
                  }}
                  style={{
                    '--md-list-item-label-text-color': selectedModel.id === 'auto' ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface)'
                  }}
                >
                  <div slot="headline">{t('model.selector.auto.title')}</div>
                  <div slot="supporting-text">{t('model.selector.auto.desc')}</div>
                  <span slot="start" className="material-symbols-outlined text-[var(--md-sys-color-on-surface-variant)]">
                    magic_button
                  </span>
                  {selectedModel.id === 'auto' && (
                    <span slot="end" className="material-symbols-outlined text-[var(--md-sys-color-primary)]">
                      check
                    </span>
                  )}
                </md-list-item>
              
              <md-divider style={{ margin: '8px 16px', opacity: 0.1 }} />

              {models.map((model) => (
                <md-list-item
                  key={model.id}
                  type="button"
                  onClick={() => {
                    onModelSelect(model);
                    onOpenChange(false);
                  }}
                  style={{
                    '--md-list-item-label-text-color': selectedModel.id === model.id ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface)'
                  }}
                >
                  <div slot="headline">{model.name}</div>
                  {selectedModel.id === model.id && (
                    <span slot="end" className="material-symbols-outlined text-[var(--md-sys-color-primary)]">
                      check
                    </span>
                  )}
                </md-list-item>
              ))}
            </md-list>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
