import { useState, useEffect, useRef, useCallback } from 'react';
import { playLiveTTS, stopLiveTTS, initLiveAudioContext, closeLiveAudioContext } from './liveTTS';
import { Message } from '../../hooks/chatTypes';
import { SUPABASE_ENDPOINT, supabase } from '../../config';

interface UseGemmaLiveSpeechProps {
  messages: Message[];
  isTyping: boolean;
  handleSend: (text?: string, isSearch?: boolean, file?: File, codes?: any[]) => void;
}

export const useGemmaLiveSpeech = ({
  messages,
  isTyping,
  handleSend,
}: UseGemmaLiveSpeechProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [volume, setVolume] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const smoothedVolumeRef = useRef<number>(0);
  const isComponentActiveRef = useRef<boolean>(true);

  // VAD / Silence detection states
  const isUserSpeakingRef = useRef<boolean>(false);
  const silenceStartTimeRef = useRef<number | null>(null);

  const startListeningTimeoutRef = useRef<any>(null);

  const clearStartListeningTimeout = useCallback(() => {
    if (startListeningTimeoutRef.current !== null) {
      clearTimeout(startListeningTimeoutRef.current);
      startListeningTimeoutRef.current = null;
    }
  }, []);

  const cleanupAudio = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  // Keep latest refs of all props and state variables to make callbacks stable
  const handleSendRef = useRef(handleSend);
  handleSendRef.current = handleSend;

  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;

  const isSpeakingRef = useRef(isSpeaking);
  isSpeakingRef.current = isSpeaking;

  const isProcessingRef = useRef(isProcessing);
  isProcessingRef.current = isProcessing;

  const isTypingRef = useRef(isTyping);
  isTypingRef.current = isTyping;

  // Handle uploading audio file to Groq Whisper STT endpoint
  const handleAudioUpload = useCallback(async (audioBlob: Blob) => {
    if (!isComponentActiveRef.current) return;
    
    setIsProcessing(true);
    setIsListening(false);
    console.log('[Gemma Live Debug] Uploading audio blob for Whisper STT. Size:', audioBlob.size);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      const formData = new FormData();
      // Whisper accepts webm/ogg format recorded by browsers
      formData.append('file', audioBlob, 'audio.webm');
      
      const response = await fetch(SUPABASE_ENDPOINT, {
        method: 'POST',
        headers: {
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Transcription request failed with status: ${response.status}`);
      }

      const result = await response.json();
      console.log('[Gemma Live Debug] Whisper STT Transcription:', result);
      
      const transcribedText = result.text || '';
      if (transcribedText.trim() && isComponentActiveRef.current) {
        console.log('[Gemma Live Debug] STT complete. Sending text to Gemma:', transcribedText);
        handleSendRef.current(transcribedText);
        // Reset processing state since handleSend will trigger isTyping=true
        setIsProcessing(false);
      } else {
        console.log('[Gemma Live Debug] STT completed but transcribed text was empty. Resuming listening.');
        setIsProcessing(false);
        if (!isMutedRef.current) {
          startListening();
        }
      }
    } catch (err) {
      console.error('[Gemma Live Debug] Groq Whisper STT failed:', err);
      setIsProcessing(false);
      if (!isMutedRef.current) {
        startListening();
      }
    }
  }, []); // Empty dependencies because we use handleSendRef!

  // Helper to start recording user speech
  const startListening = useCallback(async () => {
    if (!isComponentActiveRef.current || isMutedRef.current || isSpeakingRef.current || isTypingRef.current || isProcessingRef.current) {
      console.log('[Gemma Live Debug] startListening aborted. Muted:', isMutedRef.current, 'Speaking:', isSpeakingRef.current, 'Typing:', isTypingRef.current, 'Processing:', isProcessingRef.current);
      return;
    }

    try {
      // Abort any existing recorder instance
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {}
      }

      // Initialize media stream if not already active
      if (!streamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!isComponentActiveRef.current) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;
      }

      // Set up visualizer AudioContext
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass && !audioContextRef.current) {
        const audioContext = new AudioContextClass();
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(streamRef.current);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        const updateVolume = () => {
          if (!analyserRef.current || !isComponentActiveRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);

          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          const normVolume = Math.min(average / 100, 1);

          smoothedVolumeRef.current = smoothedVolumeRef.current * 0.7 + normVolume * 0.3;
          setVolume(smoothedVolumeRef.current);

          // Voice Activity Detection (VAD) using volume thresholds
          const currentVol = smoothedVolumeRef.current;
          
          if (currentVol > 0.05) {
            // Speech detected
            if (!isUserSpeakingRef.current) {
              console.log('[Gemma Live Debug] VAD: User started speaking');
              isUserSpeakingRef.current = true;
            }
            silenceStartTimeRef.current = null;
          } else if (isUserSpeakingRef.current) {
            // User was speaking, now quiet - start silence countdown
            if (silenceStartTimeRef.current === null) {
              silenceStartTimeRef.current = Date.now();
            } else if (Date.now() - silenceStartTimeRef.current > 1500) {
              // 1.5 seconds of silence: stop recording and upload!
              console.log('[Gemma Live Debug] VAD: Silence detected for 1.5s. Stopping recording.');
              isUserSpeakingRef.current = false;
              silenceStartTimeRef.current = null;
              
              stopListening();
            }
          }

          animationFrameRef.current = requestAnimationFrame(updateVolume);
        };

        updateVolume();
      }

      // Initialize MediaRecorder
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        console.log('[Gemma Live Debug] MediaRecorder stopped.');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Reset speaking state
        isUserSpeakingRef.current = false;
        silenceStartTimeRef.current = null;

        // Verify if stopped because of VAD/silence (not muted or speaking/typing)
        if (isComponentActiveRef.current && !isMutedRef.current && !isSpeakingRef.current && !isTypingRef.current && audioBlob.size > 1000) {
          handleAudioUpload(audioBlob);
        }
      };

      console.log('[Gemma Live Debug] Starting MediaRecorder...');
      recorder.start(100); // 100ms timeslices so dataavailable triggers continuously
      setIsListening(true);

    } catch (err) {
      console.error('[Gemma Live Debug] startListening setup failed:', err);
      cleanupAudio();
      setIsListening(false);
    }
  }, [handleAudioUpload, cleanupAudio]);

  // Helper to stop recording
  const stopListening = useCallback(() => {
    console.log('[Gemma Live Debug] stopListening called');
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  }, []);



  // Monitor isTyping changes.
  const prevIsTypingRef = useRef(isTyping);
  useEffect(() => {
    console.log('[Gemma Live Debug] isTyping changed:', prevIsTypingRef.current, '->', isTyping);
    
    // When typing starts (AI starts generating response), stop listening immediately
    if (!prevIsTypingRef.current && isTyping) {
      console.log('[Gemma Live Debug] AI started typing/generating. Stopping listening.');
      stopListening();
    }
    
    // When typing ends (AI finishes response), speak it.
    if (prevIsTypingRef.current && !isTyping && isComponentActiveRef.current) {
      // Find the last assistant message
      const lastAiMsg = [...messagesRef.current].reverse().find(msg => msg.role === 'ai');
      console.log('[Gemma Live Debug] AI generation complete. Last AI message:', lastAiMsg);
      
      if (lastAiMsg && lastAiMsg.content) {
        const selectedVoice = localStorage.getItem('selected_voice') || 'Zephyr';
        
        setIsSpeaking(true);
        stopListening();

        console.log('[Gemma Live Debug] Playing TTS for:', lastAiMsg.content, 'with voice:', selectedVoice);
        playLiveTTS(
          lastAiMsg.content,
          selectedVoice,
          () => {
            console.log('[Gemma Live Debug] TTS started playing');
          },
          () => {
            console.log('[Gemma Live Debug] TTS finished playing');
            if (isComponentActiveRef.current) {
              setIsSpeaking(false);
              isSpeakingRef.current = false; // Manually clear speaking ref block
              if (!isMutedRef.current) {
                console.log('[Gemma Live Debug] Resuming user speech listening');
                startListening();
              }
            }
          }
        );
      } else {
        console.log('[Gemma Live Debug] No AI message found or content empty. Resuming listening.');
        if (!isMutedRef.current) {
          startListening();
        }
      }
    }
    prevIsTypingRef.current = isTyping;
  }, [isTyping, startListening, stopListening]);

  // Manual Mute/Pause Toggle (Left Button)
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const nextMuted = !prev;
      console.log('[Gemma Live Debug] Manual mute toggled to:', nextMuted);
      if (nextMuted) {
        clearStartListeningTimeout();
        stopListening();
        stopLiveTTS();
        cleanupAudio();
        closeLiveAudioContext();
        setIsSpeaking(false);
        setIsProcessing(false);
      } else {
        initLiveAudioContext();
        clearStartListeningTimeout();
        startListeningTimeoutRef.current = setTimeout(() => {
          startListening();
        }, 100);
      }
      return nextMuted;
    });
  }, [startListening, stopListening, cleanupAudio, clearStartListeningTimeout]);

  // Handle entering Gemma Live
  const startLiveConversation = useCallback(() => {
    console.log('[Gemma Live Debug] Entering Gemma Live mode');
    isComponentActiveRef.current = true;
    setIsMuted(false);
    setIsSpeaking(false);
    setIsProcessing(false);
    
    clearStartListeningTimeout();
    startListeningTimeoutRef.current = setTimeout(() => {
      startListening();
    }, 200);
  }, [startListening, clearStartListeningTimeout]);

  // Handle exiting Gemma Live
  const stopLiveConversation = useCallback(() => {
    console.log('[Gemma Live Debug] Exiting Gemma Live mode');
    isComponentActiveRef.current = false;
    clearStartListeningTimeout();
    stopListening();
    stopLiveTTS();
    cleanupAudio();
    closeLiveAudioContext();
    setIsSpeaking(false);
    setIsProcessing(false);
  }, [stopListening, cleanupAudio, clearStartListeningTimeout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('[Gemma Live Debug] Hook unmounted');
      isComponentActiveRef.current = false;
      clearStartListeningTimeout();
      stopListening();
      stopLiveTTS();
      cleanupAudio();
      closeLiveAudioContext();
    };
  }, [stopListening, cleanupAudio, clearStartListeningTimeout]);

  return {
    isListening,
    isMuted,
    isSpeaking,
    isProcessing,
    volume,
    toggleMute,
    startLiveConversation,
    stopLiveConversation,
  };
};
