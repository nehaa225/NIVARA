"use client";

import { useEffect, useState } from "react";
import { Search, Compass, Globe, Calendar, MapPin, Building, ShieldCheck, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Directory() {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDirectory = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/directory/ngos");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load directory.");
        setNgos(data.ngos || []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDirectory();
  }, []);

  const filteredNgos = ngos.filter(ngo => {
    const matchesSearch = ngo.name.toLowerCase().includes(search.toLowerCase()) || 
                          ngo.state.toLowerCase().includes(search.toLowerCase()) ||
                          ngo.district.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || ngo.category === category;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", "Education", "Health & Family Welfare", "Livelihoods & Skilling", "Environment & Forestry", "Women Development & Empowerment", "Disaster Management"];

  return (
    <div>
      <Navbar />
      <main style={{ padding: '60px 40px', maxWidth: '1000px', margin: '0 auto' }}>
        <header style={{ marginBottom: '40px', textAlign: 'center' }}>
          <span style={{
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '11px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--moss)',
            marginBottom: '8px',
            display: 'block'
          }}>Public Verification Database</span>
          <h1 style={{ fontSize: '42px', color: 'var(--indigo-deep)', marginBottom: '14px' }}>
            Verified NGO Registry
          </h1>
          <p style={{ color: '#6b6a5f', fontSize: '15px', maxWidth: '580px', margin: '0 auto' }}>
            Browse and discover verified, compliance-approved non-profit organizations on Nivara.
          </p>
        </header>

        {/* Filters ribbon */}
        <section style={{ 
          background: '#fff', 
          border: '1px solid var(--line)', 
          borderRadius: '12px', 
          padding: '20px', 
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '30px'
        }}>
          <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <input 
              type="text"
              placeholder="Search by NGO name, state, or district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 38px',
                border: '1px solid var(--line)',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
                background: '#fdfcf9'
              }}
            />
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: '#9a9888' }} />
          </div>

          <div style={{ width: '220px' }}>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid var(--line)',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
                background: '#fdfcf9',
                color: 'var(--ink)'
              }}
            >
              {categories.map((cat, i) => (
                <option key={i} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>
        </section>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <RefreshCw size={28} className="animate-spin" style={{ color: 'var(--indigo)', margin: '0 auto 10px' }} />
            <p style={{ color: '#6b6a5f', fontSize: '14px' }}>Loading registry records...</p>
          </div>
        ) : error ? (
          <div style={{ background: 'var(--coral-light)', color: 'var(--coral)', padding: '16px', borderRadius: '8px', border: '1px solid #e5b8af' }}>
            {error}
          </div>
        ) : (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ fontSize: '13.5px', color: '#6b6a5f', fontWeight: '500' }}>
              Showing {filteredNgos.length} verified NGO{filteredNgos.length !== 1 ? 's' : ''}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {filteredNgos.map((ngo) => (
                <div key={ngo.id} className="animate-fade" style={{
                  background: '#fff',
                  border: '1px solid var(--line)',
                  borderRadius: '10px',
                  padding: '24px',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'var(--transition)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '18px', color: 'var(--indigo-deep)', margin: 0 }}>{ngo.name}</h3>
                      <span style={{ 
                        background: 'var(--moss-light)', 
                        color: 'var(--moss)', 
                        fontSize: '11px', 
                        fontWeight: '600', 
                        padding: '2px 8px', 
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        flexShrink: 0
                      }}>
                        <ShieldCheck size={12} /> Verified
                      </span>
                    </div>

                    <div style={{ display: 'inline-block', fontSize: '11.5px', fontWeight: '600', color: 'var(--indigo)', background: 'rgba(34,56,90,0.04)', padding: '2px 6px', borderRadius: '4px', marginBottom: '12px' }}>
                      {ngo.category}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#555' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={14} style={{ color: '#9a9888' }} />
                        {ngo.district}, {ngo.state} - {ngo.pinCode}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} style={{ color: '#9a9888' }} />
                        Established in {ngo.yearEstablished}
                      </div>
                      {ngo.website && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Globe size={14} style={{ color: '#9a9888' }} />
                          <a href={ngo.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--indigo)', textDecoration: 'underline' }}>
                            {ngo.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px dashed var(--line)', paddingTop: '12px', fontSize: '12px', color: '#6b6a5f' }}>
                    <div>Founder: <b>{ngo.founderName}</b></div>
                    <div>Contact: {ngo.email} &bull; {ngo.mobile}</div>
                  </div>
                </div>
              ))}

              {filteredNgos.length === 0 && (
                <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '40px', border: '1px dashed var(--line)', borderRadius: '8px', color: '#9a9888' }}>
                  No verified NGOs match your filters.
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
