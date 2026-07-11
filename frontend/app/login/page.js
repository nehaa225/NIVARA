"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import Navbar from "@/components/Navbar";
import styles from "./login.module.css";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed. Please check credentials.");
        setLoading(false);
        return;
      }

      // Store auth session
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("email", data.user.email);
      
      if (data.user.role === "NGO" && data.ngo) {
        localStorage.setItem("ngoStatus", data.ngo.status);
        localStorage.setItem("ngoId", data.ngo.id);
        if (data.ngo.status === "APPROVED") {
          router.push("/dashboard");
        } else {
          router.push("/verification-status");
        }
      } else if (data.user.role === "ORG" && data.organization) {
        localStorage.setItem("orgStatus", data.organization.status);
        localStorage.setItem("orgName", data.organization.name);
        if (data.organization.status === "APPROVED") {
          router.push("/");
        } else {
          router.push("/verification-status");
        }
      } else if (data.user.role === "CITIZEN" && data.citizen) {
        localStorage.setItem("citizenName", data.citizen.name);
        router.push("/");
      } else if (data.user.role === "ADMIN") {
        router.push("/admin-dashboard");
      } else {
        router.push("/");
      }

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
            <h2 className={styles.title}>Welcome back</h2>
            <p className={styles.subtitle}>Log in to access your dashboard</p>
          </div>

          {error && <div className={styles.alert}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label>Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. contact@prajwala.org" 
                required 
                suppressHydrationWarning
              />
            </div>

            <div className={styles.field}>
              <label>Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password" 
                required 
                suppressHydrationWarning
              />
              <div style={{ textAlign: 'right', marginTop: '6px' }}>
                <Link href="/forgot-password" style={{ fontSize: '12px', color: 'var(--indigo)', textDecoration: 'underline' }}>
                  Forgot password?
                </Link>
              </div>
            </div>

            <button type="submit" disabled={loading} className={styles.btn} suppressHydrationWarning>
              <LogIn size={18} />
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <p className={styles.footerNote}>
            Need an account? Register as an <Link href="/register-ngo">NGO</Link>, <Link href="/register-citizen">Citizen</Link>, or <Link href="/register-org">Organization</Link>.
          </p>

          <Link href="/admin-login" className={styles.adminLink}>
            Access Admin Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
