import React from 'react';
import {
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { BlockedUsersList } from '../../components/block-user';

export default function BlockedUsersScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <BlockedUsersList />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});
