import { type CSSProperties } from 'react';

export const keyboardDialogTransition: CSSProperties = {
  transition: 'top 0.3s cubic-bezier(0.2, 0, 0, 1), translate 0.3s cubic-bezier(0.2, 0, 0, 1)',
};

export function getKeyboardDialogStyle(
  keyboardHeight: number,
  dialogHeight: number = 200,
): CSSProperties {
  if (keyboardHeight <= 0) {
    return {};
  }

  const viewportHeight = window.innerHeight;
  const available = viewportHeight - keyboardHeight;
  const targetY = Math.max(20, (available - dialogHeight) / 2);

  return {
    top: `${targetY}px`,
    translate: '-50% 0',
  };
}
