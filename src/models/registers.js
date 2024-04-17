const mongoose=require("mongoose");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const employeeSchema=new mongoose.Schema({
    firstname : {
        type: String,
        required : true
    },
    lastname : {
        type: String,
        required : true
    },
    email : {
        type: String,
        required : true,
        unique : true
    },
    phone : {
        type: Number,
        required : true,
        unique: true
    },
    age : {
        type: Number,
        required : true
    },
    gender : {
        type:String,
        required:true
    },
    password : {
        type: String,
        required : true
    },
    confirmpassword : {
        type: String,
        required : true
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
})

employeeSchema.methods.generateAuthToken=async function(){
    try {
        //console.log(this._id);
        const token=jwt.sign({_id:this._id.toString()},process.env.SECRET_KEY);
        this.tokens=this.tokens.concat({token:token});
        await this.save();
        return token;
    } catch (error) {
        //res.send("Error part : "+error);
        //console.log("Error part : "+error);
        res.send('<script>alert("ERROR"); window.location.href = "/"; </script>');
    }
} 

employeeSchema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password=await bcrypt.hash(this.password,10);  
        this.confirmpassword=await bcrypt.hash(this.password,10);  
    }
    next();
})

const Register=new mongoose.model("Register",employeeSchema);
module.exports=Register;