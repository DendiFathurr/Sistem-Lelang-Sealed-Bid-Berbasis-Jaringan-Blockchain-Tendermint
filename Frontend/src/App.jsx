import { useState, useEffect } from 'react'
import AuthPage from './pages/AuthPage'
import DashboardLayout from './layouts/DashboardLayout'
import MarketplacePage from './pages/MarketplacePage'
import BidDetailPage from './pages/BidDetailPage'
import ActiveBidsPage from './pages/ActiveBidsPage'
import RevealPortalPage from './pages/RevealPortalPage'
import LeaderboardPage from './pages/LeaderboardPage'

// Data aset lelang
const INITIAL_ASSETS = [
  {
    id: '0x8F9B62A1',
    name: 'Project Obsidian',
    description: 'Artefak inti data obsidian futuristik dengan enkripsi tingkat tinggi yang disimpan secara on-chain pada jaringan Aether. Memberikan hak suara khusus pada protokol.',
    currentBid: 0.00,
    timeLeft: '02:14:59',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWHjqT8HLHCA8AhPu87mfvbHnsRBe2wG1VRLjpBL51PpRCMFBlvVoq0QojUFnS6dfTVaJbqmaXBFfcAdMzzG8uSVERYQJ1x1jVtsCULS2_J_3cjha1x4o5a3Ccf80V5mAwoG1h95f4gaOBX3o_jrz4-TiZjnsM-oAjOl-mCsp7W3PdbZXCDjDnJYQTgKqtyMbvhscuubcEtaunW_UZrukea8Oq43dVJrycJ8K87j4BxoAIzDtNIVyKPHfusV5mUjPvhI-3EmTmwfB3',
    views: '1.2k',
    type: 'Core Data',
    standard: 'ERC-721'
  },
  {
    id: '0x3B2C9C4A',
    name: 'Quantum Node Alpha',
    description: 'Prosesor komputasi kuantum canggih dengan sirkuit neon biru yang merepresentasikan daya komputasi node konsorsium. Akses instan ke jaringan komputasi terdistribusi.',
    currentBid: 0.00,
    timeLeft: '00:45:12',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiFDoBvEXsRn0_xMMqMAgKG8bwuJNjj2wrio375LkDGnvF1-7kzM67ykNRKzw9QNWahiGSQJ7vKNZ0Yhm6j5gxgfWxfF2zpONqfIIz0Qy_lV2UnZim5dNVkymLmHi4md-YYjS7LD5Hc8j7hrwyjs1RY70-PctS_jr6GPcl26PMtJr7uLxcz5nkFd0ZgnJaqDLF0CfbFX0Ma7MMewIuCpoKZcsKd_L7_IyBuNAxQ2mzZf20NOn1Y_Mjh6weU-GclvcMvb_21iyJBhbL',
    views: '840',
    type: 'Quantum CPU',
    standard: 'ERC-1155'
  },
  {
    id: '0x1A8D7F0E',
    name: 'Ether Grid Parcel 09',
    description: 'Lahan real estate digital mengambang yang terstruktur rapi pada jaringan metaverse Aether, siap lelang dengan sisa waktu kritis. Hak kepemilikan node virtual.',
    currentBid: 0.00,
    timeLeft: '00:02:34',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFaVvkLnqEsue1Vsp2HuVxh2-bXnPyL0kGW5GJgcca7H02lTaQbV3HEF_YLZ7sm7kL2HGX0cuGD2EXxwbXvozlnRdJuhrHVlH4pD62a0jydQ98Aq1lv0yJuK2yuP3NaWqlk7pc-FhBrCn6zBZxB9c8-BbWvmB1_jn3JPi4fJVv2lFC7VXeChaAjkds6NukNYOIkyUSLbgh1nUjNQ92fwDWSB_JGI2GF_2ylZKA0dzW7F0_SXwMN8yZ6KhCopn-uzO2fbfEnxVhKAuv',
    views: '2.5k',
    type: 'Real Estate',
    standard: 'ERC-721'
  }
]

