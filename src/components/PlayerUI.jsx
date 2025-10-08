import React from 'react';
import { Controls, ProgressBar, VolumeControl } from './OtherComponents';
import { Music } from 'lucide-react';

const PlayerUI = ({ 
    currentSong, isPlaying, onPlayPause, onNext, onPrev, 
    progress, onProgressChange, duration, currentTime,
    volume, onVolumeChange,
    isShuffle, onShuffleToggle, isRepeat, onRepeatToggle
}) => {
    
    return (
        <div className="p-6 flex flex-col h-full">
            <div className="flex-grow flex flex-col items-center justify-center text-center space-y-4 my-4">
                {currentSong ? (
                    <>
                        <img 
                            src={currentSong.coverUrl} 
                            alt="Album Cover" 
                            className="w-48 h-48 md:w-64 md:h-64 rounded-2xl shadow-lg object-cover"
                            onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/400x400/1F2937/FFFFFF?text=Music'; }}
                        />
                        <div>
                            <h2 className="text-2xl font-bold truncate">{currentSong.title}</h2>
                            <p className="text-md text-gray-400 truncate">{currentSong.artist}</p>
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
            <div className="space-y-4">
                <ProgressBar 
                    progress={progress} 
                    onProgressChange={onProgressChange} 
                    duration={duration} 
                    currentTime={currentTime} 
                />
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
                <VolumeControl volume={volume} onVolumeChange={onVolumeChange} />
            </div>
        </div>
    );
};

export default PlayerUI;
