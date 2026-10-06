function Profile() {
    return (
        <div className="min-h-screen bg-[#0f172a] text-[#0f172a] flex flex-col font-murecho">
            <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
                <article className="bg-[#effffa] backdrop-blur-md p-8 md:p-12 rounded-2xl shadow-xl border border-[#60f]/10">
                    {/* Menggunakan items-center untuk flex-col (layar kecil) dan lg:items-start saat flex-row (layar besar) */}
                    <div className="mx-auto flex flex-col lg:flex-row items-center lg:items-start gap-8">
                        <img 
                            src="/images/reidln.webp" 
                            alt="Profile" 
                            className="w-lg h-auto mb-0 object-cover mx-auto lg:mx-0" 
                        />
                        {/* Teks rata tengah di layar kecil (text-center) dan rata kiri di layar besar (lg:text-left) */}
                        <div>
                        <h1 className="text-[#60f] text-4xl font-bold mb-1 text-center lg:mt-20 lg:text-left">
                            Rei Dillan Hartedi
                        </h1>
                        <h2 className="text-[#60f]/50 text-2xl font-bold mb-4 text-center lg:text-left">
                            レイ・ディラン・ハルテディ
                        </h2>
                        </div>
                    </div>
                </article>
            </main>
        </div>
    );
}

export default Profile;