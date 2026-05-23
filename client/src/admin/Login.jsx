import { useState } from "react";
import toast from "react-hot-toast";
import { Navigate, useNavigate } from "react-router-dom";
import SEO from "../components/SEO.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { admin, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "admin@example.com", password: "admin12345" });
  const [loading, setLoading] = useState(false);

  if (admin) return <Navigate to="/admin" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back");
      navigate("/admin");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Admin Login | Portfolio" description="Secure admin login." />
      <main className="grid min-h-screen place-items-center px-5">
        <form onSubmit={submit} className="panel w-full max-w-md rounded-lg p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2a6fdb] dark:text-[#8fd694]">Admin</p>
          <h1 className="mt-3 text-3xl font-bold">Sign in</h1>
          <div className="mt-8 grid gap-5">
            <label className="grid gap-2">
              <span className="label">Email</span>
              <input className="input" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
            </label>
            <label className="grid gap-2">
              <span className="label">Password</span>
              <input className="input" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
            </label>
            <button className="button-primary" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
