import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function AllHistoryAdmin() {
  const [historyData, setHistoryData] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [books, setBooks] = useState([]);
  const [shouldFetchOnMount, setShouldFetchOnMount] = useState(true);

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  useEffect(() => {
    console.log("useEffect");

    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/transaction/userBooks");
        const data = await res.json();
        setHistoryData(data.data.transaction);

        const processed = data.data.transaction
          .map((item) => ({
            bookName: item.bookId.bookName,
            cover: item.bookId.cover,
            status: item.status,
            entries: item.issueDate.map((issueDate, index) => ({
              issueDate: new Date(issueDate),
              returnDate: new Date(item.returnDate[index]),
              rentAmount: item.rentAmount[index],
            })),
          }))
          .map((item) => ({
            ...item,
            entries: item.entries.sort((a, b) => b.issueDate - a.issueDate),
          }));

        const flattened = processed
          .flatMap((item) =>
            item.entries.map((entry) => ({
              bookName: item.bookName,
              cover: item.cover,
              issueDate: entry.issueDate,
              returnDate: entry.returnDate,
              rentAmount: entry.rentAmount,
              status: item.status,
            }))
          )
          .sort((a, b) => b.issueDate - a.issueDate);

        setProcessedData(flattened);
      } catch (error) {
        console.error("Error fetching history data:", error);
      }
    };
    fetchHistory();
  }, [shouldFetchOnMount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let searchQuery = "";
    try {
      if (startDate || endDate) {
        // setShouldFetchOnMount(false);
        setBooks([]);

        if (startDate) {
          searchQuery += `firstDate=${startDate.toLocaleDateString("en-IN")}&`;
        }
        if (endDate) {
          searchQuery += `secondDate=${endDate.toLocaleDateString("en-IN")}`;
        }

        const res = await fetch(
          `/api/transaction/findBookByUserAndDateRange?${searchQuery}`
        );

        const response = await res.json();
        if (response.success) {
          setBooks(response.data);

          const processed = response.data
            .map((item) => ({
              bookName: item.bookId.bookName,
              cover: item.bookId.cover,
              status: item.status,
              entries: item.issueDate.map((issueDate, index) => ({
                issueDate: new Date(issueDate),
                returnDate: new Date(item.returnDate[index]),
                rentAmount: item.rentAmount[index],
              })),
            }))
            .map((item) => ({
              ...item,
              entries: item.entries.sort((a, b) => b.issueDate - a.issueDate),
            }));

          const flattened = processed
            .flatMap((item) =>
              item.entries
                .filter((entry) => entry.issueDate >= startDate)
                .map((entry) => ({
                  bookName: item.bookName,
                  cover: item.cover,
                  issueDate: entry.issueDate,
                  returnDate: entry.returnDate,
                  rentAmount: entry.rentAmount,
                  status: item.status,
                }))
            )
            .sort((a, b) => b.issueDate - a.issueDate);

          setProcessedData(flattened);

          if (searchQuery) toast.success(response.message);
        } else {
          console.log("here");
          setProcessedData([]);
          if (
            response.message.includes("Return date must be earlier than today.")
          ) {
            setShouldFetchOnMount(false);
          } else {
            setProcessedData([]);
          }

          if (response.message.includes("Invalid Token")) {
            toast.error("Please login");
          } else {
            toast.error(response.message);
          }
          return;
        }
      } else {
        toast.error("Please select start and end date");
      }
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  return (
    <div className="p-5 w-full bg-gray-100 dark:bg-gray-900 min-h-screen flex flex-col items-center">
      <div className="p-5 md:p-10 flex flex-col md:flex-row gap-4 items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row items-center justify-center gap-4 w-full"
        >
          <div className="flex flex-col md:flex-row items-center gap-4">
            <label className="text-xl">Issue Date:</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="dd/MM/yyyy"
              className="border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded px-2 py-1 flex-grow"
            />
          </div>

          {/* <div className="flex flex-col md:flex-row items-center gap-4">
            <label className="text-xl">End Date:</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="dd/MM/yyyy"
              className="border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded px-2 py-1 flex-grow"
            />
          </div> */}

          <div className="flex gap-3">
            <button
              type="submit"
              className="border-2 font-semibold border-green-500 text-green-500 rounded-full px-6 py-2 hover:bg-green-500 hover:text-white transition duration-200"
            >
              Search
            </button>
            <div
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
                setShouldFetchOnMount((prev) => !prev);
                toast.info("Cleared");
              }}
              className="border-2 font-semibold border-red-700 text-red-700 rounded-full px-6 py-2 hover:bg-red-700 hover:text-white transition duration-200 cursor-pointer"
            >
              Clear
            </div>
          </div>
        </form>
      </div>
      <h1 className="text-3xl font-bold mb-5 text-center text-gray-800 dark:text-gray-200">
        Transaction History
      </h1>
      <div className="w-full max-w-5xl overflow-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-gray-200 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">
                Book Name
              </th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">
                Issue Date
              </th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">
                Return Date
              </th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">
                Rent Amount
              </th>
              <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="">
            {processedData.length > 0 ? (
              processedData.map((entry, index) => (
                <tr key={index} className="border-t dark:border-gray-700">
                  <td className="px-4 py-2 text-gray-800 dark:text-gray-300">
                    <div className="flex items-center">
                      <img
                        src={entry.cover}
                        alt={entry.bookName}
                        className="w-10 h-10 mr-3 rounded-md"
                      />
                      {entry.bookName}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-gray-700 dark:text-gray-400">
                    {formatDate(entry.issueDate)}
                  </td>
                  <td className="px-4 py-2 text-gray-700 dark:text-gray-400">
                    {formatDate(entry.returnDate)}
                  </td>
                  <td className="px-4 py-2 text-gray-700 dark:text-gray-400">
                    ₹{entry.rentAmount}
                  </td>
                  <td
                    className={`px-4 py-2 ${
                      entry.status === "returned"
                        ? "text-red-500"
                        : entry.status === "issued"
                        ? "text-green-500"
                        : ""
                    }`}
                  >
                    {entry.status}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-2 text-center text-gray-500 dark:text-gray-400"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
