import mongoose from "mongoose";
import Video from "./video.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const UserSchema = new   mongoose.Schema({
    username:{
        type: String,
        require:true,
        unique: true,
        lowercase: true,
        trim : true,
        index: true
    },
     email:{
        type: String,
        require:true,
        unique: true,
        lowercase: true,
        trim : true
    },
     fullname:{
        type: String,
        require:true,
        trim : true,
        index: true
    },
    avatar:{
        type: String, 
        required:true
    },
    coverImage:{
        type: String
    },
    watchHistory:[{
        type: Schema.Types.ObjectId,
        ref: "Video" 
    }],
    password:{
        type:String,
        required:[true, "Password is required"],
        min: 8,
        max:18
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