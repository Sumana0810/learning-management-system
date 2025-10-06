const mongoose=require("mongoose");
const Orders_Schema=new mongoose.Schema({
    userid:{
        type:String
    },
    courseid:{
        type:String
    },
    tfee:{
        type:String
    },
    pfee:{
        type:String
    },
    status:{
        type:String
    }
},
{
    timestamps:true,
    collection:"orders"
});
module.exports=mongoose.model("orders",Orders_Schema);