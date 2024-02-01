import { storeAudioForNextOpening } from './helper';
// play audio
export const Play = async (playbackObj, uri, lastPosition) => {
  try {
    if (!lastPosition)
      return await playbackObj.loadAsync(
        { uri },
        { shouldPlay: true, progressUpdateIntervalMillis: 1000 }
      );

    await playbackObj.loadAsync(
      { uri },
      { progressUpdateIntervalMillis: 1000 }
    );

    return await playbackObj.playFromPositionAsync(lastPosition);
  } catch (error) {
    console.log('error inside play helper method', error.message);
  }
};

// pause audio
export const Pause = async playbackObj => {
  try {
    return await playbackObj.setStatusAsync({
      shouldPlay: false,
    });
  } catch (error) {
    console.log('error inside pause helper method', error.message);
  }
};

// resume audio
export const Resume = async playbackObj => {
  try {
    return await playbackObj.playAsync();
  } catch (error) {
    console.log('error inside resume helper method', error.message);
  }
};

// select another audio
export const PlayNext = async (playbackObj, uri) => {
  try {
    await playbackObj.stopAsync();
    await playbackObj.unloadAsync();
    return await Play(playbackObj, uri);
  } catch (error) {
    console.log('error inside playNext helper method', error.message);
  }
};

export const SelectAudio = async (audio, context, playListInfo = {}) => {
  const {
    soundObj, setSoundObj,
    playbackObj,
    currentAudio, setCurrentAudio,
    audioFiles,
    setCurrentAudioIndex,
    onPlaybackStatusUpdate, 
    setIsPlaying, setIsPlayListRunning,
    setActivePlayList
  } = context;
  try {
    if (soundObj === null) {
      const status = await Play(playbackObj, audio.uri, audio.lastPosition);
      const index = audioFiles.findIndex(({ id }) => id === audio.id);
      setSoundObj(status)
      setCurrentAudio(audio)
      setIsPlaying(true)
      setIsPlayListRunning(false)
      setActivePlayList([])
      playListInfo = [...playListInfo]
      playbackObj.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      return storeAudioForNextOpening(audio, index);
    }

    // pause audio
    if (
      soundObj.isLoaded &&
      soundObj.isPlaying &&
      currentAudio.id === audio.id
    ) {
      const status = await Pause(playbackObj);
      setSoundObj(status)
      setIsPlaying(false)
      setPlayBackPosition: status.positionMillis
      return 
    }

    // resume audio
    if (
      soundObj.isLoaded &&
      !soundObj.isPlaying &&
      currentAudio.id === audio.id
    ) {
      const status = await Resume(playbackObj);
      setSoundObj(status)
      setIsPlaying(true)
      return;
    }

    // select another audio
    if (soundObj.isLoaded && currentAudio.id !== audio.id) {
      const status = await PlayNext(playbackObj, audio.uri);
      const index = audioFiles.findIndex(({ id }) => id === audio.id);
      setCurrentAudio(audio)
      setSoundObj(status)
      setIsPlaying(true)
      setCurrentAudioIndex(index)
      setActivePlayList([])
      playListInfo = [...playListInfo]
      return storeAudioForNextOpening(audio, index);
    }
  } catch (error) {
    console.log('error inside select audio method.', error.message);
  }
};

const SelectAudioFromPlayList = async (context, select) => {
  const { 
    activePlayList,
    setSoundObj,
    setIsPlaying,
    currentAudio, setCurrentAudio,
    setCurrentAudioIndex,
    audioFiles,
    playbackObj} =
    context;
  let audio;
  let defaultIndex;
  let nextIndex;

  const indexOnPlayList = activePlayList.audios.findIndex(
    ({ id }) => id === currentAudio.id
  );

  if (select === 'next') {
    nextIndex = indexOnPlayList + 1;
    defaultIndex = 0;
  }

  if (select === 'previous') {
    nextIndex = indexOnPlayList - 1;
    defaultIndex = activePlayList.audios.length - 1;
  }
  audio = activePlayList.audios[nextIndex];

  if (!audio) audio = activePlayList.audios[defaultIndex];

  const indexOnAllList = audioFiles.findIndex(({ id }) => id === audio.id);

  const status = await PlayNext(playbackObj, audio.uri);
  setSoundObj(status)
  setIsPlaying(true)
  setCurrentAudio(audio)
  setCurrentAudioIndex(indexOnAllList)
  return
};

export const ChangeAudio = async (context, select) => {
  const {
    playbackObj,
    setCurrentAudio,
    currentAudioIndex, setCurrentAudioIndex,
    totalAudioCount,
    audioFiles,
    isPlayListRunning,
    setPlaybackPosition, setPlaybackDuration
  } = context;

  if (isPlayListRunning) return SelectAudioFromPlayList(context, select);

  try {
    const { isLoaded } = await playbackObj.getStatusAsync();
    const isLastAudio = currentAudioIndex + 1 === totalAudioCount;
    const isFirstAudio = currentAudioIndex <= 0;
    let audio;
    let index;
    let status;

    // for next
    if (select === 'next') {
      audio = audioFiles[currentAudioIndex + 1];
      if (!isLoaded && !isLastAudio) {
        index = currentAudioIndex + 1;
        status = await Play(playbackObj, audio.uri);
        playbackObj.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      }

      if (isLoaded && !isLastAudio) {
        index = currentAudioIndex + 1;
        status = await PlayNext(playbackObj, audio.uri);
      }

      if (isLastAudio) {
        index = 0;
        audio = audioFiles[index];
        if (isLoaded) {
          status = await PlayNext(playbackObj, audio.uri);
        } else {
          status = await Play(playbackObj, audio.uri);
        }
      }
    }

    // for previous
    if (select === 'previous') {
      audio = audioFiles[currentAudioIndex - 1];
      if (!isLoaded && !isFirstAudio) {
        index = currentAudioIndex - 1;
        status = await Play(playbackObj, audio.uri);
        playbackObj.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      }

      if (isLoaded && !isFirstAudio) {
        index = currentAudioIndex - 1;
        status = await PlayNext(playbackObj, audio.uri);
      }

      if (isFirstAudio) {
        index = totalAudioCount - 1;
        audio = audioFiles[index];
        if (isLoaded) {
          status = await PlayNext(playbackObj, audio.uri);
        } else {
          status = await Play(playbackObj, audio.uri);
        }
      }
    }
    setCurrentAudio(audio)
    setSoundObj(status)
    setIsPlaying(true)
    setCurrentAudioIndex(index)
    setPlaybackPosition(null)
    setPlaybackDuration(null)
    storeAudioForNextOpening(audio, index);
  } catch (error) {
    console.log('error inside change audio method.', error.message);
  }
};

export const MoveAudio = async (context, value) => {
  const { 
    soundObj, setSoundObj,
    isPlaying,
    playbackObj,
    setPlayBackPosition} = context;
  if (soundObj === null || !isPlaying) return;

  try {
    const status = await playbackObj.setPositionAsync(
      Math.floor(soundObj.durationMillis * value)
    );
    setSoundObj(status)
    setPlayBackPosition(status.positionMillis)
    await Resume(playbackObj);
  } catch (error) {
    console.log('error inside onSlidingComplete callback', error);
  }
};
