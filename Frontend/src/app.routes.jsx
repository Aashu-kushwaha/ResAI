import { createBrowserRouter } from "react-router";
import Login from "./features/auth/pages/Login.jsx";
import Register from "./features/auth/pages/Register.jsx";
import Protected from "./features/auth/components/protected.jsx";
import Home from "./features/interview/pages/home.jsx"
import Interview from "./features/interview/pages/interview.jsx";
import { InterviewProvider } from "./features/interview/interview.context.jsx";
import ForgotPassword from "./features/auth/pages/ForgotPassword.jsx"


export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/register",
    element: <Register />
  },
  {
    path: "/",
    element:<Protected>
    <InterviewProvider>
      <Home />
    </InterviewProvider>
  </Protected>
  },
  {
  path: "/interview/:interviewId",
  element: <Protected><InterviewProvider><Interview/> </InterviewProvider></Protected>
  }
  ,
  { 
    path: "/forgot-password", 
    element: <ForgotPassword /> 
  }

]);