import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import { useDispatch, useSelector } from "react-redux";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/userSlice.js";

export default function SignIn() {
  const [formData, setFormData] = useState({});
  // const [errorMessage, setErrorMessage] = useState(null);
  // const [loading, setLoading] = useState(false);

  const { loading, error: errorMessage } = useSelector((state) => state.user);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.password || !formData.email) {
      dispatch(signInFailure("Please fill out all fields"));
      return;
    }

    try {
      // setLoading(true);
      // setErrorMessage(null);

      dispatch(signInStart());
      const res = await fetch("/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success === false) {
        dispatch(signInFailure(data.message));
      }
      

      if (res.ok) {
        dispatch(signInSuccess(data));
        
        navigate("/");
      }
    } catch (err) {
      dispatch(signInFailure(err.message));
    }
  };

  useEffect(() => {
    let timeoutId;
    if (errorMessage) {
      timeoutId = setTimeout(() => {
        dispatch(signInFailure(null));
      }, 2000);
    }
    return () => clearTimeout(timeoutId);
  }, [errorMessage, dispatch]);
  return (
    <div className="min-h-screen">
      <div className="flex p-3 max-w-fit gap-8 mx-auto flex-col md:flex-row md:gap-20 pt-52">
        {/* left part */}
        <div className="flex-1 md:mt-24 max-w-lg">
          <Link to={"/"} className="font-bold dark:text-white text-4xl">
            <span className=" text-[rgb(151,151,162)]">Read</span>
            Space
          </Link>
          <p className="text-sm mt-5">
            This is a demo project. You can sign in with email{" "}
            <strong className=" text-green-500">user@gmail.com</strong> and
            password <strong className=" text-green-500">1234 </strong>
            or with Google
          </p>
        </div>

        {/* RIGHT PART */}
        <div className="flex-1">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <Label value="Your Email"></Label>
              <TextInput
                type="email"
                placeholder="name@company.com"
                id="email"
                onChange={handleChange}
              />
            </div>
            <div>
              <Label value="Your Password"></Label>
              <TextInput
                type="password"
                placeholder="Password"
                id="password"
                onChange={handleChange}
              />
            </div>
            <Button
              gradientDuoTone="purpleToBlue"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span className="pl-3">Loading...</span>
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            <div className="flex items-center justify-center">
              <div className="border-t border-gray-400 flex-grow"></div>
              <span className="mx-4 text-gray-500">or</span>
              <div className="border-t border-gray-400 flex-grow"></div>
            </div>
          </form>

          <div className="flex gap-2 text-sm mt-5">
            <span>Don't have an account?</span>
            <Link to={"/sign-up"} className="text-blue-700">
              Sign Up
            </Link>
          </div>

          {errorMessage && !errorMessage.includes("Book already in cart") && (
            <Alert className="mt-5" color="failure">
              {errorMessage}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
