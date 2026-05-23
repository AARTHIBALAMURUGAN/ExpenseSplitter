const Expense = require("../models/ExpenseModels");
const calculateBalances = require("../utils/settlement");


//who owes who and who settled
const getSettlements = async (req, res) => {
  try {
    const { groupId } = req.params;

    const expenses = await Expense.find({ group: groupId })
      .populate("paidBy", "name email")
      .populate("splitBetween", "name email"); 
    const { balances, nameMap, settlements } = calculateBalances(expenses);

    // Build member summary with names
    const memberSummary = Object.keys(balances).map((userId) => ({
      name: nameMap[userId] || "Unknown",
      balance: parseFloat(balances[userId].toFixed(2)),
    }));
    console.log("Expenses:", expenses.map(e => ({
  desc: e.description,
  amount: e.amount,
  paidBy: e.paidBy.name,
  splitBetween: e.splitBetween.map(u => u.name),
  splitAmount: e.splitAmount  
})))

    res.status(200).json({ settlements, memberSummary });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getSettlements };