import { supabase } from "../lib/supabase";

export const fetchBrands = async () => {
    const { data, error } = await supabase.from("brands").select("*");
    //console.log('Data: ',data)
    if (error) {
      return { success: false, error };
    }
    return { success: true, data };
  };


  export const fetchBrandDetails = async (brandId) => {
    //console.log("brand_id:", brandId);

    const { data, error } = await supabase
        .from("appliances")
        .select("*")
        .eq("brandId", brandId); // Filter by brandId

    //console.log("Supabase Response Data:", data);
    //console.log("Supabase Response Error:", error);

    if (error) {
        return { success: false, error };
    }
    return { success: true, data };
};

