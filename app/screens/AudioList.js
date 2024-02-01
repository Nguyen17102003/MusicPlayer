import React, { useState, useContext } from 'react';
import { View, Image, Dimensions, FlatList, StyleSheet } from 'react-native';
import { AudioContext } from '../context/AudioProvider'; 
import AudioListItem from '../components/AudioListItem';; 
import OptionModal from '../components/OptionModal'; 
import Screen from '../components/Screen'; 
import { SelectAudio, handleAudioPress,  } from '../misc/audioController';
const AudioList = () => {
  const { soundObj, setSoundObj,
    isPlaying,
    currentAudioIndex,
    playbackObj,
    currentAudio, setCurrentAudio,
    audioFiles,
    setCurrentAudioIndex,
    onPlaybackStatusUpdate, 
    setIsPlaying, setIsPlayListRunning,
    setActivePlayList,
    setAddToPlayList} = useContext(AudioContext);
  const [optionModalVisible, setOptionModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState({});

  const handleAudioPress = async (audio) => {
    const context = { soundObj, setSoundObj,
      playbackObj,
      currentAudio, setCurrentAudio,
      audioFiles,
      setCurrentAudioIndex,
      onPlaybackStatusUpdate, 
      setIsPlaying, setIsPlayListRunning,
      setActivePlayList}
    await SelectAudio(audio, context);
  };

  const rowRenderer = ({ item, index }) => (
    <AudioListItem
      title={item.filename}
      isPlaying={isPlaying}
      activeListItem={currentAudioIndex === index}
      duration={item.duration}
      onAudioPress={() => handleAudioPress(item)}
      onOptionPress={() => {
        setCurrentItem(item);
        setOptionModalVisible(true);
      }}
    />
  );

  const navigateToPlaylist = () => {
    setAddToPlayList(currentItem);
    props.navigation.navigate('PlayList');
  };

  return (
    <Screen>
      <View style={styles.backgroundContainer}>
        <Image
          source={require('../components/music_thinkstockphotos.png')}
          resizeMode="cover"
          style={styles.backdrop}
        />
      </View>
      <FlatList
        data={audioFiles}
        keyExtractor={(item, index) => index.toString()}
        renderItem={rowRenderer}
        extraData={isPlaying}
      />
      <OptionModal
        options={[
          {
            title: 'Add to playlist',
            onPress: navigateToPlaylist,
          },
        ]}
        currentItem={currentItem}
        onClose={() => setOptionModalVisible(false)}
        visible={optionModalVisible}
      />
    </Screen>
  );
};

//export class AudioList extends Component {
//  static contextType = AudioContext;
//
//  constructor(props) {
//    super(props);
//    this.state = {
//      optionModalVisible: false,
//    };
//
//    this.currentItem = {};
//  }
//
//  layoutProvider = new LayoutProvider(
//    i => 'audio',
//    (type, dim) => {
//      switch (type) {
//        case 'audio':
//          dim.width = Dimensions.get('window').width;
//          dim.height = 70;
//          break;
//        default:
//          dim.width = 0;
//          dim.height = 0;
//      }
//    }
//  );
//
//
//  handleAudioPress = async audio => {
//    await SelectAudio(audio, this.context);
//  };
//
//  componentDidMount() {
//    this.context.loadPreviousAudio();
//  }
//
//  rowRenderer = (type, item, index, extendedState) => {
//    return (
//      <AudioListItem
//        title={item.filename}
//        isPlaying={extendedState.isPlaying}
//        activeListItem={this.context.currentAudioIndex === index}
//        duration={item.duration}
//        onAudioPress={() => this.handleAudioPress(item)}
//        onOptionPress={() => {
//          this.currentItem = item;
//          this.setState({ ...this.state, optionModalVisible: true });
//        }}
//      />
//    );
//  };
//
//  navigateToPlaylist = () => {
//    this.context.updateState(this.context, {
//      addToPlayList: this.currentItem,
//    });
//    this.props.navigation.navigate('PlayList');
//  };
//
//  render() {
//    return (
//      <AudioContext.Consumer>
//        {({ dataProvider, isPlaying }) => {
//          if (!dataProvider._data.length) return null;
//          return (
//            <Screen>
//              <View style = {styles.backgroundContainer}>
//                <Image 
//                source = {require('../components/music_thinkstockphotos.png')}
//                resizeMode = 'cover'
//                style = {styles.backdrop}
//                ></Image>
//              </View>
//              <RecyclerListView
//                dataProvider={dataProvider}
//                layoutProvider={this.layoutProvider}
//                rowRenderer={this.rowRenderer}
//                extendedState={{ isPlaying }}
//              />
//              <OptionModal
//                options={[
//                  {
//                    title: 'Add to playlist',
//                    onPress: this.navigateToPlaylist,
//                  },
//                ]}
//                currentItem={this.currentItem}
//                onClose={() =>
//                  this.setState({ ...this.state, optionModalVisible: false })
//                }
//                visible={this.state.optionModalVisible}
//              />
//            </Screen>
//          );
//        }}
//      </AudioContext.Consumer>
//    );
//  }
//}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    flex: 1,
    flexDirection: 'column',
  },
  backgroundContainer:{
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default AudioList;
