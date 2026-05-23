const mongoose=require("mongoose")
//const User=require("./UserModels.js")
const GroupSchema=new mongoose.Schema(
    {
        groupname:{
            type:String,
            required:true,
            trim:true,
        },
        members:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"User",
            },
        ],
        createdBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        }
    },
    {
        timestamps:true,
    }
);
module.exports=mongoose.model("Group",GroupSchema)