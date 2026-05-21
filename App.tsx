
import React, { useState, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import SongCard from './components/SongCard';
import { findCompatibleMusic } from './services/geminiService';
import { SearchResult, Song } from './types';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Queue State
  const [queue, setQueue] = useState<Song[]>([]);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await findCompatibleMusic(query);
      if (data.error) {
        setError(data.error);
        setResult(null);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addToQueue = (song: Song) => {
    if (!queue.find(s => s.title === song.title && s.artist === song.artist)) {
      setQueue(prev => [...prev, song]);
      if (!isQueueOpen) setIsQueueOpen(true);
    }
  };

  const removeFromQueue = (index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  };

  const clearQueue = () => {
    setQueue([]);
  };

  return (
    <div className="min-h-screen pb-20 selection:bg-purple-500/30 overflow-x-hidden">
      {/* Hero Section */}
      <header className="relative pt-20 pb-12 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-block p-1 px-4 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold tracking-widest uppercase mb-2">
            AI-Powered Music Curator
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white neon-text">
            Harmonix
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
            Search for compatible music by Genre, BPM, and Musical Key. 
            Perfect for DJ transitions and playlist building.
          </p>
          
          <div className="pt-8">
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 mt-12 relative">
        
        {/* Floating Queue Toggle Button */}
        {queue.length > 0 && !isQueueOpen && (
          <button 
            onClick={() => setIsQueueOpen(true)}
            className="fixed bottom-10 right-10 z-50 bg-purple-600 hover:bg-purple-500 text-white p-5 rounded-full shadow-[0_0_30px_rgba(147,51,234,0.6)] animate-bounce-custom flex items-center space-x-3 transition-all"
          >
            <i className="fa-solid fa-layer-group text-xl"></i>
            <span className="font-black text-sm uppercase tracking-widest">Queue ({queue.length})</span>
          </button>
        )}

        {/* Sidebar / Modal for Queue */}
        <aside 
          className={`fixed top-0 right-0 h-full w-full sm:w-[400px] z-[60] glass border-l border-white/10 transition-transform duration-500 ease-in-out transform ${
            isQueueOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="p-8 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Your Crate</h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">{queue.length} Tracks Ready</p>
              </div>
              <button 
                onClick={() => setIsQueueOpen(false)}
                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/5 text-slate-400 hover:text-white transition-all"
              >
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {queue.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                  <i className="fa-solid fa-compact-disc text-6xl animate-spin-slow"></i>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Crate is empty</p>
                </div>
              ) : (
                queue.map((song, index) => (
                  <div key={`${song.title}-${index}`} className="group flex items-center p-3 bg-white/5 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                      <img src={song.artistImageUrl} alt={song.artist} className="w-full h-full object-cover" />
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{song.title}</h4>
                      <p className="text-[10px] text-slate-500 font-medium truncate uppercase tracking-tighter">{song.artist}</p>
                    </div>
                    <button 
                      onClick={() => removeFromQueue(index)}
                      className="ml-2 w-8 h-8 flex items-center justify-center text-slate-600 hover:text-red-500 transition-colors"
                    >
                      <i className="fa-solid fa-trash-can text-sm"></i>
                    </button>
                  </div>
                ))
              )}
            </div>

            {queue.length > 0 && (
              <div className="p-8 border-t border-white/10 bg-slate-950/50">
                <button 
                  onClick={clearQueue}
                  className="w-full py-4 rounded-2xl bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 font-black text-[10px] uppercase tracking-[0.2em] transition-all"
                >
                  Clear All Tracks
                </button>
                <p className="text-center text-[9px] text-slate-600 mt-4 uppercase font-bold tracking-widest">
                  Ready to mix? Start your session.
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* Backdrop for Sidebar */}
        {isQueueOpen && (
          <div 
            onClick={() => setIsQueueOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] transition-opacity animate-in fade-in duration-300"
          ></div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-6 rounded-2xl flex items-center space-x-4 max-w-2xl mx-auto">
            <i className="fa-solid fa-circle-exclamation text-2xl"></i>
            <p className="font-medium">{error}</p>
          </div>
        )}

        {isLoading && !result && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fa-solid fa-music text-purple-500"></i>
              </div>
            </div>
            <p className="text-slate-400 font-medium animate-pulse">Analyzing frequencies and matching beats...</p>
          </div>
        )}

        {result && result.sourceSong && (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Source Track Section */}
            <section>
              <h2 className="text-2xl font-bold mb-8 flex items-center space-x-3">
                <span className="w-8 h-1 bg-purple-500 rounded-full"></span>
                <span>Search Analysis</span>
              </h2>
              <div className="max-w-sm">
                <SongCard 
                  song={result.sourceSong} 
                  isSource={true} 
                />
              </div>
            </section>

            {/* Recommendations Section */}
            <section>
              <h2 className="text-2xl font-bold mb-8 flex items-center space-x-3">
                <span className="w-8 h-1 bg-purple-500 rounded-full"></span>
                <span>Compatible Tracks</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {result.recommendations.map((song, index) => (
                  <SongCard 
                    key={`${song.title}-${index}`} 
                    song={song} 
                    onAddToQueue={addToQueue}
                    isInQueue={queue.some(q => q.title === song.title && q.artist === song.artist)}
                  />
                ))}
              </div>
            </section>
          </div>
        )}

        {!result && !isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
            <div className="glass p-8 rounded-3xl space-y-4">
              <div className="w-12 h-12 bg-purple-600/20 rounded-2xl flex items-center justify-center text-purple-500">
                <i className="fa-solid fa-wave-square text-xl"></i>
              </div>
              <h3 className="text-lg font-bold">BPM Matching</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Find tracks with synchronized tempos to ensure smooth transitions between songs.
              </p>
            </div>
            <div className="glass p-8 rounded-3xl space-y-4">
              <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500">
                <i className="fa-solid fa-music text-xl"></i>
              </div>
              <h3 className="text-lg font-bold">Key Compatibility</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Unlock harmonic mixing by finding tracks in the same or complementary musical keys.
              </p>
            </div>
            <div className="glass p-8 rounded-3xl space-y-4">
              <div className="w-12 h-12 bg-pink-600/20 rounded-2xl flex items-center justify-center text-pink-500">
                <i className="fa-solid fa-compact-disc text-xl"></i>
              </div>
              <h3 className="text-lg font-bold">Genre Flow</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Maintain the energy level and vibe of your mix with genre-aware recommendations.
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-20 py-8 border-t border-white/5 text-center">
        <p className="text-slate-500 text-sm">
          Powered by Gemini AI • Built for DJs and Music Enthusiasts
        </p>
      </footer>
    </div>
  );
};

export default App;
