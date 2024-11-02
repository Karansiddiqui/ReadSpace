import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DashSidebar from "../components/DashSidebar";
import DashUsers from "../components/DashUsers";
import RentedBooks from "./RentedBooks";
import HistoryUser from "./HistoryUser";
import DashboardComp from "../components/DashBoardComp";
import { PastUser } from "../components/PastUser";
import { CurrentUser } from "../components/CurrentUser";
import AllHistoryAdmin from "./AllHistoryAdmin.jsx";

export default function Dashboard() {
  const location = useLocation();
  const [tab, setTab] = useState("");
  useEffect(() => {
    // store query parameter
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="md:w-56">
        {/* Sidebar */}
        <DashSidebar />
      </div>
      {/* profile... */}
      {tab === "dash" && <DashboardComp />}
      {tab === "rentedBooks" && <RentedBooks />}
      {tab === "users" && <DashUsers />}
      {tab === "pastuser" && <PastUser />}
      {tab === "currentuser" && <CurrentUser />}
      {tab === "history" && <HistoryUser />}
      {tab === "allHistory" && <AllHistoryAdmin />}
    </div>
  );
}
