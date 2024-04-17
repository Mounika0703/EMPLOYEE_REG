require("dotenv").config();
const express=require("express");
const path=require("path");
const app=express();
const hbs=require("hbs");
const bcrypt=require("bcryptjs");
require("./db/conn");
const port=process.env.PORT || 8000;
const Register=require("./models/registers");
const cookieParser=require("cookie-parser");
const auth=require("./middleware/auth");

const static_path=path.join(__dirname,"../public");
const template_path=path.join(__dirname,"../templates/views");
const partials_path=path.join(__dirname,"../templates/partials");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));
app.use(express.static(static_path));

app.set("view engine","hbs");
app.set("views",template_path);
hbs.registerPartials(partials_path);

app.get("/",(req,res)=>{
    res.render("index");
});

app.get("/details",auth,(req,res)=>{
    //console.log(`hi this is cookie ${req.cookies.jwt}`);
    res.render("details",{
        logined:true,
        empfName:req.user.firstname,
        emplName:req.user.lastname,
        empEmail:req.user.email,
        empPhone:req.user.phone,
        empAge:req.user.age,
        empGender:req.user.gender
    });
});

app.get("/logout",auth,async(req,res)=>{
    try {
        //console.log(req.user);
        req.user.tokens=req.user.tokens.filter((currElement)=>{
            return currElement.token !== req.token;
        })
        //req.user.tokens=[];
        res.clearCookie("jwt");
        //console.log("logout succesfully");
        await req.user.save();
        res.render("login",{
            logined:false,
        });
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get("/register",(req,res)=>{
    res.render("register");
})

app.get("/login",(req,res)=>{
    res.render("login");
})

app.post("/register",async(req,res)=>{
    try{
        const password=req.body.password;
        const cpassword=req.body.confirmpassword;
        const phoneno=req.body.phone;
        if(phoneno.length===10){
            if(password === cpassword){
                const user=await Register.findOne({$or:[
                    {email:req.body.email},
                    {phone:req.body.phone}
                ]});
                if(user){
                    res.send('<script>alert("Email or Phone already exists"); history.back(); </script>');
                }
                else{
                    const registerEmployee=new Register({
                        firstname:req.body.firstname,
                        lastname:req.body.lastname,
                        email:req.body.email,
                        gender:req.body.gender,
                        phone:req.body.phone,
                        age:req.body.age,
                        password:password,
                        confirmpassword:cpassword,
                    })
    
                    //console.log("scuccess "+registerEmployee);
                    const token=await registerEmployee.generateAuthToken();
                    //console.log("token part "+token);
                    res.cookie("jwt",token,{
                        expires:new Date(Date.now()+60000),
                        httpOnly:true
                    });
                    //console.log(cookie);
    
                    const registered=await registerEmployee.save();
                    res.status(201).render("index");
                }
            }else{
                //res.send("password is not matching");
                res.send('<script>alert("Password is not matching"); history.back(); </script>');
            }
        }else{
            res.send('<script>alert("Enter a valid Phone number"); history.back(); </script>');
        }
    }catch(error){
        //res.status(400).send(error);
        //console.log(error);
        res.status(400).send("catch block");
    }
})

app.post("/login",async(req,res)=>{
    try{
        const email=req.body.email;
        const password=req.body.password;
        const useremail=await Register.findOne({email:email});
        const isMatch=await bcrypt.compare(password,useremail.password);
        const token=await useremail.generateAuthToken();
        //console.log("Token Part : "+token);
        res.cookie("jwt",token,{
            expires:new Date(Date.now()+600000),
            httpOnly:true
            //secure:true
        });

        if(isMatch){
            //res.status(201).render("/details");
            res.redirect("/details",201,{
                logined:true
            });
        }else{
            //res.send("Incorrect Login Details");
            res.send('<script>alert("Invalid Login Details"); history.back(); </script>');
        }
    }catch(error){
        //res.status(400).send("Invalid Email");
        res.send('<script>alert("Please Register before you Login"); history.back(); </script>');
    }
})

app.get("/*",(req,res)=>{
    //res.send("<h1>page doesn't exist</h1>");
    res.send('<script>alert("404 ERROR - PAGE NOT FOUND"); window.location.href = "/"; </script>');
});

app.listen(port,()=>{
    console.log(`Server is running at port no. ${port}`);
});