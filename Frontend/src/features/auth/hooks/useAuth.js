import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getme } from "../services/auth.api.js"

export const useAuth = () => {
  const context = useContext(AuthContext)
  const { user, setUser, loading, setLoading } = context

  //When user register or login then we have to show login page that's why i use this for buffering.(Because API will take time)
  const handleLogin = async ({ email, password }) => {
    setLoading(true)
    try {
      const data = await login({ email, password })
      if (data && data.user) {
        setUser(data.user) //In backend file user data have sent that's why i set here
        return true // login success
      }
      return false // login failed
    } catch (err) {
      return false // login failed
    } finally {
      setLoading(false)//After data f
    }
  }

  const handleRegister = async ({ fullname, username, email, password, otp }) => {
    setLoading(true)
    try {
      const data = await register({ fullname, username, email, password, otp })
      setUser(data.user) //In backend file(in backend file in controller of register sendind data of user after successfully register) user data have sent that's why i set here user's data
      return true // register success
    } catch {
      return false // register failed
    } finally {
      setLoading(false)
    }
  }

  const handlelogout = async () => {
    setLoading(true)
    try {
      await logout()
      setUser(null) //In backend file user data have sent that's why i set here
    } catch {

    } finally {
      setLoading(false)
    }
  }

  return { user, loading, handleLogin, handleRegister, handlelogout }
}