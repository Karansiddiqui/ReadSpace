
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {ReactSpinner} from "../components/ReactSpinner"

export const PastUser = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [book, setBook] = useState(location.state?.book);
  const [transaction, setTransaction] = useState(location.state?.book);

  useEffect(() => {
    const fetchPastUsers = async () => {
      try {
        const res = await fetch(
          `/api/transaction/userBooks?bookId=${book?._id}`
        );
        const response = await res.json();
        console.log(response);

        if (response.success) {
          setUsers(response.data.pastUser);
          setTransaction(response.data);
          // toast.success(response.message);
        } else {
          setError(response.message);
          toast.error(response.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPastUsers();
  }, [book]);

  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    let revenue = 0;

    users
      .slice()
      .sort((a, b) => {
        const aIssueDate = new Date(a.issueDate[0]);
        const bIssueDate = new Date(b.issueDate[0]);
        return bIssueDate - aIssueDate;
      })
      .reverse()
      .forEach((user) => {
        let rentedCount = 0;

        user.rentAmount.forEach((rent, index) => {
          if (
            user.status !== "rented" ||
            rentedCount < user.rentAmount.length - 1
          ) {
            revenue += rent;
            console.log("revenue", rent);
          }

          if (user.status === "rented") {
            rentedCount++;
          }
        });
      });

    setTotalRevenue(revenue);
  }, [users]);
  console.log("users ", users);

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


  if (loading) return  <ReactSpinner/>

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-gray-200">
        Past Users
      </h1>

      <div className="flex justify-center mb-4">
        {users[0] ? (
          <img
            src={users[0].bookId.cover}
            alt={users[0].bookId.bookName}
            className="w-40 h-auto rounded-lg shadow-md"
          />
        ) : (
          <div>
            <img
              className="w-40 h-auto rounded-lg shadow-md"
              src={book?.cover}
            ></img>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center mb-10">
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200">
          Total revenue{" "}
          <span className="ml-2 text-green-600 text-3xl">
            Rs. {totalRevenue}
          </span>
        </h1>
      </div>

      {!loading && users.length > 0 ? (
        <div className="bg-white shadow-lg rounded-lg dark:bg-gray-800">
          {/* Table Header */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 p-4 border-b bg-gray-200 dark:bg-gray-700">
            <div className="font-bold text-center text-gray-800 dark:text-gray-200">
              User Name
            </div>
            <div className="font-bold text-center text-gray-800 dark:text-gray-200">
              Email
            </div>
            <div className="font-bold text-center text-gray-800 dark:text-gray-200">
              Issue Date
            </div>
            <div className="font-bold text-center text-gray-800 dark:text-gray-200">
              Return Date
            </div>
            <div className="font-bold text-center text-gray-800 dark:text-gray-200">
              Rent Paid
            </div>
          </div>

          {users
            .slice()
            .sort((a, b) => {
              const aIssueDate = new Date(a.issueDate[0]);
              const bIssueDate = new Date(b.issueDate[0]);
              return bIssueDate - aIssueDate;
            })
            .map((user, userIndex) =>
              user.returnDate.map(
                (returnDateItem, returnIndex) =>
                  returnIndex < user.returnDate.length - 1 ? ( // Use ternary operator for conditional rendering
                    <div
                      key={`${userIndex}-${returnIndex}`}
                      className="grid grid-cols-1 sm:grid-cols-5 gap-4 p-4 border-b dark:border-gray-600"
                    >
                      <div className="text-center text-gray-700 dark:text-gray-300">
                        {user.userId.fullName}
                      </div>
                      <div className="text-center text-gray-700 dark:text-gray-300">
                        {user.userId.email}
                      </div>
                      <div className="text-center text-gray-700 dark:text-gray-300">
                        {formatDate(user.issueDate[returnIndex])}
                      </div>
                      <div className="text-center text-gray-700 dark:text-gray-300">
                        {formatDate(returnDateItem)}{" "}
                        {/* Use returnDateItem directly */}
                      </div>
                      <div className="text-center text-green-400 dark:text-green-400 font-semibold">
                        {"Rs. " + user.rentAmount[returnIndex]}
                      </div>
                    </div>
                  ) : null // Return null if condition is not met
              )
            )}
        </div>
      ) : (
        <div className="text-center text-gray-700 dark:text-gray-300">
          No Past User.
        </div>
      )}
    </div>
  );
};
