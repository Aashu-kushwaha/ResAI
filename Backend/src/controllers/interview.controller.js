const { extractText } = require("unpdf")
const mammoth = require("mammoth")
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service.js")
const interviewReportModel = require("../models/interviewReport.model.js")

async function extractResumeText(file) {
    const ext = file.originalname.split(".").pop().toLowerCase()
    if (ext === "pdf") {
        const uint8Array = new Uint8Array(file.buffer)
        const { text } = await extractText(uint8Array, { mergePages: true })
        return text
    } else if (ext === "docx" || ext === "doc") {
        const result = await mammoth.extractRawText({ buffer: file.buffer })
        return result.value
    }
    return ""
}

async function generateInterviewReportController(req, res) {
    try {
        let resumeText = ""

        if (req.file) {
            resumeText = await extractResumeText(req.file)
        }

        const { selfDescription, jobDescription } = req.body

        if (!resumeText && !selfDescription) {
            return res.status(400).json({ message: "Either a resume or self description is required." })
        }

        const interviewReportByAI = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        })

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...interviewReportByAI
        })

        res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        })
    } catch (error) {
        console.error(error)

        if (error?.status === 429) {
            return res.status(429).json({
                success: false,
                message: "AI service is temporarily rate-limited. Please try again in a few minutes."
            })
        }

        return res.status(500).json({
            success: false,
            message: "Failed to generate interview report. Please try again."
        })
    }
}

async function getInterviewReportController(req, res) {
    try {
        const { interviewId } = req.params
        const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })
        if (!interviewReport) {
            return res.status(404).json({ message: "Interview report not found." })
        }
        res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ success: false, message: "Failed to fetch interview report." })
    }
}

async function getAllInterviewController(req, res) {
    try {
        const interviewReports = await interviewReportModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

        res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ success: false, message: "Failed to fetch interview reports." })
    }
}

async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params
        const interviewReport = await interviewReportModel.findById(interviewReportId)

        if (!interviewReport) {
            return res.status(400).json({ message: "Interview report not found." })
        }

        const { resume, jobDescription, selfDescription } = interviewReport
        const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        })
        res.send(pdfBuffer)

    } catch (error) {
        console.error(error)

        if (error?.status === 429) {
            return res.status(429).json({
                success: false,
                message: "AI service is temporarily rate-limited. Please try again in a few minutes."
            })
        }

        return res.status(500).json({
            success: false,
            message: "Failed to generate resume PDF. Please try again."
        })
    }
}

module.exports = {
    generateInterviewReportController,
    getInterviewReportController,
    getAllInterviewController,
    generateResumePdfController
}