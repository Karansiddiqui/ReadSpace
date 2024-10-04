import { useEffect, useState, useMemo } from "react";
import BookCard from "../components/BookCard";
import { useSelector } from "react-redux";
const RentedBooks = () => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const {currentUser} = useSelector((state) => state.user);
  // const [allBooks, setAllBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch(
          `/api/transaction/userBooks?rented=${"rented"}&userId=${
            currentUser?.data.user._id
          }`
        );
        const response = await res.json();
        if (res.ok) {
          setBooks(response.data.currentHoldingBookUser);
        }
        

        // const allBooksRes = await fetch("/api/books/get");
        // const allBooksResponse = await allBooksRes.json();
        // if (allBooksResponse.success) {
        //   setAllBooks(allBooksResponse.data);
        // }
      } catch (error) {
        console.log(error.message);
        setError(error.message);
      }
    };
    fetchBooks();
  }, []);

  const rentedBooks = useMemo(
    () =>
      books
        .filter((book) => book.status === "rented")
        .map((book) => (
          <BookCard
            key={book._id}
            book={book.bookId}
            transactionId={book}
            issueDate={book.issueDate}
          />
        )),
    [books]
  );

  return (
    <div className="max-w-[2380px] mx-auto p-3 flex flex-col gap-8 py-7">
      <div>
        <h1 className="text-4xl w-full font-bold text-center my-4">
          Rented Books
        </h1>
      </div>
      <div className="">
        <div className="flex flex-wrap items-center justify-center gap-14">
          {rentedBooks.length > 0 ? (
            rentedBooks
          ) : (
            <div className="w-full h-screen flex justify-center pt-72">
              <h1 className="text-3xl text-gray-500">No Books Rented</h1>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RentedBooks;
