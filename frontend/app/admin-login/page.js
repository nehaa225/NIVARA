"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import Navbar from "@/components/Navbar";
import styles from "../login/login.module.css";

export default function AdminLogin() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ passcode })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Incorrect passcode.");
      }

      // Store auth session
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("email", data.user.email);

      router.push("/admin-dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        <div className={`${styles.loginCard} animate-slide`}>
          <div className={styles.header}>
            <div style={{ display: 'inline-flex', padding: '10px', background: 'rgba(221, 154, 46, 0.1)', color: 'var(--marigold)', borderRadius: '50%', marginBottom: '14px' }}>
              <ShieldAlert size={28} />
            </div>
            <h2 className={styles.title}>Admin Portal</h2>
            <p className={styles.subtitle}>Enter the admin passcode to access metrics & verification states</p>
          </div>

          {error && <div className={styles.alert}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label>Passcode</label>
              <input 
                type="password" 
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter admin passcode" 
                required 
              />
            </div>

            <button type="submit" disabled={loading} className={styles.btn} style={{ background: 'var(--indigo-deep)' }}>
              {loading ? "Authorizing..." : "Enter Admin Panel"}
            </button>
          </form>

          <p className={styles.adminLink} style={{ color: '#9a9888', marginTop: '24px' }}>
            Demo Passcode: <b>NIVARA-ADMIN</b>
          </p>
        </div>
      </div>
    </div>
  );
}
