const express=require("express")
const router=express.Router()
const protect=require("../middleware/AuthMiddleware")
const { expenseAdd, getGroupExpense, deleteExpense, updateExpense, markPaid } = require("../controllers/ExpenseControllers")

router.post('/addexpense',protect,expenseAdd)
router.get('/expensegroup/:groupId',protect,getGroupExpense)
router.delete('/deleteexpense/:expenseId',protect,deleteExpense)
router.patch('/updateexpense/:expenseId',protect,updateExpense)
router.patch('/markpaid/:groupId',protect,markPaid)

module.exports=router;