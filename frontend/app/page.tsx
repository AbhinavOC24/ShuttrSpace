import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center text-white">
      <h1 className="text-4xl font-bold mb-4">Welcome to ShuttrSpace</h1>
      <Link
        href="/u/"
        className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition"
      >
        Go To Profile
      </Link>
    </div>
  );
}
