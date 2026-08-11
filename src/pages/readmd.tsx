// src/pages/readmd.tsx
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Navbar from '../navbar'

// Tipe data metadata Frontmatter
interface Frontmatter {
    title?: string
    author?: string
    date?: string
}

// Eagerly import raw markdown files dari folder logs
const logFiles = import.meta.glob('/src/journalLogs/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
}) as Record<string, string>

// Helper untuk memisahkan YAML Frontmatter dari isi Markdown
function parseFrontmatter(rawMarkdown: string): { meta: Frontmatter; body: string } {
    const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/
    const match = rawMarkdown.match(frontmatterRegex)

    if (!match) {
        return { meta: {}, body: rawMarkdown }
    }

    const yamlLines = match[1].split('\n')
    const meta: Frontmatter = {}

    yamlLines.forEach((line) => {
        const [key, ...valueParts] = line.split(':')
        if (key && valueParts.length > 0) {
            const val = valueParts.join(':').trim().replace(/^["']|["']$/g, '')
            meta[key.trim() as keyof Frontmatter] = val
        }
    })

    return { meta, body: match[2] }
}

// Komponen Code Block Persegi dengan Nomor Baris & Copy Button
function CodeBlock({ codeString, className }: { codeString: string; className?: string }) {
    const [copied, setCopied] = useState(false)

    const language = className ? className.replace('language-', '') : ''
    const lines = codeString.split('\n')

    const handleCopy = () => {
        navigator.clipboard.writeText(codeString)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="group relative min-h-11 font-mpluscode my-6 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 overflow-hidden shadow-lg text-sm">
            {/* Header Code Block */}
            <button
                onClick={handleCopy}
                className="opacity-0 group-hover:opacity-100 absolute justify-end right-1 top-1 px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors font-mpluscode text-xs flex items-center gap-1.5 cursor-pointer"
                title="Copy code"
            >
                {copied ? (
                    <>
                        <span className="text-emerald-400">☑</span> Copied!
                    </>
                ) : (
                    <>
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                        </svg>
                        Copy
                    </>
                )}
            </button>
            {language && (
                <div className="flex items-center justify-between pl-5 px-1 py-1 bg-slate-800 border-b border-slate-700 text-xs text-slate-400">
                    <span className="font-semibold uppercase tracking-wider font-mplus">{language}</span>

                </div>
            )}


            {/* Content & Line Numbers */}
            <div className="overflow-x-auto p-2 flex leading-relaxed">
                <div className="select-none text-right pl-2 pr-4 border-r border-slate-700/60 text-slate-500 font-mpluscode text-xs">
                    {lines.map((_, i) => (
                        <div key={i} className="h-5">{i + 1}</div>
                    ))}
                </div>

                <pre className="pl-2 font-mpluscode text-sm text-slate-100 whitespace-pre">
                    <code>{codeString}</code>
                </pre>
            </div>
        </div>
    )
}

export default function ReadMd() {
    const { slug } = useParams<{ slug: string }>()
    const [content, setContent] = useState<string>('')
    const [meta, setMeta] = useState<Frontmatter>({})
    const [isLoading, setIsLoading] = useState<boolean>(true)

    useEffect(() => {
        if (!slug) return
        setIsLoading(true)

        const matchedKey = Object.keys(logFiles).find((path) =>
            path.endsWith(`/${slug}.md`)
        )

        if (matchedKey && logFiles[matchedKey]) {
            const { meta, body } = parseFrontmatter(logFiles[matchedKey])
            setMeta(meta)
            setContent(body)
            setIsLoading(false)
        } else {
            fetch(`/src/logs/${slug}.md`)
                .then((res) => {
                    if (!res.ok) throw new Error('Not found')
                    return res.text()
                })
                .then((text) => {
                    const { meta, body } = parseFrontmatter(text)
                    setMeta(meta)
                    setContent(body)
                })
                .catch(() => setContent('# 404\nLog file tidak ditemukan.'))
                .finally(() => setIsLoading(false))
        }
    }, [slug])

    return (
        <div className="min-h-screen bg-[#0f172a] text-[#0f172a] flex flex-col font-murecho">

            <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">
                <article className="bg-[#effffa] backdrop-blur-md p-8 md:p-12 rounded-2xl shadow-xl border border-[#60f]/10">
                    {meta.title ? (
                        <div className="mb-8 border-b pb-6 border-slate-200">
                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
                                {meta.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-1 text-xs font-semibold text-slate-600">
                                {meta.author && (
                                    <span className="bg-[#0af2] text-slate-600 px-1 py-1 rounded-full">
                                        Oleh: {meta.author}
                                    </span>
                                )}
                                {meta.date && (
                                    <span className="bg-[#0af2] text-slate-600 px-1 py-1 rounded-full">
                                        {new Date(meta.date).toLocaleDateString('id-ID', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-xs font-semibold uppercase tracking-wider text-[#88f] mb-4">
                            Viewing Log: <span className="text-slate-700">{slug}</span>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="py-20 text-center text-slate-400">Loading log entry...</div>
                    ) : (
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h1: ({ children }: { children?: ReactNode }) => (
                                    <h1 className="text-3xl font-extrabold text-slate-900 mt-8 mb-4 border-b pb-2 border-slate-200">
                                        {children}
                                    </h1>
                                ),
                                h2: ({ children }: { children?: ReactNode }) => (
                                    <h2 className="text-2xl font-bold text-slate-800 mt-6 mb-3">
                                        {children}
                                    </h2>
                                ),
                                h3: ({ children }: { children?: ReactNode }) => (
                                    <h3 className="text-xl font-semibold text-slate-800 mt-5 mb-2">
                                        {children}
                                    </h3>
                                ),
                                p: ({ children }: { children?: ReactNode }) => (
                                    <p className="text-slate-700 leading-relaxed mb-4">
                                        {children}
                                    </p>
                                ),
                                ul: ({ children }: { children?: ReactNode }) => (
                                    <ul className="list-disc pl-6 space-y-1 my-3 text-slate-700 [&_ul]:list-[circle] [&_ul_ul]:list-[square]">
                                        {children}
                                    </ul>
                                ),
                                ol: ({ children }: { children?: ReactNode }) => (
                                    <ol className="list-decimal pl-6 space-y-1 my-3 text-slate-700">
                                        {children}
                                    </ol>
                                ),
                                li: ({ children }: { children?: ReactNode }) => (
                                    <li className="leading-relaxed pl-1">
                                        {children}
                                    </li>
                                ),
                                blockquote: ({ children }: { children?: ReactNode }) => (
                                    <blockquote className="border-l-4 border-[#60f] pl-4 my-4 italic text-slate-600 bg-[#0af2] py-2 rounded-r">
                                        {children}
                                    </blockquote>
                                ),
                                img: ({ src, alt }: { src?: string; alt?: string }) => (
                                    <figure className="my-6">
                                        <img
                                            src={src}
                                            alt={alt || 'Gambar Log'}
                                            className="rounded-xl border border-slate-200 shadow-md max-w-full h-auto mx-auto block object-cover"
                                            loading="lazy"
                                        />
                                        {alt && (
                                            <figcaption className="text-center text-xs text-slate-500 mt-2 italic">
                                                {alt}
                                            </figcaption>
                                        )}
                                    </figure>
                                ),
                                pre({ children }: { children?: ReactNode }) {
                                    return <>{children}</>
                                },
                                code({ className, children, ...props }: { className?: string; children?: ReactNode }) {
                                    const codeText = String(children).replace(/\n$/, '')
                                    const isBlock = String(children).includes('\n') || Boolean(className)

                                    if (isBlock) {
                                        return <CodeBlock className={className} codeString={codeText} />
                                    }

                                    return (
                                        <code className="bg-[#0af2] text-[#60f] px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                                            {children}
                                        </code>
                                    )
                                },
                                a: ({ href, children }: { href?: string; children?: ReactNode }) => (
                                    <a href={href} target="_blank" rel="noreferrer" className="text-[#60f] underline hover:text-purple-800">
                                        {children}
                                    </a>
                                ),
                            }}
                        >
                            {content}
                        </ReactMarkdown>
                    )}
                </article>
            </main>
        </div>
    )
}