import { login } from './actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, ArrowRight } from 'lucide-react'
import { SubmitButton } from './submit-button'
import Image from 'next/image'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const params = await searchParams;
    const error = params?.error;

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
                        <span className="text-[#D83140]">At Your Fingertips</span>
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

            {/* Right side: Login form */}
            <div className="flex w-full flex-col justify-center px-4 sm:px-6 lg:w-1/2 lg:px-20 xl:px-32 relative bg-white animate-in fade-in slide-in-from-right-8 duration-700">
                
                {/* Mobile Header (Hidden on LG) */}
                <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
                    <div className="h-8 w-8 flex items-center justify-center bg-white rounded-md shadow-sm border">
                        <img src="/logo.jpg" alt="Logo" className="h-6 object-contain" />
                    </div>
                    <span className="text-lg font-bold text-slate-900 tracking-tight text-[#D83140]">DDS Meeting</span>
                </div>

                <div className="mx-auto w-full max-w-sm sm:max-w-md mt-16 lg:mt-0">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Welcome back</h2>
                        <p className="text-slate-500">Sign in to your account to access the dashboard and enter records.</p>
                    </div>

                    <form action={login} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 border border-red-200 text-sm p-4 rounded-lg flex items-start gap-3 animate-in slide-in-from-top-2">
                                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                <p className="font-medium">{error}</p>
                            </div>
                        )}
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
                                <Input 
                                    id="email" 
                                    name="email" 
                                    type="email" 
                                    placeholder="m@example.com" 
                                    required 
                                    className="h-11 px-4 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                                    <a href="#" className="text-sm font-medium text-[#D83140] hover:underline">Forgot password?</a>
                                </div>
                                <Input 
                                    id="password" 
                                    name="password" 
                                    type="password" 
                                    placeholder="••••••••"
                                    required 
                                    className="h-11 px-4 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <SubmitButton />
                        </div>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-100">
                        <p className="text-center text-sm text-slate-500">
                            Need just view-only access?{' '}
                            <a href="/" className="font-medium text-[#D83140] hover:text-[#b02733] hover:underline inline-flex items-center gap-1 transition-colors">
                                Continue as Guest <ArrowRight className="h-3 w-3" />
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
