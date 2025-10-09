import {mongoose, Schema} from "mongoose";
import User from "./User.model.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema =new   mongoose.Schema({
    videoFile:{
        type: String,
        require:true
    },
     thumbnail:{
        type: String,
        require:true
    },
     title:{
        type: String,
        require:true
    },
    description:{
        type: String, 
        required:true
    },
    duration  :{   
        type: Number,
        required:true
    },
    views:{
        type: Number,
        default : 0
    },
    isPublished:{
        type:Boolean,
        default: true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
}, {timestamps :true });

videoSchema.plugin(mongooseAggregatePaginate);

const Video = mongoose.model("Video", videoSchema );
export default Video;