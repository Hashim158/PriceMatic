import { supabase } from '../lib/supabase';
import { uploadFile } from './imageService';

/**
 * Create a new selling item with multiple pictures and metadata
 * @param {Object} item
 * @param {string[]} item.pictures - Local URIs of selected images
 * @param {string} item.brand
 * @param {string} item.price
 * @param {string} item.description
 * @param {string} item.modelNo
 * @param {string} item.color
 * @param {string} item.condition
 * @param {string} item.yearOfPurchase
 * @param {string} item.userId
 * @returns {Promise<Object>} The created item data
 */
export const createSellingItem = async ({
  pictures,
  brand,
  price,
  description,
  modelNo,
  color,
  condition,
  yearOfPurchase,
  category,
  userId,
}) => {
  const uploadResults = await Promise.all(
    pictures.map(uri => uploadFile('sell', uri))
  );

  const failed = uploadResults.find(r => !r.success);
  if (failed) {
    throw new Error('Upload failed: ' + failed.msg);
  }

  const paths = uploadResults.map(r => r.path);

  const { data, error } = await supabase
    .from('selling')
    .insert([
      {
        userId,
        pictures: paths,
        brand,
        price,
        description,
        modelNo,
        color,
        condition,
        yearOfPurchase,
        category, // ✅ Added
      },
    ])
    .select();

  if (error) {
    console.log('[createSellingItem]', error);
    throw error;
  }

  return data[0];
};


/**
 * Get all selling items
 * @returns {Promise<Array>} Array of selling items
 */
export const getAllSellingItems = async () => {
  const { data, error } = await supabase
    .from('selling')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.log('[getAllSellingItems]', error);
    throw error;
  }

  return data;
};

/**
 * Get a selling item by ID
 * @param {string} id - The item ID
 * @returns {Promise<Object>} The s elling item data
 */

export const getSellingItemById = async (id) => {
  if (!id) {
    throw new Error('Invalid sellingId provided');
  }

  const { data, error } = await supabase
    .from('selling')
    .select('*, users(*)')
    .eq('id', id)
    .single();

  if (error) {
    console.log('[getSellingItemById]', error);
    throw error;
  }

  return data;
};



/**
 * Update an existing selling item
 * @param {string} id - The item ID to update
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated item data
 */
export const updateSellingItem = async (id, updates) => {
  // Handle picture uploads if provided
  if (updates.pictures && Array.isArray(updates.pictures)) {
    // Filter out already uploaded pictures (those that start with 'sell/')
    const newPictures = updates.pictures.filter(pic => !pic.startsWith('sell/'));
    const existingPictures = updates.pictures.filter(pic => pic.startsWith('sell/'));

    if (newPictures.length > 0) {
      // Upload new pictures
      const uploadResults = await Promise.all(
        newPictures.map(uri => uploadFile('sell', uri))
      );

      // Check for failures
      const failed = uploadResults.find(r => !r.success);
      if (failed) {
        throw new Error('Upload failed: ' + failed.msg);
      }

      // Combine existing and new picture paths
      updates.pictures = [
        ...existingPictures,
        ...uploadResults.map(r => r.path)
      ];
    }
  }

  const { data, error } = await supabase
    .from('selling')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.log('[updateSellingItem]', error);
    throw error;
  }

  return data[0];
};

/**
 * Delete a selling item
 * @param {string} id - The item ID to delete
 * @returns {Promise<void>}
 */
export const deleteSellingItem = async (id) => {
  // First get the item to get picture paths for cleanup
  const { data: item } = await supabase
    .from('selling')
    .select('pictures')
    .eq('id', id)
    .single();

  // Delete the database record
  const { error } = await supabase
    .from('selling')
    .delete()
    .eq('id', id);

  if (error) {
    console.log('[deleteSellingItem]', error);
    throw error;
  }
  
  // Optionally: Delete the pictures from storage
  // This would require additional storage deletion functions

  return true;
};

/**
 * Get selling items by user ID
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} Array of user's selling items
 */
export const getUserSellingItems = async (userId) => {
  const { data, error } = await supabase
    .from('selling')
    .select('*')
    .eq('userId', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.log('[getUserSellingItems]', error);
    throw error;
  }

  return data;
};

export const searchSellingItems = async (query) => {
  try {
    const { data, error } = await supabase
      .from("selling")
      .select("*")
      .or(`brand.ilike.%${query}%,modelNo.ilike.%${query}%,category.ilike.%${query}%`);

    if (error) throw error;
    return data;
  } catch (error) {
    console.log("Search failed:", error);
    return [];
  }
};
