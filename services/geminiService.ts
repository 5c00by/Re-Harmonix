
import { GoogleGenAI, Type } from "@google/genai";
import { Song, SearchResult } from "../types";

export const findCompatibleMusic = async (query: string): Promise<SearchResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are a professional musicologist and DJ master. 
    Task:
    1. Identify input song metadata including Title, Artist, Year, Album, and Duration (length).
    2. Find 6 compatible tracks (matching BPM, harmonic Key, and Genre vibe).
    3. For EVERY song, use Google Search to find:
       - albumImages: An array of 3-4 direct URLs to high-quality official album covers, alternative artwork, or professional press photos.
       - artistImageUrl: The primary high-quality official press photo.
       - artistBio: A concise 2-sentence biography of the artist focusing on their style and impact.
       - platformUrls: Spotify, Beatport, Soundcloud, Apple Music, and YouTube. 
         IMPORTANT: These MUST be links to the SPECIFIC SONG/TRACK, not just the album or artist page.
       - length: The duration of the song in MM:SS format.
       - previewUrl: A direct MP3 snippet link (MUST be a direct .mp3 or .m4a link, e.g. from iTunes/Apple Music CDN). 
    
    JSON Schema is strict. Ensure all URLs are valid and functional track links.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Find compatible music for: "${query}". Ensure you get 3-4 high-quality album/press images and a 2-sentence bio for each artist. Focus on finding direct track links for Spotify, Beatport, Soundcloud, Apple Music.`,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sourceSong: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                artist: { type: Type.STRING },
                year: { type: Type.STRING },
                album: { type: Type.STRING },
                length: { type: Type.STRING },
                key: { type: Type.STRING },
                bpm: { type: Type.NUMBER },
                genre: { type: Type.STRING },
                artistImageUrl: { type: Type.STRING },
                albumImages: { 
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                artistBio: { type: Type.STRING },
                youtubeUrl: { type: Type.STRING },
                spotifyUrl: { type: Type.STRING },
                beatportUrl: { type: Type.STRING },
                soundcloudUrl: { type: Type.STRING },
                appleMusicUrl: { type: Type.STRING },
                previewUrl: { type: Type.STRING },
              },
              required: ["title", "artist", "year", "album", "length", "key", "bpm", "genre", "artistImageUrl", "albumImages", "artistBio", "youtubeUrl"]
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  artist: { type: Type.STRING },
                  year: { type: Type.STRING },
                  album: { type: Type.STRING },
                  length: { type: Type.STRING },
                  key: { type: Type.STRING },
                  bpm: { type: Type.NUMBER },
                  genre: { type: Type.STRING },
                  artistImageUrl: { type: Type.STRING },
                  albumImages: { 
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  artistBio: { type: Type.STRING },
                  youtubeUrl: { type: Type.STRING },
                  spotifyUrl: { type: Type.STRING },
                  beatportUrl: { type: Type.STRING },
                  soundcloudUrl: { type: Type.STRING },
                  appleMusicUrl: { type: Type.STRING },
                  previewUrl: { type: Type.STRING },
                },
                required: ["title", "artist", "year", "album", "length", "key", "bpm", "genre", "artistImageUrl", "albumImages", "artistBio", "youtubeUrl"]
              }
            }
          },
          required: ["sourceSong", "recommendations"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from AI");
    
    return JSON.parse(resultText) as SearchResult;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      sourceSong: null,
      recommendations: [],
      error: "Could not fetch detailed track data. Please check your query or API quota."
    };
  }
};
