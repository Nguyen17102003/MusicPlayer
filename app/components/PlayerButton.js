import React from "react";
import { AntDesign } from "@expo/vector-icons";
const PlayerButton = (props) => {
    const {
        iconType, 
        size = 60, 
        iconColor = 'yellow',
        otherProps,
        onPress,
    } = props;
    const getIconName = (type) => {
        switch(type)
        {
            case 'PLAY':
                return 'pausecircle';
            case 'PAUSE':
                return 'playcircleo';
            case 'NEXT':
                return 'forward';
            case 'PREV':
                return 'banckward';
        }
    }
    return(
         <AntDesign
         {...props}
         onPress = {onPress}
         name = {getIconName(iconType)}
         size = {size}
         color = {iconColor}
         ></AntDesign>
    )
};
export default PlayerButton;