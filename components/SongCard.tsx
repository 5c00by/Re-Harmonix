
import React, { useState, useMemo } from 'react';
import { Song } from '../types';
import { playVibePreview, stopPreview } from '../services/audioService';

interface SongCardProps {
  song: Song;
  isSource?: boolean;
  onAddToQueue?: (song: Song) => void;
  isInQueue?: boolean;
}

const SongCard: React.FC<SongCardProps> = ({ song, isSource = false, onAddToQueue, isInQueue = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // High-quality fallback artist image
  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&h=800&fit=crop';

  const images = useMemo(() => {
    const list = [...(song.albumImages || [])];
    if (list.length === 0 && song.artistImageUrl) {
      list.push(song.artistImageUrl);
    }
    return list.length > 0 ? list : [FALLBACK_IMAGE];
  }, [song.albumImages, song.artistImageUrl]);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handlePreview = async () => {
    if (isPlaying) {
      stopPreview();
      setIsPlaying(false);
      return;
    }

    try {
      setIsGenerating(true);
      await playVibePreview(song);
      setIsPlaying(true);
      setIsGenerating(false);
      
      const timer = setTimeout(() => setIsPlaying(false), 11000);
      return () => clearTimeout(timer);
    } catch (err) {
      console.error("Preview execution error:", err);
      setIsGenerating(false);
      setIsPlaying(false);
    }
  };

  const PlatformLink = ({ url, icon, color, title }: { url?: string, icon: string, color: string, title: string }) => {
    if (!url || url.trim() === "" || url === "null") return null;
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        title={title}
        className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${color} hover:scale-110 active:scale-95 border border-white/5 hover:border-white/20`}
      >
        <i className={icon}></i>
      </a>
    );
  };

  return (
    <div className={`group relative rounded-[2.5rem] transition-all duration-500 transform hover:-translate-y-2 ${
      isSource 
        ? 'glass neon-glow border-purple-500/50 bg-purple-900/10' 
        : 'glass border-white/10 hover:border-purple-500/30'
    }`}>
      {/* 1:1 Aspect Ratio Carousel Section */}
      <div className="relative aspect-square overflow-hidden bg-slate-900 rounded-t-[2.5rem]">
        {/* Images Container */}
        <div className="absolute inset-0 w-full h-full flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}>
          {images.map((img, idx) => (
            <div key={idx} className="w-full h-full flex-shrink-0 relative">
               <div className={`absolute inset-0 transition-transform duration-700 ease-out ${
                isPlaying ? 'scale-90' : 'scale-100'
               }`}>
                  <img 
                    src={img} 
                    alt={`${song.artist} - ${idx + 1}`}
                    className={`w-full h-full object-cover shadow-2xl transition-all duration-700 ${
                      isPlaying ? 'rounded-full animate-spin-slow border-8 border-black shadow-purple-500/50' : 'rounded-none'
                    }`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== FALLBACK_IMAGE) {
                        target.src = FALLBACK_IMAGE;
                      }
                    }}
                  />
               </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && !isPlaying && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
            
            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1.5 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
              {images.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'bg-purple-500 w-4' : 'bg-white/40'}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Center Play Overlay */}
        {!isPlaying && !isGenerating && (
          <button 
            onClick={handlePreview}
            className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
          >
            <div className="w-20 h-20 rounded-full bg-purple-600/90 flex items-center justify-center text-white text-3xl shadow-[0_0_30px_rgba(147,51,234,0.6)] transform scale-75 group-hover:scale-100 transition-transform duration-500">
              <i className="fa-solid fa-play ml-1"></i>
            </div>
          </button>
        )}

        {/* Add to Queue Floating Button */}
        {!isSource && onAddToQueue && (
          <button 
            onClick={() => onAddToQueue(song)}
            className={`absolute top-6 left-6 z-30 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-xl border ${
              isInQueue 
                ? 'bg-emerald-500 border-emerald-400 text-white cursor-default' 
                : 'bg-black/60 hover:bg-purple-600 border-white/20 text-white active:scale-90'
            }`}
            title={isInQueue ? "In Queue" : "Add to Queue"}
          >
            <i className={`fa-solid ${isInQueue ? 'fa-check' : 'fa-plus'}`}></i>
          </button>
        )}

        {/* Decorative Vinyl Hole when playing */}
        {isPlaying && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-slate-900 border-4 border-white/20 rounded-full z-10 shadow-inner"></div>
        )}

        {/* Ambient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60 pointer-events-none z-10"></div>
        
        {isSource && (
          <div className="absolute top-6 left-6 bg-purple-600 text-white text-[11px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-2xl border border-purple-400/50 z-20">
            Source Artist
          </div>
        )}

        <div className="absolute top-6 right-6 flex space-x-2 z-20">
           <div className="bg-black/80 backdrop-blur-xl text-white text-[11px] font-black px-3 py-1.5 rounded-full border border-white/20">
            {song.year}
          </div>
        </div>
        
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-20">
           <span className="px-4 py-1.5 bg-purple-500/20 backdrop-blur-2xl rounded-full text-[11px] text-purple-200 font-black uppercase tracking-widest border border-purple-500/30">
            {song.genre}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-white line-clamp-1 group-hover:text-purple-400 transition-colors tracking-tight">{song.title}</h3>
          <p className="text-slate-400 text-sm font-bold truncate">{song.artist}</p>
          
          {/* Artist Bio Section */}
          {song.artistBio && (
            <p className="text-slate-300 text-[11px] leading-relaxed mt-3 line-clamp-3 italic opacity-80 border-l-2 border-purple-500/30 pl-3 py-1">
              {song.artistBio}
            </p>
          )}
          
          <p className="text-slate-500 text-[12px] italic truncate pt-1 opacity-70">{song.album}</p>
        </div>

        {/* Tech Specs Mixer Style */}
        <div className="grid grid-cols-3 gap-3">
          {/* Key with Tooltip */}
          <div className="relative bg-white/5 rounded-2xl p-3 text-center border border-white/5 group-hover:border-blue-500/30 transition-colors group/key">
            <span className="flex items-center justify-center text-[9px] text-slate-500 uppercase font-black mb-1 cursor-help">
              Key
              <i className="fa-solid fa-circle-info ml-1 opacity-50 group-hover/key:opacity-100 transition-opacity"></i>
            </span>
            <span className="text-blue-400 font-mono text-sm font-bold">{song.key}</span>
            
            {/* Tooltip Content */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-3 glass border border-white/10 rounded-xl text-[10px] text-slate-300 leading-tight opacity-0 scale-95 group-hover/key:opacity-100 group-hover/key:scale-100 pointer-events-none group-hover/key:pointer-events-auto transition-all duration-300 z-50 shadow-2xl text-left">
              <p className="mb-2">Harmonic mixing allows for smooth transitions by choosing tracks with compatible keys.</p>
              <a 
                href="https://mixedinkey.com/harmonic-mixing-guide/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-400 hover:text-blue-300 font-bold underline inline-flex items-center"
              >
                Learn Camelot Wheel <i className="fa-solid fa-arrow-up-right-from-square ml-1 text-[8px]"></i>
              </a>
              {/* Tooltip Arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900/90"></div>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5 group-hover:border-pink-500/30 transition-colors">
            <span className="block text-[9px] text-slate-500 uppercase font-black mb-1">BPM</span>
            <span className="text-pink-400 font-mono text-sm font-bold">{song.bpm}</span>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5 group-hover:border-emerald-500/30 transition-colors">
            <span className="block text-[9px] text-slate-500 uppercase font-black mb-1">Length</span>
            <span className="text-emerald-400 font-mono text-sm font-bold">{song.length}</span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex space-x-2.5">
            <PlatformLink url={song.spotifyUrl} icon="fa-brands fa-spotify" color="bg-[#1DB954]/10 text-[#1DB954]" title="Spotify" />
            <PlatformLink url={song.appleMusicUrl} icon="fa-brands fa-apple" color="bg-white/10 text-white" title="Apple Music" />
            <PlatformLink url={song.soundcloudUrl} icon="fa-brands fa-soundcloud" color="bg-[#FF5500]/10 text-[#FF5500]" title="Soundcloud" />
            <PlatformLink url={song.beatportUrl} icon="fa-solid fa-headphones" color="bg-[#00FFD2]/10 text-[#00FFD2]" title="Beatport" />
          </div>
          <a href={song.youtubeUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center text-red-500 hover:scale-125 transition-all" title="Watch Video">
            <i className="fa-brands fa-youtube text-2xl"></i>
          </a>
        </div>

        {/* Control Button */}
        <button
          onClick={handlePreview}
          disabled={isGenerating}
          className={`group/btn w-full flex items-center justify-center space-x-3 py-4 rounded-2xl transition-all font-black text-[11px] uppercase tracking-[0.2em] border-2 ${
            isPlaying 
              ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_30px_rgba(147,51,234,0.5)] animate-pulse-ring' 
              : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white hover:border-purple-500/50'
          }`}
        >
          {isGenerating ? (
            <div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
          ) : isPlaying ? (
            <>
              <div className="flex items-end space-x-1 h-4">
                <div className="w-1 bg-white bar-anim h-full" style={{ animationDelay: '0.1s' }} />
                <div className="w-1 bg-white bar-anim h-2/3" style={{ animationDelay: '0.2s' }} />
                <div className="w-1 bg-white bar-anim h-full" style={{ animationDelay: '0.3s' }} />
                <div className="w-1 bg-white bar-anim h-1/2" style={{ animationDelay: '0.4s' }} />
              </div>
              <span>Stop Preview</span>
            </>
          ) : (
            <>
              <i className={`fa-solid ${song.previewUrl ? 'fa-play' : 'fa-bolt-lightning'} group-hover/btn:scale-150 transition-transform duration-300`}></i>
              <span>{song.previewUrl ? 'Play 10s Preview' : 'AI Audio Mix'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SongCard;
