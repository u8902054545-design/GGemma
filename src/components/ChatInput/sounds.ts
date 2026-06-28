/**
 * Synthesizes a futuristic, clean UI chime for opening the Gemma Live chat
 * using the Web Audio API.
 */
export const playLiveOpenSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    const now = ctx.currentTime;
    
    // We create a rich sound with two oscillators: a sine wave for the fundamental frequency
    // and a triangle wave to add warmth.
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc1.type = 'sine';
    osc2.type = 'triangle';
    
    // Ascending arpeggio chime (Gemma Live entrance)
    // E5 (659.25 Hz) -> G#5 (830.61 Hz) -> B5 (987.77 Hz) -> E6 (1318.51 Hz)
    const notes = [659.25, 830.61, 987.77, 1318.51];
    const delays = [0, 0.08, 0.16, 0.24];
    
    notes.forEach((freq, idx) => {
      osc1.frequency.setValueAtTime(freq, now + delays[idx]);
      osc2.frequency.setValueAtTime(freq, now + delays[idx]);
    });
    
    // Smooth volume envelope to prevent clicking
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    
    osc1.start(now);
    osc2.start(now);
    
    osc1.stop(now + 0.75);
    osc2.stop(now + 0.75);

    setTimeout(() => {
      try {
        ctx.close();
      } catch (e) {}
    }, 1000);
  } catch (e) {
    console.error('Failed to play Gemma Live open sound:', e);
  }
};

/**
 * Synthesizes a futuristic, clean UI chime for closing the Gemma Live chat.
 */
export const playLiveCloseSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc1.type = 'sine';
    osc2.type = 'triangle';
    
    // Descending chime (Gemma Live exit)
    // E6 (1318.51 Hz) -> B5 (987.77 Hz) -> G#5 (830.61 Hz) -> E5 (659.25 Hz)
    const notes = [1318.51, 987.77, 830.61, 659.25];
    const delays = [0, 0.08, 0.16, 0.24];
    
    notes.forEach((freq, idx) => {
      osc1.frequency.setValueAtTime(freq, now + delays[idx]);
      osc2.frequency.setValueAtTime(freq, now + delays[idx]);
    });
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    
    osc1.start(now);
    osc2.start(now);
    
    osc1.stop(now + 0.75);
    osc2.stop(now + 0.75);

    setTimeout(() => {
      try {
        ctx.close();
      } catch (e) {}
    }, 1000);
  } catch (e) {
    console.error('Failed to play Gemma Live close sound:', e);
  }
};
