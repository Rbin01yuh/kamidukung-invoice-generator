<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  ArrowRight, 
  Check, 
  FileText, 
  Mail, 
  Download, 
  Palette, 
  Shield, 
  Zap, 
  Menu, 
  X, 
  Sparkles, 
  ChevronRight,
  Send,
  Lock,
  FileSpreadsheet,
  CheckCircle2
} from '@lucide/vue'

// App States
const companyName = ref('PT Maju Jaya Kreatif')
const clientName = ref('Budi Santoso')
const invoiceTotal = ref('12500000')
const invoiceNumber = ref('INV-2026-004')
const selectedColor = ref('#1F3A5F')
const emailPreviewSent = ref(false)
const mobileMenuOpen = ref(false)

const formatCurrency = (val) => {
  const num = parseInt(val) || 0
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num)
}

const colorPresets = [
  '#1F3A5F', // Deep Slate Blue (Primary Theme)
  '#0F766E', // Teal
  '#7C3AED', // Violet
  '#DB2777', // Pink
  '#16A34A', // Green
  '#0EA5E9'  // Sky Blue
]

// Smooth Scroll to Sections
const scrollTo = (id) => {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
  mobileMenuOpen.value = false
}

// Resend Email Demonstration Animation
const simulateSendEmail = () => {
  if (emailPreviewSent.value) return
  emailPreviewSent.value = true
  setTimeout(() => {
    emailPreviewSent.value = false
  }, 4000)
}

// Dynamic Links
const appUrl = computed(() => {
  return '/app'
})

// FAQ Accordion State
const activeFaq = ref(null)
const toggleFaq = (index) => {
  activeFaq.value = activeFaq.value === index ? null : index
}

const faqs = [
  {
    q: 'Apakah data invoice saya disimpan di server?',
    a: 'Sama sekali tidak. Aplikasi kami berjalan 100% di sisi klien (browser Anda). Seluruh data input, logo, dan informasi keuangan diproses di memori browser lokal Anda secara privat. Kami tidak mengumpulkan, menyimpan, atau melihat data invoice Anda.'
  },
  {
    q: 'Bagaimana cara kerja fitur kirim email otomatis?',
    a: 'Aplikasi mengintegrasikan Resend API secara langsung dari browser Anda. Anda cukup memasukkan Resend API Key Anda sendiri (yang disimpan dengan aman di local storage browser Anda). Email dikirim menggunakan akun Resend Anda sendiri sehingga reputasi pengiriman dan domain berada di bawah kendali penuh Anda.'
  },
  {
    q: 'Apakah ekspor PDF & Word mendukung kustomisasi penuh?',
    a: 'Ya! Ekspor PDF dan Word kami dirancang secara profesional dengan dukungan margin dinamis, tabel item multi-kolom otomatis, perhitungan pajak (PPN), diskon, informasi rekening bank, tanda tangan digital, serta pilihan warna aksen branding perusahaan Anda.'
  },
  {
    q: 'Apakah layanan Kaduin ini berbayar?',
    a: 'Layanan pembuat invoice ini 100% gratis untuk digunakan secara offline/client-side tanpa batasan jumlah invoice yang dibuat. Kami berencana merilis paket Pro di masa mendatang bagi pengguna yang membutuhkan sinkronisasi cloud, kolaborasi tim, dan pelacakan invoice otomatis.'
  }
]
</script>

