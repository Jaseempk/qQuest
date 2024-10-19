import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import NameInputScreen from './src/screens/NameInputScreen';
import MainFeedScreen from './src/screens/MainFeedScreen';
import CreateCircleScreen from './src/screens/{circles}/CreateCircleScreen';

const Stack = createStackNavigator();

export default function App() {
  const [userName, setUserName] = useState<string>('');

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!userName ? (
          <Stack.Screen name="NameInput">
            {(props) => (
              <NameInputScreen
                {...props}
                onContinue={(name: string) => {
                  setUserName(name);
                  props.navigation.navigate('MainFeed');
                }}
              />
            )}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="MainFeed" component={MainFeedScreen} />
            <Stack.Screen name="CreateCircle" component={CreateCircleScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}