

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { api } from "../api";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.adminLogin(username, password);
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUsername", data.username);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <main className="app-main" style={{ maxWidth: 420, margin: "80px auto" }}>
        <section className="card">
          <h2 className="section-title">
            <LogIn size={20} />
            ADMIN LOGIN
          </h2>

          <form onSubmit={handleSubmit} className="filters-grid" style={{ gridTemplateColumns: "1fr" }}>
            <div className="field">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p style={{ color: "#dc3545", margin: 0 }}>{error}</p>}

            <button className="btn btn-navy" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
