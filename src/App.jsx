import React, { useState, useEffect, useRef } from 'react';
// Humne yahan 'Outlet' aur 'useOutletContext' ko import kiya hai
import { Routes, Route, Link, Outlet, useOutletContext } from 'react-router-dom';
import AuthForm from './components/AuthForm';
import PlayerUI from './components/PlayerUI';
import SongLibrary from './components/SongLibrary';
import AdminPanel from './components/Admin';
import ArtistPage from './components/ArtistPage';
import { Loader, Footer } from './components/OtherComponents';
import { getSongs } from './api/songService';
import { User, LogOut, Search, X, Play as PlayIcon, Pause as PauseIcon, ChevronDown } from 'lucide-react';

// --- Main Layout Component ---
// Yeh component left player aur right content area ka layout banata hai
const MainLayout = (props) => (
    <div className="flex flex-col md:flex-row h-full">
        {/* Left Column desktop/tablet par hi dikhega */}
        <div className="hidden md:flex md:w-96 p-4 flex-shrink-0 flex-col bg-gray-800/30">
            <div className="flex items-center justify-between mb-4">
                <Link to="/" className="flex items-center gap-3">
                    <img src="/logo.png" alt="App Logo" className="w-10 h-10 rounded-full" onError={(e) => e.target.style.display = 'none'} />
                    <h1 className="text-2xl font-bold text-gray-200">Mellow</h1>
                </Link>
                <div className="relative flex items-center gap-3">
                    <span className="text-gray-300 font-medium hidden md:block">Hi,</span>
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer" onClick={props.onLogoutClick}>
                        <User size={20} className="text-white" />
                    </div>
                    {props.isLogoutVisible && (<button onClick={props.onLogout} className="absolute top-12 right-0 bg-gray-900 text-white py-2 px-4 rounded-lg shadow-lg flex items-center gap-2 hover:bg-gray-700 z-10"><LogOut size={16} />Logout</button>)}
                </div>
            </div>
            <div className="bg-gray-800 rounded-2xl flex flex-col shadow-2xl flex-grow">
                <PlayerUI {...props} />
            </div>
        </div>
        {/* Right Column (Yahan ab Outlet aayega jo page badlega) */}
        {/* Hum yahan 'context' ke zariye saare props neeche bhej rahe hain */}
        <Outlet context={props} /> 
        {/* Mobile mini player bar bottom pe fixed */}
        <div className="md:hidden">
            <MobilePlayerBar {...props} />
        </div>
    </div>
);

