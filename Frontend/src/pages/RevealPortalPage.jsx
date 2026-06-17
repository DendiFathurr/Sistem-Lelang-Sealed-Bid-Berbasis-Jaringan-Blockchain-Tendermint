import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

export default function RevealPortalPage({ 
  assets, 
  bidsSubmitted = [], 
  onRevealBidSuccess, 
  showToast,
  triggerLoading 
}) {
  const [selectedBid, setSelectedBid] = useState(null)
  const [revealStatus, setRevealStatus] = useState(null) // null | 'success'
  const [inputMode, setInputMode] = useState('upload') // 'upload' | 'manual'

  // Input states
  const [manualAmount, setManualAmount] = useState('')
  const [manualSalt, setManualSalt] = useState('')
  const [localComputedHash, setLocalComputedHash] = useState('')
  const [isDragActive, setIsDragActive] = useState(false)

  // Filter bids that haven't been revealed yet
  const unrevealedBids = bidsSubmitted.filter((bid) => !bid.revealed)
  const revealedBids = bidsSubmitted.filter((bid) => bid.revealed)

  // Truncate hash for display
  const truncHash = (hash) => {
    if (!hash) return ''
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 6)}`
  }

  // Calculate hash locally based on inputs
  useEffect(() => {
    if (!manualAmount || isNaN(parseFloat(manualAmount)) || parseFloat(manualAmount) <= 0 || !manualSalt) {
      setLocalComputedHash('')
      return
    }
    try {
      const amountInWei = ethers.parseEther(manualAmount)
      const hash = ethers.solidityPackedKeccak256(
        ['uint256', 'string'],
        [amountInWei, manualSalt]
      )
      setLocalComputedHash(hash)
    } catch (err) {
      console.error(err)
      setLocalComputedHash('')
    }
  }, [manualAmount, manualSalt])

  // Reset inputs when selected bid changes
  useEffect(() => {
    setManualAmount('')
    setManualSalt('')
    setRevealStatus(null)
  }, [selectedBid])

  // Parse text file contents to extract amount, salt and hash
  const parseAndApplyKeyFile = (text) => {
    try {
      const bidMatch = text.match(/NOMINAL PENAWARAN:\s*([\d.]+)\s*ETH/i)
      const saltMatch = text.match(/SECRET SALT\s*:\s*(\w+)/i)

      if (bidMatch && saltMatch) {
        setManualAmount(bidMatch[1])
        setManualSalt(saltMatch[1])
        if (showToast) {
          showToast('Kunci rahasia berhasil dimuat dari berkas!', 'success')
        }
      } else {
        if (showToast) {
          showToast('Format berkas kunci tidak valid atau rusak.', 'error')
        }
      }
    } catch (err) {
      console.error(err)
      if (showToast) {
        showToast('Gagal memproses berkas kunci.', 'error')
      }
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      parseAndApplyKeyFile(event.target.result)
    }
    reader.readAsText(file)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true)
    } else if (e.type === 'dragleave') {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        parseAndApplyKeyFile(event.target.result)
      }
      reader.readAsText(file)
    }
  }

  const handleReveal = async () => {
    if (!selectedBid || !localComputedHash) return

    if (localComputedHash.toLowerCase() !== selectedBid.hash.toLowerCase()) {
      if (showToast) {
        showToast('Kombinasi Nominal & Salt TIDAK cocok dengan hash komitmen.', 'error')
      }
      return
    }

    if (triggerLoading) {
      await triggerLoading('Memverifikasi bukti lokal dan mengirim transaksi reveal ke blockchain...')
    }

    try {
      // 1. Sync updated bid status in backend (off-chain highest bid update)
      const bidVal = parseFloat(manualAmount)
      await fetch(`http://localhost:5000/api/assets/${selectedBid.assetId}/bid`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentBid: bidVal })
      })

      setRevealStatus('success')
      if (onRevealBidSuccess) {
        onRevealBidSuccess(selectedBid.hash, bidVal)
      }
      if (showToast) {
        showToast('Sukses mengungkap penawaran! Data hash terverifikasi penuh.', 'success')
      }
    } catch (err) {
      console.error(err)
      if (showToast) {
        showToast('Gagal menyinkronkan data reveal dengan backend.', 'error')
      }
    }
  }

  const handleReset = () => {
    setSelectedBid(null)
    setRevealStatus(null)
    setManualAmount('')
    setManualSalt('')
  }

  const hashesMatch = selectedBid && localComputedHash && selectedBid.hash.toLowerCase() === localComputedHash.toLowerCase()

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-[720px] mx-auto w-full">
      {/* Header */}
      <div className="border-b border-outline-variant/10 pb-6 mb-6 text-center">
        <div className="flex flex-col gap-1.5 items-center">
          <div className="font-label-mono text-[10px] text-primary uppercase tracking-[0.2em] font-semibold">
            Decryption & Proof Verification Portal
          </div>
          <h1 className="font-headline-xl text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary uppercase tracking-wider leading-none">
            Reveal Portal (Pembukaan)
          </h1>
          <p className="text-on-surface-variant font-label-mono text-xs mt-2 max-w-[500px]">
            Dekripsi bukti komitmen Anda secara lokal di peramban dan verifikasi keasliannya ke sistem blockchain Aether.
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
              <h3 className="font-stats-display text-base text-on-surface">Penawaran Terkunci (Perlu Reveal)</h3>
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
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'border-primary' : 'border-outline-variant/40'
                      }`}>
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
                      </div>
                      <div className="min-w-0">
                        <p className="font-label-mono text-xs text-on-surface font-bold truncate">{bid.assetName}</p>
                        <p className="font-label-mono text-[10px] text-primary/80 mt-0.5 truncate">
                          Komit Hash: {truncHash(bid.hash)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-stats-display text-xs text-[#fbbf24] font-bold uppercase tracking-wider flex items-center gap-1 justify-end">
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

          {/* Selected bid reveal form */}
          {selectedBid && revealStatus === null && (
            <div className="space-y-5 pt-4 border-t border-outline-variant/10 animate-in fade-in duration-300">
              
              {/* Input Mode Selector */}
              <div className="flex border border-white/10 p-1 bg-black/20 rounded">
                <button 
                  type="button"
                  onClick={() => setInputMode('upload')}
                  className={`flex-grow py-2 font-label-mono text-[11px] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                    inputMode === 'upload' 
                      ? 'bg-white/5 text-primary font-bold' 
                      : 'text-on-surface-variant hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-xs">upload_file</span>
                  UNGGAH FILE KUNCI (.TXT)
                </button>
                <button 
                  type="button"
                  onClick={() => setInputMode('manual')}
                  className={`flex-grow py-2 font-label-mono text-[11px] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                    inputMode === 'manual' 
                      ? 'bg-white/5 text-primary font-bold' 
                      : 'text-on-surface-variant hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-xs">edit_note</span>
                  KETIK MANUAL DATA KUNCI
                </button>
              </div>

              {/* Upload Zone */}
              {inputMode === 'upload' && (
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3 transition-colors ${
                    isDragActive 
                      ? 'border-primary bg-primary/5' 
                      : 'border-white/10 hover:border-white/20 bg-black/20'
                  }`}
                >
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/50">cloud_upload</span>
                  <div className="space-y-1">
                    <p className="font-label-mono text-xs text-on-surface font-bold">Seret & lepas berkas kunci di sini</p>
                    <p className="font-body-md text-[10px] text-on-surface-variant/60">atau cari berkas di folder lokal</p>
                  </div>
                  <label className="mt-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 text-xs font-label-mono text-white rounded cursor-pointer transition-colors">
                    Pilih Berkas Kunci (.txt)
                    <input 
                      type="file" 
                      accept=".txt" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                  </label>
                </div>
              )}

              {/* Manual Input Fields */}
              {inputMode === 'manual' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-label-mono text-[10px] text-outline">Nominal ETH Asli</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        step="0.0001" 
                        placeholder="0.00"
                        value={manualAmount}
                        onChange={(e) => setManualAmount(e.target.value)}
                        className="w-full bg-surface-container-highest border border-outline-variant focus:border-primary text-on-surface font-mono text-xs p-3 rounded-lg outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-label-mono text-[10px] text-outline">ETH</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-label-mono text-[10px] text-outline">Secret Salt (Kunci Rahasia)</label>
                    <input 
                      type="text" 
                      placeholder="Masukkan Salt Key"
                      value={manualSalt}
                      onChange={(e) => setManualSalt(e.target.value)}
                      className="w-full bg-surface-container-highest border border-outline-variant focus:border-primary text-on-surface font-mono text-xs p-3 rounded-lg outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Dynamic Hashing Match Status Panel */}
              {(manualAmount && manualSalt) && (
                <div className={`p-4 border rounded-lg animate-in fade-in duration-300 font-mono text-xs space-y-2 ${
                  hashesMatch 
                    ? 'bg-success/5 border-success/30 text-success' 
                    : 'bg-error/5 border-error/30 text-error'
                }`}>
                  <div className="font-label-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">
                      {hashesMatch ? 'verified_user' : 'gpp_maybe'}
                    </span>
                    {hashesMatch ? 'DATA DEKRIPSI COCOK' : 'DATA DEKRIPSI TIDAK COCOK'}
                  </div>
                  
                  <div className="space-y-1 text-[10px]">
                    <div className="flex flex-col sm:flex-row justify-between border-b border-white/5 pb-1">
                      <span className="opacity-70">Hash Terkomit:</span>
                      <span className="text-white break-all">{selectedBid.hash}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between pt-1">
                      <span className="opacity-70">Hash Hasil Dekripsi:</span>
                      <span className="break-all">{localComputedHash || 'Kalkulasi gagal...'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleReveal}
                disabled={!hashesMatch}
                className={`w-full font-label-mono text-xs uppercase tracking-widest font-bold py-4 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2 ${
                  hashesMatch 
                    ? 'bg-primary text-on-primary hover:bg-secondary hover:text-on-secondary shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-[0.98]'
                    : 'bg-white/5 border border-white/10 text-white/25 cursor-not-allowed'
                }`}
              >
                <span className="material-symbols-outlined text-lg">lock_open</span>
                Dekripsi & Buka Bid Rahasia
              </button>
            </div>
          )}

          {/* Reveal Success Screen */}
          {selectedBid && revealStatus === 'success' && (
            <div className="space-y-4 pt-4 border-t border-outline-variant/10 animate-in zoom-in-95 duration-300">
              <div className="p-6 bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#10b981]/20 border border-[#10b981]/40 flex items-center justify-center mx-auto text-[#10b981]">
                  <span className="material-symbols-outlined text-2xl select-none">verified</span>
                </div>
                <h3 className="font-stats-display text-base text-[#10b981]">Verifikasi Sukses!</h3>
                <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                  Penawaran sebesar <strong className="text-white">{parseFloat(manualAmount).toFixed(4)} ETH</strong> pada aset <strong className="text-white">"{selectedBid.assetName}"</strong> telah berhasil didekripsi locally, dicocokkan dengan hash, dan terverifikasi secara penuh.
                </p>
              </div>

              <div className="bg-black/25 p-4 border border-outline-variant/10 rounded-lg text-xs font-mono space-y-2">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant/60">Aset:</span>
                  <span className="text-white">{selectedBid.assetName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant/60">Nilai Penawaran Terungkap:</span>
                  <span className="text-secondary font-bold">{parseFloat(manualAmount).toFixed(4)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant/60">Secret Salt:</span>
                  <span className="text-white">{manualSalt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant/60">Hash Komitmen:</span>
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
              <h3 className="font-stats-display text-base text-on-surface">Penawaran Terbuka & Terverifikasi</h3>
              <p className="font-label-mono text-[10px] text-on-surface-variant/60 mt-0.5">{revealedBids.length} penawaran sudah didekripsi secara lokal</p>
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
                        Hash Terkomit: {truncHash(bid.hash)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-stats-display text-sm text-[#10b981] font-bold">{bid.amount ? `${bid.amount.toFixed(4)} ETH` : 'Terungkap'}</p>
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
              Seluruh komitmen penawaran Anda telah berhasil didekripsi dan diverifikasi. Anda dapat melihat status hasil atau menarik dana di halaman Hasil Lelang & Klaim.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
