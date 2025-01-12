"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/Avatar"
import { AvatarStack } from "@components/ui/AvatarStack"
import Post from "@components/ui/post"
import type { Post as IPost } from "@prisma/client"
import { useQueryAllUserPosts } from "@queries/client/post"
import { cn } from "@utils/cn"
import { avatarPlaceholder } from "@utils/image.helpers"
import { firstLetterToUpper } from "@utils/string.helpers"
import React from "react"

// Add interface for the user
interface SerializedUser {
    id: string;
    userName: string;
    avatarUrl?: string;
    // Add other needed properties here
}

export default function UserProfile({ initialUser }: { initialUser: SerializedUser }) {
    const [posts, setPosts] = React.useState<IPost[]>([])
    const postsQuery = useQueryAllUserPosts({
        userId: initialUser?.id ?? "",
    })

    React.useEffect(() => {
        if (postsQuery.data) {
            setPosts(postsQuery.data)
        }
    }, [postsQuery.data])

    return (
        <div>
            <div className={cn("mt-[100px] laptop:w-[650px] flex-between gap-5 px-4")}>
                <div className="text-start">
                    <h1 className="text-3xl text-bold">
                        {initialUser ? firstLetterToUpper(initialUser.userName) : "Unknown User"}
                    </h1>
                    <h2 className="text-gray-400">@{initialUser?.userName ?? "unknown"}</h2>
                </div>

                <div className="">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={initialUser?.avatarUrl ?? avatarPlaceholder} />
                        <AvatarFallback>Piz</AvatarFallback>
                    </Avatar>
                </div>
            </div>

            <div className="mt-5 flex-start-center gap-5 px-4">
                <AvatarStack
                    avatars={[]}
                    showHiddenAvatarLength={false}
                />
                <p>0 followers</p>
            </div>

            <div className="mt-5">
                {posts.map((post) => (
                    <Post key={post.id} {...post} />
                ))}
            </div>
        </div>
    )
} 