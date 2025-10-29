import TrackPlayer from 'react-native-track-player';

export const playbackService = async function() {
  // This file runs in the background JS context. Use event handlers to respond to media buttons.
  TrackPlayer.addEventListener('remote-play', async () => {
    await TrackPlayer.play();
  });

  TrackPlayer.addEventListener('remote-pause', async () => {
    await TrackPlayer.pause();
  });

  TrackPlayer.addEventListener('remote-next', async () => {
    try { await TrackPlayer.skipToNext(); } catch (e) {}
  });

  TrackPlayer.addEventListener('remote-previous', async () => {
    try { await TrackPlayer.skipToPrevious(); } catch (e) {}
  });

  TrackPlayer.addEventListener('remote-stop', async () => {
    await TrackPlayer.stop();
  });

  // Optionally handle playback-state or position updates here as needed.
};
