'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Settings2, Users, List, Plus, Trash2, Shield, Search } from 'lucide-react'

const DUMMY_REASON_CODES = ['Breakdown', 'Blocked', 'Breaktime', 'Cleaning', 'Lack of Utility', 'Maintenance Plan', 'Minor Stop', 'Process Failures', 'Pit Stop', 'Project Work', 'Sampling', 'Trial Plan', 'Training Time', 'Waiting']
const DUMMY_DEPARTMENTS = ['Steaming', 'Shelling', 'Borma', 'Peeling MC', 'ColorSorter', 'HandPeeling', 'Packing']

interface SettingsContentProps {
    profiles: any[]
}

export function SettingsContent({ profiles: initialProfiles }: SettingsContentProps) {
    const [profiles, setProfiles] = useState(initialProfiles)
    const [userSearch, setUserSearch] = useState('')

    const filteredUsers = profiles.filter(user =>
        user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.department?.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.role?.toLowerCase().includes(userSearch.toLowerCase())
    )

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                    <Settings2 className="h-6 w-6 text-[#4F46E5]" />
                    Admin Settings
                </h1>
                <p className="text-sm text-slate-500 mt-1">Manage users, roles, and system reference data.</p>
            </div>

            <Tabs defaultValue="users" className="space-y-4">
                <TabsList className="bg-slate-100 border-b w-full justify-start rounded-none h-auto p-0 border-slate-200 gap-4">
                    <TabsTrigger value="users" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#4F46E5] data-[state=active]:text-[#4F46E5] rounded-none py-3 relative -bottom-[1px]">
                        <Users className="h-4 w-4 mr-2" /> User Management
                    </TabsTrigger>
                    <TabsTrigger value="system" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#4F46E5] data-[state=active]:text-[#4F46E5] rounded-none py-3 relative -bottom-[1px]">
                        <List className="h-4 w-4 mr-2" /> System Data
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-4 pt-4">
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="border-b bg-slate-50/50 flex flex-row items-center justify-between pb-4">
                            <div>
                                <CardTitle>Users & Roles</CardTitle>
                                <CardDescription>Grant or revoke access to the DDS dashboard.</CardDescription>
                            </div>
                            <Button size="sm" className="bg-[#4F46E5] hover:bg-[#4338CA] text-white gap-2">
                                <Plus className="h-4 w-4" /> Add User
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="p-4 border-b">
                                <div className="relative max-w-sm">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search by name, role or dept..."
                                        className="pl-8"
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map(user => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.name || 'Unnamed User'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={user.role === 'hse_admin' ? 'border-[#4F46E5] text-[#4F46E5]' : ''}>
                                                        {user.role === 'hse_admin' && <Shield className="h-3 w-3 mr-1" />}
                                                        {user.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-slate-600">{user.department || '-'}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900">Edit</Button>
                                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                                                {profiles.length === 0 ? 'No user profiles found in database.' : 'No users match your search.'}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="system" className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="border-b bg-slate-50/50 pb-4">
                                <CardTitle className="text-lg">Reason Codes</CardTitle>
                                <CardDescription>Manage standard downtime reason codes.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div className="flex gap-2">
                                    <Input placeholder="New reason code..." />
                                    <Button variant="outline">Add</Button>
                                </div>
                                <div className="space-y-2">
                                    {DUMMY_REASON_CODES.map(code => (
                                        <div key={code} className="flex items-center justify-between p-2 border rounded-md text-sm text-slate-700 bg-white">
                                            {code}
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500">
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="border-b bg-slate-50/50 pb-4">
                                <CardTitle className="text-lg">Departments</CardTitle>
                                <CardDescription>Manage active factory departments.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div className="flex gap-2">
                                    <Input placeholder="New department..." />
                                    <Button variant="outline">Add</Button>
                                </div>
                                <div className="space-y-2">
                                    {DUMMY_DEPARTMENTS.map(dept => (
                                        <div key={dept} className="flex items-center justify-between p-2 border rounded-md text-sm text-slate-700 bg-white">
                                            {dept}
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500">
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
