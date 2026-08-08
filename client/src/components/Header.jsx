

import { SearchCheck, CalendarDays, Clock, User, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const currentTime = time.toLocaleTimeString("en-IN");

  return (
    <header className="header">
      <div className="header-inner">
        {/* Left Side */}
        <div className="header-brand">
          <div className="header-icon">
            <SearchCheck size={26} />
          </div>

          <h1 className="header-title">VOTER SEARCH PORTAL</h1>
        </div>

        {/* Right Side */}
        <div className="header-right">
          <div className="header-date">
            <CalendarDays size={18} />
            <span>Date : {today}</span>
          </div>

          <div className="header-time">
            <Clock size={18} />
            <span>Time : {currentTime}</span>
          </div>

          <div className="header-user">
            <User size={22} />
            <span>Admin</span>
          </div>

          <button
            className="btn btn-navy header-admin-btn"
            onClick={() => navigate("/admin/login")}
          >
            <ShieldCheck size={18} />
            Admin
          </button>
        </div>
      </div>
    </header>
  );
}

