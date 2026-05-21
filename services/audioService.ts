
import { GoogleGenAI, Modality } from "@google/genai";
import { Song } from "../types";

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

let activeSource: AudioBufferSourceNode | HTMLAudioElement | null = null;
let audioContext: AudioContext | null = null;

export const playVibePreview = async (song: Song): Promise<void> => {
  stopPreview();

  // 1. Try playing direct MP3 clip if available
  if (song.previewUrl && song.previewUrl.startsWith('http')) {
    try {
      await new Promise((resolve, reject) => {
        const audio = new Audio();
        audio.src = song.previewUrl!;
        activeSource = audio;
        
        audio.onerror = () => {
          reject(new Error("Failed to load audio source"));
        };

        const onPlaySuccess = () => {
          const timer = setTimeout(() => {
            audio.pause();
            resolve(true);
          }, 10000);

          audio.onended = () => {
            clearTimeout(timer);
            resolve(true);
          };
        };

        audio.play().then(onPlaySuccess).catch(reject);
      });
      return; 
    } catch (e) {
      console.warn("Direct preview failed, using AI fallback...", e);
      stopPreview();
    }
  }

  // 2. Fallback to Gemini AI DJ Preview
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Say enthusiastically like a professional club DJ: "Checking the vibe for ${song.title} by ${song.artist}. A ${song.length} journey of ${song.genre} heat. It's moving at ${song.bpm} BPM in the key of ${song.key}. Essential for your mix."`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Puck' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("Audio generation failed");

  const audioBuffer = await decodeAudioData(
    decode(base64Audio),
    audioContext,
    24000,
    1,
  );

  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start();
  activeSource = source;

  return new Promise((resolve) => {
    source.onended = () => {
      if (activeSource === source) activeSource = null;
      resolve();
    };
  });
};

export const stopPreview = () => {
  if (activeSource) {
    if (activeSource instanceof HTMLAudioElement) {
      activeSource.pause();
      activeSource.src = ""; 
    } else {
      try {
        activeSource.stop();
      } catch (e) {}
    }
    activeSource = null;
  }
};
