import { SUPABASE_ENDPOINT, supabase } from '../../config';

const ttsAudioCache: Record<string, ArrayBuffer> = {};
let activeAudioContext: AudioContext | null = null;
let activeSourceNode: AudioBufferSourceNode | null = null;
let isPlayingTts = false;

/**
 * Stops any ongoing TTS playback (both local speech synthesis and remote PCM player).
 */
export const stopLiveTTS = () => {
  try {
    // 1. Cancel local Web Speech Synthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // 2. Stop PCM playback
    if (activeSourceNode) {
      try {
        activeSourceNode.stop();
      } catch (e) {}
      activeSourceNode = null;
    }

    if (activeAudioContext && activeAudioContext.state !== 'closed') {
      activeAudioContext.close();
      activeAudioContext = null;
    }

    isPlayingTts = false;
  } catch (e) {
    console.error('Error stopping Live TTS:', e);
  }
};

/**
 * Synthesizes text to speech and plays it back.
 * 
 * @param text The text message to speak.
 * @param voice The voice name (e.g., 'Chrome Web Speech', 'Zephyr', etc.).
 * @param onStart Callback fired when speech starts.
 * @param onEnd Callback fired when speech completes or fails.
 */
export const playLiveTTS = async (
  text: string,
  voice: string,
  onStart: () => void,
  onEnd: () => void
) => {
  stopLiveTTS();

  const trimmedText = text.trim();
  if (!trimmedText) {
    onEnd();
    return;
  }

  // CASE 1: Local Speech Synthesis (Chrome Web Speech)
  if (voice === 'Chrome Web Speech') {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(trimmedText);
      
      // Auto-configure Russian voice if available (Gemma's base language)
      const voicesList = window.speechSynthesis.getVoices();
      const russianVoice = voicesList.find(v => v.lang.includes('ru-RU')) || 
                           voicesList.find(v => v.lang.includes('en-US'));
      if (russianVoice) {
        utterance.voice = russianVoice;
      }

      utterance.onstart = () => {
        isPlayingTts = true;
        onStart();
      };

      utterance.onend = () => {
        isPlayingTts = false;
        onEnd();
      };

      utterance.onerror = (e) => {
        console.error('SpeechSynthesis error:', e);
        isPlayingTts = false;
        onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Local SpeechSynthesis fallback failure:', err);
      isPlayingTts = false;
      onEnd();
    }
    return;
  }

  // CASE 2: Remote AI Voice (PCM 24kHz)
  try {
    let audioBufferData = ttsAudioCache[trimmedText];

    if (!audioBufferData) {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const response = await fetch(SUPABASE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        },
        body: JSON.stringify({
          message: trimmedText,
          voice: voice,
          isAudioOnly: true
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS generation API error: ${response.status}`);
      }

      audioBufferData = await response.arrayBuffer();
      // Cache the response buffer
      ttsAudioCache[trimmedText] = audioBufferData;
    }

    // Playback PCM buffer
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    activeAudioContext = new AudioContextClass({ sampleRate: 24000 });
    
    const pcmData = new Int16Array(audioBufferData);
    const float32Data = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      float32Data[i] = pcmData[i] / 32768.0;
    }

    const audioBuffer = activeAudioContext.createBuffer(1, float32Data.length, 24000);
    audioBuffer.getChannelData(0).set(float32Data);

    const source = activeAudioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(activeAudioContext.destination);
    activeSourceNode = source;

    source.onended = () => {
      isPlayingTts = false;
      onEnd();
    };

    isPlayingTts = true;
    onStart();
    source.start(0);

  } catch (error) {
    console.error('Remote TTS failed, falling back to Chrome Web Speech:', error);
    // Fallback to local speech synthesis if network/API fails
    playLiveTTS(text, 'Chrome Web Speech', onStart, onEnd);
  }
};

/**
 * Checks if TTS is currently playing audio.
 */
export const isLiveTtsPlaying = () => {
  return isPlayingTts;
};
