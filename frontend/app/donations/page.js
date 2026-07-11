"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Gift, Trash, Navigation, Check, ShieldCheck, Filter } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Donations() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Form Fields
  const [category, setCategory] = useState("food");
  const [title, setTitle] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [postedBy, setPostedBy] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const donationCategories = {
    food: { label: 'Food', hint: 'e.g. 40 cooked meal packets, rice sacks' },
    books: { label: 'Books', hint: 'e.g. School textbooks and reference books' },
    clothes: { label: 'Clothes', hint: 'e.g. Winter wear, children’s garments' },
    computers: { label: 'Computers', hint: 'e.g. Laptops, monitors, keyboards' },
    medical: { label: 'Medical equipment', hint: 'e.g. Wheelchairs, braces, thermometers' },
    furniture: { label: 'Furniture', hint: 'e.g. Desks, blackboard tables' },
    stationery: { label: 'Stationery', hint: 'e.g. Pencils, notebooks, geometry boxes' }
  };

  const fetchDonations = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/community/donations?category=${categoryFilter}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load donations.");
      setDonations(data.donations || []);
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
    const name = localStorage.getItem("email"); // fallback identifier
    if (!token) {
      router.push("/login");
      return;
    }
    setUser({ token, role, name });
    setPostedBy(name || "Citizen");
    fetchDonations();
  }, [categoryFilter]);

  const handlePostDonation = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setSubmitLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/community/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, title, pickupLocation, postedBy })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post donation.");

      setNotice(data.message);
      setTitle("");
      setPickupLocation("");
      await fetchDonations(false);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleClaim = async (donationId) => {
    setError("");
    setNotice("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/community/donations/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ donationId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to claim donation.");

      setNotice(data.message);
      await fetchDonations(false);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div>
      <Navbar />

      <main style={{ padding: '60px 40px', maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ marginBottom: '40px' }}>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--moss)', marginBottom: '8px', display: 'block' }}>Community Action</span>
          <h1 style={{ fontSize: '38px', color: 'var(--indigo-deep)' }}>Donation & Resource Board</h1>
          <p style={{ color: '#6b6a5f', fontSize: '15px', marginTop: '6px' }}>
            Citizens and organizations post items to donate, NGOs claim them for field distribution.
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

        {/* 1. CITIZEN/ORG Posting Form */}
        {(user?.role === "CITIZEN" || user?.role === "ORG") && (
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '14px', padding: '30px', boxShadow: 'var(--shadow-sm)', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', color: 'var(--indigo-deep)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Gift size={20} /> Post Resource Donation</h2>
            <form onSubmit={handlePostDonation} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ padding: '10px', border: '1px solid var(--line)', borderRadius: '6px', background: '#fdfcf9', fontFamily: 'inherit' }}
                  >
                    {Object.entries(donationCategories).map(([key, cat]) => (
                      <option key={key} value={key}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>Pickup Location</label>
                  <input 
                    type="text" 
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="e.g. Uppal, Hyderabad" 
                    required 
                    style={{ padding: '10px', border: '1px solid var(--line)', borderRadius: '6px', background: '#fdfcf9', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>Item Details & Quantity</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={donationCategories[category].hint} 
                  required 
                  style={{ padding: '10px', border: '1px solid var(--line)', borderRadius: '6px', background: '#fdfcf9', fontFamily: 'inherit' }}
                />
              </div>

              <button 
                type="submit" 
                disabled={submitLoading} 
                style={{ background: 'var(--indigo)', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                Post Donation Offer
              </button>
            </form>
          </div>
        )}

        {/* Filters ribbon */}
        <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '13.5px', color: '#6b6a5f', fontWeight: '500' }}>
            Active Resource Listings
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={14} style={{ color: '#9a9888' }} />
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ padding: '6px 12px', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '13px', fontFamily: 'inherit', background: '#fff' }}
            >
              <option value="all">All Categories</option>
              {Object.entries(donationCategories).map(([key, cat]) => (
                <option key={key} value={key}>{cat.label}</option>
              ))}
            </select>
          </div>
        </section>

        {/* Listings view */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ color: '#6b6a5f', fontSize: '14px' }}>Loading board offerings...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {donations.map((don) => (
              <div key={don.id} className="animate-fade" style={{
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
                    color: 'var(--moss)', 
                    background: 'var(--moss-light)', 
                    padding: '2px 8px', 
                    borderRadius: '12px',
                    display: 'inline-block',
                    marginBottom: '8px' 
                  }}>
                    {donationCategories[don.category]?.label || don.category}
                  </span>
                  <h3 style={{ fontSize: '16px', color: 'var(--indigo-deep)', margin: '0 0 4px' }}>{don.title}</h3>
                  <p style={{ fontSize: '13.5px', color: '#555', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Navigation size={12} style={{ color: '#9a9888' }} /> Pickup Location: <b>{don.pickupLocation}</b>
                  </p>
                  <p style={{ fontSize: '12px', color: '#9a9888', marginTop: '4px' }}>Posted by {don.postedBy}</p>
                  
                  {don.matchedNgo && (
                    <p style={{ fontSize: '12px', color: 'var(--moss)', fontWeight: '600', marginTop: '4px' }}>
                      Nearest Match: {don.matchedNgo.name}
                    </p>
                  )}
                </div>

                <div>
                  {don.status === "CLAIMED" ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', color: 'var(--moss)', fontWeight: '600', padding: '6px 12px', background: 'var(--moss-light)', borderRadius: '6px' }}>
                      <Check size={14} /> Claimed
                    </span>
                  ) : user?.role === "NGO" ? (
                    <button 
                      onClick={() => handleClaim(don.id)}
                      style={{ background: 'var(--indigo)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      Claim Resource
                    </button>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#9a9888', fontWeight: '500' }}>
                      Pending Claim
                    </span>
                  )}
                </div>
              </div>
            ))}

            {donations.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', border: '1px dashed var(--line)', borderRadius: '8px', color: '#9a9888' }}>
                No active donation offerings on the board.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
