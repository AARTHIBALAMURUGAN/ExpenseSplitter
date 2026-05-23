"use client";

import { useState,useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "../services/api";

function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message,setMessage]=useState("");
  const[error,setError]=useState("")

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
       await new Promise((resolve) =>
      setTimeout(resolve, 1200)
    );

    // Fake random failure (10%)
    if (Math.random() < 0.1) {

      throw new Error(
        "Network unstable — please retry"
      );

    }
      const res = await API.post("/user/login", formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));
      router.push("/dashboard");
      setMessage("Login succesfull")
    } catch (err) {
      console.log(err);
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  
    if (message || error) {
  
      const timer = setTimeout(() => {
  
        setMessage("");
        setError("");
  
      }, 3000);
  
      return () => clearTimeout(timer);
  
    }
  
  }, [message, error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        
       {message && (
  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl mb-4">
    {message}
  </div>
)}

{error && (
  <div className="bg-red-100 border border-red-400
                  text-red-700 px-4 py-3 rounded-xl mb-4
                  text-center">

    <p>{error}</p>

    <button
      onClick={handleSubmit}
      className="mt-2 bg-red-500 hover:bg-red-600
                 text-white px-4 py-1.5 rounded-lg text-sm"
    >
      Retry
    </button>

  </div>
)}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center
                          justify-center text-white text-2xl mx-auto mb-4">
            ⇄
          </div>
          <h1 className="text-xl font-semibold text-gray-800">
            Expense Splitter
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Sign in to manage your expenses
          </p>
        </div>

  
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <p className="text-xs text-gray-400 mb-4">Welcome back</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              name="email"
              placeholder="Email address"
              onChange={handleChange}
              required
              className="w-full border border-gray-200 bg-gray-50 rounded-xl
                         px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-teal-400
                         focus:border-transparent transition"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
              className="w-full border border-gray-200 bg-gray-50 rounded-xl
                         px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-teal-400
                         focus:border-transparent transition"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400
                         text-white text-sm font-medium py-2.5 rounded-xl
                         transition-colors mt-1"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        
        <p className="text-center text-xs text-gray-400 mt-4">
          Don't have an account?{" "}
          <span
            onClick={() => router.push("/register")}
            className="text-teal-600 hover:text-teal-700 cursor-pointer font-medium"
          >
            Create one
          </span>
        </p>

      </div>
    </div>
  );
}

export default Login;