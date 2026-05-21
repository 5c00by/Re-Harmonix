
export interface Song {
  title: string;
  artist: string;
  year: string;
  album: string;
  length: string; // e.g., "4:12"
  key: string;
  bpm: number;
  genre: string;
  artistImageUrl: string; // Primary image (used as fallback)
  albumImages: string[]; // Array of high-quality album covers or promotional photos
  artistBio: string; // Concise biography of the artist
  youtubeUrl: string;
  spotifyUrl?: string;
  beatportUrl?: string;
  soundcloudUrl?: string;
  appleMusicUrl?: string;
  previewUrl?: string; // Direct MP3 preview link if found
}

export interface SearchResult {
  sourceSong: Song | null;
  recommendations: Song[];
  error?: string;
}
