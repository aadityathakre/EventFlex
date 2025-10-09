import {mongoose, Schema} from "mongoose";
import Video from "./video.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const UserSchema = new   mongoose.Schema({
     email:{
        type: String,
        require:true,
        unique: true,
        lowercase: true,
        trim : true
    },
    phone :{
        type : String,
        require:true,
        unique: true,
        trim : true,

    },
      password:{
        type:String,
        required:[true, "Password is required"],
        min: 8,
        max:18
    },

    
    role :{
        type : String ,
        require: true,
        trim : true,

    },

     firstname:{
        type: String,
        require:true,
        trim : true,
        index: true
    },

    lastname:{
        type: String,
        require:true,
        trim : true,
        index: true
    },

    wallet_address :{
        type : String ,
        require: true,
        trim : true,

    },
    avatar:{
        type: String, 
        required:true
    },
   
    universal_gig_id:{
        type:String,
        required:[true, "GIG ID is required"],
        min: 8,
        max:18
    },

     isVarified :{
        type: Boolean, 
        required:true
    },

    refreshToken:{
        type:String 
    }
}, {timestamps :true });

UserSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10)
    next();
})

UserSchema.methods.isPasswordCorrect = async function(password){
    return   await bcrypt.compare(password, this.password)
}

const User = mongoose.model("User", UserSchema );
export default User;