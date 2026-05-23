"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import API from "../../services/api";

export default function GroupDetails() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id;

  const [search, setSearch] = useState("");
  const [filterMember, setFilterMember] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");
  const [retrying, setRetrying] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [justAdded, setJustAdded] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [settlements, setSettlements] = useState({
    settlements: [],
    memberSummary: [],
  });
  const [editingId, setEditingId] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user"))
      : null;

 
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage("");
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

 
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([
        fetchExpenses(),
        fetchSettlements(),
        fetchGroupMembers(),
      ]);
      setLoading(false);
    };
    loadAll();
  }, []);

  
  useEffect(() => {
    if (groupMembers.length > 0) {
      setSelectedParticipants(groupMembers.map((m) => m._id));
    }
  }, [groupMembers]);

  // get all expense
  const fetchExpenses = async () => {
    try {
      const res = await API.get(`expense/expensegroup/${groupId}`);
      setExpenses(res.data);
    } catch (err) {
      setError(err.message || "Failed to load expenses");
    }
  };

  // get group members
  const fetchGroupMembers = async () => {
    try {
      const res = await API.get(`/group/getgroupbyid/${groupId}`);
      setGroupMembers(res.data.members);
    } catch (err) {
      console.log("fetchGroupMembers error:", err);
    }
  };

  // get settlements
  const fetchSettlements = async () => {
    try {
      const res = await API.get(`/settlement/${groupId}`);
      setSettlements(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // expense
  const addExpense = async (e) => {
    e.preventDefault();

    if (!paidBy) {
      setError("Please select who paid");
      return;
    }

    if (selectedParticipants.length === 0) {
      setError("Please select at least one participant");
      return;
    }

    // Duplicate check
    const isDuplicate = expenses.some((ex) => {
      const sameTitle =
        ex.description?.toLowerCase().trim() ===
        description.toLowerCase().trim();
      const sameAmount = Number(ex.amount) === Number(amount);
      const isRecent =
        Date.now() - new Date(ex.createdAt).getTime() < 10000;
      return sameTitle && sameAmount && isRecent;
    });

    if (isDuplicate) {
      setError("Duplicate! This expense was just added.");
      return;
    }

  
    const tempId = "temp_" + Date.now();
    const optimisticExpense = {
      _id: tempId,
      description,
      amount: parseFloat(amount),
      paidBy: {
        _id: paidBy,
        name: groupMembers.find((m) => m._id === paidBy)?.name || "You",
      },
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isTemp: true,
    };

    setExpenses((prev) => [optimisticExpense, ...prev]);
    setRetrying(true);

    try {
      const res = await API.post("/expense/addexpense", {
        description,
        amount,
        group: groupId,
        paidBy,
        splitBetween: selectedParticipants,
        date,
      });

      
      setExpenses((prev) =>
        prev.map((ex) => (ex._id === tempId ? res.data : ex))
      );

      setMessage("Expense added successfully!");
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 3000);
      setDescription("");
      setAmount("");
      setPaidBy("");
      setDate(new Date().toISOString().split("T")[0]);
      setSelectedParticipants(groupMembers.map((m) => m._id));
      fetchSettlements();

    } catch (err) {
  
      setExpenses((prev) => prev.filter((ex) => ex._id !== tempId));
      setError(err.message || "Failed to add expense");
    } finally {
      setRetrying(false);
    }
  };

  // update the existing expense
  const updateExpense = async (expenseId) => {
    try {
      await API.patch(`/expense/updateexpense/${expenseId}`, {
        description: editDescription,
        amount: editAmount,
      });
      setMessage("Expense updated!");
      setEditingId(null);
      fetchExpenses();
      fetchSettlements();
    } catch (err) {
      setError("Failed to update expense");
    }
  };

  // delete the existing expense
  const deleteExpense = async (expenseId) => {
    try {
      await API.delete(`/expense/deleteexpense/${expenseId}`);
      setMessage("Expense deleted!");
      fetchExpenses();
      fetchSettlements();
    } catch (err) {
      setError("Failed to delete expense");
    }
  };

  // add member to the group
  const addMember = async (e) => {
    e.preventDefault();
    try {
      await API.post("/group/addmember", { groupId, email });
      setMessage("Member added!");
      setEmail("");
      fetchGroupMembers();
    } catch (err) {
      setError("Failed to add member — make sure they are registered");
    }
  };

  // mark member paid
  const markAsPaid = async (userId) => {
    try {
      const res = await API.patch(`/expense/markpaid/${groupId}`, { userId });
      setMessage("Marked as paid!");
      fetchSettlements();
    } catch (err) {
      setError("Failed to mark as paid");
    }
  };

  // filters and searches
  const filteredExpenses = expenses
    .filter((expense) => {
      const matchSearch = expense.description
        ?.toLowerCase()
        .includes(search.toLowerCase());
      const matchMember = filterMember
        ? expense.paidBy?._id === filterMember ||
          expense.splitBetween?.some((m) => m._id === filterMember)
        : true;
      return matchSearch && matchMember;
    })
    .sort((a, b) => {
      if (sortOrder === "latest") {
        return (
          new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
        );
      }
      return (
        new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt)
      );
    });

  const cardThemes = [
    { icon: "bg-teal-100 text-teal-700", amount: "text-teal-700" },
    { icon: "bg-violet-100 text-violet-700", amount: "text-violet-700" },
    { icon: "bg-sky-100 text-sky-700", amount: "text-sky-700" },
    { icon: "bg-orange-100 text-orange-700", amount: "text-orange-700" },
    { icon: "bg-pink-100 text-pink-700", amount: "text-pink-700" },
  ];

  const memberColors = [
    "bg-teal-100 text-teal-700",
    "bg-violet-100 text-violet-700",
    "bg-orange-100 text-orange-700",
    "bg-sky-100 text-sky-700",
    "bg-pink-100 text-pink-700",
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent
                          rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-400">Loading group...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">

    
      {message && (
        <div className="fixed top-4 right-4 z-50 bg-teal-50 border border-teal-200
                        text-teal-700 px-4 py-3 rounded-2xl text-sm shadow-lg
                        flex items-center gap-2">
          ✓ {message}
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-50 border border-red-200
                        text-red-600 px-4 py-3 rounded-2xl text-sm shadow-lg
                        flex items-center gap-2">
          ✕ {error}
        </div>
      )}

      
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-2 text-sm text-gray-400
                   hover:text-gray-600 mb-5 transition-colors"
      >
        ← Back to dashboard
      </button>

      
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center
                        justify-center text-white text-lg">
          ✈
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            Group Expenses
          </h1>
          <p className="text-xs text-gray-400">
            {expenses.length} expenses · {groupMembers.length} members
          </p>
        </div>
      </div>

      
      <div className="mb-6">
        <p className="text-xs text-gray-400 mb-3 px-1">👥 Members</p>
        <div className="flex flex-wrap gap-2">
          {groupMembers.length === 0 ? (
            <div className="text-center py-6 w-full bg-white border
                            border-gray-200 rounded-2xl">
              <p className="text-2xl mb-2">👥</p>
              <p className="text-sm text-gray-400">
                No members yet — invite someone!
              </p>
            </div>
          ) : (
            groupMembers.map((member, index) => (
              <div
                key={member._id}
                className="bg-white border border-gray-200 rounded-2xl
                           px-3 py-2 flex items-center gap-2"
              >
                <div className={`w-6 h-6 rounded-full flex items-center
                                justify-center text-xs font-semibold
                                ${memberColors[index % memberColors.length]}`}>
                  {member.name?.charAt(0)?.toUpperCase()}
                </div>
                <span className="text-sm text-gray-700 capitalize">
                  {member.name}
                </span>
                {member._id === user?._id && (
                  <span className="text-xs bg-gray-100 text-gray-400
                                   px-1.5 py-0.5 rounded-full">
                    you
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

    
      <div className="grid md:grid-cols-2 gap-4 mb-6">

        {/* Add Expenses */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <p className="text-xs text-gray-400 mb-3">🧾 Add expense</p>
          <form onSubmit={addExpense} className="space-y-3">
            <input
              type="text"
              placeholder="Expense title e.g. Dinner"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full border border-gray-200 bg-gray-50 rounded-xl
                         px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-teal-400
                         focus:border-transparent transition"
            />
            <input
              type="number"
              placeholder="Amount (₹)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full border border-gray-200 bg-gray-50 rounded-xl
                         px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-teal-400
                         focus:border-transparent transition"
            />

            {/* Who paid */}
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              required
              className="w-full border border-gray-200 bg-gray-50 rounded-xl
                         px-4 py-2.5 text-sm text-gray-800
                         focus:outline-none focus:ring-2 focus:ring-teal-400
                         focus:border-transparent transition"
            >
              <option value="">Who paid?</option>
              {groupMembers.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}{member._id === user?._id ? " (you)" : ""}
                </option>
              ))}
            </select>

            {/* Participant checkboxes */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400">Split between</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedParticipants(groupMembers.map((m) => m._id))
                    }
                    className="text-xs text-teal-600 hover:text-teal-700"
                  >
                    All
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedParticipants([])}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    None
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                {groupMembers.map((member) => {
                  const isSelected = selectedParticipants.includes(member._id);
                  return (
                    <label
                      key={member._id}
                      className={`flex items-center gap-3 p-2 rounded-lg
                                  cursor-pointer transition-colors ${
                                    isSelected
                                      ? "bg-teal-50 border border-teal-200"
                                      : "border border-transparent hover:bg-gray-100"
                                  }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          setSelectedParticipants((prev) =>
                            prev.includes(member._id)
                              ? prev.filter((id) => id !== member._id)
                              : [...prev, member._id]
                          );
                        }}
                        className="accent-teal-600 w-4 h-4"
                      />
                      <span className="text-sm text-gray-700 flex-1 capitalize">
                        {member.name}
                        {member._id === user?._id && (
                          <span className="text-xs text-gray-400 ml-1">
                            (you)
                          </span>
                        )}
                      </span>
                      {amount && isSelected && (
                        <span className="text-xs font-medium text-teal-600">
                          ₹{(
                            parseFloat(amount) / selectedParticipants.length
                          ).toFixed(0)}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
              {amount && selectedParticipants.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200
                                flex justify-between">
                  <span className="text-xs text-gray-400">
                    ₹{parseFloat(amount).toFixed(0)} ÷{" "}
                    {selectedParticipants.length} people
                  </span>
                  <span className="text-xs font-medium text-teal-700">
                    ₹{(
                      parseFloat(amount) / selectedParticipants.length
                    ).toFixed(0)}{" "}
                    each
                  </span>
                </div>
              )}
            </div>

            {/* Date */}
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-200 bg-gray-50 rounded-xl
                         px-4 py-2.5 text-sm text-gray-800
                         focus:outline-none focus:ring-2 focus:ring-teal-400
                         focus:border-transparent transition"
            />

            <button
              type="submit"
              disabled={retrying || justAdded}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400
                         text-white text-sm font-medium py-2.5 rounded-xl
                         transition-colors flex items-center justify-center gap-2"
            >
              {retrying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white
                                  border-t-transparent rounded-full animate-spin" />
                  Adding...
                </>
              ) : justAdded ? (
                "✓ Added!"
              ) : (
                "+ Add expense"
              )}
            </button>
          </form>
        </div>

        {/* Add Member */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <p className="text-xs text-gray-400 mb-3">👤 Invite member</p>
          <form onSubmit={addMember} className="space-y-3">
            <input
              type="email"
              placeholder="Enter member's email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-200 bg-gray-50 rounded-xl
                         px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-violet-400
                         focus:border-transparent transition"
            />
            <p className="text-xs text-gray-400">
              They must already have an account
            </p>
            <button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-700 text-white
                         text-sm font-medium py-2.5 rounded-xl transition-colors"
            >
              + Add member
            </button>
          </form>
        </div>
      </div>

      {/* searches and filters*/}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 bg-white border border-gray-200 rounded-2xl
                        px-4 py-3 flex items-center gap-3">
          <span className="text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none text-sm bg-transparent
                       text-gray-800 placeholder-gray-400"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>
        <select
          value={filterMember}
          onChange={(e) => setFilterMember(e.target.value)}
          className="bg-white border border-gray-200 rounded-2xl px-4 py-3
                     text-sm text-gray-600 focus:outline-none focus:ring-2
                     focus:ring-teal-400 transition sm:w-44"
        >
          <option value="">All members</option>
          {groupMembers.map((member) => (
            <option key={member._id} value={member._id}>
              {member.name}
            </option>
          ))}
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="bg-white border border-gray-200 rounded-2xl px-4 py-3
                     text-sm text-gray-600 focus:outline-none focus:ring-2
                     focus:ring-teal-400 transition sm:w-44"
        >
          <option value="latest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {/* expenses*/}
      <p className="text-xs text-gray-400 mb-3 px-1">📋 Expenses</p>

      {/*  empty state */}
      {filteredExpenses.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200
                        rounded-2xl mb-6">
          {search || filterMember ? (
            <>
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-sm font-medium text-gray-700">
                No expenses match your filter
              </p>
              <p className="text-xs text-gray-400 mt-1 mb-3">
                Try a different search or clear filters
              </p>
              <button
                onClick={() => { setSearch(""); setFilterMember(""); }}
                className="text-xs text-teal-600 border border-teal-200
                           bg-teal-50 px-4 py-2 rounded-xl hover:bg-teal-100
                           transition-colors"
              >
                Clear filters
              </button>
            </>
          ) : (
            <>
              <p className="text-4xl mb-3">🧾</p>
              <p className="text-sm font-medium text-gray-700">
                No expenses yet
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Add your first expense using the form above
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredExpenses.map((expense, index) => {
            const theme = cardThemes[index % cardThemes.length];
            return (
              <div
                key={expense._id}
                className="bg-white border border-gray-200 rounded-2xl p-5
                           hover:-translate-y-1 hover:border-gray-300
                           transition-all duration-200"
              >
                {editingId === expense._id ? (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-400">✏ Editing</p>
                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full border border-gray-200 bg-gray-50
                                 rounded-xl px-3 py-2 text-sm focus:outline-none
                                 focus:ring-2 focus:ring-teal-400 transition"
                    />
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="w-full border border-gray-200 bg-gray-50
                                 rounded-xl px-3 py-2 text-sm focus:outline-none
                                 focus:ring-2 focus:ring-teal-400 transition"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateExpense(expense._id)}
                        className="flex-1 bg-teal-600 hover:bg-teal-700 text-white
                                   text-sm font-medium py-2 rounded-xl
                                   transition-colors"
                      >
                        ✓ Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 border border-gray-200 text-gray-500
                                   hover:bg-gray-50 text-sm py-2 rounded-xl
                                   transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    
                    {expense.isTemp && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="w-3 h-3 border-2 border-teal-400
                                        border-t-transparent rounded-full
                                        animate-spin" />
                        <span className="text-xs text-teal-500">Saving...</span>
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center
                                      justify-center font-semibold text-sm
                                      ${theme.icon}`}>
                        {expense.description?.charAt(0)?.toUpperCase() || "E"}
                      </div>
                      <span className={`text-base font-semibold ${theme.amount}`}>
                        ₹{Number(expense.amount).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <h2 className="text-sm font-semibold text-gray-800 mb-1">
                      {expense.description}
                    </h2>
                    <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                      👤 Paid by {expense.paidBy?.name || "Unknown"}
                    </p>
                    {expense.date && (
                      <p className="text-xs text-gray-400 mb-4">
                        📅{" "}
                        {new Date(expense.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingId(expense._id);
                          setEditDescription(expense.description);
                          setEditAmount(expense.amount);
                        }}
                        className="flex-1 text-xs font-medium py-2 rounded-xl
                                   border border-violet-200 bg-violet-50
                                   text-violet-700 hover:bg-violet-100
                                   transition-colors flex items-center
                                   justify-center gap-1"
                      >
                        ✏ Edit
                      </button>
                      <button
                        onClick={() => deleteExpense(expense._id)}
                        className="flex-1 text-xs font-medium py-2 rounded-xl
                                   border border-red-200 bg-red-50 text-red-600
                                   hover:bg-red-100 transition-colors flex
                                   items-center justify-center gap-1"
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

    
      <p className="text-xs text-gray-400 mb-3 px-1">👥 Member balances</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">

        {settlements.memberSummary?.length === 0 ? (
          <div className="col-span-3 text-center py-6 bg-white border
                          border-gray-200 rounded-2xl">
            <p className="text-2xl mb-2">⚖️</p>
            <p className="text-sm text-gray-400">
              Add expenses to see who owes what
            </p>
          </div>
        ) : (
          settlements.memberSummary?.map((member, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-2xl p-4
                         flex items-center gap-3"
            >
              <div className={`w-9 h-9 rounded-full flex items-center
                              justify-center text-xs font-semibold flex-shrink-0
                              ${
                                member.balance > 0
                                  ? "bg-teal-100 text-teal-700"
                                  : member.balance < 0
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}>
                {member.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800 capitalize">
                  {member.name}
                </p>
                <p className="text-xs text-gray-400">
                  {member.balance > 0
                    ? "gets back"
                    : member.balance < 0
                    ? "owes"
                    : "all even"}
                </p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
                              ${
                                member.balance > 0
                                  ? "bg-teal-50 text-teal-700"
                                  : member.balance < 0
                                  ? "bg-orange-50 text-orange-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}>
                {member.balance > 0
                  ? `+₹${member.balance}`
                  : member.balance < 0
                  ? `-₹${Math.abs(member.balance)}`
                  : "Settled ✓"}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Settlements list*/}
      <p className="text-xs text-gray-400 mb-3 px-1">⇄ Settle up</p>

  
      {settlements.settlements?.length === 0 ? (
        <div className="text-center py-8 bg-white border border-gray-200
                        rounded-2xl">
          {expenses.length === 0 ? (
            <>
              <p className="text-2xl mb-2">💸</p>
              <p className="text-sm font-medium text-gray-700">
                No expenses added yet
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Add an expense to see settlements
              </p>
            </>
          ) : (
            <>
              <p className="text-2xl mb-2">🎉</p>
              <p className="text-sm font-medium text-gray-700">
                All settled up!
              </p>
              <p className="text-xs text-gray-400 mt-1">Everyone is even</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {settlements.settlements?.map((item, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-2xl p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-9 h-9 rounded-full bg-orange-100
                                  text-orange-700 flex items-center
                                  justify-center text-xs font-semibold">
                    {item.fromName?.charAt(0)?.toUpperCase()}
                  </div>
                  <p className="text-xs text-gray-600 font-medium
                                text-center capitalize max-w-[60px] truncate">
                    {item.fromName}
                  </p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-sm font-semibold text-orange-600 mb-1">
                    ₹{item.amount}
                  </p>
                  <div className="flex items-center gap-1">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-gray-400 text-xs">owes</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-9 h-9 rounded-full bg-teal-100
                                  text-teal-700 flex items-center
                                  justify-center text-xs font-semibold">
                    {item.toName?.charAt(0)?.toUpperCase()}
                  </div>
                  <p className="text-xs text-gray-600 font-medium
                                text-center capitalize max-w-[60px] truncate">
                    {item.toName}
                  </p>
                </div>
              </div>

              {item.fromId?.toString() === user?._id?.toString() ? (
                <button
                  onClick={() => markAsPaid(item.fromId)}
                  className="w-full py-2 rounded-xl border text-xs font-medium
                             transition-colors bg-teal-50 border-teal-200
                             text-teal-700 hover:bg-teal-100"
                >
                  ✓ I paid — Mark as done
                </button>
              ) : item.toId?.toString() === user?._id?.toString() ? (
                <div className="w-full py-2 rounded-xl text-center text-xs
                                font-medium bg-orange-50 text-orange-600
                                border border-orange-200">
                  ⏳ Waiting for {item.fromName} to pay
                </div>
              ) : (
                <div className="w-full py-2 rounded-xl text-center text-xs
                                font-medium bg-gray-50 text-gray-400
                                border border-gray-200">
                  {item.fromName} owes {item.toName}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}