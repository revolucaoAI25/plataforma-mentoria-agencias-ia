'use client'

export function VideoPlayer({ videoId }: { videoId: string }) {
  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
      <iframe
        src={`https://player-vz-xxxxxxxx.tv.pandavideo.com.br/embed/?v=${videoId}`}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        frameBorder="0"
        title="Aula"
      />
    </div>
  )
}

export function PandaEmbed({ videoId }: { videoId: string }) {
  if (!videoId) return (
    <div className="w-full aspect-video bg-surface-2 rounded-xl flex items-center justify-center">
      <p className="text-text-muted text-sm">Vídeo não disponível</p>
    </div>
  )
  return <VideoPlayer videoId={videoId} />
}
