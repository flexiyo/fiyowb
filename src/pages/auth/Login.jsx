import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { useFormik } from "formik";
import * as Yup from "yup";
import UserContext from "../../context/items/UserContext";
import { LOGIN_USER } from "../../graphql/fiyouser/auth.ops.js";

const Login = () => {
  const { isUserAuthenticated, saveUserInfo } = useContext(UserContext);
  const [alertText, setAlertText] = useState("");
  const [isForgotPasswordClicked, setIsForgotPasswordClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const LoginSchema = Yup.object().shape({
    username: Yup.string().required("Email or Username is required"),
    password: Yup.string().required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: LoginSchema,
    onSubmit: (values) => {
      handleLoginUser(values);
    },
  });

  useEffect(() => {
    if (isUserAuthenticated) {
      navigate("/", { state: { from: "/auth/login" }, replace: true });
    }
  }, [isUserAuthenticated, navigate]);

  const [loginUser] = useMutation(LOGIN_USER);

  const handleLoginUser = async (values) => {
    setIsLoading(true);
    setAlertText("");
    try {
      const device_name = navigator.userAgent.split(" ")[0] || "Unknown";

      const { data } = await loginUser({
        variables: { input: { ...values, device_name } },
      });

      const result = data.loginUser;

      if (!result.status.success) {
        setAlertText(result.status.message);
        return;
      }

      saveUserInfo(result);
      setIsLoading(false);

      navigate("/", { state: { from: "/auth/login" }, replace: true });
    } catch (error) {
      console.error("Login Error:", error);
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
            src="https://cdnfiyo.github.io/img/logos/flexiyo.png"
            alt="Flexiyo Logo"
            className="w-24 h-24 lg:w-28 lg:h-28 rounded-full mb-6 border-4 border-gray-200"
          />
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-center">
            Welcome to Flexiyo
          </h1>
          <p className="mt-4 text-lg lg:text-xl opacity-90 text-center max-w-md">
            Discover a world of connection, creativity, and joy. Sign in to
            begin!
          </p>
        </div>

        {/* Right Section - Form */}
        <div className="w-full lg:w-1/2 p-8 flex flex-col justify-center bg-body-bg dark:bg-body-bg-dark lg:bg-secondary-bg dark:lg:bg-secondary-bg-dark">
          <h2 className="text-2xl lg:text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-2 text-center">
            Welcome Back!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
            Enter your credentials to continue
          </p>

          {alertText && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-xl border-l-4 border-red-500">
              {alertText}
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-6">
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

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <button
                type="button"
                onClick={() => setIsForgotPasswordClicked(true)}
                className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm cursor-pointer"
              >
                Forgot Password?
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-lg lg:rounded-xl hover:bg-indigo-700 disabled:bg-indigo-400 transition-all duration-200 font-medium cursor-pointer"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-gray-600 dark:text-gray-400">
            <p>
              Don't have an account?{" "}
              <Link
                to="/auth/signup"
                className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Sign Up
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

export default Login;
