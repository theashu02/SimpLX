import { Link } from "react-router-dom";
import { useState } from "react";
import myIcon from "/mp4/social.png";
import { MdOutlineMail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { MdDriveFileRenameOutline } from "react-icons/md";

// mutation is used for connect frontend and backend
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    fullName: "",
    password: "",
  });

  const { mutate, isError, isPending, error } = useMutation({
    mutationFn: async ({ email, username, fullName, password }) => {
      try {
        const res = await fetch("/api/auth/signup", {
          // vite.config.js set proxy localhost
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, username, fullName, password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create account");
        console.log(data);
        return data;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Account created successfully");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault(); // page would not reload
    // console.log(formData);
    mutate(formData);
  };


  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-screen-xl mx-auto flex h-screen px-10 bg-gray-900">
      <div className="flex-1 hidden lg:flex items-center  justify-center">
        {/* <XSvg className=" lg:w-2/3 fill-white" /> */}
        <img src={myIcon} alt="My Icon" className="lg:w-2/3" />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <form
          className="lg:w-2/3  mx-auto md:mx-20 flex gap-4 flex-col"
          onSubmit={handleSubmit}
        >
          {/* <XSvg className="w-24 lg:hidden fill-white" /> */}
          <div className="flex flex-col justify-center items-center">
            <img
              src={myIcon}
              alt="My Icon"
              className="lg:hidden"
              style={{ width: "150px", height: "150px" }}
            />

            <h1 className="text-4xl font-extrabold text-white">Register</h1>
          </div>

          <label className="input input-bordered rounded flex items-center gap-2  p-2 bg-gray-300">
            <MdOutlineMail />
            <input
              type="email"
               className="grow bg-transparent text-black"
              placeholder="Email"
              name="email"
              onChange={handleInputChange}
              value={formData.email}
            />
          </label>
          <div className="flex gap-4 flex-wrap">
            <label className="input input-bordered rounded flex items-center gap-2 flex-1 p-2 bg-gray-300">
              <FaUser />
              <input
                type="text"
                className="grow bg-transparent text-black"
                placeholder="Username"
                name="username"
                onChange={handleInputChange}
                value={formData.username}
              />
            </label>
            <label className="input input-bordered rounded flex items-center gap-2 flex-1 p-2 bg-gray-300">
              <MdDriveFileRenameOutline />
              <input
                type="text"
                 className="grow bg-transparent text-black"
                placeholder="Full Name"
                name="fullName"
                onChange={handleInputChange}
                value={formData.fullName}
              />
            </label>
          </div>
          <label className="input input-bordered rounded flex items-center gap-2 p-2 bg-gray-300">
            <MdPassword />
            <input
              type="password"
               className="grow bg-transparent text-black"
              placeholder="Password"
              name="password"
              onChange={handleInputChange}
              value={formData.password}
            />
          </label>
          <button className="btn rounded-full btn-primary text-black p-2 bg-gray-300">
            {isPending ? "Loading..." : "Sign up"}
          </button>
          {isError && <p className="text-red-500">{error.message}</p>}
        </form>
        <div className="flex flex-col lg:w-2/3 gap-2 mt-4">
          <p className="text-white text-lg">Already have an account?</p>
          <Link to="/login">
            <button className="btn rounded-full btn-primary text-black btn-outline w-full p-2 bg-gray-300">
              Sign in
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default SignUpPage;
