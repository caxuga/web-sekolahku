import type { ReactNode } from 'react'
type LexicalNode = { type?: string; text?: string; format?: number; tag?: string; listType?: string; url?: string; children?: LexicalNode[] }
type LexicalDocument = { root?: LexicalNode }
function renderNode(node: LexicalNode, key: number): ReactNode {
  if (node.type === 'text') {
    let value: ReactNode = node.text ?? ''
    if ((node.format ?? 0) & 1) value = <strong>{value}</strong>
    if ((node.format ?? 0) & 2) value = <em>{value}</em>
    if ((node.format ?? 0) & 4) value = <s>{value}</s>
    if ((node.format ?? 0) & 8) value = <u>{value}</u>
    if ((node.format ?? 0) & 16) value = <code>{value}</code>
    return <span key={key}>{value}</span>
  }
  const children = (node.children ?? []).map((child, index) => renderNode(child, index))
  switch (node.type) {
    case 'root': return <>{children}</>
    case 'paragraph': return <p key={key}>{children}</p>
    case 'heading': return node.tag === 'h1' ? <h1 key={key}>{children}</h1> : node.tag === 'h3' ? <h3 key={key}>{children}</h3> : <h2 key={key}>{children}</h2>
    case 'quote': return <blockquote key={key}>{children}</blockquote>
    case 'list': return node.listType === 'number' ? <ol key={key}>{children}</ol> : <ul key={key}>{children}</ul>
    case 'listitem': return <li key={key}>{children}</li>
    case 'link': case 'autolink': {
      const href = node.url && /^(https?:|mailto:)/i.test(node.url) ? node.url : undefined
      return <a key={key} href={href} target={href?.startsWith('http') ? '_blank' : undefined} rel={href?.startsWith('http') ? 'noreferrer' : undefined}>{children}</a>
    }
    case 'linebreak': return <br key={key} />
    default: return <span key={key}>{children}</span>
  }
}
export function RichTextContent({ content }: { content?: unknown }) {
  if (!content || typeof content !== 'object') return null
  const document = content as LexicalDocument
  const root = document.root ?? content as LexicalNode
  return <div className="rich-content">{renderNode(root, 0)}</div>
}
