/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Modal from "./Modal";

export default function BookCard({
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

  const handleRentSubmit = async (bookId, days) => {
    try {
      const res = await fetch("/api/transaction/issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookId, days }),
      });
      if (res.ok) setModalOpen(false);

      const response = await res.json();
      if (res.ok) {
        toast.success(response.message);
      } else {
        toast.error(
          (response.message === "Invalid Access Token" && "Please Login") ||
            response.message ||
            "Failed to rent the book."
        );
        setModalOpen(false);
      }
    } catch (error) {
      toast.error("An error occurred while renting the book.");
      setModalOpen(false);
    }
  };

  const openModal = (transactionId, rentAmount) => {
    setTotalRent(rentAmount);
    setSelectedTransaction(transactionId);

    currentUser ? setModalOpen(true) : toast.error("Please Login");
  };

  const calculateDaysLeft = () => {
    const lastIssueDate = new Date(
      transactionId?.returnDate[transactionId?.returnDate.length - 1]
    );
    const today = currentDate();

    const timeDifference = lastIssueDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDifference / (1000 * 3600 * 24));

    return daysLeft >= 0 ? daysLeft : 0;
  };

  const handleDelete = async (bookId) => {
    setDeleteBook(bookId);
    try {
      const res = await fetch(`/api/books/delete/${bookId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Book deleted successfully");
        setDeleteBook(true);
      } else {
        const error = await res.json();
        toast.error(error.message);
      }
    } catch (error) {
      toast.error("An error occurred while deleting the transaction.");
    }
  };

  useEffect(() => {
    async function fetchTransactionData() {
      try {
        const res = await fetch(
          `/api/transaction/userBooks?bookId=${book?._id}`
        );
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }
        const response = await res.json();
        setTotalRentByBook(response.data.totalRent);
      } catch (error) {
        console.error("Failed to fetch transaction data:", error);
      }
    }

    fetchTransactionData();
  }, [book._id]);

  return (
    <div>
      <div className="group relative w-[370px] sm:w-[430px] border-2 border-gray-300 dark:border-gray-700 h-[330px] overflow-hidden rounded-lg transition-all shadow-lg book-card">
        <div className="m-3 flex">
          <div className="flex-1">
            <Link
              to={`/book-detail/${book._id}`}>
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
            </div>

            <div className="mt-[70px] flex flex-col gap-8 bg-white dark:bg-black rounded-b-lg w-full items-center text-center">
              <p className="text-xl font-semibold line-clamp-2 text-gray-800 dark:text-white">
                {book.bookName}
              </p>

             
                <div className=" flex flex-col gap-2">
                  <div className="absolute top-0 left-1 text-green-500 font-semibold">
                    ₹{totalRentByBook} Earnings
                  </div>

                  <Link to={"/dashboard?tab=pastuser"} state={{ book }}>
                    <button className="border-2 border-red-700 px-8 py-1 font-semibold text-red-700 rounded-3xl hover:bg-red-700 hover:text-white transition">
                      Past User
                    </button>
                  </Link>
                  <Link to={"/dashboard?tab=currentuser"} state={{ book }}>
                    <button className="border-2 border-red-700 px-8 py-1 font-semibold text-red-700 rounded-3xl hover:bg-red-700 hover:text-white transition">
                      Current User
                    </button>
                  </Link>

                  {/* Update Button for Admins */}
                  <Link to={`/create-book?bookId=${book._id}`}>
                    <button className=" absolute top-10 right-0 border-2 border-blue-700 px-4 font-semibold text-blue-700 rounded-3xl hover:bg-blue-700 hover:text-white transition">
                      Edit
                    </button>
                  </Link>

                  <button
                    onClick={() => handleDelete(book._id)}
                    className=" absolute top-10 left-3 border-2 border-red-700 px-4 font-semibold text-red-700 rounded-3xl hover:bg-red-700 hover:text-white transition"
                  >
                    Delete
                  </button>
                </div>
              
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
