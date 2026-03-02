'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppContext } from '@/components/providers/app-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { PlusCircle, Search, MonitorPlay, LogOut, User, Settings, LayoutDashboard, ListTodo, ShieldAlert, BarChart } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { logout } from '@/app/(auth)/login/actions'
import { IssueFormModal } from '@/components/modals/issue-form-modal'
import { useState } from 'react'

export function TopHeader({ user }: { user: any }) {
    const pathname = usePathname()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { isTvMode, toggleTvMode, dateRange, setDateRange, mode, setMode, lang, setLang, t } = useAppContext()

    if (isTvMode) return null // Hide in TV Mode

    const navItems = [
        { name: t.dashboard, href: '/', icon: LayoutDashboard },
        { name: t.issuesList, href: '/issues', icon: ListTodo },
        { name: t.safetyLogs, href: '/safety', icon: ShieldAlert },
        { name: 'Reports', href: '/reports', icon: BarChart },
    ]

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
            <div className="flex h-16 items-center px-4 md:px-6 gap-4">
                <Link href="/" className="flex items-center gap-2 mr-6">
                    <img
                        src="/logo.jpg"
                        alt="Intersnack Logo"
                        className="h-12 w-auto object-contain"
                    />
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center space-x-1 lg:space-x-2 mr-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${pathname === item.href ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Global Search */}
                <div className="hidden md:flex relative w-full max-w-sm ml-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder={t.searchPlaceholder}
                        className="w-full pl-8 bg-slate-50 border-slate-200 focus-visible:ring-[#D83140]"
                    />
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 border-r pr-3 border-slate-200">
                        <Select value={lang} onValueChange={(val: any) => setLang(val)}>
                            <SelectTrigger className="w-[80px] h-9 bg-slate-50 border-slate-200">
                                <SelectValue placeholder="Lang" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="vi">VI</SelectItem>
                                <SelectItem value="en">EN</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={dateRange} onValueChange={(val: any) => setDateRange(val)}>
                            <SelectTrigger className="w-[120px] h-9">
                                <SelectValue placeholder="Date" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Yesterday">{t.yesterday}</SelectItem>
                                <SelectItem value="Today">{t.today}</SelectItem>
                                <SelectItem value="Custom">{t.customRange}</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={mode} onValueChange={(val: any) => setMode(val)}>
                            <SelectTrigger className="w-[120px] h-9">
                                <SelectValue placeholder="Mode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DDS">DDS Mode</SelectItem>
                                <SelectItem value="Standard">Standard</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleTvMode}
                            className="h-9 gap-2 text-slate-600 hover:text-slate-900"
                        >
                            <MonitorPlay className="h-4 w-4" />
                            <span className="hidden xl:inline">{t.tvMode}</span>
                        </Button>
                    </div>

                    <Button size="sm" onClick={() => setIsModalOpen(true)} className="h-9 gap-2 bg-[#D83140] hover:bg-[#b02733] text-white">
                        <PlusCircle className="h-4 w-4" />
                        <span className="hidden sm:inline">{t.addIssue}</span>
                    </Button>

                    <IssueFormModal open={isModalOpen} onOpenChange={setIsModalOpen} user={user} />

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 bg-slate-100">
                                <User className="h-5 w-5 text-slate-600" />
                                <span className="sr-only">Toggle user menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user?.user_metadata?.name || t.guest}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user?.email || 'View Only'}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {user && (
                                <>
                                    <DropdownMenuItem>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>{t.adminSettings}</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => logout()}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>{t.logout}</span>
                                    </DropdownMenuItem>
                                </>
                            )}
                            {!user && (
                                <DropdownMenuItem asChild>
                                    <Link href="/login" className="cursor-pointer w-full text-left">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Sign In</span>
                                    </Link>
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
