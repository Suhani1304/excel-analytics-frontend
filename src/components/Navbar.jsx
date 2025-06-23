import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between">
      <div className="font-bold">Excel Analytics</div>
      <div className="space-x-4">
        <Link to="/" className="hover:underline">Login</Link>
        <Link to="/register" className="hover:underline">Register</Link>
        <Link to="/admin-register" className="hover:underline">Admin</Link>
        <Link to="/dashboard" className="hover:underline">Dashboard</Link>
        <Link to="/upload" className="hover:underline">Upload</Link>
        <Link to="/chart" className="hover:underline">Chart</Link>
      </div>
    </nav>
  );
}
