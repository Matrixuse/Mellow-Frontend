import React from 'react';
import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const topArtists = [
    { name: 'KK', imageUrl: '/artists/KK.png' },
    { name: 'Arijit Singh', imageUrl: '/artists/arijit.png' },
    { name: 'Shreya Ghoshal', imageUrl: '/artists/shreya.png' },
    { name: 'Pritam', imageUrl: '/artists/pritam.png' },
    { name: 'A.R. Rahman', imageUrl: '/artists/arrahman.png' },
    { name: 'Lata Mangeshkar', imageUrl: '/artists/lata.png' },
    { name: 'Yo Yo Honey Singh', imageUrl: '/artists/honeysingh.png' },
    { name: 'Sunidhi Chauhan', imageUrl: '/artists/sunidhichauhan.png' },
    { name: 'Mohit Chauhan', imageUrl: '/artists/mohitchauhan.png' },
    { name: 'Sonu Nigam', imageUrl: '/artists/sonunigam.png' },
    { name: 'Sachin-Jigar', imageUrl: '/artists/sachinjigar.png' },
    { name: 'Neha Kakkar', imageUrl: '/artists/nehakakkar.png' },
    { name: 'Atif Aslam', imageUrl: '/artists/atifaslam.png' },
    { name: 'Udit Narayan', imageUrl: '/artists/uditnarayan.png' },
    { name: 'Vishal-Shekhar', imageUrl: '/artists/vishalshekhar.png' },
    { name: 'Shubh', imageUrl: '/artists/shubh.png' },
    { name: 'Guru Radhawa', imageUrl: '/artists/gururandhawa.png' },
    { name: 'Baadshah', imageUrl: '/artists/baadshah.png' },
];

const TopArtists = () => (
    <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">Top Artists</h3>
        <div className="grid grid-flow-col auto-cols-[8rem] sm:auto-cols-[12rem] gap-6 overflow-x-auto custom-scrollbar-h pb-4">
            {topArtists.map((artist) => (
                <Link to={`/artist/${encodeURIComponent(artist.name)}`} key={artist.name} className="flex flex-col items-center gap-3 cursor-pointer group">
                    <img
                        src={process.env.PUBLIC_URL + artist.imageUrl}
                        alt={artist.name}
                        className="w-24 h-24 sm:w-40 sm:h-40 rounded-full object-cover shadow-lg transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/200x200/4A5568/FFFFFF?text=${artist.name.charAt(0)}`; }}
                    />
                    <div className="text-center">
                        <p className="text-sm sm:text-base font-semibold truncate w-full">{artist.name}</p>
                        <p className="text-xs sm:text-sm text-gray-400 truncate">Artist</p>
                    </div>
                </Link>
            ))}
        </div>
    </div>
);


const SongLibrary = ({ songs, onSelectSong, currentSongId, isPlaying }) => {
    return (
        <div>
            {/* Mobile order: Recently Uploaded then Top Artists */}
            <div className="md:hidden">
                <h3 className="text-xl font-bold mb-4">Recently Uploaded</h3>
                {songs.length === 0 ? (
                    <div className="text-center text-gray-400 mt-10">
                        <p>Your library is empty. Upload songs through the admin panel.</p>
                    </div>
                ) : (
                    <>
                        {/* Mobile: horizontal bars list limited to 5 items */}
                        <div className="md:hidden space-y-2.5">
                            {songs.slice(0, 5).map((song) => (
                                <button
                                    key={song.id}
                                    onClick={() => onSelectSong(song.id)}
                                    className="w-full flex items-center gap-2 bg-gray-800/60 hover:bg-gray-700/80 p-2 rounded-lg transition"
                                >
                                    <img
                                        src={song.coverUrl}
                                        alt={song.title}
                                        className="w-10 h-10 rounded-md object-cover"
                                        onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/200x200/1F2937/FFFFFF?text=Music'; }}
                                    />
                                    <div className="flex-1 text-left">
                                        <div className="text-sm font-semibold truncate">{song.title}</div>
                                        <div className="text-xs text-gray-400 truncate">{song.artist}</div>
                                    </div>
                                    {currentSongId === song.id && isPlaying && (
                                        <Play className="text-blue-400" size={18} />
                                    )}
                                </button>
                            ))}
                        </div>
                        {/* Desktop/tablet: keep previous horizontal card scroller */}
                        <div className="hidden md:grid grid-rows-2 grid-flow-col auto-cols-[10rem] sm:auto-cols-[11rem] gap-4 overflow-x-auto custom-scrollbar-h pb-4">
                            {songs.map((song) => (
                                <div 
                                    key={song.id} 
                                    onClick={() => onSelectSong(song.id)}
                                    className="group relative bg-gray-800/50 hover:bg-gray-700/80 p-4 rounded-lg cursor-pointer transition-all duration-300 flex flex-col"
                                >
                                    <div className="relative mb-3">
                                        <img 
                                            src={song.coverUrl} 
                                            alt={song.title} 
                                            className="w-full h-auto aspect-square rounded-md object-cover" 
                                            onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/400x400/1F2937/FFFFFF?text=Music'; }}
                                        />
                                        <div className={`absolute bottom-2 right-2 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg transform transition-all duration-300 ${currentSongId === song.id && isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'}`}>
                                            <Play size={24} className="text-white fill-current" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-start flex-grow">
                                        <h4 className="text-sm font-semibold text-white truncate">{song.title}</h4>
                                        <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
                {/* Top Artists visible on mobile below Recently Uploaded */}
                <div className="mt-6">
                    <TopArtists />
                </div>
            </div>
            {/* Desktop/Tablet order: Top Artists then Recently Uploaded */}
            <div className="hidden md:block">
                <TopArtists />
                <div className="mt-6">
                    <h3 className="text-xl font-bold mb-4">Recently Uploaded</h3>
                    {songs.length === 0 ? (
                        <div className="text-center text-gray-400 mt-10">
                            <p>Your library is empty. Upload songs through the admin panel.</p>
                        </div>
                    ) : (
                        <div className="grid grid-rows-2 grid-flow-col auto-cols-[10rem] sm:auto-cols-[11rem] gap-4 overflow-x-auto custom-scrollbar-h pb-4">
                            {songs.map((song) => (
                                <div 
                                    key={song.id} 
                                    onClick={() => onSelectSong(song.id)}
                                    className="group relative bg-gray-800/50 hover:bg-gray-700/80 p-4 rounded-lg cursor-pointer transition-all duration-300 flex flex-col"
                                >
                                    <div className="relative mb-3">
                                        <img 
                                            src={song.coverUrl} 
                                            alt={song.title} 
                                            className="w-full h-auto aspect-square rounded-md object-cover" 
                                            onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/400x400/1F2937/FFFFFF?text=Music'; }}
                                        />
                                        <div className={`absolute bottom-2 right-2 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg transform transition-all duration-300 ${currentSongId === song.id && isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'}`}>
                                            <Play size={24} className="text-white fill-current" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-start flex-grow">
                                        <h4 className="text-sm font-semibold text-white truncate">{song.title}</h4>
                                        <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SongLibrary;

