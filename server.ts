import express from 'express';
import { pool } from './db';
import { connectMongoDB } from './mong';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Placement Portal / GAT PPODAI',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// PostgreSQL database connection test
app.get('/api/db-health', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT current_database() AS database, NOW() AS server_time'
    );

    res.json({
      status: 'connected',
      database: result.rows[0].database,
      serverTime: result.rows[0].server_time
    });
  } catch (error) {
    console.error('Database connection failed:', error);

    res.status(500).json({
      status: 'error',
      message: 'PostgreSQL connection failed'
    });
  }
});

// MongoDB database connection test
app.get('/api/mongo-health', async (req, res) => {
  try {
    const db = await connectMongoDB();
    await db.command({ ping: 1 });

    res.json({
      status: 'connected',
      database: db.databaseName
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error);

    res.status(500).json({
      status: 'error',
      message: 'MongoDB connection failed'
    });
  }
});

// Gemini LLM JD Match & Resume Evaluation Endpoint
app.post('/api/evaluate-jd', async (req, res) => {
  try {
    const { jdText, jobTitle, companyName, candidates } = req.body;

    if (!jdText || !candidates || !Array.isArray(candidates)) {
      return res.status(400).json({ error: 'Missing jdText or candidates array' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY not configured on server',
        fallback: true
      });
    }

    // Initialize GoogleGenAI SDK with modern pattern
    const ai = new GoogleGenAI();

    // Prepare concise profiles of candidates for the prompt
    const candidateSummaries = candidates.slice(0, 15).map((c: any) => ({
      usn: c.usn,
      name: c.fullName,
      branch: c.department,
      cgpa: c.cgpa,
      activeBacklogs: c.currentBacklogs,
      skills: c.skills?.map((s: any) => `${s.skillName} (Level ${s.rating}/5)`).join(', ') || 'N/A',
      internships: c.internships?.map((i: any) => `${i.company} (${i.role}, ${i.domain})`).join('; ') || 'None',
      projects: c.projects?.map((p: any) => `${p.title} [${p.techStack.join(', ')}]`).join('; ') || 'None',
      certifications: c.externalCertifications?.join(', ') || 'None'
    }));

    const prompt = `You are the chief AI Technical Recruiter for Global Academy of Technology (GAT) Placement Cell.
Evaluate the following Job Description (JD) from ${companyName || 'the employer'} for the role of "${jobTitle || 'Engineer'}" against the listed student candidates.

JOB DESCRIPTION:
"""
${jdText}
"""

CANDIDATES DATA:
${JSON.stringify(candidateSummaries, null, 2)}

TASK:
1. Carefully extract the core technical competencies, required experience, academic cutoff (CGPA), and prerequisites from the JD.
2. Evaluate each candidate's profile against this JD using deep semantic reasoning. Rate them on a scale of 0 to 100 based on:
   - Skill overlap & rating proficiency (40%)
   - Relevant hands-on projects & internships (30%)
   - Academic suitability (CGPA, backlogs, branch relevance) (20%)
   - Technical certifications & R&D work (10%)
3. Return a strictly valid JSON response without any markdown fences or preamble.
The JSON must follow this exact schema:
{
  "extractedRequirements": {
    "roleTitle": string,
    "keySkills": string[],
    "minCGPA": number,
    "eligibilitySummary": string
  },
  "evaluations": [
    {
      "usn": string,
      "name": string,
      "score": number, // integer 0 to 100
      "verdict": "STRONG_MATCH" | "GOOD_FIT" | "POTENTIAL" | "LOW_MATCH",
      "matchedSkills": string[],
      "missingSkills": string[],
      "qualitativeSummary": string,
      "recommendationForInterview": string
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseError) {
      // In case text had codeblock fences
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanJson);
    }

    return res.json({
      success: true,
      source: 'gemini-3.8-flash',
      data: parsedData
    });
  } catch (error: any) {
    console.error('Error in /api/evaluate-jd:', error);
    return res.status(500).json({
      error: error.message || 'LLM evaluation failed',
      fallback: true
    });
  }
});

// Configure Vite middleware or static serving
async function startServer() {
    await connectMongoDB();
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GAT PPODAI Server running at http://localhost:${PORT}`);
  });
}

startServer();
