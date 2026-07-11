import Navbar from "@/components/Navbar";
import { Award, Compass, ShieldAlert } from "lucide-react";

export default function About() {
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
        }}>Our Mission</span>
        
        <h1 style={{ fontSize: '48px', marginBottom: '24px', color: 'var(--indigo-deep)' }}>
          Restoring Credibility, Accelerating Social Impact
        </h1>
        
        <p style={{ fontSize: '16px', lineHeight: '1.7', marginBottom: '30px', color: '#444' }}>
          At Nivara, we believe that small, grassroots NGOs are the frontline heroes of social change. However, navigating the complex world of compliance audits, corporate CSR criteria, and document review often draws valuable time away from field execution. 
        </p>

        <p style={{ fontSize: '16px', lineHeight: '1.7', marginBottom: '40px', color: '#444' }}>
          Our platform establishes an transparent ledger of checked, verified NGOs. By doing this, we give social trust an online, reviewable presence, while equipping social developers with powerful AI toolchains to draft funding proposals and optimize their allocations.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '40px 0' }} />

        <h2 style={{ fontSize: '28px', marginBottom: '20px', color: 'var(--indigo-deep)' }}>
          Core Platform Principles
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginBottom: '40px' }}>
          <div style={{ padding: '20px', border: '1px solid var(--line)', borderRadius: '8px', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Compass style={{ color: 'var(--marigold)' }} />
              <h3 style={{ fontSize: '18px', color: 'var(--indigo-deep)' }}>Equitable Access</h3>
            </div>
            <p style={{ fontSize: '14.5px', color: '#555' }}>
              Removing structural barriers so grassroots groups have access to high-quality matching software and proposal draft guides.
            </p>
          </div>

          <div style={{ padding: '20px', border: '1px solid var(--line)', borderRadius: '8px', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Award style={{ color: 'var(--indigo)' }} />
              <h3 style={{ fontSize: '18px', color: 'var(--indigo-deep)' }}>Vetted Legitimacy</h3>
            </div>
            <p style={{ fontSize: '14.5px', color: '#555' }}>
              Rigorous manual and digital evaluation workflows to verify certificates, reducing donor compliance risks.
            </p>
          </div>

          <div style={{ padding: '20px', border: '1px solid var(--line)', borderRadius: '8px', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <ShieldAlert style={{ color: 'var(--coral)' }} />
              <h3 style={{ fontSize: '18px', color: 'var(--indigo-deep)' }}>Anti-Fraud Standards</h3>
            </div>
            <p style={{ fontSize: '14.5px', color: '#555' }}>
              Active database verification checks to block registry overlaps and secure financial accounts.
            </p>
          </div>
        </div>

        <h2 style={{ fontSize: '28px', marginBottom: '20px', color: 'var(--indigo-deep)' }}>
          Frequently Asked Questions
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--indigo-deep)', marginBottom: '6px' }}>
              How long does NGO verification take?
            </h4>
            <p style={{ fontSize: '14.5px', color: '#555' }}>
              Usually, verification takes 2-3 business days. After submitting your certificates and reports, they go through our AI checks, and then our administrative staff evaluates them before final approval.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--indigo-deep)', marginBottom: '6px' }}>
              What documents are required to register?
            </h4>
            <p style={{ fontSize: '14.5px', color: '#555' }}>
              NGOs must upload their official Incorporation/Registration Certificate, PAN Card copy, 12A/80G Trust Certificates, and latest Annual / Financial Audit reports.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--indigo-deep)', marginBottom: '6px' }}>
              Is proposal generation completely automated?
            </h4>
            <p style={{ fontSize: '14.5px', color: '#555' }}>
              No. Our AI agent compiles matching rules and drafts a comprehensive starting template. All emails, budgets, and files must be reviewed and finalized by your NGO leadership before submission.
            </p>
          </div>
        </div>
      </main>

      <footer style={{ padding: '30px', textAlign: 'center', fontSize: '12px', background: 'var(--indigo-deep)', color: '#cfd3d9', marginTop: '80px' }}>
        <p>&copy; {new Date().getFullYear()} Nivara Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
