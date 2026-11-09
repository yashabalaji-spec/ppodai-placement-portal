import React, { useState } from 'react';
import { apiFetch } from '../../services/apiFetch';
import { UserAccount, StudentProfile, JobDescriptionMatch } from '../../types';
import { extractSkillsFromJD, evaluateStudentJDMatch, rankStudentsForJD, JDRequirement } from '../../services/jdMatcher';
import { generateCandidateShortlistPDF } from '../../services/pdfService';
import { 
  Briefcase, 
  UploadCloud, 
  FileText, 
  Download, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Filter, 
  Search,
  Star,
  Layers,
  Send,
  Building2,
  Cpu,
  Bot,
  RefreshCw,
  Award,
  CheckCircle2,
  XCircle,
  FileCode,
  Sliders,
  ExternalLink
} from 'lucide-react';

interface HRPortalProps {
  user: UserAccount;
  students: StudentProfile[];
}

interface LlmCandidateEval {
  usn: string;
  name: string;
  score: number;
  verdict: 'STRONG_MATCH' | 'GOOD_FIT' | 'POTENTIAL' | 'LOW_MATCH';
  matchedSkills: string[];
  missingSkills: string[];
  qualitativeSummary: string;
  recommendationForInterview: string;
}

interface LlmResultData {
  extractedRequirements?: {
    roleTitle: string;
    keySkills: string[];
    minCGPA: number;
    eligibilitySummary: string;
  };
  evaluations: LlmCandidateEval[];
}

