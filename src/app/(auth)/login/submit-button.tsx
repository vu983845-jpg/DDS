'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export function SubmitButton() {
    const { pending } = useFormStatus()
    
    return (
        <Button 
            type="submit" 
            disabled={pending}
            className="w-full bg-[#D83140] hover:bg-[#b02733] text-white transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70"
        >
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                </>
            ) : (
                'Sign In'
            )}
        </Button>
    )
}
