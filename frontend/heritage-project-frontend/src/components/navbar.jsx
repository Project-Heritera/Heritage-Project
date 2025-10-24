
import { Link } from "react-router-dom";
import { LifeBuoy,List } from "lucide-react";

export default function Navbar() {
  return (
<<<<<<< HEAD
    <nav className="flex items-center justify-between bg-gray-900 px-6 py-3 shadow-md">
      {/* Left: Brand Name */}
      <div className="flex items-center space-x-2">
        <span className="text-2xl font-bold text-white tracking-wide">
          Vivan
            
        </span>
         <LifeBuoy className="h-6 w-6 text-white" />
=======
    <>
      <div className="navbar flex justify-center ">
        <img src="./src/assets/logos/heritera_white_logo.png" />
      <Link to="/">
        <button>Login/Logout</button>
      </Link>
      <Link to="/courses">
        <button>Courses</button>
      </Link>
        <button>
          <List />
        </button>
>>>>>>> df8f5cb2baca3468a5582ed9eb3cf5c4e7dda814
      </div>
      

      {/* Middle: Navigation Links */}
      <div className="flex items-center space-x-6">
        <Link to="/">
          <button className="text-white hover:text-gray-300 transition">
            Login/Logout
          </button>
        </Link>
        <Link to="/course_view">
          <button className="text-white hover:text-gray-300 transition">
            Courses
          </button>
        </Link>
        <Link to="/room_editor">
          <button className="text-white hover:text-gray-300 transition">
            Room Editor
          </button>
        </Link>
      </div>

     
      <button className="text-white p-2 rounded-md hover:bg-gray-800 transition">
        <List className="h-6 w-6" />
      </button>
    </nav>
  );
}
