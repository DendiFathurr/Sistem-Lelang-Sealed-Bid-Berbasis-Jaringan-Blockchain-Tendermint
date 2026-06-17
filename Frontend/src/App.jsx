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

// Helper: get exact time left string based on biddingEnd date
function getTimeLeftString(biddingEnd) {
  if (!biddingEnd) return '00:00:00';
  const diff = new Date(biddingEnd).getTime() - Date.now();
  if (diff <= 0) return '00:00:00';
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  const h = hours.toString().padStart(2, '0');
  const m = minutes.toString().padStart(2, '0');
  const s = seconds.toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function App() {
  // --- Auth State ---
  const [currentPage, setCurrentPage] = useState('auth') // Default to auth page
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('marketplace')

  // --- Wallet State ---
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [balance, setBalance] = useState(4.5)

  const [assets, setAssets] = useState([])
  const [selectedAsset, setSelectedAsset] = useState(null)
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

  // Check Auth on Mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (savedToken && savedUser) {
      const parsedUser = JSON.parse(savedUser)
      setUser(parsedUser)
      setCurrentPage('bids')
      if (parsedUser.walletAddress) {
        setWalletAddress(parsedUser.walletAddress)
        setWalletConnected(true)
      }
    } else {
      setCurrentPage('auth')
    }
  }, [])

  // Fetch Assets and Global Commitments from API
  const fetchAssetsAndCommitments = async () => {
    try {
      const assetsRes = await fetch('http://localhost:5000/api/assets')
      if (assetsRes.ok) {
        const assetsData = await assetsRes.json()
        const mappedAssets = assetsData.map(a => ({
          ...a,
          timeLeft: getTimeLeftString(a.biddingEnd)
        }))
        setAssets(mappedAssets)
        
        // Keep selected asset synced if it was selected
        if (selectedAsset) {
          const updatedSelected = mappedAssets.find(ma => ma.id === selectedAsset.id)
          if (updatedSelected) {
            setSelectedAsset(updatedSelected)
          }
        } else if (mappedAssets.length > 0 && !selectedAsset) {
          setSelectedAsset(mappedAssets[0])
        }
      }

      const commitsRes = await fetch('http://localhost:5000/api/commitments')
      if (commitsRes.ok) {
        const commitsData = await commitsRes.json()
        const mappedCommits = commitsData.map(c => ({
          id: c.id,
          address: c.walletAddress,
          time: new Date(c.timestamp).toLocaleTimeString(),
          assetId: c.assetId
        }))
        setGlobalCommits(mappedCommits)
      }
    } catch (err) {
      console.error('API connection error, using mock fallback assets:', err)
      if (assets.length === 0) {
        setAssets(INITIAL_ASSETS)
        setSelectedAsset(INITIAL_ASSETS[0])
      }
    }
  }

  // Initial load
  useEffect(() => {
    fetchAssetsAndCommitments()
  }, [])

  // Refresh assets/commitments when tab changes
  useEffect(() => {
    if (currentPage === 'bids') {
      fetchAssetsAndCommitments()
    }
  }, [activeTab, currentPage])

  // Countdown timer ticking every second
  useEffect(() => {
    const timer = setInterval(() => {
      setAssets((prev) => prev.map((a) => ({ ...a, timeLeft: getTimeLeftString(a.biddingEnd) })))
      setSelectedAsset((prev) => prev ? { ...prev, timeLeft: getTimeLeftString(prev.biddingEnd) } : null)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Handle User login success
  const handleLoginSuccess = (userData) => {
    setUser(userData)
    if (userData.walletAddress) {
      setWalletAddress(userData.walletAddress)
      setWalletConnected(true)
    }
    setCurrentPage('bids')
  }

  // Listen to accounts changed in MetaMask
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length > 0) {
          const account = accounts[0]
          setWalletAddress(account)
          setWalletConnected(true)
          
          if (user) {
            try {
              const res = await fetch('http://localhost:5000/api/auth/update-wallet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nim: user.nim, walletAddress: account })
              })
              if (res.ok) {
                const resData = await res.json()
                setUser(resData.user)
                localStorage.setItem('user', JSON.stringify(resData.user))
              }
            } catch (err) {
              console.error('Error syncing wallet address with backend:', err)
            }
          }

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
  }, [user])

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
          
          if (user) {
            try {
              const res = await fetch('http://localhost:5000/api/auth/update-wallet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nim: user.nim, walletAddress: account })
              })
              if (res.ok) {
                const resData = await res.json()
                setUser(resData.user)
                localStorage.setItem('user', JSON.stringify(resData.user))
              }
            } catch (err) {
              console.error('Error syncing wallet address with backend:', err)
            }
          }

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

  const handleSubmitBid = async (bidAmountStr, saltKey, commitmentHash) => {
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
    
    try {
      const response = await fetch('http://localhost:5000/api/commitments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: selectedAsset.id,
          walletAddress: walletAddress || '0x71C392B...Unknown',
          commitmentHash: commitmentHash
        })
      });

      if (!response.ok) {
        throw new Error('Gagal menyimpan komitmen ke backend.');
      }

      setBalance((prev) => parseFloat((prev - amount).toFixed(4)))
      
      setBidsSubmitted((prev) => [
        { 
          assetId: selectedAsset.id,
          assetName: selectedAsset.name, 
          amount, 
          salt: saltKey, 
          hash: commitmentHash, 
          timestamp: new Date().toLocaleTimeString(), 
          revealed: false 
        },
        ...prev,
      ])

      fetchAssetsAndCommitments()

      const shortAddr = (walletAddress || '0x71C392B...').substring(0, 6) + '...' + (walletAddress || 'Unknown').substring((walletAddress || 'Unknown').length - 4)
      showToast(`Komitmen penawaran oleh ${shortAddr} berhasil dikirim ke blockchain!`, 'success')
    } catch (err) {
      console.error(err)
      showToast(err.message || 'Gagal mengirim komitmen ke blockchain.', 'error')
    }
  }

  const handleRevealBidSuccess = (bidHash, revealedAmount) => {
    setBidsSubmitted((prev) =>
      prev.map((b) => (b.hash === bidHash ? { ...b, revealed: true, amount: revealedAmount } : b))
    )
    fetchAssetsAndCommitments()
  }

  const handleWithdrawRefund = async (refundAmount, bidTimestamp) => {
    if (refundedBids.includes(bidTimestamp)) return
    await triggerLoading('Menarik pengembalian dana dari contract...')
    setBalance((prev) => parseFloat((prev + refundAmount).toFixed(4)))
    setRefundedBids((prev) => [...prev, bidTimestamp])
    showToast(`Pengembalian dana sebesar ${refundAmount.toFixed(4)} ETH berhasil ditarik!`, 'success')
  }

  const handleClaimAsset = async (bidTimestamp, assetName) => {
    if (claimedBids.includes(bidTimestamp)) return
    await triggerLoading('Mengklaim kepemilikan aset digital...')
    setClaimedBids((prev) => [...prev, bidTimestamp])
    showToast(`Sukses! Kepemilikan aset "${assetName}" telah ditransfer ke dompet Anda.`, 'success')
  }

  // --- Render ---
  if (currentPage === 'auth') {
    return <AuthPage onLoginSuccess={handleLoginSuccess} showToast={showToast} triggerLoading={triggerLoading} />
  }

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={() => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        setWalletConnected(false)
        setWalletAddress('')
        setBalance(4.5)
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
            walletAddress={walletAddress}
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
