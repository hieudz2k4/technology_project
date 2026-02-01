"use client";

type Product = {
    id: string;
    name: string;
    price: string;
    image: string; // Emoji or URL
    link: string;
    desc: string;
};

const PRODUCTS: Product[] = [
    {
        id: "1",
        name: "Áo Đấu Việt Nam 2024",
        price: "250.000đ",
        image: "👕",
        link: "#", // Replace with actual affiliate link
        desc: "Chất liệu thun lạnh cao cấp, thấm hút mồ hôi.",
    },
    {
        id: "2",
        name: "Lá Cờ Tổ Quốc (1m x 1.5m)",
        price: "50.000đ",
        image: "🇻🇳",
        link: "#",
        desc: "Vải phi bóng bền màu, kích thước tiêu chuẩn.",
    },
    {
        id: "3",
        name: "Kèn Vuvuzela Cổ Vũ",
        price: "30.000đ",
        image: "🎺",
        link: "#",
        desc: "Âm thanh vang dội, khuấy động không khí.",
    },
    {
        id: "4",
        name: "Băng Đô 'Việt Nam Vô Địch'",
        price: "10.000đ",
        image: "🎀",
        link: "#",
        desc: "Phụ kiện không thể thiếu khi đi bão.",
    },
];

type Props = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
};

export default function AffiliateModal({ isOpen, setIsOpen }: Props) {
    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full font-bold transition-all hover:scale-105 flex items-center gap-2 group shadow-[0_0_15px_rgba(255,215,0,0.3)] hover:shadow-[0_0_25px_rgba(255,215,0,0.5)]"
            >
                <span className="text-xl group-hover:animate-bounce">🛒</span>
                <span className="hidden sm:inline">Mua Đồ Cổ Vũ</span>
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">

                    {/* Modal Content */}
                    <div className="bg-neutral-900 border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200">

                        {/* Header */}
                        <div className="sticky top-0 z-10 bg-neutral-900/95 backdrop-blur border-b border-white/10 p-6 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">
                                    Gian Hàng Cổ Động Viên
                                </h2>
                                <p className="text-neutral-400 text-sm mt-1">
                                    Sản phẩm chất lượng - Tiếp lửa đam mê
                                </p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Product Grid */}
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {PRODUCTS.map((product) => (
                                <div
                                    key={product.id}
                                    className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col items-center text-center hover:bg-white/10 transition-colors group"
                                >
                                    <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                                        {product.image}
                                    </div>
                                    <h3 className="text-white font-bold text-lg mb-1">
                                        {product.name}
                                    </h3>
                                    <p className="text-yellow-400 font-mono font-bold mb-2">
                                        {product.price}
                                    </p>
                                    <p className="text-neutral-400 text-xs mb-4 flex-grow">
                                        {product.desc}
                                    </p>
                                    <a
                                        href={product.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-lg shadow-red-900/20"
                                    >
                                        Mua Ngay
                                    </a>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/10 text-center text-neutral-500 text-xs">
                            *Các đường dẫn trên là liên kết tiếp thị liên kết (Affiliate Links). Ủng hộ shop là ủng hộ đội ngũ phát triển!
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
