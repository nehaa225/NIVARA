import Navbar from "@/components/Navbar";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Contact() {
  return (
    <div>
      <Navbar />

      <main style={{ padding: '80px 40px', maxWidth: '800px', margin: '0 auto' }}>
        <span style={{
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: '11px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--moss)',
          marginBottom: '8px',
          display: 'block'
        }}>Support Helpdesk</span>

        <h1 style={{ fontSize: '48px', marginBottom: '24px', color: 'var(--indigo-deep)' }}>
          We are here to assist your team
        </h1>

        <p style={{ fontSize: '16px', lineHeight: '1.7', marginBottom: '40px', color: '#444' }}>
          Have questions about the NGO verification stages, or experiencing upload issues? Get in touch with our helpdesk team.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '50px' }}>
          <div style={{ padding: '24px', border: '1px solid var(--line)', borderRadius: '10px', background: '#fff' }}>
            <h3 style={{ fontSize: '20px', color: 'var(--indigo-deep)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={18} style={{ color: 'var(--indigo)' }} /> Email support
            </h3>
            <p style={{ fontSize: '14px', color: '#555', marginBottom: '8px' }}>
              Write to us for verification updates or compliance concerns.
            </p>
            <a href="mailto:support@nivara.org" style={{ fontWeight: '600', color: 'var(--indigo)' }}>
              support@nivara.org
            </a>
          </div>

          <div style={{ padding: '24px', border: '1px solid var(--line)', borderRadius: '10px', background: '#fff' }}>
            <h3 style={{ fontSize: '20px', color: 'var(--indigo-deep)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={18} style={{ color: 'var(--moss)' }} /> Call support
            </h3>
            <p style={{ fontSize: '14px', color: '#555', marginBottom: '8px' }}>
              Mon to Fri, 10 AM to 6 PM IST.
            </p>
            <a href="tel:+914040404040" style={{ fontWeight: '600', color: 'var(--indigo)' }}>
              +91 40 4040 4040
            </a>
          </div>
        </div>

        <div style={{ padding: '30px', border: '1px solid var(--line)', borderRadius: '14px', background: '#fff' }}>
          <h2 style={{ fontSize: '24px', color: 'var(--indigo-deep)', marginBottom: '16px' }}>
            Submit an Inquiry
          </h2>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '4px', fontWeight: '500' }}>Your Name</label>
                <input type="text" placeholder="e.g. Ramesh Kumar" style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '4px', fontWeight: '500' }}>Email Address</label>
                <input type="email" placeholder="e.g. ramesh@ngo.org" style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '14px' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '4px', fontWeight: '500' }}>NGO Registration Number</label>
              <input type="text" placeholder="e.g. TS/2019/00456" style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '14px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '4px', fontWeight: '500' }}>Message Description</label>
              <textarea placeholder="Describe how we can help you..." style={{ width: '100%', minHeight: '100px', padding: '10px', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit' }}></textarea>
            </div>
            <button type="submit" disabled style={{
              background: 'var(--indigo)',
              color: '#fff',
              border: 'none',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'not-allowed',
              opacity: 0.6
            }}>Send Message (Demo Mode)</button>
          </form>
        </div>
      </main>

      <footer style={{ padding: '30px', textAlign: 'center', fontSize: '12px', background: 'var(--indigo-deep)', color: '#cfd3d9', marginTop: '80px' }}>
        <p>&copy; {new Date().getFullYear()} Nivara Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
