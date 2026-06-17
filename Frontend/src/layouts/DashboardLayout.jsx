import { useState, useEffect } from 'react'

// Shared layout wrapper with sidebar, mobile header, and footer
export default function DashboardLayout({ children, activeTab, onTabChange, onLogout, balance, walletConnected, walletAddress, onConnectWallet }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close mobile menu on tab change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [activeTab])

  const navItems = [
    { key: 'lelang',      label: 'Lelang',      icon: 'gavel' },
    { key: 'aktif',       label: 'Penawaran Aktif', icon: 'history' },
    { key: 'reveal',      label: 'Reveal Portal',   icon: 'lock_open' },
    { key: 'leaderboard', label: 'Peringkat',       icon: 'leaderboard' },
    { key: 'marketplace', label: 'MarketPlace', icon: 'storefront' },
  ]

  const renderSidebarContent = () => (
    <>
      {/* Brand Logo — Desktop Only */}
      <div className="hidden md:block mb-8">
        <h1 className="font-headline-xl text-2xl tracking-tighter text-primary select-none">
          AETHER AUCTION
        </h1>
        <p className="font-label-mono text-[9px] text-on-surface-variant/40 tracking-widest uppercase">
          Consortium Node
        </p>
      </div>

      {/* User Portfolio */}
      <div className="flex items-center gap-3 p-4 mb-4 bg-surface-container/30 border border-outline-variant/10 rounded-xl">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
          walletConnected 
            ? 'bg-primary/10 border-primary/30 text-primary' 
            : 'bg-surface-container-highest border-outline-variant/20 text-outline-variant'
        }`}>
          <span className="material-symbols-outlined text-xl">
            {walletConnected ? 'person' : 'link_off'}
          </span>
        </div>
        <div>
          <div className="font-label-mono text-[10px] text-on-surface-variant">Portofolio</div>
          <div className={`font-label-mono text-xs font-bold transition-all ${
            walletConnected ? 'text-primary text-sm' : 'text-outline-variant'
          }`}>
            {walletConnected ? `${balance.toFixed(4)} ETH` : 'Belum Terhubung'}
          </div>
        </div>
      </div>

      {/* Wallet Connection */}
      <div className="mb-6 flex flex-col gap-2">
        <button
          className={`w-full font-label-mono text-xs px-4 py-3 border border-outline-variant/20 hover:shadow-[0_0_10px_rgba(77,142,255,0.2)] transition-all cursor-pointer rounded-lg ${
            walletConnected
              ? 'bg-secondary-container/10 text-secondary border-secondary/35'
              : 'bg-primary-container text-on-primary-container'
          }`}
          onClick={onConnectWallet}
        >
          {walletConnected ? 'Dompet Terhubung' : 'Hubungkan Dompet'}
        </button>
        {walletConnected && (
          <div className="text-center font-label-mono text-[10px] text-on-surface-variant/70 truncate px-1 font-semibold select-all">
            {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex flex-col gap-1.5 flex-1">
        {navItems.map((item) => (
          <button
            key={item.key}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-mono text-xs transition-all cursor-pointer active:scale-[0.98] ${
              activeTab === item.key
                ? 'bg-primary-container text-on-primary-container font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container-highest'
            }`}
            onClick={() => onTabChange(item.key)}
          >
            <span className="material-symbols-outlined text-base">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <button
        className="mt-auto bg-surface-container-highest/50 text-on-surface-variant border border-outline-variant/10 py-3 flex justify-center items-center gap-2 hover:bg-surface-container-low hover:text-white transition-all font-label-mono text-xs cursor-pointer rounded-lg active:scale-[0.98]"
        onClick={onLogout}
      >
        <span className="material-symbols-outlined text-sm">logout</span>
        Keluar ke Login
      </button>
    </>
  )

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col md:flex-row selection:bg-primary-container selection:text-on-primary-container relative">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-background/90 backdrop-blur-xl border-b border-outline-variant/10 fixed top-0 w-full h-16 z-50 flex justify-between items-center px-4">
        <button
          type="button"
          className="text-on-surface hover:text-primary transition-colors cursor-pointer p-1"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="material-symbols-outlined text-2xl">
            {isMobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
        <h1 className="font-headline-xl text-lg tracking-tighter text-primary cursor-pointer select-none" onClick={onLogout}>
          AETHER AUCTION
        </h1>
        <div className="w-8"></div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <aside
            className="w-64 bg-surface-container-low h-full border-r border-outline-variant/10 p-5 flex flex-col gap-2 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 pt-12">
              <h2 className="font-headline-xl text-xl tracking-tighter text-primary">AETHER AUCTION</h2>
              <p className="font-label-mono text-[8px] text-on-surface-variant/40 tracking-wider">Mobile Access Node</p>
            </div>
            {renderSidebarContent()}
          </aside>
        </div>
      )}

      {/* Desktop Permanent SideNavBar */}
      <aside className="bg-surface-container-low/40 backdrop-blur-md border-r border-outline-variant/10 fixed left-0 top-0 h-screen w-64 flex-col p-6 gap-2 z-30 hidden md:flex">
        {renderSidebarContent()}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col pt-16 md:pt-0 md:pl-64 min-h-screen w-full relative z-10">
        <div className="max-w-[1200px] mx-auto w-full p-4 sm:p-6 md:p-10 flex-1 flex flex-col">
          {children}
        </div>

        {/* Footer */}
        <footer className="bg-background py-6 mt-auto border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center px-4 md:px-10 w-full gap-4 relative z-10 text-xs text-on-surface-variant">
          <div className="font-label-mono opacity-80 hover:opacity-100 uppercase tracking-widest text-[10px]">
            © {new Date().getFullYear()} PROTOKOL LELANG AETHER
          </div>
          <div className="flex gap-4 md:gap-6 flex-wrap justify-center">
            <a className="hover:text-tertiary transition-colors opacity-80 hover:opacity-100" href="#" onClick={(e) => e.preventDefault()}>Kebijakan Privasi</a>
            <a className="hover:text-tertiary transition-colors opacity-80 hover:opacity-100" href="#" onClick={(e) => e.preventDefault()}>Ketentuan Layanan</a>
            <a className="hover:text-tertiary transition-colors opacity-80 hover:opacity-100" href="#" onClick={(e) => e.preventDefault()}>Audit Keamanan</a>
            <a className="hover:text-tertiary transition-colors opacity-80 hover:opacity-100" href="#" onClick={(e) => e.preventDefault()}>Status Protokol</a>
          </div>
        </footer>
      </main>
    </div>
  )
}
