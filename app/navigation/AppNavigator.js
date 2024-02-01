import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import AudioList from "../screens/AudioList";
import Player from "../screens/Player";
import PlayList from "../screens/PlayList";

const Tab = createBottomTabNavigator();
const AppNavigator = () => {
    return (
        <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveBackgroundColor: '#0b0b33', tabBarInactiveBackgroundColor: '#04041f' }}>
                <Tab.Screen name='AudioList' component={AudioList}
                    options={{
                        tabBarIcon: ({ color, size }) => { return (<MaterialIcons name="headset" size = {size} color = {color}></MaterialIcons>); }
                    }}></Tab.Screen>
                <Tab.Screen name='Player' component={Player}
                    options={{
                        tabBarIcon: ({ color, size }) => { return (<FontAwesome5 name="compact-disc" size = {size} color = {color}></FontAwesome5>); }
                    }}></Tab.Screen>
                <Tab.Screen name='PlayList' component={PlayList}
                    option={{
                        tabBarIcon: ({ color, size }) => { return (<MaterialIcons name="library-music" size = {size} color = {color}></MaterialIcons>); }
                    }}></Tab.Screen>
        </Tab.Navigator>
    )
}
export default AppNavigator;
