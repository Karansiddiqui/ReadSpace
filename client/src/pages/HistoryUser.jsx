import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { ReactSpinner } from "../components/ReactSpinner";
import UserBookCard from "../components/UserBookCard";

const UserHistory = () => {
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const [allBooks, setAllBooks] = useState([]);

  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        if (!currentUser.data.user?.isAdmin) {
          const res = await fetch(
            `/api/transaction/userBooks?userId=${currentUser.data.user._id}`
          );
          const response = await res.json();

          if (res.ok) {
            const rentedTransactions = response.data.transaction.filter(
              (transaction) => transaction.status === "rented"
            );
            const returnedTransactions = response.data.transaction.filter(
              (transaction) => transaction.status === "returned"
            );

            setBooks(rentedTransactions.concat(returnedTransactions));
          } else {
            setError(response.message || "Failed to fetch books");
            toast.error(response.message || "Failed to fetch books");
          }

          const res1 = await fetch(`/api/books/get`);

          const response1 = await res1.json();

          if (res1.ok) {
            setAllBooks(response1.data.books);
          } else {
            setError(response1.message || "Failed to fetch books");
          }
        }
      } catch (error) {
        console.log(error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser.data.user._id) {
      fetchBooks();
    }
  }, [currentUser.data.user._id]);

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    date.setHours(date.getHours() - 5);
    date.setMinutes(date.getMinutes() - 30);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Calculate total rent
  const totalRent = books.reduce((total, transaction) => {
    const lastRentAmount = transaction.rentAmount[transaction.rentAmount.length - 1] || 0;
    return total + Math.abs(lastRentAmount); // Use Math.abs to avoid negative values
  }, 0);

  if (error) return <div>Error: {error}</div>;
  if (loading) return <ReactSpinner />;
  return (
    <div className="container mx-auto p-4">
      {!currentUser.data.user?.isAdmin ? (
        <>
          <h1 className="text-3xl font-bold mb-4 text-center text-gray-800 dark:text-gray-200">
            Book Transaction History
          </h1>
          {books.length > 0 && !loading ? (
            <div className="bg-white shadow-lg rounded-lg dark:bg-gray-800">
              {/* Display Total Rent */}
              <div className="p-4 text-center">
                <h2 className="text-2xl font-semibold">Total Rent: ₹{totalRent}</h2>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-5 gap-4 bg-gray-200 dark:bg-gray-700 p-4 rounded-t-lg">
                <div className="text-center text-gray-800 dark:text-gray-200 row-span-2">Book</div>
                <div className="text-center text-gray-800 dark:text-gray-200">Issue Date</div>
                <div className="text-center text-gray-800 dark:text-gray-200">Return Date</div>
                <div className="text-center text-gray-800 dark:text-gray-200">Status</div>
                <div className="text-center text-gray-800 dark:text-gray-200">All History</div>
              </div>
              {books.map((transaction, index) => (
                <div key={index} className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-5 border-t dark:border-gray-600 p-4 items-center">
                  <div className="flex justify-center row-span-2">
                    {transaction.bookId?.cover ? (
                      <img
                        className="w-[60px] h-[90px] object-cover" // Adjusted size for mobile
                        src={transaction.bookId?.cover}
                        alt="Book Cover"
                      />
                    ) : (
                      "Unknown Book"
                    )}
                  </div>
                  <div className="text-center text-gray-700 dark:text-gray-300">
                    {formatDate(transaction.issueDate[transaction.issueDate.length - 1])}
                  </div>
                  <div className="text-center text-gray-700 dark:text-gray-300">
                    {transaction.returnDate[transaction.returnDate.length - 1] !== null &&
                    transaction.status === "returned"
                      ? formatDate(transaction.returnDate[transaction.returnDate.length - 1])
                      : "Not Returned Yet"}
                  </div>
                  <div
                    className={`font-semibold text-center ${
                      transaction.status === "rented"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {transaction.status === "rented" ? "Rented" : "Returned"}
                  </div>

                  <div className="text-center text-xl">
                    <Link
                      to="/prevHistory"
                      state={{ transaction: transaction }}
                      className="text-blue-500 hover:underline dark:text-blue-300"
                    >
                      <i className="ri-history-line"></i>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-700 dark:text-gray-300">
              No transaction history available for this user.
            </div>
          )}
        </>
      ) : (
        <div className="max-w-full mx-auto p-3">
          {allBooks && allBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {allBooks.map((book) => (
                <UserBookCard key={book._id} book={book} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[90vh] w-full">
              <h1 className="text-3xl text-gray-500">No Books Available...</h1>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserHistory;