// Helper: countdown string HH:MM:SS
function countDown(timeStr) {
  const parts = timeStr.split(':').map(Number)
  let seconds = parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (seconds > 0) {
    seconds--
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0')
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${h}:${m}:${s}`
  }
  return '00:00:00'
}

// Helper: generate automatic system commit hash
function generateSystemHash(amount, assetName, nonce) {
  const str = `${amount}:${assetName}:${nonce}`
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  let finalHash = ''
  for (let j = 0; j < 4; j++) {
    let subHash = hash ^ (j * 0x1f3c5b7d)
    subHash = (subHash << 13) | (subHash >>> 19)
    subHash = Math.imul(subHash ^ (subHash >>> 15), 0x85ebca6b)
    subHash = Math.imul(subHash ^ (subHash >>> 13), 0xc2b2ae35)
    subHash ^= subHash >>> 16
    finalHash += (subHash >>> 0).toString(16).padStart(8, '0')
  }
  return '0x' + finalHash
}

function App() {
  // --- Auth State ---
  const [currentPage, setCurrentPage] = useState('bids') // 'auth' | 'bids'
  const [activeTab, setActiveTab] = useState('marketplace')

  // --- Wallet State ---
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [balance, setBalance] = useState(4.5)

  const [assets, setAssets] = useState(INITIAL_ASSETS)
  const [selectedAsset, setSelectedAsset] = useState(INITIAL_ASSETS[0])
  // Salt removed — hash is fully automatic from system
  const [bidsSubmitted, setBidsSubmitted] = useState([])
  const [globalCommits, setGlobalCommits] = useState([])
  const [refundedBids, setRefundedBids] = useState([]) // Track bid timestamps that have been refunded
  const [claimedBids, setClaimedBids] = useState([])   // Track bid timestamps that have been claimed

  // --- UI Toast & Loading states ---
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [loading, setLoading] = useState({ show: false, message: '' })

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
  }

  const hideToast = () => setToast((prev) => ({ ...prev, show: false }))

  useEffect(() => {
    if (toast.show) {
      const t = setTimeout(() => {
        hideToast()
      }, 4000)
      return () => clearTimeout(t)
    }
  }, [toast.show])



  const triggerLoading = (message, duration = 1200) => {
    setLoading({ show: true, message })
    return new Promise((resolve) => {
      setTimeout(() => {
        setLoading({ show: false, message: '' })
        resolve()
      }, duration)
    })
  }

  // Countdown timer — ticks every second for all assets + selected
  useEffect(() => {
    const timer = setInterval(() => {
      setAssets((prev) => prev.map((a) => ({ ...a, timeLeft: countDown(a.timeLeft) })))
      setSelectedAsset((prev) => ({ ...prev, timeLeft: countDown(prev.timeLeft) }))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Listen to accounts changed in MetaMask
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          const account = accounts[0]
          setWalletAddress(account)
          setWalletConnected(true)
          
          window.ethereum.request({
            method: 'eth_getChainId'
          }).then(() => {
            window.ethereum.request({
              method: 'eth_getBalance',
              params: [account, 'latest']
            }).then((balanceWei) => {
              const balanceEth = parseInt(balanceWei, 16) / 1e18
              setBalance(parseFloat(balanceEth.toFixed(4)))
            })
          })
          showToast('Akun MetaMask berganti!', 'info')
        } else {
          setWalletConnected(false)
          setWalletAddress('')
          setBalance(4.5)
          showToast('MetaMask Terputus!', 'warning')
        }
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [])

  // --- Handlers ---
  const handleConnectWallet = async () => {
    if (walletConnected) {
      await triggerLoading('Memutuskan koneksi dompet...')
      setWalletConnected(false)
      setWalletAddress('')
      setBalance(4.5)
      showToast('Koneksi MetaMask diputus.', 'info')
    } else {
      if (typeof window.ethereum !== 'undefined') {
        try {
          await triggerLoading('Menghubungkan ke MetaMask...')
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
          const account = accounts[0]
          setWalletAddress(account)
          setWalletConnected(true)
          
          const balanceWei = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [account, 'latest']
          })
          const balanceEth = parseInt(balanceWei, 16) / 1e18
          setBalance(parseFloat(balanceEth.toFixed(4)))
          showToast('Berhasil menghubungkan dompet MetaMask!', 'success')
        } catch (error) {
          console.error(error)
          showToast('Pengguna membatalkan koneksi atau terjadi kesalahan.', 'error')
        }
      } else {
        showToast('MetaMask tidak terdeteksi! Silakan instal ekstensi browser MetaMask.', 'error')
      }
    }
  }

  const handleCommitBid = (asset) => {
    setSelectedAsset(asset)
    setActiveTab('lelang')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmitBid = async (bidAmountStr) => {
    const amount = parseFloat(bidAmountStr)
    if (isNaN(amount) || amount <= 0) {
      showToast('Masukkan jumlah penawaran yang valid.', 'warning')
      return
    }
    if (amount > balance) {
      showToast('Saldo tidak mencukupi untuk mengajukan penawaran ini.', 'error')
      return
    }

    await triggerLoading('Mengirim komitmen penawaran ke blockchain...')
    const nonce = Date.now().toString(36) + Math.random().toString(36).substring(2, 6)
    const bidHash = generateSystemHash(amount, selectedAsset.name, nonce)
    
    setBalance((prev) => parseFloat((prev - amount).toFixed(4)))
    setBidsSubmitted((prev) => [
      { assetName: selectedAsset.name, amount, hash: bidHash, timestamp: new Date().toLocaleTimeString(), revealed: false },
      ...prev,
    ])
    setGlobalCommits((prev) => [
      { id: Date.now(), address: walletAddress || '0x71C392B...Unknown', amount: amount, time: 'Baru saja' },
      ...prev
    ])
    
    // Dynamically update the highest bid for the active assets
    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === selectedAsset.id) {
          return { ...a, currentBid: Math.max(a.currentBid, amount) }
        }
        return a
      })
    )
    setSelectedAsset((prev) => ({
      ...prev,
      currentBid: Math.max(prev.currentBid, amount),
    }))

    const shortAddr = (walletAddress || '0x71C392B...').substring(0, 6) + '...' + (walletAddress || 'Unknown').substring((walletAddress || 'Unknown').length - 4)
    showToast(`Node ${shortAddr} menaruh bid ${amount.toFixed(2)} ETH pada ${selectedAsset.name}`, 'success')
  }

  // Salt regeneration removed — fully automatic

  const handleRevealBidSuccess = (bidHash) => {
    setBidsSubmitted((prev) =>
      prev.map((b) => (b.hash === bidHash ? { ...b, revealed: true } : b))
    )
  }

  const handleWithdrawRefund = async (refundAmount, bidTimestamp) => {
    if (refundedBids.includes(bidTimestamp)) return // Already refunded
    await triggerLoading('Menarik pengembalian dana dari contract...')
    setBalance((prev) => parseFloat((prev + refundAmount).toFixed(4)))
    setRefundedBids((prev) => [...prev, bidTimestamp])
    showToast(`Pengembalian dana sebesar ${refundAmount.toFixed(4)} ETH berhasil ditarik!`, 'success')
  }

  const handleClaimAsset = async (bidTimestamp, assetName) => {
    if (claimedBids.includes(bidTimestamp)) return // Already claimed
    await triggerLoading('Mengklaim kepemilikan aset digital...')
    setClaimedBids((prev) => [...prev, bidTimestamp])
    showToast(`Sukses! Kepemilikan aset "${assetName}" telah ditransfer ke dompet Anda.`, 'success')
  }

  // --- Render ---
  if (currentPage === 'auth') {
    return <AuthPage onLoginSuccess={() => {
      showToast('Berhasil masuk ke node protokol!', 'success')
      setCurrentPage('bids')
    }} showToast={showToast} triggerLoading={triggerLoading} />
  }

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={() => {
        showToast('Keluar dari sesi protokol.', 'info')
        setCurrentPage('auth')
      }}
      balance={balance}
      walletConnected={walletConnected}
      walletAddress={walletAddress}
      onConnectWallet={handleConnectWallet}
    >
      {/* Page transition wrapper — re-mounts on tab change for smooth animation */}
      <div key={activeTab} className="page-transition">
        {activeTab === 'marketplace' && (
          <MarketplacePage 
            assets={assets} 
            onCommitBid={handleCommitBid} 
            walletConnected={walletConnected} 
            globalCommits={globalCommits} 
          />
        )}

        {activeTab === 'lelang' && (
          <BidDetailPage
            assets={assets}
            selectedAsset={selectedAsset}
            onAssetChange={setSelectedAsset}
            balance={balance}
            onSubmitBid={handleSubmitBid}
          />
        )}

        {activeTab === 'aktif' && (
          <ActiveBidsPage 
            walletConnected={walletConnected} 
            walletAddress={walletAddress} 
            bidsSubmitted={bidsSubmitted}
            refundedBids={refundedBids}
            claimedBids={claimedBids}
            onWithdrawRefund={handleWithdrawRefund}
            onClaimAsset={handleClaimAsset}
            onGoToReveal={() => setActiveTab('reveal')}
          />
        )}

        {activeTab === 'reveal' && (
          <RevealPortalPage 
            assets={assets} 
            bidsSubmitted={bidsSubmitted} 
            onRevealBidSuccess={handleRevealBidSuccess}
            showToast={showToast} 
            triggerLoading={triggerLoading} 
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardPage
            walletConnected={walletConnected}
            walletAddress={walletAddress}
            bidsSubmitted={bidsSubmitted}
            assets={assets}
          />
        )}
      </div>

      {/* Floating Toast Notification Overlay */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-[9999] toast-in max-w-sm w-full bg-surface-container-high/90 backdrop-blur-md border border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="shrink-0 mt-0.5">
            {toast.type === 'success' && <span className="material-symbols-outlined text-[#10b981]">check_circle</span>}
            {toast.type === 'info' && <span className="material-symbols-outlined text-primary">info</span>}
            {toast.type === 'warning' && <span className="material-symbols-outlined text-[#fbbf24]">warning</span>}
            {toast.type === 'error' && <span className="material-symbols-outlined text-error">error</span>}
          </div>
          <div className="flex-grow">
            <p className="font-label-mono text-xs font-bold text-on-surface leading-snug">
              {toast.type === 'success' ? 'TRANSAKSI BERHASIL' : toast.type === 'error' ? 'KESALAHAN SISTEM' : 'NOTIFIKASI SISTEM'}
            </p>
            <p className="font-body-md text-[11px] text-on-surface-variant/80 mt-1 leading-relaxed">
              {toast.message}
            </p>
          </div>
          <button onClick={hideToast} className="shrink-0 hover:bg-white/5 p-1 rounded-lg text-on-surface-variant/40 hover:text-white transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Fullscreen Loading Spinner Overlay */}
      {loading.show && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[99999] flex flex-col items-center justify-center gap-4 animate-in fade-in duration-200">
          <div className="relative w-16 h-16 flex items-center justify-center">
            {/* Outer spinning ring */}
            <div className="absolute inset-0 border-2 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-t-primary border-r-primary rounded-full animate-spin-custom"></div>
            {/* Inner pulsing icon */}
            <span className="material-symbols-outlined text-primary text-2xl animate-pulse-slow">token</span>
          </div>
          <div className="text-center space-y-1">
            <p className="font-label-mono text-xs uppercase tracking-[0.2em] text-primary font-bold">PROSES PROTOKOL</p>
            <p className="font-body-md text-xs text-on-surface-variant max-w-[280px] leading-relaxed">{loading.message}</p>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default App
