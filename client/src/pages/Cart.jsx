import React, { useEffect, useState } from "react";
import { ReactSpinner } from "../components/ReactSpinner.jsx";
import { Link, useNavigate } from "react-router-dom";
import { CiShoppingCart } from "react-icons/ci";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { Spinner } from "flowbite-react";
import {
  addToCartStart,
  addToCartSuccess,
  addToCartFailure,
  removeItemFromCartStart,
  removeItemFromCartSuccess,
  removeItemFromCartFailure,
  clearCartStart,
  clearCartSuccess,
} from "../redux/cart/cartSlice";

const Cart = () => {
  // const [loading, setLoading] = useState(true);
  const [currentPrices, setCurrentPrices] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const { currentUser, loading } = useSelector((state) => state.user);

  const { cartItems, cartLoading } = useSelector((state) => state.cart);

  const [checkOutStart, setCheckOutStart] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const updateRentDays = async (itemId, newRentDays, purchaseType) => {
    try {
      dispatch(addToCartStart());
      const response = await fetch(`/api/cart/update/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rentDays: newRentDays,
          cartItemId: itemId,
          purchaseType: purchaseType,
        }),
      });

      const res = await response.json();

      if (res.success) {
        dispatch(addToCartSuccess(res.data));
      }
    } catch (error) {
      console.log("Error updating rent days:", error);
    }
  };

  const calculateTotalAmount = () => {
    let total = 0;
    Object.keys(currentPrices).forEach((itemId) => {
      const { price } = currentPrices[itemId];
      total += price;
    });
    setTotalAmount(total);
  };

  const handleRemoveCartItem = async (cartItemId, bookId) => {
    try {
      dispatch(removeItemFromCartStart());

      const updatedCartItems = cartItems?.cartItem?.filter(
        (item) => item._id !== cartItemId
      );
      console.log("Updated cart items:", updatedCartItems, cartItemId, bookId);

      if (!updatedCartItems || updatedCartItems.length === 0) {
        clearCart();
        return;
      }

      dispatch(removeItemFromCartSuccess(cartItemId));

      setCurrentPrices((prev) => {
        const updatedPrices = { ...prev };
        delete updatedPrices[cartItemId];
        return updatedPrices;
      });

      let bookArray = JSON.parse(localStorage.getItem("book")) || [];
      bookArray = bookArray.filter((book) => book !== bookId);
      localStorage.setItem("book", JSON.stringify(bookArray));

      if (currentUser) {
        const response = await fetch(`/api/cart/removeItemFromCart`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cartItemId }),
        });

        const res = await response.json();

        if (!res.success) {
          throw new Error(res.message);
        }

        toast.success(res.message);
      }
    } catch (error) {
      console.error("Error removing cart item:", error);
      toast.error("Failed to remove item from cart."); // Notify the user in case of an error
    }
  };

  const clearCart = async () => {
    try {
      if (currentUser) {
        dispatch(clearCartSuccess());
        setCurrentPrices({});
        const response = await fetch(`/api/cart/clearCart`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const res = await response.json();

        if (res.success) {
          toast.success(res.message);
        }
      } else {
        !currentUser && toast.success("Item removed successfully");
        dispatch(clearCartSuccess());
        setCurrentPrices({});
        localStorage.removeItem("book");
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        dispatch(addToCartStart());
        if (currentUser) {
          const response = await fetch("/api/cart/get");
          const res = await response.json();

          if (res.success) {
            dispatch(addToCartSuccess(res.data));
            localStorage.removeItem("book");
            const initialPrices = {};
            res.data.cartItem.forEach((item) => {
              initialPrices[item._id] = {
                purchaseType: item.purchaseType,
                rentDays: item.rentDays,
                price: item.price,
              };
            });
            setCurrentPrices(initialPrices);
          } else {
            dispatch(addToCartFailure());
            toast.error(res.message);
          }
        } else {
          const initialPrices = {};
          cartItems.cartItem.forEach((item) => {
            initialPrices[item._id] = {
              purchaseType: item.purchaseType,
              rentDays: 1,
              price: item.price,
            };
          });
          setCurrentPrices(initialPrices);
        }
      } catch (error) {
        console.log("Error fetching cart items:", error);
        dispatch(addToCartFailure(error.message));
      }
    };

    fetchCartItems();
  }, []);

  useEffect(() => {
    calculateTotalAmount();
  }, [currentPrices, handleRemoveCartItem]);

  if (loading) {
    return <ReactSpinner />;
  }

  const handleCheckout = async () => {
    console.log("Checkout clicked");

    setCheckOutStart(true);

    if (!currentUser) {
      toast.error("Please login to checkout");
      navigate("/sign-in");
      return;
    }

    const response = await fetch("/api/payment/stripe-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cartItems }),
    });

    const result = await response.json();

    console.log("Result:", result);
    

    if (!result.success) {
      toast.error(result.message);
      setCheckOutStart(false);
      return;
    } else {
      setCheckOutStart(false);
      window.location.href = result.data.url;
    }
  };

  if (!cartItems || cartItems?.cartItem.length < 1) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-200 md:text-4xl lg:text-5xl mb-4">
          Cart is empty
        </h1>
        <Link
          to="/"
          className="text-lg font-semibold text-blue-500 dark:text-blue-400 hover:underline mb-4"
        >
          Get a Book
        </Link>

        <CiShoppingCart className="text-5xl text-gray-400 dark:text-gray-200" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center md:items-start md:flex-row md:min-h-[70vh] max-w-7xl mx-auto p-4 lg:space-y-0 md:space-x-8 transition-all duration-200 ease-in-out">
      <div className="flex-[2.5] flex flex-col gap-6 transition-all duration-200 ease-in-out">
        {cartItems?.cartItem.map((item) => {
          const { rentDays } = currentPrices[item._id] || { rentDays: 1 };
          return (
            <div
              key={item._id}
              className="relative border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 bg-white dark:bg-gray-800 transition-all duration-200 ease-in-out"
            >
              <i
                className="ri-close-line absolute right-2 top-[3px] text-gray-400 cursor-pointer"
                onClick={() => handleRemoveCartItem(item._id, item.bookId._id)}
              ></i>
              <div className="flex flex-row items-center lg:items-start">
                {/* Book Cover */}
                <Link
                  to={`/book-detail/${item.bookId._id}`}
                  className="flex-shrink-0 transition-all duration-200 ease-in-out"
                >
                  <img
                    src={item.bookId.cover}
                    className="w-24 h-36 object-cover rounded-md shadow-md transition-all duration-200 ease-in-out"
                    alt={`${item.bookId.bookName} Cover`}
                  />
                </Link>

                {/* Book Details and Actions */}
                <div className="ml-6 flex-1 text-left transition-all duration-200 ease-in-out">
                  <h2 className="text-base sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 line-clamp-1 transition-all duration-200 ease-in-out">
                    {item.bookId.bookName}
                  </h2>

                  {/* Pricing Options */}
                  <div className="flex flex-row gap-4 transition-all duration-200 ease-in-out">
                    <div className="flex flex-col sm:flex-row items-center transition-all duration-200 ease-in-out">
                      {/* Rent Button and Controls */}
                      <button
                        onClick={() => {
                          {
                            currentUser
                              ? setCurrentPrices((prev) => ({
                                  ...prev,
                                  [item._id]: {
                                    purchaseType: "rent",
                                    rentDays,
                                    price: item.bookId.rentPerDay * rentDays,
                                  },
                                }))
                              : navigate("/sign-in");
                          }

                          updateRentDays(item._id, rentDays, "rent");
                        }}
                        className={`px-3 md:px-4 text-xs lg:text-base py-2  rounded-lg focus:outline-none transition-colors duration-200 ${
                          currentPrices[item._id]?.purchaseType === "rent"
                            ? "bg-red-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        }`}
                      >
                        Rent Rs.{item.bookId.rentPerDay}/day
                      </button>

                      <div className="mx-2">
                        {/* Rent Days Controls */}
                        {currentPrices[item._id]?.purchaseType === "rent" && (
                          <div className="flex items-center text-xs lg:text-base">
                            <button
                              type="button"
                              onClick={() => {
                                if (rentDays > 1) {
                                  const newRentDays = rentDays - 1;
                                  setCurrentPrices((prev) => ({
                                    ...prev,
                                    [item._id]: {
                                      ...prev[item._id],
                                      rentDays: newRentDays,
                                      price:
                                        item.bookId.rentPerDay * newRentDays,
                                    },
                                  }));
                                  updateRentDays(item._id, newRentDays);
                                }
                              }}
                              className="text-lg font-semibold px-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-200"
                            >
                              -
                            </button>

                            <input
                              type="number"
                              value={rentDays}
                              min="1"
                              onChange={(e) => {
                                const newRentDays = e.target.value
                                  ? Math.max(1, parseInt(e.target.value, 10))
                                  : 1;
                                setCurrentPrices((prev) => ({
                                  ...prev,
                                  [item._id]: {
                                    ...prev[item._id],
                                    rentDays: newRentDays,
                                    price: item.bookId.rentPerDay * newRentDays,
                                  },
                                }));
                                updateRentDays(item._id, newRentDays);
                              }}
                              className="w-12 h-8 text-center dark:bg-gray-800 text-sm lg:text-base border border-gray-200 dark:border-gray-600 rounded-lg mx-2 transition-all duration-200"
                            />

                            <button
                              type="button"
                              onClick={() => {
                                const newRentDays = rentDays + 1;
                                setCurrentPrices((prev) => ({
                                  ...prev,
                                  [item._id]: {
                                    ...prev[item._id],
                                    rentDays: newRentDays,
                                    price: item.bookId.rentPerDay * newRentDays,
                                  },
                                }));
                                updateRentDays(item._id, newRentDays, "rent");
                              }}
                              className="text-lg font-semibold px-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-200"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Buy Button */}
                    <button
                      onClick={() => {
                        setCurrentPrices((prev) => ({
                          ...prev,
                          [item._id]: {
                            purchaseType: "buy",
                            rentDays: 1,
                            price: item.bookId.oneTimePrice,
                          },
                        }));
                        updateRentDays(item._id, 1, "buy");
                      }}
                      className={`px-4 text-xs lg:text-base py-2 rounded-lg focus:outline-none transition-colors duration-200 ${
                        currentPrices[item._id]?.purchaseType === "buy"
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      }`}
                    >
                      Buy Rs.{item.bookId.oneTimePrice}
                    </button>
                  </div>

                  {/* Current Selection Summary */}
                  <div className="mt-4 transition-all duration-200 ease-in-out">
                    <span className="text-gray-700 dark:text-gray-200 text-sm sm:text-base">
                      {currentPrices[item._id]?.purchaseType === "rent"
                        ? `Rent for ${
                            currentPrices[item._id]?.rentDays
                          } day(s): Rs.${currentPrices[item._id]?.price}`
                        : `Buy: Rs.${item.bookId.oneTimePrice}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Summary */}
      <div className="md:flex-1 max-w-[350px] lg:w-1/3 h-fit bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mt-10 md:mt-0 shadow-sm p-6 transition-all duration-200 ease-in-out">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
          Order Summary
        </h1>
        <div className="flex justify-between mb-4">
          <p className="text-gray-700 dark:text-gray-200">Total Items:</p>
          <p className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200">
            {cartItems.cartItem.length}
          </p>
        </div>
        <div className="flex justify-between mb-6">
          <p className="text-gray-700 dark:text-gray-200">Total Price:</p>
          <p className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200">
            Rs. {totalAmount}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={clearCart}
            className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-200 text-center text-xs lg:text-base"
          >
            <span className="">Clear Cart</span>
          </button>
          <button
            onClick={() => handleCheckout()}
            className="w-full sm:w-auto bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200 text-center text-xs lg:text-base"
          >
            {checkOutStart ? <Spinner /> : <span className="">Checkout</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
