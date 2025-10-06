const mongoose=require("mongoose");
const Course_Schema=new mongoose.Schema({
    name:{
        type:String
    },
    description:{
        type:String
    },
    price:{
        type:String
    },
    image:{
        type:String
    }
},
{
    timestamps:true,
    collection:"course"
});
module.exports=mongoose.model("course",Course_Schema);