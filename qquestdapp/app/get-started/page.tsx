"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GetStarted() {
  const [name, setName] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      // Here you would typically save the name to your backend or local storage
      console.log("Name submitted:", name);
      router.push("/dashboard"); // Redirect to dashboard or next step
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black text-white">
      <h1 className="text-3xl font-bold mb-2">Let's get started</h1>
      <p className="text-gray-400 mb-8">
        Please enter your name to personalize your experience.
      </p>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full p-3 mb-4 bg-gray-800 rounded-lg text-white"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
