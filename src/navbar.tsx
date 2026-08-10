export default function Navbar() {
    return (
        <>
        <nav className="mx-auto max-w-8xl bg-[#60f] px-6 h-20 flex items-center justify-between sticky top-0 z-50 shadow-md">
            <a href="/" className="max-w-10 font-bold tracking-tight text-lg text-[#00ff88] leading-5 font-mplus">
                <img src="/icon.png" className="max-w-15 filter drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)] brightness-100 scale-100 transition-all duration-300 ease-out hover:brightness-140 hover:scale-110 hover:animate-bounce"/>
            </a>
        </nav>
        </>
    )
}