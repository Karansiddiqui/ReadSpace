import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { signoutSucess } from "../redux/user/userSlice";
import HistoryIcon from '@mui/icons-material/History';
import {
  Card,
  List,
  ListItem,
  ListItemPrefix,
  Chip,
} from "@material-tailwind/react";
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import {
  AccountBox,
  ChatBubbleOutline,
  Dashboard,
  Group,
  LocalPostOffice,
  Logout,
} from "@mui/icons-material";

export default function DashSidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [tab, setTab] = useState("");
  const { theme } = useSelector((state) => state.theme);


  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);
  const handleSignout = async () => {
    try {
      const res = await fetch("/api/user/logout", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signoutSucess());
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <Card className=" sm:flex md:min-h-screen shadow-xl shadow-blue-gray-900/5 dark:text-gray-200 dark:bg-[rgb(14,16,19)] md:w-56">
      <List className="flex flex-row md:flex-col sm-gap-0 ap-8 flex-wrap ">
        {currentUser && currentUser.data.user.isAdmin && (
          <Link to="/dashboard?tab=dash">
            <ListItem className="gap-3">
              <ListItemPrefix>
                <Dashboard className="h-5 w-5" />
              </ListItemPrefix>
              Dashboard
            </ListItem>
          </Link>
        )}
        {currentUser && !currentUser.data.user.isAdmin && (
        <Link to="/dashboard?tab=rentedBooks">
          <ListItem className="gap-3">
            <ListItemPrefix>
              <AutoStoriesIcon className="h-5 w-5" />
            </ListItemPrefix>
            Rented Books
          </ListItem>
        </Link>
          
        )}
        
        {currentUser.data.user.isAdmin ? 
          (<Link to="/search">
            <ListItem className="gap-3">
              <ListItemPrefix>
              <HistoryIcon className="h-5 w-5" />
              </ListItemPrefix>
              History
            </ListItem>
          </Link>) :(<Link to="/dashboard?tab=history">
          <ListItem className="gap-3">
            <ListItemPrefix>
              <HistoryIcon className="h-5 w-5" />
            </ListItemPrefix>
            History
          </ListItem>
        </Link>)
        }
        {currentUser.data.user.isAdmin && (
          <Link to="/dashboard?tab=users">
            <ListItem className="gap-3">
              <ListItemPrefix>
                <Group className="h-5 w-5" />
              </ListItemPrefix>
              Users
            </ListItem>
          </Link>
        )}
  
        <ListItem onClick={handleSignout} className="gap-3">
          <ListItemPrefix>
            <Logout className="h-5 w-5" />
          </ListItemPrefix>
          Log Out
        </ListItem>
      </List>
    </Card>
  );
}
