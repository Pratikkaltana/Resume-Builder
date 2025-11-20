
import React from 'react';
import { ResumeData } from '../types';

interface ResumePreviewProps {
  data: ResumeData;
  zoom?: number;
  id?: string;
  className?: string;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ data, zoom = 1, id, className = '' }) => {
  const { personalInfo, experience, education, skills, themeColor } = data;

  // Helper to ensure links have protocol
  const getSafeLink = (link: string) => {
    if (link.startsWith('http://') || link.startsWith('https://')) return link;
    return `https://${link}`;
  };

  // Styles using Tailwind arbitrary values for A4 sizing
  // Print styles ensure full width/height and remove scaling transforms that break pagination
  return (
    <div 
      id={id}
      className={`bg-white shadow-2xl mx-auto print:shadow-none print:mx-0 print:overflow-visible overflow-hidden relative ${className}`}
      style={{
        width: '210mm',
        minHeight: '297mm',
        transform: zoom === 1 ? 'none' : `scale(${zoom})`,
        transformOrigin: 'top center',
        color: '#334155' // Slate-700
      }}
    >
      {/* Header */}
      <div className="p-10 pb-6 border-b-2 border-gray-100">
        <h1 className="text-4xl font-bold text-gray-900 uppercase tracking-tight" style={{ color: themeColor }}>
          {personalInfo.fullName || 'Your Name'}
        </h1>
        <p className="text-xl font-medium mt-1 text-gray-600">{personalInfo.jobTitle || 'Professional Title'}</p>
        
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
          {personalInfo.email && (
            <a 
              href={`mailto:${personalInfo.email}`}
              className="flex items-center gap-1 hover:text-blue-600 hover:underline transition-colors"
            >
              <i className="fas fa-envelope text-xs opacity-70"></i>
              <span>{personalInfo.email}</span>
            </a>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-1">
              <i className="fas fa-phone text-xs opacity-70"></i>
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.city && (
            <div className="flex items-center gap-1">
              <i className="fas fa-map-marker-alt text-xs opacity-70"></i>
              <span>{personalInfo.city}</span>
            </div>
          )}
          {personalInfo.link && (
            <a 
              href={getSafeLink(personalInfo.link)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-blue-600 hover:underline transition-colors"
            >
              <i className="fas fa-link text-xs opacity-70"></i>
              <span>{personalInfo.link}</span>
            </a>
          )}
        </div>
      </div>

      <div className="p-10 pt-6 flex gap-8">
        {/* Main Column */}
        <div className="flex-1 space-y-6">
          {personalInfo.summary && (
            <section className="break-inside-avoid">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-3 pb-1 border-b border-gray-200 flex items-center gap-2" style={{ color: themeColor }}>
                <span className="bg-gray-100 p-1 rounded"><i className="fas fa-user"></i></span> Profile
              </h3>
              <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                {personalInfo.summary}
              </p>
            </section>
          )}

          {experience.length > 0 && (
            <section>
               <h3 className="text-xs font-bold uppercase tracking-widest mb-4 pb-1 border-b border-gray-200 flex items-center gap-2" style={{ color: themeColor }}>
                <span className="bg-gray-100 p-1 rounded"><i className="fas fa-briefcase"></i></span> Experience
              </h3>
              <div className="space-y-5">
                {experience.map((exp) => (
                  <div key={exp.id} className="break-inside-avoid">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-gray-900">{exp.jobTitle}</h4>
                      <span className="text-xs font-medium text-gray-500 whitespace-nowrap">{exp.startDate} - {exp.endDate}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700">{exp.company}</span>
                      <span className="text-xs text-gray-500">{exp.city}</span>
                    </div>
                    <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line pl-3 border-l-2 border-gray-100">
                      {exp.description}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {education.length > 0 && (
            <section className="break-inside-avoid">
               <h3 className="text-xs font-bold uppercase tracking-widest mb-4 pb-1 border-b border-gray-200 flex items-center gap-2" style={{ color: themeColor }}>
                <span className="bg-gray-100 p-1 rounded"><i className="fas fa-graduation-cap"></i></span> Education
              </h3>
              <div className="space-y-4">
                {education.map((edu) => (
                  <div key={edu.id} className="break-inside-avoid">
                     <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-gray-900">{edu.school}</h4>
                      <span className="text-xs font-medium text-gray-500 whitespace-nowrap">{edu.startDate} - {edu.endDate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-700">{edu.degree}</div>
                        {edu.grade && (
                           <div className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                             Grade: {edu.grade}
                           </div>
                        )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{edu.city}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Side Column */}
        <div className="w-1/3 space-y-6">
           {skills.length > 0 && (
            <section className="break-inside-avoid">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4 pb-1 border-b border-gray-200 flex items-center gap-2" style={{ color: themeColor }}>
                <span className="bg-gray-100 p-1 rounded"><i className="fas fa-tools"></i></span> Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  <span key={skill.id} className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded border border-gray-200">
                    {skill.name}
                  </span>
                ))}
              </div>
            </section>
           )}
        </div>
      </div>
      
      {/* Decorative footer */}
      <div className="absolute bottom-0 w-full h-2" style={{ backgroundColor: themeColor }}></div>
    </div>
  );
};

export default ResumePreview;
