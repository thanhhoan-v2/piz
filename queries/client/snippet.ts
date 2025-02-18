import { getSnippetById } from "@queries/server/snippet"
import { useQuery } from "@tanstack/react-query"
import { queryKey } from "@utils/queryKeyFactory"

export const useQueryGetSnippetById = (snippetId: string | null) =>
	useQuery({
		queryKey: queryKey.snippet.selectId(snippetId),
		queryFn: () => getSnippetById(snippetId),
	})