export const HRPortal: React.FC<HRPortalProps> = ({
  user,
  students
}) => {
  const [companyName, setCompanyName] = useState(user.company || 'Amazon AWS');
  const [jobTitle, setJobTitle] = useState('Software Development Engineer - I (Full Stack & Cloud)');
  const [minCGPA, setMinCGPA] = useState(7.5);
  const [maxBacklogs, setMaxBacklogs] = useState(0);
  const [selectedBranches, setSelectedBranches] = useState<string[]>(['CSE', 'ISE', 'AIML', 'AIDS', 'ECE']);
  const [requiredSkills, setRequiredSkills] = useState<string[]>(['Python', 'React', 'PostgreSQL', 'Docker', 'AWS']);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [rawJdText, setRawJdText] = useState(
`We are seeking passionate Software Development Engineers to join Amazon AWS.
Requirements:
- Strong proficiency in Python, React, and Node.js.
- Solid understanding of relational databases like PostgreSQL or MySQL.
- Familiarity with Cloud architectures (AWS), Docker, and microservices.
- Minimum CGPA of 7.5 with 0 active backlogs.
- Strong fundamentals in Data Structures, Algorithms, and System Design.`
  );

  const [minScoreFilter, setMinScoreFilter] = useState(50);
  const [searchFilter, setSearchFilter] = useState('');

  // LLM Evaluation State
  const [isLlmEvaluating, setIsLlmEvaluating] = useState(false);
  const [llmResults, setLlmResults] = useState<LlmResultData | null>(null);
  const [activeEngine, setActiveEngine] = useState<'llm' | 'algorithmic'>('algorithmic');
  const [evaluationFeedback, setEvaluationFeedback] = useState<string | null>(null);
  const [fileUploadName, setFileUploadName] = useState<string | null>(null);

  // Compute algorithmic matched students dynamically
  const currentJd: JDRequirement = {
    title: jobTitle,
    targetBranches: selectedBranches,
    minCGPA,
    maxBacklogs,
    requiredSkills,
    rawText: rawJdText
  };

  const algorithmicRanked = rankStudentsForJD(students, currentJd);

  // Convert LLM results to JobDescriptionMatch format for PDF and common table display
  const effectiveMatches: JobDescriptionMatch[] = activeEngine === 'llm' && llmResults ? (
    llmResults.evaluations.map((evalItem) => {
      const studentObj = students.find(s => s.usn === evalItem.usn) || students[0];
      return {
        student: studentObj,
        matchScore: evalItem.score,
        matchedSkills: evalItem.matchedSkills,
        missingSkills: evalItem.missingSkills,
        cgpaEligible: studentObj.cgpa >= minCGPA,
        backlogEligible: studentObj.currentBacklogs <= maxBacklogs,
        scoreBreakdown: {
          skillMatchScore: Math.round(evalItem.score * 0.5),
          experienceScore: Math.round(evalItem.score * 0.25),
          academicScore: Math.round(evalItem.score * 0.2),
          ratingBonus: Math.round(evalItem.score * 0.05),
        }
      };
    })
  ) : algorithmicRanked;

  const filteredCandidates = effectiveMatches.filter(c => {
    const matchesScore = c.matchScore >= minScoreFilter;
    const matchesSearch = 
      c.student.fullName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.student.usn.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.student.department.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesScore && matchesSearch;
  });

  // Handle JD File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileUploadName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawJdText(content);
        // Auto extract keywords
        const extracted = extractSkillsFromJD(content);
        if (extracted.skills.length > 0) setRequiredSkills(extracted.skills);
        if (extracted.minCGPA) setMinCGPA(extracted.minCGPA);
        setMaxBacklogs(extracted.maxBacklogs || 0);
        setEvaluationFeedback(`Loaded JD file "${file.name}" and auto-detected ${extracted.skills.length} skills!`);
      }
    };
    reader.readAsText(file);
  };

  // Run Gemini LLM Deep Candidate Resume Evaluation
  const handleRunLlmEvaluation = async () => {
    setIsLlmEvaluating(true);
    setEvaluationFeedback(null);

    try {
      const response = await apiFetch('/api/evaluate-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jdText: rawJdText,
          jobTitle,
          companyName,
          candidates: students
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.data && result.data.evaluations) {
        setLlmResults(result.data);
        setActiveEngine('llm');
        if (result.data.extractedRequirements?.keySkills?.length > 0) {
          setRequiredSkills(result.data.extractedRequirements.keySkills);
        }
        setEvaluationFeedback('✨ Gemini 3.8 Flash LLM successfully analyzed and scored all candidate resumes!');
      } else {
        throw new Error(result.error || 'Evaluation format error');
      }
    } catch (err: any) {
      console.warn('Gemini server evaluation fallback:', err);
      // Seamless algorithmic fallback
      setActiveEngine('algorithmic');
      setEvaluationFeedback('ℹ️ Evaluated via GAT PPODAI Semantic Engine. (Server LLM endpoint unavailable or offline; fallback active)');
    } finally {
      setIsLlmEvaluating(false);
    }
  };

  // Handle Manual JD Text Auto-Extraction
  const handleAutoExtract = () => {
    const extracted = extractSkillsFromJD(rawJdText);
    if (extracted.skills.length > 0) {
      setRequiredSkills(extracted.skills);
    }
    if (extracted.minCGPA) {
      setMinCGPA(extracted.minCGPA);
    }
    setMaxBacklogs(extracted.maxBacklogs || 0);
  };

  // Pre-load JD templates
  const loadTemplate = (type: 'sde' | 'aiml' | 'cloud' | 'embedded') => {
    if (type === 'sde') {
      setJobTitle('Software Development Engineer (Full Stack)');
      setRequiredSkills(['Python', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS']);
      setMinCGPA(7.5);
      setSelectedBranches(['CSE', 'ISE', 'AIML', 'AIDS', 'ECE']);
      setRawJdText('Role: SDE Full Stack. Skills: Python, React, Node.js, PostgreSQL, Docker, AWS. Min CGPA 7.5, zero backlogs. Responsibilities: Building scalable REST APIs, microservices, and modern web interfaces.');
    } else if (type === 'aiml') {
      setJobTitle('Applied AI & Machine Learning Scientist');
      setRequiredSkills(['Python', 'PyTorch', 'TensorFlow', 'LangChain', 'GenAI', 'SQL']);
      setMinCGPA(8.0);
      setSelectedBranches(['CSE', 'AIML', 'AIDS', 'ISE']);
      setRawJdText('Role: Applied AI Scientist. Skills: Python, PyTorch, TensorFlow, LangChain, GenAI, SQL. Min CGPA 8.0, 0 backlogs. Responsibilities: Designing RAG pipelines, fine-tuning LLMs, and deploying AI inference endpoints.');
    } else if (type === 'cloud') {
      setJobTitle('Cloud DevOps & Distributed Systems Architect');
      setRequiredSkills(['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Python']);
      setMinCGPA(7.5);
      setSelectedBranches(['CSE', 'ISE', 'AIML', 'AIDS', 'ECE', 'EEE']);
      setRawJdText('Role: Cloud DevOps Architect. Skills: AWS, Docker, Kubernetes, CI/CD, Linux, Python. Min CGPA 7.5, max 1 backlog. Responsibilities: Infrastructure as Code (Terraform), Kubernetes cluster management, automated CI/CD.');
    } else {
      setJobTitle('Embedded Systems & Firmware Specialist');
      setRequiredSkills(['Embedded C', 'Verilog', 'RTOS', 'ARM Cortex', 'Python']);
      setMinCGPA(7.0);
      setSelectedBranches(['ECE', 'EEE', 'CSE', 'RA']);
      setRawJdText('Role: Embedded Systems Engineer. Skills: Embedded C, Verilog, RTOS, ARM Cortex, Python. Min CGPA 7.0, 0 backlogs. Responsibilities: Board bring-up, real-time operating systems, low-level device drivers.');
    }
  };

  const handleDownloadPDF = () => {
    generateCandidateShortlistPDF(companyName, currentJd, effectiveMatches);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-[#0C2C47] rounded-2xl p-5 sm:p-6 text-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#E2A54D]">
            <span>HR Portal</span>
            <span>·</span>
            <span>{companyName}</span>
          </div>
          <h1 className="min-w-0 flex flex-wrap items-center gap-2 break-words text-xl sm:text-2xl font-bold mt-1 text-white tracking-tight">
            <span>Candidate Skill Matcher</span>
          </h1>
          <p className="text-xs text-[#E4F2EA] mt-1 max-w-2xl">
            Evaluate student profiles against job requirements and generate candidate shortlists.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#E2A54D] hover:bg-[#E2A54D]/90 text-[#0C2C47] rounded-lg text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
            title="Download candidate shortlist PDF"
          >
            <Download className="w-4 h-4" />
            <span>Download Shortlist</span>
          </button>
        </div>
      </div>

      {/* Engine Switcher & Status Banner */}
      <div className="bg-white border border-[#97D3CD]/50 rounded-xl p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-[#E4F2EA]/40 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveEngine('llm')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeEngine === 'llm'
                  ? 'bg-[#0C2C47] text-white shadow-xs'
                  : 'text-[#2D5652] hover:text-[#0C2C47]'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-[#E2A54D]" />
              <span>AI Analysis</span>
              {llmResults && <span className="w-2 h-2 rounded-full bg-[#E2A54D]"></span>}
            </button>
            <button
              type="button"
              onClick={() => setActiveEngine('algorithmic')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeEngine === 'algorithmic'
                  ? 'bg-[#0C2C47] text-white shadow-xs'
                  : 'text-[#2D5652] hover:text-[#0C2C47]'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Standard Match</span>
            </button>
          </div>

          <span className="text-xs text-slate-500 hidden md:inline">
            Active: <strong className="text-slate-900">{activeEngine === 'llm' ? 'Gemini 3.8 Flash LLM' : 'GAT Rule-Based Matcher'}</strong>
          </span>
        </div>

        <button
          type="button"
          onClick={handleRunLlmEvaluation}
          disabled={isLlmEvaluating}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 hover:opacity-90 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
        >
          {isLlmEvaluating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Evaluating Candidate Resumes with Gemini...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Run Gemini 3.8 Flash LLM Evaluation</span>
            </>
          )}
        </button>
      </div>

      {evaluationFeedback && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>{evaluationFeedback}</span>
        </div>
      )}

      {/* Main Grid: JD Input on Left, Candidate Match Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 Cols): JD Upload & Configuration */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Job Description Specification</h3>
                <p className="text-[11px] text-slate-500">Upload JD file or paste parameters</p>
              </div>
            </div>

            {/* Quick Template Buttons */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Preset Templates:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => loadTemplate('sde')}
                  className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md transition-colors"
                >
                  Full Stack SDE
                </button>
                <button
                  type="button"
                  onClick={() => loadTemplate('aiml')}
                  className="px-2.5 py-1 text-[11px] font-medium bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-md transition-colors border border-purple-200"
                >
                  AI / LLM Scientist
                </button>
                <button
                  type="button"
                  onClick={() => loadTemplate('cloud')}
                  className="px-2.5 py-1 text-[11px] font-medium bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-md transition-colors border border-blue-200"
                >
                  Cloud / DevOps
                </button>
                <button
                  type="button"
                  onClick={() => loadTemplate('embedded')}
                  className="px-2.5 py-1 text-[11px] font-medium bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-md transition-colors border border-amber-200"
                >
                  Embedded Systems
                </button>
              </div>
            </div>

            {/* File Upload Dropzone */}
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-3.5 text-center bg-slate-50/60 hover:bg-slate-50 transition-colors">
              <label className="cursor-pointer block">
                <UploadCloud className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                <span className="text-xs font-semibold text-slate-800 block">
                  {fileUploadName ? `Attached: ${fileUploadName}` : 'Upload Job Description File (.txt, .md, .doc)'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Click to browse from local computer
                </span>
                <input
                  type="file"
                  accept=".txt,.md,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Raw JD Textbox & Auto-Extractor */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Paste Job Description Text (JD)</label>
                <button
                  type="button"
                  onClick={handleAutoExtract}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Auto-Detect Skills
                </button>
              </div>
              <textarea
                rows={5}
                value={rawJdText}
                onChange={(e) => setRawJdText(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-sans"
                placeholder="Paste Job Description here..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Job Role Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Min CGPA Cutoff</label>
                <input
                  type="number"
                  step="0.1"
                  value={minCGPA}
                  onChange={(e) => setMinCGPA(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Max Active Backlogs</label>
                <input
                  type="number"
                  value={maxBacklogs}
                  onChange={(e) => setMaxBacklogs(parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
            </div>

            {/* Required Skills Tags */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Required Skills to Match ({requiredSkills.length})
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {requiredSkills.map(skill => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-md text-xs font-semibold flex items-center gap-1"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => setRequiredSkills(requiredSkills.filter(s => s !== skill))}
                      className="text-rose-400 hover:text-rose-700 text-xs font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  placeholder="Add custom skill (e.g. PyTorch)..."
                  className="flex-1 text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newSkillInput.trim() && !requiredSkills.includes(newSkillInput.trim())) {
                        setRequiredSkills([...requiredSkills, newSkillInput.trim()]);
                        setNewSkillInput('');
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newSkillInput.trim() && !requiredSkills.includes(newSkillInput.trim())) {
                      setRequiredSkills([...requiredSkills, newSkillInput.trim()]);
                      setNewSkillInput('');
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold"
                >
                  Add
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column (7 Cols): Candidate Rankings & LLM Assessment */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    Candidate Shortlist ({filteredCandidates.length} Matched)
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                    activeEngine === 'llm' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {activeEngine === 'llm' ? 'Gemini 3.8 Flash' : 'Algorithmic'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Ranked by compatibility against {jobTitle}
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search name, USN..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="pl-8 pr-3 py-1 text-xs border border-slate-200 rounded-md w-36 text-slate-800"
                  />
                </div>

                <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
                  <span>Min:</span>
                  <select
                    value={minScoreFilter}
                    onChange={(e) => setMinScoreFilter(parseInt(e.target.value))}
                    className="text-xs border border-slate-200 rounded-md px-1.5 py-1 text-slate-800 font-bold"
                  >
                    <option value={0}>All (0%+)</option>
                    <option value={50}>50%+</option>
                    <option value={70}>70%+</option>
                    <option value={85}>85%+</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Candidates List */}
            <div className="divide-y divide-slate-100 mt-3">
              {filteredCandidates.map((match, idx) => {
                const s = match.student;
                const scoreColor = 
                  match.matchScore >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                  match.matchScore >= 60 ? 'text-blue-700 bg-blue-50 border-blue-200' :
                  'text-amber-700 bg-amber-50 border-amber-200';

                // Look up LLM qualitative feedback if available
                const llmEval = llmResults?.evaluations?.find(e => e.usn === s.usn);

                return (
                  <div key={s.usn} className="py-3.5 hover:bg-slate-50/80 px-2 rounded-lg transition-colors">
                    
                    <div className="flex items-start justify-between gap-3">
                      
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">{s.fullName}</span>
                            <span className="text-[11px] font-mono text-slate-500 font-semibold">{s.usn}</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                              {s.department} (Sec {s.section})
                            </span>
                            {llmEval && (
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                llmEval.verdict === 'STRONG_MATCH' ? 'bg-emerald-100 text-emerald-800' :
                                llmEval.verdict === 'GOOD_FIT' ? 'bg-blue-100 text-blue-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {llmEval.verdict.replace('_', ' ')}
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
                            <span>CGPA: <strong className="text-slate-800 font-mono">{s.cgpa.toFixed(2)}</strong></span>
                            <span>Backlogs: <strong className="text-slate-800">{s.currentBacklogs}</strong></span>
                            <span>Offers: <strong className="text-slate-800">{s.offers.length}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Score Badge */}
                      <div className="text-right shrink-0">
                        <div className={`px-2.5 py-1 rounded-lg border text-sm font-black font-mono ${scoreColor}`}>
                          {match.matchScore}%
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Match Score</span>
                      </div>

                    </div>

                    {/* Matched & Missing Skills */}
                    <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Skills:</span>
                      {match.matchedSkills.map(sk => (
                        <span key={sk} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          ✓ {sk}
                        </span>
                      ))}
                      {match.missingSkills.slice(0, 3).map(sk => (
                        <span key={sk} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          ✕ {sk}
                        </span>
                      ))}
                    </div>

                    {/* LLM Qualitative Summary */}
                    {llmEval && (
                      <div className="mt-2 p-2 rounded-md bg-purple-50/70 border border-purple-200/80 text-[11px] text-purple-950">
                        <div className="font-semibold text-purple-900 flex items-center gap-1 mb-0.5">
                          <Bot className="w-3 h-3 text-purple-600" />
                          <span>Gemini Technical Justification:</span>
                        </div>
                        <p>{llmEval.qualitativeSummary}</p>
                        {llmEval.recommendationForInterview && (
                          <div className="mt-1 font-medium text-purple-800">
                            <strong>Interview Focus:</strong> {llmEval.recommendationForInterview}
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                );
              })}

              {filteredCandidates.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No candidates match the score threshold of {minScoreFilter}%. Try lowering the filter.
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
