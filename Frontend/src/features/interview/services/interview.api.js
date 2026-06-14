import axios from "axios"
import Interview from "../pages/interview"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true
})

export const generateInterviewReport= async({jobDescription,selfDescription,resumeFile})=>{
//  Send data from frontend to backend always by using formData
const formData = new FormData()
formData.append("jobDescription",jobDescription)
formData.append("selfDescription",selfDescription)
formData.append("resume",resumeFile)

try{
const response = await api.post("/api/interview",formData,{headers:{
"Content-Type":"multipart/form-data"}})
return response.data
}
catch(err){
  throw err
}
}

export const getInterviewReportById = async (interviewId)=>{
  const response = await api.get(`/api/interview/report/${interviewId}`)
  return response.data
}

export const getAllInterviewReports = async ()=>{
  const response = await api.get("/api/interview")
  return response.data
}

export const generateResumePdf = async (interviewReportId) => {
  const response = await api.post(`/api/interview/resume/${interviewReportId}`, null, {
      responseType: "blob"
  })
  return response.data
}