import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import BookCard from "../components/BookCard";
import { toast } from "react-toastify";
import { Spinner } from "../components/Spinner";

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
            toast.error((response.message) || "Failed to fetch books");
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


  if (error) return <div>Error: {error}</div>;
  if (loading) return  <Spinner />
  return (
    <div className="container mx-auto p-6">
      {!currentUser.data.user?.isAdmin ? (
        <>
          <h1 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-gray-200">
            Book Transaction History
          </h1>
          {books.length > 0 && !loading ? (
            <div className="bg-white shadow-lg rounded-lg dark:bg-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-5 bg-gray-200 dark:bg-gray-700 p-4">
                <div className="text-center text-gray-800 dark:text-gray-200">Book</div>
                <div className="text-center text-gray-800 dark:text-gray-200">Issue Date</div>
                <div className="text-center text-gray-800 dark:text-gray-200">Return Date</div>
                <div className="text-center text-gray-800 dark:text-gray-200">Status</div>
                <div className="text-center text-gray-800 dark:text-gray-200">Rent</div>
              </div>
              {books.map((transaction, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 border-t dark:border-gray-600 p-4 items-center">
                  <div className="flex justify-center">
                    {transaction.bookId?.cover ? (
                      <img
                        className="w-[100px] h-[150px] object-cover"
                        src={transaction.bookId?.cover}
                        alt="Book Cover"
                      />
                    ) : (
                      "Unknown Book"
                    )}
                  </div>
                  <div className="text-center text-gray-700 dark:text-gray-300">
                    {formatDate(
                      transaction.issueDate[transaction.issueDate.length - 1]
                    )}
                  </div>
                  <div className="text-center text-gray-700 dark:text-gray-300">
                    {transaction.returnDate[transaction.returnDate.length - 1] !== null &&
                    transaction.status === "returned"
                      ? formatDate(transaction.returnDate[transaction.returnDate.length - 1])
                      : formatDate(transaction.returnDate[transaction.returnDate.length - 1])}
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
                  <div
                    className={`font-semibold text-center ${
                      transaction.status === "rented"
                        ? "text-red-500"
                        : "text-red-500"
                    }`}
                  >
                    {`-₹ ${transaction.rentAmount[transaction.rentAmount.length - 1]}`}
                  </div>
                  <div className="text-center">
                    <Link
                      to="/prevHistory"
                      state={{ transaction: transaction }}
                      className="text-blue-500 hover:underline dark:text-blue-300"
                    >
                      All History
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
        <div className="max-w-[2380px] mx-auto p-3 flex flex-col gap-8 py-7">
          {allBooks && allBooks.length > 0 ? (
            <div className="flex flex-wrap items-center justify-center gap-14">
              {allBooks.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          ) : (
            
            <div className="flex items-center justify-center h-[90vh] w-[90vh]">
 <h1 className="text-3xl text-gray-500">sdj...</h1>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserHistory;