// --- Library Page Component ---
const LibraryPage = () => {
    // Hum yahan 'useOutletContext' se data le rahe hain
    const { filteredSongs, onSelectSong, currentSongId, isPlaying, isLoadingSongs, error, searchTerm, onSearchChange, onClearSearch, onAdminClick, onLogoutClick, isLogoutVisible, onLogout } = useOutletContext();
    return (
        <div className="flex-grow p-4 flex flex-col min-h-0 min-w-0">
            <div className="flex-grow overflow-y-auto custom-scrollbar pb-20 md:pb-0">
                {/* Search inside scrollable area so it scrolls with content */}
                <div className="mb-4 flex items-center gap-3">
                    {/* Mobile-only user icon to the left of search with logout toggle */}
                    <div className="md:hidden relative flex-shrink-0">
                        <button onClick={onLogoutClick} className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                            <User size={20} className="text-white" />
                        </button>
                        {isLogoutVisible && (
                            <button onClick={onLogout} className="absolute left-0 mt-2 bg-gray-900 text-white py-2 px-4 rounded-lg shadow-lg text-sm whitespace-nowrap">Logout</button>
                        )}
                    </div>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input type="text" placeholder="Search for songs or artists..." value={searchTerm} onChange={onSearchChange} className="w-full bg-gray-700/60 text-white rounded-full py-2 pl-10 pr-10" />
                        {searchTerm && (<button onClick={onClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"><X size={20} /></button>)}
                    </div>
                </div>
                {isLoadingSongs ? <div className="w-full h-full flex items-center justify-center"><Loader /></div> : error ? <p className="text-red-400 text-center mt-10">Error: {error}.</p> : (
                    <>
                        <SongLibrary songs={filteredSongs} onSelectSong={onSelectSong} currentSongId={currentSongId} isPlaying={isPlaying} />
                        <Footer onDeveloperClick={onAdminClick} />
                    </>
                )}
            </div>
        </div>
    );
};

// --- Main App Component (Master Controller) ---
function App() {
    // States
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

    const audioRef = useRef(null);
    const currentSong = songs[currentSongIndex];

    // Effects
    useEffect(() => { const u = localStorage.getItem('user'); if (u) { try { setUser(JSON.parse(u)); } catch (e) { localStorage.removeItem('user'); } } setIsInitializing(false); }, []);
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
    useEffect(() => { const a = audioRef.current; if (a && currentSong) { if (a.src !== currentSong.songUrl) { a.src = currentSong.songUrl; a.load(); } } }, [currentSong]);
    useEffect(() => { const a = audioRef.current; if (a) { if (isPlaying) { a.play().catch(console.error); } else { a.pause(); } } }, [isPlaying, currentSong]);

    // Handlers
    const handleLogin = (d) => { setUser(d); localStorage.setItem('user', JSON.stringify(d)); };
    const handleLogout = () => { setIsPlaying(false); if (audioRef.current) audioRef.current.src = ""; setUser(null); setSongs([]); setCurrentSongIndex(0); localStorage.removeItem('user'); };
    const handlePlayPause = () => { if (!currentSong) return; setIsPlaying(!isPlaying); };
    const handleTogglePlayerExpand = () => setIsPlayerExpanded(p => !p);
    const handleNext = () => { if (songs.length === 0) return; let n = isShuffle ? Math.floor(Math.random() * songs.length) : (currentSongIndex + 1) % songs.length; if(isShuffle && n === currentSongIndex) return handleNext(); setCurrentSongIndex(n); setIsPlaying(true); };
    const handlePrev = () => { if (songs.length === 0) return; setCurrentSongIndex((currentSongIndex - 1 + songs.length) % songs.length); setIsPlaying(true); };
    const handleVolumeChange = (v) => { setVolume(v); if (audioRef.current) audioRef.current.volume = v; };
    const handleProgressChange = (p) => { if (audioRef.current && isFinite(audioRef.current.duration)) audioRef.current.currentTime = (p / 100) * audioRef.current.duration; };
    const handleTimeUpdate = () => { if (audioRef.current) { setDuration(audioRef.current.duration || 0); setCurrentTime(audioRef.current.currentTime || 0); setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100 || 0); } };
    const handleSongEnd = () => { if (isRepeat) { if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play(); } } else { handleNext(); } };
    const handleSongUploaded = (s) => setSongs(p => [...p, s]);
    const handleSelectSong = (id) => { const i = songs.findIndex(s => s.id === id); if (i !== -1) { if (currentSongIndex === i) setIsPlaying(p => !p); else { setCurrentSongIndex(i); setIsPlaying(true); } setSearchTerm(''); } };
    
    const filteredSongs = songs.filter((s) => {
        const term = (searchTerm || '').toLowerCase();
        const title = (s?.title || '').toLowerCase();
        const artistField = s?.artist;
        const artistString = Array.isArray(artistField)
            ? artistField.join(', ')
            : (artistField || '');
        const artists = artistString.toLowerCase();
        return title.includes(term) || artists.includes(term);
    });
    
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
                            onLogoutClick={() => setIsLogoutVisible(!isLogoutVisible)} 
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
                            onShuffleToggle={() => setIsShuffle(!isShuffle)} 
                            isRepeat={isRepeat} 
                            onRepeatToggle={() => setIsRepeat(!isRepeat)} 
                            allSongs={songs}
                            filteredSongs={filteredSongs}
                            onSelectSong={handleSelectSong}
                            currentSongId={currentSong?.id}
                            isLoadingSongs={isLoadingSongs}
                            error={error}
                            searchTerm={searchTerm}
                            onSearchChange={(e) => setSearchTerm(e.target.value)}
                            onClearSearch={() => setSearchTerm('')}
                            onAdminClick={() => setIsAdminPanelOpen(true)}
                            onTogglePlayerExpand={handleTogglePlayerExpand}
                        />
                    }>
                        <Route index element={<LibraryPage />} />
                        <Route path="artist/:artistName" element={<ArtistPage />} />
                    </Route>
                )}
            </Routes>
            {isAdminPanelOpen && ( <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"><AdminPanel onClose={() => setIsAdminPanelOpen(false)} onSongUploaded={handleSongUploaded} /> </div> )}
            {/* Mobile expanded player full-screen overlay */}
            {/* Mobile expanded player full-screen overlay with slide animation */}
            <div className={`fixed inset-0 bg-gray-900 z-50 md:hidden transform transition-transform duration-300 ease-in-out ${isPlayerExpanded ? 'translate-y-0' : 'translate-y-full pointer-events-none'}`}>
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
                        />
                    </div>
                </div>
            </div>
            <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleTimeUpdate} onEnded={handleSongEnd} />
        </div>
    );
}

export default App;

// --- Mobile mini player bar component ---
const MobilePlayerBar = ({ currentSong, isPlaying, onPlayPause, onTogglePlayerExpand }) => {
    if (!currentSong) return null;
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-3 z-40">
            <div onClick={onTogglePlayerExpand} className="w-full flex items-center gap-3 cursor-pointer" role="button" tabIndex={0}>
                <img src={currentSong.coverUrl} alt={currentSong.title} className="w-12 h-12 rounded-md object-cover" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/200x200/1F2937/FFFFFF?text=Music'; }} />
                <div className="flex-1 text-left">
                    <div className="text-sm font-semibold truncate">{currentSong.title}</div>
                    <div className="text-xs text-gray-400 truncate">{currentSong.artist}</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onPlayPause(); }} className="bg-blue-600 text-white rounded-full p-2 hover:bg-blue-500">
                    {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                </button>
            </div>
        </div>
    );
};

