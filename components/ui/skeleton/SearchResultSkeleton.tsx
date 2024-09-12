import { Skeleton } from "@components/ui/Skeleton"

export default function SearchSkeleton() {
	return (
		<>
			<div className="m-2 w-full flex-between flex-y-center gap-3 rounded-lg bg-background-item p-4">
				<div className="flex-y-center gap-3">
					<Skeleton className="h-12 w-12 rounded-full" />
					<div className="flex-col gap-2">
						<Skeleton className="h-2 w-20 rounded-md" />
						<Skeleton className="h-2 w-full rounded-md" />
					</div>
				</div>
			</div>
		</>
	)
}
