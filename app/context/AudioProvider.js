import React, { createContext, useState, useEffect, useRef } from 'react';
import { Text, View, Alert } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { storeAudioForNextOpening } from '../misc/helper';
import { PlayNext } from '../misc/audioController';
export const AudioContext = createContext();
const AudioProvider = ({ children }) => {
  const [audioFiles, setAudioFiles] = useState([]);
  const [playList, setPlayList] = useState([]);
  const [addToPlayList, setAddToPlayList] = useState(null);
  const [permissionError, setPermissionError] = useState(false);
  const [playbackObj, setPlaybackObj] = useState(null);
  const [soundObj, setSoundObj] = useState(null);
  const [currentAudio, setCurrentAudio] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayListRunning, setIsPlayListRunning] = useState(false);
  const [activePlayList, setActivePlayList] = useState([]);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(null);
  const [playbackPosition, setPlaybackPosition] = useState(null);
  const [playbackDuration, setPlaybackDuration] = useState(null);
  const totalAudioCountRef = useRef(0);

  const permissionAlert = () => {
    Alert.alert('Permission Required', 'This app needs to read audio files!', [
      {
        text: 'I am ready',
        onPress: () => getPermission(),
      },
      {
        text: 'cancel',
        onPress: () => permissionAlert(),
      },
    ]);
  };

  const getAudioFiles = async () => {
    const media = await MediaLibrary.getAssetsAsync({
      mediaType: 'audio',
    });
    const allMedia = await MediaLibrary.getAssetsAsync({
      mediaType: 'audio',
      first: media.totalCount,
    });
    totalAudioCountRef.current = media.totalCount;

    setAudioFiles((prevAudioFiles) => [...prevAudioFiles, ...allMedia.assets]);
  };

  const loadPreviousAudio = async () => {
    let previousAudio = await AsyncStorage.getItem('previousAudio');
    let currentAudio;
    let currentIndex;

    if (previousAudio === null) {
      currentAudio = audioFiles[0];
      currentIndex = 0;
    } else {
      previousAudio = JSON.parse(previousAudio);
      currentAudio = previousAudio.audio;
      currentIndex = previousAudio.index;
    }

    setCurrentAudio(currentAudio);
    setCurrentAudioIndex(currentIndex);
  };

  const getPermission = async () => {
    const permission = await MediaLibrary.getPermissionsAsync();

    if (permission.granted) {
      getAudioFiles();
    }

    if (!permission.canAskAgain && !permission.granted) {
      setPermissionError(true);
    }

    if (!permission.granted && permission.canAskAgain) {
      const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();

      if (status === 'denied' && canAskAgain) {
        permissionAlert();
      }

      if (status === 'granted') {
        getAudioFiles();
      }

      if (status === 'denied' && !canAskAgain) {
        setPermissionError(true);
      }
    }
  };

  const onPlaybackStatusUpdate = async (playbackStatus) => {
    if (playbackStatus.isLoaded && playbackStatus.isPlaying) {
      setPlaybackPosition(playbackStatus.positionMillis);
      setPlaybackDuration(playbackStatus.durationMillis);
    }

    if (playbackStatus.isLoaded && !playbackStatus.isPlaying) {
      storeAudioForNextOpening(currentAudio, currentAudioIndex, playbackStatus.positionMillis);
    }

    if (playbackStatus.didJustFinish) {
      if (isPlayListRunning) {
        let audio;
        const indexOnPlayList = activePlayList.audios.findIndex(({ id }) => id === currentAudio.id);
        const nextIndex = indexOnPlayList + 1;
        audio = activePlayList.audios[nextIndex];

        if (!audio) audio = activePlayList.audios[0];

        const indexOnAllList = audioFiles.findIndex(({ id }) => id === audio.id);

        const status = await PlayNext(playbackObj, audio.uri);
        setSoundObj(status)
        setIsPlaying(true)
        setCurrentAudio(audio)
        setCurrentAudioIndex(indexOnAllList)
        return
      }

      const nextAudioIndex = currentAudioIndex + 1;
      if (nextAudioIndex >= totalAudioCountRef.current) {
        playbackObj.unloadAsync();
        setSoundObj(null)
        setCurrentAudio(audioFiles[0])
        setIsPlaying(false)
        setCurrentAudioIndex(0)
        setPlaybackDuration(null)
        setPlaybackDuration(null)
        await storeAudioForNextOpening(audioFiles[0], 0);
        return;
      }
      const audio = audioFiles[nextAudioIndex];
      const status = await PlayNext(playbackObj, audio.uri);
      setSoundObj(status)
      setCurrentAudio(audio)
      setIsPlaying(true)
      setCurrentAudioIndex(nextAudioIndex)
      await storeAudioForNextOpening(audio, nextAudioIndex);
    }
  };
  useEffect(() => {
    getPermission();
    if (playbackObj === null) {
      setPlaybackObj(new Audio.Sound());
    }
  }, []);

  return permissionError ? (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 25, textAlign: 'center', color: 'red' }}>
        It looks like you haven't accepted the permission.
      </Text>
    </View>
  ) : (
    <AudioContext.Provider
      value={{
        audioFiles, setAudioFiles,
        playList, setPlayList,
        addToPlayList, setAddToPlayList,
        playbackObj, setPlaybackObj,
        soundObj, setSoundObj,
        currentAudio, setCurrentAudio,
        isPlaying, setIsPlaying,
        currentAudioIndex, setCurrentAudioIndex,
        totalAudioCount: totalAudioCountRef.current,
        playbackPosition, setPlaybackPosition,
        playbackDuration, setPlaybackDuration,
        isPlayListRunning, setIsPlayListRunning,
        activePlayList, setActivePlayList,
        getAudioFiles,
        getPermission,
        permissionAlert,
        loadPreviousAudio,
        onPlaybackStatusUpdate,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

//export class AudioProvider extends Component {
//    constructor(props) {
//      super(props);
//      this.state = {
//        audioFiles: [],
//        playList: [],
//        addToPlayList: null,
//        permissionError: false,
//        dataProvider: new DataProvider((r1, r2) => r1 !== r2),
//        playbackObj: null,
//        soundObj: null,
//        currentAudio: {},
//        isPlaying: false,
//        isPlayListRunning: false,
//        activePlayList: [],
//        currentAudioIndex: null,
//        playbackPosition: null,
//        playbackDuration: null,
//      };
//      this.totalAudioCount = 0;
//    }
//    permissionAllert = () => {
//      Alert.alert('Permission Required', 'This app needs to read audio files!', [
//        {
//          text: 'I am ready',
//          onPress: () => this.getPermission(),
//        },
//        {
//          text: 'cancle',
//          onPress: () => this.permissionAllert(),
//        },
//      ]);
//    };
//  
//    getAudioFiles = async () => {
//      const { dataProvider, audioFiles } = this.state;
//      let media = await MediaLibrary.getAssetsAsync({
//        mediaType: 'audio',
//      });
//      media = await MediaLibrary.getAssetsAsync({
//        mediaType: 'audio',
//        first: media.totalCount,
//      });
//      this.totalAudioCount = media.totalCount;
//  
//      this.setState({
//        ...this.state,
//        dataProvider: dataProvider.cloneWithRows([
//          ...audioFiles,
//          ...media.assets,
//        ]),
//      });
//    };
//  
//    loadPreviousAudio = async () => {
//      let previousAudio = await AsyncStorage.getItem('previousAudio');
//      let currentAudio;
//      let currentAudioIndex;
//  
//      if (previousAudio === null) {
//        currentAudio = this.state.audioFiles[0];
//        currentAudioIndex = 0;
//      } else {
//        previousAudio = JSON.parse(previousAudio);
//        currentAudio = previousAudio.audio;
//        currentAudioIndex = previousAudio.index;
//      }
//  
//      this.setState({ ...this.state, currentAudio, currentAudioIndex });
//    };
//  
//    getPermission = async () => {
//
//      const permission = await MediaLibrary.getPermissionsAsync();
//      if (permission.granted) {
//        this.getAudioFiles();
//      }
//  
//      if (!permission.canAskAgain && !permission.granted) {
//        this.setState({ ...this.state, permissionError: true });
//      }
//  
//      if (!permission.granted && permission.canAskAgain) {
//        const { status, canAskAgain } =
//          await MediaLibrary.requestPermissionsAsync();
//        if (status === 'denied' && canAskAgain) {
//          this.permissionAllert();
//        }
//  
//        if (status === 'granted') {
//          this.getAudioFiles();
//        }
//  
//        if (status === 'denied' && !canAskAgain) {
//          this.setState({ ...this.state, permissionError: true });
//        }
//      }
//    };
//  
//    onPlaybackStatusUpdate = async playbackStatus => {
//      if (playbackStatus.isLoaded && playbackStatus.isPlaying) {
//        this.updateState(this, {
//          playbackPosition: playbackStatus.positionMillis,
//          playbackDuration: playbackStatus.durationMillis,
//        });
//      }
//  
//      if (playbackStatus.isLoaded && !playbackStatus.isPlaying) {
//        storeAudioForNextOpening(
//          this.state.currentAudio,
//          this.state.currentAudioIndex,
//          playbackStatus.positionMillis
//        );
//      }
//  
//      if (playbackStatus.didJustFinish) {
//        if (this.state.isPlayListRunning) {
//          let audio;
//          const indexOnPlayList = this.state.activePlayList.audios.findIndex(
//            ({ id }) => id === this.state.currentAudio.id
//          );
//          const nextIndex = indexOnPlayList + 1;
//          audio = this.state.activePlayList.audios[nextIndex];
//  
//          if (!audio) audio = this.state.activePlayList.audios[0];
//  
//          const indexOnAllList = this.state.audioFiles.findIndex(
//            ({ id }) => id === audio.id
//          );
//  
//          const status = await PlayNext(this.state.playbackObj, audio.uri);
//          return this.updateState(this, {
//            soundObj: status,
//            isPlaying: true,
//            currentAudio: audio,
//            currentAudioIndex: indexOnAllList,
//          });
//        }
//  
//        const nextAudioIndex = this.state.currentAudioIndex + 1;
//        if (nextAudioIndex >= this.totalAudioCount) {
//          this.state.playbackObj.unloadAsync();
//          this.updateState(this, {
//            soundObj: null,
//            currentAudio: this.state.audioFiles[0],
//            isPlaying: false,
//            currentAudioIndex: 0,
//            playbackPosition: null,
//            playbackDuration: null,
//          });
//          return await storeAudioForNextOpening(this.state.audioFiles[0], 0);
//        }
//        const audio = this.state.audioFiles[nextAudioIndex];
//        const status = await PlayNext(this.state.playbackObj, audio.uri);
//        this.updateState(this, {
//          soundObj: status,
//          currentAudio: audio,
//          isPlaying: true,
//          currentAudioIndex: nextAudioIndex,
//        });
//        await storeAudioForNextOpening(audio, nextAudioIndex);
//      }
//    };
//  
//    componentDidMount() {
//      this.getPermission();
//      if (this.state.playbackObj === null) {
//        this.setState({ ...this.state, playbackObj: new Audio.Sound()});
//      }
//    }
//  
//    updateState = (prevState, newState = {}) => {
//      this.setState({ ...prevState, ...newState });
//    };
//  
//    render() {
//      const {
//        audioFiles,
//        playList,
//        addToPlayList,
//        dataProvider,
//        permissionError,
//        playbackObj,
//        soundObj,
//        currentAudio,
//        isPlaying,
//        currentAudioIndex,
//        playbackPosition,
//        playbackDuration,
//        isPlayListRunning,
//        activePlayList,
//      } = this.state;
//      if (permissionError)
//        return (
//          <View
//            style={{
//              flex: 1,
//              justifyContent: 'center',
//              alignItems: 'center',
//            }}
//          >
//            <Text style={{ fontSize: 25, textAlign: 'center', color: 'red' }}>
//              It looks like you haven't accept the permission.
//            </Text>
//          </View>
//        );
//      return (
//        <AudioContext.Provider
//          value={{
//            audioFiles,
//            playList,
//            addToPlayList,
//            dataProvider,
//            playbackObj,
//            soundObj,
//            currentAudio,
//            isPlaying,
//            currentAudioIndex,
//            totalAudioCount: this.totalAudioCount,
//            playbackPosition,
//            playbackDuration,
//            isPlayListRunning,
//            activePlayList,
//            updateState: this.updateState,
//            loadPreviousAudio: this.loadPreviousAudio,
//            onPlaybackStatusUpdate: this.onPlaybackStatusUpdate,
//          }}
//        >
//          {this.props.children}
//        </AudioContext.Provider>
//      );
//    }
//  }
//  
  export default AudioProvider;
  