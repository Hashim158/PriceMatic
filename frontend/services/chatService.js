// chatService.js - Enhanced with image support
import { supabase } from '../lib/supabase';
import { uploadFile } from './imageService';

/**
 * Get distinct appliance IDs (sellingId) from chats where user is sender or receiver
 * @param {string} userId
 * @returns {Promise<number[]>}
 */
export const getUserApplianceIdsFromChat = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('chat')
      .select('sellingId')
      .or(`sender.eq.${userId},reciever.eq.${userId}`)
      .not('sellingId', 'is', null);

    if (error) {
      console.log('Supabase error:', error.message);
      return [];
    }

    const uniqueIds = Array.from(new Set(data.map(item => item.sellingId)));
    return uniqueIds;
  } catch (err) {
    console.log('Unexpected error:', err.message);
    return [];
  }
};

/**
 * Get the receiver ID for a chat between two users for a specific appliance
 * Returns the other user involved in the first message of that product's chat
 */
export const getAllConversationPairsForUser = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('chat')
      .select('sellingId, sender, reciever, created_at')
      .or(`sender.eq.${userId},reciever.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.log('Supabase error:', error?.message);
      return [];
    }

    const seenPairs = new Set();
    const uniqueChats = [];

    data.forEach(({ sellingId, sender, reciever, created_at }) => {
      const otherUserId = sender === userId ? reciever : sender;
      const key = `${sellingId}-${[userId, otherUserId].sort().join('-')}`;

      if (!seenPairs.has(key)) {
        seenPairs.add(key);
        uniqueChats.push({
          sellingId,
          receiverId: otherUserId,
          lastMessageAt: created_at,
        });
      }
    });

    // Sort by lastMessageAt descending
    return uniqueChats.sort((a, b) =>
      new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
    );
  } catch (err) {
    console.log('Unexpected error:', err.message);
    return [];
  }
};

  
/**
 * Get all messages for a given appliance chat between two users
 * Sorted by creation time (latest last)
 */
export const getChatMessages = async (userId, otherUserId, sellingId) => {
  const { data, error } = await supabase
    .from('chat')
    .select('*')
    .eq('sellingId', sellingId)
    .or(`sender.eq.${userId},reciever.eq.${userId}`)
    .order('created_at', { ascending: true });

  if (error) {
    console.log('[getChatMessages]', error.message);
    return [];
  }

  // Filter only those involving both users
  return data.filter(
    msg =>
      (msg.sender === userId && msg.reciever === otherUserId) ||
      (msg.sender === otherUserId && msg.reciever === userId)
  );
};

/**
 * Send a text chat message
 * @param {Object} payload - sender, reciever, sellingId, message
 */
export const sendMessage = async ({ sender, reciever, sellingId, message, imageUri = null }) => {
  // First, handle image upload if it exists
  let imagePath = null;
  
  if (imageUri) {
    try {
      const uploadResult = await uploadFile('chat', imageUri);
      if (!uploadResult.success) {
        throw new Error('Image upload failed: ' + uploadResult.msg);
      }
      imagePath = uploadResult.path;
    } catch (error) {
      console.log('[sendMessage] Image upload error:', error);
      throw error;
    }
  }
  
  // Then insert the message with optional image path
  const { error } = await supabase
    .from('chat')
    .insert([
      {
        sender,
        reciever,
        sellingId,
        message,
        image: imagePath, // Will be null if no image was uploaded
      },
    ]);

  if (error) {
    console.log('[sendMessage]', error.message);
    throw error;
  }

  return true;
};

/**
 * Send an image message with optional text
 * This is a convenience wrapper around sendMessage
 * @param {Object} payload - sender, reciever, sellingId, imageUri, message (optional)
 */
export const sendImageMessage = async ({ sender, reciever, sellingId, imageUri, message = '' }) => {
  if (!imageUri) {
    throw new Error('Image URI is required');
  }
  
  return sendMessage({
    sender,
    reciever,
    sellingId,
    message,
    imageUri
  });
};