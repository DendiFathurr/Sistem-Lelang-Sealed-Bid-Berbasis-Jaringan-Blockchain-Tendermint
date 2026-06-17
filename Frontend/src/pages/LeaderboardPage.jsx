import { useState } from 'react'

// Helper to generate initials or default profile icon based on address
const renderPPBiasa = (address, isUser) => {
  const hash = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const colors = [
    'from-red-500/20 to-orange-500/20 text-orange-400 border-orange-500/35',
    'from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/35',
    'from-green-500/20 to-emerald-500/20 text-emerald-400 border-emerald-500/35',
    'from-purple-500/20 to-indigo-500/20 text-indigo-400 border-indigo-500/35',
    'from-pink-500/20 to-rose-500/20 text-rose-400 border-rose-500/35',
  ]
  const colorClass = isUser 
    ? 'from-primary/20 to-secondary/20 text-primary border-primary/40'
    : colors[hash % colors.length]

  const initials = address.substring(2, 4).toUpperCase() || '0X'

  return (
    <div className={`w-8 h-8 rounded-full bg-gradient-to-br border flex items-center justify-center font-label-mono text-[10px] font-bold shrink-0 ${colorClass}`}>
      {initials}
    </div>
  )
}

export default function LeaderboardPage({ walletConnected, walletAddress, bidsSubmitted = [], assets = [] }) {
  const [selectedAssetId, setSelectedAssetId] = useState(assets[0]?.id || '')

  const selectedAsset = assets.find((a) => a.id === selectedAssetId)

  // Generate deterministic participants for the selected asset
  const getParticipants = () => {
    if (!selectedAsset) return []

    const assetName = selectedAsset.name
    const seed = assetName.charCodeAt(0) + assetName.charCodeAt(1) || 100

    const rawList = [
      { address: '0x3A92e1...F87E', amount: 0.1500, hash: '0x7b23c21a...a8c9' },
      { address: '0x8D5C1b...2A4D', amount: 0.2200, hash: '0x9f1a234b...4d3b' },
      { address: '0x6B1Ed9...D7C3', amount: 0.1800, hash: '0x3c2e1f4a...8f9a' },
      { address: '0x5F8Ac7...E9B2', amount: 0.2500, hash: '0x1d4c2b9a...7b8a' },
    ]

    const list = rawList.map((p, i) => {
      const diff = ((seed + i * 17) % 15) / 100 // 0.00 to 0.14
      const amount = parseFloat((0.12 + diff).toFixed(4))
      const hashHex = ((seed + i * 31) * 987654).toString(16).padEnd(8, '0').substring(0, 8)
      const hash = `0x${hashHex}...${i}e${(seed % 9)}f`
      return {
        address: p.address,
        amount,
        hash,
        isUser: false,
      }
    })

    // Check if the current user has a bid on this asset
    const userBid = bidsSubmitted.find((b) => b.assetName === assetName)
    if (userBid) {
      const formattedUserAddress = walletAddress
        ? `${walletAddress.substring(0, 8)}...${walletAddress.substring(walletAddress.length - 4)}`
        : '0x....'
      list.push({
        address: formattedUserAddress,
        amount: userBid.amount,
        hash: userBid.hash ? `${userBid.hash.substring(0, 10)}...${userBid.hash.substring(userBid.hash.length - 4)}` : '0x....',
        isUser: true,
      })
    }

    // Sort by bid amount descending
    return list.sort((a, b) => b.amount - a.amount)
  }

  const participants = getParticipants()

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-outline-variant/10 pb-6 mb-6">
        <div className="flex flex-col gap-1.5">
          <div className="font-label-mono text-[10px] text-primary uppercase tracking-[0.2em] font-semibold">
            Blockchain Leaderboard
          </div>
          <h1 className="font-headline-xl text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary uppercase tracking-wider leading-none">
            Peringkat Penawaran Lelang
          </h1>
          <p className="text-on-surface-variant font-label-mono text-xs mt-2">
            Lihat papan peringkat transparansi penawaran lelang secara real-time berdasarkan data yang tercatat di blockchain.
          </p>
        </div>
      </div>

      {/* Asset Filter Selector */}
      <div className="glass-panel border border-outline-variant/10 p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl select-none">filter_list</span>
          <div>
            <h3 className="font-stats-display text-sm text-on-surface">Pilih Aset Lelang</h3>
            <p className="font-label-mono text-[10px] text-on-surface-variant/70">Peringkat peringkat dihitung per item lelang</p>
          </div>
        </div>

        <select
          value={selectedAssetId}
          onChange={(e) => setSelectedAssetId(e.target.value)}
          className="w-full md:w-64 bg-surface-container-highest border border-outline-variant focus:border-primary text-on-surface font-label-mono text-xs p-3 rounded-lg outline-none transition-colors cursor-pointer"
        >
          {assets.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.name} ({asset.id})
            </option>
          ))}
        </select>
      </div>

      {/* Leaderboard Table Card */}
      {selectedAsset && (
        <div className="glass-panel border border-outline-variant/10 rounded-xl overflow-hidden shadow-lg">
          {/* Asset Summary Banner */}
          <div className="p-5 bg-black/30 border-b border-outline-variant/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-surface-container border border-outline-variant/20 overflow-hidden shrink-0">
                <img src={selectedAsset.image} alt={selectedAsset.name} className="w-full h-full object-cover opacity-80" />
              </div>
              <div>
                <h2 className="font-stats-display text-base text-white">{selectedAsset.name}</h2>
                <p className="font-label-mono text-[10px] text-primary">{selectedAsset.type} • {selectedAsset.standard}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-label-mono text-[9px] text-on-surface-variant/70 uppercase">Waktu Tersisa</p>
              <p className="font-stats-display text-sm text-[#fbbf24] font-bold tracking-wider">{selectedAsset.timeLeft}</p>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/10 bg-surface-container/20 text-on-surface-variant/70 font-label-mono uppercase text-[10px] tracking-wider">
                  <th className="py-4 px-6 text-center w-16">Peringkat</th>
                  <th className="py-4 px-6">Profil</th>
                  <th className="py-4 px-6">Alamat Wallet</th>
                  <th className="py-4 px-6">Hash Komitmen</th>
                  <th className="py-4 px-6 text-right">Nilai Penawaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {participants.map((participant, index) => {
                  const isGold = index === 0
                  const isSilver = index === 1
                  const isBronze = index === 2

                  return (
                    <tr
                      key={participant.hash}
                      className={`transition-colors hover:bg-white/[0.02] ${
                        participant.isUser ? 'bg-primary/5 hover:bg-primary/10' : ''
                      }`}
                    >
                      {/* Rank Number / Medal */}
                      <td className="py-4 px-6 text-center">
                        {isGold ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#fbbf24]/20 text-[#fbbf24] border border-[#fbbf24]/30 font-bold text-xs select-none">1</span>
                        ) : isSilver ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#94a3b8]/20 text-[#94a3b8] border border-[#94a3b8]/30 font-bold text-xs select-none">2</span>
                        ) : isBronze ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#b45309]/20 text-[#b45309] border border-[#b45309]/30 font-bold text-xs select-none">3</span>
                        ) : (
                          <span className="font-label-mono text-on-surface-variant/60">{index + 1}</span>
                        )}
                      </td>

                      {/* PP Biasa (Initials Circle) */}
                      <td className="py-4 px-6">
                        {renderPPBiasa(participant.address, participant.isUser)}
                      </td>

                      {/* Address */}
                      <td className="py-4 px-6 font-label-mono text-on-surface font-semibold">
                        <div className="flex items-center gap-2">
                          <span>{participant.address}</span>
                          {participant.isUser && (
                            <span className="px-2 py-0.5 rounded text-[8px] bg-primary/20 text-primary border border-primary/30 font-bold uppercase tracking-wider scale-95 select-none">
                              Anda
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Hash */}
                      <td className="py-4 px-6 font-label-mono text-on-surface-variant/80">
                        {participant.hash}
                      </td>

                      {/* Amount displayed normally */}
                      <td className="py-4 px-6 text-right font-stats-display text-sm font-bold text-secondary">
                        {participant.amount.toFixed(4)} ETH
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
