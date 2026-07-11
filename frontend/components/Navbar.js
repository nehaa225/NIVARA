"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, LogOut, LayoutDashboard, HeartHandshake } from "lucide-react";
import { useLanguage } from "@/components/common/LanguageContext";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentLanguage, changeLanguage, languagesList } = useLanguage();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");
    const status = localStorage.getItem("ngoStatus");
    
    if (token && role) {
      setUser({ token, role, email, status });
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("ngoStatus");
    setUser(null);
    router.push("/");
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "ADMIN") return "/admin-dashboard";
    if (user.role === "NGO") {
      if (user.status === "APPROVED") return "/dashboard";
      return "/verification-status";
    }
    return "/";
  };

  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.brand}>
        <div className={styles.seal}>N</div>
        <span className={styles.brandName}>NIVARA</span>
      </Link>

      <ul className={styles.navLinks}>
        <li>
          <Link 
            href="/" 
            className={`${styles.navLink} ${pathname === "/" ? styles.navLinkActive : ""}`}
          >
            Home
          </Link>
        </li>
        {user && (user.role === "CITIZEN" || user.role === "ORG" || user.role === "NGO") && (
          <li>
            <Link 
              href="/donations" 
              className={`${styles.navLink} ${pathname === "/donations" ? styles.navLinkActive : ""}`}
            >
              Donations
            </Link>
          </li>
        )}
        {user && (user.role === "ORG" || user.role === "NGO") && (
          <li>
            <Link 
              href="/events" 
              className={`${styles.navLink} ${pathname === "/events" ? styles.navLinkActive : ""}`}
            >
              Events
            </Link>
          </li>
        )}
        {user && (user.role === "CITIZEN" || user.role === "ORG" || user.role === "NGO") && (
          <li>
            <Link 
              href="/jobs" 
              className={`${styles.navLink} ${pathname === "/jobs" ? styles.navLinkActive : ""}`}
            >
              Jobs
            </Link>
          </li>
        )}

        <li>
          <Link 
            href="/about" 
            className={`${styles.navLink} ${pathname === "/about" ? styles.navLinkActive : ""}`}
          >
            About
          </Link>
        </li>
      </ul>

      <div className={styles.actions} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '6px' }}>
          <span style={{ fontSize: '13px' }}>🌐</span>
          <select
            value={currentLanguage}
            onChange={(e) => changeLanguage(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid var(--line)',
              fontSize: '12.5px',
              background: '#fff',
              cursor: 'pointer',
              fontWeight: '600',
              color: 'var(--indigo-deep)',
              outline: 'none'
            }}
          >
            {languagesList.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>

        {user ? (
          <>
            <Link href={getDashboardLink()} className={`${styles.btn} ${styles.btnGhost}`}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <LayoutDashboard size={16} />
                Dashboard
              </span>
            </Link>
            <button onClick={handleLogout} className={`${styles.btn} ${styles.btnDanger}`}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <LogOut size={16} />
                Logout
              </span>
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className={`${styles.navLink} ${styles.btn} ${styles.btnGhost}`}>
              Login
            </Link>
            <Link href="/register-ngo" className={`${styles.btn} ${styles.btnPrimary}`}>
              Register NGO
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
