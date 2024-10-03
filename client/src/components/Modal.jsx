import React, { useState } from "react";
import PropTypes from "prop-types";

Modal.propTypes = {
  rentAmount: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default function Modal({ rentAmount, onClose, onConfirm }) {
  const [days, setDays] = useState("");

  const totalRent = days ? days * rentAmount : 0;

  const handleDaysChange = (e) => {
    const inputDays = parseInt(e.target.value, 10);
    setDays(isNaN(inputDays) ? "" : inputDays);
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    onConfirm(days);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60">
      <form
        className="bg-white dark:bg-gray-900 rounded-2xl p-8 w-[400px] shadow-xl relative transition-transform duration-300 transform scale-100 hover:scale-105"
        onSubmit={handleConfirm}
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Rent the Book
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Enter the number of days you want to rent the book for:
        </p>

        <div className="mb-6">
          <input
            type="number"
            placeholder="Enter days"
            value={days}
            onChange={handleDaysChange}
            required
            min={1}
            className="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all dark:bg-gray-800 dark:text-white dark:border-gray-600"
          />
        </div>

        <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-6">
          Total Rent: <span className="font-bold">Rs. {totalRent}</span>
        </p>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg font-medium text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg"
          >
            Confirm Payment
          </button>
        </div>
      </form>
    </div>
  );
}
