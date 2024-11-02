import React, { useEffect, useState } from "react";
import { Spinner } from "../components/Spinner";
import { Link } from "react-router-dom";
import { CiShoppingCart } from "react-icons/ci";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentPrices, setCurrentPrices] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await fetch("/api/cart/get");
        const res = await response.json();

        if(!res.success) {
          setError(true);
          setLoading(false);
          return;
        }

        if (res.data.cartItem.length > 0) {
          setCartItems(res.data);
          const initialPrices = {};
          res.data.cartItem.forEach((item) => {
            initialPrices[item._id] = {
              purchaseType: item.purchaseType,
              rentDays: item.rentDays,
              price: item.price,
            };
          });
          setCurrentPrices(initialPrices);
          setLoading(false);
        } else {
          setError(true);
          setLoading(false);
        }

      } catch (error) {
        console.log("Error fetching cart items:", error);
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const updateRentDays = async (itemId, newRentDays, purchaseType) => {
   
    

    try {
      await fetch(`/api/cart/update/${itemId}`, {
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
    } catch (error) {
      console.log("Error updating rent days:", error);
    }
  };

  const calculateTotalAmount = () => {
    let total = 0;
    Object.keys(currentPrices).forEach((itemId) => {
      const {price } = currentPrices[itemId];
      total += price;
    });
    setTotalAmount(total);
  };

  

  useEffect(() => {
    calculateTotalAmount();
  }, [currentPrices]);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 md:text-4xl lg:text-5xl mb-4">
          Cart is empty
        </h1>
        <Link
          to="/"
          className="text-lg font-semibold text-blue-500 dark:text-blue-400 hover:underline mb-4"
        >
          Get a Book
        </Link>

        <CiShoppingCart className="text-5xl text-gray-400 dark:text-gray-300" />
      </div>
    );
  }

  return (
    <div className="flex">
      <div className="min-h-[750px] flex flex-col gap-4 md:min-w-[60vw] mx-4 sm:mx-6 md:mx-10 my-8">
        {cartItems.cartItem.map((item) => {
          const { rentDays } = currentPrices[item._id] || { rentDays: 1 };
          return (
            <div
              key={item._id}
              className="border border-slate-400 dark:border-slate-600 rounded-lg shadow-md p-2 bg-white dark:bg-gray-900"
            >
              <div className="flex flex-col md:flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm">
                <Link to={`/book-detail/${item.bookId._id}`}>
                  <img
                    src={item.bookId.cover}
                    className="w-[80px] h-[120px] md:w-[130px] md:h-[170px] object-cover rounded-md shadow-md"
                    alt="Book Cover"
                  />
                </Link>
                <div className="ml-4 md:ml-6 flex flex-col md:flex-row items-start space-y-2">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 max-w-[200px]">
                    {item.bookId.bookName}
                  </h2>
                  <div>
                    <button
                      onClick={() => {
                        setCurrentPrices((prev) => ({
                          ...prev,
                          [item._id]: {
                            purchaseType: "rent",
                            rentDays: item.rentDays,
                            price: item.bookId.rentPerDay * rentDays,
                          },
                          
                        }));
                        updateRentDays(item._id, rentDays, "rent");
                      }}
                      className="w-full px-4 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700"
                    >
                      Rent Rs.{item.bookId.rentPerDay}/day
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (rentDays > 1) {
                            const newRentDays = rentDays - 1;
                            setCurrentPrices((prev) => ({
                              ...prev,
                              [item._id]: {
                                purchaseType: "rent",
                                rentDays: newRentDays,
                                price: item.bookId.rentPerDay * newRentDays,
                              },
                            }));
                            updateRentDays(item._id, newRentDays);
                          }
                        }}
                        className="text-lg font-semibold px-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                      >
                        -
                      </button>

                      <style>
                        {`
                            input[type="number"]::-webkit-inner-spin-button,
                            input[type="number"]::-webkit-outer-spin-button {
                            -webkit-appearance: none;
                            }
                        `}
                      </style>

                      <input
                        type="number"
                        value={rentDays}
                        min="1"
                        onChange={(e) => {
                          const newRentDays = e.target.value
                            ? Math.max(1, parseInt(e.target.value, 10))
                            : "";
                          setCurrentPrices(() => ({
                            [item._id]: {
                              purchaseType: "rent",
                              rentDays: newRentDays,
                              price: item.bookId.rentPerDay * newRentDays,
                            },
                          }));
                          if (newRentDays) {
                            updateRentDays(item._id, newRentDays);
                          }
                        }}
                        className="w-12 text-center dark:bg-gray-800 p-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600"
                        placeholder="Enter days"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          const newRentDays = rentDays + 1;
                          setCurrentPrices((prev) => ({
                            ...prev,
                            [item._id]: {
                              purchaseType: "rent",
                              rentDays: newRentDays,
                              price: item.bookId.rentPerDay * newRentDays,
                            },
                          }));
                          updateRentDays(item._id, newRentDays, "rent");
                        }}
                        className="text-lg font-semibold px-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>

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
                    className="w-full px-4 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700 focus:text-red-700"
                  >
                    Buy Rs.{item.bookId.oneTimePrice}
                  </button>
                </div>
                <div className="ml-4 md:ml-6 flex flex-col md:flex-row items-start space-y-2">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 max-w-[200px]">
                    {currentPrices[item._id]?.purchaseType == "rent"
                      ? "Rent: Rs." + currentPrices[item._id]?.price
                      : "Buy: Rs." + item.bookId.oneTimePrice}
                  </h2>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Your Total Amount
        </h1>
        <p className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
          Rs. {totalAmount}
        </p>
        <Link
          to="/checkout"
          className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Checkout
        </Link>
      </div>
    </div>
  );
};

export default Cart;
