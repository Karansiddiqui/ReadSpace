import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ReactSpinner } from "../components/ReactSpinner";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import {
  addToCartStart,
  addToCartSuccess,
  addToCartFailure,
} from "../redux/cart/cartSlice.js";
import { useSelector } from "react-redux";
import { Spinner } from "flowbite-react";

const BookDetails = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [topics, setTopics] = useState([]);

  const dispatch = useDispatch();
  const { cartItems, loading } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchBook = async () => {
      const response = await fetch(`/api/books/getBookById/${id}`);
      const res = await response.json();
      // console.log(res.data);

      if (res.data && res.data.topic) {
        setBook(res.data);
        setTopics(res.data.topic.trim().split(/[\s,]+/));
      }
    };

    fetchBook();
  }, [id]);

  function cartInLocalStorage(book) {
    const existingBooks = localStorage.getItem("book");
    // console.log("existingBooks:", existingBooks);

    // Parse the existing books or initialize as an empty array
    let bookArray;
    if (existingBooks) {
      // console.log("Existing books:", existingBooks);

      try {
        bookArray = JSON.parse(existingBooks);
        // Check if the parsed value is indeed an array
        if (!Array.isArray(bookArray)) {
          console.warn(
            "Expected bookArray to be an array, but got:",
            bookArray
          );
          bookArray = []; // Reset to an empty array if it's not
        }
      } catch (error) {
        console.error("Error parsing book array from localStorage:", error);
        bookArray = []; // Reset to an empty array in case of error
      }
    } else {
      bookArray = []; // Initialize as an empty array if nothing is stored
    }

    // Add the new book ID to the array
    // If the book already exists, do not add it again
    if (bookArray.includes(book._id)) {
      return;
    }
    bookArray.push(book._id);

    // Save the updated array back to localStorage
    localStorage.setItem("book", JSON.stringify(bookArray));
  }

  const handleAddToCart = async () => {
    console.log("cart added");
    
    if (!book?._id || !book?.oneTimePrice) {
      toast.error("Book information is missing. Cannot add to cart.");
      return;
    }

    dispatch(addToCartStart());
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
      console.log("error data", errorData);

      const isExist = cartItems?.cartItem?.some((item) => {
        const isMatch = item.bookId._id === book._id;
        console.log(
          "item.bookId._id === book._id:",
          isMatch,
          item.bookId._id,
          book._id
        );
        return isMatch;
      });

      cartInLocalStorage(book);
      console.log("isExist", isExist);

      if (isExist) {
        dispatch(addToCartFailure("Book already in cart."));
        toast.error("Book already in cart.");
        return;
      } else {
        dispatch(
          addToCartSuccess({
            cartItem: [
              ...cartItems.cartItem,
              {
                bookId: book,
                price: book.oneTimePrice,
                purchaseType: "buy",
                _id: Math.random().toString(36).substr(2, 9),
              },
            ],
          })
        );
        toast.success("Book added to cart successfully!");
        return;
      }
    }

    if (response.ok) {
      const data = await response.json();

      dispatch(addToCartSuccess({ cartItem: data.data.cartItem }));
      console.log("data", data);
      // dispatch(addToCartStart());
      toast.success("Book added to cart successfully!");
    } else {
      toast.error("Unexpected error: Could not add book to cart.");
    }
  };

  console.log("Cart Items:", cartItems);

  console.log("Loading:", loading);
  if (!book) {
    return <ReactSpinner />;
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
          {loading ? <Spinner /> : "ADD TO CART"}
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
