import React, { useState, useEffect, useRef } from 'react';
import { processVoiceCommand } from '../services/geminiService';
import { ResumeData } from '../types';
import Spinner from './Spinner';

interface VoiceAssistantProps {
  onUpdate: (updates: Partial<ResumeData>) => void;
  currentData: ResumeData;
}

// Extend Window interface for webkitSpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onUpdate, currentData }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  // Refs to handle stale closures and type issues
  const transcriptRef = useRef(''); 
  const currentDataRef = useRef(currentData);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep data ref in sync
  useEffect(() => {
    currentDataRef.current = currentData;
  }, [currentData]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; // Stop after one sentence/command
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setTranscript('');
        transcriptRef.current = '';
      };

      recognitionRef.current.onresult = (event: any) => {
        const currentTranscript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setTranscript(currentTranscript);
        transcriptRef.current = currentTranscript;

        // Reset silence timer on new input
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
             if (recognitionRef.current) recognitionRef.current.stop();
        }, 2000); // Stop 2 seconds after silence
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (transcriptRef.current.trim().length > 0) {
          handleCommand(transcriptRef.current);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }

    return () => {
        if (recognitionRef.current) recognitionRef.current.abort();
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening && !isProcessing) {
        try {
            recognitionRef.current.start();
        } catch (e) {
            console.error("Start error", e);
        }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleCommand = async (text: string) => {
    setIsProcessing(true);
    try {
      const result = await processVoiceCommand(text);
      
      if (result.intent === 'unknown') {
        console.log("Unknown command intent");
      } else {
        applyUpdate(result.intent, result.data);
      }
    } catch (error) {
      console.error("Failed to process voice command", error);
    } finally {
      setIsProcessing(false);
      setTranscript('');
      transcriptRef.current = '';
    }
  };

  const applyUpdate = (intent: string, data: any) => {
    const current = currentDataRef.current;
    switch (intent) {
      case 'update_personal':
        onUpdate({
          ...current,
          personalInfo: { ...current.personalInfo, ...data }
        });
        break;
      
      case 'add_experience':
        onUpdate({
          ...current,
          experience: [
            ...current.experience,
            {
              id: Date.now().toString(),
              company: data.company || 'Company',
              jobTitle: data.jobTitle || 'Job Title',
              startDate: data.startDate || '',
              endDate: data.endDate || '',
              city: data.city || '',
              description: data.description || ''
            }
          ]
        });
        break;

      case 'add_education':
        onUpdate({
          ...current,
          education: [
            ...current.education,
            {
              id: Date.now().toString(),
              school: data.school || 'University',
              degree: data.degree || 'Degree',
              startDate: data.startDate || '',
              endDate: data.endDate || '',
              city: data.city || '',
              grade: data.grade || '',
              description: ''
            }
          ]
        });
        break;

      case 'add_skill':
        onUpdate({
          ...current,
          skills: [
            ...current.skills,
            {
              id: Date.now().toString(),
              name: data.name || 'New Skill',
              level: (data.level as any) || 'Intermediate'
            }
          ]
        });
        break;
    }
  };

  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2 no-print">
      {(isListening || isProcessing) && (
        <div className="bg-white text-gray-800 px-4 py-3 rounded-lg shadow-xl border border-gray-200 mb-2 animate-fadeIn max-w-xs">
          <div className="flex items-center gap-3 mb-1">
            {isProcessing ? (
              <Spinner />
            ) : (
              <div className="flex gap-1 h-3 items-end">
                 <span className="w-1 h-full bg-red-500 animate-pulse rounded"></span>
                 <span className="w-1 h-2/3 bg-red-500 animate-pulse delay-75 rounded"></span>
                 <span className="w-1 h-full bg-red-500 animate-pulse delay-150 rounded"></span>
              </div>
            )}
            <span className="font-semibold text-sm">
              {isProcessing ? 'Processing...' : 'Listening...'}
            </span>
          </div>
          <p className="text-xs text-gray-500 italic leading-tight">
            {transcript || "Say something like 'Add skill React' or 'My name is Alex'"}
          </p>
        </div>
      )}

      <button
        onClick={isListening ? stopListening : startListening}
        disabled={isProcessing}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 ${
          isListening 
            ? 'bg-red-500 text-white animate-pulse' 
            : isProcessing
            ? 'bg-gray-400 text-white cursor-wait'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
        title="Voice Assistant"
      >
        {isProcessing ? (
          <i className="fas fa-brain"></i>
        ) : isListening ? (
          <i className="fas fa-microphone-slash"></i>
        ) : (
          <i className="fas fa-microphone"></i>
        )}
      </button>
    </div>
  );
};

export default VoiceAssistant;