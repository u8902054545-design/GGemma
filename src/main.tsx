import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'material-symbols';
import {registerSW} from 'virtual:pwa-register';
import { LanguageProvider } from './hooks/useLanguage';
import { ThemeProvider } from './hooks/useTheme';
import { AuthProvider } from './hooks/useAuth';
import { ChatHistoryProvider } from './hooks/useChatHistory';

registerSW({immediate: true});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ChatHistoryProvider>
        <ThemeProvider>
          <LanguageProvider>
            <App />
          </LanguageProvider>
        </ThemeProvider>
      </ChatHistoryProvider>
    </AuthProvider>
  </StrictMode>,
);
