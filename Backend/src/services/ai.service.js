const Groq = require("groq-sdk")
const puppeteerCore = require("puppeteer-core")
const chromium = require("@sparticuz/chromium")
const puppeteer = process.env.NODE_ENV === "production" ? puppeteerCore : require("puppeteer")

const PDF_MODELS = ["llama-3.3-70b-versatile", "llama3-70b-8192"]
const REPORT_MODELS = ["llama-3.1-8b-instant", "llama3-70b-8192", "llama-3.3-70b-versatile"]

async function groqComplete(groq, { prompt, maxTokens, models }) {
    for (const model of models) {
        try {
            const response = await groq.chat.completions.create({
                model,
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" },
                max_tokens: maxTokens,
            })
            console.log(`Used model: ${model}`)
            return response.choices[0].message.content.trim()
        } catch (err) {
            const isRateLimit = err?.status === 429 || err?.status === 413
            if (isRateLimit && model !== models[models.length - 1]) {
                console.warn(`${model} failed (${err.status}), trying next model...`)
                continue
            }
            throw err
        }
    }
}

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const prompt = `Generate an interview report for a candidate with the following details:
        Resume: ${resume}
        Self Description: ${selfDescription}
        Job Description: ${jobDescription}

        Respond ONLY with a valid JSON object with EXACTLY these fields, no extra fields, no markdown:
        {
            "title": "the job title extracted from the job description",
            "matchScore": <number between 0 and 100>,
            "technicalQuestions": [
                {
                    "question": "a technical question for the interview",
                    "intention": "why the interviewer asks this",
                    "answer": "how to answer this question"
                }
            ],
            "behavioralQuestions": [
                {
                    "question": "a behavioral question for the interview",
                    "intention": "why the interviewer asks this",
                    "answer": "how to answer this question"
                }
            ],
            "skillGaps": [
                {
                    "skill": "skill the candidate is lacking",
                    "severity": "low" or "medium" or "high"
                }
            ],
            "preparationPlan": [
                {
                    "day": <day number starting from 1>,
                    "focus": "main topic to focus on this day",
                    "tasks": ["task 1", "task 2"]
                }
            ]
        }`

    const raw = await groqComplete(groq, { prompt, maxTokens: 4096, models: REPORT_MODELS })
    return JSON.parse(raw)
}

async function generatePdfFromHtml(htmlContent) {
    const isProduction = process.env.NODE_ENV === "production"

    const browser = await puppeteer.launch(
        isProduction
            ? {
                args: chromium.args,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
            }
            : { headless: "new" }
    )

    const page = await browser.newPage()
    await page.setViewport({ width: 1240, height: 1754 })
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "0", bottom: "0", left: "0", right: "0" }
    })

    await browser.close()
    return pdfBuffer
}

