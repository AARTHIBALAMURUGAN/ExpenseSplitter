const express=require("express")
const router=express.Router();
const protect=require('../middleware/AuthMiddleware');
const { getSettlements } = require("../controllers/settleController");


router.get('/:groupId',protect,getSettlements);
module.exports=router;
