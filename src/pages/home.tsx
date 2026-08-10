import { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Navbar from '../navbar'

interface LogMeta {
    slug: string
    title: string
    date: string
    content: string
}

// Automatically load all .md files in src/logs/ in raw text format
const logFiles = import.meta.glob('/src/journalLogs/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
}) as Record<string, string>

interface SphereProps {
    targetRot: number
    selectedDate: string
}

const logTextDict: { [key: string]: number } = {};

function CustomQuadSphereLines({ targetRot, selectedDate }: SphereProps) {
    const groupRef = useRef<THREE.Group>(null!)
    const [targetRotSphere, setTargetRotSphere] = useState<number>(0)
    const logsCacheRef = useRef<Array<{ fname: string; x: number; y: number; title: string; date: string }>>([])

    // 1. GENERATE THE TATEGAKI TEXTURE FOR THE 3D SPHERE
    const { texture, canvas, ctx } = useMemo(() => {
        const canvas = document.createElement('canvas')
        canvas.width = 2048
        canvas.height = 1536
        const ctx = canvas.getContext('2d')

        const texture = new THREE.CanvasTexture(canvas)
        texture.colorSpace = THREE.SRGBColorSpace

        const addLog = (fname: string, x: number, y: number) => {
            const posAngle = (x / canvas.width) * Math.PI * 2;
            logTextDict[fname] = posAngle;

            fetch(`/src/journalLogs/${fname}.md`)
                .then((res) => res.text())
                .then((loadedFile) => {
                    const title = loadedFile.split('\n')[1]?.replace('title: ', '') || 'Untitled'
                    const date = loadedFile.split('\n')[3]?.replace('date: ', '').substring(0, 10) || fname
                    
                    logTextDict[date] = -posAngle + (50 * Math.PI) / 180;

                    logsCacheRef.current.push({ fname, x, y, title, date })
                    redrawCanvas()
                })
                .catch((err) => console.error('Failed mid-script load:', err))
        }

        if (ctx) {
            addLog('2026-08-04', 220, 640)
            addLog('2026-08-06', 320, 700)
        }

        return { texture, canvas, ctx }
    }, [])

    // Draw to canvas ONLY on selection changes or initial data load
    const redrawCanvas = useCallback(() => {
        if (!ctx) return
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        logsCacheRef.current.forEach(({ date, title, x, y }) => {
            const [year, month, day] = date.split('-')
            ctx.font = '600 24px "M PLUS U", sans-serif'
            ctx.fillStyle = '#4488ff'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'

            const text = `${year}年${month}月${day}日`
            const text2 = title.split(' ')
            const charArray = text.split('')
            const startY = y
            const spacing = 24

            charArray.forEach((char, index) => {
                ctx.fillText(char, x, startY + index * spacing)
            })

            ctx.font = '600 16px "M PLUS U", sans-serif'
            ctx.fillStyle = selectedDate === date ? '#aaccff' : '#88aaff'
            ctx.textAlign = 'right'

            text2.forEach((word, index) => {
                const titleCharArray = word.split('')
                let curX = { current: 0 }
                titleCharArray.forEach((char) => {
                    const width = ctx.measureText(char).width
                    curX.current += width
                    ctx.fillText(char, x + curX.current + 16 / 2, startY + index * 16)
                })
            })
        })

        texture.needsUpdate = true
    }, [canvas, ctx, texture, selectedDate])

    // Update texture whenever selectedDate changes
    useEffect(() => {
        redrawCanvas()
    }, [selectedDate, redrawCanvas])

    useFrame((_, delta: number) => {
        setTargetRotSphere(targetRotSphere + (targetRot - targetRotSphere) * (1 - Math.exp(-5 * delta)))
        const autoSpin = Math.sin(performance.now() / 1000) * 0.01
        groupRef.current.rotation.order = 'ZXY'
        groupRef.current.position.z = 2.5
        groupRef.current.position.x = 0.8
        groupRef.current.position.y = -0.8
        groupRef.current.rotation.x = -0.4
        groupRef.current.rotation.z = -0.3
        groupRef.current.rotation.y = autoSpin + targetRotSphere
    })

    const radius = 1.5
    const widthSegments = 32
    const heightSegments = 18
    const lineThickness = 0.02

    const tubes = useMemo(() => {
        const segmentsList: Array<{ position: [number, number, number]; rotation: [number, number, number]; length: number }> = []
        const tempGeo = new THREE.SphereGeometry(radius, widthSegments, heightSegments)
        const positionAttr = tempGeo.attributes.position
        const seenEdges = new Set<string>()

        const addSegment = (p1: number, p2: number) => {
            const id = p1 < p2 ? `${p1}_${p2}` : `${p2}_${p1}`
            if (seenEdges.has(id)) return
            seenEdges.add(id)

            const v1 = new THREE.Vector3(positionAttr.getX(p1), positionAttr.getY(p1), positionAttr.getZ(p1))
            const v2 = new THREE.Vector3(positionAttr.getX(p2), positionAttr.getY(p2), positionAttr.getZ(p2))

            const distance = v1.distanceTo(v2)
            const midpoint = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5)
            const direction = new THREE.Vector3().subVectors(v2, v1).normalize()

            const up = new THREE.Vector3(0, 1, 0)
            const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction)
            const euler = new THREE.Euler().setFromQuaternion(quaternion)

            segmentsList.push({
                position: [midpoint.x, midpoint.y, midpoint.z],
                rotation: [euler.x, euler.y, euler.z],
                length: distance,
            })
        }

        for (let y = 0; y <= heightSegments; y++) {
            for (let x = 0; x < widthSegments; x++) {
                const currentIdx = y * (widthSegments + 1) + x
                addSegment(currentIdx, currentIdx + 1)
                if (y < heightSegments) {
                    addSegment(currentIdx, currentIdx + (widthSegments + 1))
                }
            }
        }

        tempGeo.dispose()
        return segmentsList
    }, [radius, widthSegments, heightSegments])

    return (
        <group ref={groupRef}>
            <mesh renderOrder={1}>
                <sphereGeometry args={[radius, widthSegments, heightSegments]} />
                <meshBasicMaterial colorWrite={false} depthWrite={true} />
            </mesh>

            <mesh renderOrder={3}>
                <sphereGeometry args={[radius + 0.03, 32, 32]} />
                <meshBasicMaterial map={texture} transparent={true} side={THREE.DoubleSide} depthWrite={true} />
            </mesh>

            {tubes.map((tube, index) => (
                <mesh key={index} position={tube.position} rotation={tube.rotation} renderOrder={2}>
                    <cylinderGeometry args={[lineThickness, lineThickness, tube.length, 4]} />
                    <meshBasicMaterial color="#aaffee" opacity={1} transparent={false} />
                </mesh>
            ))}
        </group>
    )
}

