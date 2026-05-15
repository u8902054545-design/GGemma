import React, { useState, useRef } from 'react';
import { Drawer } from 'vaul';

type ModelSelectorProps = {
  selectedModel: any;
  setSelectedModel: (model: any) => void;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (open: boolean) => void;
  models: string[];
};

export const MODEL_DATA: Record<string, { title: string, chip: string, desc: string }> = {
  'auto': { title: 'Automatic', chip: 'Auto', desc: 'Let the system choose the best model' },
  'Gemma 3 1B': { title: 'Gemma 3: Lite', chip: 'V3: Lite', desc: 'Ultra-fast for simple questions' },
  'Gemma 3 4B': { title: 'Gemma 3: Basic', chip: 'V3: Basic', desc: 'Perfect balance for daily tasks' },
  'Gemma 3 12B': { title: 'Gemma 3: Pro', chip: 'V3: Pro', desc: 'Smart reasoning and deep chat' },
  'Gemma 3 27B': { title: 'Gemma 3: Ultra', chip: 'V3: Ultra', desc: 'Maximum intelligence for complex work' },
  'Gemma 3n E2B': { title: 'Gemma 3n: Flash', chip: 'V3n: Flash', desc: 'Super efficient edge intelligence' },
  'Gemma 3n E4B': { title: 'Gemma 3n: Turbo', chip: 'V3n: Turbo', desc: 'High-speed advanced processing' },
  'Gemma 4 26B A4B IT': { title: 'Gemma 4: Next', chip: 'V4: Next', desc: 'Experimental futuristic architecture' },
  'Gemma 4 31B IT': { title: 'Gemma 4: Flagship', chip: 'V4: Elite', desc: 'The most powerful elite model' },
};

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  setSelectedModel,
  isDropdownOpen,
  setIsDropdownOpen,
  models,
}) => {
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const timerRef = useRef<any>(null);

  const isAutoGemma = selectedModel === 'auto' || selectedModel?.id === 'auto';
  
  const selectedModelId = typeof selectedModel === 'string' ? selectedModel : selectedModel?.id;

  const handlePointerDown = (model: string) => {
    timerRef.current = setTimeout(() => {
      setActiveHint(model);
    }, 450);
  };

  const handlePointerUp = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActiveHint(null);
  };

  const handleAutoToggle = () => {
    if (!isAutoGemma) {
      setSelectedModel('auto');
    } else {
      const fallbackModel = models.find(m => m.includes('4B')) || models[0] || 'Gemma 3 4B';
      setSelectedModel(fallbackModel);
    }
  };

  const filteredModels = isAutoGemma
    ? models.filter(m => !m.toLowerCase().includes('gemma'))
    : models;

  return (
    <Drawer.Root open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <Drawer.Trigger asChild>
        <button className="flex items-center px-3 py-1 rounded-full bg-[#1a1a1a] border border-[#333] hover:bg-[#252525] transition-transform active:scale-95">
          <span className="text-[11px] font-medium text-[#e2e2e2] tracking-tight">
            {MODEL_DATA[selectedModelId]?.chip || selectedModelId}
          </span>
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/80 z-[60]" />
        <Drawer.Content className="bg-[#0b0b0b] flex flex-col rounded-t-[28px] fixed bottom-0 left-0 right-0 z-[70] outline-none max-w-2xl mx-auto border-t border-[#333]">
          <div className="p-4 bg-[#0b0b0b] rounded-t-[28px] flex-1">
            <div className="mx-auto w-10 h-1 rounded-full bg-[#333] mb-6" />
            <div className="max-h-[75vh] overflow-y-auto space-y-1 px-2 pb-10">

              <div
                onClick={handleAutoToggle}
                className="w-full text-left p-4 rounded-2xl flex items-center justify-between transition-colors mb-2 bg-[#1a1a1a] hover:bg-[#252525] cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="text-[15px] font-medium text-[#e2e2e2]">
                    Automatic selection
                  </span>
                  <span className="text-xs text-[#808080] mt-0.5">
                    Let the system choose the best model
                  </span>
                </div>
                <div className={`w-12 h-7 rounded-full flex items-center p-1 transition-colors duration-300 ${isAutoGemma ? 'bg-[#0842a0]' : 'bg-[#444746]'}`}>
                  <div
                    className={`w-5 h-5 rounded-full shadow-md transition-transform duration-300 ${isAutoGemma ? 'bg-white translate-x-5' : 'bg-[#c4c7c5] translate-x-0'}`}
                  />
                </div>
              </div>

              {filteredModels.length > 0 ? (
                filteredModels.map((model) => (
                  <div key={model} className="relative touch-none">
                    <button
                      onPointerDown={() => handlePointerDown(model)}
                      onPointerUp={handlePointerUp}
                      onPointerLeave={handlePointerUp}
                      onClick={() => !activeHint && (setSelectedModel(model), setIsDropdownOpen(false))}
                      className={`w-full text-left p-4 rounded-2xl flex flex-col transition-colors ${selectedModelId === model ? "bg-[#1a1a1a]" : "hover:bg-[#161616]"}`}
                    >
                      <span className={`text-[15px] font-medium ${selectedModelId === model ? "text-[#8ab4f8]" : "text-[#e2e2e2]"}`}>
                        {MODEL_DATA[model]?.title || model}
                      </span>
                      <span className="text-xs text-[#808080] mt-0.5">
                        {MODEL_DATA[model]?.desc}
                      </span>
                    </button>
                    {activeHint === model && (
                      <div className="absolute inset-0 bg-[#8ab4f8] rounded-2xl flex items-center justify-center z-10">
                        <span className="text-[#000] text-[11px] font-bold font-mono tracking-widest uppercase">
                          {model}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center">
                  <span className="text-xs text-[#808080]">No models available</span>
                </div>
              )}
              
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
