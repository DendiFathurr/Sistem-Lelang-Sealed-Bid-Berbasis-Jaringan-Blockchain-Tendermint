import { useState } from 'react'

// Helper to determine deterministically if the user's bid is the highest for a given asset
const getIsHighestBidForAsset = (assetName, userAmount) => {
  const seed = assetName.charCodeAt(0) + assetName.charCodeAt(1) || 100
  
  // Deterministic amounts for other participants
  const rawList = [
    { amount: 0.1500 },
    { amount: 0.2200 },
    { amount: 0.1800 },
    { amount: 0.2500 },
  ]
  const otherAmounts = rawList.map((p, i) => {
    const diff = ((seed + i * 17) % 15) / 100
    return parseFloat((0.12 + diff).toFixed(4))
  })
  
  const maxOtherAmount = Math.max(...otherAmounts)
  return userAmount >= maxOtherAmount
}

export default function ActiveBidsPage({
  walletConnected,
  walletAddress,
  bidsSubmitted = [],
  refundedBids = [],
  claimedBids = [],
  onWithdrawRefund,
  onClaimAsset,
  onGoToReveal
}) {
  // 1. Wallet Disconnected State
  if (!walletConnected) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="border-b border-outline-variant/10 pb-6 mb-6">
          <div className="flex flex-col gap-1.5">
            <div className="font-label-mono text-[10px] text-primary uppercase tracking-[0.2em] font-semibold">
              Winner & Claims Portal
            </div>
            <h1 className="font-headline-xl text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary uppercase tracking-wider leading-none">
              Hasil Lelang & Klaim
            </h1>
          </div>
        </div>

        <div className="glass-panel border border-outline-variant/10 p-8 rounded-xl flex flex-col items-center justify-center text-center py-16 gap-4">
          <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center text-outline-variant">
            <span className="material-symbols-outlined text-4xl select-none">wallet</span>
          </div>
          <div className="space-y-1 max-w-[320px]">
            <h3 className="font-stats-display text-base text-on-surface">Dompet Belum Terhubung</h3>
            <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
              Hubungkan MetaMask Anda di sidebar terlebih dahulu untuk memuat data partisipasi lelang Anda.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 2. Empty Bids State
  if (bidsSubmitted.length === 0) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="border-b border-outline-variant/10 pb-6 mb-6">
          <div className="flex flex-col gap-1.5">
            <div className="font-label-mono text-[10px] text-primary uppercase tracking-[0.2em] font-semibold">
              Winner & Claims Portal
            </div>
            <h1 className="font-headline-xl text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary uppercase tracking-wider leading-none">
              Hasil Lelang & Klaim
            </h1>
          </div>
        </div>

        <div className="glass-panel border border-outline-variant/10 p-8 rounded-xl flex flex-col items-center justify-center text-center py-16 gap-4">
          <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center text-outline-variant">
            <span className="material-symbols-outlined text-4xl select-none">explore</span>
          </div>
          <div className="space-y-1 max-w-[380px]">
            <h3 className="font-stats-display text-base text-on-surface">Belum Ada Aktivitas Lelang</h3>
            <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
              Anda belum mengirimkan penawaran komitmen apa pun pada sesi ini. Riwayat lelang dan peringkat lelang akan muncul di sini setelah Anda mengajukan penawaran.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Format user address
  const formattedUserAddress = walletAddress
    ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
    : '0x....'

  // Sort bids by amount descending
  const sortedBids = [...bidsSubmitted].sort((a, b) => b.amount - a.amount)

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-outline-variant/10 pb-6 mb-6">
        <div className="flex flex-col gap-1.5">
          <div className="font-label-mono text-[10px] text-primary uppercase tracking-[0.2em] font-semibold">
            Winner & Claims Portal
          </div>
          <h1 className="font-headline-xl text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary uppercase tracking-wider leading-none">
            Hasil Lelang & Klaim
          </h1>
          <p className="text-on-surface-variant font-label-mono text-xs mt-2">
            Pantau hasil lelang, klaim aset digital Anda, atau tarik kembali dana jaminan yang terkunci.
          </p>
        </div>
      </div>

      {/* Render each submitted bid as a separate auction card */}
      {sortedBids.map((bid, index) => {
        const isRefunded = refundedBids.includes(bid.timestamp)
        const isClaimed = claimedBids.includes(bid.timestamp)
        const isRevealed = bid.revealed
        const isHighest = getIsHighestBidForAsset(bid.assetName, bid.amount)

        return (
          <div key={bid.timestamp} className="glass-panel border border-outline-variant/10 rounded-xl overflow-hidden shadow-lg animate-in slide-in-from-bottom-4 duration-300">
            {/* Auction Banner */}
            <div className="p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-outline-variant/10 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#fbbf24]/5 via-transparent to-transparent pointer-events-none"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border shrink-0 ${
                  !isRevealed 
                    ? 'bg-[#fbbf24]/20 border-[#fbbf24]/40 text-[#fbbf24]' 
                    : isHighest 
                      ? 'bg-[#10b981]/20 border-[#10b981]/40 text-[#10b981]' 
                      : 'bg-error/10 border-error/20 text-error'
                }`}>
                  <span className="material-symbols-outlined text-2xl select-none" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {!isRevealed ? 'lock' : isHighest ? 'emoji_events' : 'trending_down'}
                  </span>
                </div>
                <div>
                  <h2 className={`font-headline-lg text-base sm:text-lg uppercase tracking-wider ${
                    !isRevealed 
                      ? 'text-[#fbbf24]' 
                      : isHighest 
                        ? 'text-[#10b981]' 
                        : 'text-error'
                  }`}>
                    {!isRevealed 
                      ? 'Menunggu Pembukaan (Reveal)' 
                      : isHighest 
                        ? 'Lelang Selesai — Anda Menang' 
                        : 'Lelang Selesai — Tawaran Terlampaui'}
                  </h2>
                  <p className="font-body-md text-xs text-on-surface-variant">
                    Aset • "{bid.assetName}"
                  </p>
                </div>
              </div>
              
              {/* Top nominal display */}
              <div className="glass-panel px-5 py-3 rounded border-outline-variant/20 text-center relative z-10">
                <p className="font-label-mono text-[9px] text-on-surface-variant/70 mb-1 uppercase tracking-widest">
                  Nominal Komitmen
                </p>
                <div className="flex items-center justify-center gap-1.5">
                  <p className="font-stats-display text-lg text-primary font-bold">
                    {bid.amount.toFixed(4)} ETH
                  </p>
                </div>
              </div>
            </div>

            {/* Action & Detail Grid (2 Columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-outline-variant/10">
              {/* 1. Action Card (Left) */}
              <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between min-h-[220px]">
                {!isRevealed ? (
                  /* Unrevealed State — User must reveal first */
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="material-symbols-outlined text-[#fbbf24] text-2xl select-none">lock</span>
                        <h3 className="font-stats-display text-base text-on-surface">Penawaran Terkunci</h3>
                      </div>
                      <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                        Penawaran Anda pada "{bid.assetName}" masih berstatus hash rahasia di blockchain. Buka isi penawaran Anda di menu Reveal Portal terlebih dahulu agar peringkat pemenang lelang dapat dihitung.
                      </p>
                    </div>
                    <div className="mt-4">
                      <button
                        className="w-full bg-[#fbbf24] hover:bg-[#f59e0b] active:scale-[0.98] text-black font-label-mono text-xs uppercase tracking-wider py-3.5 rounded-lg transition-all font-bold flex items-center justify-center gap-2 cursor-pointer"
                        onClick={onGoToReveal}
                      >
                        <span className="material-symbols-outlined text-sm">lock_open</span>
                        Buka di Reveal Portal
                      </button>
                    </div>
                  </div>
                ) : isHighest ? (
                  /* Revealed & Highest — Winner Card */
                  <div className="flex flex-col h-full justify-between animate-in fade-in duration-300">
                    <div>
                      <div className="flex items-center gap-3 mb-3 text-[#10b981]">
                        <span className="material-symbols-outlined text-2xl select-none" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                        <h3 className="font-stats-display text-base font-bold uppercase tracking-wider">Lelang Dimenangkan!</h3>
                      </div>
                      <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                        Selamat! Penawaran Anda sebesar <strong>{bid.amount.toFixed(4)} ETH</strong> adalah yang tertinggi untuk aset "{bid.assetName}". Anda dapat mengklaim kepemilikan aset digital ini sekarang.
                      </p>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-4 bg-black/20 px-4 py-3 border border-outline-variant/10 rounded-lg text-xs font-label-mono">
                        <span className="text-on-surface-variant/70">HARGA AKHIR</span>
                        <span className="text-white font-bold">{bid.amount.toFixed(4)} ETH</span>
                      </div>
                      {isClaimed ? (
                        <div className="w-full bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30 py-3 rounded-lg font-label-mono text-xs uppercase tracking-wider text-center font-bold">
                          Aset Berhasil Diklaim
                        </div>
                      ) : (
                        <button
                          className="w-full bg-[#10b981] hover:brightness-110 active:scale-[0.98] text-black font-label-mono text-xs uppercase tracking-wider py-3.5 rounded-lg transition-all font-bold flex items-center justify-center gap-2 cursor-pointer"
                          onClick={() => {
                            onClaimAsset(bid.timestamp, bid.assetName)
                          }}
                        >
                          <span className="material-symbols-outlined text-sm">download</span>
                          Klaim Kepemilikan Aset
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Revealed & Lower — Refund Card */
                  <div className="flex flex-col h-full justify-between animate-in fade-in duration-300">
                    <div>
                      <div className="flex items-center gap-3 mb-3 text-error">
                        <span className="material-symbols-outlined text-2xl select-none">trending_down</span>
                        <h3 className="font-stats-display text-base font-bold uppercase tracking-wider">Tawaran Terlampaui (Kalah)</h3>
                      </div>
                      <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                        Penawaran Anda sebesar <strong>{bid.amount.toFixed(4)} ETH</strong> telah terlampaui oleh penawar lain. Silakan tarik kembali dana jaminan Anda ke dompet.
                      </p>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-4 bg-black/20 px-4 py-3 border border-outline-variant/10 rounded-lg text-xs font-label-mono">
                        <span className="text-on-surface-variant/70">DANA TERKUNCI</span>
                        <span className="text-white font-bold">{bid.amount.toFixed(4)} ETH</span>
                      </div>
                      {isRefunded ? (
                        <div className="w-full bg-surface-container border border-outline-variant/20 text-on-surface-variant/50 py-3 rounded-lg font-label-mono text-xs uppercase tracking-wider text-center">
                          Dana Pengembalian Sudah Ditarik
                        </div>
                      ) : (
                        <button
                          className="w-full bg-surface-container border border-outline-variant hover:bg-surface-container-high active:scale-[0.98] text-white font-label-mono text-xs uppercase tracking-wider py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                          onClick={() => {
                            onWithdrawRefund(bid.amount, bid.timestamp)
                          }}
                        >
                          <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
                          Tarik Pengembalian Dana
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Bid Detail (Right) */}
              <div className="lg:col-span-7 p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-stats-display text-sm text-on-surface">Detail Penawaran</h3>
                    <span className="font-label-mono text-[10px] text-on-surface-variant/50">#{index + 1}</span>
                  </div>

                  <div className="bg-black/20 border border-outline-variant/10 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <tbody>
                        <tr className="border-b border-outline-variant/10">
                          <td className="py-3.5 px-5 font-label-mono text-on-surface-variant/60">Aset</td>
                          <td className="py-3.5 px-5 font-label-mono text-white">{bid.assetName}</td>
                        </tr>
                        <tr className="border-b border-outline-variant/10">
                          <td className="py-3.5 px-5 font-label-mono text-on-surface-variant/60">Alamat Wallet</td>
                          <td className="py-3.5 px-5 font-label-mono text-white flex items-center gap-2">
                            <span className="select-all">{formattedUserAddress}</span>
                            <span className="px-2 py-0.5 rounded text-[8px] bg-primary/10 text-primary border border-primary/20 font-bold uppercase tracking-wider">
                              Anda
                            </span>
                          </td>
                        </tr>
                        <tr className="border-b border-outline-variant/10">
                          <td className="py-3.5 px-5 font-label-mono text-on-surface-variant/60">Jumlah Tawaran</td>
                          <td className="py-3.5 px-5 font-label-mono text-secondary font-bold">
                            {bid.amount.toFixed(4)} ETH
                          </td>
                        </tr>
                        <tr className="border-b border-outline-variant/10">
                          <td className="py-3.5 px-5 font-label-mono text-on-surface-variant/60">Hash Komitmen</td>
                          <td className="py-3.5 px-5 font-label-mono text-primary font-bold">
                            {bid.hash ? `${bid.hash.substring(0, 8)}...${bid.hash.substring(bid.hash.length - 4)}` : ''}
                          </td>
                        </tr>
                        <tr className="border-b border-outline-variant/10">
                          <td className="py-3.5 px-5 font-label-mono text-on-surface-variant/60">Status Verifikasi</td>
                          <td className="py-3.5 px-5 font-label-mono">
                            {!isRevealed ? (
                              <span className="px-2.5 py-1 rounded bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/20 text-[10px] uppercase font-bold tracking-wider animate-pulse">
                                TERKUNCI (Belum Reveal)
                              </span>
                            ) : isHighest ? (
                              <span className="px-2.5 py-1 rounded bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 text-[10px] uppercase font-bold tracking-wider">
                                🏆 Menang (Tertinggi)
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded bg-error/10 text-error border border-error/20 text-[10px] uppercase font-bold tracking-wider">
                                ❌ Kalah (Siap Refund)
                              </span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3.5 px-5 font-label-mono text-on-surface-variant/60">Waktu Kirim</td>
                          <td className="py-3.5 px-5 font-label-mono text-on-surface">{bid.timestamp}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
