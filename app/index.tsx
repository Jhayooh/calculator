import { useState } from 'react';
import { StyleSheet, Switch } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import MKeyboard from './components/MKeyboard';
import { ThemeContext } from './context/ThemeContext';
import { COLORS } from './style/colors';

export default function Index() {
  const [theme, setTheme] = useState('light');
  return ( 
    <ThemeContext.Provider value={theme}>
      <SafeAreaView style={theme === 'light' ? styles.container : [styles.container, {backgroundColor: 'black'}]}>
        <Switch
          style={{position: 'absolute', left: 0, top: 50}}
          value={theme === 'dark'}
          onValueChange={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        />
        <MKeyboard />
      </SafeAreaView>
    </ThemeContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
    justifyContent: 'flex-start',
  }
})
