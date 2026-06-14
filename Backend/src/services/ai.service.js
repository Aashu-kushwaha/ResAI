const Groq = require("groq-sdk")
const puppeteer = require("puppeteer-core")
const chromium = require("@sparticuz/chromium")

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

    const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 4096,
    })

    const raw = response.choices[0].message.content.trim()
    return JSON.parse(raw)
}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
    })

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

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const prompt = `You are an expert resume writer and ATS optimization specialist. Generate a complete, professional, full-page resume in HTML format.

CANDIDATE INFORMATION:
Resume/Experience: ${resume}
Self Description: ${selfDescription}
Target Job Description: ${jobDescription}

Respond ONLY with a valid JSON object with EXACTLY this field, no markdown, no extra text:
{
    "html": "complete self-contained HTML string of the resume"
}

STRICT DESIGN REQUIREMENTS:
- Two-column layout: left sidebar (32% width, background #1a2942, white text), right main (68% width, white background)
- The resume MUST fill a complete A4 page (210mm x 297mm) — use padding, line-height, and spacing to ensure full coverage
- Left sidebar background color MUST print (use -webkit-print-color-adjust: exact)
- Name: 26px, Georgia serif, white, bold
- Job title under name: 12px, gold (#c9a84c), italic
- Section headings in sidebar: 11px, uppercase, gold (#c9a84c), bold, with gold bottom border
- Section headings in main: 13px, uppercase, #1a2942, bold, with #1a2942 bottom border
- Body text: 10.5px Arial, line-height 1.6
- Use label prefixes (Location:, Email:, Phone:, LinkedIn:, GitHub:) for contact items
- All links must be clickable anchor tags with color inherited and no underline in sidebar, teal (#0d9488) in main
- Use bullet points for all list items
- Subtle alternating background (#f8fafc) on every other experience/project block

CONTENT REQUIREMENTS:
- Extract ALL information from the resume and self description — do not omit anything
- Extract GitHub URL, LinkedIn URL from the resume — include them as clickable links in sidebar
- For each project, include a View Project link if a URL is available, or a GitHub link
- Summary: 3-4 sentences, tailored to the job description, strong opening
- Experience: for each role include company, title, dates, location, and 3-5 bullet points with quantified achievements (use numbers, %, time saved)
- Projects: for each project include name, tech stack used, 2-3 bullet points, and a clickable link
- Skills: categorize into Frontend, Backend, Database, Tools, Languages etc.
- Education: degree, institution, year, CGPA/percentage if available
- Add Certifications section if any mentioned
- Content must sound natural and human-written, not AI generated
- Tailor ALL content specifically to match the job description keywords

FULL HTML TEMPLATE STRUCTURE (fill with real candidate data):
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 210mm; min-height: 297mm; font-family: Arial, Helvetica, sans-serif; }
  body { display: flex; min-height: 297mm; }
  .sidebar { width: 32%; background: #1a2942; color: #fff; padding: 28px 18px; display: flex; flex-direction: column; gap: 2px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .main { width: 68%; background: #fff; padding: 28px 22px; display: flex; flex-direction: column; gap: 2px; }
  .candidate-name { font-family: Georgia, serif; font-size: 26px; font-weight: bold; color: #fff; line-height: 1.2; margin-bottom: 3px; }
  .candidate-title { font-size: 11.5px; color: #c9a84c; font-style: italic; margin-bottom: 14px; }
  .sidebar-section { margin-bottom: 14px; }
  .sidebar-heading { font-size: 10.5px; font-weight: bold; text-transform: uppercase; color: #c9a84c; border-bottom: 1.5px solid #c9a84c; padding-bottom: 3px; margin-bottom: 8px; letter-spacing: 0.8px; }
  .contact-item { font-size: 9.5px; color: #cbd5e1; margin-bottom: 5px; line-height: 1.4; word-break: break-all; }
  .contact-item a { color: #93c5fd; text-decoration: none; }
  .skill-category { margin-bottom: 6px; }
  .skill-category-name { font-size: 9px; color: #c9a84c; font-weight: bold; text-transform: uppercase; margin-bottom: 2px; }
  .skill-list { font-size: 9.5px; color: #cbd5e1; line-height: 1.5; }
  .edu-degree { font-size: 10px; color: #fff; font-weight: bold; margin-bottom: 1px; }
  .edu-school { font-size: 9.5px; color: #94a3b8; font-style: italic; margin-bottom: 1px; }
  .edu-year { font-size: 9px; color: #64748b; }
  .main-section { margin-bottom: 14px; }
  .main-heading { font-size: 12px; font-weight: bold; text-transform: uppercase; color: #1a2942; border-bottom: 2px solid #1a2942; padding-bottom: 3px; margin-bottom: 10px; letter-spacing: 0.5px; }
  .summary-text { font-size: 10.5px; color: #374151; line-height: 1.65; }
  .exp-block { margin-bottom: 10px; padding: 7px 8px; border-radius: 4px; }
  .exp-block:nth-child(even) { background: #f8fafc; }
  .exp-title { font-size: 11px; font-weight: bold; color: #1a2942; }
  .exp-company { font-size: 10px; color: #0d9488; font-weight: 600; }
  .exp-meta { font-size: 9.5px; color: #6b7280; font-style: italic; margin-bottom: 5px; }
  .exp-bullets { padding-left: 12px; }
  .exp-bullets li { font-size: 10px; color: #374151; margin-bottom: 3px; line-height: 1.55; list-style: none; position: relative; padding-left: 10px; }
  .exp-bullets li::before { content: "•"; position: absolute; left: 0; color: #c9a84c; font-weight: bold; }
  .project-block { margin-bottom: 10px; padding: 7px 8px; border-radius: 4px; }
  .project-block:nth-child(even) { background: #f8fafc; }
  .project-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; }
  .project-name { font-size: 11px; font-weight: bold; color: #1a2942; }
  .project-link { font-size: 9px; color: #0d9488; text-decoration: none; font-weight: 600; }
  .project-tech { font-size: 9px; color: #7c3aed; font-style: italic; margin-bottom: 4px; }
  .project-bullets { padding-left: 12px; }
  .project-bullets li { font-size: 10px; color: #374151; margin-bottom: 3px; line-height: 1.55; list-style: none; position: relative; padding-left: 10px; }
  .project-bullets li::before { content: "•"; position: absolute; left: 0; color: #c9a84c; }
  .cert-item { font-size: 10px; color: #cbd5e1; margin-bottom: 4px; padding-left: 10px; position: relative; }
  .cert-item::before { content: "-"; position: absolute; left: 0; color: #c9a84c; }
</style>
</head>
<body>
<div class="sidebar">
  <div class="candidate-name">FULL NAME HERE</div>
  <div class="candidate-title">Target Job Title Here</div>
  <div class="sidebar-section">
    <div class="sidebar-heading">Contact</div>
    <div class="contact-item">Location: City, Country</div>
    <div class="contact-item">Email: <a href="mailto:email@email.com">email@email.com</a></div>
    <div class="contact-item">Phone: +00 0000000000</div>
    <div class="contact-item">LinkedIn: <a href="https://linkedin.com/in/username">linkedin.com/in/username</a></div>
    <div class="contact-item">GitHub: <a href="https://github.com/username">github.com/username</a></div>
  </div>
  <div class="sidebar-section">
    <div class="sidebar-heading">Skills</div>
    <div class="skill-category">
      <div class="skill-category-name">Backend</div>
      <div class="skill-list">Node.js, Express.js, REST APIs</div>
    </div>
    <div class="skill-category">
      <div class="skill-category-name">Frontend</div>
      <div class="skill-list">React, HTML5, CSS3, SCSS</div>
    </div>
    <div class="skill-category">
      <div class="skill-category-name">Database</div>
      <div class="skill-list">MongoDB, MySQL, Redis</div>
    </div>
    <div class="skill-category">
      <div class="skill-category-name">Tools</div>
      <div class="skill-list">Git, Docker, Postman, VS Code</div>
    </div>
  </div>
  <div class="sidebar-section">
    <div class="sidebar-heading">Education</div>
    <div class="edu-degree">Bachelor of Technology</div>
    <div class="edu-school">University Name</div>
    <div class="edu-year">2020 - 2024 | CGPA: 8.5</div>
  </div>
  <div class="sidebar-section">
    <div class="sidebar-heading">Certifications</div>
    <div class="cert-item">Certification Name - Issuer (Year)</div>
  </div>
</div>
<div class="main">
  <div class="main-section">
    <div class="main-heading">Professional Summary</div>
    <p class="summary-text">3-4 sentence tailored summary here...</p>
  </div>
  <div class="main-section">
    <div class="main-heading">Experience</div>
    <div class="exp-block">
      <div class="exp-title">Job Title</div>
      <div class="exp-company">Company Name</div>
      <div class="exp-meta">Jan 2023 - Present | Location</div>
      <ul class="exp-bullets">
        <li>Quantified achievement with numbers and impact</li>
        <li>Another achievement with percentage improvement or time saved</li>
        <li>Technical contribution using relevant technologies</li>
      </ul>
    </div>
  </div>
  <div class="main-section">
    <div class="main-heading">Projects</div>
    <div class="project-block">
      <div class="project-header">
        <div class="project-name">Project Name</div>
        <a href="https://github.com/username/project" class="project-link">View on GitHub</a>
      </div>
      <div class="project-tech">Tech Stack: Node.js, React, MongoDB</div>
      <ul class="project-bullets">
        <li>What the project does and its impact</li>
        <li>Key technical feature or challenge solved</li>
      </ul>
    </div>
  </div>
</div>
</body>
</html>

IMPORTANT RULES:
- Replace ALL placeholder text with REAL candidate data extracted from the resume and self description
- Use label prefixes (Location:, Email:, Phone:, LinkedIn:, GitHub:) for contact items instead of any symbols or emoji
- Include GitHub and LinkedIn as real clickable links extracted from the resume
- Every project must have a real GitHub or live link if available
- The resume must look complete and professional — fill all sections fully
- Do NOT leave any placeholder text like Candidate Name Here or Summary text
- Generate at minimum 3 projects and all work experience entries
- Make the resume fill the complete A4 page with proper spacing
- Do NOT use any emoji or special unicode symbols anywhere in the resume`

    const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 8000,
    })

    const raw = response.choices[0].message.content.trim()
    const jsonContent = JSON.parse(raw)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)
    return pdfBuffer
}

module.exports = { generateInterviewReport, generateResumePdf }