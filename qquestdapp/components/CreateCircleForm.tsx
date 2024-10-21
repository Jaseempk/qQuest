import { useState } from "react";

export default function CreateCircleForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [leadTime, setLeadTime] = useState("14-10-2024");
  const [repaymentDuration, setRepaymentDuration] = useState("14-12-2024");
  const [amount, setAmount] = useState(1000);
  const [collateral, setCollateral] = useState("0.7 ETH ($1800)");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log({
      title,
      description,
      leadTime,
      repaymentDuration,
      amount,
      collateral,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-400"
        >
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Buy sneakers"
          className="mt-1 block w-full rounded-md bg-gray-900 border-gray-700 text-white"
        />
      </div>
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-400"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add description"
          className="mt-1 block w-full rounded-md bg-gray-900 border-gray-700 text-white"
        />
      </div>
      <div className="flex space-x-4">
        <div className="flex-1">
          <label
            htmlFor="leadTime"
            className="block text-sm font-medium text-gray-400"
          >
            Lead time
          </label>
          <select
            id="leadTime"
            value={leadTime}
            onChange={(e) => setLeadTime(e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-900 border-gray-700 text-white"
          >
            <option>14-10-2024</option>
            {/* Add more options as needed */}
          </select>
        </div>
        <div className="flex-1">
          <label
            htmlFor="repaymentDuration"
            className="block text-sm font-medium text-gray-400"
          >
            Repayment Duration
          </label>
          <select
            id="repaymentDuration"
            value={repaymentDuration}
            onChange={(e) => setRepaymentDuration(e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-900 border-gray-700 text-white"
          >
            <option>14-12-2024</option>
            {/* Add more options as needed */}
          </select>
        </div>
      </div>
      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-400"
        >
          Amount
        </label>
        <input
          type="range"
          id="amount"
          min="0"
          max="2000"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="mt-1 block w-full"
        />
        <div className="flex justify-between">
          <span>$0</span>
          <span>${amount}</span>
          <span>$2000</span>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <label className="block text-sm font-medium text-gray-400">
            Collateral
          </label>
          <span className="text-white">{collateral}</span>
        </div>
        <div className="bg-gray-900 border border-gray-700 rounded-md px-3 py-1">
          ${amount * 1.2}
        </div>
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
      >
        Create Circle
      </button>
    </form>
  );
}
