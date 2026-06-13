import axios from "axios"
// Repeated task manage by creating instance of repeated code.
const api = axios.create({
  baseURL: "",
  withCredentials: true//Server have enabled to acess the data from cookies and set the data in cookie
})

export async function register({fullname,username, email,password,otp}) {
  try {
    const response = await api.post("/api/auth/register", {
     fullname, username, email, password, otp
    })
    return response.data
  }
  catch (err) {
    console.log(err)
  }
}
// export async function register({fullname,username,email,password,otp}) {
//   try{
//     const response = await axios.post("http://localhost:3000/api/auth/register",{
//       username,email,password,otp//These data is sending from frontend in backend
//     },{withCredentials:true})//Axios cannot read data from cookie that'swhy i have to write this line by which token can be read.
//     return response.data
//   }
//   catch(err){
//     console.log(err)
//   }
// }
export async function login({ email, password }) {
  try {
    const response = await api.post("/api/auth/login", {
      email, password//These data is sending from frontend in backend
    }, { withCredentials: true })
    return response.data
  }
  catch (err) {
    console.log(err)
  }
}
export async function logout() {
  try {
    const response = await api.get("/api/auth/logout", {
    }, { withCredentials: true })
    return response.data
  }
  catch (err) {
    console.log(err)
  }
}
export async function getme() {
  try {
    const response = await api.get("/api/auth/get-me", {
    }, { withCredentials: true })
    return response.data
  }
  catch (err) {
    console.log(err)
  }
}

export async function forgotPasswordSendOTP({ email }) {
  try {
      const response = await api.post("/api/auth/forgot-password/send-otp", { email })
      return response.data
  } catch (err) {
      console.log(err)
      throw err
  }
}

export async function forgotPasswordReset({ email, otp, newPassword }) {
  try {
      const response = await api.post("/api/auth/forgot-password/reset", { email, otp, newPassword })
      return response.data
  } catch (err) {
      console.log(err)
      throw err
  }
}