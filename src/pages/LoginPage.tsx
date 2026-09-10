import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const {data} = await supabase.auth.getSession();

      if (data.session) {
        navigate("/admin", { replace: true });
      }
    };

    checkSession();
  }, [navigate]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    navigate("/admin");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-12">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-7 shadow-2xl shadow-slate-900/10 sm:p-9"
      >
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-amber-600">Field notes</p>
        <h1 className="mb-8 text-3xl font-semibold tracking-tight">Welcome back</h1>

        <label className="mb-2 block text-sm font-bold text-slate-700">
          Email
        </label>

        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="mb-5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 outline-none transition focus:border-amber-400 focus:bg-white"
        />

        <label className="mb-2 block text-sm font-bold text-slate-700">
          Password
        </label>

        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className="mb-5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 outline-none transition focus:border-amber-400 focus:bg-white"
        />

        {error && (
          <p className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-slate-900 px-4 py-3.5 font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-amber-600 disabled:cursor-wait disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}

export default LoginPage;