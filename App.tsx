
import React, { useState, useEffect } from 'react';
import Editor from './components/Editor';
import ResumePreview from './components/ResumePreview';
import { ResumeData, INITIAL_RESUME_STATE } from './types';
import Spinner from './components/Spinner';
import VoiceAssistant from './components/VoiceAssistant';

// Declaration for html2pdf loaded via CDN
declare var html2pdf: any;

const DEMO_DATA: ResumeData = {
  personalInfo: {
    fullName: 'Pratima Singh',
    email: 'pratima.singh@example.com',
    phone: '+1 (555) 012-3456',
    city: 'San Francisco, CA',
    link: 'linkedin.com/in/pratima-singh',
    jobTitle: 'Senior Product Designer',
    summary: 'Creative and detail-oriented Product Designer with over 6 years of experience in building user-centric digital products. Proven track record of improving user engagement and streamlining workflows through intuitive design systems. Passionate about accessibility and inclusive design practices.'
  },
  experience: [
    {
      id: '1',
      company: 'TechFlow Solutions',
      jobTitle: 'Senior Product Designer',
      startDate: '06/2021',
      endDate: 'Present',
      city: 'San Francisco, CA',
      description: '• Led the redesign of the core SaaS platform, resulting in a 25% increase in user retention.\n• Mentored a team of 3 junior designers and established a unified design system.\n• Conducted user research and usability testing to validate new features.'
    },
    {
      id: '2',
      company: 'Creative Pulse',
      jobTitle: 'UI/UX Designer',
      startDate: '03/2018',
      endDate: '05/2021',
      city: 'Austin, TX',
      description: '• Designed mobile-first interfaces for e-commerce clients, improving conversion rates by 15%.\n• Collaborated closely with developers to ensure pixel-perfect implementation of designs.\n• Created interactive prototypes using Figma and Protopie for stakeholder presentations.'
    }
  ],
  education: [
    {
      id: '1',
      school: 'California College of the Arts',
      degree: 'BFA in Interaction Design',
      startDate: '09/2014',
      endDate: '05/2018',
      city: 'San Francisco, CA',
      grade: '3.9 GPA',
      description: ''
    }
  ],
  skills: [
    { id: '1', name: 'Figma', level: 'Expert' },
    { id: '2', name: 'Prototyping', level: 'Expert' },
    { id: '3', name: 'User Research', level: 'Advanced' },
    { id: '4', name: 'HTML/CSS', level: 'Intermediate' },
    { id: '5', name: 'Design Systems', level: 'Advanced' }
  ],
  themeColor: '#2563eb',
  layoutDensity: 'comfortable'
};

