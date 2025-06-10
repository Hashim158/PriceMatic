import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../lib/supabase';
import { supabaseUrl } from '../constants';

export const getUserImageSrc = imagePath=>{
    if(imagePath){
        return getSupaBaseFileUrl(imagePath);
    }else{
        return require('../assets/images/react-logo.png')
    }
};

export const getSupaBaseFileUrl = filePath => {
    if(filePath){
        return {uri: `${supabaseUrl}/storage/v1/object/public/Brands/${filePath}`}
    }
    return null; 
}

export const uploadFile = async (folderName, fileUri, isImage = true) => {
    try {
      // read the file as base64
      const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const fileData = decode(fileBase64);
  
      // build a timestamped filename
      const ext = isImage ? '.png' : '.mp4';
      const fileName = `${Date.now()}${ext}`;
      const filePath = `${folderName}/${fileName}`;       // ← sub-folder
  
      // upload into the **Brands** bucket under sell/…
      const { data, error } = await supabase
        .storage
        .from('Brands')                                 // ← your bucket name
        .upload(filePath, fileData, {
          cacheControl: '3600',
          upsert: false,
          contentType: isImage ? 'image/png' : 'video/mp4',
        });
  
      if (error) throw error;
  
      return { success: true, path: data.path };        // e.g. “sell/1634234234.png”
    } catch (err) {
      console.log('Upload failed:', err);
      return { success: false, msg: err.message };
    }
  };
  