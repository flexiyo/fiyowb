import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { useFormik } from "formik";
import * as Yup from "yup";
import UserContext from "../../context/items/UserContext";
import { REGISTER_USER } from "../../graphql/fiyouser/auth.ops.js";
import flexiyoLogo from "../../assets/images/flexiyo.png";

const Signup = () => {
  document.title = "Flexiyo";

  const { isUserAuthenticated, saveUserInfo } = useContext(UserContext);
  const [alertText, setAlertText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    if (isUserAuthenticated) {
      navigate("/", { state: { from: "/auth/signup" }, replace: true });
    }
  }, [isUserAuthenticated, navigate]);

  const Step1Schema = Yup.object().shape({
    full_name: Yup.string().required("Full Name is required"),
    username: Yup.string().required("Username is required"),
  });

  const Step2Schema = Yup.object().shape({
    full_name: Yup.string().required("Full Name is required"),
    username: Yup.string().required("Username is required"),
    account_type: Yup.string()
      .required("Account Type is required")
      .oneOf(["personal", "creator", "business"], "Invalid account type"),
    dob: Yup.date()
      .required("Date of Birth is required")
      .max(new Date(), "Date of Birth cannot be in the future"),
  });

  const Step3Schema = Yup.object().shape({
    full_name: Yup.string().required("Full Name is required"),
    username: Yup.string().required("Username is required"),
    account_type: Yup.string()
      .required("Account Type is required")
      .oneOf(["personal", "creator", "business"], "Invalid account type"),
    dob: Yup.date()
      .required("Date of Birth is required")
      .max(new Date(), "Date of Birth cannot be in the future"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirm_password: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      full_name: "",
      username: "",
      account_type: "",
      dob: "",
      password: "",
      confirm_password: "",
    },
    validationSchema:
      step === 1 ? Step1Schema : step === 2 ? Step2Schema : Step3Schema,
    onSubmit: (values) => {
      if (step === 1) {
        setStep(2);
      } else if (step === 2) {
        setStep(3);
      } else {
        delete values.confirm_password;
        handleRegisterUser(values);
      }
    },
  });

  const [registerUser] = useMutation(REGISTER_USER);

  const handleRegisterUser = async (values) => {
    setIsLoading(true);
    setAlertText("");
    try {
      const device_name = navigator.userAgent.split(" ")[0] || "Unknown";

      const { data } = await registerUser({
        variables: {
          input: {
            ...values,
            device_name,
          },
        },
      });

      const result = data.registerUser;

      if (!result.status.success) {
        setAlertText(result.status.message);
        return;
      }

      saveUserInfo(result);
      navigate("/", { state: { from: "/auth/signup" }, replace: true });
    } catch (error) {
      console.error("Signup Error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      setAlertText(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-body-bg dark:bg-body-bg-dark from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-start lg:items-center justify-center p-4">
      <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-8 lg:gap-0 bg-white dark:bg-gray-800 lg:rounded-2xl overflow-hidden">
        {/* Left Section - Hidden on md and below */}
        <div className="hidden lg:flex lg:w-1/2 p-8 lg:p-12 bg-gradient-to-br from-white via-pink-200 to-blue-300 text-gray-800 flex-col justify-center items-center">
          <img
            src={flexiyoLogo}
            alt="Flexiyo Logo"
            className="w-24 h-24 lg:w-28 lg:h-28 rounded-full mb-6 border-4 border-gray-200"
          />
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-center">
            Welcome to Flexiyo
          </h1>
          <p className="mt-4 text-lg lg:text-xl opacity-90 text-center max-w-md">
            Discover a world of connection, creativity, and joy. Sign up to
            begin!
          </p>
        </div>

        {/* Right Section - Form */}
        <div className="w-full lg:w-1/2 p-8 flex flex-col justify-center bg-body-bg dark:bg-body-bg-dark lg:bg-secondary-bg dark:lg:bg-secondary-bg-dark">
          <h2 className="text-2xl lg:text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-2 text-center">
            Create Account
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
            {step === 1
              ? "Enter your basic details"
              : step === 2
              ? "Provide your date of birth and account type"
              : "Set your password"}
          </p>

          {alertText && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-xl border-l-4 border-red-500">
              {alertText}
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {step === 1 && (
              <>
                <div>
                  <input
                    type="text"
                    name="full_name"
                    placeholder="Full Name"
                    className={`w-full p-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-2 ${
                      formik.touched.full_name && formik.errors.full_name
                        ? "border-red-500"
                        : "border-gray-200 dark:border-gray-600"
                    } focus:outline-none focus:border-indigo-500 transition-all rounded-lg lg:rounded-xl`}
                    value={formik.values.full_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.full_name && formik.errors.full_name && (
                    <p className="mt-1 text-sm text-red-500">
                      {formik.errors.full_name}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    className={`w-full p-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-2 ${
                      formik.touched.username && formik.errors.username
                        ? "border-red-500"
                        : "border-gray-200 dark:border-gray-600"
                    } focus:outline-none focus:border-indigo-500 transition-all rounded-lg lg:rounded-xl`}
                    value={formik.values.username}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.username && formik.errors.username && (
                    <p className="mt-1 text-sm text-red-500">
                      {formik.errors.username}
                    </p>
                  )}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <select
                    name="account_type"
                    className={`w-full p-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-2 ${
                      formik.touched.account_type && formik.errors.account_type
                        ? "border-red-500"
                        : "border-gray-200 dark:border-gray-600"
                    } focus:outline-none focus:border-indigo-500 transition-all rounded-lg lg:rounded-xl`}
                    value={formik.values.account_type}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <option value="" disabled>
                      Select Account Type
                    </option>
                    <option value="personal">Personal</option>
                    <option value="creator">Creator</option>
                    <option value="business">Business</option>
                  </select>
                  {formik.touched.account_type &&
                    formik.errors.account_type && (
                      <p className="mt-1 text-sm text-red-500">
                        {formik.errors.account_type}
                      </p>
                    )}
                </div>

                <div>
                  <input
                    type="date"
                    name="dob"
                    placeholder="Date of Birth"
                    className={`w-full p-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-2 ${
                      formik.touched.dob && formik.errors.dob
                        ? "border-red-500"
                        : "border-gray-200 dark:border-gray-600"
                    } focus:outline-none focus:border-indigo-500 transition-all rounded-lg lg:rounded-xl`}
                    value={formik.values.dob}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.dob && formik.errors.dob && (
                    <p className="mt-1 text-sm text-red-500">
                      {formik.errors.dob}
                    </p>
                  )}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className={`w-full p-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-2 ${
                      formik.touched.password && formik.errors.password
                        ? "border-red-500"
                        : "border-gray-200 dark:border-gray-600"
                    } focus:outline-none focus:border-indigo-500 transition-all rounded-lg lg:rounded-xl`}
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.password && formik.errors.password && (
                    <p className="mt-1 text-sm text-red-500">
                      {formik.errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="password"
                    name="confirm_password"
                    placeholder="Confirm Password"
                    className={`w-full p-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-2 ${
                      formik.touched.confirm_password &&
                      formik.errors.confirm_password
                        ? "border-red-500"
                        : "border-gray-200 dark:border-gray-600"
                    } focus:outline-none focus:border-indigo-500 transition-all rounded-lg lg:rounded-xl`}
                    value={formik.values.confirm_password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.confirm_password &&
                    formik.errors.confirm_password && (
                      <p className="mt-1 text-sm text-red-500">
                        {formik.errors.confirm_password}
                      </p>
                    )}
                </div>
              </>
            )}

            <div className="flex flex-col sm:flex-row justify-end items-center gap-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="w-full sm:w-auto px-6 py-3 bg-gray-600 text-white rounded-lg lg:rounded-xl hover:bg-gray-700 transition-all duration-200 font-medium cursor-pointer"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-lg lg:rounded-xl hover:bg-indigo-700 disabled:bg-indigo-400 transition-all duration-200 font-medium cursor-pointer"
              >
                {isLoading
                  ? "Creating Account..."
                  : step === 1 || step === 2
                  ? "Next"
                  : "Sign Up"}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-gray-600 dark:text-gray-400">
            <p>
              Already have an account?{" "}
              <Link
                to="/auth/login"
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Login
              </Link>
            </p>
            <p
              onClick={() => navigate("/music")}
              className="mt-4 text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Enjoy Music Instead
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Signup;
