import React, { useState } from 'react';
import { ResumeData, Experience, Education, Skill } from '../types';
import { enhanceDescription, generateResumeSummary, suggestSkills } from '../services/geminiService';
import Spinner from './Spinner';

interface EditorProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

const Editor: React.FC<EditorProps> = ({ data, onChange }) => {
  const [loadingSection, setLoadingSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'personal' | 'experience' | 'education' | 'skills'>('personal');

  // Helper to update personal info
  const handleInfoChange = (field: keyof typeof data.personalInfo, value: string) => {
    onChange({
      ...data,
      personalInfo: { ...data.personalInfo, [field]: value }
    });
  };

  // AI Handlers
  const handleGenerateSummary = async () => {
    setLoadingSection('summary');
    const summary = await generateResumeSummary(data);
    handleInfoChange('summary', summary);
    setLoadingSection(null);
  };

  const handleEnhanceExperience = async (index: number, text: string) => {
    setLoadingSection(`exp-${index}`);
    const enhanced = await enhanceDescription(text);
    const newExp = [...data.experience];
    newExp[index].description = enhanced;
    onChange({ ...data, experience: newExp });
    setLoadingSection(null);
  };

  const handleSuggestSkills = async () => {
    if (!data.personalInfo.jobTitle) return;
    setLoadingSection('skills');
    const skills = await suggestSkills(data.personalInfo.jobTitle);
    const newSkills = [...data.skills];
    skills.forEach(s => {
      if (!newSkills.find(ns => ns.name.toLowerCase() === s.toLowerCase())) {
        newSkills.push({ id: Date.now().toString() + Math.random(), name: s, level: 'Intermediate' });
      }
    });
    onChange({ ...data, skills: newSkills });
    setLoadingSection(null);
  };

  // CRUD for Arrays
  const addExperience = () => {
    onChange({
      ...data,
      experience: [
        ...data.experience,
        { id: Date.now().toString(), company: '', jobTitle: '', startDate: '', endDate: '', city: '', description: '' }
      ]
    });
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const newExp = [...data.experience];
    newExp[index] = { ...newExp[index], [field]: value };
    onChange({ ...data, experience: newExp });
  };

  const removeExperience = (index: number) => {
    const newExp = data.experience.filter((_, i) => i !== index);
    onChange({ ...data, experience: newExp });
  };

  const addEducation = () => {
    onChange({
      ...data,
      education: [
        ...data.education,
        { id: Date.now().toString(), school: '', degree: '', startDate: '', endDate: '', city: '', description: '' }
      ]
    });
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const newEdu = [...data.education];
    newEdu[index] = { ...newEdu[index], [field]: value };
    onChange({ ...data, education: newEdu });
  };

  const removeEducation = (index: number) => {
    const newEdu = data.education.filter((_, i) => i !== index);
    onChange({ ...data, education: newEdu });
  };

  const addSkill = () => {
    onChange({
      ...data,
      skills: [...data.skills, { id: Date.now().toString(), name: '', level: 'Intermediate' }]
    });
  };

  const updateSkill = (index: number, field: keyof Skill, value: string) => {
    const newSkills = [...data.skills];
    // @ts-ignore
    newSkills[index] = { ...newSkills[index], [field]: value };
    onChange({ ...data, skills: newSkills });
  };

  const removeSkill = (index: number) => {
    const newSkills = data.skills.filter((_, i) => i !== index);
    onChange({ ...data, skills: newSkills });
  };

  const TabButton = ({ id, label, icon }: { id: typeof activeTab, label: string, icon: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex-1 py-3 px-2 text-sm font-medium border-b-2 transition-colors duration-200 flex items-center justify-center gap-2 ${
        activeTab === id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      <i className={`fas ${icon}`}></i>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        <TabButton id="personal" label="Personal" icon="fa-user" />
        <TabButton id="experience" label="Work" icon="fa-briefcase" />
        <TabButton id="education" label="Education" icon="fa-graduation-cap" />
        <TabButton id="skills" label="Skills" icon="fa-tools" />
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {activeTab === 'personal' && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-800">Personal Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup label="Full Name" value={data.personalInfo.fullName} onChange={(v) => handleInfoChange('fullName', v)} />
              <InputGroup label="Job Title" value={data.personalInfo.jobTitle} onChange={(v) => handleInfoChange('jobTitle', v)} placeholder="e.g. Software Engineer" />
              <InputGroup label="Email" value={data.personalInfo.email} onChange={(v) => handleInfoChange('email', v)} type="email" />
              <InputGroup label="Phone" value={data.personalInfo.phone} onChange={(v) => handleInfoChange('phone', v)} type="tel" />
              <InputGroup label="Location" value={data.personalInfo.city} onChange={(v) => handleInfoChange('city', v)} />
              <InputGroup label="LinkedIn / Portfolio" value={data.personalInfo.link} onChange={(v) => handleInfoChange('link', v)} />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="block text-sm font-medium text-gray-700">Professional Summary</label>
                <button 
                  onClick={handleGenerateSummary}
                  disabled={loadingSection === 'summary'}
                  className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1 rounded-full flex items-center gap-1 transition-colors"
                >
                  {loadingSection === 'summary' ? <Spinner /> : <i className="fas fa-magic"></i>}
                  AI Generate
                </button>
              </div>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm min-h-[120px]"
                value={data.personalInfo.summary}
                onChange={(e) => handleInfoChange('summary', e.target.value)}
                placeholder="Briefly describe your professional background..."
              />
            </div>
          </div>
        )}

        {activeTab === 'experience' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Experience</h2>
              <button onClick={addExperience} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-2">
                <i className="fas fa-plus"></i> Add
              </button>
            </div>
            
            {data.experience.map((exp, index) => (
              <div key={exp.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative group">
                <button 
                  onClick={() => removeExperience(index)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-2"
                >
                  <i className="fas fa-trash"></i>
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <InputGroup label="Company" value={exp.company} onChange={(v) => updateExperience(index, 'company', v)} />
                  <InputGroup label="Job Title" value={exp.jobTitle} onChange={(v) => updateExperience(index, 'jobTitle', v)} />
                  <InputGroup label="Start Date" value={exp.startDate} onChange={(v) => updateExperience(index, 'startDate', v)} placeholder="MM/YYYY" />
                  <InputGroup label="End Date" value={exp.endDate} onChange={(v) => updateExperience(index, 'endDate', v)} placeholder="Present or MM/YYYY" />
                  <InputGroup label="Location" value={exp.city} onChange={(v) => updateExperience(index, 'city', v)} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <button 
                      onClick={() => handleEnhanceExperience(index, exp.description)}
                      disabled={loadingSection === `exp-${index}`}
                      className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1 rounded-full flex items-center gap-1 transition-colors"
                    >
                      {loadingSection === `exp-${index}` ? <Spinner /> : <i className="fas fa-magic"></i>}
                      Polish
                    </button>
                  </div>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm min-h-[100px]"
                    value={exp.description}
                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                    placeholder="• Accomplishment 1&#10;• Accomplishment 2"
                  />
                </div>
              </div>
            ))}
            {data.experience.length === 0 && <div className="text-center text-gray-400 py-10">No experience added yet.</div>}
          </div>
        )}

        {activeTab === 'education' && (
           <div className="space-y-6 animate-fadeIn">
           <div className="flex justify-between items-center">
             <h2 className="text-xl font-bold text-gray-800">Education</h2>
             <button onClick={addEducation} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-2">
               <i className="fas fa-plus"></i> Add
             </button>
           </div>
           
           {data.education.map((edu, index) => (
             <div key={edu.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative group">
               <button 
                 onClick={() => removeEducation(index)}
                 className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-2"
               >
                 <i className="fas fa-trash"></i>
               </button>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                 <InputGroup label="School / University" value={edu.school} onChange={(v) => updateEducation(index, 'school', v)} />
                 <InputGroup label="Degree / Major" value={edu.degree} onChange={(v) => updateEducation(index, 'degree', v)} />
                 <InputGroup label="Start Date" value={edu.startDate} onChange={(v) => updateEducation(index, 'startDate', v)} />
                 <InputGroup label="End Date" value={edu.endDate} onChange={(v) => updateEducation(index, 'endDate', v)} />
                 <InputGroup label="City" value={edu.city} onChange={(v) => updateEducation(index, 'city', v)} />
               </div>
             </div>
           ))}
           {data.education.length === 0 && <div className="text-center text-gray-400 py-10">No education added yet.</div>}
         </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Skills</h2>
              <div className="flex gap-2">
                <button 
                    onClick={handleSuggestSkills}
                    disabled={loadingSection === 'skills' || !data.personalInfo.jobTitle}
                    className="bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm hover:bg-purple-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                    title={!data.personalInfo.jobTitle ? "Add a Job Title first" : "AI Suggest"}
                  >
                  {loadingSection === 'skills' ? <Spinner /> : <i className="fas fa-lightbulb"></i>}
                  Suggest
                </button>
                <button onClick={addSkill} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <i className="fas fa-plus"></i> Add
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {data.skills.map((skill, index) => (
                <div key={skill.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200">
                   <div className="flex-1">
                      <input 
                        className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium"
                        value={skill.name}
                        onChange={(e) => updateSkill(index, 'name', e.target.value)}
                        placeholder="Skill Name (e.g. React)"
                      />
                   </div>
                   <select 
                    className="text-xs bg-white border border-gray-200 rounded px-2 py-1"
                    value={skill.level}
                    onChange={(e) => updateSkill(index, 'level', e.target.value as any)}
                   >
                     <option value="Beginner">Beginner</option>
                     <option value="Intermediate">Intermediate</option>
                     <option value="Advanced">Advanced</option>
                     <option value="Expert">Expert</option>
                   </select>
                   <button 
                    onClick={() => removeSkill(index)}
                    className="text-gray-400 hover:text-red-500 px-2"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
            {data.skills.length === 0 && <div className="text-center text-gray-400 py-10">No skills added yet.</div>}
          </div>
        )}
      </div>
    </div>
  );
};

const InputGroup = ({ label, value, onChange, type = "text", placeholder = "" }: { label: string, value: string, onChange: (v: string) => void, type?: string, placeholder?: string }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
    <input
      type={type}
      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);

export default Editor;