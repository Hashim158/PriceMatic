import { supabase } from "../lib/supabase";
import { uploadFile } from "./imageService";

export const fetchApplianceDetails = async (applianceId) => {
    //console.log("brand_id:", brandId);

    const { data, error } = await supabase
        .from("appliances")
        .select("*")
        .eq("id", applianceId); // Filter by brandId

    /*console.log("Supabase Response Data:", data);
    console.log("Supabase Response Error:", error);*/
    if (error) {
        return { success: false, error };
    }
    return { success: true, data };
};

export const fetchApplianceSpecs = async (applianceId, category) => {
  console.log("backend: ", category, applianceId);
  let tableName = "specification";
  const type = category?.toLowerCase();

  if (type.includes("washing")) {
    tableName = "wm_specifications";
  } else if (
    type.includes("ac") ||
    type.includes("a/c") ||
    type.includes("air conditioner")
  ) {
    tableName = "ac_specifications";
  }
  console.log("table name:", tableName);
  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .eq("applianceId", applianceId);
  
  if (error) {
    return { success: false, error };
  }

  return { success: true, data };
};



export const fetchAllAppliance = async (applianceType) => {
    try {
        let query = supabase
            .from("appliances")
            .select("id, brand, type, modelNumber");

        if (applianceType) {
            query = query.eq("type", applianceType);
        }

        const { data, error } = await query;

        if (error) {
            return { success: false, error };
        }

        return { success: true, data };
    } catch (err) {
        return { success: false, error: err.message };
    }
};


export const fetchtwoApplianceDetails = async (id) => {
    const { data, error } = await supabase
        .from("appliances")
        .select("*") // Only fetch these fields
        .eq("id", id); // Filter by appliance type

    //console.log("Supabase Response Data:", data);
    //console.log("Supabase Response Error:", error);

    if (error) {
        return { success: false, error };
    }
    return { success: true, data };
};

export const createReview = async (Review) => {
    try {
        const {data, error } = await supabase
            .from('review')
            .insert(Review)
            .select()
            .single();
            //console.log("Supabase data:", data);
           // console.log("Supabase error:", error);
        if (error) {
            console.log('cooment error:', error);
            return { success: false, msg: 'Cannot comment' };
        }
        
        return { success: true, data: data };
    } catch (error) {
        console.log('comment error error:', error);
        return { success: false, msg: 'Cannot comment' };
    }
};

export const fetchReview = async (ReviewId) => {
    try {
        const {data, error } = await supabase
            .from('review')
            .select("*")
            .eq("applianceId",ReviewId)
          // console.log("Supabase data:", data);
            //console.log("Supabase error:", error);
        if (error) {
            console.log('cooment error:', error);
            return { success: false, msg: 'Cannot comment' };
        }
        
        return { success: true, data: data };
    } catch (error) {
        console.log('comment error error:', error);
        return { success: false, msg: 'Cannot comment' };
    }
};

export const fetchAllPopularAppliances = async () => {
    const { data, error } = await supabase
      .from("appliances")
      .select("brand, type, modelNumber, Price, rating, image, id")
      .gt("rating", 3) // Get only those with rating > 3
      .order("rating", { ascending: false }); // Removed .limit(5)
  
    if (error) {
      return { success: false, error };
    }
    return { success: true, data };
  };

  export const fetchPopularAppliances = async () => {
    const { data, error } = await supabase
      .from("appliances")
      .select("brand, type, modelNumber, Price, rating, image, id")
      .gt("rating", 3)
      .order("rating", { ascending: false })
      .limit(5); // ✅ Limit to 5 items
  
    if (error) {
      return { success: false, error };
    }
    return { success: true, data };
  };
  

export const fetchAllReviews = async () => {
  const { data, error } = await supabase
    .from("review")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { success: false, error };
  return { success: true, data };
};



export const fetchAllReviewsWithDetails = async () => {
    const { data, error } = await supabase
      .from("review")
      .select(`
        id,
        created_at,
        title,
        text,
        rating,
        userId,
        applianceId,
        users (
          id,
          name
        ),
        appliances (
          id,
          modelNumber,
          image
        )
      `)
      .order("created_at", { ascending: false });
  
    if (error) return { success: false, error };
    return { success: true, data };
  };

  export const addAppliance = async (appliance) => {
    const { data, error } = await supabase
      .from('appliances')
      .insert([appliance]);
  
    if (error) {
      return { success: false, error };
    }
  
    return { success: true, data };
  };
  

  /**
 * @param {{
 *   type: string,
  *   Price: string,
  *   rating?: string | null,
  *   color: string,
  *   capacity: string,
  *   brandId?: string | null,
  *   modelNumber: string,
  *   brand: string,
  *   image: string[],        // local URIs
  *   features: string[]
  * }} applianceData
  */
 /**
 * Uploads images and inserts a new appliance.
 *
 * @param {{
 *   type: string,
 *   Price: string,
 *   rating?: string | null,
 *   color: string,
 *   capacity: string,
 *   brandId?: string | null,
 *   modelNumber: string,
 *   brand: string,
 *   image: string[],   // local URIs
 *   features: string[]
 * }} applianceData
 */
export const createAppliance = async (applianceData) => {
  // 1) upload all images
  const uploadResults = await Promise.all(
    applianceData.image.map(uri => uploadFile('appliances', uri))
  );

  // 2) if any failed, throw
  const failed = uploadResults.find(r => !r.success);
  if (failed) {
    // failed.msg should include the error from Supabase storage
    throw new Error('Image upload failed: ' + failed.msg);
  }

  // 3) collect the storage paths
  const paths = uploadResults.map(r => r.path);

  // 4) insert into your table
  const { data, error } = await supabase
    .from('appliances')
    .insert([{
      type:        applianceData.type,
      Price:       applianceData.Price,
      rating:      applianceData.rating || null,
      color:       applianceData.color,
      capacity:    applianceData.capacity,
      brandId:     applianceData.brandId,
      modelNumber: applianceData.modelNumber,
      brand:       applianceData.brand,
      image:       paths,
      features:    applianceData.features,
    }])
    .select()
    .single();

  if (error) {
    console.log('[createAppliance]', error);
    throw error;
  }

  return data;
};

export const deleteAppliance = async (id) => {
  const { data, error } = await supabase
    .from('appliances')
    .delete()
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

/**
 * Update an appliance by id
 * @param {number} id
 * @param {Partial<{
 *   type: string,
 *   Price: string,
 *   rating: string | null,
 *   color: string,
 *   capacity: string,
 *   brandId: string | null,
 *   modelNumber: string,
 *   brand: string,
 *   image: string[],
 *   features: string[],
 * }>} updates
 */
export const updateAppliance = async (id, updates) => {
  const { data, error } = await supabase
    .from('appliances')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const fetchAllAppliances = async () => {
  const { data, error } = await supabase
    .from('appliances')
    .select('*')
    .order('id', { ascending: false });
  if (error) throw error;
  return data;
};

export const searchAppliances = async (query) => {
  try {
    const { data, error } = await supabase
      .from("appliances")
      .select("id, brand, modelNumber, image, type, rating, Price")
      .or(`brand.ilike.%${query}%,modelNumber.ilike.%${query}%,type.ilike.%${query}%`);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.log("Search error:", error);
    return { success: false, error };
  }
};

