"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  RefreshCw, LayoutDashboard, FileSpreadsheet, Bell, 
  Settings, LogOut, CheckCircle2, Sparkles, Send, 
  FileText, Check, Award, AlertTriangle, HelpCircle, 
  ArrowRight, Heart, Users, GraduationCap, DollarSign, Database,
  Lock, ShieldCheck, Briefcase
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/components/common/LanguageContext";
import styles from "./dashboard.module.css";

export default function Dashboard() {
  const router = useRouter();
  const { t, currentLanguage, changeLanguage, languagesList } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [ngoDetails, setNgoDetails] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, ai, grants, notifications, settings, jobs

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Settings State
  const [settingsSubTab, setSettingsSubTab] = useState("profile"); // profile, documents
  const [profileForm, setProfileForm] = useState({
    name: "",
    founderName: "",
    website: "",
    mobile: "",
    category: "",
    address: "",
    state: "",
    district: "",
    pinCode: "",
    annualBudget: "",
    currentFunding: "",
    fundingNeeded: ""
  });
  const [profileUpdating, setProfileUpdating] = useState(false);
  const [profileUpdateStatus, setProfileUpdateStatus] = useState("");

  // NGO Job/Internship Openings State
  const [ngoJobs, setNgoJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: "",
    type: "Full-time", // Full-time, Part-time, Internship
    description: ""
  });
  const [jobPosting, setJobPosting] = useState(false);
  const [jobPostStatus, setJobPostStatus] = useState("");

  const fetchNgoJobs = async () => {
    setJobsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("http://localhost:5000/api/ngo/jobs", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setNgoJobs(data.jobs || []);
      }
    } catch (err) {
      console.error("Error fetching NGO jobs:", err);
    } finally {
      setJobsLoading(false);
    }
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    setJobPosting(true);
    setJobPostStatus("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/ngo/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(jobForm)
      });
      const data = await res.json();
      if (res.ok) {
        setJobPostStatus("Job posting created successfully!");
        setJobForm({ title: "", type: "Full-time", description: "" });
        fetchNgoJobs();
      } else {
        setJobPostStatus(data.error || "Failed to create job posting.");
      }
    } catch (err) {
      console.error(err);
      setJobPostStatus("Network error posting job.");
    } finally {
      setJobPosting(false);
    }
  };

  const handleDeleteJob = async (id) => {
    if (!confirm("Are you sure you want to delete this job posting?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/ngo/jobs/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setNgoJobs(prev => prev.filter(j => j.id !== id));
      }
    } catch (err) {
      console.error("Error deleting job:", err);
    }
  };

  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("http://localhost:5000/api/notifications", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/notifications/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/notifications/read-all", {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileUpdating(true);
    setProfileUpdateStatus("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/ngo/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });
      const data = await res.json();
      if (res.ok) {
        setProfileUpdateStatus("Profile updated successfully!");
        setNgoDetails(prev => ({ ...prev, ...data.ngo }));
      } else {
        setProfileUpdateStatus(data.error || "Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      setProfileUpdateStatus("Network error updating profile.");
    } finally {
      setProfileUpdating(false);
    }
  };

  // Sync profileForm state when ngoDetails is loaded
  useEffect(() => {
    if (ngoDetails) {
      setProfileForm({
        name: ngoDetails.name || "",
        founderName: ngoDetails.founderName || "",
        website: ngoDetails.website || "",
        mobile: ngoDetails.mobile || "",
        category: ngoDetails.category || "Education",
        address: ngoDetails.address || "",
        state: ngoDetails.state || "Telangana",
        district: ngoDetails.district || "",
        pinCode: ngoDetails.pinCode || "",
        annualBudget: ngoDetails.annualBudget || "",
        currentFunding: ngoDetails.currentFunding || "",
        fundingNeeded: ngoDetails.fundingNeeded || ""
      });
    }
  }, [ngoDetails]);

  // AI Assistant States
  const [chatMessage, setChatMessage] = useState("");
  const [chatThread, setChatThread] = useState([
    { sender: "agent", text: "Welcome to the Nivara AI Agent Studio. I can assist you with Verification Audits, Grant Discovery, Proposal Writing, and Career Matching. Type or speak a command below!" }
  ]);
  const [agentSteps, setAgentSteps] = useState([]);
  const [activeNode, setActiveNode] = useState(null);
  const [agentResults, setAgentResults] = useState(null);
  const [agentLoading, setAgentLoading] = useState(false);
  const [proposalSavedAlert, setProposalSavedAlert] = useState(false);

  const [editedProposal, setEditedProposal] = useState({ title: '', subject: '', body: '' });

  // Sync edited proposal when agent results update
  useEffect(() => {
    if (agentResults?.proposal) {
      setEditedProposal({
        title: agentResults.proposal.title || '',
        subject: agentResults.proposal.subject || '',
        body: agentResults.proposal.body || ''
      });
    }
  }, [agentResults]);

  // Grants discovery state
  const [savedProposals, setSavedProposals] = useState([]);
  const [matchedGrants, setMatchedGrants] = useState([]);
  const [grantsLoading, setGrantsLoading] = useState(false);
  const [grantsFilters, setGrantsFilters] = useState({
    type: "All",
    sector: "All",
    state: "All",
    maxFunding: ""
  });
  const [grantsActiveSubTab, setGrantsActiveSubTab] = useState("discover"); // discover or ledger
  const [proposalGenerating, setProposalGenerating] = useState(false);
  
  // Individual AI Rank Evaluator States
  const [aiRankLoading, setAiRankLoading] = useState({});
  const [aiRankResults, setAiRankResults] = useState({});
  const [showAiRank, setShowAiRank] = useState({});



  // Upload States
  const [uploadFiles, setUploadFiles] = useState({
    regCert: null,
    panDoc: null,
    trustCert: null,
    cert80g: null,
    annualReport: null,
    financialReport: null,
    darpanCert: null,
    prevProposal: null
  });
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleFileChange = (e, field) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFiles(prev => ({
        ...prev,
        [field]: e.target.files[0]
      }));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadStatus("");

    const formData = new FormData();
    Object.entries(uploadFiles).forEach(([field, file]) => {
      if (file) {
        formData.append(field, file);
      }
    });

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/ngo/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");

      setUploadStatus("Legal documents uploaded successfully! Recalculating readiness score...");
      
      const profileRes = await fetch("http://localhost:5000/api/ngo/profile", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const profileData = await profileRes.json();
      if (profileRes.ok) {
        setNgoDetails(profileData.ngo);
      }
    } catch (err) {
      console.error(err);
      setUploadStatus(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Markdown parsing utility for PDF Export
  const parseMarkdownToHtml = (md) => {
    if (!md) return "";
    let html = md;
    
    // Normalize line endings
    html = html.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Parse ### Headings
    html = html.replace(/^###\s*(.*)$/gm, '<h3>$1</h3>');
    
    // Parse ## Headings
    html = html.replace(/^##\s*(.*)$/gm, '<h2>$1</h2>');
    
    // Parse **bold** text
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Parse bullet and numbered lists line by line
    const lines = html.split('\n');
    let inList = false;
    let listType = null; // 'ul' or 'ol'
    
    const processedLines = lines.map(line => {
      const trimmed = line.trim();
      
      // Match bullet lists
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        const content = trimmed.substring(2).trim();
        let prefix = '';
        if (!inList) {
          prefix = '<ul>';
          inList = true;
          listType = 'ul';
        } else if (listType === 'ol') {
          prefix = '</ol><ul>';
          listType = 'ul';
        }
        return `${prefix}<li>${content}</li>`;
      } 
      
      // Match numbered lists
      else if (trimmed.match(/^\d+\.\s/)) {
        const content = trimmed.replace(/^\d+\.\s/, '').trim();
        let prefix = '';
        if (!inList) {
          prefix = '<ol>';
          inList = true;
          listType = 'ol';
        } else if (listType === 'ul') {
          prefix = '</ul><ol>';
          listType = 'ol';
        }
        return `${prefix}<li>${content}</li>`;
      } 
      
      // Regular lines or headers
      else {
        let suffix = '';
        if (inList) {
          suffix = listType === 'ul' ? '</ul>' : '</ol>';
          inList = false;
          listType = null;
        }
        
        if (trimmed === '') {
          return suffix;
        }
        
        // Wrap regular paragraphs in <p> (excluding headers)
        if (!trimmed.startsWith('<h') && !trimmed.startsWith('<p') && !trimmed.startsWith('<div') && !trimmed.startsWith('<li')) {
          return `${suffix}<p>${trimmed}</p>`;
        }
        
        return `${suffix}${line}`;
      }
    });
    
    if (inList) {
      processedLines.push(listType === 'ul' ? '</ul>' : '</ol>');
    }
    
    return processedLines.join('\n');
  };

  // PDF Export Helpers
  const exportProposalPDF = (proposal) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>${proposal.title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Inter:wght@300;400;600;700&display=swap');
            @media print {
              body { padding: 0; margin: 0; }
              .no-print { display: none; }
              @page { size: A4; margin: 20mm; }
            }
            body { 
              font-family: 'Inter', system-ui, -apple-system, sans-serif; 
              color: #2e353f; 
              padding: 40px; 
              line-height: 1.6; 
              background: #fff;
            }
            .header-banner {
              border-bottom: 3px double #1e293b;
              padding-bottom: 20px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .brand-title {
              font-family: 'Cinzel', serif;
              font-size: 24px;
              font-weight: 700;
              color: #0f172a;
              letter-spacing: 0.1em;
            }
            .document-tag {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              color: #b45309;
              font-weight: 600;
              border: 1px solid #f59e0b;
              padding: 4px 8px;
              border-radius: 4px;
            }
            h1 { 
              font-family: 'Cinzel', serif; 
              color: #1e293b; 
              font-size: 22px;
              margin-top: 0;
              margin-bottom: 15px;
              line-height: 1.3;
            }
            .meta-box { 
              background: #f8fafc; 
              border: 1px solid #e2e8f0;
              border-left: 4px solid #0f172a;
              padding: 16px; 
              border-radius: 6px; 
              margin-bottom: 30px; 
              font-size: 13.5px; 
              color: #334155;
            }
            .meta-item {
              margin-bottom: 6px;
            }
            .meta-item:last-child {
              margin-bottom: 0;
            }
            .body-text { 
              white-space: pre-wrap; 
              font-size: 14.5px; 
              color: #1e293b;
            }
            .body-text h3 {
              font-family: 'Cinzel', serif;
              color: #0f172a;
              border-bottom: 1px solid #cbd5e1;
              padding-bottom: 6px;
              margin-top: 28px;
              margin-bottom: 14px;
              font-size: 16px;
              page-break-after: avoid;
            }
            .body-text p {
              margin-bottom: 14px;
            }
            .footer {
              margin-top: 50px;
              border-top: 1px solid #e2e8f0;
              padding-top: 15px;
              font-size: 11px;
              color: #64748b;
              text-align: center;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <div class="brand-title">NIVARA</div>
            <div class="document-tag">Official Proposal Draft</div>
          </div>
          
          <h1>${proposal.title}</h1>
          
          <div class="meta-box">
            <div class="meta-item"><strong>Applying Organization:</strong> ${ngoDetails?.name}</div>
            <div class="meta-item"><strong>Subject/Grant Scope:</strong> ${proposal.subject || 'Rule-Consistent Initiative'}</div>
            <div class="meta-item"><strong>Readiness Certification:</strong> Verified with Score ${ngoDetails?.readinessScore || 30}/100</div>
          </div>
          
          <div class="body-text">${parseMarkdownToHtml(proposal.body)}</div>
          
          <div class="footer">
            Generated via Nivara AI Proposal Architect &bull; Confidential and Proprietary
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const exportBudgetPDF = (budgetItems) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Project Budget Export - ${ngoDetails?.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Inter:wght@300;400;600;700&display=swap');
            @media print {
              body { padding: 0; margin: 0; }
              @page { size: A4; margin: 20mm; }
            }
            body { 
              font-family: 'Inter', system-ui, -apple-system, sans-serif; 
              color: #2e353f; 
              padding: 40px; 
              line-height: 1.6; 
              background: #fff;
            }
            .header-banner {
              border-bottom: 3px double #1e293b;
              padding-bottom: 20px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .brand-title {
              font-family: 'Cinzel', serif;
              font-size: 24px;
              font-weight: 700;
              color: #0f172a;
              letter-spacing: 0.1em;
            }
            .document-tag {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              color: #b45309;
              font-weight: 600;
              border: 1px solid #f59e0b;
              padding: 4px 8px;
              border-radius: 4px;
            }
            h1 { 
              font-family: 'Cinzel', serif; 
              color: #1e293b; 
              font-size: 22px;
              margin-top: 0;
              margin-bottom: 15px;
            }
            .ngo-name {
              font-size: 14px;
              color: #475569;
              margin-bottom: 24px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px; 
              box-shadow: 0 1px 3px rgba(0,0,0,0.02);
            }
            th, td { 
              padding: 12px 14px; 
              border: 1px solid #e2e8f0; 
              text-align: left; 
              font-size: 13.5px;
            }
            th { 
              background: #f8fafc; 
              color: #0f172a;
              font-weight: 600;
              text-transform: uppercase;
              font-size: 11.5px;
              letter-spacing: 0.05em;
            }
            tr:nth-child(even) {
              background: #fdfdfd;
            }
            .total { 
              font-weight: 700; 
              background: #f1f5f9 !important; 
              color: #0f172a;
              font-size: 14px;
            }
            .footer {
              margin-top: 60px;
              border-top: 1px solid #e2e8f0;
              padding-top: 15px;
              font-size: 11px;
              color: #64748b;
              text-align: center;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <div class="brand-title">NIVARA</div>
            <div class="document-tag">Project Budget breakdown</div>
          </div>
          
          <h1>Itemized Project Budget Matrix</h1>
          <div class="ngo-name"><strong>Submitting NGO:</strong> ${ngoDetails?.name}</div>
          
          <table>
            <thead>
              <tr>
                <th>Budget Category</th>
                <th>Allocation Details & Description</th>
                <th style="text-align: right; width: 150px;">Allocation</th>
              </tr>
            </thead>
            <tbody>
              ${budgetItems.map(item => `
                <tr>
                  <td><strong>${item.item}</strong></td>
                  <td style="color: #475569;">${item.desc}</td>
                  <td style="text-align: right; font-weight: 600;">${item.allocation}</td>
                </tr>
              `).join('')}
              <tr class="total">
                <td colspan="2">Total Project Budget Allocation</td>
                <td style="text-align: right;">${ngoDetails?.fundingNeeded || '₹10,00,000'}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="footer">
            Generated via Nivara AI Budget Planner &bull; Sealed and Certified
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const exportReadinessPDF = (results) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Readiness Report - ${ngoDetails?.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Inter:wght@300;400;600;700&display=swap');
            @media print {
              body { padding: 0; margin: 0; }
              @page { size: A4; margin: 20mm; }
            }
            body { 
              font-family: 'Inter', system-ui, -apple-system, sans-serif; 
              color: #2e353f; 
              padding: 40px; 
              line-height: 1.6; 
              background: #fff;
            }
            .header-banner {
              border-bottom: 3px double #1e293b;
              padding-bottom: 20px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .brand-title {
              font-family: 'Cinzel', serif;
              font-size: 24px;
              font-weight: 700;
              color: #0f172a;
              letter-spacing: 0.1em;
            }
            .document-tag {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              color: #b45309;
              font-weight: 600;
              border: 1px solid #f59e0b;
              padding: 4px 8px;
              border-radius: 4px;
            }
            h1 { 
              font-family: 'Cinzel', serif; 
              color: #1e293b; 
              font-size: 22px;
              margin-top: 0;
              margin-bottom: 10px;
            }
            .subtitle {
              font-size: 14px;
              color: #475569;
              margin-bottom: 30px;
            }
            .score-container { 
              display: flex;
              align-items: center;
              gap: 20px;
              background: #f8fafc; 
              border: 1px solid #e2e8f0;
              padding: 24px; 
              border-radius: 8px; 
              margin-bottom: 30px;
            }
            .score-circle {
              width: 80px;
              height: 80px;
              border-radius: 50%;
              background: #0f172a;
              color: #f59e0b;
              font-family: 'Cinzel', serif;
              font-size: 26px;
              font-weight: 700;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 3px solid #f59e0b;
            }
            .score-info {
              flex: 1;
            }
            .score-title {
              font-size: 16px;
              font-weight: 700;
              color: #0f172a;
              margin-bottom: 4px;
            }
            .score-desc {
              font-size: 13px;
              color: #475569;
            }
            h3 {
              font-family: 'Cinzel', serif;
              color: #0f172a;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 6px;
              margin-top: 30px;
              margin-bottom: 14px;
              font-size: 15px;
            }
            ul { 
              padding-left: 20px; 
              margin-bottom: 20px;
            }
            li { 
              margin-bottom: 8px; 
              font-size: 13.5px;
            }
            .strength-item::marker {
              color: #16a34a;
            }
            .missing-item {
              color: #b91c1c;
            }
            .missing-item::marker {
              color: #dc2626;
            }
            .action-item::marker {
              color: #2563eb;
            }
            .footer {
              margin-top: 60px;
              border-top: 1px solid #e2e8f0;
              padding-top: 15px;
              font-size: 11px;
              color: #64748b;
              text-align: center;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <div class="brand-title">NIVARA</div>
            <div class="document-tag">Assessment Certificate</div>
          </div>
          
          <h1>Funding Readiness Assessment Report</h1>
          <div class="subtitle"><strong>NGO Profile Name:</strong> ${ngoDetails?.name}</div>
          
          <div class="score-container">
            <div class="score-circle">${results.score || 30}</div>
            <div class="score-info">
              <div class="score-title">Foundational Readiness Score</div>
              <div class="score-desc">This score reflects document compliance, founder credentials consistency, and geographical verification on the Nivara ledger.</div>
            </div>
          </div>
          
          <h3>Verified Organizational Strengths</h3>
          <ul>
            ${results.strengths?.map(s => `<li class="strength-item">${s}</li>`).join('') || '<li class="strength-item">Governance credentials</li>'}
          </ul>

          <h3>Audit Findings & Missing Filings</h3>
          <ul>
            ${results.missingDocs?.map(m => `<li class="missing-item"><strong>Missing:</strong> ${m}</li>`).join('') || '<li class="strength-item" style="color: #16a34a;">All foundational legal certificates verified.</li>'}
          </ul>

          <h3>Dynamic Preparation Roadmap</h3>
          <ul>
            ${results.recommendedSteps?.map(r => `<li class="action-item">${r}</li>`).join('') || '<li class="action-item">Fully audit compliant. Proceed to discovery of institutional grants.</li>'}
          </ul>

          <div class="footer">
            Generated via Nivara AI Verification Auditor &bull; Authenticated copy
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token || role !== "NGO") {
          router.push("/login");
          return;
        }

        const res = await fetch("http://localhost:5000/api/ngo/profile", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load profile.");
        }

        setNgoDetails(data.ngo);
        fetchNotifications();
        fetchNgoJobs();

      } catch (err) {
        console.error(err);
        localStorage.clear();
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchMatchedGrants = async () => {
    setGrantsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { type, sector, state, maxFunding } = grantsFilters;
      let url = `http://localhost:5000/api/funding/matches?type=${type}&sector=${sector}&state=${state}`;
      if (maxFunding) url += `&maxFunding=${maxFunding}`;

      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMatchedGrants(data.matches || []);
      }
    } catch (err) {
      console.error("Error fetching matched grants:", err);
    } finally {
      setGrantsLoading(false);
    }
  };  const handleFetchAIRank = async (grantId) => {
    // Toggle expand if already loaded
    if (aiRankResults[grantId]) {
      setShowAiRank(prev => ({ ...prev, [grantId]: !prev[grantId] }));
      return;
    }
    
    setAiRankLoading(prev => ({ ...prev, [grantId]: true }));
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/funding/ai-rank", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ grantId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load AI evaluation.");
      
      setAiRankResults(prev => ({ ...prev, [grantId]: data.aiRecommendation }));
      setShowAiRank(prev => ({ ...prev, [grantId]: true }));
    } catch (err) {
      console.error("Error fetching AI rank:", err);
      alert(err.message);
    } finally {
      setAiRankLoading(prev => ({ ...prev, [grantId]: false }));
    }
  };

  useEffect(() => {
    if (activeTab === "grants" && ngoDetails?.status === "APPROVED") {
      fetchMatchedGrants();
    }
  }, [activeTab, grantsFilters, ngoDetails?.status]);

  const handleGenerateProposal = async (grantId) => {
    setProposalGenerating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/funding/generate-proposal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ grantId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate proposal.");

      setAgentResults(prev => ({
        ...prev,
        proposal: {
          title: data.title,
          subject: data.subject,
          body: data.body
        }
      }));
      setEditedProposal({
        title: data.title,
        subject: data.subject,
        body: data.body
      });
      setActiveNode("proposal");
      setActiveTab("ai");
    } catch (err) {
      console.error("Error generating proposal:", err);
      alert(err.message);
    } finally {
      setProposalGenerating(false);
    }
  };

  const exportCurrentReadinessReport = () => {
    const missingArray = ngoDetails?.missingDocs ? ngoDetails.missingDocs.split(',').filter(Boolean) : [];
    const suggestionsArray = ngoDetails?.improvementSuggestions ? [ngoDetails.improvementSuggestions] : [];
    exportReadinessPDF({
      score: ngoDetails?.readinessScore || 30,
      strengths: ["Proper founder governance", `Located in target district ${ngoDetails?.district || ''}`, "Document filings integrity verified"],
      missingDocs: missingArray,
      recommendedSteps: suggestionsArray
    });
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  // Submit query to AI agents orchestrator
  const submitAIQuery = async (queryText) => {
    if (!queryText.trim()) return;

    setAgentLoading(true);
    setProposalSavedAlert(false);
    setChatThread((prev) => [...prev, { sender: "user", text: queryText }]);
    setChatMessage("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message: queryText, language: "en-US" })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Agent execution failed.");

      // Animate LangGraph node transitions
      setAgentSteps(data.steps);
      setActiveNode(data.targetAgent);
      setAgentResults(data.results);

      // Speak & display response message
      let replyText = data.response || "";
      if (!replyText) {
        if (data.targetAgent === "verification") {
          replyText = `Audit complete! Your dynamic Funding Readiness Score is ${data.results.score}/100. Check the workspace on the right for missing parameters.`;
        } else if (data.targetAgent === "funding") {
          replyText = `I scanned the grants repository and matched ${data.results.opportunities.length} funding opportunities aligned to your category: ${data.results.opportunities[0]?.sector || "NGO"}.`;
        } else if (data.targetAgent === "proposal") {
          replyText = `Successfully drafted your grant proposal and calculated itemized project budget. Reviewer audit and historical weights applied!`;
        } else if (data.targetAgent === "donation") {
          replyText = `Donations check complete! Identified matched citizen donations near your location. Check claims below.`;
        } else if (data.targetAgent === "career") {
          replyText = `Matched career opportunities: retrieved active student internship profiles for your vacancies.`;
        } else {
          replyText = `Synthesized impact and transparency analytics rating for your organization.`;
        }
      }

      setChatThread((prev) => [...prev, { sender: "agent", text: replyText }]);

    } catch (err) {
      console.error(err);
      setChatThread((prev) => [...prev, { sender: "agent", text: `Error: ${err.message}` }]);
    } finally {
      setAgentLoading(false);
    }
  };

  // Save proposal draft to database
  const saveProposalDraft = async () => {
    if (!editedProposal?.body) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/agents/proposals/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editedProposal.title,
          subject: editedProposal.subject,
          body: editedProposal.body
        })
      });

      if (res.ok) {
        setProposalSavedAlert(true);
        // Refresh NGO profile info to reload the saved applications list in ledger
        const profileRes = await fetch("http://localhost:5000/api/ngo/profile", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const profileData = await profileRes.json();
        if (profileRes.ok) {
          setNgoDetails(profileData.ngo);
        }
      }
    } catch (err) {
      console.error("Failed to save draft:", err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '16px', background: 'var(--paper)' }}>
        <RefreshCw size={36} className="animate-spin" style={{ color: 'var(--indigo)' }} />
        <p style={{ color: '#6b6a5f', fontSize: '15px' }}>Accessing Nivara workspace...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {proposalGenerating && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          zIndex: 9999,
          gap: '16px'
        }}>
          <div style={{
            background: '#fff',
            padding: '30px 40px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            maxWidth: '400px',
            textAlign: 'center'
          }}>
            <RefreshCw size={36} className="animate-spin" style={{ color: 'var(--indigo)' }} />
            <h3 style={{ fontSize: '18px', color: 'var(--indigo-deep)', margin: 0, fontWeight: 'bold' }}>Nivara AI Proposal Writer</h3>
            <p style={{ fontSize: '13.5px', color: '#6b6a5f', margin: 0, lineHeight: '1.5' }}>
              Our AI Agent is parsing the grant details and your NGO profile to compile a professional, rule-consistent proposal draft. Please wait...
            </p>
          </div>
        </div>
      )}
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div>
          <div className={styles.brand}>
            <div className={styles.seal}>N</div>
            <span className={styles.brandName}>NIVARA</span>
          </div>

          <ul className={styles.menuList}>
            <li 
              className={`${styles.menuItem} ${activeTab === "dashboard" ? styles.menuItemActive : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <LayoutDashboard size={18} /> {t('dashboard')}
            </li>
            <li 
              className={`${styles.menuItem} ${activeTab === "ai" ? styles.menuItemActive : ""}`}
              onClick={() => setActiveTab("ai")}
            >
              <Sparkles size={18} style={{ color: 'var(--marigold)' }} /> {t('aiAssistant')}
            </li>
            <li 
              className={`${styles.menuItem} ${activeTab === "grants" ? styles.menuItemActive : ""}`}
              onClick={() => {
                setActiveTab("grants");
              }}
            >
              <FileSpreadsheet size={18} /> {t('grantsProposals')}
            </li>

            <li 
              className={`${styles.menuItem} ${activeTab === "jobs" ? styles.menuItemActive : ""}`}
              onClick={() => {
                setActiveTab("jobs");
                fetchNgoJobs();
              }}
            >
              <Briefcase size={18} /> {t('jobsInternships')}
            </li>

            <li 
              className={`${styles.menuItem} ${activeTab === "notifications" ? styles.menuItemActive : ""}`}
              onClick={() => {
                setActiveTab("notifications");
                fetchNotifications();
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
            >
              <Bell size={18} /> {t('notifications')}
              {notifications.filter(n => !n.read).length > 0 && (
                <span style={{
                  background: 'var(--coral)',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  marginLeft: 'auto'
                }}>
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </li>
            <li 
              className={`${styles.menuItem} ${activeTab === "settings" ? styles.menuItemActive : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              <Settings size={18} /> {t('settings')}
            </li>
          </ul>
        </div>

        <button onClick={handleLogout} className={styles.menuItem} style={{ background: 'transparent', border: 'none', width: '100%', display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer', color: '#cfd3d9' }}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* Main Workspace */}
      <main className={styles.mainContent}>
        {/* TOP SEAL */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>
              {activeTab === "ai" ? t('aiAssistant') : `${t('welcome')}, ${ngoDetails?.name}`}
            </h1>
            <p style={{ color: '#6b6a5f', fontSize: '14px', marginTop: '4px' }}>NGO ID: {ngoDetails?.id}</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Language Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '14.5px' }}>🌐</span>
              <select
                value={currentLanguage}
                onChange={(e) => {
                  changeLanguage(e.target.value);
                  // Update NGO profile in DB
                  fetch("http://localhost:5000/api/ngo/update", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "Authorization": `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify({ language: e.target.value })
                  }).catch(console.error);
                }}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--line)',
                  fontSize: '13px',
                  background: '#fff',
                  cursor: 'pointer',
                  fontWeight: '600',
                  color: 'var(--indigo-deep)'
                }}
              >
                {languagesList.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: ngoDetails?.status === "APPROVED" ? 'var(--moss-light)' : ngoDetails?.status === "REJECTED" ? '#fff5f5' : '#fdfaf2',
              color: ngoDetails?.status === "APPROVED" ? 'var(--moss)' : ngoDetails?.status === "REJECTED" ? 'var(--coral)' : 'var(--marigold)',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600'
            }}>
              <ShieldCheck size={16} /> {ngoDetails?.status || 'PENDING'}
            </div>
          </div>
        </header>

        {/* --- VIEW: GENERAL DASHBOARD TAB --- */}
        {activeTab === "dashboard" && (
          <div>
            <section className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statVal}>{ngoDetails?.readinessScore || 30} / 100</div>
                <div className={styles.statLabel}>Funding Readiness Score</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statVal}>{ngoDetails?.opportunities?.length || 0} Matched</div>
                <div className={styles.statLabel}>Matched Opportunities</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statVal}>{ngoDetails?.applications?.filter(a => a.status !== 'DRAFT').length || 0} Submitted</div>
                <div className={styles.statLabel}>Submitted Applications</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statVal} style={{ textTransform: 'capitalize' }}>{ngoDetails?.status?.toLowerCase() || 'pending'}</div>
                <div className={styles.statLabel}>Verification Status</div>
              </div>
            </section>

            <div className={styles.grid}>
              <div>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Platform Match Alerts</h3>
                  <p style={{ color: '#6b6a5f', fontSize: '14px', marginBottom: '14px' }}>
                    Automated matching based on focus area: <b style={{ color: 'var(--indigo-deep)' }}>{ngoDetails?.category}</b> and state.
                  </p>
                  
                  {ngoDetails?.opportunities && ngoDetails.opportunities.length > 0 ? (
                    ngoDetails.opportunities.slice(0, 3).map((opp, i) => (
                      <div key={opp.id || i} className={styles.listItem}>
                        <div>
                          <h4 style={{ fontSize: '14.5px', color: 'var(--indigo-deep)' }}>{opp.name}</h4>
                          <p style={{ fontSize: '12.5px', color: '#9a9888', marginTop: '2px' }}>{opp.sector} &bull; {opp.region}</p>
                        </div>
                        <span className={`${styles.badge} ${styles.badgeSuccess}`}>{opp.matchPercentage}% Match</span>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: '12.5px', color: '#9a9888', fontStyle: 'italic' }}>No matches available.</p>
                  )}
                </div>

                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Recent Activity Logs</h3>
                  {ngoDetails?.recentActivityLogs && ngoDetails.recentActivityLogs.length > 0 ? (
                    ngoDetails.recentActivityLogs.map((log, i) => (
                      <div key={i} className={styles.listItem}>
                        <span style={{ fontSize: '13.5px', color: '#555' }}>{log.action}</span>
                        <span style={{ fontSize: '12px', color: '#9a9888' }}>{new Date(log.timestamp).toLocaleDateString()}</span>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: '12.5px', color: '#9a9888', fontStyle: 'italic' }}>No activity logs recorded yet.</p>
                  )}
                </div>
              </div>

              <div>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>AI Verification & Document Compliance</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13.5px', color: '#6b6a5f' }}>Status:</span>
                      <span style={{
                        fontSize: '12px',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontWeight: '700',
                        background: ngoDetails?.status === "APPROVED" ? 'var(--moss-light)' : ngoDetails?.status === "REJECTED" ? '#fff5f5' : '#fdfaf2',
                        color: ngoDetails?.status === "APPROVED" ? 'var(--moss)' : ngoDetails?.status === "REJECTED" ? 'var(--coral)' : 'var(--marigold)'
                      }}>
                        {ngoDetails?.status || "PENDING"}
                      </span>
                    </div>

                    <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--indigo-deep)', display: 'block', marginBottom: '4px' }}>AI Audit Summary</span>
                      <p style={{ fontSize: '12.5px', color: '#555', margin: 0, lineHeight: '1.4' }}>
                        {ngoDetails?.verificationSummary || "No documentation audits recorded. Please upload certificate filings in Settings."}
                      </p>
                    </div>

                    {ngoDetails?.missingDocs && ngoDetails.missingDocs.split(',').filter(Boolean).length > 0 && (
                      <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--coral)', display: 'block', marginBottom: '4px' }}>Missing Required Certificates</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {ngoDetails.missingDocs.split(',').filter(Boolean).map((doc, idx) => (
                            <span key={idx} style={{ fontSize: '11px', background: '#fff5f5', color: 'var(--coral)', padding: '2px 8px', borderRadius: '4px', border: '1px solid #ffe3e3' }}>
                              {doc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {ngoDetails?.improvementSuggestions && (
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--indigo-deep)', display: 'block', marginBottom: '4px' }}>Improvement Suggestions</span>
                        <p style={{ fontSize: '12px', color: '#6b6a5f', margin: 0, fontStyle: 'italic' }}>
                          {ngoDetails.improvementSuggestions}
                        </p>
                      </div>
                    )}

                    {ngoDetails?.readinessScore && (
                      <button 
                        onClick={exportCurrentReadinessReport}
                        className={styles.btn}
                        style={{
                          marginTop: '12px',
                          background: 'var(--indigo)',
                          color: '#fff',
                          border: 'none',
                          padding: '10px',
                          borderRadius: '6px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          fontSize: '13px',
                          width: '100%'
                        }}
                      >
                        <FileText size={16} /> Export Readiness Certificate (PDF)
                      </button>
                    )}
                  </div>
                </div>

                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Platform AI Workspace</h3>
                  <p style={{ fontSize: '13.5px', color: '#555', marginBottom: '16px' }}>
                    Access your planning agent orchestrator. Ask questions, construct grant proposals, audit parameters, or claim citizen donations.
                  </p>
                  <button 
                    onClick={() => setActiveTab("ai")}
                    className={styles.btn}
                    style={{
                      width: '100%',
                      background: 'var(--indigo)',
                      color: '#fff',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '6px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Sparkles size={16} /> Open AI Chat
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW: AI AGENT STUDIO TAB --- */}
        {activeTab === "ai" && (
          ngoDetails?.status !== "APPROVED" ? (
            <div className={styles.card} style={{ padding: '32px', textAlign: 'center', background: '#fdfaf2', border: '1px solid var(--line)', borderRadius: '12px', width: '100%' }}>
              <Lock size={48} style={{ color: 'var(--marigold)', marginBottom: '16px' }} />
              <h2 style={{ fontSize: '20px', color: 'var(--indigo-deep)', marginBottom: '8px' }}>AI Agent Studio Locked</h2>
              <p style={{ fontSize: '14.5px', color: '#6b6a5f', maxWidth: '550px', margin: '0 auto 20px', lineHeight: '1.5' }}>
                Access to funding discovery, proposal creation, itemized budget calculators, and draft compliance reviews is restricted to fully verified accounts. 
                Your verification status is currently: <b>{ngoDetails?.status || "PENDING"}</b>.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button 
                  onClick={() => setActiveTab("settings")} 
                  className={styles.btn} 
                  style={{ background: 'var(--indigo)', color: '#fff', border: 'none' }}
                >
                  Go to Settings & Upload Files
                </button>
              </div>
            </div>
          ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '20px', minHeight: 'calc(100vh - 180px)' }}>
            {/* LEFT COLUMN: CHAT CONSOLE & LANGGRAPH FLOW */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Chat Thread */}
              <div className={styles.card} style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px', maxHeight: '420px', overflow: 'hidden' }}>
                <h3 className={styles.cardTitle} style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} style={{ color: 'var(--marigold)' }} /> Agent Query Console
                </h3>

                {/* Predefined prompt chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                  {[
                    "I need funding",
                    "Verify my readiness score",
                    "I want interns",
                    "Check nearby food donations",
                    "Generate transparency report"
                  ].map((p, i) => (
                    <button
                      key={i}
                      onClick={() => submitAIQuery(p)}
                      disabled={agentLoading}
                      style={{
                        padding: '5px 8px',
                        fontSize: '11px',
                        fontWeight: '500',
                        color: 'var(--indigo-deep)',
                        background: 'rgba(34, 56, 90, 0.05)',
                        border: '1px solid rgba(34, 56, 90, 0.1)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {/* Feed */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px', marginBottom: '12px' }}>
                  {chatThread.map((msg, i) => (
                    <div 
                      key={i} 
                      style={{
                        alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                        background: msg.sender === "user" ? "var(--indigo)" : "#f6f3ec",
                        color: msg.sender === "user" ? "#fff" : "var(--ink)",
                        padding: '10px 14px',
                        borderRadius: '12px',
                        fontSize: '12.5px',
                        maxWidth: '85%',
                        lineHeight: '1.4',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      {msg.text}
                    </div>
                  ))}
                  {agentLoading && (
                    <div style={{ alignSelf: 'flex-start', background: '#f6f3ec', padding: '10px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <RefreshCw size={14} className="animate-spin" /> <span style={{ fontSize: '12px', color: '#6b6a5f' }}>AI Agent planning...</span>
                    </div>
                  )}
                </div>

                {/* Send query box */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitAIQuery(chatMessage);
                  }}
                  style={{ display: 'flex', gap: '8px' }}
                >
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type e.g., I need funding for school kits..."
                    disabled={agentLoading}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      fontSize: '13px',
                      border: '1px solid var(--line)',
                      borderRadius: '8px',
                      fontFamily: 'inherit'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={agentLoading}
                    style={{
                      background: 'var(--indigo)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      cursor: 'pointer'
                    }}
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>

              {/* LANGGRAPH STATE VISUALIZER */}
              <div className={styles.card} style={{ padding: '16px' }}>
                <h3 className={styles.cardTitle} style={{ fontSize: '13px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Database size={14} /> LangGraph Executing Node Sequence
                </h3>

                {agentSteps.length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#9a9888', fontStyle: 'italic' }}>
                    No execution path mapped yet. Send a query to run the planner graph.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {agentSteps.map((step, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: step.status === "done" ? "var(--moss)" : "var(--marigold)",
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px'
                          }}>
                            {step.status === "done" ? <Check size={10} /> : idx + 1}
                          </div>
                          {idx < agentSteps.length - 1 && (
                            <div style={{ width: '2px', height: '20px', background: 'var(--line)', marginTop: '4px' }} />
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--indigo-deep)' }}>{step.node}</div>
                          <div style={{ fontSize: '11px', color: '#6b6a5f', marginTop: '2px' }}>{step.message}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: INTERACTIVE AGENT WORKSPACE */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className={styles.card} style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', background: 'rgba(255, 255, 255, 0.98)' }}>
                
                {/* 0. Idle View */}
                {!activeNode && (
                  <div style={{ textAlign: 'center', margin: 'auto', maxWidth: '380px' }}>
                    <Sparkles size={48} style={{ color: 'var(--marigold)', marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '18px', color: 'var(--indigo-deep)', margin: '0 0 8px' }}>Specialized Agent Workspace</h3>
                    <p style={{ fontSize: '13.5px', color: '#6b6a5f', lineHeight: '1.5' }}>
                      Once you query the planner, the target agent's dynamic dashboards, scores, matching grids, and documents audits will populate here in real-time.
                    </p>
                  </div>
                )}

                {/* 1. Verification Agent Workspace */}
                {activeNode === "verification" && agentResults && (
                  <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '14px' }}>
                      <div>
                        <h3 style={{ fontSize: '18px', color: 'var(--indigo-deep)', margin: 0 }}>Verification & OCR Audit Workspace</h3>
                        <p style={{ fontSize: '12.5px', color: '#6b6a5f', marginTop: '2px' }}>AI Document integrity checks</p>
                      </div>
                      <button 
                        onClick={() => exportReadinessPDF(agentResults)}
                        style={{
                          background: 'var(--indigo)',
                          color: '#fff',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Export Report
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'center' }}>
                      {/* Gauge Speedometer */}
                      <div style={{ textAlign: 'center', background: '#fdfcf9', border: '1px solid #f6f3ec', padding: '20px', borderRadius: '12px' }}>
                        <div style={{ fontSize: '36px', fontWeight: '800', color: (agentResults.score || 30) >= 80 ? 'var(--moss)' : 'var(--marigold)' }}>
                          {agentResults.score || 30}
                        </div>
                        <div style={{ fontSize: '11px', color: '#9a9888', fontWeight: '600', textTransform: 'uppercase', marginTop: '4px' }}>Readiness Score</div>
                        
                        {/* Circular track mock SVG */}
                        <div style={{ width: '80px', height: '40px', overflow: 'hidden', margin: '12px auto 0', position: 'relative' }}>
                          <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            border: '10px solid var(--line)',
                            borderTopColor: 'var(--moss)',
                            borderRightColor: 'var(--moss)',
                            transform: `rotate(${(((agentResults.score || 30) / 100) * 180) - 45}deg)`,
                            boxSizing: 'border-box'
                          }} />
                        </div>
                      </div>

                      {/* Missing checklist */}
                      <div>
                        <h4 style={{ fontSize: '13px', color: 'var(--indigo-deep)', marginBottom: '8px' }}>Audited Document Inventory</h4>
                        {!agentResults.missingDocs || agentResults.missingDocs.length === 0 ? (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--moss)', fontSize: '12.5px' }}>
                            <CheckCircle2 size={16} /> All foundational legal documents validated. Ready for institutional grants!
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--coral)', fontWeight: '600' }}>
                              ⚠️ Missing files preventing full verification:
                            </span>
                            {agentResults.missingDocs.map((doc, idx) => (
                              <div key={idx} style={{ fontSize: '12.5px', color: '#6b6a5f', display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--coral)' }} /> {doc}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* OCR validation log table */}
                    {agentResults.ocrDetails && (
                      <div style={{ background: '#f6f7f9', padding: '16px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                        <h4 style={{ fontSize: '13px', color: 'var(--indigo-deep)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FileText size={14} /> AI-Assisted OCR Scan Logs
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {agentResults.ocrDetails.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderBottom: '1px solid rgba(0,0,0,0.03)', paddingBottom: '4px' }}>
                              <span style={{ color: '#555', fontWeight: '500' }}>{item.file}</span>
                              <span style={{ color: item.status.includes("Missing") ? "var(--coral)" : "var(--moss)", fontWeight: '600' }}>{item.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Verification Audit Insights */}
                    <div style={{ background: '#fcfbf7', padding: '16px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                      <h4 style={{ fontSize: '13px', color: 'var(--indigo-deep)', marginBottom: '8px' }}>AI Compliance & Assessment Insights</h4>
                      <p style={{ fontSize: '12.5px', color: '#555', margin: '0 0 10px', lineHeight: '1.4' }}>
                        <b>Verification Summary:</b> {ngoDetails?.verificationSummary || "Awaiting document uploads to run the AI compliance scanner."}
                      </p>
                      <p style={{ fontSize: '12.5px', color: '#6b6a5f', margin: 0, fontStyle: 'italic', lineHeight: '1.4' }}>
                        <b>Improvement Recommendations:</b> {ngoDetails?.improvementSuggestions || "Upload missing documents in Settings."}
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. Funding Advisor Agent Workspace */}
                {activeNode === "funding" && agentResults && (
                  <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '14px' }}>
                      <div>
                        <h3 style={{ fontSize: '18px', color: 'var(--indigo-deep)', margin: 0 }}>Matched Funding Opportunities</h3>
                        <p style={{ fontSize: '12.5px', color: '#6b6a5f', marginTop: '2px' }}>Personalized matching database targets</p>
                      </div>
                      <span style={{ fontSize: '11px', padding: '4px 8px', background: 'var(--moss-light)', color: 'var(--moss)', borderRadius: '4px', fontWeight: '600' }}>Active Node</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '350px' }}>
                      {agentResults.opportunities?.map((grant) => (
                        <div key={grant.id} style={{ border: '1px solid var(--line)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', background: '#fff' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <h4 style={{ fontSize: '14.5px', color: 'var(--indigo-deep)', margin: 0 }}>{grant.name}</h4>
                              <p style={{ fontSize: '12px', color: '#9a9888', marginTop: '2px' }}>{grant.sector} &bull; {grant.region}</p>
                            </div>
                            <span style={{ fontSize: '12px', padding: '4px 8px', background: 'var(--moss-light)', color: 'var(--moss)', borderRadius: '12px', fontWeight: '700' }}>
                              {grant.matchPercentage}% Match
                            </span>
                          </div>
                          <p style={{ fontSize: '12.5px', color: '#6b6a5f', lineHeight: '1.4', margin: 0 }}>{grant.notes}</p>
                          <div style={{ background: '#fdfcf9', border: '1px solid #f6f3ec', padding: '8px 10px', borderRadius: '6px', fontSize: '11.5px', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                            <HelpCircle size={14} style={{ color: 'var(--indigo)', flexShrink: 0, marginTop: '1px' }} />
                            <span style={{ color: '#4a5b47' }}><b>Eligibility Explainer:</b> {grant.eligibilityReason}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Proposal Writer Agent Workspace */}
                {activeNode === "proposal" && agentResults && agentResults.proposal && (
                  <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: '420px', paddingRight: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
                      <div>
                        <h3 style={{ fontSize: '17px', color: 'var(--indigo-deep)', margin: 0 }}>AI Proposal Workspace</h3>
                        <p style={{ fontSize: '12px', color: '#6b6a5f', marginTop: '2px' }}>Drafted proposal body (Editable)</p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => exportProposalPDF(editedProposal)}
                          style={{
                            background: 'var(--indigo)',
                            color: '#fff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Export PDF
                        </button>
                        <button 
                          onClick={saveProposalDraft}
                          style={{
                            background: 'var(--moss)',
                            color: '#fff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Save Draft
                        </button>
                      </div>
                    </div>

                    {proposalSavedAlert && (
                      <div style={{ background: 'var(--moss-light)', border: '1px solid #c7d9c9', color: 'var(--moss)', padding: '10px', borderRadius: '6px', fontSize: '12px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <Check size={16} /> Draft saved successfully to your Grants & Applications ledger.
                      </div>
                    )}

                    {/* Proposal Document Preview */}
                    <div style={{ border: '1px solid var(--line)', padding: '14px', borderRadius: '8px', background: '#fdfcf9' }}>
                      <input 
                        type="text" 
                        value={editedProposal.title} 
                        onChange={(e) => setEditedProposal(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Proposal Title"
                        style={{ width: '100%', fontSize: '14px', color: 'var(--indigo-deep)', border: 'none', borderBottom: '1px dashed var(--line)', paddingBottom: '6px', marginBottom: '8px', background: 'transparent', fontWeight: 'bold', outline: 'none' }}
                      />
                      <div style={{ fontSize: '11px', color: '#9a9888', margin: '0 0 8px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <b>Subject:</b> 
                        <input 
                          type="text" 
                          value={editedProposal.subject} 
                          onChange={(e) => setEditedProposal(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder="Proposal Subject"
                          style={{ border: 'none', background: 'transparent', fontSize: '11px', color: '#555', flex: 1, outline: 'none' }}
                        />
                      </div>
                      <textarea
                        value={editedProposal.body}
                        onChange={(e) => setEditedProposal(prev => ({ ...prev, body: e.target.value }))}
                        placeholder="Write proposal body..."
                        rows={16}
                        style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '12px', color: 'var(--ink)', lineHeight: '1.5', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
                      />
                    </div>
                  </div>
                )}

                {/* 3b. Budget Generator Agent Workspace */}
                {activeNode === "budget" && agentResults && agentResults.budgetItems && (
                  <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: '420px', paddingRight: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
                      <div>
                        <h3 style={{ fontSize: '17px', color: 'var(--indigo-deep)', margin: 0 }}>AI Budget Workspace</h3>
                        <p style={{ fontSize: '12px', color: '#6b6a5f', marginTop: '2px' }}>Calculated project allocations</p>
                      </div>
                      <button 
                        onClick={() => exportBudgetPDF(agentResults.budgetItems)}
                        style={{
                          background: 'var(--indigo)',
                          color: '#fff',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Export Budget
                      </button>
                    </div>

                    <div>
                      <h4 style={{ fontSize: '12.5px', color: 'var(--indigo-deep)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <DollarSign size={14} /> Itemized Project Budget Matrix
                      </h4>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', border: '1px solid var(--line)' }}>
                        <thead>
                          <tr style={{ background: '#f6f7f9' }}>
                            <th style={{ padding: '8px', border: '1px solid var(--line)', textAlign: 'left' }}>Budget Category</th>
                            <th style={{ padding: '8px', border: '1px solid var(--line)', textAlign: 'right' }}>Allocation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {agentResults.budgetItems.map((item, i) => (
                            <tr key={i}>
                              <td style={{ padding: '8px', border: '1px solid var(--line)' }}>
                                <div style={{ fontWeight: '600' }}>{item.item}</div>
                                <div style={{ fontSize: '10px', color: '#6b6a5f', marginTop: '2px' }}>{item.desc}</div>
                              </td>
                              <td style={{ padding: '8px', border: '1px solid var(--line)', textAlign: 'right', fontWeight: '700' }}>{item.allocation}</td>
                            </tr>
                          ))}
                          <tr style={{ background: '#f6f7f9', fontWeight: '700' }}>
                            <td style={{ padding: '8px', border: '1px solid var(--line)' }}>Total Project Budget</td>
                            <td style={{ padding: '8px', border: '1px solid var(--line)', textAlign: 'right' }}>{agentResults.totalBudget}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 3c. Proposal Reviewer Workspace */}
                {activeNode === "reviewer" && agentResults && agentResults.weaknesses && (
                  <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: '420px', paddingRight: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
                      <div>
                        <h3 style={{ fontSize: '17px', color: 'var(--indigo-deep)', margin: 0 }}>Proposal Review Workspace</h3>
                        <p style={{ fontSize: '12px', color: '#6b6a5f', marginTop: '2px' }}>Compliance and clarity reviewer score</p>
                      </div>
                      <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--indigo)' }}>{agentResults.reviewScore}/100</span>
                    </div>

                    <div style={{ background: '#fff5f5', border: '1px solid #ffe3e3', padding: '12px', borderRadius: '8px' }}>
                      <h4 style={{ fontSize: '12.5px', color: '#c53030', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertTriangle size={14} /> Reviewer Agent Audit Warnings
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {agentResults.weaknesses.map((item, idx) => (
                          <div key={idx} style={{ fontSize: '11.5px', lineHeight: '1.4' }}>
                            <span style={{ fontWeight: '700', color: '#c53030' }}>[{item.param}]:</span> <span style={{ color: '#555' }}>{item.fix}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Donation Agent Workspace */}
                {activeNode === "donation" && agentResults && (
                  <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '18px', color: 'var(--indigo-deep)', borderBottom: '1px solid var(--line)', paddingBottom: '12px', margin: 0 }}>
                      Matched Citizen Resource Claims
                    </h3>

                    {agentResults.matches.length === 0 ? (
                      <p style={{ fontSize: '13px', color: '#9a9888', fontStyle: 'italic' }}>
                        No pending resource donation matches in your local district yet.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {agentResults.matches.map((item) => (
                          <div key={item.id} style={{ border: '1px solid var(--line)', padding: '14px', borderRadius: '8px', background: '#fff' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <h4 style={{ fontSize: '14px', color: 'var(--indigo-deep)', margin: 0 }}>{item.title} ({item.category})</h4>
                              <span style={{ fontSize: '11px', padding: '3px 8px', background: 'var(--marigold-light)', color: 'var(--marigold)', borderRadius: '4px', fontWeight: '600' }}>
                                Matched
                              </span>
                            </div>
                            <p style={{ fontSize: '12px', color: '#6b6a5f', marginTop: '6px', margin: 0 }}>Pickup: {item.pickupLocation}</p>
                            <p style={{ fontSize: '12px', color: '#9a9888', marginTop: '2px', margin: 0 }}>Posted by: {item.postedBy}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 5. Career Agent Workspace */}
                {activeNode === "career" && agentResults && (
                  <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '18px', color: 'var(--indigo-deep)', borderBottom: '1px solid var(--line)', paddingBottom: '12px', margin: 0 }}>
                      Internships & Student Match Board
                    </h3>

                    {agentResults.jobs.length === 0 ? (
                      <p style={{ fontSize: '13px', color: '#9a9888', fontStyle: 'italic' }}>
                        No career postings created by your NGO yet. Visit the Jobs tab to create one.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {agentResults.jobs.map((job) => (
                          <div key={job.id} style={{ border: '1px solid var(--line)', padding: '14px', borderRadius: '8px', background: '#fff' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <h4 style={{ fontSize: '14px', color: 'var(--indigo-deep)', margin: 0 }}>{job.title}</h4>
                              <span style={{ fontSize: '11.5px', color: 'var(--moss)', fontWeight: '600' }}>{job.type}</span>
                            </div>
                            <p style={{ fontSize: '12.5px', color: '#6b6a5f', marginTop: '6px', margin: 0 }}>Matched Applicants: {job.applicantsCount}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 6. Impact Agent Workspace */}
                {activeNode === "impact" && agentResults && (
                  <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '18px', color: 'var(--indigo-deep)', borderBottom: '1px solid var(--line)', paddingBottom: '12px', margin: 0 }}>
                      NGO Impact & Transparency Report Card
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div style={{ background: '#fdfcf9', border: '1px solid #f6f3ec', padding: '16px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--moss)' }}>Grade A</div>
                        <div style={{ fontSize: '11px', color: '#9a9888', fontWeight: '600', textTransform: 'uppercase', marginTop: '4px' }}>Transparency Class</div>
                      </div>
                      <div style={{ background: '#fdfcf9', border: '1px solid #f6f3ec', padding: '16px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--indigo)' }}>{agentResults.details.sustainabilityScore}</div>
                        <div style={{ fontSize: '11px', color: '#9a9888', fontWeight: '600', textTransform: 'uppercase', marginTop: '4px' }}>Sustainability Score</div>
                      </div>
                    </div>

                    <div style={{ background: '#f6f7f9', padding: '16px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                      <h4 style={{ fontSize: '13px', color: 'var(--indigo-deep)', marginBottom: '8px' }}>Ecosystem Telemetry Audit</h4>
                      <p style={{ fontSize: '12.5px', color: '#555', margin: '0 0 6px 0' }}><b>Filing Audit:</b> {agentResults.details.documentsAudit}</p>
                      <p style={{ fontSize: '12.5px', color: '#555', margin: 0 }}><b>Proposal Ledger:</b> {agentResults.details.proposalsCount}</p>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
          )
        )}

        {/* --- VIEW: GRANTS & PROPOSALS TAB --- */}
        {activeTab === "grants" && (
          ngoDetails?.status !== "APPROVED" ? (
            <div className={styles.card} style={{ padding: '32px', textAlign: 'center', background: '#fdfaf2', border: '1px solid var(--line)', borderRadius: '12px', width: '100%' }}>
              <Lock size={48} style={{ color: 'var(--marigold)', marginBottom: '16px' }} />
              <h2 style={{ fontSize: '20px', color: 'var(--indigo-deep)', marginBottom: '8px' }}>Grants Ledger Locked</h2>
              <p style={{ fontSize: '14.5px', color: '#6b6a5f', maxWidth: '550px', margin: '0 auto 20px', lineHeight: '1.5' }}>
                Only verified NGOs can search funding opportunities or write proposals. 
                Your status: <b>{ngoDetails?.status || "PENDING"}</b>.
              </p>
              <button 
                onClick={() => setActiveTab("settings")} 
                className={styles.btn} 
                style={{ background: 'var(--indigo)', color: '#fff', border: 'none' }}
              >
                Upload Certificates in Settings
              </button>
            </div>
          ) : (
            <div className={styles.card} style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '20px', color: 'var(--indigo-deep)', borderBottom: '1px solid var(--line)', paddingBottom: '12px', marginBottom: '16px' }}>
                Grants & Proposals Center
              </h2>
              
              {/* Sub-tab navigation */}
              <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--line)', marginBottom: '20px', paddingBottom: '4px' }}>
                <button
                  onClick={() => setGrantsActiveSubTab("discover")}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '14.5px',
                    fontWeight: '600',
                    color: grantsActiveSubTab === "discover" ? 'var(--indigo)' : '#6b6a5f',
                    borderBottom: grantsActiveSubTab === "discover" ? '3px solid var(--indigo)' : '3px solid transparent',
                    paddingBottom: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Discover Funding
                </button>
                <button
                  onClick={() => setGrantsActiveSubTab("ledger")}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '14.5px',
                    fontWeight: '600',
                    color: grantsActiveSubTab === "ledger" ? 'var(--indigo)' : '#6b6a5f',
                    borderBottom: grantsActiveSubTab === "ledger" ? '3px solid var(--indigo)' : '3px solid transparent',
                    paddingBottom: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Saved AI Drafts ({ngoDetails?.applications?.length || 0})
                </button>
              </div>

              {/* Render Tab Contents */}
              {grantsActiveSubTab === "discover" ? (
                <div>
                  {/* Filters block */}
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid var(--line)',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '20px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '12px'
                  }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--indigo-deep)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Funding Type</label>
                      <select
                        value={grantsFilters.type}
                        onChange={(e) => setGrantsFilters(prev => ({ ...prev, type: e.target.value }))}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '13px', background: '#fff' }}
                      >
                        <option value="All">All Types</option>
                        <option value="CSR">CSR funding</option>
                        <option value="Government">Government schemes</option>
                        <option value="Foundation">Private Foundations</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--indigo-deep)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Focus Sector</label>
                      <select
                        value={grantsFilters.sector}
                        onChange={(e) => setGrantsFilters(prev => ({ ...prev, sector: e.target.value }))}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '13px', background: '#fff' }}
                      >
                        <option value="All">All Sectors</option>
                        <option value="Education">Education</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Environment">Environment</option>
                        <option value="Women Empowerment">Women Empowerment</option>
                        <option value="Rural Development">Rural Development</option>
                        <option value="Skill Development">Skill Development</option>
                        <option value="Animal Welfare">Animal Welfare</option>
                        <option value="Disaster Relief">Disaster Relief</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--indigo-deep)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Geographical State</label>
                      <select
                        value={grantsFilters.state}
                        onChange={(e) => setGrantsFilters(prev => ({ ...prev, state: e.target.value }))}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '13px', background: '#fff' }}
                      >
                        <option value="All">All Locations</option>
                        <option value="National">National / All India</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Rajasthan">Rajasthan</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--indigo-deep)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Max Funding (INR)</label>
                      <input
                        type="number"
                        placeholder="e.g. 2000000"
                        value={grantsFilters.maxFunding}
                        onChange={(e) => setGrantsFilters(prev => ({ ...prev, maxFunding: e.target.value }))}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '13px', background: '#fff' }}
                      />
                    </div>
                  </div>

                  {/* Grants matched count and loading indicator */}
                  {grantsLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', gap: '8px', alignItems: 'center' }}>
                      <RefreshCw size={20} className="animate-spin" style={{ color: 'var(--indigo)' }} />
                      <span style={{ fontSize: '14px', color: '#6b6a5f' }}>Updating matched opportunities...</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {matchedGrants.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '32px', border: '1px dashed var(--line)', borderRadius: '8px', color: '#9a9888', fontStyle: 'italic' }}>
                          No funding opportunities matched your filters. Check back soon or broaden filters.
                        </div>
                      ) : (
                        matchedGrants.map((grant) => (
                          <div key={grant.id} style={{ border: '1px solid var(--line)', borderRadius: '8px', padding: '18px', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                              <div>
                                <h3 style={{ fontSize: '16px', color: 'var(--indigo-deep)', margin: 0, fontWeight: '700' }}>{grant.name}</h3>
                                <p style={{ fontSize: '12.5px', color: '#6b6a5f', margin: '4px 0 0 0' }}>
                                  Provided by: <strong>{grant.provider}</strong> &bull; Sector: {grant.sector} &bull; Type: {grant.type}
                                </p>
                              </div>
                              <span className={`${styles.badge} ${styles.badgeSuccess}`} style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '12px' }}>
                                {grant.matchPercentage}% Match
                              </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', margin: '14px 0', padding: '12px', background: '#fdfcf9', border: '1px solid #f6f3ec', borderRadius: '6px' }}>
                              <div>
                                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#9a9888', fontWeight: '700', display: 'block' }}>Funding Limits</span>
                                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--indigo-deep)' }}>
                                  ₹{grant.minimumFunding.toLocaleString()} - ₹{grant.maximumFunding.toLocaleString()}
                                </span>
                              </div>
                              <div>
                                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#9a9888', fontWeight: '700', display: 'block' }}>Submission Deadline</span>
                                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--coral)' }}>{grant.deadline}</span>
                              </div>
                              <div>
                                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#9a9888', fontWeight: '700', display: 'block' }}>Eligible Location</span>
                                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--moss)', textTransform: 'capitalize' }}>{grant.state}</span>
                              </div>
                            </div>

                            <div style={{ fontSize: '13px', color: 'var(--ink)', lineHeight: '1.5', marginBottom: '12px' }}>
                              <strong>Description:</strong> {grant.description}
                            </div>

                            <div style={{ fontSize: '12.5px', color: '#6b6a5f', lineHeight: '1.4', marginBottom: '16px', background: '#f8fafc', padding: '8px 12px', borderRadius: '4px', borderLeft: '3px solid var(--indigo)' }}>
                              <strong>Eligibility Details:</strong> {grant.eligibility}
                            </div>

                            {/* Render expanded AI Rank result if open */}
                            {showAiRank[grant.id] && aiRankResults[grant.id] && (
                              <div className="animate-fade" style={{ background: '#fdfcf7', border: '1px solid var(--line)', padding: '16px', borderRadius: '6px', marginBottom: '16px', borderLeft: '4px solid var(--marigold)' }}>
                                <h4 style={{ fontSize: '13.5px', color: 'var(--indigo-deep)', marginTop: 0, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Sparkles size={14} style={{ color: 'var(--marigold)' }} /> AI Suitability Evaluation
                                </h4>
                                <div 
                                  style={{ fontSize: '12.5px', color: '#334155', lineHeight: '1.6' }}
                                  dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(aiRankResults[grant.id]) }} 
                                />
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                              <button
                                onClick={() => handleFetchAIRank(grant.id)}
                                disabled={aiRankLoading[grant.id]}
                                style={{
                                  background: 'transparent',
                                  border: '1px solid var(--line)',
                                  color: 'var(--indigo-deep)',
                                  padding: '8px 14px',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                {aiRankLoading[grant.id] ? (
                                  <RefreshCw size={14} className="animate-spin" />
                                ) : (
                                  <Sparkles size={14} style={{ color: 'var(--marigold)' }} />
                                )}
                                {showAiRank[grant.id] ? "Hide Evaluation" : "AI Suitability Rank"}
                              </button>

                              <button
                                onClick={() => handleGenerateProposal(grant.id)}
                                disabled={proposalGenerating}
                                style={{
                                  background: 'var(--indigo)',
                                  border: 'none',
                                  color: '#fff',
                                  padding: '8px 14px',
                                  borderRadius: '6px',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                <FileText size={14} /> Generate Proposal
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ) : (
                // Drafts Ledger Tab
                <div>
                  <p style={{ fontSize: '14px', color: '#6b6a5f', marginBottom: '20px' }}>
                    View saved proposals written by your AI Agent drafts creator. Select one to edit in the AI Assistant studio or export to PDF.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {ngoDetails?.applications && ngoDetails.applications.length > 0 ? (
                      ngoDetails.applications.map((app) => (
                        <div 
                          key={app.id} 
                          style={{ border: '1px solid var(--line)', padding: '16px', borderRadius: '8px', background: '#fdfcf9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}
                        >
                          <div 
                            onClick={() => {
                              setAgentResults(prev => ({
                                ...prev,
                                proposal: {
                                  title: app.title,
                                  subject: app.subject,
                                  body: app.body
                                }
                              }));
                              setActiveNode("proposal");
                              setActiveTab("ai");
                            }}
                            style={{ cursor: 'pointer', flex: 1 }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <h4 style={{ fontSize: '15px', color: 'var(--indigo-deep)', margin: 0 }}>{app.title}</h4>
                              <span style={{ fontSize: '11px', padding: '4px 8px', background: 'rgba(34, 56, 90, 0.05)', color: 'var(--indigo)', borderRadius: '4px', fontWeight: '600' }}>
                                {app.status}
                              </span>
                            </div>
                            {app.subject && (
                              <p style={{ fontSize: '12.5px', color: '#6b6a5f', marginTop: '6px', margin: 0 }}>
                                <b>Subject:</b> {app.subject}
                              </p>
                            )}
                            <div style={{ fontSize: '11px', color: '#9a9888', marginTop: '8px' }}>
                              Last updated: {new Date(app.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => {
                                setAgentResults(prev => ({
                                  ...prev,
                                  proposal: {
                                    title: app.title,
                                    subject: app.subject,
                                    body: app.body
                                  }
                                }));
                                setActiveNode("proposal");
                                setActiveTab("ai");
                              }}
                              style={{
                                background: '#fff',
                                border: '1px solid var(--line)',
                                color: 'var(--indigo-deep)',
                                padding: '6px 10px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => exportProposalPDF({ title: app.title, subject: app.subject, body: app.body })}
                              style={{
                                background: 'var(--indigo)',
                                border: 'none',
                                color: '#fff',
                                padding: '6px 10px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <FileText size={12} /> Export PDF
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ textAlign: 'center', padding: '24px', color: '#9a9888', fontStyle: 'italic', border: '1px dashed var(--line)', borderRadius: '8px' }}>
                        No saved proposals or drafts found. Run a proposal generation flow under Discover Funding to start.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        )}



        {/* --- VIEW: NOTIFICATIONS TAB --- */}
        {activeTab === "notifications" && (
          <div className={styles.card} style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: '10px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', color: 'var(--indigo-deep)', margin: 0 }}>
                Notifications
              </h2>
              {notifications.some(n => !n.read) && (
                <button
                  onClick={handleMarkAllAsRead}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--indigo)',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Mark all as read
                </button>
              )}
            </div>

            {notificationsLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', gap: '8px', alignItems: 'center' }}>
                <RefreshCw size={20} className="animate-spin" style={{ color: 'var(--indigo)' }} />
                <span style={{ fontSize: '14px', color: '#6b6a5f' }}>Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: '#9a9888', fontStyle: 'italic' }}>
                No notifications found.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    style={{ 
                      padding: '14px 16px', 
                      borderRadius: '8px', 
                      border: '1px solid var(--line)', 
                      background: n.read ? '#fff' : '#f8fafc',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                      borderLeft: n.read ? '1px solid var(--line)' : '4px solid var(--indigo)'
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: '14px', color: 'var(--indigo-deep)', margin: '0 0 4px', fontWeight: n.read ? '600' : '700' }}>
                        {n.title}
                      </h4>
                      <p style={{ fontSize: '13px', color: '#555', margin: '0 0 6px' }}>{n.message}</p>
                      <span style={{ fontSize: '11px', color: '#9a9888' }}>
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {!n.read && (
                        <button
                          onClick={() => handleMarkAsRead(n.id)}
                          style={{
                            background: 'var(--indigo)',
                            color: '#fff',
                            border: 'none',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(n.id)}
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--line)',
                          color: 'var(--coral)',
                          padding: '6px 10px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- VIEW: SETTINGS / UPLOAD CENTER TAB --- */}
        {activeTab === "settings" && (
          <div className={styles.card} style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '20px', color: 'var(--indigo-deep)', borderBottom: '1px solid var(--line)', paddingBottom: '12px', marginBottom: '16px' }}>
              Settings & Account Management
            </h2>

            {/* Sub-tabs */}
            <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--line)', marginBottom: '20px' }}>
              <button
                onClick={() => setSettingsSubTab("profile")}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '14.5px',
                  fontWeight: '600',
                  color: settingsSubTab === "profile" ? 'var(--indigo)' : '#6b6a5f',
                  borderBottom: settingsSubTab === "profile" ? '3px solid var(--indigo)' : '3px solid transparent',
                  paddingBottom: '10px',
                  cursor: 'pointer'
                }}
              >
                NGO Profile Details
              </button>
              <button
                onClick={() => setSettingsSubTab("documents")}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '14.5px',
                  fontWeight: '600',
                  color: settingsSubTab === "documents" ? 'var(--indigo)' : '#6b6a5f',
                  borderBottom: settingsSubTab === "documents" ? '3px solid var(--indigo)' : '3px solid transparent',
                  paddingBottom: '10px',
                  cursor: 'pointer'
                }}
              >
                Legal Filings & Upload Center
              </button>
            </div>

            {settingsSubTab === "profile" ? (
              <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--indigo-deep)', display: 'block', marginBottom: '6px' }}>NGO Name</label>
                    <input 
                      type="text" 
                      value={profileForm.name} 
                      onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '13px' }} 
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--indigo-deep)', display: 'block', marginBottom: '6px' }}>Founder Name</label>
                    <input 
                      type="text" 
                      value={profileForm.founderName} 
                      onChange={(e) => setProfileForm(prev => ({ ...prev, founderName: e.target.value }))}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '13px' }} 
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--indigo-deep)', display: 'block', marginBottom: '6px' }}>Website</label>
                    <input 
                      type="url" 
                      value={profileForm.website} 
                      onChange={(e) => setProfileForm(prev => ({ ...prev, website: e.target.value }))}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '13px' }} 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--indigo-deep)', display: 'block', marginBottom: '6px' }}>Mobile Number</label>
                    <input 
                      type="tel" 
                      value={profileForm.mobile} 
                      onChange={(e) => setProfileForm(prev => ({ ...prev, mobile: e.target.value }))}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '13px' }} 
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--indigo-deep)', display: 'block', marginBottom: '6px' }}>Focus Category</label>
                    <select
                      value={profileForm.category}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, category: e.target.value }))}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '13px', background: '#fff' }}
                    >
                      <option value="Education">Education</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Environment">Environment</option>
                      <option value="Women Empowerment">Women Empowerment</option>
                      <option value="Rural Development">Rural Development</option>
                      <option value="Skill Development">Skill Development</option>
                      <option value="Animal Welfare">Animal Welfare</option>
                      <option value="Disaster Relief">Disaster Relief</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--indigo-deep)', display: 'block', marginBottom: '6px' }}>Office Address</label>
                    <input 
                      type="text" 
                      value={profileForm.address} 
                      onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '13px' }} 
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--indigo-deep)', display: 'block', marginBottom: '6px' }}>State</label>
                    <input 
                      type="text" 
                      value={profileForm.state} 
                      onChange={(e) => setProfileForm(prev => ({ ...prev, state: e.target.value }))}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '13px' }} 
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--indigo-deep)', display: 'block', marginBottom: '6px' }}>District</label>
                    <input 
                      type="text" 
                      value={profileForm.district} 
                      onChange={(e) => setProfileForm(prev => ({ ...prev, district: e.target.value }))}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '13px' }} 
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--indigo-deep)', display: 'block', marginBottom: '6px' }}>PIN Code</label>
                    <input 
                      type="text" 
                      value={profileForm.pinCode} 
                      onChange={(e) => setProfileForm(prev => ({ ...prev, pinCode: e.target.value }))}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '13px' }} 
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--indigo-deep)', display: 'block', marginBottom: '6px' }}>Annual Budget (INR)</label>
                    <input 
                      type="text" 
                      value={profileForm.annualBudget} 
                      onChange={(e) => setProfileForm(prev => ({ ...prev, annualBudget: e.target.value }))}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '13px' }} 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--indigo-deep)', display: 'block', marginBottom: '6px' }}>Current Funding (INR)</label>
                    <input 
                      type="text" 
                      value={profileForm.currentFunding} 
                      onChange={(e) => setProfileForm(prev => ({ ...prev, currentFunding: e.target.value }))}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '13px' }} 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--indigo-deep)', display: 'block', marginBottom: '6px' }}>Funding Needed (INR)</label>
                    <input 
                      type="text" 
                      value={profileForm.fundingNeeded} 
                      onChange={(e) => setProfileForm(prev => ({ ...prev, fundingNeeded: e.target.value }))}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '13px' }} 
                    />
                  </div>
                </div>

                {profileUpdateStatus && (
                  <div style={{
                    padding: '10px',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    background: profileUpdateStatus.includes('successfully') ? 'var(--moss-light)' : '#fff5f5',
                    color: profileUpdateStatus.includes('successfully') ? 'var(--moss)' : 'var(--coral)',
                    border: profileUpdateStatus.includes('successfully') ? '1px solid #c7d9c9' : '1px solid #ffe3e3'
                  }}>
                    {profileUpdateStatus}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={profileUpdating}
                  style={{
                    background: 'var(--indigo)',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    width: 'fit-content',
                    marginTop: '10px'
                  }}
                >
                  {profileUpdating ? "Saving Profile..." : "Save Profile Details"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
                <p style={{ fontSize: '13.5px', color: '#6b6a5f', marginBottom: '10px' }}>
                  Submit legal certificate filings below. Uploaded files are securely parsed by Nivara AI agents to compute readiness scores.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--indigo-deep)', display: 'block', marginBottom: '6px' }}>Registration Certificate</label>
                    <input type="file" onChange={(e) => handleFileChange(e, "regCert")} accept=".pdf,.png,.jpg,.jpeg" style={{ fontSize: '12px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--indigo-deep)', display: 'block', marginBottom: '6px' }}>PAN Card Copy</label>
                    <input type="file" onChange={(e) => handleFileChange(e, "panDoc")} accept=".pdf,.png,.jpg,.jpeg" style={{ fontSize: '12px' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--indigo-deep)', display: 'block', marginBottom: '6px' }}>12A Certificate</label>
                    <input type="file" onChange={(e) => handleFileChange(e, "trustCert")} accept=".pdf,.png,.jpg,.jpeg" style={{ fontSize: '12px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--indigo-deep)', display: 'block', marginBottom: '6px' }}>80G Certificate</label>
                    <input type="file" onChange={(e) => handleFileChange(e, "cert80g")} accept=".pdf,.png,.jpg,.jpeg" style={{ fontSize: '12px' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--indigo-deep)', display: 'block', marginBottom: '6px' }}>DARPAN Certificate</label>
                    <input type="file" onChange={(e) => handleFileChange(e, "darpanCert")} accept=".pdf,.png,.jpg,.jpeg" style={{ fontSize: '12px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--indigo-deep)', display: 'block', marginBottom: '6px' }}>Annual Activity Report</label>
                    <input type="file" onChange={(e) => handleFileChange(e, "annualReport")} accept=".pdf,.doc,.docx" style={{ fontSize: '12px' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--indigo-deep)', display: 'block', marginBottom: '6px' }}>Audited Financial Statement</label>
                    <input type="file" onChange={(e) => handleFileChange(e, "financialReport")} accept=".pdf" style={{ fontSize: '12px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--indigo-deep)', display: 'block', marginBottom: '6px' }}>Previous Grant Proposal</label>
                    <input type="file" onChange={(e) => handleFileChange(e, "prevProposal")} accept=".pdf" style={{ fontSize: '12px' }} />
                  </div>
                </div>

                {uploadStatus && (
                  <div style={{
                    padding: '10px',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    background: uploadStatus.includes('successfully') ? 'var(--moss-light)' : '#fff5f5',
                    color: uploadStatus.includes('successfully') ? 'var(--moss)' : 'var(--coral)',
                    border: uploadStatus.includes('successfully') ? '1px solid #c7d9c9' : '1px solid #ffe3e3'
                  }}>
                    {uploadStatus}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={uploading}
                  style={{
                    background: 'var(--indigo)',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    width: 'fit-content',
                    marginTop: '10px'
                  }}
                >
                  {uploading ? "Uploading Filings..." : "Save Legal Filings"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* --- VIEW: JOBS & INTERNSHIPS TAB --- */}
        {activeTab === "jobs" && (
          <div className={styles.card} style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '20px', color: 'var(--indigo-deep)', borderBottom: '1px solid var(--line)', paddingBottom: '12px', marginBottom: '16px' }}>
              {t('jobsInternships')}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', alignItems: 'start' }}>
              {/* Post job form */}
              <form onSubmit={handleJobSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: '#fcfbf7', padding: '20px', borderRadius: '10px', border: '1px solid var(--line)' }}>
                <h3 style={{ fontSize: '15px', color: 'var(--indigo-deep)', margin: '0 0 10px 0', fontWeight: 'bold' }}>
                  {t('postJob')}
                </h3>
                
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b6a5f', display: 'block', marginBottom: '6px' }}>{t('jobTitle')}</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Social Work Intern" 
                    value={jobForm.title}
                    onChange={(e) => setJobForm(prev => ({ ...prev, title: e.target.value }))}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '13px', background: '#fff' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b6a5f', display: 'block', marginBottom: '6px' }}>{t('jobType')}</label>
                  <select
                    value={jobForm.type}
                    onChange={(e) => setJobForm(prev => ({ ...prev, type: e.target.value }))}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '13px', background: '#fff' }}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b6a5f', display: 'block', marginBottom: '6px' }}>{t('jobDescription')}</label>
                  <textarea
                    placeholder="Provide details about responsibilities, qualifications, stipend, etc."
                    value={jobForm.description}
                    onChange={(e) => setJobForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={6}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '13px', background: '#fff', resize: 'vertical' }}
                    required
                  />
                </div>

                {jobPostStatus && (
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    background: jobPostStatus.includes('successfully') ? 'var(--moss-light)' : '#fff5f5',
                    color: jobPostStatus.includes('successfully') ? 'var(--moss)' : 'var(--coral)',
                    border: jobPostStatus.includes('successfully') ? '1px solid #c7d9c9' : '1px solid #ffe3e3'
                  }}>
                    {jobPostStatus}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={jobPosting}
                  style={{
                    background: 'var(--indigo)',
                    color: '#fff',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {jobPosting ? t('saving') : t('createPosting')}
                </button>
              </form>

              {/* Jobs List */}
              <div>
                <h3 style={{ fontSize: '15px', color: 'var(--indigo-deep)', margin: '0 0 16px 0', fontWeight: 'bold' }}>
                  {t('allJobs')} ({ngoJobs.length})
                </h3>

                {jobsLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '30px', gap: '8px', alignItems: 'center' }}>
                    <RefreshCw size={18} className="animate-spin" style={{ color: 'var(--indigo)' }} />
                    <span style={{ fontSize: '13px', color: '#6b6a5f' }}>Loading job openings...</span>
                  </div>
                ) : ngoJobs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', border: '1px dashed var(--line)', borderRadius: '10px', color: '#9a9888', fontStyle: 'italic', fontSize: '13.5px' }}>
                    {t('noJobs')}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: '500px' }}>
                    {ngoJobs.map((job) => (
                      <div key={job.id} style={{ padding: '16px', border: '1px solid var(--line)', borderRadius: '10px', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div>
                            <h4 style={{ fontSize: '15px', color: 'var(--indigo-deep)', margin: 0, fontWeight: '700' }}>{job.title}</h4>
                            <span style={{ fontSize: '11px', padding: '2px 8px', background: 'rgba(34, 56, 90, 0.05)', color: 'var(--indigo)', borderRadius: '4px', fontWeight: '600', display: 'inline-block', marginTop: '4px' }}>
                              {job.type}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--coral)',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            {t('delete')}
                          </button>
                        </div>
                        
                        <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.5', margin: '10px 0 12px 0', whiteSpace: 'pre-wrap' }}>
                          {job.description}
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.03)', paddingTop: '10px', fontSize: '11.5px', color: '#9a9888' }}>
                          <span>Posted on: {new Date(job.createdAt).toLocaleDateString()}</span>
                          <span style={{ fontWeight: '600', color: 'var(--moss)' }}>
                            {job.applications?.length || 0} applications
                          </span>
                        </div>

                        {job.applications && job.applications.length > 0 && (
                          <div style={{ marginTop: '14px', background: '#fdfcf9', border: '1px solid #f6f3ec', padding: '10px 12px', borderRadius: '6px' }}>
                            <h5 style={{ fontSize: '12px', color: 'var(--indigo-deep)', margin: '0 0 8px 0', fontWeight: 'bold' }}>{t('viewApplications')}</h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {job.applications.map((app) => (
                                <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', borderBottom: '1px dashed rgba(0,0,0,0.03)', paddingBottom: '4px' }}>
                                  <span style={{ fontWeight: '600', color: '#555' }}>{app.applicantName}</span>
                                  <span style={{ color: '#6b6a5f' }}>{app.applicantPhone} &bull; {new Date(app.createdAt).toLocaleDateString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
