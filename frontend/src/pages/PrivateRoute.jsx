import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!window.localStorage.getItem("user")) {
      toast.error("Please sign in first");
      navigate("/auth");
    }
  }, []);
  return children;
};

export default PrivateRoute;
