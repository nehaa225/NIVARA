"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, AlertTriangle, RefreshCw, Send, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import styles from "./status.module.css";

export default function VerificationStatus() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");
  const [role, setRole] = useState("NGO");
  
  const [details, setDetails] = useState(null);
  
  // NGO Data Form
  const [ngoData, setNgoData] = useState({
    name: "", regNumber: "", regType: "", category: "", yearEstablished: "",
    website: "", address: "", state: "", district: "", pinCode: "",
    founderName: "", mobile: "", annualBudget: "", currentFunding: "", fundingNeeded: ""
  });

  // Org Data Form
  const [orgData, setOrgData] = useState({
    name: "", sector: "", regid: ""
  });

  const fetchStatus = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const savedRole = localStorage.getItem("role");
      
      if (!token || !savedRole) {
        router.push("/login");
        return;
      }
      setRole(savedRole);

      const endpoint = savedRole === "ORG" 
        ? "http://localhost:5000/api/org/profile"
        : "http://localhost:5000/api/ngo/profile";

      const res = await fetch(endpoint, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load verification status.");

      if (savedRole === "ORG") {
        const { org } = data;
        setDetails(org);
        localStorage.setItem("orgStatus", org.status);
        if (org.status === "APPROVED") {
          router.push("/");
          return;
        }
        setOrgData({
          name: org.name,
          sector: org.sector,
          regid: org.regid
        });
      } else {
        const { ngo } = data;
        setDetails(ngo);
        localStorage.setItem("ngoStatus", ngo.status);
        if (ngo.status === "APPROVED") {
          router.push("/dashboard");
          return;
        }
        setNgoData({
          name: ngo.name,
          regNumber: ngo.regNumber,
          regType: ngo.regType,
          category: ngo.category,
          yearEstablished: String(ngo.yearEstablished),
          website: ngo.website || "",
          address: ngo.address,
          state: ngo.state,
          district: ngo.district,
          pinCode: ngo.pinCode,
          founderName: ngo.founderName,
          mobile: ngo.mobile,
          annualBudget: ngo.annualBudget,
          currentFunding: ngo.currentFunding,
          fundingNeeded: ngo.fundingNeeded
        });
      }

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleNgoInputChange = (e) => {
    const { name, value } = e.target;
    setNgoData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOrgInputChange = (e) => {
    const { name, value } = e.target;
    setOrgData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setSubmitLoading(true);

    try {
      const token = localStorage.getItem("token");
      const endpoint = role === "ORG"
        ? "http://localhost:5000/api/org/update"
        : "http://localhost:5000/api/ngo/update";

      const payload = role === "ORG" ? orgData : ngoData;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update details.");

      setSuccessMsg("Details resubmitted successfully. Your verification status has been reset to Pending.");
      await fetchStatus(false);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column', gap: '16px' }}>
          <RefreshCw size={36} className="animate-spin" style={{ color: 'var(--indigo)' }} />
          <p style={{ color: '#6b6a5f', fontSize: '15px' }}>Loading verification status...</p>
        </div>
      </div>
    );
  }

  const isPending = details?.status === "PENDING";
  const isRejected = details?.status === "REJECTED";

  return (
    <div>
      <Navbar />

      <main className={styles.container}>
        <div className={`${styles.statusCard} animate-slide`}>
          {isPending ? (
            <>
              <div className={styles.iconPending}>
                <Clock size={64} />
              </div>
              <span className={`${styles.badge} ${styles.badgePending}`}>
                Verification Pending
              </span>
              <h1 className={styles.title}>Evaluating credentials</h1>
              <p className={styles.subtitle}>
                Your {role === "ORG" ? "organization" : "NGO"} registration details have been submitted to the administration. We are running integrity validations. Check back soon.
              </p>
            </>
          ) : (
            <>
              <div className={styles.iconRejected}>
                <AlertTriangle size={64} />
              </div>
              <span className={`${styles.badge} ${styles.badgeRejected}`}>
                Corrections Requested
              </span>
              <h1 className={styles.title}>Updates Needed</h1>
              <p className={styles.subtitle}>
                Our administrators reviewed your application and requested details correction before verification approval can be completed.
              </p>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button onClick={() => fetchStatus(true)} className={styles.btn} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: 0 }}>
              <RefreshCw size={16} /> Refetch Status
            </button>
          </div>
        </div>

        {isRejected && (
          <div className={`${styles.correctionForm} animate-fade`}>
            {details?.rejectionReason && (
              <div className={styles.rejectionReasonBox}>
                <div className={styles.reasonTitle}>Feedback from Administrator</div>
                <div className={styles.reasonText}>{details.rejectionReason}</div>
              </div>
            )}

            {successMsg && <div className={styles.alert}>{successMsg}</div>}
            {error && <div className={styles.alert} style={{ background: 'var(--coral-light)', color: 'var(--coral)', borderColor: '#e5b8af' }}>{error}</div>}

            <h2 style={{ fontSize: '22px', color: 'var(--indigo-deep)', marginBottom: '20px' }}>Resubmit Form</h2>
            <form onSubmit={handleResubmit}>
              
              {role === "ORG" ? (
                /* ORG Correction Form */
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label>Organization Name</label>
                    <input type="text" name="name" value={orgData.name} onChange={handleOrgInputChange} required />
                  </div>
                  <div className={styles.field}>
                    <label>Sector Focus</label>
                    <input type="text" name="sector" value={orgData.sector} onChange={handleOrgInputChange} required />
                  </div>
                  <div className={styles.field}>
                    <label>Registration Number / CIN</label>
                    <input type="text" name="regid" value={orgData.regid} onChange={handleOrgInputChange} required />
                  </div>
                </div>
              ) : (
                /* NGO Correction Form */
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label>NGO Name</label>
                    <input type="text" name="name" value={ngoData.name} onChange={handleNgoInputChange} required />
                  </div>

                  <div className={styles.field}>
                    <label>Registration Number</label>
                    <input type="text" name="regNumber" value={ngoData.regNumber} onChange={handleNgoInputChange} required />
                  </div>

                  <div className={styles.field}>
                    <label>Registration Type</label>
                    <select name="regType" value={ngoData.regType} onChange={handleNgoInputChange}>
                      <option value="Trust">Trust</option>
                      <option value="Society">Society</option>
                      <option value="Section 8 Company">Section 8 Company</option>
                    </select>
                  </div>

                  <div className={styles.field}>
                    <label>NGO Category</label>
                    <select name="category" value={ngoData.category} onChange={handleNgoInputChange}>
                      <option value="Education">Education</option>
                      <option value="Health & Family Welfare">Health & Family Welfare</option>
                      <option value="Livelihoods & Skilling">Livelihoods & Skilling</option>
                      <option value="Environment & Forestry">Environment & Forestry</option>
                      <option value="Women Development & Empowerment">Women Development & Empowerment</option>
                      <option value="Disaster Management">Disaster Management</option>
                    </select>
                  </div>

                  <div className={styles.field}>
                    <label>Year Established</label>
                    <input type="number" name="yearEstablished" value={ngoData.yearEstablished} onChange={handleNgoInputChange} required />
                  </div>

                  <div className={styles.field}>
                    <label>Website URL</label>
                    <input type="url" name="website" value={ngoData.website} onChange={handleNgoInputChange} />
                  </div>

                  <div className={`${styles.field} ${styles.formFieldFull}`}>
                    <label>Address</label>
                    <textarea name="address" value={ngoData.address} onChange={handleNgoInputChange} required />
                  </div>

                  <div className={styles.field}>
                    <label>State</label>
                    <input type="text" name="state" value={ngoData.state} onChange={handleNgoInputChange} required />
                  </div>

                  <div className={styles.field}>
                    <label>District</label>
                    <input type="text" name="district" value={ngoData.district} onChange={handleNgoInputChange} required />
                  </div>

                  <div className={styles.field}>
                    <label>PIN Code</label>
                    <input type="text" name="pinCode" value={ngoData.pinCode} onChange={handleNgoInputChange} required />
                  </div>

                  <div className={styles.field}>
                    <label>Founder Name</label>
                    <input type="text" name="founderName" value={ngoData.founderName} onChange={handleNgoInputChange} required />
                  </div>

                  <div className={styles.field}>
                    <label>Founder Mobile</label>
                    <input type="text" name="mobile" value={ngoData.mobile} onChange={handleNgoInputChange} required />
                  </div>

                  <div className={styles.field}>
                    <label>Annual Budget</label>
                    <input type="text" name="annualBudget" value={ngoData.annualBudget} onChange={handleNgoInputChange} required />
                  </div>

                  <div className={styles.field}>
                    <label>Current Funding</label>
                    <input type="text" name="currentFunding" value={ngoData.currentFunding} onChange={handleNgoInputChange} required />
                  </div>

                  <div className={styles.field}>
                    <label>Funding Needed</label>
                    <input type="text" name="fundingNeeded" value={ngoData.fundingNeeded} onChange={handleNgoInputChange} required />
                  </div>
                </div>
              )}

              <button type="submit" disabled={submitLoading} className={styles.btn} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Send size={16} />
                {submitLoading ? "Submitting updates..." : "Resubmit Details"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
