const mongoose=require("mongoose");
const connectDB=async()=>{
    try{
        await mongoose.connect("mongodb://localhost:27017/lms");
        console.log("Database Connected Successfully");
        }
        catch(err){
            console.log("Error");
            console.log("Database Is Missing");
        }
}
module.exports=connectDB;