"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Handshake, Check, RefreshCw, AlertTriangle, Users } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Events() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Form Fields
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [selectedNgoIds, setSelectedNgoIds] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchEvents = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/community/events");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load events.");
      setEvents(data.events || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchNgoDirectory = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/directory/ngos");
      const data = await res.json();
      if (res.ok) setNgos(data.ngos || []);
    } catch (err) {
      console.error(err);
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
    fetchEvents();
    if (role === "ORG") {
      fetchNgoDirectory();
    }
  }, []);

  const handlePostEvent = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setSubmitLoading(true);

    try {
      const hostOrgName = user?.name || "Corporate Partner";
      const res = await fetch("http://localhost:5000/api/community/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          date, 
          location, 
          description, 
          hostOrgName, 
          invitedNgoIds: selectedNgoIds 
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post event.");

      setNotice(data.message);
      setTitle("");
      setDate("");
      setLocation("");
      setDescription("");
      setSelectedNgoIds([]);
      await fetchEvents(false);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleConfirmCollaboration = async (eventId) => {
    setError("");
    setNotice("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/community/events/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ eventId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to confirm collaboration.");

      setNotice(data.message);
      await fetchEvents(false);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleCheckboxChange = (ngoId) => {
    setSelectedNgoIds((prev) => 
      prev.includes(ngoId) ? prev.filter(id => id !== ngoId) : [...prev, ngoId]
    );
  };

  // Helper to map NGO names in invitations list
  const getNgoNamesFromIdsString = (idsString) => {
    if (!idsString) return [];
    const ids = idsString.split(',');
    return ids.map(id => {
      // Find matching NGO name if cache loads them (only org loads directoryCache)
      // Otherwise, return partial ID or mock
      const match = ngos.find(n => n.id === id);
      return match ? match.name : "NGO";
    });
  };

  return (
    <div>
      <Navbar />

      <main style={{ padding: '60px 40px', maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ marginBottom: '40px' }}>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--moss)', marginBottom: '8px', display: 'block' }}>Platform Partnership</span>
          <h1 style={{ fontSize: '38px', color: 'var(--indigo-deep)' }}>NGO & Corporate Event Partnerships</h1>
          <p style={{ color: '#6b6a5f', fontSize: '15px', marginTop: '6px' }}>
            Organizations invite verified NGOs to join field projects, camps, and corporate volunteering campaigns.
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

        {/* 1. ORG Posting Form */}
        {user?.role === "ORG" && (
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '14px', padding: '30px', boxShadow: 'var(--shadow-sm)', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', color: 'var(--indigo-deep)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Handshake size={20} /> Host Collaboration Event</h2>
            <form onSubmit={handlePostEvent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>Event Title *</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Free Health Checkup Camp" required style={{ padding: '10px', border: '1px solid var(--line)', borderRadius: '6px', background: '#fdfcf9', fontFamily: 'inherit' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ padding: '10px', border: '1px solid var(--line)', borderRadius: '6px', background: '#fdfcf9', fontFamily: 'inherit' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>Location *</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Community Center, Hyderabad" required style={{ padding: '10px', border: '1px solid var(--line)', borderRadius: '6px', background: '#fdfcf9', fontFamily: 'inherit' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>Campaign Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide target beneficiaries details and required NGO manpower..." style={{ padding: '10px', minHeight: '80px', border: '1px solid var(--line)', borderRadius: '6px', background: '#fdfcf9', fontFamily: 'inherit', resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>Select Verified NGOs to Invite</label>
                <div style={{
                  maxHeight: '130px',
                  overflowY: 'auto',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  padding: '10px',
                  background: '#fdfcf9',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {ngos.map(ngo => (
                    <label key={ngo.id} style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedNgoIds.includes(ngo.id)}
                        onChange={() => handleCheckboxChange(ngo.id)}
                      />
                      {ngo.name} ({ngo.state})
                    </label>
                  ))}
                  {ngos.length === 0 && (
                    <span style={{ fontSize: '12px', color: '#9a9888' }}>No verified NGOs found in directory.</span>
                  )}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={submitLoading} 
                style={{ background: 'var(--indigo)', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Post Event & Send Invites
              </button>
            </form>
          </div>
        )}

        {/* Listings Section */}
        <h2 style={{ fontSize: '18px', color: 'var(--indigo-deep)', marginBottom: '16px' }}>Active Campaigns & Workshops</h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ color: '#6b6a5f', fontSize: '14px' }}>Loading campaign listings...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {events.map((ev) => {
              const inviteIds = ev.invitedNgos ? ev.invitedNgos.split(',') : [];
              const confirmedIds = ev.confirmedNgos ? ev.confirmedNgos.split(',') : [];
              
              // NGO specific checks
              const isInvited = inviteIds.includes(localStorage.getItem("ngoId")) || user?.role === "NGO"; 
              const isConfirmed = confirmedIds.includes(localStorage.getItem("ngoId")) || false; 

              return (
                <div key={ev.id} className="animate-fade" style={{
                  background: '#fff',
                  border: '1px solid var(--line)',
                  borderRadius: '10px',
                  padding: '24px',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px dashed var(--line)', paddingBottom: '12px', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', color: 'var(--indigo-deep)', margin: '0 0 4px' }}>{ev.title}</h3>
                      <p style={{ fontSize: '13px', color: '#6b6a5f', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={13} style={{ color: '#9a9888' }} /> {ev.location}
                        {ev.date && <>&bull; <Calendar size={13} style={{ color: '#9a9888' }} /> {ev.date}</>}
                      </p>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '500', color: '#9a9888' }}>
                      Hosted by <b>{ev.hostOrgName}</b>
                    </span>
                  </div>

                  {ev.description && (
                    <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.5', marginBottom: '14px' }}>
                      {ev.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', justifyItems: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid #f6f3ec', paddingTop: '12px' }}>
                    <div style={{ flex: 1, fontSize: '12.5px', color: '#6b6a5f', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={14} style={{ color: '#9a9888' }} />
                      Confirmed Collaborators: <b>{confirmedIds.length} NGO{confirmedIds.length !== 1 ? 's' : ''}</b>
                    </div>

                    {user?.role === "NGO" && (
                      <div>
                        {ev.confirmedNgos.includes(localStorage.getItem("ngoId") || "") ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', color: 'var(--moss)', fontWeight: '600', padding: '6px 12px', background: 'var(--moss-light)', borderRadius: '6px' }}>
                            <Check size={14} /> Confirmed Partner
                          </span>
                        ) : (
                          <button 
                            onClick={() => handleConfirmCollaboration(ev.id)}
                            style={{ background: 'var(--indigo)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
                          >
                            Join & Collaborate
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {events.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', border: '1px dashed var(--line)', borderRadius: '8px', color: '#9a9888' }}>
                No collaborative event campaigns posted yet.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
