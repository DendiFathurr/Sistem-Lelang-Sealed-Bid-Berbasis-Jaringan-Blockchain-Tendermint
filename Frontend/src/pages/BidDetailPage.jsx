import { useState, useEffect, useRef } from 'react'

export default function BidDetailPage({ assets = [], selectedAsset, onAssetChange, balance, onSubmitBid }) {
  const [bidAmount, setBidAmount] = useState('')
  const [isHovered, setIsHovered] = useState(false)
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)

  // Sync active slide index ONLY when selectedAsset.id changes, avoiding countdown timer ticks
  useEffect(() => {
    if (!selectedAsset || assets.length === 0) return
    const idx = assets.findIndex((a) => a.id === selectedAsset.id)
    if (idx !== -1) {
      setActiveSlideIndex(idx)
    }
  }, [selectedAsset?.id]) // Strictly depend on the primitive id string

  // Auto-sliding interval for the preview cards every 3 seconds (3000ms), paused on hover
  useEffect(() => {
    if (isHovered || assets.length <= 1) return

    const interval = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % assets.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [isHovered, assets.length])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmitBid(bidAmount)
    setBidAmount('')
  }

  if (!selectedAsset || assets.length === 0) return null

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-outline-variant/10 pb-4 mb-4">
        <div className="flex flex-col gap-1">
          <div className="font-label-mono text-[10px] text-primary uppercase tracking-[0.2em] font-semibold">
            Committed Bidding Phase
          </div>
          <h1 className="font-headline-xl text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary uppercase tracking-wider leading-none">
            Detail Penawaran Lelang
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
        {/* Asset Detail Column with Auto-Sliding and Hover Pause */}
        <div 
          className="lg:col-span-7 flex flex-col gap-6"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Static card container to avoid rigid layouts reloading */}
          <div className="glass-panel border border-outline-variant/10 p-4 md:p-6 flex flex-col gap-6 relative overflow-hidden group rounded-xl min-h-[460px]">
            <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-primary/30 opacity-50"></div>

            {/* Image / Asset Preview (Buttery-smooth CSS cross-fade transition) */}
            <div className="w-full aspect-[16/9] bg-surface-container-highest border border-outline-variant/20 relative overflow-hidden rounded-lg">
              {assets.map((asset, index) => (
                <img
                  key={asset.id}
                  src={asset.image}
                  alt={asset.name}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1000ms] ease-in-out ${
                    activeSlideIndex === index 
                      ? 'opacity-80 scale-100' 
                      : 'opacity-0 scale-105 pointer-events-none'
                  }`}
                />
              ))}
              <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-md px-3 py-1 border border-outline-variant/20 font-label-mono text-xs text-primary flex items-center gap-2 z-10">
                <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
                Lelang Langsung
              </div>
            </div>

            {/* Details (Text elements slide and fade smoothly in stack) */}
            <div className="relative flex-grow">
              {assets.map((asset, index) => (
                <div
                  key={asset.id}
                  className={`transition-all duration-700 ease-in-out ${
                    activeSlideIndex === index
                      ? 'opacity-100 translate-y-0 relative z-10'
                      : 'opacity-0 -translate-y-4 absolute inset-x-0 top-0 pointer-events-none z-0'
                  }`}
                >
                  <h2 className="font-headline-xl text-lg sm:text-2xl text-on-surface mb-2">{asset.name}</h2>
                  <div className="flex gap-2 flex-wrap mb-4">
                    <span className="font-label-mono text-[10px] sm:text-xs text-on-surface-variant border border-outline-variant/30 px-2 py-0.5 rounded-sm">{asset.standard}</span>
                    <span className="font-label-mono text-[10px] sm:text-xs text-on-surface-variant border border-outline-variant/30 px-2 py-0.5 rounded-sm">{asset.type}</span>
                    <span className="font-label-mono text-[10px] sm:text-xs text-primary border border-primary/30 px-2 py-0.5 rounded-sm bg-primary/5">Terverifikasi</span>
                  </div>
                  <p className="font-body-md text-xs sm:text-sm md:text-base text-on-surface-variant leading-relaxed min-h-[60px]">
                    {asset.description}
                  </p>

                  {/* Technical values inside animated block */}
                  <div className="grid grid-cols-2 gap-4 pt-4 mt-4 border-t border-outline-variant/10">
                    <div>
                      <div className="font-label-mono text-[10px] sm:text-xs text-outline mb-1">Hash Penawaran Tertinggi</div>
                      <div className="font-stats-display text-xs sm:text-sm md:text-base text-on-surface truncate">0x8f7d...{asset.id.substring(asset.id.length - 4)}</div>
                    </div>
                    <div>
                      <div className="font-label-mono text-[10px] sm:text-xs text-outline mb-1">Sisa Waktu</div>
                      <div className="font-stats-display text-xs sm:text-sm md:text-base text-primary font-mono tracking-wider">{asset.timeLeft}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Commit Phase Form Column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="glass-panel border border-primary/25 p-5 md:p-8 flex flex-col gap-6 relative shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-xl">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
              <h3 className="font-stats-display text-sm sm:text-base text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">lock</span>
                Penawaran Rahasia
              </h3>
              <span className="font-label-mono text-[9px] text-primary bg-primary/10 px-2 py-0.5 border border-primary/20">Fase Komitmen</span>
            </div>

            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              {/* Target Asset Dropdown Selector */}
              <div className="flex flex-col gap-2">
                <label className="font-label-mono text-[10px] sm:text-xs text-outline">
                  Pilih Aset Target
                </label>
                {assets.length > 0 && onAssetChange && (
                  <select
                    value={selectedAsset.id}
                    onChange={(e) => {
                      const newAsset = assets.find((a) => a.id === e.target.value)
                      if (newAsset) {
                        onAssetChange(newAsset) // Changes bid destination target
                        // Sync slideshow position to show selected asset instantly
                        const idx = assets.findIndex((a) => a.id === newAsset.id)
                        if (idx !== -1) {
                          setActiveSlideIndex(idx)
                        }
                        // Pause auto-sliding on manual selection for 5 seconds
                        setIsHovered(true)
                        setTimeout(() => setIsHovered(false), 5000)
                      }
                    }}
                    className="w-full bg-surface-container-highest border border-outline-variant focus:border-primary text-on-surface font-label-mono text-xs p-3.5 rounded-lg outline-none cursor-pointer transition-colors"
                  >
                    {assets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name} ({asset.id})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Bid Amount */}
              <div className="flex flex-col gap-2">
                <label className="font-label-mono text-[10px] sm:text-xs text-outline flex justify-between">
                  <span>Jumlah Penawaran (ETH)</span>
                  <span className="text-on-surface-variant/80">Saldo: {balance.toFixed(2)} ETH</span>
                </label>
                <div className="relative">
                  <input
                    className="w-full bg-surface-container-highest border border-outline-variant focus:border-primary text-on-surface font-stats-display p-3 sm:p-4 outline-none transition-colors pr-14 text-sm sm:text-base rounded-lg"
                    placeholder="0.00"
                    step="0.01"
                    type="number"
                    required
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-label-mono text-xs text-outline">ETH</span>
                </div>
              </div>

              {/* Auto-hash info */}
              <div className="bg-black/30 p-3 border border-outline-variant/10 rounded-lg text-xs font-label-mono flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">enhanced_encryption</span>
                <div>
                  <div className="text-[10px] text-primary uppercase tracking-wider font-bold mb-0.5">Hash Otomatis</div>
                  <p className="text-on-surface-variant text-[10px] leading-relaxed">
                    Sistem akan otomatis membuat kode hash unik untuk penawaran Anda. Tidak perlu mengatur kunci apapun secara manual.
                  </p>
                </div>
              </div>

              {/* Warning Block */}
              <div className="bg-surface-container border-l-4 border-secondary-container p-4 flex gap-3 items-start mt-1 rounded-r-lg">
                <span className="material-symbols-outlined text-secondary-container mt-0.5 text-base">warning</span>
                <div>
                  <div className="font-label-mono text-[10px] text-on-surface mb-1 font-bold">TINDAKAN PENTING</div>
                  <div className="font-body-md text-[11px] sm:text-xs text-on-surface-variant leading-relaxed">
                    Setelah komitmen dikirim, dana Anda akan terkunci. Lakukan pembukaan (reveal) di Reveal Portal untuk memverifikasi penawaran sebelum mengklaim aset.
                  </div>
                </div>
              </div>

              {/* Main Action */}
              <button
                className="w-full bg-secondary-container text-on-secondary-container font-label-mono text-xs sm:text-sm uppercase tracking-widest font-bold py-4 px-6 border border-secondary/50 hover:shadow-[0_0_20px_rgba(0,165,114,0.3)] transition-all flex items-center justify-center gap-2 mt-2 active:scale-[0.98] cursor-pointer rounded-lg"
                type="submit"
              >
                <span className="material-symbols-outlined text-lg">fingerprint</span>
                Kirim Penawaran ke Blockchain
              </button>
              <div className="text-center font-label-mono text-outline text-[9px] uppercase tracking-wider mt-1 opacity-60">
                Didukung oleh Zero-Knowledge Proofs
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
