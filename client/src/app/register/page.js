"use client";

import { useState,useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "../services/api";

function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobile_no: "",
  });
  const [loading, setLoading] = useState(false);
  const[message,setMessage]=useState("");
  const [error,setError]=useState("")

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  setMessage("");


  if (formData.name.trim().length < 3) {

    setError(
      "Name must be at least 3 characters"
    );

    return;

  }


  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    !emailRegex.test(formData.email)
  ) {

    setError("Enter valid email");

    return;

  }

  if (
    formData.password.length < 8
  ) {

    setError(
      "Password must be at least 8 characters"
    );

    return;

  }


  const mobileRegex = /^[0-9]{10}$/;

  if (
    !mobileRegex.test(
      formData.mobile_no
    )
  ) {

    setError(
      "Mobile number must be 10 digits"
    );

    return;

  }

    setLoading(true);
    try {
      await API.post("/user/register", formData);
      setMessage("Registration successful!");
      router.push("/login");
    } catch (err) {
      console.log(err);
      setError("Registration failed");
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
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4">
    {error}
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
            Create your account to get started
          </p>
        </div>

        
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <p className="text-xs text-gray-400 mb-4">New account</p>

          <form onSubmit={handleSubmit} className="space-y-3">

            
            <div>
              <p className="text-xs text-gray-400 mb-1.5">Full name</p>
              <input
                type="text"
                name="name"
                placeholder="Alex Johnson"
                onChange={handleChange}
                required
                className="w-full border border-gray-200 bg-gray-50 rounded-xl
                           px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-teal-400
                           focus:border-transparent transition"
              />
            </div>

            
            <div>
              <p className="text-xs text-gray-400 mb-1.5">Email address</p>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                onChange={handleChange}
                required
                className="w-full border border-gray-200 bg-gray-50 rounded-xl
                           px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-teal-400
                           focus:border-transparent transition"
              />
            </div>

            
            <div>
              <p className="text-xs text-gray-400 mb-1.5">Password</p>
              <input
                type="password"
                name="password"
                placeholder="Min. 8 characters"
                onChange={handleChange}
                required
                className="w-full border border-gray-200 bg-gray-50 rounded-xl
                           px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-teal-400
                           focus:border-transparent transition"
              />
            </div>

        
            <div>
              <p className="text-xs text-gray-400 mb-1.5">Mobile number</p>
              <input
                type="text"
                name="mobile_no"
                placeholder="+91 98765 43210"
                onChange={handleChange}
                required
                className="w-full border border-gray-200 bg-gray-50 rounded-xl
                           px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-teal-400
                           focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400
                         text-white text-sm font-medium py-2.5 rounded-xl
                         transition-colors mt-1"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>

          </form>
        </div>

      
        <p className="text-center text-xs text-gray-400 mt-4">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-teal-600 hover:text-teal-700 cursor-pointer font-medium"
          >
            Sign in
          </span>
        </p>

      </div>
    </div>
  );
}

export default Register;