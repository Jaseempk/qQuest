import { useState } from "react";

interface NumericKeypadProps {
  onAmountChange: (amount: string) => void;
}

export default function NumericKeypad({ onAmountChange }: NumericKeypadProps) {
  const [amount, setAmount] = useState("0.000");

  const handleKeyPress = (key: string) => {
    let newAmount = amount;
    if (key === "." && !amount.includes(".")) {
      newAmount += ".";
    } else if (key !== ".") {
      if (amount === "0.000") {
        newAmount = key;
      } else {
        newAmount += key;
      }
    }
    setAmount(newAmount);
    onAmountChange(newAmount);
  };

  return (
    <div className="mt-4">
      <div className="text-center mb-4">
        <span className="text-4xl font-bold">{amount}</span>
        <span className="text-2xl ml-2">USDC</span>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0].map((key) => (
          <button
            key={key}
            className="bg-gray-800 text-white rounded-lg py-3 text-xl font-semibold"
            onClick={() => handleKeyPress(key.toString())}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
}
