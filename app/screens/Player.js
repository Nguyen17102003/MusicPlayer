import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, Text, Dimensions, Image } from 'react-native';
import Screen from '../components/Screen';
import Slider from '@react-native-community/slider';
import PlayerButton from '../components/PlayerButton';
import { AudioContext } from '../context/AudioProvider';
import {
  MoveAudio,
  Pause,
  ChangeAudio,
  SelectAudio,
} from '../misc/audioController';
import { convertTime } from '../misc/helper';

const { width } = Dimensions.get('window');

const Player = () => {
  const [currentPosition, setCurrentPosition] = useState(0);
  const { soundObj, setSoundObj,
    isPlaying,
    currentAudioIndex,
    playbackObj,
    playbackPosition,
    currentAudio, setCurrentAudio,
    audioFiles,
    setCurrentAudioIndex,
    onPlaybackStatusUpdate, 
    setIsPlaying, setIsPlayListRunning,
    setActivePlayList,
    setAddToPlayList, loadPreviousAudio} = useContext(AudioContext);
  const context = {soundObj, setSoundObj,
    isPlaying,
    currentAudioIndex,
    playbackObj,
    currentAudio, setCurrentAudio,
    audioFiles,
    setCurrentAudioIndex,
    onPlaybackStatusUpdate, 
    setIsPlaying, setIsPlayListRunning,
    setActivePlayList,
    setAddToPlayList}
  const calculateSeebBar = () => {
    if (playbackPosition !== null && playbackDuration !== null) {
      return playbackPosition / playbackDuration;
    }

    if (currentAudio.lastPosition) {
      return currentAudio.lastPosition / (currentAudio.duration * 1000);
    }

    return 0;
  };

  useEffect(() => {
    loadPreviousAudio();
  }, []);

  const handlePlayPause = async () => {
    await SelectAudio(context.currentAudio, context);
  };

  const handleNext = async () => {
    await ChangeAudio(context, 'next');
  };

  const handlePrevious = async () => {
    await ChangeAudio(context, 'previous');
  };

  const renderCurrentTime = () => {
    if (!context.soundObj && currentAudio.lastPosition) {
      return convertTime(currentAudio.lastPosition / 1000);
    }
    return convertTime(context.playbackPosition / 1000);
  };
  if (!context.currentAudio) return null;

  return (
    <Screen>
      <View style = {styles.backgroundContainer}>
          <View></View>
          <Image 
          source = {require('../components/player.png')}
          resizeMode = 'cover'
          style = {styles.backdrop}
          ></Image>
        </View>
        <View style = {styles.backgroundContainer}>
        <Text numberOfLines={1} style={styles.audioTitle}>
            {context.currentAudio.filename}
          </Text>
          </View>
      <View style={styles.container}>
      <View style={styles.audioCountContainer}>
          <Text style={styles.audioCount}>{`${
            context.currentAudioIndex + 1
          } / ${context.totalAudioCount}`}</Text>
        </View>
        <View style = {styles.midBannerContainer}>
            <Image
            source = {require('../components/apple-music-logo-itunes-music-download-itunes-store-symbol-material-property-circle-computer-icon-png-clipart.png')}
            style = {styles.logo}></Image>
          </View>
        <View style = {styles.container}>
        </View>
        <View style={styles.audioPlayerContainer}>
          
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={calculateSeebBar()}
            onValueChange={value => setCurrentPosition(convertTime(value * context.currentAudio.duration))}
            minimumTrackTintColor="white"
            maximumTrackTintColor="white"
            thumbTintColor= "white"
            onSlidingStart={async () => {
              if (!context.isPlaying) return;
              try {
                await Pause(context.playbackObj);
              } catch (error) {
                console.log('error inside onSlidingStart callback', error);
              }
            }}
            onSlidingComplete={async value => {
              await MoveAudio(context, value);
              setCurrentPosition(0);
            }}
          />
          <View style={styles.audioControllers}>
            <PlayerButton iconType='PREV' onPress = {handlePrevious}/>
            <PlayerButton
              onPress={handlePlayPause}
              iconType={context.isPlaying ? 'PLAY' : 'PAUSE'}
            />
            <PlayerButton iconType='NEXT' onPress = {handleNext}/>
          </View>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  audioControllers: {
    width: width,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingBottom: 20,
  },
  audioCountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'flex-end',
    paddingTop: 30,
    paddingRight: 20,
  },
  container: {
    flex: 1,
  },
  audioCount: {
    fontWeight: 'bold',
    textAlign: 'right',
    color: 'white',
    fontSize: 20,
  },
  audioTitle: {
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    fontSize: 20,
    color: 'white',
    alignSelf: 'flex-start',
    paddingLeft: 10,
    paddingTop: 10,
  },
  slider:{
    width: width, 
    marginBottom: 20,
    transform: [{scaleY: 2}],
  },
  midBannerContainer:{
   justifyContent: 'center',
   alignItems: 'center' ,
  },
  backgroundContainer:{
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  logo:{
    marginTop: 100,
    marginRight: 10,
    width: 300,
    height: 300,
  },
  backdrop: {
    width: 400,
    flex: 1,
    flexDirection: 'column',
  }
});

export default Player;
