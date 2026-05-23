const User=require('../models/UserModels')
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")

//generate the token for authentication
const generateToken=(id)=>{
return jwt.sign(
    {id},
    process.env.SECRET_KEY,
)
}

//registration
const RegisterUser=async(req,res)=>{
    try{
        const {name,email,password,mobile_no}=req.body;
        if(!name || !email || !password ||!mobile_no){
         return   res.status(400).json({message:"Please filled All Fields"});
        }
        const userExist=await User.findOne({email});
        if(userExist){
           return res.status(400).json({message:"User Already exists"})
        }

        const hashedPassword=await bcrypt.hash(
            password,10
        );

        const user =await User.create({
            name,
            password:hashedPassword,
            email,
            mobile_no
        });
        res.status(201).json({
            _id:user._id,
            name:user.name,
            email:user.email,
            mobile:user.mobile_no,
            token:generateToken(user._id),
        })

    }
    catch(err){
       return res.status(500).json({message:err.message})
    }
}
//login
const Login=async(req,res)=>{
    try{
        const {email,password}=req.body;

        const user=await User.findOne({email});
        if(!user){
           return res.status(400).json({message:"Invalid Email"});
        }

        const isMatch=await bcrypt.compare(
            password,
            user.password
        )

        if(!isMatch){
          return  res.status(400).json({message:"Password is wrong"})
        }

        res.status(200).json({
            _id:user._id,
            name:user.name,
            email:user.email,
            token:generateToken(user._id)
        })

    }
    catch(err){
        return res.status(500).json({message:err.message})
    }

}
module.exports={RegisterUser,Login}