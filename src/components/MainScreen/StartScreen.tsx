import React, { useMemo } from 'react';
import { GemmaIcon } from '../IconsApp/GemmaIcon';
import { GeminiIcon } from '../IconsApp/GeminiIcon';
import { getRandomGreeting } from './Greetings';
import { SelectedModel } from '../../hooks/chatTypes';
import { useAuth } from '../../hooks/useAuth';

type StartScreenProps = {
  userName: string | null;
  selectedModel: SelectedModel;
};

export const StartScreen: React.FC<StartScreenProps> = ({ userName, selectedModel }) => {
  const { user } = useAuth();

  const effectiveName = useMemo(() => {
    if (userName && userName.trim().length > 0) {
      return userName;
    }
    const accountName = user?.user_metadata?.full_name || user?.user_metadata?.name;
    return accountName || null;
  }, [userName, user]);

  const greetingData = useMemo(() => 
    getRandomGreeting(effectiveName), 
    [effectiveName]
  );

  const isGemini = selectedModel.id.startsWith('google/gemini');

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-4">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 mb-6">
          {isGemini ? (
            <GeminiIcon className="w-full h-full" />
          ) : (
            <GemmaIcon className="w-full h-full" />
          )}
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