function buildResumeHtml(data) {
    const skillsHtml = Object.entries(data.skills || {}).map(([category, skills]) => `
        <div class="skill-category">
            <div class="skill-category-name">${category}</div>
            <div class="skill-list">${Array.isArray(skills) ? skills.join(", ") : skills}</div>
        </div>
    `).join("")

    const educationHtml = (data.education || []).map(edu => `
        <div class="edu-block">
            <div class="edu-degree">${edu.degree}</div>
            <div class="edu-school">${edu.institution}</div>
            <div class="edu-year">${edu.duration}${edu.cgpa ? ` | CGPA: ${edu.cgpa}` : ""}</div>
        </div>
    `).join("")

    const certificationsHtml = (data.certifications || []).length > 0 ? `
        <div class="sidebar-section">
            <div class="sidebar-heading">Certifications</div>
            ${data.certifications.map(cert => `<div class="cert-item">${cert}</div>`).join("")}
        </div>
    ` : ""

    const experienceHtml = (data.experience || []).map((exp, i) => `
        <div class="exp-block ${i % 2 === 1 ? "alt-bg" : ""}">
            <div class="exp-header">
                <div>
                    <div class="exp-title">${exp.role}</div>
                    <div class="exp-company">${exp.company}</div>
                </div>
                <div class="exp-duration">${exp.duration}</div>
            </div>
            <ul class="exp-bullets">
                ${(exp.points || []).map(p => `<li>${p}</li>`).join("")}
            </ul>
        </div>
    `).join("")

    const projectsHtml = (data.projects || []).map((proj, i) => `
        <div class="project-block ${i % 2 === 1 ? "alt-bg" : ""}">
            <div class="project-header">
                <div class="project-name">${proj.name}</div>
                ${proj.link ? `<a href="${proj.link}" class="project-link">View Project</a>` : 
                  proj.github ? `<a href="${proj.github}" class="project-link">GitHub</a>` : ""}
            </div>
            <div class="project-tech">${proj.tech}</div>
            <ul class="project-bullets">
                ${(proj.points || []).map(p => `<li>${p}</li>`).join("")}
            </ul>
        </div>
    `).join("")

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 210mm; min-height: 297mm; font-family: Arial, Helvetica, sans-serif; }
  body { display: flex; min-height: 297mm; }

  /* ── Sidebar ── */
  .sidebar {
    width: 32%; background: #1a2942; color: #fff;
    padding: 30px 18px; display: flex; flex-direction: column; gap: 0;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .candidate-name { font-family: Georgia, serif; font-size: 24px; font-weight: bold; color: #fff; line-height: 1.2; margin-bottom: 4px; }
  .candidate-title { font-size: 11px; color: #c9a84c; font-style: italic; margin-bottom: 18px; line-height: 1.4; }
  .sidebar-section { margin-bottom: 16px; }
  .sidebar-heading {
    font-size: 10px; font-weight: bold; text-transform: uppercase;
    color: #c9a84c; border-bottom: 1.5px solid #c9a84c;
    padding-bottom: 4px; margin-bottom: 8px; letter-spacing: 1px;
  }
  .contact-item { font-size: 9.5px; color: #cbd5e1; margin-bottom: 5px; line-height: 1.5; word-break: break-all; }
  .contact-item span { color: #94a3b8; font-size: 9px; }
  .contact-item a { color: #93c5fd; text-decoration: none; }
  .skill-category { margin-bottom: 7px; }
  .skill-category-name { font-size: 8.5px; color: #c9a84c; font-weight: bold; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px; }
  .skill-list { font-size: 9.5px; color: #cbd5e1; line-height: 1.6; }
  .edu-block { margin-bottom: 10px; }
  .edu-degree { font-size: 10px; color: #fff; font-weight: bold; margin-bottom: 2px; line-height: 1.4; }
  .edu-school { font-size: 9.5px; color: #94a3b8; font-style: italic; margin-bottom: 2px; }
  .edu-year { font-size: 9px; color: #64748b; }
  .cert-item { font-size: 9.5px; color: #cbd5e1; margin-bottom: 5px; padding-left: 10px; position: relative; line-height: 1.4; }
  .cert-item::before { content: "-"; position: absolute; left: 0; color: #c9a84c; font-weight: bold; }

  /* ── Main ── */
  .main { width: 68%; background: #fff; padding: 30px 24px; display: flex; flex-direction: column; }
  .main-section { margin-bottom: 16px; }
  .main-heading {
    font-size: 11.5px; font-weight: bold; text-transform: uppercase;
    color: #1a2942; border-bottom: 2px solid #1a2942;
    padding-bottom: 4px; margin-bottom: 10px; letter-spacing: 0.8px;
  }
  .summary-text { font-size: 10.5px; color: #374151; line-height: 1.7; }

  /* ── Experience ── */
  .exp-block { margin-bottom: 12px; padding: 8px 10px; border-radius: 4px; }
  .alt-bg { background: #f8fafc; }
  .exp-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
  .exp-title { font-size: 11px; font-weight: bold; color: #1a2942; }
  .exp-company { font-size: 10px; color: #0d9488; font-weight: 600; margin-top: 1px; }
  .exp-duration { font-size: 9px; color: #6b7280; font-style: italic; white-space: nowrap; margin-left: 8px; margin-top: 2px; }
  .exp-bullets { list-style: none; padding: 0; margin-top: 5px; }
  .exp-bullets li {
    font-size: 10px; color: #374151; margin-bottom: 4px;
    line-height: 1.6; position: relative; padding-left: 12px;
  }
  .exp-bullets li::before { content: "•"; position: absolute; left: 0; color: #c9a84c; font-weight: bold; }

  /* ── Projects ── */
  .project-block { margin-bottom: 12px; padding: 8px 10px; border-radius: 4px; }
  .project-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; }
  .project-name { font-size: 11px; font-weight: bold; color: #1a2942; }
  .project-link { font-size: 9px; color: #0d9488; text-decoration: none; font-weight: 600; border: 1px solid #0d9488; padding: 1px 6px; border-radius: 3px; }
  .project-tech { font-size: 9px; color: #7c3aed; font-style: italic; margin-bottom: 5px; }
  .project-bullets { list-style: none; padding: 0; }
  .project-bullets li {
    font-size: 10px; color: #374151; margin-bottom: 4px;
    line-height: 1.6; position: relative; padding-left: 12px;
  }
  .project-bullets li::before { content: "•"; position: absolute; left: 0; color: #c9a84c; }
</style>
</head>
<body>
<div class="sidebar">
  <div class="candidate-name">${data.name || "Candidate Name"}</div>
  <div class="candidate-title">${data.title || "Professional"}</div>

  <div class="sidebar-section">
    <div class="sidebar-heading">Contact</div>
    ${data.contact?.location ? `<div class="contact-item"><span>Location: </span>${data.contact.location}</div>` : ""}
    ${data.contact?.email ? `<div class="contact-item"><span>Email: </span><a href="mailto:${data.contact.email}">${data.contact.email}</a></div>` : ""}
    ${data.contact?.phone ? `<div class="contact-item"><span>Phone: </span>${data.contact.phone}</div>` : ""}
    ${data.contact?.linkedin ? `<div class="contact-item"><span>LinkedIn: </span><a href="https://${data.contact.linkedin.replace("https://", "")}">${data.contact.linkedin.replace("https://", "")}</a></div>` : ""}
    ${data.contact?.github ? `<div class="contact-item"><span>GitHub: </span><a href="https://${data.contact.github.replace("https://", "")}">${data.contact.github.replace("https://", "")}</a></div>` : ""}
  </div>

  <div class="sidebar-section">
    <div class="sidebar-heading">Skills</div>
    ${skillsHtml}
  </div>

  <div class="sidebar-section">
    <div class="sidebar-heading">Education</div>
    ${educationHtml}
  </div>

  ${certificationsHtml}
</div>

<div class="main">
  <div class="main-section">
    <div class="main-heading">Professional Summary</div>
    <p class="summary-text">${data.summary || ""}</p>
  </div>

  ${(data.experience || []).length > 0 ? `
  <div class="main-section">
    <div class="main-heading">Experience</div>
    ${experienceHtml}
  </div>` : ""}

  ${(data.projects || []).length > 0 ? `
  <div class="main-section">
    <div class="main-heading">Projects</div>
    ${projectsHtml}
  </div>` : ""}
</div>
</body>
</html>`
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const prompt = `You are an expert resume writer. Generate professional resume content for a candidate.

CANDIDATE INFORMATION:
Resume: ${resume}
Self Description: ${selfDescription}
Target Job Description: ${jobDescription}

Respond ONLY with valid JSON in EXACTLY this structure, no markdown, no extra text:
{
    "name": "Full Name extracted from resume",
    "title": "Professional title tailored to the job description",
    "contact": {
        "location": "City, State extracted from resume",
        "email": "email extracted from resume",
        "phone": "phone extracted from resume",
        "linkedin": "linkedin URL extracted from resume (without https://)",
        "github": "github URL extracted from resume (without https://)"
    },
    "summary": "3-4 sentence professional summary tailored to the job description using strong action verbs",
    "skills": {
        "Frontend": ["skill1", "skill2", "skill3"],
        "Backend": ["skill1", "skill2", "skill3"],
        "Database": ["skill1", "skill2"],
        "Tools": ["skill1", "skill2", "skill3"]
    },
    "experience": [
        {
            "role": "Job Title",
            "company": "Company Name",
            "duration": "Jan 2023 - Present",
            "points": [
                "Quantified achievement with numbers and impact, e.g. Reduced API response time by 40% through Redis caching",
                "Technical contribution using specific technologies mentioned in job description",
                "Another achievement showing leadership or scale",
                "Impact on business or team efficiency"
            ]
        }
    ],
    "projects": [
        {
            "name": "Project Name",
            "tech": "React, Node.js, MongoDB, JWT",
            "github": "github.com/username/project-repo",
            "link": "https://live-demo-url.com if available",
            "points": [
                "Detailed description of what the project does, its purpose, and target users",
                "Key technical features implemented: authentication, real-time updates, payment integration etc",
                "Performance metrics, user count, or business impact if available",
                "Challenges solved and technical decisions made"
            ]
        }
    ],
    "education": [
        {
            "degree": "Full degree name",
            "institution": "Institution Name, City",
            "duration": "2020 - 2024",
            "cgpa": "8.5 if available"
        }
    ],
    "certifications": ["Certification Name - Issuer (Year)", "Another Cert - Issuer (Year)"]
}

RULES:
- Extract ALL real data from resume and self description — do not make up information
- Extract real GitHub and LinkedIn URLs from the resume
- Each project must have at least 3-4 detailed bullet points explaining what it does, tech used, and impact
- Experience bullet points must be quantified with numbers, percentages, or specific metrics
- Tailor summary and skill ordering to match the job description keywords
- If no certifications exist, return empty array
- If no experience exists, return empty array`

    const raw = await groqComplete(groq, { prompt, maxTokens: 6000, models: PDF_MODELS })
    const data = JSON.parse(raw)
    const html = buildResumeHtml(data)
    const pdfBuffer = await generatePdfFromHtml(html)
    return pdfBuffer
}

module.exports = { generateInterviewReport, generateResumePdf }