<template>
  <div class="relative min-h-screen font-sans antialiased text-[#1E293B] bg-grid-dots">
    
    <!-- Background Animated Gradient Mesh -->
    <div class="absolute top-0 left-0 right-0 h-[1000px] overflow-hidden pointer-events-none -z-10">
      <div class="absolute -top-[300px] -left-[200px] w-[600px] h-[600px] rounded-full bg-[#1F3A5F]/10 blur-[100px] animate-float-slow"></div>
      <div class="absolute top-[200px] -right-[200px] w-[500px] h-[500px] rounded-full bg-[#10B981]/8 blur-[100px] animate-float-medium"></div>
      <div class="absolute top-[500px] left-[15%] w-[450px] h-[450px] rounded-full bg-violet-500/5 blur-[120px] animate-float-slow"></div>
    </div>

    <!-- Header Navigation -->
    <header class="sticky top-0 z-50 w-full border-b border-[#1F3A5F]/10 bg-white/70 backdrop-blur-md transition-all duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        <!-- Logo -->
        <a href="#" class="flex items-center gap-3 group">
          <img :src="'/images/kaduin.png'" alt="Kaduin Logo" class="w-14 h-14 object-contain rounded-2xl shadow-md group-hover:scale-105 transition-transform duration-300" />
          <div class="flex flex-col">
            <span class="text-xl font-black tracking-tight text-[#1F3A5F] font-display leading-none">KADUIN</span>
            <span class="text-[10px] font-extrabold tracking-widest text-[#10B981] uppercase mt-0.5">INVOICE</span>
          </div>
        </a>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-8">
          <button @click="scrollTo('features')" class="text-sm font-medium text-[#1F3A5F]/80 hover:text-[#1F3A5F] transition-colors cursor-pointer">Fitur Utama</button>
          <button @click="scrollTo('demo')" class="text-sm font-medium text-[#1F3A5F]/80 hover:text-[#1F3A5F] transition-colors cursor-pointer">Live Preview</button>
          <button @click="scrollTo('pricing')" class="text-sm font-medium text-[#1F3A5F]/80 hover:text-[#1F3A5F] transition-colors cursor-pointer">Harga</button>
          <button @click="scrollTo('faq')" class="text-sm font-medium text-[#1F3A5F]/80 hover:text-[#1F3A5F] transition-colors cursor-pointer">Tanya Jawab</button>
        </nav>

        <!-- CTA Button -->
        <div class="hidden md:flex items-center gap-4">
          <a :href="appUrl" class="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#1F3A5F] hover:bg-[#1F3A5F]/95 hover:shadow-lg hover:shadow-[#1F3A5F]/20 transition-all duration-300">
            Mulai Buat Invoice
            <ArrowRight class="w-4 h-4 ml-2" />
          </a>
        </div>

        <!-- Mobile Menu Toggle -->
        <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden p-2 rounded-lg text-[#1F3A5F] hover:bg-slate-100 transition-colors">
          <Menu v-if="!mobileMenuOpen" class="w-6 h-6" />
          <X v-else class="w-6 h-6" />
        </button>
      </div>

      <!-- Mobile Navigation Drawer -->
      <div v-if="mobileMenuOpen" class="md:hidden border-t border-[#1F3A5F]/10 bg-white/95 backdrop-blur-lg px-4 pt-4 pb-6 space-y-3">
        <button @click="scrollTo('features')" class="block w-full text-left py-2.5 px-3 rounded-lg text-base font-semibold text-[#1F3A5F]/80 hover:bg-slate-50 hover:text-[#1F3A5F]">Fitur Utama</button>
        <button @click="scrollTo('demo')" class="block w-full text-left py-2.5 px-3 rounded-lg text-base font-semibold text-[#1F3A5F]/80 hover:bg-slate-50 hover:text-[#1F3A5F]">Live Preview</button>
        <button @click="scrollTo('pricing')" class="block w-full text-left py-2.5 px-3 rounded-lg text-base font-semibold text-[#1F3A5F]/80 hover:bg-slate-50 hover:text-[#1F3A5F]">Harga</button>
        <button @click="scrollTo('faq')" class="block w-full text-left py-2.5 px-3 rounded-lg text-base font-semibold text-[#1F3A5F]/80 hover:bg-slate-50 hover:text-[#1F3A5F]">Tanya Jawab</button>
        <a :href="appUrl" class="block w-full text-center py-3 px-4 rounded-xl text-base font-bold text-white bg-[#1F3A5F]">
          Mulai Buat Invoice
        </a>
      </div>
    </header>

    <!-- HERO SECTION -->
    <section class="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          <!-- Text Content -->
          <div class="lg:col-span-7 flex flex-col items-start text-left space-y-6">
            
            <!-- Sparkles Badge -->
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold text-[#1F3A5F] bg-[#1F3A5F]/5 border border-[#1F3A5F]/10">
              <Sparkles class="w-3.5 h-3.5 text-[#10B981]" />
              <span>100% Client-Side & Tanpa Registrasi</span>
            </div>

            <!-- Main Heading -->
            <h1 class="text-4xl sm:text-5xl lg:text-6xl tracking-tight text-[#1F3A5F] font-display font-black leading-[1.1] max-w-2xl">
              Kirim Invoice Profesional, <span class="bg-gradient-to-r from-[#1F3A5F] via-[#3B6FA0] to-[#10B981] bg-clip-text text-transparent">Lebih Cepat & Otomatis.</span>
            </h1>

            <!-- Subtitle -->
            <p class="text-base sm:text-lg text-[#1F3A5F]/70 max-w-xl leading-relaxed">
              Satu platform instan untuk membuat, mengkustomisasi warna branding, ekspor ke berkas PDF/DOCX berkualitas tinggi, dan mengirim langsung ke email klien Anda secara otomatis.
            </p>

            <!-- Actions buttons -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              <a :href="appUrl" class="inline-flex items-center justify-center px-8 py-4 rounded-2xl text-base font-bold text-white bg-[#1F3A5F] shadow-xl shadow-[#1F3A5F]/15 hover:bg-[#1F3A5F]/95 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-[#1F3A5F]/20 transition-all duration-300">
                Mulai Buat Invoice
                <ArrowRight class="w-5 h-5 ml-2.5" />
              </a>
              <button @click="scrollTo('demo')" class="inline-flex items-center justify-center px-8 py-4 rounded-2xl text-base font-semibold text-[#1F3A5F] bg-white border border-[#1F3A5F]/15 hover:bg-slate-50 transition-all duration-200 cursor-pointer">
                Lihat Demo
              </button>
            </div>

            <!-- Minimalist Stats -->
            <div class="pt-8 border-t border-[#1F3A5F]/10 w-full max-w-lg grid grid-cols-3 gap-6 sm:gap-8">
              <div>
                <p class="text-2xl sm:text-3xl font-extrabold text-[#1F3A5F] font-display">&lt; 30d</p>
                <p class="text-xs font-semibold uppercase tracking-wider text-[#1F3A5F]/55">Pembuatan</p>
              </div>
              <div>
                <p class="text-2xl sm:text-3xl font-extrabold text-[#10B981] font-display">100%</p>
                <p class="text-xs font-semibold uppercase tracking-wider text-[#1F3A5F]/55">Data Aman</p>
              </div>
              <div>
                <p class="text-2xl sm:text-3xl font-extrabold text-[#1F3A5F] font-display">Rp 0</p>
                <p class="text-xs font-semibold uppercase tracking-wider text-[#1F3A5F]/55">Biaya Bulanan</p>
              </div>
            </div>

          </div>

          <!-- Hero Graphic App Mockup -->
          <div class="lg:col-span-5 relative w-full flex justify-center">
            
            <!-- Glowing circles behind mockup -->
            <div class="absolute inset-0 bg-radial from-[#3B6FA0]/15 to-transparent blur-3xl -z-10 scale-110"></div>
            
            <!-- Premium Glassmorphic Mockup Container -->
            <div class="relative w-full max-w-[420px] rounded-3xl border border-white/80 bg-white/70 backdrop-blur-xl shadow-2xl p-6 transition-all duration-500 hover:scale-[1.02]">
              
              <!-- Mockup Toolbar -->
              <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div class="flex items-center gap-1.5">
                  <span class="w-3 h-3 rounded-full bg-red-400"></span>
                  <span class="w-3 h-3 rounded-full bg-yellow-400"></span>
                  <span class="w-3 h-3 rounded-full bg-green-400"></span>
                </div>
                <div class="text-xs font-bold text-[#1F3A5F]/60 font-display uppercase tracking-wider">Dashboard Invoice</div>
                <div class="w-6"></div>
              </div>

              <!-- Mockup Content: Invoice Form Layout -->
              <div class="space-y-4">
                
                <!-- Theme Indicator -->
                <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <Palette class="w-4 h-4 text-[#1F3A5F]" />
                    <span class="text-xs font-semibold text-[#1F3A5F]/85">Warna Aksen Brand</span>
                  </div>
                  <div class="flex gap-1">
                    <span class="w-4 h-4 rounded-full bg-[#1F3A5F] border border-white shadow-sm"></span>
                    <span class="w-4 h-4 rounded-full bg-[#10B981]"></span>
                    <span class="w-4 h-4 rounded-full bg-violet-600"></span>
                  </div>
                </div>

                <!-- Input Mockups -->
                <div class="space-y-2.5">
                  <div class="h-8.5 rounded-lg bg-slate-50 border border-slate-100 px-3 flex items-center justify-between">
                    <span class="text-[11px] font-semibold text-slate-400">Nomor Invoice</span>
                    <span class="text-[11px] font-bold text-[#1F3A5F]">INV-2026-004</span>
                  </div>
                  <div class="h-8.5 rounded-lg bg-slate-50 border border-slate-100 px-3 flex items-center justify-between">
                    <span class="text-[11px] font-semibold text-slate-400">Klien</span>
                    <span class="text-[11px] font-bold text-[#1F3A5F]">Budi Santoso</span>
                  </div>
                  <div class="h-8.5 rounded-lg bg-slate-50 border border-slate-100 px-3 flex items-center justify-between">
                    <span class="text-[11px] font-semibold text-slate-400">Total Tagihan</span>
                    <span class="text-[11px] font-bold text-[#10B981]">Rp 12.500.000</span>
                  </div>
                </div>

                <!-- Export/Send Simulation -->
                <div class="pt-4 border-t border-slate-100 space-y-2">
                  <button @click="simulateSendEmail" class="w-full h-10 rounded-xl bg-[#1F3A5F] hover:bg-[#1F3A5F]/95 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer">
                    <Send class="w-3.5 h-3.5" />
                    Kirim ke Klien (Resend API)
                  </button>
                  <div class="grid grid-cols-2 gap-2">
                    <div class="h-9.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-[11px] font-bold flex items-center justify-center gap-1.5">
                      <Download class="w-3.5 h-3.5 text-red-500" />
                      Export PDF
                    </div>
                    <div class="h-9.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-[11px] font-bold flex items-center justify-center gap-1.5">
                      <Download class="w-3.5 h-3.5 text-blue-500" />
                      Export Word
                    </div>
                  </div>
                </div>

                <!-- Animated success popup in mockup -->
                <Transition
                  enter-active-class="transition duration-300 ease-out"
                  enter-from-class="transform translate-y-4 opacity-0"
                  enter-to-class="transform translate-y-0 opacity-100"
                  leave-active-class="transition duration-200 ease-in"
                  leave-from-class="transform translate-y-0 opacity-100"
                  leave-to-class="transform translate-y-4 opacity-0"
                >
                  <div v-if="emailPreviewSent" class="absolute -bottom-4 left-6 right-6 p-3 rounded-xl bg-emerald-500 text-white flex items-center gap-2.5 shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 class="w-5 h-5 shrink-0" />
                    <div class="text-[11px] leading-tight text-left">
                      <p class="font-extrabold">Invoice Terkirim!</p>
                      <p class="text-white/80">Klien menerima email + lampiran PDF.</p>
                    </div>
                  </div>
                </Transition>

              </div>
            </div>
            
          </div>

        </div>
      </div>
    </section>

    <!-- TRUST / PARTNER SECTION -->
    <section class="py-12 border-y border-[#1F3A5F]/10 bg-white/40 backdrop-blur-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p class="text-xs font-bold tracking-widest text-[#1F3A5F]/55 uppercase mb-6">Cocok untuk Kebutuhan Operasional Bisnis Anda</p>
        <div class="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 grayscale opacity-65">
          <div class="flex items-center gap-2 text-[#1F3A5F]">
            <Zap class="w-5 h-5 text-[#10B981]" />
            <span class="font-display font-black tracking-tight text-lg">Freelancer</span>
          </div>
          <div class="flex items-center gap-2 text-[#1F3A5F]">
            <Shield class="w-5 h-5 text-[#1F3A5F]" />
            <span class="font-display font-black tracking-tight text-lg">Agensi Kreatif</span>
          </div>
          <div class="flex items-center gap-2 text-[#1F3A5F]">
            <Lock class="w-5 h-5 text-[#10B981]" />
            <span class="font-display font-black tracking-tight text-lg">UMKM Mandiri</span>
          </div>
          <div class="flex items-center gap-2 text-[#1F3A5F]">
            <FileSpreadsheet class="w-5 h-5 text-[#1F3A5F]" />
            <span class="font-display font-black tracking-tight text-lg">Konsultan</span>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURES BENTO GRID -->
    <section id="features" class="py-20 md:py-32">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header -->
        <div class="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1F3A5F] tracking-tight">
            Fitur Lengkap untuk Produktivitas Maksimal
          </h2>
          <p class="text-base sm:text-lg text-[#1F3A5F]/70 leading-relaxed">
            Tidak hanya sekadar menulis angka, platform kami mempermudah seluruh siklus pembuatan invoice Anda dengan estetika kelas premium.
          </p>
        </div>

        <!-- Bento Grid Layout -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
          
          <!-- Card 1: Dynamic Branding (Span 7) -->
          <div class="md:col-span-7 rounded-3xl border border-[#1F3A5F]/10 bg-white shadow-lg p-8 flex flex-col justify-between overflow-hidden group hover:shadow-xl transition-all duration-300">
            <div class="space-y-4">
              <div class="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Palette class="w-6 h-6" />
              </div>
              <h3 class="text-xl sm:text-2xl font-bold text-[#1F3A5F]">Kustomisasi Warna Aksen & Logo</h3>
              <p class="text-sm sm:text-base text-[#1F3A5F]/70 leading-relaxed">
                Sesuaikan seluruh dokumen dengan warna identitas bisnis Anda hanya dengan sekali klik. Unggah logo resmi perusahaan Anda dan posisikan secara otomatis di lembar invoice.
              </p>
            </div>
            
            <!-- Graphic inside card -->
            <div class="mt-8 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center gap-3">
              <span v-for="c in colorPresets" :key="c" @click="selectedColor = c" :style="{ backgroundColor: c }" class="w-8 h-8 rounded-full border-2 cursor-pointer transition-transform duration-200 hover:scale-110" :class="selectedColor === c ? 'border-[#1F3A5F] scale-110 shadow-md' : 'border-transparent'"></span>
              <span class="text-xs font-semibold text-slate-500 ml-2">Pilih Aksen Warna</span>
            </div>
          </div>

          <!-- Card 2: Safe client-side (Span 5) -->
          <div class="md:col-span-5 rounded-3xl border border-[#1F3A5F]/10 bg-white shadow-lg p-8 flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
            <div class="space-y-4">
              <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Shield class="w-6 h-6" />
              </div>
              <h3 class="text-xl sm:text-2xl font-bold text-[#1F3A5F]">100% Aman & Privat</h3>
              <p class="text-sm sm:text-base text-[#1F3A5F]/70 leading-relaxed">
                Keamanan adalah prioritas kami. Semua data keuangan, jumlah tagihan, data klien, hingga tanda tangan diproses lokal. Tidak ada data yang di-upload ke server luar.
              </p>
            </div>
            <div class="mt-8 flex items-center gap-3 text-emerald-500 font-bold text-xs">
              <Lock class="w-5 h-5" />
              <span>DIENKRIPSI DAN DIPROSES LOKAL DI BROWSER</span>
            </div>
          </div>

          <!-- Card 3: Resend Email Client (Span 5) -->
          <div class="md:col-span-5 rounded-3xl border border-[#1F3A5F]/10 bg-white shadow-lg p-8 flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
            <div class="space-y-4">
              <div class="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Mail class="w-6 h-6" />
              </div>
              <h3 class="text-xl sm:text-2xl font-bold text-[#1F3A5F]">Pengiriman Email Instan</h3>
              <p class="text-sm sm:text-base text-[#1F3A5F]/70 leading-relaxed">
                Kirim invoice langsung ke email klien dengan integrasi Resend API. Email yang dikirimkan profesional dengan layout premium dan file PDF invoice terlampir otomatis.
              </p>
            </div>
            <div class="mt-8 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span class="text-xs font-semibold text-slate-500">Resend API client terintegrasi</span>
            </div>
          </div>

          <!-- Card 4: Multi format (Span 7) -->
          <div class="md:col-span-7 rounded-3xl border border-[#1F3A5F]/10 bg-white shadow-lg p-8 flex flex-col justify-between group hover:shadow-xl transition-all duration-300">
            <div class="space-y-4">
              <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <Download class="w-6 h-6" />
              </div>
              <h3 class="text-xl sm:text-2xl font-bold text-[#1F3A5F]">Ekspor ke PDF & DOCX (Word)</h3>
              <p class="text-sm sm:text-base text-[#1F3A5F]/70 leading-relaxed">
                Butuh arsip cetak atau ingin melakukan perubahan dokumen secara manual? Dapatkan berkas PDF berkualitas tinggi atau dokumen Word (DOCX) yang sepenuhnya terformat dengan rapi untuk diedit lebih lanjut di Word.
              </p>
            </div>
            <div class="mt-8 flex gap-4">
              <div class="flex items-center gap-2 py-2 px-4 rounded-xl bg-red-50 text-red-600 text-xs font-bold">
                <FileText class="w-4 h-4" />
                <span>Format PDF Resmi</span>
              </div>
              <div class="flex items-center gap-2 py-2 px-4 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold">
                <FileSpreadsheet class="w-4 h-4" />
                <span>Format DOCX Editable</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>

    <!-- LIVE DEMO SECTION -->
    <section id="demo" class="py-20 md:py-32 bg-[#1F3A5F]/5 border-y border-[#1F3A5F]/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header -->
        <div class="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1F3A5F] tracking-tight">
            Coba Interaktif: Tulis & Lihat Perubahannya!
          </h2>
          <p class="text-base sm:text-lg text-[#1F3A5F]/70 leading-relaxed">
            Ketik data perusahaan Anda di kolom bawah ini dan saksikan perubahan layout serta kustomisasi warna secara *real-time* di sisi kanan.
          </p>
        </div>

        <!-- Demo Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          <!-- Controls Panel -->
          <div class="lg:col-span-5 rounded-3xl border border-[#1F3A5F]/10 bg-white p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div class="space-y-5">
              
              <!-- Input 1 -->
              <div class="space-y-2">
                <label class="text-xs font-bold uppercase tracking-wider text-[#1F3A5F]/70">Nama Perusahaan Anda</label>
                <input v-model="companyName" type="text" class="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1F3A5F] text-sm text-[#1F3A5F] font-semibold transition-all" />
              </div>

              <!-- Input 2 -->
              <div class="space-y-2">
                <label class="text-xs font-bold uppercase tracking-wider text-[#1F3A5F]/70">Nama Klien</label>
                <input v-model="clientName" type="text" class="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1F3A5F] text-sm text-[#1F3A5F] font-semibold transition-all" />
              </div>

              <!-- Input 3 -->
              <div class="space-y-2">
                <label class="text-xs font-bold uppercase tracking-wider text-[#1F3A5F]/70">Total Tagihan (Rp)</label>
                <input v-model="invoiceTotal" type="number" class="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1F3A5F] text-sm text-[#1F3A5F] font-semibold transition-all" />
              </div>

              <!-- Theme Color Selector -->
              <div class="space-y-3">
                <label class="text-xs font-bold uppercase tracking-wider text-[#1F3A5F]/70">Tema Warna Invoice</label>
                <div class="flex gap-2.5">
                  <span v-for="c in colorPresets" :key="c" @click="selectedColor = c" :style="{ backgroundColor: c }" class="w-7 h-7 rounded-full border-2 cursor-pointer transition-transform duration-200 hover:scale-110" :class="selectedColor === c ? 'border-slate-800 scale-110 shadow-sm' : 'border-transparent'"></span>
                </div>
              </div>

            </div>

            <!-- CTA directly into App -->
            <div class="pt-6 border-t border-slate-100">
              <a :href="appUrl" class="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-[#1F3A5F] hover:bg-[#1F3A5F]/95 hover:shadow-lg transition-all duration-300">
                Gunakan Editor Lengkap
                <ArrowRight class="w-4 h-4 ml-2" />
              </a>
            </div>
          </div>

          <!-- Preview Invoice Sheet -->
          <div class="lg:col-span-7 relative flex justify-center">
            
            <!-- Real-time Interactive Mini-Invoice Paper mockup -->
            <div class="w-full max-w-[500px] rounded-3xl border border-[#1F3A5F]/10 bg-white shadow-xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-2xl">
              
              <!-- Color Header Accent Strip -->
              <div class="h-3 transition-colors duration-500" :style="{ backgroundColor: selectedColor }"></div>
              
              <!-- Paper Body -->
              <div class="p-6 sm:p-8 space-y-6 flex-1 text-xs">
                
                <!-- Invoice Header -->
                <div class="flex justify-between items-start">
                  <div>
                    <h4 class="text-base font-black tracking-tight text-[#1F3A5F] font-display transition-all duration-300">{{ companyName || 'PT Nama Perusahaan' }}</h4>
                    <p class="text-slate-500 text-[10px] mt-1">Jakarta, Indonesia</p>
                  </div>
                  <div class="text-right">
                    <span class="text-lg font-black tracking-tight font-display transition-colors duration-500" :style="{ color: selectedColor }">INVOICE</span>
                    <p class="text-slate-500 text-[10px] mt-1">{{ invoiceNumber }}</p>
                  </div>
                </div>

                <!-- Info Grid -->
                <div class="grid grid-cols-2 gap-4 py-4 border-y border-slate-100">
                  <div>
                    <p class="font-bold text-slate-400 uppercase text-[9px] tracking-wider mb-1">Ditujukan Kepada:</p>
                    <p class="font-bold text-[#1F3A5F] text-[11px] transition-all duration-300">{{ clientName || 'Nama Klien Anda' }}</p>
                  </div>
                  <div>
                    <p class="font-bold text-slate-400 uppercase text-[9px] tracking-wider mb-1">Tanggal Jatuh Tempo:</p>
                    <p class="font-bold text-[#1F3A5F] text-[11px]">02/08/2026</p>
                  </div>
                </div>

                <!-- Items Table (Mocked) -->
                <div class="space-y-2">
                  <div class="flex justify-between font-bold text-slate-400 uppercase text-[9px] tracking-wider pb-1 border-b border-slate-100">
                    <span>Deskripsi Layanan</span>
                    <span>Total</span>
                  </div>
                  <div class="flex justify-between items-center text-[10.5px]">
                    <div>
                      <p class="font-bold text-[#1F3A5F]">Pengembangan Website & Branding</p>
                      <p class="text-slate-400 text-[9px]">Layanan profesional bulan Juli</p>
                    </div>
                    <span class="font-bold text-[#1F3A5F]">{{ formatCurrency(invoiceTotal) }}</span>
                  </div>
                </div>

                <!-- Calculations -->
                <div class="border-t border-slate-100 pt-3 flex flex-col items-end space-y-1.5 text-[11px]">
                  <div class="flex justify-between w-full max-w-[200px] text-slate-500">
                    <span>Subtotal:</span>
                    <span>{{ formatCurrency(invoiceTotal) }}</span>
                  </div>
                  <div class="flex justify-between w-full max-w-[200px] font-black text-sm text-[#1F3A5F]">
                    <span>Total Tagihan:</span>
                    <span class="transition-colors duration-500" :style="{ color: selectedColor }">{{ formatCurrency(invoiceTotal) }}</span>
                  </div>
                </div>

              </div>

              <!-- Paper Footer -->
              <div class="px-6 py-4.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Terima kasih atas kerja samanya.</span>
                <span class="font-bold text-[#1F3A5F]">KADUIN Invoice</span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>

    <!-- PRICING SECTION -->
    <section id="pricing" class="py-20 md:py-32">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header -->
        <div class="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1F3A5F] tracking-tight">
            Pilih Paket Sesuai Kebutuhan Bisnis Anda
          </h2>
          <p class="text-base sm:text-lg text-[#1F3A5F]/70 leading-relaxed">
            Mulai buat invoice secara instan tanpa biaya sepeser pun, atau nantikan paket kolaborasi premium kami.
          </p>
        </div>

        <!-- Pricing Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          
          <!-- Free Tier -->
          <div class="rounded-3xl border border-[#1F3A5F]/15 bg-white p-8 flex flex-col justify-between shadow-lg relative overflow-hidden">
            <div class="space-y-6">
              <div>
                <h3 class="text-xl font-bold text-[#1F3A5F]">Free Tier (Client-Side)</h3>
                <p class="text-sm text-slate-500 mt-1">Sangat cocok untuk Freelancer & UMKM Mandiri</p>
              </div>
              <div class="flex items-baseline">
                <span class="text-4xl font-extrabold text-[#1F3A5F] font-display">Rp 0</span>
                <span class="text-sm font-semibold text-slate-400 ml-1">/ selamanya</span>
              </div>
              
              <!-- Features -->
              <ul class="space-y-3.5 text-sm text-[#1F3A5F]/85">
                <li class="flex items-center gap-3">
                  <Check class="w-4.5 h-4.5 text-[#10B981] shrink-0" />
                  <span>10x Trial Pembuatan & Unduh Invoice</span>
                </li>
                <li class="flex items-center gap-3">
                  <Check class="w-4.5 h-4.5 text-[#10B981] shrink-0" />
                  <span>Ekspor PDF & Word (DOCX) kualitas tinggi</span>
                </li>
                <li class="flex items-center gap-3">
                  <Check class="w-4.5 h-4.5 text-[#10B981] shrink-0" />
                  <span>Kustomisasi logo & warna branding penuh</span>
                </li>
                <li class="flex items-center gap-3 text-[#1F3A5F]/45 line-through">
                  <X class="w-4.5 h-4.5 text-red-400 shrink-0" />
                  <span>Integrasi Resend API untuk kirim email langsung</span>
                </li>
                <li class="flex items-center gap-3">
                  <Check class="w-4.5 h-4.5 text-[#10B981] shrink-0" />
                  <span>100% Data aman tersimpan lokal di browser</span>
                </li>
              </ul>
            </div>

            <div class="pt-8">
              <a :href="appUrl" class="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-[#1F3A5F] hover:bg-[#1F3A5F]/95 transition-colors duration-200">
                Mulai Gratis Sekarang
              </a>
            </div>
          </div>

          <!-- Pro Tier (Coming soon) -->
          <div class="rounded-3xl border border-violet-500/10 bg-slate-50 p-8 flex flex-col justify-between relative overflow-hidden">
            <div class="absolute -top-3 -right-3 w-28 h-28 rounded-full bg-violet-500/5 blur-xl"></div>
            
            <div class="space-y-6">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-xl font-bold text-[#1F3A5F]">Pro Tier</h3>
                  <p class="text-sm text-slate-500 mt-1">Untuk Agensi & Tim yang sedang bertumbuh</p>
                </div>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-100 text-violet-700">COMING SOON</span>
              </div>
              <div class="flex items-baseline">
                <span class="text-4xl font-extrabold text-[#1F3A5F] font-display">Rp 25.000</span>
                <span class="text-sm font-semibold text-slate-400 ml-1">/ bulan</span>
              </div>
              
              <!-- Features -->
              <ul class="space-y-3.5 text-sm text-[#1F3A5F]/75">
                <li class="flex items-center gap-3">
                  <Check class="w-4.5 h-4.5 text-violet-500 shrink-0" />
                  <span>Unlimited Pembuatan & Unduh Invoice</span>
                </li>
                <li class="flex items-center gap-3">
                  <Check class="w-4.5 h-4.5 text-violet-500 shrink-0" />
                  <span>Kirim email otomatis via Resend API</span>
                </li>
                <li class="flex items-center gap-3">
                  <Check class="w-4.5 h-4.5 text-violet-500 shrink-0" />
                  <span>Sinkronisasi Cloud & Database Aman (Coming Soon)</span>
                </li>
                <li class="flex items-center gap-3">
                  <Check class="w-4.5 h-4.5 text-violet-500 shrink-0" />
                  <span>Multi-User & Kolaborasi Tim (Coming Soon)</span>
                </li>
                <li class="flex items-center gap-3">
                  <Check class="w-4.5 h-4.5 text-violet-500 shrink-0" />
                  <span>Dashboard analisis pendapatan & grafik (Coming Soon)</span>
                </li>
              </ul>
            </div>

            <div class="pt-8">
              <button class="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-bold text-slate-400 bg-slate-200/60 cursor-not-allowed" disabled>
                Hubungi Kami
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- FAQ SECTION -->
    <section id="faq" class="py-20 md:py-32 bg-slate-50/50 border-t border-[#1F3A5F]/10">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header -->
        <div class="text-center mb-16 space-y-4">
          <h2 class="text-3xl sm:text-4xl font-black text-[#1F3A5F] tracking-tight">Tanya Jawab (FAQ)</h2>
          <p class="text-base text-[#1F3A5F]/70 leading-relaxed">
            Menjawab segala pertanyaan Anda terkait keamanan, alur kerja, dan keandalan sistem invoice kami.
          </p>
        </div>

        <!-- Accordions -->
        <div class="space-y-4">
          <div v-for="(item, idx) in faqs" :key="idx" class="rounded-2xl border border-[#1F3A5F]/10 bg-white overflow-hidden shadow-xs">
            <button @click="toggleFaq(idx)" class="w-full py-4.5 px-6 flex items-center justify-between font-bold text-[#1F3A5F] text-left text-sm sm:text-base hover:bg-slate-50/50 transition-colors cursor-pointer">
              <span>{{ item.q }}</span>
              <ChevronRight class="w-5 h-5 text-slate-400 transition-transform duration-300" :class="activeFaq === idx ? 'transform rotate-90' : ''" />
            </button>
            <div v-if="activeFaq === idx" class="px-6 pb-5 pt-1 text-xs sm:text-sm text-[#1F3A5F]/70 leading-relaxed border-t border-slate-50">
              {{ item.a }}
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- CTA BANNER SECTION -->
    <section class="py-20 bg-[#1F3A5F] text-white relative overflow-hidden">
      <!-- Glow blobs inside banner -->
      <div class="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#10B981]/15 blur-3xl"></div>
      <div class="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-blue-500/15 blur-3xl"></div>
      
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-display">Siap Buat Invoice Pertama Anda?</h2>
        <p class="text-base sm:text-lg text-white/80 max-w-xl mx-auto leading-relaxed">
          Mulai dalam hitungan detik. Cepat, aman, tanpa registrasi, dan 100% gratis.
        </p>
        <div class="pt-4">
          <a :href="appUrl" class="inline-flex items-center justify-center px-8 py-4 rounded-2xl text-base font-bold text-[#1F3A5F] bg-white hover:bg-slate-50 hover:scale-[1.02] hover:shadow-2xl transition-all duration-300">
            Mulai Buat Sekarang
            <ArrowRight class="w-5 h-5 ml-2.5 text-[#10B981]" />
          </a>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="py-12 border-t border-[#1F3A5F]/10 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        <!-- Logo -->
        <div class="flex items-center gap-3">
          <img :src="'/images/kaduin.png'" alt="Kaduin Logo" class="w-11 h-11 object-contain rounded-xl shadow-xs" />
          <div class="flex flex-col text-left">
            <span class="text-sm font-extrabold tracking-tight text-[#1F3A5F] font-display">KADUIN INVOICE</span>
            <span class="text-[9px] font-semibold tracking-wider text-slate-400 leading-none">© 2026 KADUIN. All rights reserved.</span>
          </div>
        </div>

        <!-- Links -->
        <div class="flex gap-8 text-xs font-semibold text-[#1F3A5F]/65">
          <button @click="scrollTo('features')" class="hover:text-[#1F3A5F] transition-colors cursor-pointer">Fitur</button>
          <button @click="scrollTo('demo')" class="hover:text-[#1F3A5F] transition-colors cursor-pointer">Demo</button>
          <button @click="scrollTo('pricing')" class="hover:text-[#1F3A5F] transition-colors cursor-pointer">Harga</button>
          <button @click="scrollTo('faq')" class="hover:text-[#1F3A5F] transition-colors cursor-pointer">FAQ</button>
        </div>

      </div>
    </footer>

  </div>
</template>
