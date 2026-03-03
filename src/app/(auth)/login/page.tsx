import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

// Using React 19 / Next.js 15 searchParams behavior if applicable, otherwise simple approach
export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const params = await searchParams;
    const error = params?.error;

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <img src="/logo.jpg" alt="Logo" className="h-16 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold tracking-tight text-[#D83140]">DDS Meeting</h1>
                    <p className="text-sm text-muted-foreground mt-2">Daily Direction Setting (DDS)</p>
                </div>

                <Card className="shadow-lg border-t-4 border-t-[#D83140]">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-semibold tracking-tight text-center">
                            Welcome back
                        </CardTitle>
                        <CardDescription className="text-center">
                            Enter your email and password to access the dashboard
                        </CardDescription>
                    </CardHeader>
                    <form action={login}>
                        <CardContent className="space-y-4">
                            {error && (
                                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <p>{error}</p>
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                </div>
                                <Input id="password" name="password" type="password" required />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full bg-[#D83140] hover:bg-[#b02733] text-white">
                                Sign In
                            </Button>
                        </CardFooter>
                    </form>
                    <div className="px-6 pb-6 text-center text-sm text-gray-500">
                        For view-only access, <a href="#" className="underline hover:text-[#D83140]">continue as Guest</a>.
                    </div>
                </Card>
            </div>
        </div>
    )
}
