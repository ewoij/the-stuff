import Link from "next/link";
import { Logo } from "@/components/logo";

export function NavBar() {
  return (
    <header className="border-b">
      <div className="flex h-14 items-center px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <Logo className="size-7" />
          The Stuff
        </Link>
      </div>
    </header>
  );
}
