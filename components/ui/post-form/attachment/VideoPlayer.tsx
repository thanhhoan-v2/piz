"use client"

import { Button } from "@components/ui/Button"
import { cn } from "@utils/cn"
import { AnimatePresence, motion } from "framer-motion"
import { Pause, Play, Volume1, Volume2, VolumeX } from "lucide-react"
import { useRef, useState } from "react"

const formatTime = (seconds: number) => {
	const minutes = Math.floor(seconds / 60)
	const remainingSeconds = Math.floor(seconds % 60)
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

const CustomSlider = ({
	value,
	onChange,
	className,
}: {
	value: number
	onChange: (value: number) => void
	className?: string
}) => {
	return (
		<motion.div
			className={cn("relative h-1 w-full cursor-pointer rounded-full bg-white/20", className)}
			onClick={(e) => {
				const rect = e.currentTarget.getBoundingClientRect()
				const x = e.clientX - rect.left
				const percentage = (x / rect.width) * 100
				onChange(Math.min(Math.max(percentage, 0), 100))
			}}
		>
			<motion.div
				className="top-0 left-0 absolute bg-white rounded-full h-full"
				style={{ width: `${value}%` }}
				initial={{ width: 0 }}
				animate={{ width: `${value}%` }}
				transition={{ type: "spring", stiffness: 300, damping: 30 }}
			/>
		</motion.div>
	)
}

const VideoPlayer = ({
	src,
	onLoaded,
}: {
	src: string | undefined
	onLoaded?: () => void
}) => {
	const videoRef = useRef<HTMLVideoElement>(null)
	const [isPlaying, setIsPlaying] = useState(false)
	const [volume, setVolume] = useState(1)
	const [progress, setProgress] = useState(0)
	const [isMuted, setIsMuted] = useState(false)
	const [playbackSpeed, setPlaybackSpeed] = useState(1)
	const [showControls, setShowControls] = useState(false)
	const [currentTime, setCurrentTime] = useState(0)
	const [duration, setDuration] = useState(0)

	const togglePlay = () => {
		if (videoRef.current) {
			if (isPlaying) {
				videoRef.current.pause()
			} else {
				videoRef.current.play()
			}
			setIsPlaying(!isPlaying)
		}
	}

	const handleVolumeChange = (value: number) => {
		if (videoRef.current) {
			const newVolume = value / 100
			videoRef.current.volume = newVolume
			setVolume(newVolume)
			setIsMuted(newVolume === 0)
		}
	}

	const handleTimeUpdate = () => {
		if (videoRef.current) {
			const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100
			setProgress(Number.isFinite(progress) ? progress : 0)
			setCurrentTime(videoRef.current.currentTime)
			setDuration(videoRef.current.duration)
		}
	}

	const handleSeek = (value: number) => {
		if (videoRef.current?.duration) {
			const time = (value / 100) * videoRef.current.duration
			if (Number.isFinite(time)) {
				videoRef.current.currentTime = time
				setProgress(value)
			}
		}
	}

	const toggleMute = () => {
		if (videoRef.current) {
			videoRef.current.muted = !isMuted
			setIsMuted(!isMuted)
			if (!isMuted) {
				setVolume(0)
			} else {
				setVolume(1)
				videoRef.current.volume = 1
			}
		}
	}

	const setSpeed = (speed: number) => {
		if (videoRef.current) {
			videoRef.current.playbackRate = speed
			setPlaybackSpeed(speed)
		}
	}

	return (
		<motion.div
			className="relative bg-[#11111198] shadow-[0_0_20px_rgba(0,0,0,0.2)] backdrop-blur-sm mx-auto rounded-xl w-full max-w-4xl overflow-hidden"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			onMouseEnter={() => setShowControls(true)}
			onMouseLeave={() => setShowControls(false)}
		>
			{src ? (
				<video
					ref={videoRef}
					className="w-full"
					onTimeUpdate={handleTimeUpdate}
					src={src}
					preload="auto"
					playsInline
					onClick={togglePlay}
					onLoadedData={() => {
						console.log("[VIDEO] Video loaded successfully:", src)
						if (onLoaded) onLoaded()
					}}
					onLoadedMetadata={() => {
						console.log("[VIDEO] Video metadata loaded")
					}}
					onError={(e) => {
						console.error("[VIDEO] Error loading video:", e)
					}}
				>
					<track kind="captions" srcLang="en" label="English captions" />
				</video>
			) : (
				<h3>Cannot find your video</h3>
			)}

			<AnimatePresence>
				{showControls && (
					<motion.div
						className="right-0 bottom-0 left-0 absolute bg-[#11111198] backdrop-blur-md m-2 mx-auto p-4 rounded-2xl max-w-xl"
						initial={{ y: 20, opacity: 0, filter: "blur(10px)" }}
						animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
						exit={{ y: 20, opacity: 0, filter: "blur(10px)" }}
						transition={{ duration: 0.6, ease: "circInOut", type: "spring" }}
					>
						<div className="flex items-center gap-2 mb-2">
							<span className="text-white text-sm">{formatTime(currentTime)}</span>
							<CustomSlider value={progress} onChange={handleSeek} className="flex-1" />
							<span className="text-white text-sm">{formatTime(duration)}</span>
						</div>

						<div className="flex justify-between items-center">
							<div className="flex items-center gap-4">
								<motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
									<Button
										onClick={togglePlay}
										variant="ghost"
										size="icon"
										className="hover:bg-[#111111d1] text-white hover:text-white"
									>
										{isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
									</Button>
								</motion.div>
								<div className="flex items-center gap-x-1">
									<motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
										<Button
											onClick={toggleMute}
											variant="ghost"
											size="icon"
											className="hover:bg-[#111111d1] text-white hover:text-white"
										>
											{isMuted ? (
												<VolumeX className="w-5 h-5" />
											) : volume > 0.5 ? (
												<Volume2 className="w-5 h-5" />
											) : (
												<Volume1 className="w-5 h-5" />
											)}
										</Button>
									</motion.div>

									<div className="w-24">
										<CustomSlider value={volume * 100} onChange={handleVolumeChange} />
									</div>
								</div>
							</div>

							<div className="flex items-center gap-2">
								{[0.5, 1, 1.5, 2].map((speed) => (
									<motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} key={speed}>
										<Button
											onClick={() => setSpeed(speed)}
											variant="ghost"
											size="icon"
											className={cn(
												"text-white hover:bg-[#111111d1] hover:text-white",
												playbackSpeed === speed && "bg-[#111111d1]"
											)}
										>
											{speed}x
										</Button>
									</motion.div>
								))}
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	)
}

export default VideoPlayer
