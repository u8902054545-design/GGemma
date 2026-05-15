import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { pageVariants } from '../motion/transitions';

type ModelSelectorPageProps = {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  onClose: () => void;
};

export const ModelSelectorPage: React.FC<ModelSelectorPageProps> = ({
  selectedModel,
  setSelectedModel,
  onClose
}) => {
  const [activeCategory, setActiveCategory] = useState('Gemma');

  const categories = ['Gemma', 'Gemini', 'Images', 'Video', 'Audio'];
  
  const modelsData: Record<string, { id: string, desc: string }[]> = {
    Gemma: [
      { id: 'Gemma 4 31B', desc: 'The absolute pinnacle of open models from Google.' },
      { id: 'Gemma 4 26B A4B', desc: 'Next-generation architecture for unparalleled efficiency.' },
      { id: 'Gemma 3 27B', desc: 'Powerful and highly capable model for complex reasoning.' },
      { id: 'Gemma 3 12B', desc: 'The perfect balance of high performance and incredible speed.' },
      { id: 'Gemma 3 4B', desc: 'Lightning-fast and lightweight model for everyday tasks.' },
      { id: 'Gemma 3n E4B', desc: 'Optimized neural core for ultra-fast edge computing.' },
      { id: 'Gemma 2 27B', desc: 'The classic and battle-tested heavyweight model.' }
    ],
    Gemini: [],
    Images: [],
    Video: [],
    Audio: []
  };

  const createRipple = (e: React.MouseEvent<HTMLElement>) => {
    const button = e.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    
    const rect = button.getBoundingClientRect();
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.classList.add("md3-ripple", "animate-ripple");
    
    const existingRipples = button.getElementsByClassName("md3-ripple");
    for(let i = 0; i < existingRipples.length; i++) {
        existingRipples[i].remove();
    }
    
    button.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  };

  return (
    <>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      <div className="flex flex-col h-full w-full bg-[#000000] select-none">
        <header className="px-6 py-6 flex flex-col items-start shrink-0 max-w-5xl w-full mx-auto">
          <button 
            onClick={onClose}
            className="mb-6 cursor-pointer ripple-container p-1 rounded-full -ml-1 hover:bg-[#1a1a1a] transition-colors border-none outline-none bg-transparent"
          >
            <span className="material-symbols-outlined text-[var(--md-sys-color-on-background)] text-2xl font-bold">
              arrow_back_ios_new
            </span>
          </button>

          <div className="flex items-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--md-sys-color-on-background)]">
              Model selection
            </h1>
          </div>

          <div className="flex gap-2 overflow-x-auto w-full pb-2 hide-scrollbar">
            {categories.map((category) => (
              <button
                key={category}
                onClick={(e) => {
                  createRipple(e);
                  setActiveCategory(category);
                }}
                className={`ripple-container shrink-0 relative px-5 py-2 rounded-full text-[15px] font-medium transition-colors duration-300 whitespace-nowrap ${
                  activeCategory === category 
                    ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]' 
                    : 'text-[var(--md-sys-color-on-background)] hover:bg-[rgba(255,255,255,0.05)]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 pb-12 flex flex-col hide-scrollbar">
          <div className="max-w-5xl w-full mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex flex-col gap-3"
              >
                <h2 className="text-[17px] font-semibold mb-2 mt-1 text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-[var(--md-sys-color-primary)]">
                    {activeCategory === 'Gemma' || activeCategory === 'Gemini' ? 'neurology' : 
                     activeCategory === 'Images' ? 'image' : 
                     activeCategory === 'Video' ? 'movie' : 'audio_file'}
                  </span>
                  {activeCategory} Models
                </h2>

                {modelsData[activeCategory]?.length > 0 ? (
                  modelsData[activeCategory].map((item) => (
                    <div
                      key={item.id}
                      onClick={(e) => {
                        createRipple(e);
                        setSelectedModel(item.id);
                      }}
                      className={`ripple-container group relative p-5 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col gap-3 ${
                        selectedModel === item.id 
                          ? 'border border-[var(--md-sys-color-primary)] bg-transparent' 
                          : 'border border-transparent bg-[var(--md-sys-color-surface-container-high)] hover:bg-[var(--md-sys-color-surface-container-highest)]'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${
                           selectedModel === item.id ? 'bg-[rgba(168,199,250,0.1)] text-[var(--md-sys-color-primary)]' : 'bg-[#1a1c1e] text-[var(--md-sys-color-on-surface-variant)]'
                        }`}>
                          <span className="material-symbols-outlined text-[22px]">
                            deployed_code
                          </span>
                        </div>
                        
                        {selectedModel === item.id && (
                          <span className="material-symbols-outlined text-[var(--md-sys-color-primary)]">
                            check_circle
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-1">
                        <h3 className="text-[17px] font-semibold text-[var(--md-sys-color-on-surface)] mb-1">
                          {item.id}
                        </h3>
                        <p className="text-[14px] text-[var(--md-sys-color-on-surface-variant)] leading-snug">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="w-full flex flex-col items-center justify-center py-20 px-4 mt-4 rounded-3xl border border-dashed border-[var(--md-sys-color-outline-variant)] bg-[rgba(40,42,45,0.3)]">
                    <div className="w-16 h-16 mb-4 rounded-full bg-[var(--md-sys-color-surface-container-highest)] flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl text-[var(--md-sys-color-on-surface-variant)] opacity-80">
                        smart_toy
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--md-sys-color-on-surface)] mb-2 text-center">
                      No models available yet
                    </h3>
                    <p className="text-[14px] text-[var(--md-sys-color-on-surface-variant)] text-center max-w-sm leading-relaxed">
                      We are actively training new models. Check back later!
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </>
  );
};
