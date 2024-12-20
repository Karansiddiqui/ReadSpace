import { Button } from "flowbite-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import "react-datepicker/dist/react-datepicker.css";
import { ReactSpinner } from "../components/ReactSpinner";
import AdminBookCard from "../components/AdminBookCard";
import UserBookCard from "../components/UserBookCard";
export default function Search() {
  const [sidebarData, setSidebarData] = useState({
    searchTerm: "",
    sort: "desc",
    category: "",
    minRent: "",
    maxRent: "",
  });

  const notifySuccess = (successMessage) => toast.success(successMessage);
  const notifyError = (errorMessage) => toast.error(errorMessage);

  const [books, setbooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useSelector((state) => state.user);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    const sortFromUrl = urlParams.get("sort");
    const categoryFromUrl = urlParams.get("category");
    const minRentFromUrl = urlParams.get("minRent");
    const maxRentFromUrl = urlParams.get("maxRent");

    setSidebarData({
      searchTerm: searchTermFromUrl || "",
      sort: sortFromUrl || "desc",
      category: categoryFromUrl || "",
      minRent: minRentFromUrl || "",
      maxRent: maxRentFromUrl || "",
    });

    const fetchBooks = async () => {
      setLoading(true);
      const searchQuery = urlParams.toString();
      const res = await fetch(`api/books/get?${searchQuery}`);
      const response = await res.json();

      if (!response.success) {
        setLoading(false);
        setbooks([]);
        notifyError(response.message);
        return;
      }

      setbooks(response.data.books);
      setLoading(false);
    };
    fetchBooks();
  }, [location.search]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setSidebarData({ ...sidebarData, [id]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("searchTerm", sidebarData.searchTerm);
    urlParams.set("sort", sidebarData.sort);
    urlParams.set("category", sidebarData.category);
    urlParams.set("minRent", sidebarData.minRent);
    urlParams.set("maxRent", sidebarData.maxRent);

    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  return (
    <div className="flex flex-col md:flex-row">
      <div className="p-7 md:border-r md:min-h-screen border-gray-500">
        <form
          className="flex flex-wrap md:flex-col justify-center gap-8"
          onSubmit={handleSubmit}
        >
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap font-semibold">
              Search Term:
            </label>
            <input
              placeholder="Search..."
              id="searchTerm"
              type="text"
              value={sidebarData.searchTerm}
              onChange={handleChange}
              className="block max-w-28 text-gray-900 border border-gray-300 rounded-lg bg-gray- text-base focus:border-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-700 dark:focus:border-blue-700"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="font-semibold">Sort:</label>
            <select
              onChange={handleChange}
              value={sidebarData.sort}
              id="sort"
              className="block text-gray-900 border border-gray-300 rounded-lg bg-gray- text-base focus:border-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-700 dark:focus:border-blue-700"
            >
              <option value="desc">Latest</option>
              <option value="asc">Oldest</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="font-semibold">Category:</label>
            <select
              onChange={handleChange}
              value={sidebarData.category}
              id="category"
              className="block text-gray-900 border border-gray-300 rounded-lg bg-gray- text-base focus:border-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-700 dark:focus:border-blue-700"
            >
              <option value="">All books</option>
              <option value="fiction">Fiction</option>
              <option value="science">Science</option>
              <option value="non-fiction">Non-Fiction</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="font-semibold">Min Rent:</label>
            <input
              id="minRent"
              type="number"
              value={sidebarData.minRent}
              onChange={handleChange}
              placeholder="Min Rent"
              className="block max-w-28 text-gray-900 border border-gray-300 rounded-lg bg-gray- text-base focus:border-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-700 dark:focus:border-blue-700"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="font-semibold">Max Rent:</label>
            <input
              id="maxRent"
              type="number"
              value={sidebarData.maxRent}
              onChange={handleChange}
              placeholder="Max Rent"
              className="block max-w-28 text-gray-900 border border-gray-300 rounded-lg bg-gray- text-base focus:border-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-700 dark:focus:border-blue-700"
            />
          </div>
          <Button type="submit" outline gradientDuoTone="purpleToPink">
            Apply Filters
          </Button>
        </form>
      </div>
      <div className="">
        <div className="sm:border-b">
          <div>
            <h1 className=" text-3xl pl-8 font-semibold sm:border-b border-gray-500 p-3 mt-5">
              Books Results:
            </h1>
          </div>
        </div>

        {!loading && books.length === 0 && (
          <p className="text-xl w-[85vw] h-[85vh] flex items-center justify-center text-gray-500">
            No books found.
          </p>
        )}
        {loading && (
          <div className="w-[85vw]">
            <ReactSpinner />
          </div>
        )}
        <div className="p-3 flex flex-wrap gap-8 mx-auto items-center justify-center">
          {!loading &&
            (currentUser?.data.user.isAdmin
              ? books.map((book) => (
                  <AdminBookCard key={book._id} book={book} />
                ))
              : books.map((book) => (
                  <UserBookCard key={book._id} book={book} />
                )))}
        </div>
      </div>
    </div>
  );
}
