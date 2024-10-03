import React from "react";
import { useLocation } from "react-router-dom";

const PrevHistry = () => {
  const location = useLocation();
  const { transaction } = location.state || {};

  if (!transaction) {
    return <div>No transaction data available.</div>;
  }

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    date.setHours(date.getHours() - 5); // Adjust as needed
    date.setMinutes(date.getMinutes() - 30); // Adjust as needed
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };


  const sortedTransactions = transaction.issueDate
    .map((issueDate, index) => ({
      issueDate,
      returnDate: transaction.returnDate[index],
      status: transaction.returnDate[index] == null ? "rented" : "returned",
      rentAmount: transaction.rentAmount[index],
    }))
    .sort((a, b) => {
  
      if (a.status === "rented" && b.status === "returned") {
        return -1;
      }
      if (a.status === "returned" && b.status === "rented") {
        return 1;
      }

      const returnDateA = a.returnDate ? new Date(a.returnDate) : -Infinity;
      const returnDateB = b.returnDate ? new Date(b.returnDate) : -Infinity;
      return returnDateB - returnDateA; // Descending order
    });

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-gray-200">
        Previous Transaction Details
      </h1>

      <div className="flex justify-center mb-4">
        {transaction.bookId?.cover ? (
          <img
            className="w-[300px] object-cover"
            src={transaction.bookId?.cover}
            alt="Book Cover"
          />
        ) : (
          <div className="w-[300px] h-[400px] bg-gray-300 flex items-center justify-center">
            No Cover Image
          </div>
        )}
      </div>

      <div className="flex justify-center text-gray-700 dark:text-gray-300 mb-4">
        {transaction.bookId?.bookName || "Unknown Title"}
      </div>

      <div className="bg-white shadow-lg rounded-lg p-4 dark:bg-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-200 dark:bg-gray-700 p-2 text-center">
          <div className="font-bold text-gray-800 dark:text-gray-200">
            Issue Date
          </div>
          <div className="font-bold text-gray-800 dark:text-gray-200">
            Return Date
          </div>
          <div className="font-bold text-gray-800 dark:text-gray-200">
            Status
          </div>
          <div className="font-bold text-gray-800 dark:text-gray-200">
            Rent Amount
          </div>
        </div>
        {sortedTransactions.map((transaction, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t dark:border-gray-600 p-2 text-center"
          >
            <div className="flex justify-center items-center text-gray-700 dark:text-gray-300">
              {formatDate(transaction.issueDate)}
            </div>
            <div className="flex justify-center items-center text-gray-700 dark:text-gray-300">
              {transaction.returnDate
                ? formatDate(transaction.returnDate)
                : "Not Returned"}
            </div>
            <div
              className={`flex justify-center items-center font-semibold ${
                transaction.status === "rented"
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {transaction.status === "rented" ? "Rented" : "Returned"}
            </div>
            <div
              className={`flex justify-center items-center text-gray-700 ${
                transaction.status === "rented"
                  ? "text-green-500 "
                  : "text-red-700"
              }`}
            >
              {transaction.status === "rented"
                ? `+₹${transaction.rentAmount}`
                : transaction.rentAmount
                ? `-₹${transaction.rentAmount}`
                : "N/A"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrevHistry;
