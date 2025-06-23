import { useState } from "react";

export default function AdminRegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAdminRegister = () => {
    alert(`Registered as admin: ${email}`);
    // Hook your backend admin registration here
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Admin Registration</h2>
      <input
        className="border p-2 w-full mb-3 rounded"
        type="email"
        placeholder="Admin Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        className="border p-2 w-full mb-3 rounded"
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button
        onClick={handleAdminRegister}
        className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded w-full"
      >
        Register as Admin
      </button>
    </div>
  );
}
