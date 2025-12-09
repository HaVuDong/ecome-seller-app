/* eslint-disable import/no-duplicates */
import React from 'react';
import { Pressable } from 'react-native';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

interface ExternalLinkProps {
  href: string;
  children: React.ReactNode;
}

export function ExternalLink({ href, children }: ExternalLinkProps) {
  const handlePress = async () => {
    if (Platform.OS === 'web') {
      window.open(href, '_blank');
    } else {
      await WebBrowser.openBrowserAsync(href);
    }
  };

  return (
    <Pressable onPress={handlePress}>
      {children}
    </Pressable>
  );
}