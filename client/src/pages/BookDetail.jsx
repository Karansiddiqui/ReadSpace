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
import { current } from "@reduxjs/toolkit";

const BookDetails = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [topics, setTopics] = useState([]);

  const dispatch = useDispatch();
  const { cartItems, cartLoading } = useSelector((state) => state.cart);
  const { currentUser, loading } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchBook = async () => {
      const response = await fetch(`/api/books/getBookById/${id}`);
      const res = await response.json();

      if (res.data && res.data.topic) {
        setBook(res.data);
        setTopics(res.data.topic.trim().split(/[\s,]+/));
      }
    };

    fetchBook();
  }, [id]);

  function cartInLocalStorage(book) {
    const existingBooks = localStorage.getItem("book");

    let bookArray;
    if (existingBooks) {
      try {
        bookArray = JSON.parse(existingBooks);
        if (!Array.isArray(bookArray)) {
          bookArray = [];
        }
      } catch (error) {
        bookArray = [];
      }
    } else {
      bookArray = [];
    }
    if (bookArray.includes(book._id)) {
      return;
    }
    bookArray.push(book._id);

    localStorage.setItem("book", JSON.stringify(bookArray));
  }

  const handleAddToCart = async () => {
    if (!book?._id || !book?.oneTimePrice) {
      toast.error("Book information is missing. Cannot add to cart.");
      return;
    }

    dispatch(addToCartStart());

    if (currentUser) {
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

      const res = await response.json();
      console.log(res);

      dispatch(addToCartSuccess(res.data));

      if (response.ok) {
        toast.success(res.message);
        return;
      } else if (!res.success && currentUser) {
        dispatch(addToCartFailure());
        toast.error(res.message);
      }
    } else {
      let updatedCartItems;
      if (!cartItems) {
        updatedCartItems = {
          cartItem: [
            {
              bookId: book,
              price: book.oneTimePrice,
              purchaseType: "buy",
              _id: Math.random().toString(36).substr(2, 9),
            },
          ],
        };
      } else {
        updatedCartItems = {
          cartItem: [
            ...cartItems.cartItem,
            {
              bookId: book,
              price: book.oneTimePrice,
              purchaseType: "buy",
              _id: Math.random().toString(36).substr(2, 9),
            },
          ],
        };
      }

      const isExist =
        cartItems != null &&
        cartItems?.cartItem?.some((item) => {
          const isMatch = item.bookId._id === book._id;
          return isMatch;
        });

      cartInLocalStorage(book);

      if (isExist) {
        console.log("loading", cartLoading);
        dispatch(addToCartFailure());
        toast.error("Book already in cart.");
        return;
      } else {
        console.log("loading", cartLoading);

        dispatch(addToCartSuccess(updatedCartItems));
        toast.success("Book added to cart successfully!");
        return;
      }
    }
  };

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
          {cartLoading ? <Spinner /> : "ADD TO CART"}
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
