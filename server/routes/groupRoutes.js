const express=require("express")
const router=express.Router();
const protect=require("../middleware/AuthMiddleware");
const { createGroup, getGroups, addMember, getGroupById } = require("../controllers/GroupControllers");

router.post('/creategroup',protect,createGroup);
router.get('/getgroup',protect,getGroups);
router.post('/addmember',protect,addMember);
router.get('/getgroupbyid/:groupId',protect,getGroupById)

module.exports=router;