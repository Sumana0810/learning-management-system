const mongoose=require("mongoose");
const Partpayment_Schema=new mongoose.Schema({
    ordersid:{
        type:String
    },
    amount:{
        type:String
    },
    mode:{
        type:String
    },
    status:{
        type:String
    }
},
{
    timestamps:true,
    collection:"payment"
});
module.exports=mongoose.model("payment",Partpayment_Schema);