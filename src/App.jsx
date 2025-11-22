import React, { useState, useEffect, useRef, useCallback } from 'react';
// Humne yahan 'Outlet' aur 'useOutletContext' ko import kiya hai
import { Routes, Route, Link, Outlet, useOutletContext } from 'react-router-dom';
import AuthForm from './components/AuthForm';
import queueService from './services/queueService';
import nativeMediaService from './services/nativeMediaService';
import PlayerUI from './components/PlayerUI';
import SongLibrary from './components/SongLibrary';
import AdminPanel from './components/Admin';
import ArtistPage from './components/ArtistPage';
import { Loader, Footer } from './components/OtherComponents';
import { getSongs } from './api/songService';
import { User, Search, X, Play as PlayIcon, Pause as PauseIcon, ChevronDown } from 'lucide-react';
import QueuePanel from './components/QueuePanel';
import PlaylistModal from './components/PlaylistModal';
import PlaylistPage from './components/PlaylistPage';
import PlaylistsPage from './components/PlaylistsPage';
import FeedbackPage from './components/FeedbackPage';
import BottomNav from './components/BottomNav';
import MoodPage from './components/MoodPage';
import { createFuzzySearch, getFuzzySuggestions } from './utils/fuzzySearch';

// No global fallbacks for handlers. Handlers should be passed explicitly via props or outlet context.

// --- Main Layout Component ---
// Yeh component left player aur right content area ka layout banata hai
const MainLayout = (props) => (
    <div className="flex flex-col md:flex-row h-full">
        {/* Left Column desktop/tablet par hi dikhega */}
    <div className="hidden md:flex md:w-80 p-3 flex-shrink-0 flex-col bg-gray-800/30">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Link to="/" className="flex items-center gap-3">
                        <img src="/logo.png" alt="App Logo" className="w-10 h-10 rounded-full" onError={(e) => e.target.style.display = 'none'} />
                        <h1 className="text-2xl font-bold text-gray-200">Mellow</h1>
                    </Link>
                </div>
                {/* Replace user profile area with Playlist button in the left column header (desktop) */}
                <div className="relative flex items-center gap-3">
                    <div className="hidden md:block">
                        <Link to="/playlists" className="px-3 py-2 bg-blue-600 rounded-full text-white hover:bg-blue-500">Playlists</Link>
                    </div>
                </div>
            </div>
            <div className="bg-gray-800 rounded-2xl flex flex-col shadow-2xl flex-grow">
                <PlayerUI {...props} />
            </div>
        </div>
        {/* Right Column (Yahan ab Outlet aayega jo page badlega) */}
        {/* Hum yahan 'context' ke zariye saare props neeche bhej rahe hain */}
        <Outlet context={props} /> 
        {/* Mobile mini player bar bottom pe fixed, leave space for BottomNav */}
        <div className="md:hidden">
            <MobilePlayerBar {...props} />
            <BottomNav />
        </div>
    </div>
);

