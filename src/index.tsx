import React from 'react';
import {StatusBar} from 'react-native';
import {HomeScreen} from './screens';

// the root and parent component to export to react native
function App() {
  return (
    <>
      <StatusBar backgroundColor={'#dcb200'} />
      <HomeScreen />
    </>
  );
}

export default App;
