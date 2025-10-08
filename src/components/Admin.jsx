import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { login } from '../api/authService';

// --- Admin Login Form ---
const AdminLoginForm = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        if (username === 'Admin' && email === 'namansdnasharma1486@gmail.com' && password === 'Naman@Admin04') {
            try {
                const loginData = await login({ email, password });
                localStorage.setItem('user', JSON.stringify(loginData));
                onLogin();
            } catch (err) {
                setError('Admin authentication failed. Make sure this user is registered in your app.');
            }
        } else {
            setError('Invalid credentials. Please try again.');
        }
        setIsLoading(false);
    };

    return (
        <form onSubmit={handleAdminLogin} className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Admin Access</h3>
            <div><label className="text-sm font-medium text-gray-300">Username</label><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md" required /></div>
            <div><label className="text-sm font-medium text-gray-300">Email ID</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md" required /></div>
            <div><label className="text-sm font-medium text-gray-300">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md" required /></div>
            {error && <p className="text-sm text-red-400 text-center">{error}</p>}
            <button type="submit" disabled={isLoading} className="w-full py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-500">{isLoading ? 'Authenticating...' : 'Login as Admin'}</button>
        </form>
    );
};

// --- Song Upload Form (with Manual Inputs) ---
const UploadSongForm = ({ onSongUploaded }) => {
    const [songFile, setSongFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!songFile || !coverFile || !title || !artist) {
            setMessage('Please fill all fields.');
            return;
        }
        setIsLoading(true);
        setMessage('');

        const formData = new FormData();
        formData.append('songFile', songFile);
        formData.append('coverFile', coverFile);
        // Hum title aur artist ko bhi form data mein bhej rahe hain
        formData.append('title', title);
        formData.append('artist', artist);

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.token) throw new Error('Authentication token not found.');

            const response = await fetch('http://localhost:5000/api/songs/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${user.token}` },
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Upload failed');
            
            setMessage(`Success! "${data.title}" has been uploaded.`);
            e.target.reset(); // Form clear karna
            setSongFile(null);
            setCoverFile(null);
            setTitle('');
            setArtist('');
            
            if (onSongUploaded) {
                onSongUploaded(data);
            }

        } catch (err) {
            setMessage(`Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleUpload} className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Upload New Song</h3>
            {/* File Inputs */}
            <div><label className="text-sm font-medium text-gray-300">Select Song (MP3)</label><input type="file" accept=".mp3" onChange={(e) => setSongFile(e.target.files[0])} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" required /></div>
            <div><label className="text-sm font-medium text-gray-300">Select Cover Art (JPG, PNG)</label><input type="file" accept="image/jpeg, image/png" onChange={(e) => setCoverFile(e.target.files[0])} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" required /></div>
            
            {/* Naye Text Inputs */}
            <div><label className="text-sm font-medium text-gray-300">Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md" placeholder="Enter song title" required /></div>
            <div><label className="text-sm font-medium text-gray-300">Artist</label><input type="text" value={artist} onChange={(e) => setArtist(e.target.value)} className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md" placeholder="Enter artist names (comma-separated)" required /></div>

            {message && <p className={`text-sm text-center ${message.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>{message}</p>}
            <button type="submit" disabled={isLoading} className="w-full py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-500 flex items-center justify-center gap-2">
                <Upload size={16} /> {isLoading ? 'Uploading...' : 'Upload Song'}
            </button>
        </form>
    );
};

// --- Main Admin Panel ---
const AdminPanel = ({ onClose, onSongUploaded }) => {
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    return (
        <div className="relative w-full max-w-lg p-8 space-y-6 bg-gray-800 rounded-lg shadow-2xl border border-gray-700">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
            {!isAdminLoggedIn ? (
                <AdminLoginForm onLogin={() => setIsAdminLoggedIn(true)} />
            ) : (
                <UploadSongForm onSongUploaded={onSongUploaded} />
            )}
        </div>
    );
};

export default AdminPanel;

