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

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'md-list': any;
      'md-list-item': any;
      'md-divider': any;
    }
  }
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
        <Drawer.Content className="bg-[#1c1b1f] flex flex-col rounded-t-[28px] h-auto fixed bottom-0 left-0 right-0 z-[210] outline-none border-none max-w-lg mx-auto">
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[#49454f] my-4" />
          
          <div className="px-6 py-2">
            <h2 className="text-[#e6e1e5] text-xl font-medium mb-2">{t('model.selector.title')}</h2>
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
                    '--md-list-item-label-text-color': selectedModel.id === 'auto' ? '#a8c7fa' : '#e6e1e5'
                  }}
                >
                  <div slot="headline">{t('model.selector.auto.title')}</div>
                  <div slot="supporting-text">{t('model.selector.auto.desc')}</div>
                  <span slot="start" className="material-symbols-outlined text-[#938f99]">
                    magic_button
                  </span>
                  {selectedModel.id === 'auto' && (
                    <span slot="end" className="material-symbols-outlined text-[#a8c7fa]">
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
                    '--md-list-item-label-text-color': selectedModel.id === model.id ? '#a8c7fa' : '#e6e1e5'
                  }}
                >
                  <div slot="headline">{model.name}</div>
                  <span slot="start" className="material-symbols-outlined text-[#938f99]">
                    deployed_code
                  </span>
                  {selectedModel.id === model.id && (
                    <span slot="end" className="material-symbols-outlined text-[#a8c7fa]">
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
