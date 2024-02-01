import React from "react";
import { View, StyleSheet, Text, Dimensions, TouchableWithoutFeedback } from "react-native";
import { Entypo } from "@expo/vector-icons";
import color from "../misc/color";

const getThumnailText = () => {
        return <Entypo 
        name = "controller-play"
        size = {24}
        color = {color.ACTIVE_FONT}
        ></Entypo>;
}
const renderPlayPauseIcon = isPlaying => {
    if(isPlaying)
    {
        return <Entypo 
        name = "controller-paus"
        size = {24}
        color = {color.ACTIVE_FONT}
        ></Entypo>;
    }
    return <Entypo
    name = "controller-play"
    size = {24}
    color = {color.ACTIVE_FONT}></Entypo>
}

const AudioListItem = ({title, duration, onOptionPress, onAudioPress, isPlaying, activeListItem}) => {
    return (
        <>
        <View style = {styles.container}>
            <TouchableWithoutFeedback 
            onPress = {onAudioPress}>   
            <View style = {styles.leftContainer}>
                <View style = {[styles.thumbnail, {backgroundColor: activeListItem ? 'blue' : '#2b1459'}]}>
                     <Text style = {styles.thumbnailText}>
                        {activeListItem 
                        ? renderPlayPauseIcon(isPlaying) 
                        : getThumnailText(title)
                        }
                     </Text>
                </View>
                <View style = {styles.titleContainer}>
                    <Text numberOfLines = {1} style = {styles.title}>
                        {title}
                    </Text>
                    <Text style = {styles.timeText}> 
                    {duration}
                    </Text>
                </View>
            </View>
            </TouchableWithoutFeedback>
            <View style = {styles.rightContainer}>
                <Entypo 
                onPress = {onOptionPress}
                name = "dots-three-vertical"
                size = {24}
                color = {color.FONT_MEDIUM}>
                </Entypo>
            </View>
        </View>
        <View style = {styles.seperator}></View>
        </>
    )
}
const {width} = Dimensions.get('window');
const styles = StyleSheet.create({
    container:{
        flexDirection: 'row',
        alignSelf: 'center',
        width: width - 80,
        backgroundColor: '#bc9dfa',
        opacity: 0.8,
        borderRadius: 50,
    },
    leftContainer:{
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    rightContainer:{
        flexBasis: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    thumbnail:{
        height: 50,
        backgroundColor: 'color.FONT_LIGHT',
        flexBasis: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
    },
    thumbnailText:{
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
    },
    titleContainer:{
        width: width - 180,
        paddingLeft: 10,
    },
    title:{
        fontSize: 20,
        color: 'black',
        opacity: 0.8,
    },
    seperator: {
        width: width - 80,
        backgroundColor: '#333',
        opacity: 0.3,
        height: 0.5,
        alignSelf: 'center',
        marginTop: 10,
    },
    timeText: {
        fontSize: 14,
        color: color.FONT_LIGHT,
    },
})
export default AudioListItem;