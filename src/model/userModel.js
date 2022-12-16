const mongoose=require("mongoose")

const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unquie:true
    },
    password:{
        type:String,
        required:true,
        
    },
    phone:{
        type:Number,
        required:true,
        unquie:true
    },
    address:{
        type:String,
        required:true
    },
    isdeleted:{
        type:String,
        default:false
    }
},{timestamps:true})

module.exports=mongoose.model("User",userSchema)