const App: React.FC = () => {
  // Initialize state from localStorage if available
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    try {
      const savedData = localStorage.getItem('pratResumeData');
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error('Failed to load resume data from storage:', error);
    }
    return INITIAL_RESUME_STATE;
  });

  const [zoom, setZoom] = useState(0.8);
  const [activeView, setActiveView] = useState<'editor' | 'preview'>('editor');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Save to localStorage whenever resumeData changes
  useEffect(() => {
    localStorage.setItem('pratResumeData', JSON.stringify(resumeData));
  }, [resumeData]);

  // Adjust initial zoom based on screen width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) setZoom(0.9);
      else if (window.innerWidth >= 1024) setZoom(0.7);
      else setZoom(0.5);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDownloadPdf = async () => {
    const element = document.getElementById('resume-pdf-target');
    if (!element) return;
    
    setIsGeneratingPdf(true);
    const filename = `${resumeData.personalInfo.fullName.replace(/[^a-z0-9]/gi, '_') || 'Resume'}.pdf`;

    const opt = {
      margin: 0,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      // Check if html2pdf is loaded
      if (typeof html2pdf === 'undefined') {
        alert('PDF generator is loading, please try again in a moment.');
        return;
      }
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      setResumeData(INITIAL_RESUME_STATE);
      localStorage.removeItem('pratResumeData');
    }
  };

  const handleLoadDemo = () => {
    if (window.confirm("This will overwrite your current data with a demo resume. Continue?")) {
      setResumeData(DEMO_DATA);
    }
  };

  const handleThemeChange = (color: string) => {
    setResumeData(prev => ({ ...prev, themeColor: color }));
  };

  const toggleDensity = () => {
    setResumeData(prev => ({
      ...prev,
      layoutDensity: prev.layoutDensity === 'compact' ? 'comfortable' : 'compact'
    }));
  };

  const colors = ['#2563eb', '#0f172a', '#dc2626', '#16a34a', '#9333ea', '#ea580c'];

  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm shrink-0 no-print z-20 relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-blue-200 shadow-lg">
            <i className="fas fa-file-alt"></i>
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">PratResume</h1>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
           <button 
            onClick={handleLoadDemo}
            className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
          >
            Load Demo
          </button>
          
          <div className="flex items-center gap-2 mx-2 border-r border-l border-gray-200 px-4">
             <button 
              onClick={toggleDensity}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
              title="Toggle Layout Density"
             >
               <i className={`fas ${resumeData.layoutDensity === 'compact' ? 'fa-compress-alt' : 'fa-expand-alt'}`}></i>
               {resumeData.layoutDensity === 'compact' ? 'Compact' : 'Comfortable'}
             </button>
          </div>

          <div className="flex items-center gap-2 mr-4 border-r border-gray-200 pr-4">
            <span className="text-xs font-semibold text-gray-400 uppercase">Theme</span>
            <div className="flex gap-1">
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => handleThemeChange(c)}
                  className={`w-5 h-5 rounded-full transition-transform hover:scale-110 ${resumeData.themeColor === c ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <button 
            onClick={handleReset} 
            className="text-gray-500 hover:text-red-600 text-sm font-medium transition-colors"
          >
            Reset
          </button>
          <button 
            onClick={handleDownloadPdf} 
            disabled={isGeneratingPdf}
            className="bg-gray-900 hover:bg-black text-white px-5 py-2 rounded-full text-sm font-medium transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
          >
             {isGeneratingPdf ? <Spinner /> : <i className="fas fa-download"></i>}
             {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
          </button>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex gap-2">
           <button 
            onClick={() => setActiveView(activeView === 'editor' ? 'preview' : 'editor')}
            className="text-blue-600 font-medium text-sm"
          >
            {activeView === 'editor' ? 'Show Preview' : 'Edit Resume'}
          </button>
        </div>
      </nav>

      {/* Main Content - Two Columns */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Voice Assistant */}
        <VoiceAssistant 
          currentData={resumeData} 
          onUpdate={(updates) => setResumeData(prev => ({ ...prev, ...updates }))} 
        />

        {/* Left Panel: Editor */}
        <div className={`
          flex-1 md:max-w-[500px] lg:max-w-[600px] p-4 md:p-6 overflow-hidden flex flex-col
          ${activeView === 'preview' ? 'hidden md:flex' : 'flex'}
          bg-slate-50 md:border-r border-gray-200 no-print
        `}>
          <Editor data={resumeData} onChange={setResumeData} />
        </div>

        {/* Right Panel: Preview */}
        <div className={`
          flex-1 bg-slate-200/50 relative overflow-auto flex justify-center p-8
          ${activeView === 'editor' ? 'hidden md:flex' : 'flex'}
          print:block print:p-0 print:bg-white print:w-full print:h-full print:absolute print:top-0 print:left-0 print:z-50
        `}>
          {/* Interactive Preview (Scaled) */}
          <div className="no-print transition-all duration-300 ease-in-out">
             <ResumePreview data={resumeData} zoom={zoom} />
          </div>

          {/* Hidden Target for PDF Generation - Rendered off-screen but visible to DOM for html2canvas */}
          <div className="absolute top-0 left-[-9999px] w-[210mm]">
            <div id="resume-pdf-target">
               <ResumePreview data={resumeData} zoom={1} className="shadow-none" />
            </div>
          </div>
          
          {/* Zoom Controls Overlay */}
          <div className="absolute bottom-6 right-6 bg-white rounded-full shadow-lg p-2 flex gap-2 border border-gray-200 no-print z-10">
            <button 
              onClick={() => setZoom(z => Math.max(0.4, z - 0.1))}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600"
            >
              <i className="fas fa-minus"></i>
            </button>
            <span className="w-12 flex items-center justify-center text-xs font-mono text-gray-500">
              {Math.round(zoom * 100)}%
            </span>
            <button 
              onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600"
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>

          {/* Mobile Print Fab */}
          <div className="md:hidden absolute bottom-24 right-6">
             <button 
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="w-12 h-12 bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center no-print z-50"
            >
              {isGeneratingPdf ? <Spinner /> : <i className="fas fa-download"></i>}
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;
