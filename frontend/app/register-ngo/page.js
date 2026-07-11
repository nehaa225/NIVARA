"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Upload, Check, Trash2, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import styles from "./register.module.css";

export default function RegisterNgo() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Form Fields State
  const [formData, setFormData] = useState({
    // Step 1: Org Details
    name: "",
    regNumber: "",
    regType: "Trust", // default
    category: "Education", // default
    yearEstablished: "",
    website: "",
    address: "",
    state: "",
    district: "",
    pinCode: "",

    // Step 2: Contact & Funding
    founderName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    annualBudget: "",
    currentFunding: "",
    fundingNeeded: ""
  });

  // Files State
  const [files, setFiles] = useState({
    regCert: null,
    panDoc: null,
    trustCert: null,
    annualReport: null,
    financialReport: null,
    ngoPhotos: []
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fieldName) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    if (fieldName === "ngoPhotos") {
      // Append files for photos (limit up to 5)
      const newPhotos = Array.from(selectedFiles);
      setFiles((prev) => ({
        ...prev,
        ngoPhotos: [...prev.ngoPhotos, ...newPhotos].slice(0, 5)
      }));
    } else {
      // Single file
      setFiles((prev) => ({ ...prev, [fieldName]: selectedFiles[0] }));
    }
  };

  const handleRemoveFile = (fieldName, index = null) => {
    if (fieldName === "ngoPhotos") {
      setFiles((prev) => ({
        ...prev,
        ngoPhotos: prev.ngoPhotos.filter((_, i) => i !== index)
      }));
    } else {
      setFiles((prev) => ({ ...prev, [fieldName]: null }));
    }
  };

  const validateStep = () => {
    setError("");

    if (step === 1) {
      const { name, regNumber, regType, category, yearEstablished, address, state, district, pinCode } = formData;
      if (!name || !regNumber || !regType || !category || !yearEstablished || !address || !state || !district || !pinCode) {
        setError("Please fill out all required organization details.");
        return false;
      }
      const estYear = parseInt(yearEstablished, 10);
      if (isNaN(estYear) || estYear < 1900 || estYear > new Date().getFullYear()) {
        setError("Please enter a valid establishment year.");
        return false;
      }
    } else if (step === 2) {
      const { founderName, email, mobile, password, confirmPassword, annualBudget, currentFunding, fundingNeeded } = formData;
      if (!founderName || !email || !mobile || !password || !confirmPassword || !annualBudget || !currentFunding || !fundingNeeded) {
        setError("Please fill out all contact, credentials, and funding details.");
        return false;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return false;
      }
      if (password.length < 6) {
        setError("Password should be at least 6 characters long.");
        return false;
      }
      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address.");
        return false;
      }
    } else if (step === 3) {
      if (!files.regCert) {
        setError("Registration Certificate is required.");
        return false;
      }
      if (!files.panDoc) {
        setError("NGO PAN Card Copy is required.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setError("");
    setLoading(true);

    try {
      const payload = new FormData();
      
      // Append text fields
      Object.keys(formData).forEach((key) => {
        payload.append(key, formData[key]);
      });

      // Append files
      Object.keys(files).forEach((key) => {
        if (key === "ngoPhotos") {
          files.ngoPhotos.forEach((file) => {
            payload.append("ngoPhotos", file);
          });
        } else if (files[key]) {
          payload.append(key, files[key]);
        }
      });

      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        body: payload
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      // Store auth session
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("email", data.user.email);
      localStorage.setItem("ngoStatus", data.ngo.status);

      router.push("/verification-status");

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />

      <main className={styles.container}>
        {/* Step Indicators */}
        <div className={styles.wizardHeader}>
          <div className={`${styles.stepIndicator} ${step >= 1 ? (step > 1 ? styles.stepIndicatorCompleted : styles.stepIndicatorActive) : ""}`}>
            {step > 1 ? <Check size={16} /> : "1"}
          </div>
          <div className={`${styles.stepIndicator} ${step >= 2 ? (step > 2 ? styles.stepIndicatorCompleted : styles.stepIndicatorActive) : ""}`}>
            {step > 2 ? <Check size={16} /> : "2"}
          </div>
          <div className={`${styles.stepIndicator} ${step >= 3 ? (step > 3 ? styles.stepIndicatorCompleted : styles.stepIndicatorActive) : ""}`}>
            {step > 3 ? <Check size={16} /> : "3"}
          </div>
        </div>

        {error && <div className={styles.alert}>{error}</div>}

        <div className={`${styles.card} animate-fade`}>
          {/* STEP 1: Organization Details */}
          {step === 1 && (
            <div>
              <h2 className={styles.sectionTitle}>Organization Details</h2>
              <p className={styles.sectionSubtitle}>Provide registration metadata and locate your NGO</p>

              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label>NGO Name *</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    placeholder="e.g. Prajwala Rural Trust" 
                    required 
                  />
                </div>

                <div className={styles.field}>
                  <label>Registration Number *</label>
                  <input 
                    type="text" 
                    name="regNumber" 
                    value={formData.regNumber} 
                    onChange={handleInputChange} 
                    placeholder="e.g. TS/2019/00456" 
                    required 
                  />
                </div>

                <div className={styles.field}>
                  <label>Registration Type *</label>
                  <select name="regType" value={formData.regType} onChange={handleInputChange}>
                    <option value="Trust">Trust</option>
                    <option value="Society">Society</option>
                    <option value="Section 8 Company">Section 8 Company</option>
                  </select>
                </div>

                <div className={styles.field}>
                  <label>NGO Category *</label>
                  <select name="category" value={formData.category} onChange={handleInputChange}>
                    <option value="Education">Education</option>
                    <option value="Health & Family Welfare">Health & Family Welfare</option>
                    <option value="Livelihoods & Skilling">Livelihoods & Skilling</option>
                    <option value="Environment & Forestry">Environment & Forestry</option>
                    <option value="Women Development & Empowerment">Women Development & Empowerment</option>
                    <option value="Disaster Management">Disaster Management</option>
                  </select>
                </div>

                <div className={styles.field}>
                  <label>Year Established *</label>
                  <input 
                    type="number" 
                    name="yearEstablished" 
                    value={formData.yearEstablished} 
                    onChange={handleInputChange} 
                    placeholder="e.g. 2015" 
                    required 
                  />
                </div>

                <div className={styles.field}>
                  <label>Website URL</label>
                  <input 
                    type="url" 
                    name="website" 
                    value={formData.website} 
                    onChange={handleInputChange} 
                    placeholder="e.g. https://prajwala.org" 
                  />
                </div>

                <div className={`${styles.field} ${styles.formFieldFull}`}>
                  <label>Full Address *</label>
                  <textarea 
                    name="address" 
                    value={formData.address} 
                    onChange={handleInputChange} 
                    placeholder="Street Address, Plot No." 
                    required 
                  />
                </div>

                <div className={styles.field}>
                  <label>State *</label>
                  <input 
                    type="text" 
                    name="state" 
                    value={formData.state} 
                    onChange={handleInputChange} 
                    placeholder="e.g. Telangana" 
                    required 
                  />
                </div>

                <div className={styles.field}>
                  <label>District *</label>
                  <input 
                    type="text" 
                    name="district" 
                    value={formData.district} 
                    onChange={handleInputChange} 
                    placeholder="e.g. Medchal" 
                    required 
                  />
                </div>

                <div className={styles.field}>
                  <label>PIN Code *</label>
                  <input 
                    type="text" 
                    name="pinCode" 
                    value={formData.pinCode} 
                    onChange={handleInputChange} 
                    placeholder="e.g. 500081" 
                    required 
                  />
                </div>
              </div>

              <div className={styles.actions} style={{ justifyContent: 'flex-end' }}>
                <button onClick={handleNext} className={`${styles.btn} ${styles.btnPrimary}`}>
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Contact, Credentials & Funding */}
          {step === 2 && (
            <div>
              <h2 className={styles.sectionTitle}>Contact & Funding Details</h2>
              <p className={styles.sectionSubtitle}>Credentials for login and financial scope</p>

              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label>Founder Name *</label>
                  <input 
                    type="text" 
                    name="founderName" 
                    value={formData.founderName} 
                    onChange={handleInputChange} 
                    placeholder="Founder / CEO Name" 
                    required 
                  />
                </div>

                <div className={styles.field}>
                  <label>Contact Mobile *</label>
                  <input 
                    type="text" 
                    name="mobile" 
                    value={formData.mobile} 
                    onChange={handleInputChange} 
                    placeholder="Mobile number" 
                    required 
                  />
                </div>

                <div className={styles.field}>
                  <label>Founder/Account Email *</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    placeholder="This will be your login email" 
                    required 
                  />
                </div>

                <div className={styles.field} />

                <div className={styles.field}>
                  <label>Password *</label>
                  <input 
                    type="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleInputChange} 
                    placeholder="At least 6 characters" 
                    required 
                  />
                </div>

                <div className={styles.field}>
                  <label>Confirm Password *</label>
                  <input 
                    type="password" 
                    name="confirmPassword" 
                    value={formData.confirmPassword} 
                    onChange={handleInputChange} 
                    placeholder="Re-enter password" 
                    required 
                  />
                </div>

                <div className={styles.field}>
                  <label>Annual Budget *</label>
                  <input 
                    type="text" 
                    name="annualBudget" 
                    value={formData.annualBudget} 
                    onChange={handleInputChange} 
                    placeholder="e.g. ₹15,00,000" 
                    required 
                  />
                </div>

                <div className={styles.field}>
                  <label>Current Funding *</label>
                  <input 
                    type="text" 
                    name="currentFunding" 
                    value={formData.currentFunding} 
                    onChange={handleInputChange} 
                    placeholder="e.g. ₹5,00,000" 
                    required 
                  />
                </div>

                <div className={styles.field}>
                  <label>Funding Needed *</label>
                  <input 
                    type="text" 
                    name="fundingNeeded" 
                    value={formData.fundingNeeded} 
                    onChange={handleInputChange} 
                    placeholder="e.g. ₹10,00,000" 
                    required 
                  />
                </div>
              </div>

              <div className={styles.actions}>
                <button onClick={handleBack} className={`${styles.btn} ${styles.btnGhost}`}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button onClick={handleNext} className={`${styles.btn} ${styles.btnPrimary}`}>
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Documents Upload */}
          {step === 3 && (
            <div>
              <h2 className={styles.sectionTitle}>Document Verification</h2>
              <p className={styles.sectionSubtitle}>Upload scanned PDF / Image copies of legal filings</p>

              <div className={styles.uploadGrid}>
                {/* 1. Registration Certificate */}
                <div className={styles.field}>
                  <label>Registration Certificate *</label>
                  {files.regCert ? (
                    <div className={styles.uploadedFile}>
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '200px' }}>{files.regCert.name}</span>
                      <Trash2 size={16} style={{ cursor: 'pointer' }} onClick={() => handleRemoveFile("regCert")} />
                    </div>
                  ) : (
                    <label className={styles.uploadBox}>
                      <Upload className={styles.uploadIcon} size={20} />
                      <span className={styles.uploadBoxTitle}>Upload Certificate</span>
                      <span className={styles.uploadBoxDesc}>PDF, PNG, JPG up to 10MB</span>
                      <input type="file" onChange={(e) => handleFileChange(e, "regCert")} accept=".pdf,.png,.jpg,.jpeg" style={{ display: 'none' }} />
                    </label>
                  )}
                </div>

                {/* 2. PAN Card */}
                <div className={styles.field}>
                  <label>NGO PAN Card Copy *</label>
                  {files.panDoc ? (
                    <div className={styles.uploadedFile}>
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '200px' }}>{files.panDoc.name}</span>
                      <Trash2 size={16} style={{ cursor: 'pointer' }} onClick={() => handleRemoveFile("panDoc")} />
                    </div>
                  ) : (
                    <label className={styles.uploadBox}>
                      <Upload className={styles.uploadIcon} size={20} />
                      <span className={styles.uploadBoxTitle}>Upload PAN Card</span>
                      <span className={styles.uploadBoxDesc}>PDF, PNG, JPG up to 10MB</span>
                      <input type="file" onChange={(e) => handleFileChange(e, "panDoc")} accept=".pdf,.png,.jpg,.jpeg" style={{ display: 'none' }} />
                    </label>
                  )}
                </div>

                {/* 3. Trust Certificate */}
                <div className={styles.field}>
                  <label>12A / 80G Trust Certificate</label>
                  {files.trustCert ? (
                    <div className={styles.uploadedFile}>
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '200px' }}>{files.trustCert.name}</span>
                      <Trash2 size={16} style={{ cursor: 'pointer' }} onClick={() => handleRemoveFile("trustCert")} />
                    </div>
                  ) : (
                    <label className={styles.uploadBox}>
                      <Upload className={styles.uploadIcon} size={20} />
                      <span className={styles.uploadBoxTitle}>Upload Certificate</span>
                      <span className={styles.uploadBoxDesc}>PDF, PNG, JPG up to 10MB</span>
                      <input type="file" onChange={(e) => handleFileChange(e, "trustCert")} accept=".pdf,.png,.jpg,.jpeg" style={{ display: 'none' }} />
                    </label>
                  )}
                </div>

                {/* 4. Annual Report */}
                <div className={styles.field}>
                  <label>Latest Annual Activity Report</label>
                  {files.annualReport ? (
                    <div className={styles.uploadedFile}>
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '200px' }}>{files.annualReport.name}</span>
                      <Trash2 size={16} style={{ cursor: 'pointer' }} onClick={() => handleRemoveFile("annualReport")} />
                    </div>
                  ) : (
                    <label className={styles.uploadBox}>
                      <Upload className={styles.uploadIcon} size={20} />
                      <span className={styles.uploadBoxTitle}>Upload Report</span>
                      <span className={styles.uploadBoxDesc}>PDF, DOC up to 10MB</span>
                      <input type="file" onChange={(e) => handleFileChange(e, "annualReport")} accept=".pdf,.doc,.docx" style={{ display: 'none' }} />
                    </label>
                  )}
                </div>

                {/* 5. Financial Audit Report */}
                <div className={styles.field}>
                  <label>Latest Financial Audit Statement</label>
                  {files.financialReport ? (
                    <div className={styles.uploadedFile}>
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '200px' }}>{files.financialReport.name}</span>
                      <Trash2 size={16} style={{ cursor: 'pointer' }} onClick={() => handleRemoveFile("financialReport")} />
                    </div>
                  ) : (
                    <label className={styles.uploadBox}>
                      <Upload className={styles.uploadIcon} size={20} />
                      <span className={styles.uploadBoxTitle}>Upload Financials</span>
                      <span className={styles.uploadBoxDesc}>PDF up to 10MB</span>
                      <input type="file" onChange={(e) => handleFileChange(e, "financialReport")} accept=".pdf" style={{ display: 'none' }} />
                    </label>
                  )}
                </div>

                {/* 6. Photos */}
                <div className={styles.field}>
                  <label>NGO Field Action Photos (up to 5)</label>
                  <label className={styles.uploadBox}>
                    <Upload className={styles.uploadIcon} size={20} />
                    <span className={styles.uploadBoxTitle}>Add Photo(s)</span>
                    <span className={styles.uploadBoxDesc}>JPG, PNG files ({files.ngoPhotos.length}/5)</span>
                    <input type="file" multiple onChange={(e) => handleFileChange(e, "ngoPhotos")} accept="image/*" style={{ display: 'none' }} />
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
                    {files.ngoPhotos.map((photo, i) => (
                      <div key={i} className={styles.uploadedFile} style={{ background: '#fdfcf9', border: '1px solid var(--line)', color: 'var(--ink)' }}>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '200px' }}>{photo.name}</span>
                        <Trash2 size={16} style={{ cursor: 'pointer', color: 'var(--coral)' }} onClick={() => handleRemoveFile("ngoPhotos", i)} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.actions}>
                <button onClick={handleBack} className={`${styles.btn} ${styles.btnGhost}`}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button onClick={handleSubmit} disabled={loading} className={`${styles.btn} ${styles.btnPrimary}`}>
                  <CheckCircle2 size={16} />
                  {loading ? "Registering NGO..." : "Submit Registration"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
