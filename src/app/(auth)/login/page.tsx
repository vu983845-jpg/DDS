import { ExternalLink, ArrowRight, AlertCircle } from 'lucide-react'

const NEW_URL = 'https://intersnack.online/downtime'

export default function LoginPage() {
    return (
        <div className="flex min-h-screen w-full bg-white">
            {/* Left side: branding/image */}
            <div className="relative hidden w-1/2 flex-col bg-slate-900 justify-between p-10 lg:flex overflow-hidden">
                {/* Background image */}
                <div className="absolute inset-0 w-full h-full">
                    <img
                        src="/bg-login.png"
                        alt="Factory Dashboard Background"
                        className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/60 to-transparent"></div>
                </div>

                <div className="relative z-10 flex items-center gap-2">
                    <div className="h-10 w-10 flex items-center justify-center bg-white rounded-md shadow-sm">
                        <img src="/logo.jpg" alt="Logo" className="h-8 object-contain" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">DDS Meeting</span>
                </div>

                <div className="relative z-10 max-w-lg mt-auto mb-8">
                    <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-6">
                        Production Efficiency <br/>
                        <span className="text-[#4F46E5]">At Your Fingertips</span>
                    </h1>
                    <p className="text-lg text-slate-300">
                        Record downtime events, streamline daily direction setting, and maintain peak manufacturing performance with our integrated dashboard.
                    </p>
                </div>

                <div className="relative z-10 text-slate-400 text-sm flex justify-between">
                    <span>&copy; {new Date().getFullYear()} Intersnack Group</span>
                    <span>Internal Tool</span>
                </div>
            </div>

            {/* Right side: Migration notice */}
            <div className="flex w-full flex-col justify-center px-4 sm:px-6 lg:w-1/2 lg:px-20 xl:px-32 relative bg-white animate-in fade-in slide-in-from-right-8 duration-700">

                {/* Mobile Header */}
                <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
                    <div className="h-8 w-8 flex items-center justify-center bg-white rounded-md shadow-sm border">
                        <img src="/logo.jpg" alt="Logo" className="h-6 object-contain" />
                    </div>
                    <span className="text-lg font-bold text-[#4F46E5] tracking-tight">DDS Meeting</span>
                </div>

                <div className="mx-auto w-full max-w-sm sm:max-w-md mt-16 lg:mt-0 space-y-8">

                    {/* Notice banner */}
                    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-5 py-4 text-sm animate-in slide-in-from-top-4 duration-500">
                        <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-amber-500" />
                        <span>
                            Hệ thống này đã <strong>ngừng hoạt động</strong>. Vui lòng chuyển sang nền tảng mới để tiếp tục ghi nhận downtime và tham dự cuộc họp DDS.
                        </span>
                    </div>

                    {/* Main card */}
                    <div className="space-y-4">
                        <div className="mb-6">
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Hệ thống đã chuyển</h2>
                            <p className="text-slate-500">
                                Tất cả dữ liệu và tính năng đã được di chuyển sang nền tảng mới tại địa chỉ dưới đây. Nhấn vào nút để truy cập.
                            </p>
                        </div>

                        {/* Destination URL display */}
                        <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-sm overflow-hidden">
                                <ExternalLink className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                <span className="text-slate-600 truncate font-mono">{NEW_URL}</span>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <a
                            href={NEW_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] active:scale-[0.98] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg shadow-indigo-200 text-base"
                        >
                            Truy cập hệ thống mới
                            <ArrowRight className="h-4 w-4" />
                        </a>

                        <p className="text-center text-xs text-slate-400 pt-2">
                            Nếu gặp sự cố, liên hệ bộ phận IT hoặc quản lý trực tiếp.
                        </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
                        &copy; {new Date().getFullYear()} Intersnack Group &middot; Internal Tool
                    </div>
                </div>
            </div>
        </div>
    )
}
