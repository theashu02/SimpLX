import { useState } from "react";
import { Link } from "react-router-dom";
import { MdOutlineMail } from "react-icons/md";
import { MdPassword } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import myIcon from "/mp4/social.png"

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const queryClient = useQueryClient();

  const { mutate:LoginMutation, isPending, isError, error } = useMutation({
    mutationFn: async ({ username, password }) => {
      try {
        const res = await fetch(`/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
          credentials: 'include',
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        console.log(data);
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("Login successfully");
      queryClient.invalidateQueries({queryKey: ["authUser"]})
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log(formData);
    LoginMutation(formData);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-screen-xl mx-auto flex h-screen bg-gray-900">
      <div className="flex-1 hidden lg:flex items-center  justify-center">
        <img src={myIcon} alt="My Icon" className="lg:w-2/3" />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <form className="flex gap-4 flex-col" onSubmit={handleSubmit}>
          <div className="flex flex-col justify-center items-center">
            <img
              src={myIcon}
              alt="My Icon"
              className="lg:hidden"
              style={{ width: "250px", height: "250px" }}
            />

            <h1 className="text-4xl font-extrabold text-white">Login</h1>
          </div>

          <label className="input input-bordered rounded flex items-center gap-2 p-2 bg-gray-300">
            <MdOutlineMail className="text-" />
            <input
              type="text"
              className="grow bg-transparent text-black"
              placeholder="username"
              name="username"
              onChange={handleInputChange}
              value={formData.username} 
            />
          </label>

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
          <button className="btn rounded-full btn-primary text-black bg-gray-400 p-3 ">
            {isPending ? "Loading..." : "Login"}
          </button>
          {isError && <p className="text-red-500">{error.message}</p>}
        </form>
        <div className="flex flex-col gap-2 mt-4">
          <p className="text-white text-lg">{"Don't"} have an account?</p>
          <Link to="/signup">
            <button className="btn rounded-full btn-primary text-black btn-outline w-full bg-gray-400 p-3">
              Sign up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
