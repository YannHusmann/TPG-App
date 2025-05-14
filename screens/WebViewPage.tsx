import React from 'react';
import { View, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';

const WebViewPage = ({ route, navigation }) => {
  const { url, title } = route.params;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <WebView
        source={{ uri: url }}
        onMessage={(event) => {
          if (event.nativeEvent.data === 'goBack') {
            navigation.goBack();
          }
        }}
      />
    </SafeAreaView>
  );
};

export default WebViewPage;
