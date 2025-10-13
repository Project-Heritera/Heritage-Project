import { Link } from "react-router-dom";
import { List } from "lucide-react";
export default function Navbar() {
  return (
    <>
      <div className="navbar flex justify-center ">
        <img src="./src/assets/logos/heritera_white_logo.png" />
      <Link to="/">
        <button>Login/Logout</button>
      </Link>
      <Link to="/course_view">
        <button>Courses</button>
      </Link>
      <Link to="/room_editor">
        <button>Room Editor</button>
      </Link>
        <button>
          <List />
        </button>
      </div>
    </>
  );
}
