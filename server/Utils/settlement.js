const calculateBalances = (expenses) => {
  const balances = {};
  const nameMap = {};

  expenses.forEach((expense) => {
    const paidId = expense.paidBy._id.toString();
    const paidName = expense.paidBy.name;
    const splitUsers = expense.splitBetween;

    const splitAmount = expense.amount / splitUsers.length;

    nameMap[paidId] = paidName;
    if (!balances[paidId]) balances[paidId] = 0;
    balances[paidId] += expense.amount;
    splitUsers.forEach((user) => {
      const userId = user._id
        ? user._id.toString()
        : user.toString();

      const userName = user.name || nameMap[userId] || "Unknown";
      nameMap[userId] = userName;

      if (!balances[userId]) balances[userId] = 0;
      const alreadyPaid = (expense.paidMembers || [])
        .map((p) => p.toString())
        .includes(userId);
      const isPayer = userId === paidId;

      if (!alreadyPaid && !isPayer) {
        balances[userId] -= splitAmount;
      } else if (isPayer) {

        balances[userId] -= splitAmount;
      }
    });
  });

  console.log("Balances:", balances);
  console.log("Names:", nameMap);

  const settlements = [];
  const bal = { ...balances };

  for (let i = 0; i < 100; i++) {
    const keys = Object.keys(bal);
    if (keys.length === 0) break;

    const minId = keys.reduce((a, b) => bal[a] < bal[b] ? a : b);
    const maxId = keys.reduce((a, b) => bal[a] > bal[b] ? a : b);

   
    if (Math.abs(bal[minId]) < 0.01) break;
    if (bal[maxId] < 0.01) break;

    const amount = Math.min(-bal[minId], bal[maxId]);

    settlements.push({
      fromId: minId,
      fromName: nameMap[minId] || "Unknown",
      toId: maxId,
      toName: nameMap[maxId] || "Unknown",
      amount: parseFloat(amount.toFixed(2)),
    });

    bal[minId] += amount;
    bal[maxId] -= amount;
  }

  console.log("Settlements:", settlements);

  return { balances, nameMap, settlements };
};

module.exports = calculateBalances;