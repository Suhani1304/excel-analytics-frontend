import { useState } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = () => {
    alert(`Registered as user: ${email}`);
    // You can call your backend API here
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">User Registration</h2>
      <input
        className="border p-2 w-full mb-3 rounded"
        type="email"
        placeholder="Email"
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
        onClick={handleRegister}
        className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded w-full"
      >
        Register
      </button>
    </div>
  );
}
