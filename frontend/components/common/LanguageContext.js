"use client";

import { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const languagesList = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिन्दी (Hindi)" },
  { code: "te", name: "తెలుగు (Telugu)" },
  { code: "ta", name: "தமிழ் (Tamil)" },
  { code: "bn", name: "বাংলা (Bengali)" },
  { code: "mr", name: "मराठी (Marathi)" },
  { code: "gu", name: "ગુજરાતી (Gujarati)" },
  { code: "kn", name: "ಕನ್ನಡ (Kannada)" },
  { code: "ml", name: "മലയാളம் (Malayalam)" },
  { code: "es", name: "Español (Spanish)" },
  { code: "fr", name: "Français (French)" },
  { code: "de", name: "Deutsch (German)" },
  { code: "ar", name: "العربية (Arabic)" },
  { code: "zh", name: "中文 (Chinese)" }
];

const translations = {
  en: {
    dashboard: "Dashboard",
    aiAssistant: "AI Assistant",
    grantsProposals: "Grants & Proposals",
    jobsInternships: "Jobs & Internships",
    notifications: "Notifications",
    settings: "Settings",
    logout: "Logout",
    welcome: "Welcome",
    status: "Status",
    readinessScore: "Funding Readiness Score",
    matchedOpportunities: "Matched Opportunities",
    submittedApplications: "Submitted Applications",
    recentActivity: "Recent Activity Log",
    profileSettings: "NGO Profile Details",
    legalFilings: "Legal Filings & Upload Center",
    save: "Save",
    saving: "Saving...",
    delete: "Delete",
    edit: "Edit",
    saveDraft: "Save Draft",
    exportPDF: "Export PDF",
    notificationsTitle: "Notifications",
    markAllRead: "Mark all as read",
    markRead: "Mark Read",
    noNotifications: "No notifications found.",
    postJob: "Post Job / Internship",
    jobTitle: "Job Title",
    jobType: "Job Type",
    jobDescription: "Job Description",
    postedBy: "Posted By",
    viewApplications: "View Applications",
    noJobs: "No job or internship postings found. Create one above!",
    createPosting: "Create Posting",
    allJobs: "All Openings",
    postingsCount: "Active Openings"
  },
  hi: {
    dashboard: "डैशबोर्ड",
    aiAssistant: "एआई सहायक",
    grantsProposals: "अनुदान और प्रस्ताव",
    jobsInternships: "नौकरियां और इंटर्नशिप",
    notifications: "सूचनाएं",
    settings: "सेटिंग्स",
    logout: "लॉगआउट",
    welcome: "स्वागत हे",
    status: "स्थिति",
    readinessScore: "अनुदान तैयारी स्कोर",
    matchedOpportunities: "मिलते-जुलते अवसर",
    submittedApplications: "जमा किए गए आवेदन",
    recentActivity: "हाल की गतिविधि लॉग",
    profileSettings: "एनजीओ प्रोफाइल विवरण",
    legalFilings: "कानूनी फाइलिंग और अपलोड केंद्र",
    save: "सहेजें",
    saving: "सहेजा जा रहा है...",
    delete: "हटाएं",
    edit: "संपादित करें",
    saveDraft: "ड्राफ्ट सहेजें",
    exportPDF: "पीडीएफ निर्यात करें",
    notificationsTitle: "सूचनाएं",
    markAllRead: "सभी को पढ़ा हुआ चिह्नित करें",
    markRead: "पढ़ा हुआ चिह्नित करें",
    noNotifications: "कोई सूचना नहीं मिली।",
    postJob: "नौकरी / इंटर्नशिप पोस्ट करें",
    jobTitle: "नौकरी का शीर्षक",
    jobType: "नौकरी का प्रकार",
    jobDescription: "नौकरी का विवरण",
    postedBy: "द्वारा पोस्ट किया गया",
    viewApplications: "आवेदन देखें",
    noJobs: "कोई नौकरी या इंटर्नशिप पोस्टिंग नहीं मिली। ऊपर एक बनाएं!",
    createPosting: "पोस्टिंग बनाएं",
    allJobs: "सभी उद्घाटन",
    postingsCount: "सक्रिय उद्घाटन"
  },
  te: {
    dashboard: "డాష్‌బోర్డ్",
    aiAssistant: "AI సహాయకుడు",
    grantsProposals: "గ్రాంట్లు & ప్రతిపాదనలు",
    jobsInternships: "ఉద్యోగాలు & ఇంటర్న్‌షిప్‌లు",
    notifications: "నోటిఫికేషన్లు",
    settings: "సెట్టింగులు",
    logout: "లాగ్అవుట్",
    welcome: "స్వాగతం",
    status: "స్థితి",
    readinessScore: "నిధుల సంసిద్ధత స్కోరు",
    matchedOpportunities: "సరిపోలే అవకాశాలు",
    submittedApplications: "సమర్పించిన దరఖాస్తులు",
    recentActivity: "ఇటీవలి కార్యాచరణ లాగ్",
    profileSettings: "NGO ప్రొఫైల్ వివరాలు",
    legalFilings: "లీగల్ ఫైలింగ్స్ & అప్‌లోడ్ సెంటర్",
    save: "సేవ్ చేయండి",
    saving: "సేవ్ అవుతోంది...",
    delete: "తొలగించు",
    edit: "సవరించు",
    saveDraft: "డ్రాఫ్ట్ సేవ్ చేయి",
    exportPDF: "PDF ఎగుమతి చేయి",
    notificationsTitle: "నోటిఫिकేషన్లు",
    markAllRead: "అన్నీ చదివినట్లుగా గుర్తు పెట్టు",
    markRead: "చదివినట్లు గుర్తు పెట్టు",
    noNotifications: "ఎటువంటి నోటిఫికేషన్లు కనుగొనబడలేదు.",
    postJob: "ఉద్యోగం / ఇంటర్న్‌షిప్ పోస్ట్ చేయి",
    jobTitle: "ఉద్యోగ శీర్షిక",
    jobType: "ఉద్యోగ రకం",
    jobDescription: "ఉద్యోగ వివరణ",
    postedBy: "పోస్ట్ చేసినవారు",
    viewApplications: "దరఖాస్తులను వీక్షించండి",
    noJobs: "ఉద్యోగం లేదా ఇంటర్న్‌షిప్ పోస్టింగ్‌లు ఏవీ లేవు. పైన ఒకదాన్ని సృష్టించండి!",
    createPosting: "పోస్టింగ్‌ని సృష్టించు",
    allJobs: "అన్ని ఉద్యోగాలు",
    postingsCount: "క్రియాశీల ఉద్యోగాలు"
  },
  ta: {
    dashboard: "டாஷ்போர்டு",
    aiAssistant: "AI உதவியாளர்",
    grantsProposals: "மானியங்கள் & முன்மொழிவுகள்",
    jobsInternships: "வேலைகள் & இன்டர்ன்ஷிப்கள்",
    notifications: "அறிவிப்புகள்",
    settings: "அமைப்புகள்",
    logout: "வெளியேறு",
    welcome: "வரவேற்பு",
    status: "நிலை",
    readinessScore: "நிதி தயார்நிலை மதிப்பெண்",
    matchedOpportunities: "பொருந்தும் வாய்ப்புகள்",
    submittedApplications: "சமர்ப்பிக்கப்பட்ட விண்ணப்பங்கள்",
    recentActivity: "சமீபத்திய செயல்பாட்டுப் பதிவு",
    profileSettings: "அமைப்பு சுயவிவர விவரங்கள்",
    legalFilings: "சட்ட ஆவணங்கள் & பதிவேற்ற மையம்",
    save: "சேமி",
    saving: "சேமிக்கப்படுகிறது...",
    delete: "அழி",
    edit: "திருத்து",
    saveDraft: "வரைவைச் சேமி",
    exportPDF: "PDF ஆக ஏற்றுமதி செய்",
    notificationsTitle: "அறிவிப்புகள்",
    markAllRead: "அனைத்தையும் படித்ததாகக் குறிக்கவும்",
    markRead: "படித்ததாகக் குறி",
    noNotifications: "அறிவிப்புகள் எதுவும் இல்லை.",
    postJob: "வேலை / இன்டர்ன்ஷிப் பதிவிடவும்",
    jobTitle: "வேலை தலைப்பு",
    jobType: "வேலை வகை",
    jobDescription: "வேலை விளக்கம்",
    postedBy: "பதிவிட்டவர்",
    viewApplications: "விண்ணப்பங்களைப் பார்க்கவும்",
    noJobs: "வேலை அல்லது இன்டர்ன்ஷிப் பதிவுகள் எதுவும் இல்லை. மேலே ஒன்றை உருவாக்கவும்!",
    createPosting: "பதிவை உருவாக்கு",
    allJobs: "அனைத்து வேலைகள்",
    postingsCount: "செயலில் உள்ள வேலைகள்"
  },
  es: {
    dashboard: "Tablero",
    aiAssistant: "Asistente de IA",
    grantsProposals: "Subvenciones y Propuestas",
    jobsInternships: "Trabajos y Pasantías",
    notifications: "Notificaciones",
    settings: "Configuración",
    logout: "Cerrar sesión",
    welcome: "Bienvenido",
    status: "Estado",
    readinessScore: "Puntaje de preparación",
    matchedOpportunities: "Oportunidades coincidentes",
    submittedApplications: "Solicitudes enviadas",
    recentActivity: "Registro de actividad reciente",
    profileSettings: "Detalles del perfil de la ONG",
    legalFilings: "Archivos legales y centro de carga",
    save: "Guardar",
    saving: "Guardando...",
    delete: "Eliminar",
    edit: "Editar",
    saveDraft: "Guardar borrador",
    exportPDF: "Exportar PDF",
    notificationsTitle: "Notificaciones",
    markAllRead: "Marcar todo como leído",
    markRead: "Marcar como leído",
    noNotifications: "No se encontraron notificaciones.",
    postJob: "Publicar trabajo / pasantía",
    jobTitle: "Título del trabajo",
    jobType: "Tipo de trabajo",
    jobDescription: "Descripción del trabajo",
    postedBy: "Publicado por",
    viewApplications: "Ver solicitudes",
    noJobs: "No se encontraron ofertas de trabajo o pasantías. ¡Crea una arriba!",
    createPosting: "Crear publicación",
    allJobs: "Todas las vacantes",
    postingsCount: "Vacantes activas"
  }
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState("en");

  // Load language preference from local storage or NGO details on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("language");
    if (savedLang) {
      setCurrentLanguage(savedLang);
    }
  }, []);

  useEffect(() => {
    // Hidden container for Google Translate
    if (!document.getElementById("google_translate_element")) {
      const div = document.createElement("div");
      div.id = "google_translate_element";
      div.style.display = "none";
      document.body.appendChild(div);
    }

    // Load Google Translate script
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.type = "text/javascript";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(script);

      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          { pageLanguage: "en", layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE },
          "google_translate_element"
        );
      };
    }
  }, []);

  const changeLanguage = (langCode) => {
    setCurrentLanguage(langCode);
    localStorage.setItem("language", langCode);

    // Set cookie for Google Translate
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    if (langCode !== "en") {
      document.cookie = `googtrans=/en/${langCode}; path=/;`;
    }
    
    // Refresh the page so Google Translate loads translation
    window.location.reload();
  };

  const t = (key) => {
    const dict = translations[currentLanguage] || translations["en"];
    return dict[key] || translations["en"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, t, languagesList }}>
      {children}
    </LanguageContext.Provider>
  );
};
