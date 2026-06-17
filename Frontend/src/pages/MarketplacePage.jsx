import { useState } from 'react'

export default function MarketplacePage({ assets, onCommitBid, walletConnected, globalCommits = [] }) {
  // Filter State
  const [activeFilter, setActiveFilter] = useState('All')

  // Compute statistics dynamically
  const totalAssets = assets.length
  const totalVolume = globalCommits.reduce((sum, c) => sum + c.amount, 0)
  const totalCommits = globalCommits.length

  const parseSeconds = (t) => {
    const parts = t.split(':').map(Number)
    return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0)
  }
  const avgSeconds = assets.length > 0
    ? Math.round(assets.reduce((sum, a) => sum + parseSeconds(a.timeLeft), 0) / assets.length)
    : 0
  const avgMinutes = Math.floor(avgSeconds / 60)
  const avgSecs = avgSeconds % 60

  const stats = [
    { label: 'Total Aset Aktif', value: totalAssets, icon: 'token', color: 'text-primary' },
    { label: 'Volume Penawaran', value: `${totalVolume.toFixed(2)} ETH`, icon: 'bar_chart', color: 'text-secondary' },
    { label: 'Komitmen Global', value: totalCommits, icon: 'lock', color: 'text-[#fbbf24]' },
    { label: 'Rata-rata Sisa Waktu', value: `${avgMinutes}m ${avgSecs}s`, icon: 'timer', color: 'text-[#10b981]' },
  ]

  // Filter Categories
  const categories = ['All', 'Core Data', 'Quantum CPU', 'Real Estate']

  // Filtered Assets
  const filteredAssets = activeFilter === 'All'
    ? assets
    : assets.filter((a) => a.type === activeFilter)

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="border-b border-outline-variant/10 pb-6 mb-2">
        <div className="flex flex-col gap-1.5">
          <div className="font-label-mono text-[10px] text-primary uppercase tracking-[0.2em] font-semibold">
            Marketplace Protocol
          </div>
          <h1 className="font-headline-xl text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary uppercase tracking-wider leading-none">
            Galeri Lelang Aset
          </h1>
          <p className="text-on-surface-variant font-label-mono text-xs mt-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span> 
            Protokol lelang langsung beroperasi secara aktif di jaringan blockchain
          </p>
        </div>
      </div>

      {/* Statistics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="stat-card-enter glass-panel border border-white/[0.06] rounded-xl p-4 sm:p-5 flex flex-col gap-2 hover:border-primary/20 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className={`material-symbols-outlined text-lg sm:text-xl ${stat.color} opacity-70 group-hover:opacity-100 transition-opacity select-none`}>
                {stat.icon}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/10"></span>
            </div>
            <div>
              <p className="font-stats-display text-lg sm:text-xl text-on-surface font-bold leading-tight">{stat.value}</p>
              <p className="font-label-mono text-[9px] sm:text-[10px] text-on-surface-variant/60 uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Responsive Layout for Grid of Cards and Recent Commits */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Active Deployments Section */}
        <section className="flex-grow lg:w-8/12 flex flex-col gap-6">
          <header className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-outline-variant/20 pb-4 mb-2 gap-4">
            <h2 className="font-headline-lg text-lg md:text-xl text-on-surface">Aset Lelang Aktif</h2>
            
            {/* Dynamic Category Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-lg border font-label-mono text-[10px] sm:text-xs transition-all cursor-pointer whitespace-nowrap ${
                    activeFilter === cat
                      ? 'bg-primary/10 text-primary border-primary/45 font-semibold shadow-[0_0_8px_rgba(173,198,255,0.05)]'
                      : 'border-white/10 text-on-surface-variant hover:bg-white/5 hover:border-white/20'
                  }`}
                >
                  {cat === 'All' ? 'Semua Kategori' : cat}
                </button>
              ))}
            </div>
          </header>

          {/* Cards Grid */}
          {filteredAssets.length === 0 ? (
            <div className="glass-panel border border-outline-variant/10 p-8 rounded-xl flex flex-col items-center justify-center text-center py-16 gap-3">
              <span className="material-symbols-outlined text-4xl text-outline-variant">info</span>
              <p className="font-stats-display text-sm text-on-surface">Tidak ada aset dalam kategori ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-300">
              {filteredAssets.map((asset) => (
                <div 
                  key={asset.id} 
                  className="bg-white/[0.02] backdrop-blur-[20px] border border-white/10 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] overflow-hidden flex flex-col hover:bg-white/[0.04] transition-all duration-300 group hover:border-primary/20"
                >
                  {/* Top indicator bar */}
                  <div className="h-1 w-full bg-surface-container-high overflow-hidden">
                    <div 
                      className={`h-full bg-secondary ${
                        asset.timeLeft.startsWith('00:02') ? 'bg-error animate-pulse' : 'bg-secondary'
                      }`}
                      style={{ 
                        width: asset.timeLeft.startsWith('00') ? '30%' : '75%' 
                      }}
                    ></div>
                  </div>

                  {/* Card Image Area */}
                  <div className="h-44 w-full bg-surface-container-low relative overflow-hidden">
                    <img 
                      className="w-full h-full object-cover opacity-80 mix-blend-luminosity group-hover:mix-blend-normal group-hover:scale-105 transition-all duration-500" 
                      src={asset.image}
                      alt={asset.name}
                    />
                    <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded font-label-mono text-[10px] text-on-surface flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">visibility</span> {asset.views}
                    </div>
                  </div>

                  {/* Card Info Area */}
                  <div className="p-4 flex flex-col gap-4 flex-grow">
                    <div>
                      <h3 className="font-stats-display text-base text-on-surface mb-0.5">{asset.name}</h3>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-label-mono text-[9px] text-on-surface-variant/70">ID: {asset.id}</span>
                        <span className="px-1.5 py-0.2 rounded text-[7px] bg-white/5 border border-white/10 text-on-surface-variant font-bold scale-90">
                          {asset.type}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-end mt-auto pt-3 border-t border-white/5">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-caption text-[10px] text-on-surface-variant/60">Tawaran Tertinggi</span>
                        <span className="font-label-mono text-primary text-sm font-semibold">{asset.currentBid.toFixed(2)} ETH</span>
                      </div>
                      <div className="flex flex-col gap-0.5 items-end">
                        <span className="font-caption text-[10px] text-on-surface-variant/60">Sisa Waktu</span>
                        <span className={`font-label-mono text-xs ${
                          asset.timeLeft.startsWith('00:02') ? 'text-error font-bold' : 'text-secondary'
                        }`}>
                          {asset.timeLeft}
                        </span>
                      </div>
                    </div>

                    <button 
                      className="w-full bg-secondary text-on-secondary hover:brightness-110 active:scale-95 transition-all py-2.5 rounded font-label-mono text-xs uppercase tracking-wider mt-2 font-bold flex justify-center items-center gap-2 cursor-pointer"
                      onClick={() => onCommitBid(asset)}
                    >
                      Ajukan Penawaran <span className="material-symbols-outlined text-[14px]">gavel</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Commits Sidebar Panel */}
        <aside className="w-full lg:w-4/12 xl:w-3/12 shrink-0">
          <div className="bg-white/[0.02] backdrop-blur-[20px] border border-white/10 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] flex flex-col">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-surface-container-lowest/50 rounded-t-xl">
              <h3 className="font-body-md text-xs font-bold text-on-surface flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                Komitmen Terbaru (Global)
              </h3>
            </div>
            
            {globalCommits.length === 0 ? (
              <div className="text-center py-12 px-6 text-on-surface-variant/40 flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-3xl text-outline-variant">history</span>
                <p className="font-label-mono text-[10px] leading-relaxed">
                  Belum ada komitmen lelang yang dikirimkan.
                </p>
              </div>
            ) : (
              <div className="flex flex-col p-2 max-h-[360px] overflow-y-auto hide-scrollbar">
                {globalCommits.map((commit) => (
                  <div key={commit.id} className="flex items-center justify-between p-3 border-b border-white/5 last:border-0 hover:bg-white/[0.04] transition-colors group">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-outline-variant text-[14px]">lock</span>
                      <span className="font-label-mono text-[11px] text-on-surface group-hover:text-primary transition-colors select-all">
                        {commit.address.substring(0, 6)}...{commit.address.substring(commit.address.length - 4)}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-label-mono text-[11px] text-secondary">{commit.amount.toFixed(2)} ETH</span>
                      <span className="font-caption text-[9px] text-on-surface-variant/40">{commit.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
