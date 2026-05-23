const Expense=require("../models/ExpenseModels")

//created the expense to the group

const expenseAdd=async(req,res)=>{
    try{
        const{description,amount,group,paidBy,splitBetween}=req.body
        if(!description || !amount || !group || !paidBy || !splitBetween){
            res.status(400).json({message:"All fileds are required"})
        }
         
        const splitAmount=amount/splitBetween.length;

        const expense=await Expense.create({
            description,
            amount,
            group,
            paidBy,
            splitBetween,
            splitAmount
        });
        res.status(201).json(expense)

    }
    catch(err){
        res.status(500).json({message:err.message})
    }
}

//getexpense of that group

const getGroupExpense=async(req,res)=>{
    try{
 const {groupId}=req.params;
 const expenses=await Expense.find({
    group:groupId
 })
 .populate("paidBy","name email")
 .populate("splitBetween","name email")
 .populate("group","name");
 res.status(200).json(expenses);
    }
    catch(err){
        res.status(500).json({message:err.message})

    }
}

//update the existing expense
const updateExpense=async(req,res)=>{
    try{
        const {expenseId}=req.params;
        const{
            description,
            amount,
            splitBetween,}=req.body

            const expense=await Expense.findById(expenseId)
            if(!expense){
                res.status(400).json({message:"Expense not Found"})
            }
            expense.description=description || expense.description
            expense.amount=amount || expense.amount
            expense.splitBetween= splitBetween|| expense.splitBetween
            expense.splitAmount=expense.amount/expense.splitBetween.length;

            const updatedExpense=await expense.save();
            res.status(200).json(updatedExpense)
    }
    catch(err){
        res.status(500).json({message:err.message})
    }
}

//delete the existing expense

const deleteExpense=async(req,res)=>{
    try{
        const{expenseId}=req.params;
        const expense=await Expense.findById(
            expenseId
        );
        if(!expense){
            res.staus(400).json({message:"Expense not found"})
        }
        await expense.deleteOne();
        res.status(200).json({message:"Expense deletes successfully"})
    }
    catch(err){
        res.status(500).json({message:err.message,deleteExpense})
    }
}

//who all are paid
const markPaid=async(req,res)=>{
    try{
        
        const {groupId}=req.params;
        const{userId}=req.body;
 console.log("Mark paid - groupId:", groupId); // ← add this
    console.log("Mark paid - userId:", userId);   //
        await Expense.updateMany(
            {
                group:groupId,
                splitBetween:userId,
                paidBy:{$ne:userId},
            },{
                $addToSet:{paidMembers:userId}
            }
        );
        res.status(200).json({message:"Marked as paid"})

    }
    catch(err){
        res.status(500).json({message:err.message})
    }
}
module.exports={expenseAdd,getGroupExpense,deleteExpense,updateExpense,markPaid}