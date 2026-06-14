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

    const prompt = `Generate a professional resume in HTML format for a candidate with the following details:
        Resume: ${resume}
        Self Description: ${selfDescription}
        Job Description: ${jobDescription}

        Respond ONLY with a valid JSON object with EXACTLY this field, no markdown:
        {
            "html": "complete HTML string of the resume"
        }

        DESIGN REQUIREMENTS:
        - Use a modern two-column layout: left sidebar (30% width) with contact info, skills, education on a dark colored background with white text; right side (70% width) with summary, experience, projects on white background
        - Use a professional color scheme - dark navy (#1a2942) sidebar, accent color gold (#c9a84c) or teal for section headings
        - Use 'Georgia' or 'Times New Roman' for the name/headings, 'Arial' or 'Helvetica' for body text
        - Section headings should have a bottom border or accent color underline
        - Font sizes: name 26-28px, section headings 14-16px, body text 10-11px
        - Use proper spacing, margins, and line-height for readability
        - Use CSS Flexbox for the two-column layout with body { display: flex }
        - All CSS must be inside a <style> tag in the <head>
        - Make sure content fits within A4 page size (210mm x 297mm), avoid overflow

        CONTENT REQUIREMENTS:
        - Tailored for the given job description
        - ATS friendly - use standard section headings (Professional Summary, Experience, Education, Skills, Projects)
        - Strong action verbs and quantified achievements (numbers, percentages)
        - 1 to 2 pages maximum
        - Should not sound AI generated - natural professional tone
        - Highlight relevant skills and experience that match the job description

        Use this exact structure as reference:
        <html>
        <head>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; font-family: Arial, sans-serif; }
            body { display: flex; width: 210mm; min-height: 297mm; }
            .sidebar { width: 30%; background: #1a2942; color: white; padding: 30px 20px; }
            .main { width: 70%; padding: 30px; }
            .sidebar h1 { font-size: 26px; color: white; font-family: Georgia, serif; margin-bottom: 5px; }
            .sidebar h2 { font-size: 13px; border-bottom: 2px solid #c9a84c; padding-bottom: 5px; margin: 18px 0 8px; color: #c9a84c; text-transform: uppercase; }
            .main h2 { font-size: 15px; color: #1a2942; border-bottom: 2px solid #1a2942; padding-bottom: 5px; margin: 18px 0 8px; text-transform: uppercase; }
            ul { padding-left: 16px; }
            li { font-size: 10.5px; margin-bottom: 4px; line-height: 1.5; }
            .job-title { font-weight: bold; font-size: 12px; margin-top: 10px; }
            .job-meta { font-size: 10px; color: #666; margin-bottom: 5px; font-style: italic; }
            .summary { font-size: 11px; line-height: 1.6; }
            .contact-info p { font-size: 10px; margin-bottom: 4px; word-break: break-all; }
          </style>
        </head>
        <body>
          <div class="sidebar">
            <h1>Candidate Name</h1>
            <div class="contact-info">
              <p>Location</p>
              <p>Email</p>
              <p>Phone</p>
              <p>LinkedIn</p>
              <p>GitHub</p>
            </div>
            <h2>Skills</h2>
            <ul>
              <li>Skill 1</li>
            </ul>
            <h2>Education</h2>
            <p class="job-title">Degree</p>
            <p class="job-meta">University, Year</p>
          </div>
          <div class="main">
            <h2>Professional Summary</h2>
            <p class="summary">Summary text...</p>
            <h2>Experience</h2>
            <p class="job-title">Role, Company</p>
            <p class="job-meta">Duration</p>
            <ul>
              <li>Achievement with numbers</li>
            </ul>
            <h2>Projects</h2>
            <p class="job-title">Project Name</p>
            <ul>
              <li>Project description</li>
            </ul>
          </div>
        </body>
        </html>`

    const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 4096,
    })

    const raw = response.choices[0].message.content.trim()
    const jsonContent = JSON.parse(raw)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)
    return pdfBuffer
}

module.exports = { generateInterviewReport, generateResumePdf }