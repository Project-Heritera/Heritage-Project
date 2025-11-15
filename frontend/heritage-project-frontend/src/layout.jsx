import Navbar from "./components/navbar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <>
      <Navbar />
      <main className="pt-30 m-4">
        <Outlet />
      </main>
    </>
  );
}