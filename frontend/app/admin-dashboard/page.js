"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  RefreshCw, ShieldCheck, Check, AlertOctagon, 
  ExternalLink, FileText, BarChart3, Clock, AlertTriangle 
} from "lucide-react";
import Navbar from "@/components/Navbar";
import styles from "./admin.module.css";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending"); // pending | approved | rejected
  
  // Data State
  const [analytics, setAnalytics] = useState({
    totalNgos: 0, pendingNgos: 0, approvedNgos: 0, rejectedNgos: 0,
    totalOrgs: 0, pendingOrgs: 0, approvedOrgs: 0, rejectedOrgs: 0
  });
  const [ngos, setNgos] = useState({ pending: [], approved: [], rejected: [] });
  const [orgs, setOrgs] = useState({ pending: [], approved: [], rejected: [] });
  
  // Modal State for Rejection Feedback
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedType, setSelectedType] = useState("NGO"); // NGO | ORG
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchNgos = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      if (!token || role !== "ADMIN") {
        router.push("/login");
        return;
      }

      const res = await fetch("http://localhost:5000/api/admin/ngos", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load admin data.");
      }

      setAnalytics(data.analytics);
      setNgos(data.ngos);
      setOrgs(data.orgs || { pending: [], approved: [], rejected: [] });

    } catch (err) {
      console.error(err);
      localStorage.clear();
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNgos();
  }, []);

  const handleVerify = async (id, type, action, reason = "") => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = type === "NGO" 
        ? "http://localhost:5000/api/admin/verify"
        : "http://localhost:5000/api/admin/verify-org";

      const payload = type === "NGO"
        ? { ngoId: id, action, reason }
        : { orgId: id, action, reason };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to perform action.");
      }

      setShowRejectModal(false);
      setRejectionReason("");
      setSelectedId(null);
      
      // Refresh list
      await fetchNgos(false);

    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (id, type) => {
    setSelectedId(id);
    setSelectedType(type);
    setShowRejectModal(true);
  };

  const getDocTypeLabel = (type) => {
    const labels = {
      REG_CERT: "Registration Certificate",
      PAN: "NGO PAN Copy",
      TRUST_CERT: "12A/80G Trust Cert",
      ANNUAL_REPORT: "Annual Report",
      FINANCIAL_REPORT: "Financial Audit",
      PHOTO: "Field Photo"
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '16px', background: 'var(--paper)' }}>
        <RefreshCw size={36} className="animate-spin" style={{ color: 'var(--indigo)' }} />
        <p style={{ color: '#6b6a5f', fontSize: '15px' }}>Loading admin console...</p>
      </div>
    );
  }

  const activeNgoList = ngos[activeTab] || [];
  const activeOrgList = orgs[activeTab] || [];
  const hasSubmissions = activeNgoList.length > 0 || activeOrgList.length > 0;

  return (
    <div>
      <Navbar />

      <main className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Admin Verification Console</h1>
            <p style={{ color: '#6b6a5f', fontSize: '14px', marginTop: '4px' }}>Review and verify NGO & Organization registration submissions</p>
          </div>
          <button onClick={() => fetchNgos(true)} className={styles.btn} style={{ background: 'var(--white)', color: 'var(--indigo-deep)', border: '1px solid var(--line)' }}>
            <RefreshCw size={16} /> Refetch List
          </button>
        </header>

        {/* Analytics ribbon */}
        <section className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statVal}>{analytics.totalNgos + analytics.totalOrgs}</div>
            <div className={styles.statLabel}>Total (NGOs + Orgs)</div>
          </div>

          <div className={styles.statCard} style={{ borderLeft: '4px solid var(--marigold)' }}>
            <div className={styles.statVal} style={{ color: 'var(--marigold)' }}>{analytics.pendingNgos + analytics.pendingOrgs}</div>
            <div className={styles.statLabel}>Pending evaluation</div>
          </div>

          <div className={styles.statCard} style={{ borderLeft: '4px solid var(--moss)' }}>
            <div className={styles.statVal} style={{ color: 'var(--moss)' }}>{analytics.approvedNgos + analytics.approvedOrgs}</div>
            <div className={styles.statLabel}>Approved Accounts</div>
          </div>

          <div className={styles.statCard} style={{ borderLeft: '4px solid var(--coral)' }}>
            <div className={styles.statVal} style={{ color: 'var(--coral)' }}>{analytics.rejectedNgos + analytics.rejectedOrgs}</div>
            <div className={styles.statLabel}>Corrections Requested</div>
          </div>
        </section>

        {/* Tabs selectors */}
        <div className={styles.tabs}>
          <button 
            onClick={() => setActiveTab("pending")} 
            className={`${styles.tab} ${activeTab === "pending" ? styles.tabActive : ""}`}
          >
            Pending ({ngos.pending.length + orgs.pending.length})
          </button>
          <button 
            onClick={() => setActiveTab("approved")} 
            className={`${styles.tab} ${activeTab === "approved" ? styles.tabActive : ""}`}
          >
            Approved ({ngos.approved.length + orgs.approved.length})
          </button>
          <button 
            onClick={() => setActiveTab("rejected")} 
            className={`${styles.tab} ${activeTab === "rejected" ? styles.tabActive : ""}`}
          >
            Rejected ({ngos.rejected.length + orgs.rejected.length})
          </button>
        </div>

        {/* Table lists */}
        <section className={styles.ngoList}>
          {hasSubmissions ? (
            <>
              {/* 1. NGO List */}
              {activeNgoList.length > 0 && (
                <div>
                  <h2 style={{ fontSize: '18px', color: 'var(--indigo-deep)', margin: '10px 0 16px' }}>NGO Applications ({activeNgoList.length})</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {activeNgoList.map((ngo) => (
                      <div key={ngo.id} className={`${styles.ngoCard} animate-fade`}>
                        <div className={styles.ngoHeader}>
                          <div>
                            <h3 className={styles.ngoName}>{ngo.name}</h3>
                            <span className={styles.ngoMeta}>
                              Established: {ngo.yearEstablished} &bull; Reg: {ngo.regNumber} &bull; Type: {ngo.regType}
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', fontFamily: 'IBM Plex Mono, monospace', color: '#9a9888' }}>
                            Submitted: {new Date(ngo.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <div className={styles.ngoSection}>
                          <div>
                            <div className={styles.sectionLabel}>Contact Details</div>
                            <div className={styles.sectionVal}>{ngo.founderName}</div>
                            <div className={styles.sectionVal} style={{ fontSize: '12px', color: '#6b6a5f' }}>
                              {ngo.mobile} &bull; {ngo.email}
                            </div>
                          </div>

                          <div>
                            <div className={styles.sectionLabel}>Location</div>
                            <div className={styles.sectionVal} style={{ fontSize: '13px' }}>
                              {ngo.address}, {ngo.district}, {ngo.state} - {ngo.pinCode}
                            </div>
                          </div>

                          <div>
                            <div className={styles.sectionLabel}>Financial Scope</div>
                            <div className={styles.sectionVal}>Budget: {ngo.annualBudget}</div>
                            <div className={styles.sectionVal} style={{ fontSize: '12px', color: '#6b6a5f' }}>
                              Need: {ngo.fundingNeeded} &bull; Current: {ngo.currentFunding}
                            </div>
                          </div>
                        </div>

                        {/* AI Verification Results Section */}
                        <div style={{ background: '#fdfcf9', border: '1px solid var(--line)', padding: '16px', borderRadius: '8px', margin: '14px 0', display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '16px', alignItems: 'center' }}>
                          <div style={{ textAlign: 'center', borderRight: '1px solid var(--line)', paddingRight: '16px' }}>
                            <div style={{ fontSize: '28px', fontWeight: '800', color: (ngo.readinessScore || 30) >= 85 ? 'var(--moss)' : 'var(--marigold)' }}>
                              {ngo.readinessScore || 30}
                            </div>
                            <div style={{ fontSize: '10px', color: '#9a9888', fontWeight: '600', textTransform: 'uppercase' }}>Readiness Score</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--indigo-deep)', marginBottom: '4px' }}>AI Compliance Verification Summary</div>
                            <p style={{ fontSize: '12.5px', color: '#555', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                              {ngo.verificationSummary || "No documentation audit run yet. Awaiting files upload."}
                            </p>
                            {ngo.improvementSuggestions && (
                              <p style={{ fontSize: '12px', color: '#6b6a5f', margin: 0, fontStyle: 'italic' }}>
                                <b>Improvement Suggestions:</b> {ngo.improvementSuggestions}
                              </p>
                            )}
                            {ngo.missingDocs && ngo.missingDocs.split(',').filter(Boolean).length > 0 && (
                              <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                <span style={{ fontSize: '11px', color: 'var(--coral)', fontWeight: '600', marginRight: '4px', marginTop: '2px' }}>Missing:</span>
                                {ngo.missingDocs.split(',').filter(Boolean).map((mDoc, idx) => (
                                  <span key={idx} style={{ fontSize: '10.5px', background: '#fff5f5', color: 'var(--coral)', padding: '1px 6px', borderRadius: '3px', border: '1px solid #ffe3e3' }}>
                                    {mDoc}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {ngo.rejectionReason && (
                          <div style={{ padding: '12px', background: 'var(--coral-light)', borderLeft: '3px solid var(--coral)', borderRadius: '4px', fontSize: '13px', color: 'var(--coral)', marginBottom: '14px' }}>
                            <b>Rejection Reason:</b> {ngo.rejectionReason}
                          </div>
                        )}

                        <div>
                          <div className={styles.sectionLabel}>Submitted Documentation</div>
                          <div className={styles.docGrid}>
                            {ngo.documents.map((doc) => (
                              <a 
                                key={doc.id}
                                href={`http://localhost:5000${doc.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.docLink}
                              >
                                <FileText size={14} />
                                {getDocTypeLabel(doc.type)}
                                <ExternalLink size={12} />
                              </a>
                            ))}
                            {ngo.documents.length === 0 && (
                              <span style={{ fontSize: '12px', color: '#9a9888' }}>No documents uploaded.</span>
                            )}
                          </div>
                        </div>

                        {activeTab === "pending" && (
                          <div className={styles.ngoActions}>
                            <button 
                              onClick={() => openRejectModal(ngo.id, "NGO")}
                              className={`${styles.btn} ${styles.btnReject}`}
                              disabled={actionLoading}
                            >
                              <AlertTriangle size={14} /> Request Corrections
                            </button>
                            <button 
                              onClick={() => handleVerify(ngo.id, "NGO", "APPROVE")}
                              className={`${styles.btn} ${styles.btnApprove}`}
                              disabled={actionLoading}
                            >
                              <Check size={14} /> Verify & Approve
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Organization List */}
              {activeOrgList.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h2 style={{ fontSize: '18px', color: 'var(--indigo-deep)', margin: '10px 0 16px' }}>Corporate CSR Applications ({activeOrgList.length})</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {activeOrgList.map((org) => (
                      <div key={org.id} className={`${styles.ngoCard} animate-fade`}>
                        <div className={styles.ngoHeader}>
                          <div>
                            <h3 className={styles.ngoName}>{org.name}</h3>
                            <span className={styles.ngoMeta}>
                              Sector: {org.sector} &bull; Registration / CIN ID: {org.regid}
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', fontFamily: 'IBM Plex Mono, monospace', color: '#9a9888' }}>
                            Submitted: {new Date(org.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        {org.rejectionReason && (
                          <div style={{ padding: '12px', background: 'var(--coral-light)', borderLeft: '3px solid var(--coral)', borderRadius: '4px', fontSize: '13px', color: 'var(--coral)' }}>
                            <b>Rejection Reason:</b> {org.rejectionReason}
                          </div>
                        )}

                        {activeTab === "pending" && (
                          <div className={styles.ngoActions}>
                            <button 
                              onClick={() => openRejectModal(org.id, "ORG")}
                              className={`${styles.btn} ${styles.btnReject}`}
                              disabled={actionLoading}
                            >
                              <AlertTriangle size={14} /> Request Corrections
                            </button>
                            <button 
                              onClick={() => handleVerify(org.id, "ORG", "APPROVE")}
                              className={`${styles.btn} ${styles.btnApprove}`}
                              disabled={actionLoading}
                            >
                              <Check size={14} /> Verify & Approve
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className={styles.empty}>
              No registration requests in this state.
            </div>
          )}
        </section>
      </main>

      {/* Rejection modal overlay */}
      {showRejectModal && (
        <div className={styles.feedbackOverlay}>
          <div className={styles.feedbackModal}>
            <h3 className={styles.modalTitle}>Request {selectedType} Corrections</h3>
            <p style={{ fontSize: '13.5px', color: '#6b6a5f', marginBottom: '14px' }}>
              Describe what details are incorrect or missing. The user will see this reason on their login dashboard and will be prompted to resubmit their details.
            </p>
            <textarea 
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Please provide a valid registration ID or CIN registry copy."
              className={styles.textarea}
              required
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setShowRejectModal(false)}
                className={styles.btn} 
                style={{ background: 'transparent', color: '#555', border: '1px solid var(--line)' }}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                onClick={() => handleVerify(selectedId, selectedType, "REJECT", rejectionReason)}
                className={styles.btn} 
                style={{ background: 'var(--coral)', color: '#fff' }}
                disabled={actionLoading || !rejectionReason.trim()}
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
