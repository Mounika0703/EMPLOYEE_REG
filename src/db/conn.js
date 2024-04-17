const mongoose=require("mongoose");
mongoose.connect(process.env.SERVER_NAME).then(()=>{
    console.log(`Connection Established`);
}).catch((e)=>{
    console.log(`No Connection`);
})