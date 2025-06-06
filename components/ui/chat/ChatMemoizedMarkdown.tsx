import { marked } from "marked"
import { memo, useMemo } from "react"
import ReactMarkdown from "react-markdown"

/*
 ** Create a memoized markdown component that will take in raw Markdown text into blocks and only updates when the content actually changes.
 ** This component splits Markdown content into blocks using the marked library to identify discrete Markdown elements,
 ** then uses React's memoization features to optimize re-rendering by only updating blocks that have actually changed.
 */
function parseMarkdownIntoBlocks(markdown: string): string[] {
	const tokens = marked.lexer(markdown)
	return tokens.map((token) => token.raw)
}

const MemoizedMarkdownBlock = memo(
	({ content }: { content: string }) => {
		return <ReactMarkdown>{content}</ReactMarkdown>
	},
	(prevProps, nextProps) => {
		if (prevProps.content !== nextProps.content) return false
		return true
	}
)

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock"

export const MemoizedMarkdown = memo(({ content, id }: { content: string; id: string }) => {
	const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content])

	return blocks.map((block, index) => (
		<MemoizedMarkdownBlock content={block} key={`${id}-block_${index}`} />
	))
})

MemoizedMarkdown.displayName = "MemoizedMarkdown"
