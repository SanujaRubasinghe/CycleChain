"use client"; // only if you need client-side interactivity (like handling form submission in browser)

import React from "react";

export default function FormPage() {
  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">Feedback Form</h1>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            className="w-full border rounded p-2"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            className="w-full border rounded p-2"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Feedback</label>
          <textarea
            className="w-full border rounded p-2"
            rows={4}
            placeholder="Write your feedback here..."
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
