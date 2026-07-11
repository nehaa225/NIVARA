"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import styles from "../login/login.module.css";

export default function RegisterOrg() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sector, setSector] = useState("");
  const [regid, setRegid] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/register-org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, sector, regid })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Organization registration failed.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("email", data.user.email);
      localStorage.setItem("orgStatus", data.organization.status);
      localStorage.setItem("orgName", data.organization.name);

      router.push("/verification-status");
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
            <h2 className={styles.title}>Organization Signup</h2>
            <p className={styles.subtitle}>Register to post CSR collaboration requests and host events</p>
          </div>

          {error && <div className={styles.alert}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label>Organization Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Acme CSR Foundation" required />
            </div>

            <div className={styles.field}>
              <label>Focus Sector</label>
              <input type="text" value={sector} onChange={(e) => setSector(e.target.value)} placeholder="e.g. CSR, Rural Health, Education" required />
            </div>

            <div className={styles.field}>
              <label>Registration / CIN Number</label>
              <input type="text" value={regid} onChange={(e) => setRegid(e.target.value)} placeholder="e.g. U74999TG2015NPL098765" required />
            </div>

            <div className={styles.field}>
              <label>Corporate Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. csr@acme.com" required />
            </div>

            <div className={styles.field}>
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required />
            </div>

            <button type="submit" disabled={loading} className={styles.btn} style={{ background: 'var(--indigo-deep)' }}>
              <Building2 size={18} />
              {loading ? "Registering..." : "Submit Org Verification"}
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
