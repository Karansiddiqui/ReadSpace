/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Modal from "./Modal";

export default function UserBookCard({
  book,
  transactionId,
  issueDate,
  setDeleteBook,
}) {
  const { currentUser } = useSelector((state) => state.user);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [totalRent, setTotalRent] = useState(0);
  const [totalRentByBook, setTotalRentByBook] = useState(0);

  function currentDate() {
    let time = new Date();
    let indianTime = new Date(time.getTime() + 5.5 * 60 * 60 * 1000);
    return indianTime;
  }

  const calculateDaysLeft = () => {
    const lastIssueDate = new Date(
      transactionId?.returnDate[transactionId?.returnDate.length - 1]
    );
    const today = currentDate();

    const timeDifference = lastIssueDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDifference / (1000 * 3600 * 24));

    return daysLeft >= 0 ? daysLeft : 0;
  };

  return (
    <div>
      <div className="group relative w-[370px] sm:w-[430px] border-2 border-gray-300 dark:border-gray-700 h-[330px] overflow-hidden rounded-lg transition-all shadow-lg book-card">
        <div className="m-3 flex">
          <div className="flex-1">
            <Link to={`/book-detail/${book._id}`}>
              <img
                src={book.cover}
                alt="book cover"
                className="h-[300px] w-[200px] rounded-md object-cover z-20"
              />
            </Link>
          </div>

          <div className="flex-1 p-4 relative">
            <div className="relative">
              <div className=" absolute border text-center w-fit right-[-15px] top-[-15px] border-gray-700 dark:border-gray-500 rounded-full px-3 py-1 text-[11px] font-mono text-gray-700 dark:text-gray-400">
                <span className="font-semibold">{book.category}</span>
              </div>
              <div className=" absolute text-center w-fit left-0 top-[-15px] border-gray-700 dark:border-gray-500 rounded-full text-xs font-mono text-gray-700 dark:text-gray-400">
                {!currentUser?.data.user.isAdmin &&
                  transactionId &&
                  transactionId.status === "rented" &&
                  transactionId.userId._id === currentUser.data.user._id && (
                    <button className="cursor-auto border-red-700 font-semibold text-red-700 rounded-3xl transition">
                      {calculateDaysLeft()}{" "}
                      {calculateDaysLeft() === 1 ? "day left" : "days left"}
                    </button>
                  )}
              </div>
            </div>

            <div className="mt-[70px] flex flex-col gap-8 bg-white dark:bg-black rounded-b-lg w-full items-center text-center">
              <p className="text-xl font-semibold line-clamp-2 text-gray-800 dark:text-white">
                {book.bookName}
              </p>

              {!currentUser?.data.user.isAdmin &&
                (transactionId &&
                transactionId.status === "rented" &&
                transactionId.userId._id === currentUser.data.user._id ? (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col">
                      Rent Paid{" "}
                      <span className="text-green-500 font-semibold ml-2 ">
                        {
                          transactionId.rentAmount[
                            transactionId.rentAmount.length - 1
                          ]
                        }
                      </span>
                    </div>

                    <button className="border-2 border-red-700 px-6 py-1 font-semibold text-red-700 rounded-3xl hover:bg-red-700 hover:text-white transition">
                      Read
                    </button>
                  </div>
                ) : (
                  <Link to={`/book-detail/${book._id}`}>
                    <button className="border-2 border-red-700 px-8 py-1 font-semibold text-red-700 rounded-3xl hover:bg-red-700 hover:text-white transition">
                      Detail
                    </button>
                  </Link>
                ))}
            </div>
            <div className="absolute bottom-6 left-4 right-4 flex justify-between text-gray-400 text-sm">
              <p>Buy</p>
              <p className="dark:text-white">
                <span>Rs. </span>
                {book.oneTimePrice}
              </p>
            </div>

            <div className="absolute bottom-1 left-4 right-4 flex justify-between text-gray-400 text-sm">
              <p>Rent (Per Day)</p>
              <p className="dark:text-white">
                <span>Rs. </span>
                {book.rentPerDay}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
