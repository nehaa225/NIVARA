import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Search, FileText, HelpCircle, Mail, Building, Heart, Users, GraduationCap, Volume2, Check } from "lucide-react";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <Navbar />

      {/* Hero Section */}
      <header className={`${styles.hero} animate-fade`}>
        <span className={styles.eyebrow}>Credibility & Funding Unified</span>
        <h1 className={styles.title}>Empowering Credible NGOs with AI Agents</h1>
        <p className={styles.subtitle}>
          Nivara bridges the gap between trust and resources. Register your NGO, undergo digital verification, search real grants, and draft proposals using agent workflows.
        </p>
        <div className={styles.heroActions}>
          <Link href="/register-ngo" className={`${styles.btn} ${styles.btnPrimary}`}>
            Register NGO <ArrowRight size={18} />
          </Link>
          <Link href="/about" className={`${styles.btn} ${styles.btnGhost}`}>
            Learn More
          </Link>
        </div>
      </header>

      {/* 1. Trust, Growth & Social Impact */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Built for Trust, Growth & Social Impact</h2>
          <p className={styles.sectionSubtitle}>
            Nivara is an AI-powered NGO Operating System that helps organizations grow by simplifying verification, funding readiness, collaboration, and community engagement. Instead of replacing government grant portals, Nivara empowers NGOs with intelligent AI agents that work before, during, and after the funding process.
          </p>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.iconWrapper} style={{ background: 'rgba(74, 91, 71, 0.08)', color: 'var(--moss)' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 className={styles.cardTitle}>🤖 AI-Powered NGO Verification</h3>
            <p className={styles.cardDesc}>
              Every NGO undergoes a secure verification process combining AI-assisted document analysis and manual admin review. Only verified NGOs receive access to the Nivara ecosystem, ensuring transparency, authenticity, and trust for citizens, organizations, and funders.
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.iconWrapper} style={{ background: 'rgba(34, 56, 90, 0.08)', color: 'var(--indigo)' }}>
              <Search size={24} />
            </div>
            <h3 className={styles.cardTitle}>🎯 AI Funding Readiness & Opportunity Discovery</h3>
            <p className={styles.cardDesc}>
              Instead of manually searching hundreds of funding websites, Nivara's AI analyzes your NGO profile, understands your mission, and recommends the most relevant government grants, CSR opportunities, foundation programs, and philanthropic funding sources. It also evaluates eligibility before you apply.
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.iconWrapper} style={{ background: 'rgba(217, 119, 6, 0.08)', color: 'var(--marigold)' }}>
              <FileText size={24} />
            </div>
            <h3 className={styles.cardTitle}>🧠 AI Proposal & Impact Assistant</h3>
            <p className={styles.cardDesc}>
              Nivara's AI prepares customized funding proposals, generates budgets, forecasts project impact, reviews applications for errors, learns from rejected proposals, and continuously improves future submissions to maximize funding success.
            </p>
          </div>
        </div>
      </section>

      {/* 2. How Nivara Works */}
      <section style={{ padding: '60px 40px', background: '#f8f6f0', borderRadius: '16px', margin: '40px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 className={styles.sectionTitle} style={{ fontSize: '32px' }}>How Nivara Works</h2>
          <p className={styles.sectionSubtitle} style={{ maxWidth: '600px', margin: '10px auto 0' }}>
            A complete AI-powered journey designed to help NGOs grow and create greater social impact.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '30px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid var(--line)', position: 'relative' }}>
            <span style={{ fontSize: '32px', fontFamily: 'IBM Plex Mono, monospace', color: 'var(--moss)', fontWeight: 'bold', display: 'block', marginBottom: '12px' }}>1</span>
            <h4 style={{ fontSize: '18px', color: 'var(--indigo-deep)', margin: '0 0 10px' }}>Register & Verify Your NGO</h4>
            <p style={{ fontSize: '14px', color: '#6b6a5f', lineHeight: '1.5' }}>
              Create your NGO profile, upload legal documents, certificates, and organizational details. Our AI validates the information before it is reviewed by the Nivara admin team.
            </p>
          </div>

          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid var(--line)', position: 'relative' }}>
            <span style={{ fontSize: '32px', fontFamily: 'IBM Plex Mono, monospace', color: 'var(--moss)', fontWeight: 'bold', display: 'block', marginBottom: '12px' }}>2</span>
            <h4 style={{ fontSize: '18px', color: 'var(--indigo-deep)', margin: '0 0 10px' }}>Become a Verified NGO</h4>
            <p style={{ fontSize: '14px', color: '#6b6a5f', lineHeight: '1.5' }}>
              Once approved, your NGO receives a Verified Badge and gains access to the complete Nivara AI ecosystem, including funding assistance, proposal generation, and collaboration opportunities.
            </p>
          </div>

          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid var(--line)', position: 'relative' }}>
            <span style={{ fontSize: '32px', fontFamily: 'IBM Plex Mono, monospace', color: 'var(--moss)', fontWeight: 'bold', display: 'block', marginBottom: '12px' }}>3</span>
            <h4 style={{ fontSize: '18px', color: 'var(--indigo-deep)', margin: '0 0 10px' }}>Let Your AI Workforce Handle the Rest</h4>
            <p style={{ fontSize: '14px', color: '#6b6a5f', lineHeight: '1.5', marginBottom: '8px' }}>
              Your AI agents work like a digital team by helping you:
            </p>
            <ul style={{ fontSize: '13px', color: '#555', paddingLeft: '16px', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>Discover relevant funding opportunities</li>
              <li>Check grant eligibility</li>
              <li>Generate professional proposals</li>
              <li>Improve rejected applications</li>
              <li>Receive citizen food and resource donations</li>
              <li>Recruit volunteers, interns, and employees</li>
              <li>Track organizational impact and transparency</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. More Than Funding — A Complete NGO Ecosystem */}
      <section className={styles.section}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 className={styles.sectionTitle} style={{ fontSize: '32px' }}>More Than Funding — A Complete NGO Ecosystem</h2>
          <p className={styles.sectionSubtitle} style={{ maxWidth: '600px', margin: '10px auto 0' }}>
            Nivara connects every stakeholder in one intelligent platform.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'rgba(34, 56, 90, 0.05)', color: 'var(--indigo)', marginBottom: '12px' }}>
              <Building size={24} />
            </div>
            <h4 style={{ fontSize: '16px', color: 'var(--indigo-deep)', margin: '0 0 8px' }}>🏛️ NGOs</h4>
            <p style={{ fontSize: '13px', color: '#6b6a5f', lineHeight: '1.4' }}>
              Access AI-powered funding assistance, proposal writing, impact reporting, and collaboration tools.
            </p>
          </div>

          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', marginBottom: '12px' }}>
              <Heart size={24} />
            </div>
            <h4 style={{ fontSize: '16px', color: 'var(--indigo-deep)', margin: '0 0 8px' }}>❤️ Citizens</h4>
            <p style={{ fontSize: '13px', color: '#6b6a5f', lineHeight: '1.4' }}>
              Donate food, books, clothes, medical supplies, volunteer with NGOs, and discover verified organizations nearby.
            </p>
          </div>

          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'rgba(74, 91, 71, 0.05)', color: 'var(--moss)', marginBottom: '12px' }}>
              <Users size={24} />
            </div>
            <h4 style={{ fontSize: '16px', color: 'var(--indigo-deep)', margin: '0 0 8px' }}>🏢 Organizations</h4>
            <p style={{ fontSize: '13px', color: '#6b6a5f', lineHeight: '1.4' }}>
              Partner with verified NGOs through CSR initiatives, sponsor projects, and monitor social impact.
            </p>
          </div>

          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'rgba(217, 119, 6, 0.05)', color: 'var(--marigold)', marginBottom: '12px' }}>
              <GraduationCap size={24} />
            </div>
            <h4 style={{ fontSize: '16px', color: 'var(--indigo-deep)', margin: '0 0 8px' }}>🎓 Students</h4>
            <p style={{ fontSize: '13px', color: '#6b6a5f', lineHeight: '1.4' }}>
              Discover NGO internships, volunteer opportunities, and social impact careers while earning experience and certificates.
            </p>
          </div>
        </div>
      </section>



      {/* 5. Why Choose Nivara? */}
      <section className={styles.section} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '16px', padding: '40px' }}>
        <h2 style={{ fontSize: '28px', color: 'var(--indigo-deep)', marginBottom: '24px', textAlign: 'center' }}>Why Choose Nivara?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px 30px' }}>
          {[
            "AI-Powered NGO Verification",
            "Seamless Profile Management",
            "Personalized Funding Discovery",
            "Intelligent Proposal Generation",
            "CSR & Organization Collaboration",
            "Citizen Donation & Volunteer Network",
            "Internship & Job Marketplace",
            "Public Verified NGO Directory",
            "Transparency & Impact Tracking",
            "Built for Trust, Accessibility & Social Good"
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14.5px', color: 'var(--ink)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--moss-light)', color: 'var(--moss)' }}>
                <Check size={12} strokeWidth={3} />
              </div>
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ & Contact Quick Grid */}
      <section className={styles.section}>
        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.iconWrapper}>
              <HelpCircle size={24} />
            </div>
            <h3 className={styles.cardTitle}>Have Questions?</h3>
            <p className={styles.cardDesc}>
              Read our FAQs or check the documentation for guidance on verification criteria and proposal drafting guidelines.
            </p>
            <Link href="/about" style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: '600' }}>
              Read FAQ <ArrowRight size={14} />
            </Link>
          </div>

          <div className={styles.card}>
            <div className={styles.iconWrapper}>
              <Mail size={24} />
            </div>
            <h3 className={styles.cardTitle}>Get in Touch</h3>
            <p className={styles.cardDesc}>
              Need assistance with your registration or experiencing issues uploading documents? Our support team is ready to help.
            </p>
            <Link href="/contact" style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: '600' }}>
              Contact Support <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} Nivara Platform. All rights reserved.</p>
        <p style={{ marginTop: '6px', fontSize: '11px', opacity: 0.6 }}>Designed for social transparency and impact scaling.</p>
      </footer>
    </div>
  );
}
