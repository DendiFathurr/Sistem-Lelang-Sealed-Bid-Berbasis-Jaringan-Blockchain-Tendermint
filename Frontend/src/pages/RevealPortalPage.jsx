import { useState } from 'react'

export default function RevealPortalPage({ assets, bidsSubmitted = [], onRevealBidSuccess, showToast }) {
  const [selectedBid, setSelectedBid] = useState(null)
  const [revealStatus, setRevealStatus] = useState(null) // null | 'success'

  // Filter bids that haven't been revealed yet
  const unrevealedBids = bidsSubmitted.filter((bid) => !bid.revealed)
  const revealedBids = bidsSubmitted.filter((bid) => bid.revealed)

  // Truncate hash for display
  const truncHash = (hash) => {
    if (!hash) return ''
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 4)}`
  }

  const handleReveal = () => {
    if (!selectedBid) return

    // Auto-verify using internal system data (no manual input needed)
    const matchedBid = bidsSubmitted.find(
      (bid) =>
        bid.hash === selectedBid.hash &&
        bid.timestamp === selectedBid.timestamp
    )

    if (matchedBid) {
      setRevealStatus('success')
      if (onRevealBidSuccess) {
        onRevealBidSuccess(matchedBid.hash)
      }
      if (showToast) {
        showToast('Berhasil memverifikasi komitmen penawaran!', 'success')
      }
    }
  }

  const handleReset = () => {
    setSelectedBid(null)
    setRevealStatus(null)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-[720px] mx-auto w-full">
      {/* Header */}
      <div className="border-b border-outline-variant/10 pb-6 mb-6 text-center">
        <div className="flex flex-col gap-1.5 items-center">
          <div className="font-label-mono text-[10px] text-primary uppercase tracking-[0.2em] font-semibold">
            Decryption Portal
          </div>
          <h1 className="font-headline-xl text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary uppercase tracking-wider leading-none">
            Reveal Portal (Pembukaan)
          </h1>
          <p className="text-on-surface-variant font-label-mono text-xs mt-2 max-w-[500px]">
            Pilih penawaran yang ingin Anda buka (reveal) untuk memverifikasi data komitmen Anda di jaringan blockchain.
          </p>
        </div>
      </div>

      {/* No bids at all */}
      {bidsSubmitted.length === 0 && (
        <div className="glass-panel border border-outline-variant/10 p-8 rounded-xl flex flex-col items-center justify-center text-center py-16 gap-4">
          <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center text-outline-variant">
            <span className="material-symbols-outlined text-4xl select-none">lock</span>
          </div>
          <div className="space-y-1 max-w-[380px]">
            <h3 className="font-stats-display text-base text-on-surface">Belum Ada Komitmen</h3>
            <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
              Anda belum mengirimkan penawaran komitmen apa pun. Ajukan penawaran di halaman Lelang terlebih dahulu, lalu kembali ke sini untuk membuka (reveal) penawaran Anda.
            </p>
          </div>
        </div>
      )}

      {/* Unrevealed Bids Section */}
      {unrevealedBids.length > 0 && (
        <div className="glass-panel border border-[#fbbf24]/20 p-6 md:p-8 rounded-xl flex flex-col gap-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
          <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-4">
            <span className="material-symbols-outlined text-[#fbbf24] text-2xl select-none">lock</span>
            <div>
              <h3 className="font-stats-display text-base text-on-surface">Penawaran Terkunci</h3>
              <p className="font-label-mono text-[10px] text-on-surface-variant/60 mt-0.5">{unrevealedBids.length} penawaran menunggu pembukaan</p>
            </div>
          </div>

          <div className="space-y-3">
            {unrevealedBids.map((bid) => {
              const isSelected = selectedBid?.hash === bid.hash
              return (
                <div
                  key={bid.hash}
                  onClick={() => {
                    if (revealStatus === null) {
                      setSelectedBid(bid)
                    }
                  }}
                  className={`p-4 rounded-lg border transition-all ${
                    revealStatus !== null && !isSelected ? 'opacity-50 pointer-events-none' : ''
                  } ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(173,198,255,0.1)] cursor-default'
                      : 'border-outline-variant/15 bg-black/20 hover:border-outline-variant/40 hover:bg-black/30 cursor-pointer active:scale-[0.99]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Radio indicator */}
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'border-primary' : 'border-outline-variant/40'
                      }`}>
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
                      </div>
                      <div className="min-w-0">
                        <p className="font-label-mono text-xs text-on-surface font-bold truncate">{bid.assetName}</p>
                        <p className="font-label-mono text-[10px] text-on-surface-variant/60 mt-0.5 truncate">
                          {truncHash(bid.hash)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-stats-display text-xs text-[#fbbf24] font-bold uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">lock</span>
                        Terkomit
                      </p>
                      <p className="font-label-mono text-[10px] text-on-surface-variant/50">{bid.timestamp}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Selected bid — one-click reveal */}
          {selectedBid && revealStatus === null && (
            <div className="space-y-4 pt-4 border-t border-outline-variant/10 animate-in fade-in duration-200">
              <div className="bg-black/25 p-4 border border-outline-variant/10 rounded-lg text-xs font-mono space-y-2">
                <div className="font-label-mono text-[10px] text-primary uppercase tracking-wider font-bold mb-3">Data Komitmen yang Akan Dibuka</div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant/60">Aset:</span>
                  <span className="text-white">{selectedBid.assetName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant/60">Hash:</span>
                  <span className="text-primary font-bold">{truncHash(selectedBid.hash)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant/60">Waktu:</span>
                  <span className="text-white">{selectedBid.timestamp}</span>
                </div>
              </div>

              <button
                onClick={handleReveal}
                className="w-full bg-primary text-on-primary font-label-mono text-xs uppercase tracking-widest font-bold py-4 rounded-lg cursor-pointer hover:bg-secondary hover:text-on-secondary transition-all active:scale-[0.98]"
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">lock_open</span>
                  Buka & Verifikasi Penawaran
                </span>
              </button>
            </div>
          )}

          {/* Reveal Success */}
          {selectedBid && revealStatus === 'success' && (
            <div className="space-y-4 pt-4 border-t border-outline-variant/10 animate-in zoom-in-95 duration-300">
              <div className="p-6 bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#10b981]/20 border border-[#10b981]/40 flex items-center justify-center mx-auto text-[#10b981]">
                  <span className="material-symbols-outlined text-2xl select-none">verified</span>
                </div>
                <h3 className="font-stats-display text-base text-[#10b981]">Verifikasi Sukses!</h3>
                <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                  Penawaran sebesar <strong className="text-white">{selectedBid.amount.toFixed(4)} ETH</strong> pada aset <strong className="text-white">"{selectedBid.assetName}"</strong> telah berhasil diverifikasi dan terbuka.
                </p>
              </div>

              <div className="bg-black/25 p-4 border border-outline-variant/10 rounded-lg text-xs font-mono space-y-2">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant/60">Aset:</span>
                  <span className="text-white">{selectedBid.assetName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant/60">Nilai Penawaran:</span>
                  <span className="text-secondary font-bold">{selectedBid.amount.toFixed(4)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant/60">Hash Terverifikasi:</span>
                  <span className="text-primary font-bold">{truncHash(selectedBid.hash)}</span>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full bg-surface-container border border-outline-variant hover:bg-surface-container-high text-white font-label-mono text-xs uppercase tracking-wider py-3.5 rounded-lg transition-all cursor-pointer"
              >
                Verifikasi Penawaran Lain
              </button>
            </div>
          )}
        </div>
      )}

      {/* Already Revealed Section */}
      {revealedBids.length > 0 && (
        <div className="glass-panel border border-[#10b981]/20 p-6 md:p-8 rounded-xl flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-4">
            <span className="material-symbols-outlined text-[#10b981] text-2xl select-none">verified</span>
            <div>
              <h3 className="font-stats-display text-base text-on-surface">Penawaran Terbuka (Diverifikasi)</h3>
              <p className="font-label-mono text-[10px] text-on-surface-variant/60 mt-0.5">{revealedBids.length} penawaran sudah diverifikasi</p>
            </div>
          </div>

          <div className="space-y-2">
            {revealedBids.map((bid) => (
              <div
                key={bid.hash}
                className="p-4 rounded-lg border border-[#10b981]/15 bg-[#10b981]/5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-5 h-5 rounded-full bg-[#10b981]/20 border border-[#10b981]/40 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#10b981] text-xs">check</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-label-mono text-xs text-on-surface font-bold truncate">{bid.assetName}</p>
                      <p className="font-label-mono text-[10px] text-on-surface-variant/60 mt-0.5 truncate">
                        {truncHash(bid.hash)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-stats-display text-sm text-[#10b981] font-bold">{bid.amount.toFixed(4)} ETH</p>
                    <span className="px-2 py-0.5 rounded bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 text-[9px] uppercase font-bold tracking-wider">
                      Terbuka
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All revealed — empty unrevealed state */}
      {bidsSubmitted.length > 0 && unrevealedBids.length === 0 && (
        <div className="glass-panel border border-outline-variant/10 p-8 rounded-xl flex flex-col items-center justify-center text-center py-12 gap-4">
          <div className="w-14 h-14 rounded-full bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center text-[#10b981]">
            <span className="material-symbols-outlined text-3xl select-none">task_alt</span>
          </div>
          <div className="space-y-1 max-w-[380px]">
            <h3 className="font-stats-display text-base text-[#10b981]">Semua Penawaran Sudah Terbuka</h3>
            <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
              Seluruh komitmen penawaran Anda telah berhasil diverifikasi. Anda dapat mengklaim aset atau menarik dana di halaman Hasil Lelang & Klaim.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
