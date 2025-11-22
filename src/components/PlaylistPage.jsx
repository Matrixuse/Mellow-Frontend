import React, { useCallback, useMemo } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import PlaylistView from './PlaylistView';
import queueService from '../services/queueService';

const PlaylistPage = () => {
    const { id } = useParams();
    const outlet = useOutletContext();
    const stableOutlet = useMemo(() => outlet || {}, [outlet]);
    const navigate = useNavigate();
    
    // Play a song from a playlist, setting the queue to that playlist's songs
    const handlePlaySongFromPlaylist = useCallback((songId, playlist) => {
        if (!playlist || !playlist.songs || !Array.isArray(playlist.songs)) return;
        queueService.clearQueue();
        queueService.addToQueue(playlist.songs, 'end');
        // Find index of songId in playlist
        const idx = playlist.songs.findIndex(s => String(s.id) === String(songId));
        if (idx >= 0) {
            if (stableOutlet.onSelectSong) stableOutlet.onSelectSong(playlist.songs[idx].id);
        }
    }, [stableOutlet]);

    // Play entire playlist from the first song
    const handlePlayPlaylist = useCallback((playlist) => {
        if (!playlist || !playlist.songs || !Array.isArray(playlist.songs) || playlist.songs.length === 0) return;
        queueService.clearQueue();
        queueService.addToQueue(playlist.songs, 'end');
        if (stableOutlet.onSelectSong) stableOutlet.onSelectSong(playlist.songs[0].id);
    }, [stableOutlet]);

    // Handler for adding a song to the queue from a playlist context
    const handleAddToQueueFromPlaylist = useCallback((song, playlist) => {
        if (playlist && playlist.songs && Array.isArray(playlist.songs)) {
            queueService.addToQueue([song], 'end');
        }
    }, []);

    // Prefer outlet user (provided by App via Outlet context). If not available (some navigation flows),
    // fall back to reading from localStorage so the page still works after refresh/navigation.
    let user = outlet.user || null;
    if (!user) {
        try {
            const stored = localStorage.getItem('user');
            if (stored) {
                user = JSON.parse(stored);
            }
        } catch (e) {
            // ignore parse errors
        }
    }

    // If still no user, show a small prompt asking the user to connect/login.
    if (!user || !user.token) {
        return (
            <div className="h-full flex items-center justify-center p-6">
                <div className="bg-gray-900 rounded-lg border border-gray-700 p-6 text-center max-w-md">
                    <h2 className="text-xl font-semibold mb-3">Please connect to view this playlist</h2>
                    <p className="text-gray-400 mb-4">You need to be signed in to view and manage playlists.</p>
                    <div className="flex items-center justify-center gap-3">
                        <button onClick={() => navigate('/')} className="px-4 py-2 bg-blue-600 rounded-md text-white">Go to Login</button>
                        <button onClick={() => window.location.href = '/'} className="px-4 py-2 bg-transparent border border-gray-700 rounded-md text-gray-300">Home</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <PlaylistView
            playlistId={id}
            user={user}
            onPlaySong={(songId, playlist) => handlePlaySongFromPlaylist(songId, playlist)}
            onPlayPlaylist={handlePlayPlaylist}
            onAddToQueue={handleAddToQueueFromPlaylist}
            currentSongId={outlet.currentSongId}
            isPlaying={outlet.isPlaying}
            onClose={() => navigate('/playlists')}
        />
    );
};

export default PlaylistPage;
