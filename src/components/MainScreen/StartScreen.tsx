import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { GemmaIcon } from '../GemmaIcon';
import { useLanguage } from '../../hooks/useLanguage';
import { getRandomGreeting } from './Greetings';

type StartScreenProps = {
  userName: string | null;
};

export const StartScreen: React.FC<StartScreenProps> = ({ userName }) => {
  const { language } = useLanguage();
  
  // Choose a random greeting only once on mount to avoid flashing on re-renders
  const greetingData = useMemo(() => 
    getRandomGreeting(userName, (language === 'ru' ? 'ru' : 'en')), 
    [userName, language]
  );

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-4">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 mb-6">
           <GemmaIcon className="w-full h-full" />
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight">
          <span className="text-gradient leading-tight block pb-2">
            {greetingData}
          </span>
        </h1>
      </div>
    </div>
  );
};
