const express=require("express")
const cors=require("cors")
require("dotenv").config();
const connectDB=require("./config/db");
const userRoutes=require("./routes/userRoutes");
const groupRoutes=require("./routes/groupRoutes");
const expenseroutes=require("./routes/expenseRoute");
const settlementroute=require('./routes/settlementRoutes')
const app=express()
require("dns").setDefaultResultOrder("ipv4first");
connectDB()
app.use(cors(process.env.FRONTEND_URL))
app.use(express.json());
app.use("/api/user", userRoutes);
app.use('/api/group',groupRoutes);
app.use('/api/expense',expenseroutes);
app.use("/api/settlement",settlementroute)
app.use(express.json());
app.get("/",(req,res)=>{
    res.send("API Running...")
})
const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log("Server running on 5000")
})