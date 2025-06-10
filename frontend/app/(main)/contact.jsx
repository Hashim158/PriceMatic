import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { getChatMessages, sendMessage } from '../../services/chatService';
import { getUserData } from '../../services/userService';
import { getSupaBaseFileUrl } from '../../services/imageService';
import { Image } from 'expo-image';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const Contact = () => {
  const { sellingId, receiverId } = useLocalSearchParams();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [sending, setSending] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const flatListRef = useRef(null);
  const messagesRef = useRef([]);
  const previousMessagesLength = useRef(0);
  const isFirstLoad = useRef(true);

  const fetchReceiverName = useCallback(async () => {
    try {
      const res = await getUserData(receiverId);
      setReceiverName(res.success && res.data?.name ? res.data.name : 'Unknown');
    } catch (error) {
      console.error('Failed to fetch receiver data:', error);
    }
  }, [receiverId]);

  const scrollToEnd = useCallback((animated = true) => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        try {
          flatListRef.current.scrollToEnd({ animated });
        } catch (error) {
          console.log('Scroll error:', error);
        }
      }, 100);
    }
  }, [messages.length]);

  const silentFetch = useCallback(async () => {
    try {
      const data = await getChatMessages(user.id, receiverId, sellingId);
      const sorted = (data || []).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      const hasNewMessages = sorted.length > previousMessagesLength.current;
      setMessages(sorted);
      messagesRef.current = sorted;
      if (hasNewMessages && !isFirstLoad.current) {
        scrollToEnd(true);
      }
      previousMessagesLength.current = sorted.length;
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  }, [user.id, receiverId, sellingId, scrollToEnd]);

  const loadMessages = useCallback(async () => {
    setRefreshing(true);
    await silentFetch();
    setRefreshing(false);
    setInitialLoading(false);
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      scrollToEnd(false);
    }
  }, [silentFetch, scrollToEnd]);

  useEffect(() => {
    fetchReceiverName();
    loadMessages();
    const interval = setInterval(silentFetch, 3000);
    return () => clearInterval(interval);
  }, [fetchReceiverName, loadMessages, silentFetch]);

  const pickImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        selectionLimit: 1,
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const uri = result.assets[0].uri;
        setSelectedImage(uri);
        setPreviewImage(uri);
        setPreviewVisible(true);
      }
    } catch (error) {
      console.error('[ImagePicker]', error);
      Alert.alert('Error', 'Failed to select image');
    }
  }, []);

  const handleSend = useCallback(async () => {
    if (!newMessage.trim() && !selectedImage) return;
    try {
      setSending(true);
      await sendMessage({
        sender: user.id,
        reciever: receiverId,
        sellingId: parseInt(sellingId, 10),
        message: newMessage.trim(),
        imageUri: selectedImage,
      });
      setNewMessage('');
      setSelectedImage(null);
      await silentFetch();
      setTimeout(() => scrollToEnd(), 300);
    } catch (err) {
      console.error('Error sending message:', err);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  }, [newMessage, selectedImage, user.id, receiverId, sellingId, silentFetch, scrollToEnd]);

  const openImagePreview = useCallback((imageUrl) => {
    setPreviewImage(imageUrl);
    setPreviewVisible(true);
  }, []);

  const renderMessage = useCallback(({ item }) => {
    const mine = item.sender === user.id;
    const date = new Date(item.created_at);
    const now = new Date();
    let time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (date.toDateString() !== now.toDateString()) {
      time = date.toLocaleDateString() + ', ' + time;
    }

    return (
      <View style={[styles.bubbleWrapper, mine ? styles.bubbleWrapperMine : styles.bubbleWrapperTheirs]}>
        <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
          {item.image && (
            <TouchableOpacity onPress={() => openImagePreview(getSupaBaseFileUrl(item.image))}>
              <Image
                source={getSupaBaseFileUrl(item.image)}
                style={styles.messageImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
          {item.message?.trim() !== '' && (
            <Text style={styles.msgText}>{item.message}</Text>
          )}
          <Text style={styles.msgTime}>{time}</Text>
        </View>
      </View>
    );
  }, [user.id, openImagePreview]);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{receiverName}</Text>
      </View>

      {initialLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadMessages} />}
        onContentSizeChange={() => {
          if (!isFirstLoad.current && messages.length > 0) scrollToEnd();
        }}
        onLayout={() => {
          if (isFirstLoad.current && messages.length > 0 && !initialLoading) {
            isFirstLoad.current = false;
            scrollToEnd(false);
          }
        }}
      />

      <View style={styles.inputBar}>
        <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
          <Ionicons name="image-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Write a message..."
          multiline
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={(!newMessage.trim() && !selectedImage) || sending}
          style={styles.sendButton}
        >
          {sending ? <ActivityIndicator size="small" color="#007AFF" /> :
            <Ionicons name="send" size={24} color="#007AFF" />}
        </TouchableOpacity>
      </View>

      <Modal visible={previewVisible} transparent animationType="fade" onRequestClose={() => setPreviewVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <TouchableOpacity onPress={() => setPreviewVisible(false)} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {previewImage && (
            <Image
              source={typeof previewImage === 'string' ? { uri: previewImage } : previewImage}
              style={styles.previewImageFull}
              resizeMode="contain"
            />
          )}
          {previewImage === selectedImage && (
            <TouchableOpacity onPress={async () => { await handleSend(); setPreviewVisible(false); }} style={styles.modalSendButton}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          )}
        </SafeAreaView>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default Contact;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F5F9' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2C6BED',
  },
  headerTitle: {
    marginLeft: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'flex-end',
  },
  bubbleWrapper: { marginVertical: 4, maxWidth: '80%' },
  bubbleWrapperMine: { alignSelf: 'flex-end' },
  bubbleWrapperTheirs: { alignSelf: 'flex-start' },
  bubble: {
    padding: 10,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  bubbleMine: { backgroundColor: '#D0E8FF' },
  bubbleTheirs: { backgroundColor: '#FFFFFF' },
  msgText: { fontSize: 16, color: '#333', marginBottom: 4 },
  msgTime: { fontSize: 11, color: '#888', textAlign: 'right' },
  messageImage: {
    width: 220,
    height: 180,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: '#eee',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 8,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  imagePickerButton: { padding: 6 },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  previewImageFull: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
    alignSelf: 'center',
  },
  modalSendButton: {
    marginTop: 20,
    backgroundColor: '#2C6BED',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignSelf: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
