import { useState, useEffect, useRef } from 'react'

export default function AuthPage({ onLoginSuccess, showToast, triggerLoading }) {
  const [mode, setMode] = useState('login')
  const [formData, setFormData] = useState({
    nim: '',
    password: '',
    keepActive: false
  })
  const [isAnimating, setIsAnimating] = useState(false)
  const glowRef = useRef(null)

  // Glow accent micro-interaction tracking mouse movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (glowRef.current) {
        glowRef.current.style.left = `${e.clientX}px`
        glowRef.current.style.top = `${e.clientY}px`
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleModeSwitch = (newMode) => {
    if (newMode === mode) return
    setIsAnimating(true)
    setMode(newMode)
    
    // Scale animation visual feedback (similar to HTML setTimeout)
    setTimeout(() => {
      setIsAnimating(false)
    }, 100)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (triggerLoading) {
      await triggerLoading('Memverifikasi identitas node...')
    }
    try {
      const url = mode === 'login' 
        ? 'http://localhost:5000/api/auth/login' 
        : 'http://localhost:5000/api/auth/register'

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nim: formData.nim,
          password: formData.password,
          username: `User-${formData.nim}`
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Otentikasi gagal')
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      if (showToast) {
        showToast(mode === 'login' ? 'Sesi Protokol Dimulai!' : 'Identitas Node Berhasil Didaftarkan!', 'success')
      }
      if (onLoginSuccess) {
        onLoginSuccess(data.user)
      }
    } catch (err) {
      console.error(err)
      if (showToast) {
        showToast(err.message || 'Koneksi ke backend gagal', 'error')
      }
    }
  }

  return (
    <div className="bg-background text-on-background min-h-screen w-full flex flex-col items-center justify-center py-10 px-4 selection:bg-primary/30 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          ref={glowRef}
          className="absolute -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] glow-accent blur-[120px]"
          style={{ left: '50%', top: '50%', transition: 'left 0.1s ease-out, top 0.1s ease-out' }}
        ></div>
        <div 
          className="absolute top-0 left-0 w-full h-full opacity-10" 
          style={{ 
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', 
            backgroundSize: '32px 32px' 
          }}
        ></div>
        <div className="scanline"></div>
      </div>

      {/* Main Auth Container */}
      <div className="w-full max-w-[440px] z-10 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* Brand Identity */}
        <div className="text-center space-y-2">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg font-bold tracking-tighter text-primary">
            AETHER AUCTION
          </h1>
          <p className="font-label-mono text-label-mono text-on-surface-variant tracking-widest uppercase opacity-60">
            Akses Node Konsorsium
          </p>
        </div>

        {/* Auth Card */}
        <div 
          className={`glass-panel p-6 sm:p-8 md:p-10 relative overflow-hidden group transition-all duration-500 hover:border-primary/30 ${
            isAnimating ? 'scale-[0.99]' : 'scale-100'
          }`}
          style={{ transition: 'transform 0.1s ease, border-color 0.5s ease' }}
        >
          {/* Decorative corner highlights */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/40"></div>
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/40"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary/40"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/40"></div>

          <div className="space-y-6 md:space-y-8">
            {/* Mode Toggle */}
            <div className="flex border border-white/10 p-1 bg-black/20">
              <button 
                type="button"
                className={`flex-1 py-2 font-label-mono text-label-mono transition-all duration-300 ${
                  mode === 'login' 
                    ? 'bg-white/5 text-primary font-bold' 
                    : 'text-on-surface-variant hover:text-white'
                }`}
                onClick={() => handleModeSwitch('login')}
              >
                MASUK
              </button>
              <button 
                type="button"
                className={`flex-1 py-2 font-label-mono text-label-mono transition-all duration-300 ${
                  mode === 'register' 
                    ? 'bg-white/5 text-primary font-bold' 
                    : 'text-on-surface-variant hover:text-white'
                }`}
                onClick={() => handleModeSwitch('register')}
              >
                DAFTAR
              </button>
            </div>

            {/* Header Content */}
            <div className="space-y-1">
              <h2 className="font-stats-display text-stats-display text-on-surface">
                {mode === 'login' ? 'Mulai Sesi' : 'Registrasi Node'}
              </h2>
              <p className="font-caption text-caption text-on-surface-variant">
                {mode === 'login' 
                  ? 'Masukkan kredensial konsorsium Anda di bawah ini.' 
                  : 'Daftarkan identitas baru pada jaringan Aether.'}
              </p>
            </div>

            {/* Form Fields */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* NIM Input */}
                <div className="space-y-2 group">
                  <label 
                    className="block font-label-mono text-label-mono text-on-surface-variant group-focus-within:text-primary transition-colors" 
                    htmlFor="nim"
                  >
                    ID ANGGOTA (NIM)
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full bg-black/40 border border-white/10 px-4 py-3 font-body-md text-body-md text-white focus:outline-none focus:border-primary transition-all placeholder:text-on-surface-variant/30" 
                      id="nim" 
                      name="nim" 
                      type="text"
                      placeholder="NODE-XXXX-XXXX" 
                      required 
                      value={formData.nim}
                      onChange={handleInputChange}
                    />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary/60 transition-colors">
                      fingerprint
                    </span>
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2 group">
                  <label 
                    className="block font-label-mono text-label-mono text-on-surface-variant group-focus-within:text-primary transition-colors" 
                    htmlFor="password"
                  >
                    KUNCI ENKRIPSI (PASSWORD)
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full bg-black/40 border border-white/10 px-4 py-3 font-body-md text-body-md text-white focus:outline-none focus:border-primary transition-all placeholder:text-on-surface-variant/30" 
                      id="password" 
                      name="password" 
                      type="password"
                      placeholder="••••••••" 
                      required 
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary/60 transition-colors">
                      lock
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Options */}
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    className="w-4 h-4 rounded-none bg-black/40 border-white/20 text-primary focus:ring-primary focus:ring-offset-0 transition-colors" 
                    type="checkbox"
                    name="keepActive"
                    checked={formData.keepActive}
                    onChange={handleInputChange}
                  />
                  <span className="font-caption text-caption text-on-surface-variant group-hover:text-white transition-colors">
                    Biarkan Sesi Tetap Aktif
                  </span>
                </label>
                <a 
                  className="font-caption text-caption text-primary hover:text-secondary transition-colors underline underline-offset-4 decoration-primary/30" 
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  Pemulihan
                </a>
              </div>

              {/* Submit Button */}
              <button 
                className="w-full py-4 bg-primary text-on-primary font-label-mono text-label-mono font-bold tracking-widest hover:bg-secondary hover:text-on-secondary transition-all duration-300 active:scale-[0.98] primary-glow cursor-pointer" 
                type="submit"
              >
                {mode === 'login' ? 'MASUK KE PROTOKOL' : 'DAFTAR IDENTITAS'}
              </button>
            </form>

            {/* Status Footer */}
            <div className="flex justify-center items-center gap-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                <span className="font-label-mono text-[10px] text-secondary tracking-tighter">
                  JARINGAN AMAN
                </span>
              </div>
              <div className="h-1 w-1 rounded-full bg-white/20"></div>
              <div className="font-label-mono text-[10px] text-on-surface-variant/40 tracking-tighter">
                LATENSI: 14MS
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="flex justify-center gap-4 md:gap-6 flex-wrap">
          <a className="font-label-mono text-[11px] text-on-surface-variant/40 hover:text-on-surface-variant transition-colors uppercase tracking-widest" href="#" onClick={(e) => e.preventDefault()}>
            Kebijakan Privasi
          </a>
          <a className="font-label-mono text-[11px] text-on-surface-variant/40 hover:text-on-surface-variant transition-colors uppercase tracking-widest" href="#" onClick={(e) => e.preventDefault()}>
            Log Audit
          </a>
          <a className="font-label-mono text-[11px] text-on-surface-variant/40 hover:text-on-surface-variant transition-colors uppercase tracking-widest" href="#" onClick={(e) => e.preventDefault()}>
            Dukungan
          </a>
        </div>
      </div>
    </div>
  )
}
