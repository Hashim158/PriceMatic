import { supabase } from "../lib/supabase";

export const getUserData = async(userId)=>{
   // console.log("Service: ",userId)
    try{
        const {data, error} = await supabase
        .from('users')
        .select()
        .eq('id',userId)
        .single();
        //console.log("Supabase data:", data);
        //console.log("Supabase error:", error);

        if(error){
            return{success: false,msg:error?.message};
        }
        return{success:true, data};

    }catch(error){
        console.log('got error: ', error);
        return {success: false, msg: error.message};

    };
};


export const updateUser = async (userId,data)=>{
    try{
        const {error} = await supabase
        .from('users')
        .update(data)
        .eq('id',userId);


        if(error){
            return{success: false,msg:error?.message};
        }
        return{success:true, data};

    }catch(error){
        console.log('got error: ', error);
        return {success: false, msg: error.message};

    };
};
