import { useAuth } from "../hooks/useAuth";
import React from "react";
import { Navigate } from "react-router";
import Loader from "../../../components/Loader.jsx";


const Protected = ({ children }) => {
  const { loading, user } = useAuth();

  if (loading) return <Loader fullscreen text="Checking authentication..." />


  if (!user) {
    return <Navigate to="/login" replace />  
  }

  return children
};

export default Protected