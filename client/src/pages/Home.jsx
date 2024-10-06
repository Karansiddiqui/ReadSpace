import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import BookCard from "../components/BookCard";

export default function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/books/get");
        const response = await res.json();

        if (res.ok) {
          setBooks(response.data.books);
          setLoading(false);
        } else {
          console.log(response.message);
        }
      } catch (error) {
        console.log(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 1100,
      behavior: "smooth",
    });
  };

  return (
    <div>
      <div
        className="relative bg-fit bg-center h-[94vh] flex items-center justify-center"
        style={{ backgroundImage: `url(library.jpeg)` }}
      >
        <div className="absolute inset-0 bg-black opacity-40 dark:bg-black-800 dark:opacity-80"></div>

        <div className="relative text-center text-[#e9f5db] dark:text-[#8cb369]">
          <h1 className="text-4xl sm:text-6xl font-bold">
            Discover Your Next Favorite Book
          </h1>
          <p className="text-lg sm:text-2xl mt-4">
            Rent thousands of books across genres and interests
          </p>
          <div
            onClick={scrollToTop}
            className="mt-16 cursor-pointer bg-[#718355] hover:bg-[#415a2d] dark:bg-[#3d502eb6] hover:dark:bg-[#415a2d] inline-block px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300"
          >
            Browse Books
          </div>
        </div>
      </div>
      <div className="flex justify-between gap-6 pt-28 max-w-7xl items-center mx-auto">
        <h2 className="text-2xl text-center font-serif">Recent Books</h2>
        <Link
          to="/search"
          className="text-xs sm:text-lg font-bold text-green-400 hover:text-green-500 transition-all duration-300 ease-in-out text-center block mt-4 hacker-text"
        >
          View all books
          <span className="inline-block w-1 h-3 ml-1 bg-green-400 rounded blink"></span>
        </Link>
      </div>

      <div className="max-w-[2380px] mx-auto p-3 flex flex-col gap-8 py-7">
        {loading && (
          <div className="w-full h-[750px] flex justify-center items-center">
            <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 rounded-full border-green-400 border-t-transparent"></div>
          </div>
        )} { books && books.length > 0 ? (
          <div className="flex flex-wrap items-center justify-center gap-14">
            {books.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        ) : (
          <div className="w-full min-h-[750px] flex justify-center items-center">
            <h1 className="text-3xl text-gray-500">No books available</h1>
          </div>
        )}
      </div>
    </div>
  );
}
