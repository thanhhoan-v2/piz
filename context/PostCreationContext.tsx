"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

type PostCreationContextType = {
  creatingPosts: string[] // Array of post IDs that are being created
  addCreatingPost: (postId: string) => void
  removeCreatingPost: (postId: string) => void
  isCreatingAnyPost: boolean
}

const PostCreationContext = createContext<PostCreationContextType | undefined>(undefined)

export function PostCreationProvider({ children }: { children: ReactNode }) {
  const [creatingPosts, setCreatingPosts] = useState<string[]>([])

  const addCreatingPost = (postId: string) => {
    setCreatingPosts((prev) => [...prev, postId])
  }

  const removeCreatingPost = (postId: string) => {
    setCreatingPosts((prev) => prev.filter((id) => id !== postId))
  }

  return (
    <PostCreationContext.Provider
      value={{
        creatingPosts,
        addCreatingPost,
        removeCreatingPost,
        isCreatingAnyPost: creatingPosts.length > 0,
      }}
    >
      {children}
    </PostCreationContext.Provider>
  )
}

export function usePostCreation() {
  const context = useContext(PostCreationContext)
  if (context === undefined) {
    throw new Error("usePostCreation must be used within a PostCreationProvider")
  }
  return context
}
