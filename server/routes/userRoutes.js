const express=require("express");
const { RegisterUser, Login } = require("../controllers/UserControllers");

const router=express.Router();
router.post("/register",RegisterUser)
router.post("/login",Login)

module.exports=router;