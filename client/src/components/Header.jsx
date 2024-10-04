  import { Avatar, Button, Dropdown, Navbar } from "flowbite-react";
  import { Link, useLocation, useNavigate } from "react-router-dom";
  import { FaMoon, FaSun } from "react-icons/fa";
  import { useSelector, useDispatch } from "react-redux";
  import { toggleTheme } from "../redux/theme/themeSlice";
  import { signoutSucess } from "../redux/user/userSlice";
  import { useEffect, useState } from "react";
  import SearchIcon from "@mui/icons-material/Search";

  export default function Header() {
    const path = useLocation().pathname;
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { theme } = useSelector((state) => state.theme);
    const [searchTerm, setSearchTerm] = useState("");
    const [sort] = useState("");
    const [category] = useState("");

    useEffect(() => {
      const urlParams = new URLSearchParams(location.search);
      const searchTermFromUrl = urlParams.get("searchTerm");
      if (searchTermFromUrl) {
        setSearchTerm(searchTermFromUrl);
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
          navigate("/sign-in");
        }
      } catch (error) {
        console.log(error.message);
      }
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      const urlParams = new URLSearchParams(location.search);
      urlParams.set("searchTerm", searchTerm);
      urlParams.set("sort", sort);
      urlParams.set("category", category);
      const searchQuery = urlParams.toString();
      navigate(`/search?${searchQuery}`);
    };

    return (
      <Navbar
        fluid
        rounded
        className="relative border-b-2 z-50 w-full bg-transparent backdrop-blur-3xl dark:bg-transparent"
      >
        <Link
          to={"/"}
          className="self-center whitespace-nowrap text-sm md:text-xl font-semibold dark:text-white"
        >
          <div className="flex">
            <div className="flex items-center space-x-2">
              <img className="w-10 h-10" src="/image.png"></img>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">
                ReadSpace
              </div>
            </div>
          </div>
        </Link>

        <form onSubmit={handleSubmit} className=" hidden sm:inline">
          <div className="w-28 lg:w-full">
            <input
              type="text"
              placeholder="Search. . ."
              className="w-full text-gray-900 border border-gray-300 rounded-lg text-base focus:border-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-700 dark:focus:border-blue-700"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
            />
          </div>
        </form>

        <Button
          className="w-9 h-9  sm:hidden items-center"
          color="gray"
          pill
          onClick={() => {
            navigate("/search");
          }}
        >
          <SearchIcon />
        </Button>

        <div className="flex gap-2 md:order-2">
          <button
            className="w-12 h-10 flex items-center justify-center rounded-3xl bg-gray-300 dark:bg-gray-900"
            color="gray"
            onClick={() => dispatch(toggleTheme())}
          >
            {theme === "dark" ? (
              <FaMoon className="md:w-fit w-3" />
            ) : (
              <FaSun className="md:w-fit w-3" />
            )}
          </button>

          {currentUser ? (
            <Dropdown
              arrowIcon={false}
              inline
              label={
                <Avatar
                  alt="user"
                  img={currentUser.profilePicture}
                  rounded
                  className="object-cover"
                />
              }
              className="z-10"
            >
              <Dropdown.Header className="z-10">
                <span className="block text-sm">
                  <span className=" font-bold text-base">User: </span> @
                  {currentUser.data.user.username}
                </span>
                <span className="block text-sm font-medium truncate">
                  <span className=" font-bold text-base">Mail: </span>
                  {currentUser.data.user.email}
                </span>
              </Dropdown.Header>

              <Dropdown.Divider />
              <Dropdown.Item className="z-10" onClick={handleSignout}>Sign Out</Dropdown.Item>
            </Dropdown>
          ) : (
            <Link to="/sign-in">
              <Button gradientDuoTone="purpleToBlue" outline>
                Sign In
              </Button>
            </Link>
          )}
          <Navbar.Toggle />
        </div>

        <Navbar.Collapse>
          <Link to={"/"}>
            <Navbar.Link
              active={path === "/"}
              as={"div"}
              className="flex justify-center z-50"
            >
              <span className="font-courier-new text-lg text-black dark:text-green-400">
                Home
              </span>
            </Navbar.Link>
          </Link>
          {currentUser?.data.user?.isAdmin && (
            <Link to={"/create-book"}>
              <Navbar.Link
                active={path === "/create-book"}
                as={"div"}
                className="flex justify-center"
              >
                <span className="font-courier-new text-lg text-black dark:text-green-400">
                  Create Book
                </span>
              </Navbar.Link>
            </Link>
          )}

          <Link to={"/about"}>
            <Navbar.Link
              active={path === "/about"}
              as={"div"}
              className="flex justify-center"
            >
              <span className="font-courier-new text-lg text-black dark:text-green-400">
                About
              </span>
            </Navbar.Link>
          </Link>

          {currentUser && !currentUser.data.user.isAdmin ? (
            <Link to={"/dashboard?tab=rentedBooks"}>
              <Navbar.Link
                active={path === "/search"}
                as={"div"}
                className="flex justify-center"
              >
                <span className="font-courier-new text-lg text-black dark:text-green-400">
                  Dashboard
                </span>
              </Navbar.Link>
            </Link>
          ) : currentUser?.data.user?.isAdmin ? (
            <Link to={"/dashboard?tab=dash"}>
              <Navbar.Link
                active={path === "/search"}
                as={"div"}
                className="flex justify-center"
              >
                <span className="font-courier-new text-lg text-black dark:text-green-400">
                  Dashboard
                </span>
              </Navbar.Link>
            </Link>
          ) : (
            <Link to={"/sign-in"}>
              <Navbar.Link
                active={path === "/search"}
                as={"div"}
                className="flex justify-center"
              >
                <span className="font-courier-new text-lg text-black dark:text-green-400">
                  Dashboard
                </span>
              </Navbar.Link>
            </Link>
          )}
        </Navbar.Collapse>
      </Navbar>
    );
  }
