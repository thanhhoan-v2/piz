"use client"

import { usePostCreation } from "@/context/PostCreationContext"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

export function PostCreationBanner() {
  const { isCreatingAnyPost } = usePostCreation()
  const [visible, setVisible] = useState(false)

  // Add a slight delay before showing the banner to avoid flashing for very quick operations
  useEffect(() => {
    let timeout: NodeJS.Timeout
    
    if (isCreatingAnyPost) {
      timeout = setTimeout(() => {
        setVisible(true)
      }, 300)
    } else {
      setVisible(false)
    }
    
    return () => {
      clearTimeout(timeout)
    }
  }, [isCreatingAnyPost])

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Creating your post...</span>
      </div>
    </div>
  )
}
