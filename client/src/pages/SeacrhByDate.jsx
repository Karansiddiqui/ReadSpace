import { Spinner } from "flowbite-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BookCard from "../components/BookCard";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function SearchByDate() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shouldFetchOnMount, setShouldFetchOnMount] = useState(true);

  const location = useLocation();
  console.log("books", books);

  useEffect(() => {
    if (shouldFetchOnMount) {
      fetchBooks();
    }
  }, [shouldFetchOnMount]);
  const fetchBooks = async () => {
    setLoading(true);
    try {
      let res;

      res = await fetch(`api/books/get`);
      const response = await res.json();

      if (response.success) {
        console.log("res", response);

        setBooks(response.data.books);
      }
      if (!response.success) {
        setBooks([]);

        if (response.message.includes("Invelid Token")) {
          toast.error("Pleas login");
          toast.error(response.message);
        }
      }
    } catch (error) {
      toast.error("Server Error   " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(startDate, endDate);

    console.log(startDate, endDate);
    let searchQuery = "";
    try {
      if (startDate || endDate) {
        setShouldFetchOnMount(false);
        setBooks([]);
        console.log("inside");

        if (startDate) {
          searchQuery += `firstDate=${startDate.toLocaleDateString("en-IN")}&`;
        }
        if (endDate) {
          searchQuery += `secondDate=${endDate.toLocaleDateString("en-IN")}`;
        }

        console.log(searchQuery);

        const res = await fetch(
          `/api/transaction/findBookByUserAndDateRange?${searchQuery}`
        );
        const response = await res.json();
        console.log("res from ", response);
        if (response.success) {
          console.log("ookkkkkkk");

          setBooks(response.data);
          console.log("trasaction books", books);

          if (searchQuery) toast.success(response.message);
          console.log("respo.success", response.success);
        }

        if (!response.success) {
          setBooks([]);

          if (response.message.includes("Invelid Token")) {
            toast.error("Pleas login");
          } else {
            toast.error(response.message);
          }
          return;
        }
      } else {
        toast.error("Please select start and end date");
      }
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="p-10 flex gap-4 items-center justify-center">
        <form onSubmit={handleSubmit} className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <label className="text-xl">Start Date:</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="dd/MM/yyyy"
              className="border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded px-2 py-1"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="text-xl">End Date:</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="dd/MM/yyyy"
              className="border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded px-2 py-1"
            />
          </div>

          <button
            type="submit"
            className="border-2 font-semibold border-blue-700 text-blue-700 rounded-full px-6 py-2 hover:bg-blue-700 hover:text-white transition duration-200"
          >
            Search
          </button>
          <div
            onClick={() => {
              setStartDate(null);
              setEndDate(null);
              setShouldFetchOnMount(true);
              toast.info("Cleared");
            }}
            className="border-2 font-semibold border-red-700 text-red-700 rounded-full px-6 py-2 hover:bg-red-700 hover:text-white transition duration-200"
          >
            Clear
          </div>
        </form>
      </div>

      <div className="p-3 flex flex-wrap gap-8 w-full mx-auto items-center justify-center">
        {loading && (
          <p className="text-xl text-gray-500 flex items-center justify-center h-[600px] w-full">
            <Spinner size="xl" />
          </p>
        )}
        {!loading && books.length === 0 && (
          <div className="min-h-screen">
            <p className="text-xl text-gray-500">No books found.</p>
          </div>
        )}

        {!loading && shouldFetchOnMount
          ? books.map((book) => <BookCard key={book._id} book={book} />)
          : books.map((book) => <BookCard key={book._id} book={book.bookId} />)}
      </div>
    </div>
  );
}