function Home() {
    const [targetRot, setTargetRot] = useState<number>(0);

    function scrollToLogText(dateOrSlug: string) {
        if (logTextDict[dateOrSlug] !== undefined) {
            setTargetRot(logTextDict[dateOrSlug]);
        }
    }

    const navigate = useNavigate()

    // LOG LIST & READING STATES
    const [logs, setLogs] = useState<LogMeta[]>([])
    const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
    const [selectedContent, setSelectedContent] = useState<string>('')
    const [selectedDate, setSelectedDate] = useState<string>('')

    // Parse and sort all markdown files chronologically
    useEffect(() => {
        const parsedLogs: LogMeta[] = Object.entries(logFiles).map(([path, rawContent]) => {
            const slug = path.split('/').pop()?.replace('.md', '') || ''
            const lines = rawContent.split('\n')

            const titleLine = lines.find((l) => l.startsWith('title:'))
            const dateLine = lines.find((l) => l.startsWith('date:'))

            const title = titleLine ? titleLine.replace('title:', '').trim() : slug
            const date = dateLine ? dateLine.replace('date:', '').trim().substring(0, 10) : slug

            return { slug, title, date, content: rawContent }
        })

        // Sort chronologically (newest first)
        parsedLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setLogs(parsedLogs)
    }, [])

    // Check URL SubURL (/log/:slug or ?log=:slug)
    useEffect(() => {
        const handleUrlChange = () => {
            const pathSegments = window.location.pathname.split('/').filter(Boolean)
            const searchParams = new URLSearchParams(window.location.search)

            let slug = searchParams.get('log')
            if (!slug && pathSegments[0] === 'log' && pathSegments[1]) {
                slug = pathSegments[1]
            }

            if (slug) {
                setSelectedSlug(slug)
            }
        }

        handleUrlChange()
        window.addEventListener('popstate', handleUrlChange)
        return () => window.removeEventListener('popstate', handleUrlChange)
    }, [])

    // Fetch or display selected log content
    useEffect(() => {
        if (!selectedSlug) return

        const matched = logs.find((l) => l.slug === selectedSlug)
        if (matched) {
            setSelectedContent(matched.content)
        } else {
            fetch(`/src/journalLogs/${selectedSlug}.md`)
                .then((res) => {
                    if (!res.ok) throw new Error('Not found')
                    return res.text()
                })
                .then((text) => setSelectedContent(text))
                .catch(() => setSelectedContent('# 404\nFile log tidak ditemukan.'))
        }
    }, [selectedSlug, logs])

    // Redirect function for buttons
    const redirectToLog = (slug: string) => {
        navigate(`/log/${slug}`)
    }

    return (
        <div
            className="relative min-h-screen bg-[#effffa] text-[#60f] font-mplus antialiased selection:bg-[#6600ff]/30 overflow-x-hidden"
        >
            {/* 3D BACKGROUND LAYER */}
            <div className="fixed top-0 right-0 w-full md:w-1/2 h-screen z-0 pointer-events-none">
                <Canvas flat gl={{ antialias: false, powerPreference: "high-performance" }} onCreated={(state) => state.camera.position.set(0, 0, 5)}>
                    <CustomQuadSphereLines targetRot={targetRot} selectedDate={selectedDate} />
                </Canvas>
            </div>
            <div className="fixed left-0 bg-linear-to-r from-[#effffaff] to-[#effffaff] w-[50vw] h-400"></div>
            <div className="fixed right-0 bg-linear-to-r from-[#effffaff] to-[#effffa00] w-[50vw] h-400"></div>

            {/* FOREGROUND CONTENT */}
            <div className="relative z-10 pointer-events-auto">
                {/* NAVBAR */}
                <Navbar/>

                {/* HERO SECTION WITH JOURNAL LOGS LIST */}
                <main id="center" className="mx-auto max-w-450 px-6 min-h-[calc(100vh-80px)] flex flex-col justify-center items-start py-12">
                    <h1 className="text-5xl sm:text-8xl mt-50 font-black tracking-tight max-w-5xl leading-20">
                        <span className="text-5xl text-[#88f] font-medium">情報ノート</span> <br />
                        Jurnal Informatika <br />
                    </h1>
                    <h2 className="text-2xl sm:text-4xl font-bold tracking-tight max-w-5xl leading-10 mt-6">
                        XI D2 | Rei Dillan Hartedi | Absen 41
                    </h2>

                    {/* JOURNAL LOGS DIRECTLY IN HERO POSITION */}
                    <div className="mt-10 w-full max-w-xl">
                        <h3 className="text-sm font-bold tracking-widest text-[#6600ff] uppercase mb-4">
                            Journal Logs:
                        </h3>
                        <div className="flex flex-col gap-1">
                            {logs.map((log) => (
                                <button
                                    onMouseEnter={() => { scrollToLogText(log.date); setSelectedDate(log.date); }}
                                    key={log.slug}
                                    onClick={() => redirectToLog(log.slug)}
                                    className={`text-left p-2 rounded-xl border transition-all cursor-pointer ${selectedSlug === log.slug
                                            ? 'bg-[#60f] text-white border-[#60f] shadow-md'
                                            : 'bg-transparent text-[#60f] border-[#60f]/10 hover:bg-[#0f81] hover:border-[#60f]/30 hover:shadow-md'
                                        }`}
                                >
                                    <div className="text-xs font-semibold opacity-75">{log.date}</div>
                                    <div className="text-lg font-bold leading-snug">{log.title}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </main>

                {/* ACTIVE MARKDOWN READER VIEW */}
                {selectedSlug && (
                    <section id="log-reader" className="mx-auto max-w-5xl px-6 py-12 border-t border-[#60f]/10">
                        <div className="mb-3 text-xs font-semibold tracking-wider text-[#88f] uppercase">
                            Active SubURL Log: <span className="text-[#60f] font-bold">{selectedSlug}</span>
                        </div>
                        <div className="p-8 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-[#60f]/10">
                            <pre className="whitespace-pre-wrap font-sans text-slate-800 leading-relaxed">
                                {selectedContent}
                            </pre>
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}

export default Home