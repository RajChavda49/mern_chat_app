import React, { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { postUrl } from "../baseurl";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Signin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const signinschema = yup.object().shape({
    email: yup.string().email().required("email is required").trim(),
    password: yup.string().required("password is required").trim(),
  });

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: yupResolver(signinschema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await postUrl("/user/sign-in", {
        data: data,
      });
      setLoading(false);
      toast.success(response?.data?.message);

      window.localStorage.setItem("user", JSON.stringify(response.data?.data));
      navigate("/");
      return response?.data;
    } catch (error) {
      setLoading(false);
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 w-full">
      <input
        type="email"
        placeholder="Enter your email"
        className=" w-full p-2 outline-none bg-white focus:ring-2 ring-green-400 rounded-lg"
        {...register("email")}
      />
      <span className="text-red-500 font-semibold capitalize">
        {errors?.email?.message}
      </span>
      <div className="w-full relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          className=" w-full p-2 outline-none bg-white focus:ring-2 ring-green-400 rounded-lg"
          {...register("password")}
        />

        <span
          className="absolute top-1 right-3 cursor-pointer bg-gray-200 rounded-lg p-1"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? "Hide" : "Show"}
        </span>
      </div>
      <span className="text-red-500 font-semibold capitalize">
        {errors?.password?.message}
      </span>
      <button
        type="submit"
        className="uppercase w-full bg-blue-500 rounded-lg p-2 text-white font-semibold transition active:scale-95 hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Logging in..." : "login"}
      </button>
    </form>
  );
};

export default Signin;
