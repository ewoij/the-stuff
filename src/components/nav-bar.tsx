import Link from "next/link";

export function NavBar() {
  return (
    <header className="border-b">
      <div className="flex h-14 items-center px-4">
        <Link href="/" className="text-lg font-semibold">
          The Stuff
        </Link>
      </div>
    </header>
  );
}
