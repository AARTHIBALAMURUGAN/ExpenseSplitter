"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "../services/api.js";

function Dashboard() {
  const router = useRouter();
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [message,setMessage]=useState("")
  const [error,seterror]=useState("")
  

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user"))
      : null;

  const fetchGroup = async () => {
    try {
      const res = await API.get("/group/getgroup");
      setGroups(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const createGroup = async (e) => {
    e.preventDefault();
    try {
      await API.post("/group/creategroup", {
        groupname: groupName,
        members: [user._id],
        createdBy: user._id,
      });
      setMessage("Group Created");
      setGroupName("");
      
      fetchGroup();
    } catch (err) {
      console.log(err);
      seterror("Failed");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
    fetchGroup();
  }, []);
  useEffect(() => {

  if (message || error) {

    const timer = setTimeout(() => {

      setMessage("");
      seterror("");

    }, 3000);

    return () => clearTimeout(timer);

  }

}, [message, error]);

 
  const themes = [
    {
      icon: "bg-teal-100 text-teal-700",
      badge: "bg-teal-100 text-teal-700",
      btn: "text-teal-700 hover:bg-teal-50 border-teal-200",
    },
    {
      icon: "bg-violet-100 text-violet-700",
      badge: "bg-violet-100 text-violet-700",
      btn: "text-violet-700 hover:bg-violet-50 border-violet-200",
    },
    {
      icon: "bg-orange-100 text-orange-700",
      badge: "bg-orange-100 text-orange-700",
      btn: "text-orange-700 hover:bg-orange-50 border-orange-200",
    },
    {
      icon: "bg-sky-100 text-sky-700",
      badge: "bg-sky-100 text-sky-700",
      btn: "text-sky-700 hover:bg-sky-50 border-sky-200",
    },
    {
      icon: "bg-pink-100 text-pink-700",
      badge: "bg-pink-100 text-pink-700",
      btn: "text-pink-700 hover:bg-pink-50 border-pink-200",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
   {message && (
  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl mb-4">
    {message}
  </div>
)}

{error && (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4">
    {error}
  </div>
)}
      <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4
                      flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
     
          <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center
                          justify-center text-white text-lg">
            ⇄
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-800">
              Expense Splitter
            </h1>
            <p className="text-xs text-gray-400">Manage your shared expenses</p>
          </div>
        </div>

        <button
          onClick={() => { localStorage.clear(); router.push("/login"); }}
          className="flex items-center gap-2 text-sm font-medium text-orange-600
                     border border-orange-200 px-4 py-2 rounded-xl
                     hover:bg-orange-50 transition-colors"
        >
          ↩ Logout
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl px-6 py-5 mb-6">
        <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
          ＋ Create a new group
        </p>
        <form onSubmit={createGroup} className="flex gap-3">
          <input
            type="text"
            placeholder="Enter group name, e.g. Goa Trip 2024"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="flex-1 border border-gray-200 bg-gray-50 rounded-xl
                       px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-teal-400
                       focus:border-transparent transition"
          />
          <button
            type="submit"
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm
                       font-medium px-5 py-2.5 rounded-xl transition-colors
                       flex items-center gap-1 whitespace-nowrap"
          >
            ＋ Create
          </button>
        </form>
      </div>

      <p className="text-xs text-gray-400 mb-3 flex items-center gap-1 px-1">
        👥 Your groups
      </p>

    
      {groups.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🗂️</p>
          <p className="text-sm">No groups yet — create one above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group, index) => {
            const theme = themes[index % themes.length];
            return (
              <div
                key={group._id}
                className="bg-white border border-gray-200 rounded-2xl p-5
                           hover:-translate-y-1 hover:border-gray-300
                           transition-all duration-200"
              >
                
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center
                                  justify-center text-base font-semibold
                                  ${theme.icon}`}>
                    {group.groupname?.charAt(0)?.toUpperCase() || "G"}
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1
                                   rounded-full ${theme.badge}`}>
                    {group.members.length} members
                  </span>
                </div>

               
                <h2 className="text-base font-semibold text-gray-800 mb-1">
                  {group.groupname}
                </h2>
                

               
                <button
                  onClick={() => router.push(`/groups/${group._id}`)}
                  className={`w-full py-2 rounded-xl border text-sm font-medium
                              transition-colors ${theme.btn}`}
                >
                  Open group →
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Dashboard;