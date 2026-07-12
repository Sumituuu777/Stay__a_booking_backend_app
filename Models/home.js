const mongoose= require("mongoose");

const homeSchema=new mongoose.Schema({
    houseName:{type:String,required:true},
    price:{type:Number,required:true},
    location:{type:String,required:true},
    rating:{type:Number,required:true},
    photoURL:{type:String},
    description:String,
    hostId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    isBooked:{type:Boolean,required:false},
    bookerId:{type:mongoose.Schema.Types.ObjectId,required:false},
    bookingExpiry:{
        type:Date,
        required:false
    }
});
module.exports=mongoose.model('Home',homeSchema)