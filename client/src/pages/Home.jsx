import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import BookCard from "../components/BookCard";
import { motion } from "framer-motion"; // Import motion

const AnimatedWord = ({ word, index }) => {
  return (
    <motion.span
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, delay: index * 0.1 }} // Delay based on index
    >
      {word}{" "}
    </motion.span>
  );
};

export default function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteBook, setDeleteBook] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/books/get");
        const response = await res.json();

        if (res.ok) {
          setBooks(response.data.books);
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
  }, [deleteBook]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 1100,
      behavior: "smooth",
    });
  };

  const titleWords = "Discover Your Next Favorite Book".split(" ");
  const descriptionWords = "Rent thousands of books across genres and interests".split(" ");

  return (
    <div>
      <motion.div
        className="relative bg-fit bg-center h-[94vh] flex items-center justify-center"
        style={{ backgroundImage: `url(library.jpeg)` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-black opacity-40 dark:bg-black-800 dark:opacity-80"></div>

        <div className="relative text-center ">
          <h1 className="text-4xl sm:text-6xl font-bold text-[#e9f5db] dark:text-[#8cb369]">
            {titleWords.map((word, index) => (
              <AnimatedWord key={index} word={word} index={index} />
            ))}
          </h1>
          <p className="text-lg sm:text-2xl mt-4 text-[#e9f5db] dark:text-[#8cb369]">
            {descriptionWords.map((word, index) => (
              <AnimatedWord key={index} word={word} index={index} />
            ))}
          </p>
          <motion.div
            onClick={scrollToTop}
            className="mt-16 cursor-pointer text-[#ccffc0] bg-[#94a777c7] hover:bg-[#415a2d] dark:bg-[#3d502eb6] hover:dark:bg-[#415a2d] inline-block px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300"
            initial={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Browse Books
          </motion.div>
        </div>
      </motion.div>
      
      <div className="flex justify-between gap-6 pt-28 max-w-7xl items-center mx-auto">
        <div className="text-xs sm:text-lg font-bold text-green-400 hover:text-green-500 transition-all duration-300 ease-in-out text-center block mt-4 hacker-text">
          Books
          <span className="inline-block w-1 h-3 ml-1 bg-green-400 rounded blink"></span>
        </div>
      </div>

      <div className="max-w-[2380px] mx-auto p-3 flex flex-col gap-8 py-7">
        {loading && (
          <div className="w-full h-[750px] flex justify-center items-center">
            <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 rounded-full border-green-400 border-t-transparent"></div>
          </div>
        )}
        {books && books.length > 0 ? (
          <motion.div
            className="flex flex-wrap items-center justify-center gap-14"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {books.map((book) => (
              <motion.div
                key={book._id}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <BookCard book={book} setDeleteBook={setDeleteBook} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="w-full min-h-[750px] flex justify-center items-center">
            <h1 className="text-3xl text-gray-500">No books available</h1>
          </div>
        )}
      </div>
    </div>
  );
}
