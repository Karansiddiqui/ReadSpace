import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Spinner } from "../components/Spinner";
import { toast } from "react-toastify";

const BookDetails = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    const fetchBook = async () => {
      const response = await fetch(`/api/books/getBookById/${id}`);
      const res = await response.json();
      console.log(res.data);

      if (res.data && res.data.topic) {
        setBook(res.data);
        setTopics(res.data.topic.trim().split(/[\s,]+/));
      }
    };

    fetchBook();
  }, [id]);

  const handleAddToCart = async () => {
    if (!book?._id || !book?.oneTimePrice) {
      toast.error("Book information is missing. Cannot add to cart.");
      return;
    }

    try {
      const response = await fetch("/api/cart/addItemToCart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookId: book._id,
          price: book.oneTimePrice,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to add book to cart.");
        return;
      }

      const data = await response.json();

      if (data && data.success) {
        toast.success("Book added to cart successfully!");
      } else if (data && data.message) {
        toast.success(data.message);
      } else {
        toast.error("Unexpected error: Could not add book to cart.");
      }
    } catch (error) {
      // Handle network or other unexpected errors
      console.error("Error adding book to cart:", error);
      toast.error(
        "Network error: Unable to connect to the server. Please try again later."
      );
    }
  };

  if (!book) {
    return <Spinner />;
  }
  return (
    <div className="min-h-[70vh] m-auto flex flex-col md:flex-row justify-center gap-16 mt-16 mb-16 max-w-[90vw] lg:max-w-[60vw]">
      <div className="min-w-[300px] h-fit flex justify-center md:justify-start">
        <img
          src={book.cover}
          alt={book.title}
          className="w-[300px] shadow-xl"
        />
      </div>

      <div className="flex flex-col">
        <h1 className="text-3xl mb-5 text-gray-800 dark:text-white">
          {book.bookName}
        </h1>
        <p>
          <span className="text-gray-500 dark:text-gray-400">Author : </span>
          <span className="text-red-700">{book.author}</span>
        </p>
        <p>
          <span className="text-gray-500 dark:text-gray-400">
            Publish Year :{" "}
          </span>
          <span className="text-red-700">{book.publicationYear}</span>
        </p>
        <p className="text-gray-500 dark:text-gray-400">
          Category : {book.category}
        </p>

        <div className="flex items-baseline mt-8">
          <p>
            <span className="text-gray-500 dark:text-gray-400 flex gap-2">
              Topics<span>:</span>
            </span>
          </p>
          <div className="flex flex-wrap mt-1 items-center">
            {topics.map((topic, index) => (
              <span
                key={index}
                className="border text-sm m-2 px-3 py-1 rounded-full border-gray-300 bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* <span className="text-gray-500 dark:text-gray-400 flex mb-2">
            Choose Plan
          </span> */}
        {/* <div className="flex flex-col md:flex-row gap-4">
            <button className="border px-6 py-2 text-gray-600 dark:text-gray-300 focus:font-semibold focus:border-red-700 focus:border-2 rounded-lg">
              <span className="text-gray-500 dark:text-gray-400">Rent</span>{" "}
              <span className="text-red-700">Rs. {book.rentPerDay}/day</span>
            </button>
            <button className="border px-6 py-2 text-gray-600 dark:text-gray-300 focus:font-semibold focus:border-red-700 focus:border-2 rounded-lg">
              <span className="text-gray-500 dark:text-gray-400">Buy</span>{" "}
              <span className="text-red-700">Rs. {book.oneTimePrice}</span>
            </button>
          </div> */}

        <div className="flex flex-col md:flex-row gap-4 mt-8">
          <div className="border px-6 py-2 text-gray-600 dark:text-gray-300 focus:font-semibold rounded-lg">
            <span className="text-gray-500 dark:text-gray-400">Rent</span>{" "}
            <span className="text-red-700">Rs. {book.rentPerDay}/day</span>
          </div>
          <div className="border px-6 py-2 text-gray-600 dark:text-gray-300 focus:font-semibold rounded-lg">
            <span className="text-gray-500 dark:text-gray-400">Buy</span>{" "}
            <span className="text-red-700">Rs. {book.oneTimePrice}</span>
          </div>
        </div>

        <button
          onClick={() => handleAddToCart(book._id)}
          className="w-fit mt-8 border-2 border-red-700 px-6 py-2 font-semibold rounded-lg bg-red-700 text-white transition hover:border-red-600 hover:bg-red-600"
        >
          ADD TO CART
        </button>

        <div className="mt-8">
          <h2 className="text-2xl text-gray-800 dark:text-white">
            Description
          </h2>
          <p className="text-gray-600 text-justify dark:text-gray-300 mt-4">
            {book.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
