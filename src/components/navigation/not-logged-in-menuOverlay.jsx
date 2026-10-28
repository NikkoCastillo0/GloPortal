export default function MenuOverlay({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-[90] bg-black/40"
                onClick={onClose}
                aria-hidden="true"
            />

            <div className="fixed right-4 top-4 z-[100] w-72 rounded-2xl bg-white p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-bold text-black">
                        Menu
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close menu"
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-3xl leading-none text-black transition hover:bg-gray-100 hover:text-gray-600"
                    >
                        &times;
                    </button>
                </div>

            <nav className="mt-6 flex flex-col gap-2 text-lg">
                <div className="flex flex-col gap-2 md:hidden">
                    <a
                        href="/"
                        onClick={onClose}
                        className="rounded-lg px-4 py-3 font-semibold text-black transition hover:bg-gray-100"
                    >
                        Home
                    </a>

                    <a
                        href="/#services"
                        onClick={onClose}
                        className="rounded-lg px-4 py-3 font-semibold text-black transition hover:bg-gray-100"
                    >
                        Services
                    </a>

                    <a
                        href="/#calendar"
                        onClick={onClose}
                        className="rounded-lg px-4 py-3 font-semibold text-black transition hover:bg-gray-100"
                    >
                        Calendar
                    </a>

                    <a
                        href="/#contact"
                        onClick={onClose}
                        className="rounded-lg px-4 py-3 font-semibold text-black transition hover:bg-gray-100"
                    >
                        Contact
                    </a>

                    <div className="my-3 border-t border-gray-200" />
                </div>
                
                <a
                    href="/login"
                    onClick={onClose}
                    className="rounded-lg px-4 py-3 font-semibold text-black transition hover:bg-gray-100"
                >
                    Login
                </a>

                <a
                    href="/signup"
                    onClick={onClose}
                    className="rounded-lg bg-black px-4 py-3 text-center font-semibold text-white transition hover:bg-gray-700"
                >
                    Sign Up
                </a>
            </nav>
            </div>
        </>
    );
}
