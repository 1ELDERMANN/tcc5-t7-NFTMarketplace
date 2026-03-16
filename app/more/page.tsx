'use client';

export default function More() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-8">More</h1>
      <ul className="max-w-md mx-auto space-y-4 text-xl">
        <li className="bg-gray-800 p-4 rounded hover:bg-gray-700 transition cursor-pointer">Settings</li>
        <li className="bg-gray-800 p-4 rounded hover:bg-gray-700 transition cursor-pointer">Privacy Policy</li>
        <li className="bg-gray-800 p-4 rounded hover:bg-gray-700 transition cursor-pointer">Terms of Service</li>
        <li className="bg-gray-800 p-4 rounded hover:bg-gray-700 transition cursor-pointer">FAQ</li>
        <li className="bg-gray-800 p-4 rounded hover:bg-gray-700 transition cursor-pointer">Contact Us</li>
      </ul>
    </div>
  );
}