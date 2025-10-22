import React, { useState, useRef, useEffect } from 'react';
import { Controls, ProgressBar, VolumeControl } from './OtherComponents';
import { Music, MoreVertical } from 'lucide-react';

const PlayerUI = ({ 
    currentSong, isPlaying, onPlayPause, onNext, onPrev, 
    progress, onProgressChange, duration, currentTime,
    volume, onVolumeChange,
    isShuffle, onShuffleToggle, isRepeat, onRepeatToggle,
    onAddToQueue = () => {}, onAddToPlaylist = () => {}, onShowArtist = () => {}, onReportSong = () => {}
}) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const [dropdownStyle, setDropdownStyle] = useState(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // compute dropdown position when menuOpen toggles on
    useEffect(() => {
        if (menuOpen && menuRef.current) {
            const rect = menuRef.current.getBoundingClientRect();
            const menuWidth = 176; // matches w-44 ~ 11rem = 176px
            const dropdownHeight = 160; // approximate height of the menu
            // align dropdown right edge to button right edge
            let left = rect.right - menuWidth;
            if (left < 8) left = 8;
            if (left + menuWidth > window.innerWidth - 8) left = window.innerWidth - menuWidth - 8;
            // prefer to vertically center the dropdown relative to the button
            let top = rect.top + (rect.height / 2) - (dropdownHeight / 2);
            // if centering pushes it out of viewport, fall back to below or clamp
            if (top < 8) {
                top = rect.bottom + 6; // place below
            }
            if (top + dropdownHeight > window.innerHeight - 8) {
                top = Math.max(8, window.innerHeight - dropdownHeight - 8);
            }
            setDropdownStyle({ position: 'fixed', left: `${left}px`, top: `${top}px`, zIndex: 9999 });
        } else {
            setDropdownStyle(null);
        }
    }, [menuOpen]);
    
    return (
        <div className="p-4 flex flex-col h-full">
            <div className="flex-grow flex flex-col items-center justify-center text-center space-y-3 my-3 relative">
                {currentSong ? (
                    <>
                        {/* Menu button positioned at the card top-rightmost corner (transparent background) */}
                        <div ref={menuRef} className="absolute -top-3 -right-3 z-50">
                            <button aria-label="Open menu" onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v); }} className="p-2 rounded-full bg-transparent hover:bg-black/10 text-white">
                                <MoreVertical size={18} />
                            </button>
                            {menuOpen && (
                                // render dropdown as fixed positioned element so it doesn't affect layout
                                <div style={dropdownStyle} className="w-44 bg-[#15202B] border border-[#2A3942] rounded-md shadow-lg text-left py-1">
                                    <button onClick={() => { setMenuOpen(false); onAddToQueue && onAddToQueue(currentSong, 'end'); }} className="w-full text-left px-3 py-2 hover:bg-[#121a20] text-gray-100">Add to Queue</button>
                                    <button onClick={() => { setMenuOpen(false); onAddToPlaylist && onAddToPlaylist(currentSong.id); }} className="w-full text-left px-3 py-2 hover:bg-[#121a20] text-gray-100">Add to Playlist</button>
                                    <button onClick={() => { setMenuOpen(false); onShowArtist && onShowArtist(currentSong.artist); }} className="w-full text-left px-3 py-2 hover:bg-[#121a20] text-gray-100">Artist</button>
                                    <button onClick={() => { setMenuOpen(false); onReportSong && onReportSong(currentSong.id); }} className="w-full text-left px-3 py-2 text-rose-400 hover:bg-[#121a20]">Report</button>
                                </div>
                            )}
                        </div>
                            <div className="relative">
                                <img
                                    src={currentSong.coverUrl}
                                    alt="Album Cover"
                                    className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-2xl shadow-md object-cover"
                                    onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/400x400/1F2937/FFFFFF?text=Music'; }}
                                />
                            </div>
                            <div>
                                <h2 className="text-base md:text-lg font-semibold truncate">{currentSong.title}</h2>
                                <p className="text-xs md:text-sm text-gray-400 truncate">{currentSong.artist}</p>
                            </div>
                    </>
                ) : (
                     <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl bg-gray-700/50 border border-gray-600 flex flex-col justify-center items-center p-4">
                        <Music size={48} className="text-gray-500 mb-4"/>
                        <h2 className="text-xl font-bold">No Song Selected</h2>
                        <p className="text-gray-400 text-sm">Select a song to start playing.</p>
                    </div>
                )}
            </div>
            <div className="space-y-2">
                <ProgressBar 
                    progress={progress} 
                    onProgressChange={onProgressChange} 
                    duration={duration} 
                    currentTime={currentTime} 
                />
                <div className="w-full flex items-center justify-center">
                    <Controls
                    isPlaying={isPlaying}
                    onPlayPause={onPlayPause}
                    onNext={onNext}
                    onPrev={onPrev}
                    isShuffle={isShuffle}
                    onShuffleToggle={onShuffleToggle}
                    isRepeat={isRepeat}
                    onRepeatToggle={onRepeatToggle}
                    />
                </div>
                <VolumeControl volume={volume} onVolumeChange={onVolumeChange} />
            </div>
        </div>
    );
};

export default PlayerUI;
