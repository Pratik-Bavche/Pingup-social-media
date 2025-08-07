import User from "../models/User.js"


//get user data using userId
export const getUserData=async (req,res) => {
    try{
        const {userId}=req.auth()
        const user=await User.findById(userId)
        if(!user)
        {
            return res.json({success:false,message:"User not found"})
        }
        res.json({success:true,user})
    }
    catch(error){
        console.log(error);
        res.json({success:false,message:error.message})
    }
}

//update user data using userId
export const updateUserData=async (req,res) => {
    try{
        const {userId}=req.auth()
        const {username,bio,location,full_name}=req.body;

        const tempUser=await User.findById(userId)

        !username && (username==tempUser.username)

        if(tempUser.username!==username){
            const user=User.findOne({username});
            if(user){
                //we wiil not change username that is alreday taken
                username=tempUser.username
            }
        }
          
        const updatedData={
            username,
            bio,
            location,
            full_name
        }
    }
    catch(error){
        console.log(error);
        res.json({success:false,message:error.message})
    }
}