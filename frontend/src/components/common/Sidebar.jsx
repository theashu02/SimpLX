import myIcon from "/mp4/social.png";
import { TfiHome } from "react-icons/tfi";
import { CgProfile } from "react-icons/cg";
import { RiNotification4Line } from "react-icons/ri";
import { Link } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { BsCameraVideo } from "react-icons/bs";
import { useSocketContext } from "../../context/SocketContext.jsx";

const Sidebar = () => {
  const queryClient = useQueryClient();
  const { unreadNotificationCount } = useSocketContext();

  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/auth/logout", {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Somthing went wrong");
        }
      } catch (error) {
        throw new Error(error);
      }
    },

    onSuccess: () => {
      toast.success("Logout successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: () => {
      toast.error("Logout failed");
    },
  });

  const { data: authUser } = useQuery({queryKey: ["authUser"]})  

  return (
    <div className="md:flex-[2_2_0] w-18 max-w-52 bg-gray-900 text-[#f4f4f4]">
      <div className="sticky top-0 left-0 h-screen flex flex-col border-r border-gray-700 w-20 md:w-full">
        <Link to="/" className="flex justify-center md:justify-middle mt-5">
          {/* <XSvg className="px-2 w-12 h-12 rounded-full fill-white hover:bg-stone-900" /> */}
          <img
            src={myIcon}
            alt="My Icon"
            className="px-2 w-14 h-15 rounded-medium hover:bg-stone-900"
          />
        </Link>
        <ul className="flex flex-col gap-3 mt-4">
          <li className="flex justify-center md:justify-start">
            <Link
              to="/"
              className="flex gap-3 items-center hover:bg-stone-600 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
            >
              <TfiHome className="w-8 h-8" />

              <span className="text-lg hidden md:block">Home</span>
            </Link>
          </li>
          <li className="flex justify-center md:justify-start">
            <Link
              to="/notifications"
              className="flex gap-3 items-center hover:bg-stone-600 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer relative"
            >
              <RiNotification4Line className="w-6 h-6" />
              <span className="text-lg hidden md:block">Notifications</span>
              {unreadNotificationCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                  {unreadNotificationCount}
                </span>
              )}
            </Link>
          </li>

          <li className="flex justify-center md:justify-start">
            <Link
              to={`/profile/${authUser?.username}`}
              className="flex gap-3 items-center hover:bg-stone-600 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
            >
              <CgProfile className="w-6 h-6" />
              <span className="text-lg hidden md:block">Profile</span>
            </Link>
          </li>
          <li className="flex justify-center md:justify-start">
            <Link
              to="/RI"
              className="flex gap-3 items-center hover:bg-stone-700 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
            >
              <BsCameraVideo className="w-6 h-6" />
              <span className="text-lg hidden md:block">Video Room</span>
            </Link>
          </li>
        </ul>
        {authUser && (
          <Link
            to={`/profile/${authUser.username}`}
            className="mt-auto mb-10 flex gap-2 items-start transition-all duration-300 hover:bg-teal-900 py-3 px-4 rounded-full bg-gray-800"
          >
            <div className="avatar hidden md:inline-flex">
              <div className="w-8 rounded-full">
                <img src={authUser?.profileImg || "/avatar-placeholder.png"} className="rounded-full"/>
              </div>
            </div>
            <div className="flex justify-between flex-1">
              <div className="hidden md:block">
                <p className="text-white font-bold text-sm w-20 truncate">
                  {authUser?.fullName}
                </p>
                <p className="text-slate-500 text-sm">@{authUser?.username}</p>
              </div>
              <BiLogOut
                className="w-5 h-5 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  logout();
                }}
              />
            </div>
          </Link>
        )}
      </div>
    </div>
  );
};
export default Sidebar;
