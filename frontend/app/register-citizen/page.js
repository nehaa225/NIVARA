"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import Navbar from "@/components/Navbar";
import styles from "../login/login.module.css";

export default function RegisterCitizen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/register-citizen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Citizen registration failed.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("email", data.user.email);
      localStorage.setItem("citizenName", data.citizen.name);

      router.push("/");
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
            <h2 className={styles.title}>Citizen Signup</h2>
            <p className={styles.subtitle}>Register to browse job postings and donate resources</p>
          </div>

          {error && <div className={styles.alert}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label>Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ramesh Kumar" required />
            </div>

            <div className={styles.field}>
              <label>Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 9876543210" required />
            </div>

            <div className={styles.field}>
              <label>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. ramesh@gmail.com" required />
            </div>

            <div className={styles.field}>
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required />
            </div>

            <button type="submit" disabled={loading} className={styles.btn}>
              <UserPlus size={18} />
              {loading ? "Registering..." : "Create Citizen Account"}
            </button>
          </form>

          <p className={styles.footerNote}>
            Already have an account? <Link href="/login">Log in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
