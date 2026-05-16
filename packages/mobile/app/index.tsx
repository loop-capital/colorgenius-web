import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, WebView } from 'react-native';
import { useEffect, useState } from 'react';
import { Constants } from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export default function Index() {
  const [webViewReady, setWebViewReady] = useState(false);
  const [url, setUrl] = useState('');

  useEffect(() => {
    // Set the URL to load - this should point to your deployed web dashboard
    // For development, you might use localhost or a tunnel URL
    const devUrl = Platform.select({
      web: 'http://localhost:3000',
      default: 'http://10.0.2.2:3000' // Android emulator
    });
    
    // In production, this would be your actual deployed URL
    setUrl(devUrl);
    setWebViewReady(true);
  }, []);

  const handleOpenLink = ({ url }: { url: string }) => {
    // Handle external links by opening them in the browser
    WebBrowser.openBrowserAsync(url);
    return true; // Prevent WebView from navigating
  };

  if (!webViewReady) {
    return (
      <View style={styles.container}>
        <Text>Loading ColorGenius...</Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <WebView
        source={{ uri: url }}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        shouldPauseRenderWhileInBackground={false}
        scalesPageToFit={false}
        onShouldStartLoadWithRequest={handleOpenLink}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webView: {
    flex: 1,
  },
});