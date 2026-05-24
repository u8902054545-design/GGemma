import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'material-symbols';
import {registerSW} from 'virtual:pwa-register';
import { LanguageProvider } from './hooks/useLanguage';

registerSW({immediate: true});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
);