// --- Library Page Component ---
const LibraryPage = () => {
    // Safely read the outlet context so we don't crash if it's undefined
    const context = useOutletContext() || {};
    // helpful debug logs to inspect the outlet context at runtime
    // (will show up in browser console when LibraryPage renders)
    try {
        // eslint-disable-next-line no-console
        console.debug('LibraryPage - outlet context keys:', Object.keys(context || {}));
        // eslint-disable-next-line no-console
        console.debug('LibraryPage - onAddToQueue present?', Boolean(context && context.onAddToQueue));
    } catch (e) {}
    const { filteredSongs, onSelectSong, currentSongId, isPlaying, isLoadingSongs, error, searchTerm, onSearchChange, onClearSearch, onAdminClick, onLogoutClick, isLogoutVisible, onLogout } = context;

    // Safe wrapper that calls the context handler if present.
    const safeAddToQueue = (song, position = 'end') => {
        if (context && typeof context.onAddToQueue === 'function') {
            return context.onAddToQueue(song, position);
        }
        // eslint-disable-next-line no-console
        console.warn('safeAddToQueue: onAddToQueue not available in context.');
    };
    return (
        <div className="flex-grow p-4 flex flex-col min-h-0 min-w-0">
            <div className="flex-grow overflow-y-auto custom-scrollbar pb-20 md:pb-0">
                {/* Search inside scrollable area so it scrolls with content */}
                <div className="mb-4 flex items-center gap-3">
                    {/* Mobile-only user icon to the left of search with logout toggle */}
                    <div className="md:hidden relative flex-shrink-0 flex items-center gap-2">
                        <button onClick={onLogoutClick} className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                            <User size={20} className="text-white" />
                        </button>
                        {isLogoutVisible && (
                            <button onClick={onLogout} className="absolute left-0 top-14 bg-gray-900 text-white py-2 px-4 rounded-lg shadow-lg text-sm whitespace-nowrap">Logout</button>
                        )}
                    </div>
                    <div className="relative flex-1 flex items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            {/* Give an id so BottomNav can focus this input when Search button pressed */}
                            <input id="global-search-input" type="text" placeholder="Search for songs or artists..." value={searchTerm} onChange={onSearchChange} autoComplete="off" className="w-full bg-gray-700/60 text-white rounded-full py-1.5 pl-9 pr-9 text-sm" />
                            {searchTerm && (<button onClick={onClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"><X size={20} /></button>)}
                        </div>
                        {/* Desktop: move user profile icon and 'Hi,' to the right of search */}
                        <div className="hidden md:flex items-center ml-3">
                            <span className="text-gray-300 font-medium mr-2">Hi,</span>
                            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer" onClick={onLogoutClick}>
                                <User size={20} className="text-white" />
                            </div>
                            {isLogoutVisible && (
                                <button onClick={onLogout} className="ml-3 bg-gray-900 text-white py-2 px-3 rounded-md text-sm">Logout</button>
                            )}
                        </div>
                    </div>
                </div>
                {isLoadingSongs ? <div className="w-full h-full flex items-center justify-center"><Loader /></div> : error ? <p className="text-red-400 text-center mt-10">Error: {error}.</p> : (
                    <>
                        <SongLibrary
                            songs={filteredSongs}
                            onSelectSong={onSelectSong}
                            currentSongId={currentSongId}
                            isPlaying={isPlaying}
                            onAddToQueue={(context && typeof context.onAddToQueue === 'function') ? context.onAddToQueue : safeAddToQueue}
                        />
                        <Footer onDeveloperClick={onAdminClick} />
                    </>
                )}
            </div>
        </div>
    );
};

// --- Main App Component (Master Controller) ---
function App() {
    const [user, setUser] = useState(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [songs, setSongs] = useState([]);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(1);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isLoadingSongs, setIsLoadingSongs] = useState(true);
    const [error, setError] = useState(null);
    const [isShuffle, setIsShuffle] = useState(false);
    const [isRepeat, setIsRepeat] = useState(false);
    const [isLogoutVisible, setIsLogoutVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
    const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
    const [queue, setQueue] = useState([]);
    const [isQueueOpen, setIsQueueOpen] = useState(false);

    const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
    const [playlistSongId, setPlaylistSongId] = useState(null);

    const audioRef = useRef(null);
    const currentSong = songs[currentSongIndex];

    // New state for fuzzy search
    const [suggestions, setSuggestions] = useState([]);
    const [fuzzy, setFuzzy] = useState(null);

    // Effects
    useEffect(() => { const u = localStorage.getItem('user'); if (u) { try { setUser(JSON.parse(u)); } catch (e) { localStorage.removeItem('user'); } } setIsInitializing(false); }, []);
    // Ensure a global bare `onAddToQueue` exists in the page global scope for
    // legacy bundles that call `onAddToQueue(...)` (without `window.`). This
    // creates a real global var by evaluating a small script in the global
    // scope so those calls don't throw ReferenceError. It forwards to the
    // safer `window.__APP_ON_ADD_TO_QUEUE` forwarder when available.
    useEffect(() => {
        try {
            if (typeof window !== 'undefined') {
                // If a true global var isn't present, inject one into the global scope
                // using eval so it's declared with `var` at top-level.
                if (!window.onAddToQueue) {
                    const shim = "var onAddToQueue = function(){ try { if(window.__APP_ON_ADD_TO_QUEUE && typeof window.__APP_ON_ADD_TO_QUEUE === 'function') { return window.__APP_ON_ADD_TO_QUEUE.apply(null, arguments); } } catch(e){} console.warn('Global onAddToQueue called but no app handler is registered.'); return null; }; window.onAddToQueue = window.onAddToQueue || onAddToQueue;";
                    // Use global eval to declare a true global var
                    (0, eval)(shim);
                }
            }
        } catch (e) {
            // silent
        }
    }, []);
    
    useEffect(() => { 
        if (user) { 
            setIsLoadingSongs(true); 
            getSongs(user.token)
                .then(setSongs)
                .catch(err => {
                    if (String(err.message || '').toLowerCase().includes('token expired')) {
                        // Auto-logout on expired token
                        try { localStorage.removeItem('user'); } catch {}
                        setIsPlaying(false);
                        if (audioRef.current) audioRef.current.src = "";
                        setUser(null);
                        setSongs([]);
                        setCurrentSongIndex(0);
                        setError(null);
                    } else {
                        setError(err.message);
                    }
                })
                .finally(() => setIsLoadingSongs(false)); 
        } 
    }, [user]);
    // Mobile-only auto-refresh every 10 minutes
    useEffect(() => {
        if (!user) return;
        const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
        if (!isMobile) return;
        const intervalId = setInterval(() => {
            getSongs(user.token)
                .then(setSongs)
                .catch(err => {
                    if (String(err.message || '').toLowerCase().includes('token expired')) {
                        try { localStorage.removeItem('user'); } catch {}
                        setIsPlaying(false);
                        if (audioRef.current) audioRef.current.src = "";
                        setUser(null);
                        setSongs([]);
                        setCurrentSongIndex(0);
                        setError(null);
                    } else {
                        setError(err.message);
                    }
                });
        }, 10 * 60 * 1000);
        return () => clearInterval(intervalId);
    }, [user]);
    useEffect(() => { const a = audioRef.current; if (a && currentSong) { if (a.src !== currentSong.songUrl) { a.src = currentSong.songUrl; a.load(); } 
        // Start or update native media service when song changes
        (async () => {
            try {
                await nativeMediaService.start(currentSong, isPlaying);
            } catch(e) { console.warn('nativeMediaService.start error', e); }
        })();
    } }, [currentSong]);
    useEffect(() => { const a = audioRef.current; if (a) { if (isPlaying) { a.play().catch(console.error); } else { a.pause(); } 
        // Update native notification play state
        (async () => {
            try {
                await nativeMediaService.updateIsPlaying(isPlaying);
                if (!isPlaying) {
                    // leave notification but mark paused; don't stop service
                }
            } catch(e) { console.warn('nativeMediaService.updateIsPlaying error', e); }
        })();
    } }, [isPlaying, currentSong]);

    // Handlers
    const handleLogin = useCallback((d) => { setUser(d); localStorage.setItem('user', JSON.stringify(d)); }, []);
    const handleLogout = useCallback(() => { setIsPlaying(false); if (audioRef.current) audioRef.current.src = ""; setUser(null); setSongs([]); setCurrentSongIndex(0); localStorage.removeItem('user'); }, []);
    const handlePlayPause = useCallback(() => { if (!currentSong) return; setIsPlaying(p => !p); }, [currentSong]);
    const handleTogglePlayerExpand = useCallback(() => setIsPlayerExpanded(p => !p), []);
    const handleNext = useCallback(() => {
        try {
            const q = queueService.getQueue();
            if (q.length > 0) {
                // move queue pointer and play next queue song
                const nextSong = queueService.next();
                if (nextSong) {
                    const globalIndex = songs.findIndex(s => s.id === nextSong.id);
                    if (globalIndex !== -1) {
                        setCurrentSongIndex(globalIndex);
                    } else {
                        setSongs(prev => [...prev, nextSong]);
                        setCurrentSongIndex(songs.length);
                    }
                    setIsPlaying(true);
                    setQueue(queueService.getQueue());
                    return;
                }
            }
            if (songs.length === 0) return;
            let n = isShuffle ? Math.floor(Math.random() * songs.length) : (currentSongIndex + 1) % songs.length;
            if (isShuffle && n === currentSongIndex) return handleNext();
            setCurrentSongIndex(n);
            setIsPlaying(true);
        } catch (err) {
            console.error('handleNext error', err);
        }
    }, [songs, currentSongIndex, isShuffle]);

    const handlePrev = useCallback(() => {
        try {
            const q = queueService.getQueue();
            if (q.length > 0) {
                const prevSong = queueService.previous();
                if (prevSong) {
                    const globalIndex = songs.findIndex(s => s.id === prevSong.id);
                    if (globalIndex !== -1) {
                        setCurrentSongIndex(globalIndex);
                    } else {
                        setSongs(prev => [...prev, prevSong]);
                        setCurrentSongIndex(songs.length);
                    }
                    setIsPlaying(true);
                    setQueue(queueService.getQueue());
                    return;
                }
            }
            if (songs.length === 0) return;
            setCurrentSongIndex((currentSongIndex - 1 + songs.length) % songs.length);
            setIsPlaying(true);
        } catch (err) {
            console.error('handlePrev error', err);
        }
    }, [songs, currentSongIndex]);
    const handleVolumeChange = useCallback((v) => { setVolume(v); if (audioRef.current) audioRef.current.volume = v; }, []);
    const handleProgressChange = useCallback((p) => { if (audioRef.current && isFinite(audioRef.current.duration)) audioRef.current.currentTime = (p / 100) * audioRef.current.duration; }, []);
    const handleTimeUpdate = () => { if (audioRef.current) { setDuration(audioRef.current.duration || 0); setCurrentTime(audioRef.current.currentTime || 0); setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100 || 0); } };
    const handleSongEnd = () => {
        if (isRepeat) {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
            }
            return;
        }
        // If queue has more items, advance via queueService
        const q = queueService.getQueue();
        if (q.length > 0) {
            handleNext();
            return;
        }
        handleNext();
    };
    const handleSongUploaded = (s) => setSongs(p => [...p, s]);
    const handleSelectSong = useCallback((id) => {
        const i = songs.findIndex(s => s.id === id);
        if (i !== -1) {
            if (currentSongIndex === i) setIsPlaying(p => !p);
            else {
                setCurrentSongIndex(i);
                setIsPlaying(true);
            }
            setSearchTerm('');
            // When user explicitly selects a song, reset queue pointer to the selected song if it's in queue
            try {
                const qIndex = queueService.getQueue().findIndex(s => String(s.id) === String(id));
                if (qIndex !== -1) {
                    queueService.currentIndex = qIndex;
                    setQueue(queueService.getQueue());
                }
            } catch (e) {}
        }
    }, [songs, currentSongIndex]);
    // Queue handler used by SongLibrary to add a song to the queue
    const handleAddToQueue = useCallback((songOrSongs, position = 'end') => {
        try {
            queueService.addToQueue(songOrSongs, position);
            // sync local state for UI
            setQueue(queueService.getQueue());
        } catch (err) {
            console.error('Failed to add to queue', err);
        }
    }, []);

    // Keep a ref to the latest handler so legacy global callers can safely
    // forward to the current implementation without causing TDZ issues.
    const addToQueueRef = useRef(null);
    useEffect(() => { addToQueueRef.current = handleAddToQueue; }, [handleAddToQueue]);

    // Stable UI toggles used by controls/headers etc.
    const handleShuffleToggle = useCallback(() => setIsShuffle(s => !s), []);
    const handleRepeatToggle = useCallback(() => setIsRepeat(r => !r), []);
    const toggleLogoutVisible = useCallback(() => setIsLogoutVisible(v => !v), []);
    
    // New search handlers
    const handleSearchChange = useCallback((e) => {
        const val = e.target.value;
        setSearchTerm(val);
        if (fuzzy && val) {
            setSuggestions(getFuzzySuggestions(fuzzy, val, 5));
        } else {
            setSuggestions([]);
        }
    }, [fuzzy]);
    const handleClearSearch = useCallback(() => {
        setSearchTerm('');
        setSuggestions([]);
    }, []);

    // Handle browser/mobile gesture back navigation
    useEffect(() => {
        const onPopState = () => {
            // Close modals if open, or sync UI state as needed
            setIsQueueOpen(false);
            setIsPlaylistOpen(false);
            setIsPlayerExpanded(false);
            setIsAdminPanelOpen(false);
            // Optionally clear search or suggestions if desired
            // setSearchTerm(''); setSuggestions([]);
        };
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, []);

    // Register a stable global shim once. The shim forwards calls to the
    // latest handler stored in addToQueueRef. This avoids referencing the
    // handler before it's initialized and prevents frequent re-writes of the
    // global on every render.
    useEffect(() => {
        try {
            if (typeof window !== 'undefined') {
                window.__APP_ON_ADD_TO_QUEUE = (...args) => {
                    try { return addToQueueRef.current && addToQueueRef.current(...args); } catch (e) { console.error('global onAddToQueue forwarder error', e); }
                };
            }
        } catch (e) {}
        return () => {
            try {
                if (typeof window !== 'undefined' && window.__APP_ON_ADD_TO_QUEUE) {
                    try { delete window.__APP_ON_ADD_TO_QUEUE; } catch (e) { window.__APP_ON_ADD_TO_QUEUE = undefined; }
                }
            } catch (e) {}
        };
    }, []);

    const handleRemoveFromQueue = (songId) => {
        try {
            queueService.removeFromQueue(songId);
            setQueue(queueService.getQueue());
        } catch (err) {
            console.error('Failed to remove from queue', err);
        }
    };

    const handlePlaySongAtIndex = (index) => {
        const q = queueService.getQueue();
        if (index >= 0 && index < q.length) {
            const song = q[index];
            const globalIndex = songs.findIndex(s => s.id === song.id);
            if (globalIndex !== -1) {
                setCurrentSongIndex(globalIndex);
                setIsPlaying(true);
            } else {
                // Not in main list, just set current song to the queue song by injecting into songs
                setSongs(prev => [...prev, song]);
                setCurrentSongIndex(songs.length); // play newly appended (best-effort)
                setIsPlaying(true);
            }
        }
        setIsQueueOpen(false);
    };

    const handleToggleQueue = () => {
        setIsQueueOpen(v => !v);
        // ensure state reflects queueService
        setQueue(queueService.getQueue());
    };

    const handleOpenAddToPlaylist = (songId) => {
        const token = (user && user.token) ? user.token : null;
        if (!token) {
            alert('Please login to manage playlists');
            return;
        }
        setPlaylistSongId(songId);
        setIsPlaylistOpen(true);
    };

    const handlePlaylistUpdated = () => {
        // placeholder for actions after playlist changes
        console.log('Playlist updated');
    };
    
    // Build fuzzy search index when songs change
    useEffect(() => {
        if (songs && songs.length > 0) {
            setFuzzy(createFuzzySearch(songs, ['title', 'artist']));
        }
    }, [songs]);

    // Use fuzzy search for filtering
    const filteredSongs = (fuzzy && searchTerm)
        ? getFuzzySuggestions(fuzzy, searchTerm, 100)
        : songs;
    
    if (isInitializing) return <div className="h-screen bg-gray-900 flex items-center justify-center"><Loader /></div>;
    
    return (
        <div className="h-screen bg-gray-900 text-white font-sans overflow-hidden">
            <Routes>
                { !user ? (
                    <Route path="*" element={<div className="flex items-center justify-center h-full"><AuthForm onLoginSuccess={handleLogin} /></div>} />
                ) : (
                    <Route path="/" element={
                        <MainLayout 
                            user={user}
                            onLogoutClick={toggleLogoutVisible}
                            isLogoutVisible={isLogoutVisible} 
                            onLogout={handleLogout}
                            currentSong={currentSong} 
                            isPlaying={isPlaying} 
                            onPlayPause={handlePlayPause} 
                            onNext={handleNext} 
                            onPrev={handlePrev} 
                            progress={progress} 
                            onProgressChange={handleProgressChange} 
                            duration={duration} 
                            currentTime={currentTime} 
                            volume={volume} 
                            onVolumeChange={handleVolumeChange} 
                            isShuffle={isShuffle} 
                            onShuffleToggle={handleShuffleToggle}
                            isRepeat={isRepeat} 
                            onRepeatToggle={handleRepeatToggle}
                            allSongs={songs}
                            filteredSongs={filteredSongs}
                            onSelectSong={handleSelectSong}
                            currentSongId={currentSong?.id}
                            isLoadingSongs={isLoadingSongs}
                            error={error}
                            searchTerm={searchTerm}
                            onSearchChange={handleSearchChange}
                            onClearSearch={handleClearSearch}
                            onAdminClick={() => setIsAdminPanelOpen(true)}
                            onAddToQueue={handleAddToQueue}
                            onAddToPlaylist={(songId) => handleOpenAddToPlaylist(songId)}
                            onShowArtist={(artistName) => {
                                // Navigate to artist page
                                // Using window.location to avoid importing navigate here
                                window.location.href = `/artist/${encodeURIComponent(artistName)}`;
                            }}
                            onReportSong={(songId) => {
                                const reason = prompt('Report song reason (optional):');
                                if (reason !== null) {
                                    console.log('Reported song', songId, 'reason:', reason);
                                    alert('Thank you. The song has been reported.');
                                }
                            }}
                            onTogglePlayerExpand={handleTogglePlayerExpand}
                        />
                    }>
                        <Route index element={<LibraryPage />} />
                        <Route path="artist/:artistName" element={<ArtistPage />} />
                            <Route path="mood/:moodName" element={<MoodPage />} />
                        <Route path="playlists" element={<PlaylistsPage />} />
                        <Route path="playlists/:id" element={<PlaylistPage />} />
                        <Route path="feedback" element={<FeedbackPage />} />
                    </Route>
                )}
            </Routes>
            {isAdminPanelOpen && ( <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"><AdminPanel onClose={() => setIsAdminPanelOpen(false)} onSongUploaded={handleSongUploaded} /> </div> )}
            {/* Mobile expanded player full-screen overlay */}
            {isPlayerExpanded && (
                <div className="fixed inset-0 bg-gray-900 z-50 md:hidden">
                    <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-3">
                            <img src="/logo.png" alt="App Logo" className="w-8 h-8 rounded-full" onError={(e) => e.target.style.display = 'none'} />
                            <h1 className="text-xl font-bold text-gray-200">Mellow</h1>
                        </Link>
                        <button onClick={() => setIsPlayerExpanded(false)} className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-gray-800" aria-label="Minimize player">
                            <ChevronDown className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="h-full pt-16 pb-8 px-4">
                        <div className="bg-gray-800 rounded-2xl h-full">
                            <PlayerUI 
                                currentSong={currentSong}
                                isPlaying={isPlaying}
                                onPlayPause={handlePlayPause}
                                onNext={handleNext}
                                onPrev={handlePrev}
                                progress={progress}
                                onProgressChange={handleProgressChange}
                                duration={duration}
                                currentTime={currentTime}
                                volume={volume}
                                onVolumeChange={handleVolumeChange}
                                isShuffle={isShuffle}
                                onShuffleToggle={() => setIsShuffle(!isShuffle)}
                                isRepeat={isRepeat}
                                onRepeatToggle={() => setIsRepeat(!isRepeat)}
                                onAddToQueue={handleAddToQueue}
                                onAddToPlaylist={(songId) => handleOpenAddToPlaylist(songId)}
                                onShowArtist={(artistName) => { window.location.href = `/artist/${encodeURIComponent(artistName)}`; }}
                                onReportSong={(songId) => { const reason = prompt('Report song reason (optional):'); if (reason !== null) { console.log('Reported song', songId, 'reason:', reason); alert('Thank you. The song has been reported.'); } }}
                            />
                        </div>
                    </div>
                </div>
            )}
            <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleTimeUpdate} onEnded={handleSongEnd} />
            {isQueueOpen && (
                <QueuePanel queue={queue} onClose={() => setIsQueueOpen(false)} onPlaySongAtIndex={handlePlaySongAtIndex} onRemove={handleRemoveFromQueue} />
            )}
            {isPlaylistOpen && (
                <PlaylistModal token={(user && user.token) ? user.token : null} onClose={() => setIsPlaylistOpen(false)} songId={playlistSongId} onPlaylistUpdated={handlePlaylistUpdated} allSongs={songs} />
            )}
        </div>
    );
}

export default App;

// --- Mobile mini player bar component ---
const MobilePlayerBar = ({ currentSong, isPlaying, onPlayPause, onTogglePlayerExpand }) => {
    if (!currentSong) return null;
    return (
        <div className="fixed bottom-14 left-0 right-0 bg-gray-800 border-t border-gray-700 p-1.5 z-40">
            <div onClick={onTogglePlayerExpand} className="w-full flex items-center gap-2 cursor-pointer" role="button" tabIndex={0}>
                <img src={currentSong.coverUrl} alt={currentSong.title} className="w-9 h-9 rounded-md object-cover" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/200x200/1F2937/FFFFFF?text=Music'; }} />
                <div className="flex-1 text-left">
                    <div className="text-sm font-semibold truncate">{currentSong.title}</div>
                    <div className="text-xs text-gray-400 truncate">{currentSong.artist}</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onPlayPause(); }} className="bg-blue-600 text-white rounded-full p-1 hover:bg-blue-500">
                    {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
};

