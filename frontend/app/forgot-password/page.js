"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound, Lock, Send, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import styles from "../login/login.module.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1: Request Code, 2: Reset Password, 3: Success
  const [mockCode, setMockCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process request.");

      setNotice(data.message);
      if (data.code) {
        setMockCode(data.code);
        setCode(data.code); // Prefill code for ease of manual testing
      }
      setStep(2);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password.");

      setStep(3);
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
          
          {step === 1 && (
            <>
              <div className={styles.header}>
                <h2 className={styles.title}>Forgot Password?</h2>
                <p className={styles.subtitle}>Enter your email to receive a password reset verification code.</p>
              </div>

              {error && <div className={styles.alert} style={{ background: 'var(--coral-light)', color: 'var(--coral)', borderColor: '#e5b8af' }}>{error}</div>}

              <form onSubmit={handleRequestCode} className={styles.form}>
                <div className={styles.field}>
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. user@gmail.com" 
                    required 
                  />
                </div>

                <button type="submit" disabled={loading} className={styles.btn}>
                  <Send size={18} />
                  {loading ? "Sending..." : "Request Reset Code"}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div className={styles.header}>
                <h2 className={styles.title}>Reset Password</h2>
                <p className={styles.subtitle}>Enter the verification code and set your new password.</p>
              </div>

              {error && <div className={styles.alert} style={{ background: 'var(--coral-light)', color: 'var(--coral)', borderColor: '#e5b8af' }}>{error}</div>}
              {notice && (
                <div className={styles.alert} style={{ background: 'var(--moss-light)', color: 'var(--moss)', borderColor: '#c7d9c9' }}>
                  {notice}
                </div>
              )}

              {mockCode && (
                <div style={{ background: '#fdf8ee', border: '1px solid #f6f3ec', padding: '12px', borderRadius: '6px', fontSize: '13px', color: 'var(--marigold)', fontWeight: '600', marginBottom: '16px', textAlign: 'center' }}>
                  Mock System Code: {mockCode} (Logged to terminal)
                </div>
              )}

              <form onSubmit={handleResetPassword} className={styles.form}>
                <div className={styles.field}>
                  <label>Verification Code</label>
                  <input 
                    type="text" 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter 6-digit code" 
                    required 
                  />
                </div>

                <div className={styles.field}>
                  <label>New Password</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters" 
                    required 
                  />
                </div>

                <div className={styles.field}>
                  <label>Confirm Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password" 
                    required 
                  />
                </div>

                <button type="submit" disabled={loading} className={styles.btn} style={{ background: 'var(--indigo-deep)' }}>
                  <Lock size={18} />
                  {loading ? "Resetting..." : "Update Password"}
                </button>
              </form>
            </>
          )}

          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: '56px', height: '56px', background: 'var(--moss-light)', color: 'var(--moss)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Check size={28} />
              </div>
              <h2 className={styles.title}>Password Reset Complete</h2>
              <p className={styles.subtitle} style={{ marginBottom: '24px' }}>
                Your password has been updated successfully. You can now use your new password to log in.
              </p>
              <Link href="/login" className={styles.btn} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', textDecoration: 'none' }}>
                Go to Login
              </Link>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link href="/login" style={{ fontSize: '13px', color: 'var(--indigo)', textDecoration: 'underline' }}>
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
