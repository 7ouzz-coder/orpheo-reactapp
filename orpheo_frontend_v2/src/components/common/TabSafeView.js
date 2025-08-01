import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { colors } from '../../styles/colors';

const TabSafeView = ({ children, style = {}, edges = ['top'] }) => {
  return (
    <SafeAreaView 
      style={[
        {
          flex: 1,
          backgroundColor: colors.background,
          // Padding bottom para evitar superposición con tab bar
          paddingBottom: Platform.OS === 'ios' ? 88 : 70,
        },
        style
      ]} 
      edges={edges}
    >
      {children}
    </SafeAreaView>
  );
};

export default TabSafeView;