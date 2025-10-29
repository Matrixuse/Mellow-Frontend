import React, {useEffect, useState} from 'react';
import {SafeAreaView, View, Text, Button, StyleSheet} from 'react-native';
import TrackPlayer, {State, usePlaybackState} from 'react-native-track-player';

export default function App() {
  const [initialized, setInitialized] = useState(false);
  const playbackState = usePlaybackState();

  useEffect(() => {
    async function setup() {
      try {
        await TrackPlayer.setupPlayer();
        await TrackPlayer.updateOptions({
          stopWithApp: true,
          capabilities: [
            TrackPlayer.Capability.Play,
            TrackPlayer.Capability.Pause,
            TrackPlayer.Capability.SkipToNext,
            TrackPlayer.Capability.SkipToPrevious,
            TrackPlayer.Capability.Stop,
          ],
          compactCapabilities: [
            TrackPlayer.Capability.Play,
            TrackPlayer.Capability.Pause
          ],
        });
        setInitialized(true);
      } catch (e) {
        console.warn('TrackPlayer setup failed', e);
      }
    }
    setup();

    return () => {
      // optionally destroy player on unmount
      // TrackPlayer.destroy();
    };
  }, []);

  async function addAndPlay() {
    const track = {
      id: 'demo-track',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      title: 'Demo Song',
      artist: 'SoundHelix',
      artwork: 'https://via.placeholder.com/300.png',
      duration: 300
    };
    await TrackPlayer.reset();
    await TrackPlayer.add(track);
    await TrackPlayer.play();
  }

  async function togglePlay() {
    const state = await TrackPlayer.getState();
    if (state === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Mellow Mobile Prototype</Text>
      <View style={styles.controls}>
        <Button title="Add & Play demo track" onPress={addAndPlay} />
        <View style={{height:12}} />
        <Button title={playbackState === State.Playing ? 'Pause' : 'Play'} onPress={togglePlay} />
      </View>
      <Text style={styles.footer}>Playback state: {playbackState}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  title: {fontSize: 20, fontWeight: '600', marginBottom: 20},
  controls: {width: '80%'},
  footer: {marginTop: 20}
});
