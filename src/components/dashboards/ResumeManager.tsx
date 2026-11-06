import React, { useState, useEffect, useRef } from 'react';
import { StudentProfile } from '../../types';
import { generateStudentResumePDF } from '../../services/pdfService';
import { 
  FileText, 
  Upload, 
  Trash2, 
  Download, 
  Eye, 
  Plus, 
  CheckCircle2, 
  AlertCircle,
  FileCheck
} from 'lucide-react';

interface StoredResume {
  name: string;
  type: string;
  size: number;
  data: string; // base64 data url
  uploadedAt: string;
}

interface ResumeManagerProps {
  student: StudentProfile;
}

export const ResumeManager: React.FC<ResumeManagerProps> = ({ student }) => {
  const [resumes, setResumes] = useState<StoredResume[]>(() => {
    const saved = localStorage.getItem('uploadedResume');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    // Seed initial GAT resume
    return [
      {
        name: `${student.usn}_${student.firstName}_Placement_Resume.pdf`,
        type: 'application/pdf',
        size: 142000,
        data: '',
        uploadedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      }
    ];
  });

  const [previewResume, setPreviewResume] = useState<StoredResume | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('uploadedResume', JSON.stringify(resumes));
  }, [resumes]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      alert('Please upload a PDF file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const newResume: StoredResume = {
        name: file.name,
        type: file.type,
        size: file.size,
        data: reader.result as string,
        uploadedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      };
      setResumes(prev => [...prev, newResume]);
      setStatusMessage(`Resume "${file.name}" uploaded successfully!`);
      setTimeout(() => setStatusMessage(null), 3000);
    };
    reader.readAsDataURL(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteResume = (index: number) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      setResumes(prev => prev.filter((_, i) => i !== index));
      setStatusMessage('Resume deleted.');
      setTimeout(() => setStatusMessage(null), 2500);
    }
  };

  const handleDownloadUploaded = (resume: StoredResume) => {
    if (resume.data) {
      const link = document.createElement('a');
      link.href = resume.data;
      link.download = resume.name;
      link.click();
    } else {
      // Trigger default GAT PDF generation
      generateStudentResumePDF(student);
    }
  };

  return (
    <div className="bg-white border border-[#97D3CD]/50 rounded-xl p-5 sm:p-6 shadow-xs space-y-5">
      
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#97D3CD]/20 pb-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#0C2C47] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#2D5652]" />
            <span>My Resumes</span>
          </h3>
          <p className="text-xs text-[#2D5652]/70 mt-0.5">
            Upload custom PDFs or generate formatted GAT resumes
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Hidden native input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,application/pdf"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 bg-[#0C2C47] hover:bg-[#2D5652] text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload PDF</span>
          </button>

          <button
            onClick={() => generateStudentResumePDF(student)}
            className="px-3 py-2 bg-[#E2A54D] hover:bg-[#E2A54D]/90 text-[#0C2C47] rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Generate verified resume"
          >
            <Download className="w-4 h-4" />
            <span>Generate Resume</span>
          </button>
        </div>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div className="p-2.5 rounded-lg bg-[#E4F2EA] border border-[#2D5652]/40 text-xs text-[#2D5652] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#2D5652] shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Resumes List */}
      <div className="space-y-2.5">
        {resumes.length === 0 ? (
          <div className="p-6 text-center border-2 border-dashed border-[#97D3CD]/40 rounded-xl bg-[#E4F2EA]/20">
            <FileText className="w-8 h-8 text-[#2D5652]/40 mx-auto mb-2" />
            <p className="text-xs font-semibold text-[#0C2C47]">No resumes uploaded yet</p>
            <p className="text-[11px] text-[#2D5652]/70 mt-0.5">Click "Upload PDF" or generate one automatically</p>
          </div>
        ) : (
          resumes.map((resume, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl border border-[#97D3CD]/40 hover:border-[#2D5652] bg-white hover:bg-[#E4F2EA]/20 transition-all shadow-2xs group"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* PDF Icon badge */}
                <div className="w-9 h-9 rounded-lg bg-[#EFEAE6] border border-[#E2A54D]/40 text-[#0C2C47] flex flex-col items-center justify-center font-bold text-[9px] shrink-0">
                  <FileText className="w-4 h-4 text-[#2D5652]" />
                  <span className="leading-none text-[8px] font-mono">PDF</span>
                </div>

                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[#0C2C47] truncate group-hover:text-[#2D5652] transition-colors">
                    {resume.name}
                  </h4>
                  <div className="text-[11px] text-[#2D5652]/70 mt-0.5 flex items-center gap-2 font-mono">
                    <span>{(resume.size / 1024).toFixed(1)} KB</span>
                    <span>·</span>
                    <span>{resume.uploadedAt}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleDownloadUploaded(resume)}
                  className="p-1.5 text-[#0C2C47] hover:bg-[#E4F2EA] rounded-md transition-colors cursor-pointer"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDeleteResume(index)}
                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
