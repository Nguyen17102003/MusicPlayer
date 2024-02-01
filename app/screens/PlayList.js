import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useContext, useEffect, useState } from 'react';
import {
  Image,
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import PlayListInputModal from '../components/PlayListInputModal';
import { AudioContext } from '../context/AudioProvider';
import color from '../misc/color';
import PlayListDetail from '../components/PlayListDetail';

let selectedPlayList = {};
const PlayList = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [showPlayList, setShowPlayList] = useState(false);
  const [context, setContext] = useState(null);
  const {
    addToPlayList, setAddToPlayList, 
    playList, setPlayList} = useContext(AudioContext);

  const createPlayList = async playListName => {
    const result = await AsyncStorage.getItem('playlist');
    if (result !== null) {
      const audios = [];
      if (addToPlayList) {
        audios.push(addToPlayList);
      }
      const newList = {
        id: Date.now(),
        title: playListName,
        audios: audios,
      };

      const updatedList = [...playList, newList];
      setAddToPlayList(null)
      setPlayList(updatedList)
      await AsyncStorage.setItem('playlist', JSON.stringify(updatedList));
    }
    setModalVisible(false);
  };

  const renderPlayList = async () => {
    const result = await AsyncStorage.getItem('playlist');
    if (result === null) {
      const defaultPlayList = {
        id: Date.now(),
        title: 'My Favorite',
        audios: [],
      };

      const newPlayList = [...playList, defaultPlayList];
      setPlayList([...newPlayList])
      return await AsyncStorage.setItem(
        'playlist',
        JSON.stringify([...newPlayList])
      );
    }
    setPlayList(JSON.parse(result))
  };

  useEffect(() => {
    if (!playList.length) {
      renderPlayList();
    }
  }, []);

  const handleBannerPress = async playList => {
    if (addToPlayList) {
      const result = await AsyncStorage.getItem('playlist');

      let oldList = [];
      let updatedList = [];
      let sameAudio = false;

      if (result !== null) {
        oldList = JSON.parse(result);

        updatedList = oldList.filter(list => {
          if (list.id === playList.id) {
            for (let audio of list.audios) {
              if (audio.id === addToPlayList.id) {
                sameAudio = true;
                return;
              }
            }

            list.audios = [...list.audios, addToPlayList];
          }

          return list;
        });
      }

      if (sameAudio) {
        Alert.alert(
          'Found same audio!',
          `${addToPlayList.filename} is already inside the list.`
        );
        sameAudio = false;
        return setContext({ addToPlayList: null });
      }

      setContext({ addToPlayList: null, playList: [...updatedList] });
      return AsyncStorage.setItem('playlist', JSON.stringify([...updatedList]));
    }

    selectedPlayList = playList;
  };

  return (
    <><View style={styles.backgroundContainer}>
      <View></View>
      <Image
        source={require('../components/getty_626660256_2000108620009280158_388846.png')}
        resizeMode='cover'
        style={styles.backdrop}
      ></Image>
    </View>
    <ScrollView contentContainerStyle={styles.container}>
        {playList.length
          ? playList.map(item => (
            <TouchableOpacity
              key={item.id.toString()}
              style={styles.playListBanner}
              onPress={() => handleBannerPress(item)}
            >
              <Text>{item.title}</Text>
              <Text style={styles.audioCount}>
                {item.audios.length > 1
                  ? `${item.audios.length} Songs`
                  : `${item.audios.length} Song`}
              </Text>
            </TouchableOpacity>
          ))
          : null}

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={{ marginTop: 15 }}
        >
          <Text style={styles.playListBtn}>+ Add New Playlist</Text>
        </TouchableOpacity>

        <PlayListInputModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSubmit={createPlayList} />
        <PlayListDetail
          visible={showPlayList}
          playList={selectedPlayList}
          onClose={() => setShowPlayList(false)} />
      </ScrollView></>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 30,
  },
  playListBanner: {
    padding: 5,
    backgroundColor: 'rgba(204,204,204,0.3)',
    borderRadius: 5,
    marginBottom: 15,
  },
  audioCount: {
    marginTop: 3,
    opacity: 0.5,
    fontSize: 20,
  },
  playListBtn: {
    color: color.ACTIVE_BG,
    letterSpacing: 1,
    fontWeight: 'bold',
    fontSize: 20,
    padding: 5,
  },
  backgroundContainer:{
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
   backdrop: {
    flex: 1,
    flexDirection: 'column',
  }
});

export default PlayList;
