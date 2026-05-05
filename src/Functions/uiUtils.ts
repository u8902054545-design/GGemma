export const toggleState = (
  currentState: boolean, 
  setState: (value: boolean) => void
) => {
  setState(!currentState);
};

export const closeState = (
  setState: (value: boolean) => void
) => {
  setState(false);
};

export const handleImagePreview = (
  url: string | null,
  setFullscreenImage: (url: string | null) => void
) => {
  setFullscreenImage(url);
};
