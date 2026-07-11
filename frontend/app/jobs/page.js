"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Building2, Eye, Plus, Send, Check } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Jobs() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Form Fields
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Full-time");
  const [description, setDescription] = useState("");
  const [postedBy, setPostedBy] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  // Application Modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicantName, setApplicantName] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [applyLoading, setApplyLoading] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState([]);

  const fetchJobs = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/community/jobs");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load jobs.");
      setJobs(data.jobs || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const name = localStorage.getItem("email");
    if (!token) {
      router.push("/login");
      return;
    }
    setUser({ token, role, name });
    setPostedBy(name || "Employer");
    fetchJobs();
    
    // Load previously applied job IDs from session local storage
    const saved = localStorage.getItem("appliedJobIds");
    if (saved) {
      setAppliedJobIds(JSON.parse(saved));
    }
  }, []);

  const handlePostJob = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setSubmitLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/community/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, type, description, postedBy })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create job posting.");

      setNotice(data.message);
      setTitle("");
      setDescription("");
      await fetchJobs(false);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const openApplyModal = (job) => {
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setApplyLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/community/jobs/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: selectedJob.id, applicantName, applicantPhone })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to apply.");

      setNotice(data.message);
      const updatedList = [...appliedJobIds, selectedJob.id];
      setAppliedJobIds(updatedList);
      localStorage.setItem("appliedJobIds", JSON.stringify(updatedList));
      
      setShowApplyModal(false);
      setApplicantName("");
      setApplicantPhone("");
      await fetchJobs(false);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setApplyLoading(false);
    }
  };

  return (
    <div>
      <Navbar />

      <main style={{ padding: '60px 40px', maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ marginBottom: '40px' }}>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--moss)', marginBottom: '8px', display: 'block' }}>Career Center</span>
          <h1 style={{ fontSize: '38px', color: 'var(--indigo-deep)' }}>NGO Jobs & Internships</h1>
          <p style={{ color: '#6b6a5f', fontSize: '15px', marginTop: '6px' }}>
            Find active careers, internships, and volunteer openings posted directly by validated organizations.
          </p>
        </header>

        {notice && (
          <div style={{ background: 'var(--moss-light)', color: 'var(--moss)', padding: '14px', borderRadius: '6px', border: '1px solid #c7d9c9', marginBottom: '20px', fontSize: '14.5px' }}>
            {notice}
          </div>
        )}

        {error && (
          <div style={{ background: 'var(--coral-light)', color: 'var(--coral)', padding: '14px', borderRadius: '6px', border: '1px solid #e5b8af', marginBottom: '20px', fontSize: '14.5px' }}>
            {error}
          </div>
        )}

        {/* 1. EMPLOYER Posting Form */}
        {(user?.role === "NGO" || user?.role === "ORG") && (
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '14px', padding: '30px', boxShadow: 'var(--shadow-sm)', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', color: 'var(--indigo-deep)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={20} /> Post Opening</h2>
            <form onSubmit={handlePostJob} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>Role Title *</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Social Work intern" required style={{ padding: '10px', border: '1px solid var(--line)', borderRadius: '6px', background: '#fdfcf9', fontFamily: 'inherit' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>Type *</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} style={{ padding: '10px', border: '1px solid var(--line)', borderRadius: '6px', background: '#fdfcf9', fontFamily: 'inherit' }}>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Volunteer">Volunteer</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>Role Description & Requirements</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter details..." required style={{ padding: '10px', minHeight: '80px', border: '1px solid var(--line)', borderRadius: '6px', background: '#fdfcf9', fontFamily: 'inherit', resize: 'vertical' }} />
              </div>

              <button 
                type="submit" 
                disabled={submitLoading} 
                style={{ background: 'var(--indigo)', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Create Job Posting
              </button>
            </form>
          </div>
        )}

        {/* Listings Section */}
        <h2 style={{ fontSize: '18px', color: 'var(--indigo-deep)', marginBottom: '16px' }}>Active Openings</h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ color: '#6b6a5f', fontSize: '14px' }}>Loading vacancies...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {jobs.map((job) => (
              <div key={job.id} className="animate-fade" style={{
                background: '#fff',
                border: '1px solid var(--line)',
                borderRadius: '10px',
                padding: '20px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: '600', 
                    color: 'var(--marigold)', 
                    background: '#fdf8ee', 
                    padding: '2px 8px', 
                    borderRadius: '12px',
                    display: 'inline-block',
                    marginBottom: '8px' 
                  }}>
                    {job.type}
                  </span>
                  <h3 style={{ fontSize: '16px', color: 'var(--indigo-deep)', margin: '0 0 4px' }}>{job.title}</h3>
                  <p style={{ fontSize: '13.5px', color: '#555', lineHeight: '1.4' }}>
                    {job.description}
                  </p>
                  <p style={{ fontSize: '11.5px', color: '#9a9888', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Building2 size={12} /> Posted by <b>{job.postedBy}</b>
                  </p>
                </div>

                <div>
                  {appliedJobIds.includes(job.id) ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', color: 'var(--moss)', fontWeight: '600', padding: '6px 12px', background: 'var(--moss-light)', borderRadius: '6px' }}>
                      <Check size={14} /> Applied
                    </span>
                  ) : user?.role === "CITIZEN" ? (
                    <button 
                      onClick={() => openApplyModal(job)}
                      style={{ background: 'var(--indigo)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      Apply Now
                    </button>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#9a9888', fontWeight: '500' }}>
                      {job.applications?.length || 0} Applicant{job.applications?.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {jobs.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', border: '1px dashed var(--line)', borderRadius: '8px', color: '#9a9888' }}>
                No active job postings.
              </div>
            )}
          </div>
        )}
      </main>

      {/* Application Overlay Modal */}
      {showApplyModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(38,38,31,0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 200
        }}>
          <div style={{
            width: '90%', maxWidth: '440px', background: '#fff', borderRadius: '12px', padding: '30px', border: '1px solid var(--line)', boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ fontSize: '18px', color: 'var(--indigo-deep)', marginBottom: '10px' }}>Apply to {selectedJob?.title}</h3>
            <p style={{ fontSize: '13px', color: '#6b6a5f', marginBottom: '16px' }}>Provide contact info. The NGO will call you to schedule interviews.</p>
            <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12.5px', color: '#555', fontWeight: '500' }}>Full Name</label>
                <input type="text" value={applicantName} onChange={(e) => setApplicantName(e.target.value)} required placeholder="e.g. Ramesh Kumar" style={{ padding: '10px', border: '1px solid var(--line)', borderRadius: '6px' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12.5px', color: '#555', fontWeight: '500' }}>Contact Phone</label>
                <input type="text" value={applicantPhone} onChange={(e) => setApplicantPhone(e.target.value)} required placeholder="e.g. 9876543210" style={{ padding: '10px', border: '1px solid var(--line)', borderRadius: '6px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowApplyModal(false)} style={{ background: 'transparent', color: '#555', border: '1px solid var(--line)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={applyLoading} style={{ background: 'var(--indigo)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
