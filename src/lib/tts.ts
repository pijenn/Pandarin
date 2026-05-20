

const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '';

// ElevenLabs voice ID - use a voice that supports Mandarin
// Recommended: "Aria" (supports multi-language) or your custom voice ID
const VOICE_ID = process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || 'pqHfZKP75CvOlQylNhV4'; // "Bill" multi-lingual

interface TTSOptions {
  text: string;
  voiceId?: string;
  modelId?: string;
}

export async function speakWithElevenLabs({ text, voiceId, modelId }: TTSOptions): Promise<void> {
  if (!ELEVENLABS_API_KEY) {
    console.warn('ElevenLabs API key not set. Using Web Speech API fallback.');
    return speakWithWebSpeech(text);
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId || VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: modelId || 'eleven_turbo_v2_5', // supports 32 languages including Mandarin
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.85,
            style: 0.2,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs TTS error:', errorText);
      return speakWithWebSpeech(text);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    await new Promise<void>((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        reject(new Error('Audio playback failed'));
      };
      audio.play().catch(reject);
    });
  } catch (error) {
    console.error('TTS failed, falling back to Web Speech:', error);
    return speakWithWebSpeech(text);
  }
}

export function speakWithWebSpeech(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Web Speech API not supported');
      resolve();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.85; // slightly slower for learners
    utterance.pitch = 1.1;
    utterance.volume = 1;

    // Try to find a Chinese voice
    const voices = window.speechSynthesis.getVoices();
    const chineseVoice = voices.find(
      (v) => v.lang.startsWith('zh') || v.name.toLowerCase().includes('chinese')
    );
    if (chineseVoice) {
      utterance.voice = chineseVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
}

// Main export - tries ElevenLabs first, falls back to Web Speech
export async function speakMandarin(text: string): Promise<void> {
  return speakWithElevenLabs({ text });
}
