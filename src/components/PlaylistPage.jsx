import React from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import PlaylistView from './PlaylistView';

const PlaylistPage = () => {
    const { id } = useParams();
    const outlet = useOutletContext() || {};
    const navigate = useNavigate();

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

    const handlers = {
        onPlaySong: outlet.onSelectSong,
        onPlayPlaylist: (playlist) => {
            // fallback: play first song
            if (outlet.onSelectSong && Array.isArray(playlist.songs) && playlist.songs.length > 0) {
                outlet.onSelectSong(playlist.songs[0].id);
            }
        },
        currentSongId: outlet.currentSongId,
        isPlaying: outlet.isPlaying,
        onClose: () => navigate('/playlists')
    };

    return (
        <PlaylistView
            playlistId={id}
            user={user}
            onPlaySong={handlers.onPlaySong}
            onPlayPlaylist={handlers.onPlayPlaylist}
            currentSongId={handlers.currentSongId}
            isPlaying={handlers.isPlaying}
            onClose={handlers.onClose}
        />
    );
};

export default PlaylistPage;
