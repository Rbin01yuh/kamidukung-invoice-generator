<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  Plus, 
  Trash2, 
  FileDown, 
  FileText, 
  Mail, 
  Palette, 
  Building2, 
  User, 
  ListChecks, 
  MessageSquare, 
  Settings2, 
  ChevronRight,
  Send,
  Settings,
  X,
  Sparkles,
  ArrowLeft
} from '@lucide/vue'

// Import utilities
import {
  generatePdf,
  generateDocx,
  downloadPdf,
  downloadDocx,
  fmt,
  lineTotal,
  subtotal,
  totalDiscount,
  grandTotal,
  terbilang
} from '~/utils/invoice-generators'

import {
  getStoredResendKey,
  setStoredResendKey,
  sendEmailViaResendClient
} from '~/utils/email-config'

// Toast Notification System
const toasts = ref([])
const showToast = (message, type = 'success', duration = 5000, description = '') => {
  const id = Date.now()
  toasts.value.push({ id, message, type, description })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, duration)
}
const toast = {
  success: (msg, opts) => showToast(msg, 'success', opts?.duration, opts?.description),
  error: (msg, opts) => showToast(msg, 'error', opts?.duration, opts?.description),
  info: (msg, opts) => showToast(msg, 'info', opts?.duration, opts?.description)
}

// Preset Colors
const PRESET_COLORS = [
  "#1F3A5F", "#0F766E", "#7C3AED", "#DB2777", "#DC2626", "#EA580C",
  "#CA8A04", "#16A34A", "#0EA5E9", "#1E293B", "#000000", "#9333EA",
]

const todayIso = () => new Date().toISOString().slice(0, 10)
const plusDaysIso = (n) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}
const idDate = (iso) => {
  if (!iso) return ""
  const [y, m, d] = iso.split("-")
  return `${d}/${m}/${y}`
}

const emptyItem = () => ({
  product: "",
  description: "",
  qty: 1,
  price: 0,
  discount: 0,
  tax: 0,
})

// File Conversion Helpers
const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const blobToBase64 = (blob) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result
      resolve(result.split(",")[1])
    }
    reader.readAsDataURL(blob)
  })
}

const buildEmailHtml = (
  clientName,
  reference,
  date,
  dueDate,
  total,
  terbilangText,
  message,
  signerName,
  signerTitle,
  companyName,
  accentColor
) => {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;line-height:1.6">
  <h2 style="color:${accentColor};margin-bottom:4px">Invoice ${reference}</h2>
  <p>Halo <strong>${clientName}</strong>,</p>
  <p>Terlampir invoice dengan nomor referensi <strong>${reference}</strong> tertanggal ${date} dengan jatuh tempo ${dueDate}.</p>
  <table style="width:100%;border-collapse:collapse;margin:20px 0">
    <tr><td style="padding:10px 14px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600">Total Tagihan</td>
        <td style="padding:10px 14px;border:1px solid #e5e7eb;font-weight:700;color:${accentColor};font-size:18px">Rp ${total}</td></tr>
    <tr><td style="padding:10px 14px;border:1px solid #e5e7eb;background:#f9fafb">Terbilang</td>
        <td style="padding:10px 14px;border:1px solid #e5e7eb;font-style:italic">${terbilangText}</td></tr>
  </table>
  <div style="background:#f9fafb;border-left:4px solid ${accentColor};padding:14px 18px;margin:16px 0;border-radius:0 8px 8px 0">
    <p style="margin:0;white-space:pre-wrap">${message}</p>
  </div>
  <p>Mohon konfirmasi setelah pembayaran dilakukan. Terima kasih atas kerjasamanya.</p>
  <p style="margin-top:24px">Hormat kami,<br><strong>${signerName}</strong><br>${signerTitle}<br>${companyName}</p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin-top:32px">
  <p style="color:#9ca3af;font-size:12px">Invoice ini dikirim otomatis melalui Invoice Generator &mdash; KAMIDUKUNG</p>
</body></html>`
}

// Message Templates for Invoice Notes
const MESSAGE_TEMPLATES = [
  {
    name: "Transfer Bank BCA (Default)",
    text: "Pembayaran dapat dilakukan melalui transfer ke rekening berikut:\n\nBank BCA\nNo. Rekening: 8001077961\na.n. KAMIDUKUNG\n\nMohon mengirimkan bukti transfer setelah pembayaran dilakukan. Terima kasih."
  },
  {
    name: "DP & Termin Pelunasan (50/50)",
    text: "Invoice ini merupakan tagihan pembayaran termin awal (DP 50%).\n\nSisa pembayaran 50% berikutnya akan ditagihkan setelah proyek diserahterimakan.\n\nDetail Rekening:\nBank BCA\nNo. Rekening: 8001077961\na.n. KAMIDUKUNG"
  },
  {
    name: "Tenggat Waktu Ketat (Strict Terms)",
    text: "PENTING: Pembayaran wajib diselesaikan paling lambat pada tanggal jatuh tempo.\n\nKeterlambatan pembayaran setelah tanggal jatuh tempo akan dikenakan denda administratif sebesar 2% per minggu dari total tagihan."
  },
  {
    name: "Terima Kasih Sederhana",
    text: "Terima kasih atas kerja sama Anda.\n\nKami sangat menghargai kepercayaan Anda terhadap layanan kami dan berharap dapat terus berkolaborasi di masa mendatang."
  }
]

// Invoice Auto-fill Presets
const INVOICE_PRESETS = {
  company: [
    { label: "KAMIDUKUNG", name: "KAMIDUKUNG", address: "Jl. Letnan Jenderal S. Parman No. 28, Jakarta Barat", phone: "+62 812 3456 7890", email: "finance@kamidukung.com" },
    { label: "Kreatif Studio", name: "Kreatif Studio Indonesia", address: "Jl. Kemang Raya No. 45, Mampang Prapatan, Jakarta Selatan", phone: "+62 811 9988 7766", email: "hello@kreatifstudio.id" },
    { label: "Maju Jaya Solusindo", name: "PT Maju Jaya Solusindo", address: "Ruko Golden Boulevard Blk. E No. 12, Serpong, Tangerang Selatan", phone: "+62 21 5432 1098", email: "billing@majujayasolusindo.co.id" }
  ],
  client: [
    { label: "PT Digital Nusantara", name: "PT Digital Nusantara", address: "Sudirman Central Business District (SCBD) Lot 10, Jakarta Selatan", phone: "+62 821 9876 5432", email: "billing@digitalnusantara.com" },
    { label: "PT Sukses Makmur", name: "PT Sukses Makmur Sentosa", address: "Gedung Cyber Lt. 5, Jl. Kuningan Barat No. 8, Jakarta Selatan", phone: "+62 813 1111 2222", email: "finance@suksesmakmursentosa.com" },
    { label: "Yayasan Harapan", name: "Yayasan Harapan Bangsa", address: "Jl. Pendidikan No. 3, Medan Baru, Kota Medan", phone: "+62 61 7654 321", email: "info@harapanbangsa.or.id" }
  ],
  products: [
    { 
      label: "Web Dev & API", 
      product: "Jasa Pengembangan Website & Integrasi API", 
      description: "Pengembangan website perusahaan (landing page + CMS) dan integrasi sistem pembayaran",
      price: 15000000 
    },
    { 
      label: "SEO & Speed", 
      product: "Jasa Optimasi SEO & Performa Halaman", 
      description: "Analisis kata kunci, optimasi kecepatan halaman (LCP/INP), perbaikan meta tag, dan optimasi aset gambar",
      price: 7500000 
    },
    { 
      label: "Server Maintenance", 
      product: "Jasa Pemeliharaan Server & Web Maintenance", 
      description: "Backup database berkala, monitoring uptime server 24/7, security updates, dan perbaikan bug minor",
      price: 3000000 
    },
    { 
      label: "Desain UI/UX Figma", 
      product: "Jasa Desain UI/UX & Pembuatan Wireframe", 
      description: "Pembuatan konsep wireframe, desain antarmuka high-fidelity di Figma, dan riset alur pengguna (user flow)",
      price: 10000000 
    }
  ]
}

// App States
const activeTab = ref('branding')
const accentColor = ref('#1F3A5F')
const logo = ref(undefined)
const signature = ref(undefined)
const logoSize = ref(60)
const signatureSize = ref(120)

const reference = ref('INV/2026/001')
const date = ref(todayIso())
const dueDate = ref(plusDaysIso(30))

const companyName = ref('KAMIDUKUNG')
const companyAddress = ref('Jl. Letnan Jenderal S. Parman No. 28, Jakarta Barat')
const companyPhone = ref('+62 812 3456 7890')
const companyEmail = ref('finance@kamidukung.com')

const clientName = ref('PT Digital Nusantara')
const clientAddress = ref('Sudirman Central Business District (SCBD) Lot 10, Jakarta Selatan')
const clientPhone = ref('+62 821 9876 5432')
const clientEmail = ref('billing@digitalnusantara.com')

const items = ref([
  {
    product: "Jasa Pengembangan Website & Integrasi API",
    description: "Pengembangan website perusahaan (landing page + CMS) dan integrasi sistem pembayaran",
    qty: 1,
    price: 15000000,
    discount: 5,
    tax: 11,
  }
])

const message = ref(MESSAGE_TEMPLATES[0].text)
const signerName = ref('Kirana Putri')
const signerTitle = ref('Finance & Billing Lead')

const busy = ref(null)
const showSettings = ref(false)
const resendKeyInput = ref('')
const savedKeyNotice = ref('')

onMounted(() => {
  resendKeyInput.value = getStoredResendKey()
})

const invoiceData = computed(() => ({
  reference: reference.value,
  date: idDate(date.value),
  dueDate: idDate(dueDate.value),
  companyName: companyName.value,
  companyAddress: companyAddress.value,
  companyPhone: companyPhone.value,
  companyEmail: companyEmail.value,
  clientName: clientName.value,
  clientAddress: clientAddress.value,
  clientPhone: clientPhone.value,
  clientEmail: clientEmail.value,
  items: items.value,
  message: message.value,
  signerName: signerName.value,
  signerTitle: signerTitle.value,
  logoDataUrl: logo.value,
  signatureDataUrl: signature.value,
  accentColor: accentColor.value,
  logoSize: logoSize.value,
  signatureSize: signatureSize.value,
}))

const fileBase = computed(() => {
  return (reference.value || "invoice").replace(/[^a-zA-Z0-9_-]+/g, "-")
})

// File Uploader Event Handlers
const onLogoUpload = async (e) => {
  const file = e.target.files?.[0]
  if (file) {
    logo.value = await fileToDataUrl(file)
  }
}

const onSigUpload = async (e) => {
  const file = e.target.files?.[0]
  if (file) {
    signature.value = await fileToDataUrl(file)
  }
}

// Table Item Handlers
const addItem = () => {
  items.value.push(emptyItem())
}

const removeItem = (index) => {
  items.value.splice(index, 1)
  if (items.value.length === 0) {
    addItem()
  }
}

// Download PDF
const onDownloadPdf = async () => {
  busy.value = "pdf"
  try {
    const blob = await generatePdf(invoiceData.value)
    downloadPdf(blob, `${fileBase.value}.pdf`)
    toast.success("PDF berhasil diunduh")
  } catch (e) {
    console.error(e)
    toast.error("Gagal membuat PDF")
  } finally {
    busy.value = null
  }
}

// Download Word
const onDownloadDocx = async () => {
  busy.value = "docx"
  try {
    const blob = await generateDocx(invoiceData.value)
    downloadDocx(blob, `${fileBase.value}.docx`)
    toast.success("DOCX berhasil diunduh")
  } catch (e) {
    console.error(e)
    toast.error("Gagal membuat DOCX")
  } finally {
    busy.value = null
  }
}

// Save Resend API Settings
const onSaveSettings = () => {
  setStoredResendKey(resendKeyInput.value)
  savedKeyNotice.value = resendKeyInput.value.trim() ? "✓ API Key tersimpan!" : "API Key dihapus."
  setTimeout(() => {
    savedKeyNotice.value = ""
  }, 3000)
}

// Send Email via Resend
const onSendEmail = async () => {
  if (!clientEmail.value) {
    toast.error("Email klien wajib diisi")
    return
  }
  busy.value = "email"
  try {
    const [pdfBlob, docxBlob] = await Promise.all([
      generatePdf(invoiceData.value),
      generateDocx(invoiceData.value),
    ])

    const subject = `Invoice ${reference.value} - ${companyName.value}`
    const bodyText =
      `Halo ${clientName.value},\n\n` +
      `Terlampir invoice dengan nomor referensi ${reference.value} tertanggal ${idDate(date.value)} ` +
      `dengan jatuh tempo ${idDate(dueDate.value)}.\n\n` +
      `Total tagihan: Rp ${fmt(grandTotal(items.value))}\n` +
      `Terbilang: ${terbilang(grandTotal(items.value))}\n\n` +
      `${message.value}\n\n` +
      `Mohon konfirmasi setelah pembayaran dilakukan. Terima kasih atas kerjasamanya.\n\n` +
      `Hormat kami,\n${signerName.value}\n${signerTitle.value}\n${companyName.value}`

    const bodyHtml = buildEmailHtml(
      clientName.value, reference.value, idDate(date.value), idDate(dueDate.value),
      fmt(grandTotal(items.value)), terbilang(grandTotal(items.value)),
      message.value, signerName.value, signerTitle.value, companyName.value, accentColor.value,
    )

    // Mobile: Try native web share first
    const pdfFile = new File([pdfBlob], `${fileBase.value}.pdf`, { type: "application/pdf" })
    const docxFile = new File([docxBlob], `${fileBase.value}.docx`, {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    })
    
    if (navigator.canShare && navigator.share && navigator.canShare({ files: [pdfFile, docxFile] })) {
      try {
        await navigator.share({ files: [pdfFile, docxFile], title: subject, text: bodyText })
        toast.success("Invoice terkirim!", {
          description: "File PDF & DOCX otomatis terlampir di email.",
        })
        return
      } catch {
        // Fall through
      }
    }

    const [pdfBase64, docxBase64] = await Promise.all([
      blobToBase64(pdfBlob),
      blobToBase64(docxBlob),
    ])

    const emailParams = {
      to: clientEmail.value,
      subject,
      bodyText,
      bodyHtml,
      fromName: companyName.value,
      fromEmail: companyEmail.value,
      pdfBase64,
      docxBase64,
      pdfFilename: `${fileBase.value}.pdf`,
      docxFilename: `${fileBase.value}.docx`,
    }

    // Step 1: Send via Nuxt server API
    let result
    try {
      const response = await fetch('/api/send-invoice-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailParams)
      })
      result = await response.json()
    } catch {
      result = { success: false, error: "Server API endpoint error" }
    }

    // Step 2: Fallback to client-side Resend SDK if server config is missing
    if (!result.success) {
      const storedKey = getStoredResendKey()
      if (storedKey) {
        result = await sendEmailViaResendClient({ apiKey: storedKey, ...emailParams })
      }
    }

    if (result.success) {
      toast.success("Email berhasil dikirim!", {
        description: `Invoice ${reference.value} + PDF & DOCX terkirim ke ${clientEmail.value}`
      })
    } else {
      // Step 3: Secondary Fallback - download files & open Gmail compose
      downloadPdf(pdfBlob, `${fileBase.value}.pdf`)
      downloadDocx(docxBlob, `${fileBase.value}.docx`)

      const gmailUrl =
        `https://mail.google.com/mail/?view=cm&fs=1` +
        `&to=${encodeURIComponent(clientEmail.value)}` +
        `&su=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(bodyText)}`
      window.open(gmailUrl, "_blank", "noopener,noreferrer")

      const noKey = !getStoredResendKey()
      toast.info(
        noKey ? "Gmail dibuka — file sudah diunduh" : "Gmail dibuka sebagai cadangan",
        {
          description: noKey
            ? "Untuk pengiriman otomatis, silakan masukkan Resend API Key di Settings ⚙. Lampirkan PDF/Word secara manual di Gmail."
            : `Resend error: ${result.error}. File PDF & DOCX berhasil diunduh, lampirkan manual di Gmail.`,
          duration: 10000
        }
      )
    }
  } catch (e) {
    console.error(e)
    toast.error("Gagal mengirim email — coba lagi")
  } finally {
    busy.value = null
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col relative">
    
    <!-- Custom Toast Notifications Overlay -->
    <div class="fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2.5 w-full max-w-sm px-4">
      <TransitionGroup
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform translate-y-[-20px] opacity-0 scale-95"
        enter-to-class="transform translate-y-0 opacity-100 scale-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="transform translate-y-0 opacity-100 scale-100"
        leave-to-class="transform translate-y-[-20px] opacity-0 scale-95"
      >
        <div 
          v-for="t in toasts" 
          :key="t.id"
          class="p-4 rounded-2xl shadow-xl flex items-start gap-3 border text-left"
          :class="{
            'bg-white border-emerald-100 text-emerald-900': t.type === 'success',
            'bg-white border-red-100 text-red-900': t.type === 'error',
            'bg-white border-sky-100 text-sky-900': t.type === 'info'
          }"
        >
          <div class="flex-1 text-xs">
            <p class="font-extrabold">{{ t.message }}</p>
            <p v-if="t.description" class="text-slate-500 mt-1 leading-normal">{{ t.description }}</p>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- Header -->
    <header class="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur-md">
      <div class="mx-auto max-w-7xl px-4 py-4 flex flex-wrap items-center justify-between gap-3">
        
        <!-- Logo & Title -->
        <div class="flex items-center gap-3">
          <NuxtLink to="/" class="group flex items-center justify-center w-10.5 h-10.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
            <ArrowLeft class="w-5 h-5 text-slate-600" />
          </NuxtLink>
          <div class="flex items-center gap-3">
            <svg width="34" height="34" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="4" width="42" height="56" rx="4" :fill="accentColor" :stroke="accentColor" stroke-width="0.5" />
              <path d="M50 4V14C50 14 42 14 42 14C38 14 38 10 38 10L38 4H50Z" :fill="accentColor === '#1F3A5F' ? '#3B6FA0' : accentColor" />
              <path d="M50 4L42 4V14L50 4Z" fill="white" fill-opacity="0.3" />
              <path d="M38 4V10C38 12.2091 39.7909 14 42 14H50" :stroke="accentColor" stroke-width="0.5" fill="none" />
              <rect x="16" y="22" width="18" height="2.5" rx="1.25" fill="white" fill-opacity="0.9" />
              <rect x="16" y="28" width="24" height="2.5" rx="1.25" fill="white" fill-opacity="0.7" />
              <rect x="16" y="34" width="20" height="2.5" rx="1.25" fill="white" fill-opacity="0.5" />
              <circle cx="52" cy="52" r="10" :fill="accentColor === '#1F3A5F' ? '#3B6FA0' : accentColor" />
              <text x="52" y="56" text-anchor="middle" fill="white" font-size="11" font-weight="bold" font-family="system-ui">Rp</text>
            </svg>
            <div class="text-left">
              <h1 class="text-lg font-black tracking-tight leading-none" :style="{ color: accentColor }">
                Invoice Generator
              </h1>
              <p class="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">Professional PDF · DOCX · Email</p>
            </div>
          </div>
        </div>

        <!-- Toolbar Buttons -->
        <div class="flex flex-wrap items-center gap-2">
          <button @click="onDownloadPdf" :disabled="busy !== null" :style="{ backgroundColor: accentColor }" class="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50">
            <FileDown class="w-4 h-4 mr-1.5" />
            {{ busy === "pdf" ? "Membuat..." : "Unduh PDF" }}
          </button>
          <button @click="onDownloadDocx" :disabled="busy !== null" class="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer disabled:opacity-50 transition-colors">
            <FileText class="w-4 h-4 mr-1.5" />
            {{ busy === "docx" ? "Membuat..." : "Unduh Word" }}
          </button>
          <button @click="onSendEmail" :disabled="busy !== null" class="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer disabled:opacity-50 transition-colors">
            <Send class="w-4 h-4 mr-1.5 text-emerald-600" />
            {{ busy === "email" ? "Mengirim..." : "Kirim Email" }}
          </button>
          <button @click="showSettings = true" class="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer" title="Email Settings">
            <Settings class="w-4.5 h-4.5" />
          </button>
        </div>

      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 mx-auto max-w-7xl w-full px-4 py-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      
      <!-- FORM TAB PANEL (Left Column) -->
      <section class="flex flex-col space-y-4">
        
        <!-- Tab Headers -->
        <div class="flex p-1 rounded-2xl bg-slate-200/60 border border-slate-100">
          <button @click="activeTab = 'branding'" :class="activeTab === 'branding' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'" class="flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-bold rounded-xl gap-1 transition-all cursor-pointer">
            <Palette class="w-4.5 h-4.5" />
            <span>Brand</span>
          </button>
          <button @click="activeTab = 'company'" :class="activeTab === 'company' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'" class="flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-bold rounded-xl gap-1 transition-all cursor-pointer">
            <Building2 class="w-4.5 h-4.5" />
            <span>Perusahaan</span>
          </button>
          <button @click="activeTab = 'client'" :class="activeTab === 'client' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'" class="flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-bold rounded-xl gap-1 transition-all cursor-pointer">
            <User class="w-4.5 h-4.5" />
            <span>Klien</span>
          </button>
          <button @click="activeTab = 'items'" :class="activeTab === 'items' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'" class="flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-bold rounded-xl gap-1 transition-all cursor-pointer">
            <ListChecks class="w-4.5 h-4.5" />
            <span>Item</span>
          </button>
          <button @click="activeTab = 'message'" :class="activeTab === 'message' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'" class="flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-bold rounded-xl gap-1 transition-all cursor-pointer">
            <MessageSquare class="w-4.5 h-4.5" />
            <span>Pesan</span>
          </button>
        </div>

        <!-- Branding Tab Content -->
        <div v-if="activeTab === 'branding'" class="space-y-4">
          
          <!-- Color Picker -->
          <div class="rounded-3xl border border-slate-100 bg-white p-5 space-y-4">
            <h2 class="text-sm font-bold flex items-center gap-2 font-display" :style="{ color: accentColor }">
              <Palette class="w-4 h-4" /> Warna Aksen
            </h2>
            <div>
              <div class="flex flex-wrap gap-2 mb-3.5">
                <button
                  v-for="c in PRESET_COLORS"
                  :key="c"
                  @click="accentColor = c"
                  class="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 shadow-xs cursor-pointer"
                  :style="{
                    backgroundColor: c,
                    borderColor: accentColor === c ? '#0f172a' : 'rgba(0,0,0,0.1)'
                  }"
                ></button>
              </div>
              <div class="flex gap-3 items-center">
                <input
                  type="color"
                  v-model="accentColor"
                  class="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 bg-white overflow-hidden p-0"
                />
                <input v-model="accentColor" type="text" class="w-28 h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-800" />
                <span class="text-xs text-slate-400">Atau masukkan kode HEX kustom</span>
              </div>
            </div>
          </div>

          <!-- Logo & Signature Upload -->
          <div class="rounded-3xl border border-slate-100 bg-white p-5 space-y-4">
            <h2 class="text-sm font-bold flex items-center gap-2 font-display" :style="{ color: accentColor }">
              <Settings2 class="w-4 h-4" /> Logo & Tanda Tangan
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <!-- Company Logo -->
              <div class="space-y-3 p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                <span class="text-xs font-bold text-slate-600 block">Logo Perusahaan</span>
                <input type="file" accept="image/*" @change="onLogoUpload" class="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200" />
                <div v-if="logo" class="space-y-3">
                  <div class="flex items-center justify-center h-24 bg-white rounded-xl border border-slate-100">
                    <img :src="logo" alt="Logo Preview" :style="{ height: logoSize + 'px', width: logoSize + 'px', objectFit: 'contain' }" />
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-slate-400 w-12">Ukuran</span>
                    <input type="range" v-model.number="logoSize" min="30" max="140" step="2" class="flex-1 cursor-pointer accent-slate-800" />
                    <span class="text-xs font-bold text-slate-600 w-10 text-right">{{ logoSize }}px</span>
                  </div>
                  <button @click="logo = undefined" class="w-full inline-flex items-center justify-center py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer">
                    <Trash2 class="w-3.5 h-3.5 mr-1" /> Hapus Logo
                  </button>
                </div>
              </div>

              <!-- Signature -->
              <div class="space-y-3 p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                <span class="text-xs font-bold text-slate-600 block">Tanda Tangan</span>
                <input type="file" accept="image/*" @change="onSigUpload" class="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200" />
                <div v-if="signature" class="space-y-3">
                  <div class="flex items-center justify-center h-24 bg-white rounded-xl border border-slate-100">
                    <img :src="signature" alt="Signature Preview" :style="{ width: signatureSize + 'px', height: (signatureSize * 0.5) + 'px', objectFit: 'contain' }" />
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-slate-400 w-12">Ukuran</span>
                    <input type="range" v-model.number="signatureSize" min="60" max="240" step="4" class="flex-1 cursor-pointer accent-slate-800" />
                    <span class="text-xs font-bold text-slate-600 w-10 text-right">{{ signatureSize }}px</span>
                  </div>
                  <button @click="signature = undefined" class="w-full inline-flex items-center justify-center py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer">
                    <Trash2 class="w-3.5 h-3.5 mr-1" /> Hapus Ttd
                  </button>
                </div>
              </div>

            </div>
          </div>

          <!-- Invoice Details -->
          <div class="rounded-3xl border border-slate-100 bg-white p-5 space-y-4">
            <h2 class="text-sm font-bold font-display" :style="{ color: accentColor }">Detail Invoice</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div>
                <label class="text-xs font-bold text-slate-500 mb-1 block">No. Referensi</label>
                <input v-model="reference" type="text" class="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800" />
              </div>
              <div>
                <label class="text-xs font-bold text-slate-500 mb-1 block">Tanggal</label>
                <input v-model="date" type="date" class="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800" />
              </div>
              <div>
                <label class="text-xs font-bold text-slate-500 mb-1 block">Jatuh Tempo</label>
                <input v-model="dueDate" type="date" class="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800" />
              </div>
            </div>
          </div>

        </div>

        <!-- Perusahaan Tab -->
        <div v-if="activeTab === 'company'" class="rounded-3xl border border-slate-100 bg-white p-5 space-y-4">
          <h2 class="text-sm font-bold flex items-center gap-2 font-display" :style="{ color: accentColor }">
            <Building2 class="w-4 h-4" /> Informasi Perusahaan (Pengirim)
          </h2>
          <div class="space-y-3.5">
            <div>
              <label class="text-xs font-bold text-slate-500 mb-1 block">Nama Perusahaan</label>
              <input v-model="companyName" type="text" class="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800" />
              <div class="flex flex-wrap gap-1.5 mt-2">
                <span class="text-[9px] font-black text-slate-400 uppercase self-center mr-1">Preset:</span>
                <button 
                  v-for="c in INVOICE_PRESETS.company" 
                  :key="c.label" 
                  type="button" 
                  @click="companyName = c.name; companyAddress = c.address; companyPhone = c.phone; companyEmail = c.email" 
                  class="text-[10px] font-bold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  {{ c.label }}
                </button>
              </div>
            </div>
            <div>
              <label class="text-xs font-bold text-slate-500 mb-1 block">Alamat Kantor</label>
              <textarea v-model="companyAddress" rows="2" class="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"></textarea>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label class="text-xs font-bold text-slate-500 mb-1 block">Nomor Telepon</label>
                <input v-model="companyPhone" type="text" class="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800" />
              </div>
              <div>
                <label class="text-xs font-bold text-slate-500 mb-1 block">Alamat Email</label>
                <input v-model="companyEmail" type="email" class="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800" />
              </div>
            </div>
          </div>
        </div>

        <!-- Klien Tab -->
        <div v-if="activeTab === 'client'" class="rounded-3xl border border-slate-100 bg-white p-5 space-y-4">
          <h2 class="text-sm font-bold flex items-center gap-2 font-display" :style="{ color: accentColor }">
            <User class="w-4 h-4" /> Informasi Klien (Penerima Tagihan)
          </h2>
          <div class="space-y-3.5">
            <div>
              <label class="text-xs font-bold text-slate-500 mb-1 block">Nama Klien / Instansi</label>
              <input v-model="clientName" type="text" class="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800" />
              <div class="flex flex-wrap gap-1.5 mt-2">
                <span class="text-[9px] font-black text-slate-400 uppercase self-center mr-1">Preset:</span>
                <button 
                  v-for="cl in INVOICE_PRESETS.client" 
                  :key="cl.label" 
                  type="button" 
                  @click="clientName = cl.name; clientAddress = cl.address; clientPhone = cl.phone; clientEmail = cl.email" 
                  class="text-[10px] font-bold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  {{ cl.label }}
                </button>
              </div>
            </div>
            <div>
              <label class="text-xs font-bold text-slate-500 mb-1 block">Alamat Klien</label>
              <textarea v-model="clientAddress" rows="2" class="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"></textarea>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label class="text-xs font-bold text-slate-500 mb-1 block">Nomor Telepon Klien</label>
                <input v-model="clientPhone" type="text" class="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800" />
              </div>
              <div>
                <label class="text-xs font-bold text-slate-500 mb-1 block">Email Klien</label>
                <input v-model="clientEmail" type="email" class="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800" />
              </div>
            </div>
          </div>
        </div>

        <!-- Items Tab -->
        <div v-if="activeTab === 'items'" class="space-y-4">
          <div v-for="(item, idx) in items" :key="idx" class="rounded-3xl border border-slate-100 bg-white p-5 space-y-4 relative group">
            
            <!-- Remove Button -->
            <button @click="removeItem(idx)" class="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer" title="Hapus Item">
              <Trash2 class="w-4 h-4" />
            </button>

            <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest">Item #{{ idx + 1 }}</h3>

            <!-- Item Input Form Fields -->
            <div class="space-y-3">
              <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div class="md:col-span-8">
                  <label class="text-xs font-bold text-slate-500 mb-1 block">Produk / Layanan</label>
                  <input v-model="item.product" type="text" class="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800" placeholder="Contoh: Jasa Pembuatan Website" />
                  <div class="flex flex-wrap gap-1.5 mt-2">
                    <span class="text-[9px] font-black text-slate-400 uppercase self-center mr-1">Preset:</span>
                    <button 
                      v-for="p in INVOICE_PRESETS.products" 
                      :key="p.label" 
                      type="button" 
                      @click="item.product = p.product; item.description = p.description; item.price = p.price" 
                      class="text-[10px] font-bold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      {{ p.label }}
                    </button>
                  </div>
                </div>
                <div class="md:col-span-4">
                  <label class="text-xs font-bold text-slate-500 mb-1 block">Qty</label>
                  <input v-model.number="item.qty" type="number" class="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800" />
                </div>
              </div>

              <div>
                <label class="text-xs font-bold text-slate-500 mb-1 block">Deskripsi Detail</label>
                <input v-model="item.description" type="text" class="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800" placeholder="Deskripsi spesifikasi layanan..." />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label class="text-xs font-bold text-slate-500 mb-1 block">Harga Satuan (Rp)</label>
                  <input v-model.number="item.price" type="number" class="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800" />
                </div>
                <div>
                  <label class="text-xs font-bold text-slate-500 mb-1 block">Diskon (%)</label>
                  <input v-model.number="item.discount" type="number" min="0" max="100" class="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800" />
                </div>
                <div>
                  <label class="text-xs font-bold text-slate-500 mb-1 block">Pajak (%)</label>
                  <input v-model.number="item.tax" type="number" min="0" max="100" class="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800" />
                </div>
              </div>
            </div>

          </div>

          <!-- Add Item Button -->
          <button @click="addItem" :style="{ color: accentColor, borderColor: accentColor + '30' }" class="w-full py-4.5 rounded-3xl border border-dashed flex items-center justify-center gap-2 text-sm font-bold bg-white cursor-pointer hover:bg-slate-50/50 transition-colors">
            <Plus class="w-4.5 h-4.5" />
            Tambah Baris Item
          </button>
        </div>

        <!-- Pesan / Tanda Tangan Tab -->
        <div v-if="activeTab === 'message'" class="space-y-4">
          
          <!-- Message Input -->
          <div class="rounded-3xl border border-slate-100 bg-white p-5 space-y-4">
            <h2 class="text-sm font-bold flex items-center gap-2 font-display" :style="{ color: accentColor }">
              <MessageSquare class="w-4 h-4" /> Catatan / Pesan Pembayaran
            </h2>
            <div class="space-y-3.5">
              <div>
                <label class="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1.5">Pilih Template Catatan</label>
                <select @change="message = $event.target.value" class="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 cursor-pointer">
                  <option v-for="t in MESSAGE_TEMPLATES" :key="t.name" :value="t.text">{{ t.name }}</option>
                </select>
              </div>
              <div>
                <label class="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1.5">Detail Catatan / Instruksi</label>
                <textarea v-model="message" rows="5" class="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 text-slate-600 font-medium" placeholder="Tulis instruksi rekening bank pembayaran atau ucapan terima kasih..."></textarea>
              </div>
            </div>
          </div>

          <!-- Signer Details -->
          <div class="rounded-3xl border border-slate-100 bg-white p-5 space-y-4">
            <h2 class="text-sm font-bold font-display" :style="{ color: accentColor }">Informasi Penandatangan</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label class="text-xs font-bold text-slate-500 mb-1 block">Nama Lengkap</label>
                <input v-model="signerName" type="text" class="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800" />
              </div>
              <div>
                <label class="text-xs font-bold text-slate-500 mb-1 block">Jabatan / Divisi</label>
                <input v-model="signerTitle" type="text" class="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800" />
              </div>
            </div>
          </div>

        </div>

      </section>

      <!-- PREVIEW SHEET (Right Column) -->
      <section class="relative flex justify-center items-start lg:sticky lg:top-24">
        
        <div class="w-full max-w-[660px] rounded-3xl border border-slate-100 bg-white shadow-lg flex flex-col justify-between min-h-[930px] transition-all duration-300 hover:shadow-xl text-left">
          
          <!-- Top Accent Strip -->
          <div class="h-3 rounded-t-3xl transition-colors duration-500" :style="{ backgroundColor: accentColor }"></div>
          
          <!-- Invoice Sheet Content -->
          <div class="p-8 sm:p-10 space-y-8 flex-1 text-xs">
            
            <!-- Logo & Title -->
            <div class="flex justify-between items-start">
              <div>
                <div v-if="logo" class="mb-4">
                  <img :src="logo" alt="Company Logo" :style="{ height: logoSize + 'px', width: logoSize + 'px', objectFit: 'contain' }" />
                </div>
                <h4 class="text-base font-extrabold text-slate-800 font-display transition-all leading-tight">{{ companyName || 'PT Nama Perusahaan' }}</h4>
                <p class="text-slate-500 text-[10px] mt-1.5 whitespace-pre-line leading-relaxed">{{ companyAddress }}</p>
                <p v-if="companyPhone" class="text-slate-500 text-[10px] mt-0.5">Telp: {{ companyPhone }}</p>
                <p v-if="companyEmail" class="text-slate-500 text-[10px] mt-0.5">Email: {{ companyEmail }}</p>
              </div>
              
              <div class="text-right">
                <span class="text-2xl font-black font-display tracking-tight transition-colors duration-500" :style="{ color: accentColor }">INVOICE</span>
                
                <!-- Meta Grid -->
                <div class="mt-6 space-y-1.5 text-right flex flex-col items-end">
                  <div class="flex justify-between w-40 text-slate-400"><span class="text-[9px]">Referensi:</span><span class="font-bold text-slate-800">{{ reference }}</span></div>
                  <div class="flex justify-between w-40 text-slate-400"><span class="text-[9px]">Tanggal:</span><span class="font-bold text-slate-800">{{ idDate(date) }}</span></div>
                  <div class="flex justify-between w-40 text-slate-400"><span class="text-[9px]">Jatuh Tempo:</span><span class="font-bold text-slate-800">{{ idDate(dueDate) }}</span></div>
                </div>
              </div>
            </div>

            <!-- Client Info Billing Block -->
            <div class="grid grid-cols-2 gap-8 py-5 border-y border-slate-100">
              <div>
                <span class="font-bold text-slate-400 uppercase text-[9px] tracking-wider mb-2.5 block">Informasi Perusahaan</span>
                <p class="font-extrabold text-slate-800 text-[11px]">{{ companyName }}</p>
                <p class="text-slate-500 text-[10px] mt-1 leading-relaxed">{{ companyAddress }}</p>
              </div>
              <div>
                <span class="font-bold text-slate-400 uppercase text-[9px] tracking-wider mb-2.5 block">Tagihan Kepada</span>
                <p class="font-extrabold text-slate-800 text-[11px]">{{ clientName }}</p>
                <p class="text-slate-500 text-[10px] mt-1 leading-relaxed">{{ clientAddress }}</p>
                <p v-if="clientPhone" class="text-slate-500 text-[10px] mt-0.5">Telp: {{ clientPhone }}</p>
                <p v-if="clientEmail" class="text-slate-500 text-[10px] mt-0.5">Email: {{ clientEmail }}</p>
              </div>
            </div>

            <!-- Items Table Preview -->
            <div class="space-y-3">
              
              <!-- Table Headers -->
              <div class="flex justify-between font-bold text-slate-400 uppercase text-[9px] tracking-wider pb-1.5 border-b border-slate-100">
                <span class="w-[22%]">Produk</span>
                <span class="w-[28%]">Deskripsi</span>
                <span class="w-[8%] text-center">Qty</span>
                <span class="w-[12%] text-right">Diskon</span>
                <span class="w-[10%] text-right">Pajak</span>
                <span class="w-[20%] text-right">Jumlah</span>
              </div>
              
              <!-- Table Rows -->
              <div v-for="(it, idx) in items" :key="idx" class="flex justify-between items-start text-[10.5px] py-2 border-b border-slate-50/50">
                <span class="w-[22%] font-bold text-slate-800 break-words pr-2">{{ it.product || 'Nama Produk' }}</span>
                <span class="w-[28%] text-slate-400 break-words pr-2 leading-relaxed">{{ it.description }}</span>
                <span class="w-[8%] text-center text-slate-700 font-medium">{{ it.qty }}</span>
                <span class="w-[12%] text-right text-slate-600">{{ it.discount }}%</span>
                <span class="w-[10%] text-right text-slate-600">{{ it.tax }}%</span>
                <span class="w-[20%] text-right font-bold text-slate-800">Rp {{ fmt(lineTotal(it)) }}</span>
              </div>

            </div>

            <!-- Footer Calculations & Notes -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              <!-- Left side payment notes -->
              <div class="space-y-4">
                <div>
                  <span class="font-bold text-slate-400 uppercase text-[9px] tracking-wider mb-1.5 block">Pesan / Catatan</span>
                  <p class="text-slate-500 text-[10px] leading-relaxed whitespace-pre-wrap">{{ message }}</p>
                </div>
                <div>
                  <span class="font-bold text-slate-400 uppercase text-[9px] tracking-wider mb-1 block">Terbilang</span>
                  <p class="font-bold text-slate-800 text-[10px] italic leading-tight">{{ terbilang(grandTotal(items)) }}</p>
                </div>
              </div>

              <!-- Right side totals sheet -->
              <div class="flex flex-col items-end space-y-2 text-[10.5px] border-t border-slate-50 md:border-t-0 pt-4 md:pt-0">
                <div class="flex justify-between w-full max-w-[220px] text-slate-500">
                  <span>Subtotal:</span>
                  <span class="font-bold text-slate-700">Rp {{ fmt(subtotal(items)) }}</span>
                </div>
                <div class="flex justify-between w-full max-w-[220px] text-slate-500">
                  <span>Total Diskon:</span>
                  <span class="font-bold text-slate-700">(Rp {{ fmt(totalDiscount(items)) }})</span>
                </div>
                <div class="flex justify-between w-full max-w-[220px] font-black text-sm pt-2 border-t border-slate-100">
                  <span class="text-slate-800">Total:</span>
                  <span class="transition-colors duration-500" :style="{ color: accentColor }">Rp {{ fmt(grandTotal(items)) }}</span>
                </div>
              </div>

            </div>

            <!-- Signatures Section -->
            <div class="flex justify-end pt-8">
              <div class="text-center w-48 space-y-1 mt-4">
                <span class="text-slate-400 text-[9px] block">Dengan Hormat,</span>
                
                <!-- Signature Image Container -->
                <div class="h-16 flex items-center justify-center relative">
                  <img v-if="signature" :src="signature" alt="Signature Graphic" :style="{ width: signatureSize + 'px', height: (signatureSize * 0.5) + 'px', objectFit: 'contain' }" />
                  <div v-else class="h-1 bg-slate-100 w-24 mx-auto rounded"></div>
                </div>

                <div class="border-t border-slate-300 w-full pt-1.5">
                  <p class="font-extrabold text-slate-800 text-[10.5px] truncate">{{ signerName }}</p>
                  <p class="text-slate-400 text-[9px] mt-0.5 truncate">{{ signerTitle }}</p>
                </div>
              </div>
            </div>

          </div>

          <!-- Bottom Accent Strip -->
          <div class="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-semibold rounded-b-3xl">
            <span>Terima kasih atas kerja samanya.</span>
            <span class="font-extrabold text-slate-600">KAMIDUKUNG Invoice</span>
          </div>

        </div>

      </section>

    </main>

    <!-- SETTINGS MODAL DIALOG DIALOG (Resend API Config) -->
    <div v-if="showSettings" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      
      <!-- Backdrop overlay -->
      <div @click="showSettings = false" class="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"></div>
      
      <!-- Dialog container -->
      <div class="relative w-full max-w-md rounded-3xl bg-white border border-slate-100 p-6 shadow-2xl space-y-4 text-left animate-in fade-in zoom-in-95 duration-200">
        
        <div class="flex items-center justify-between">
          <h3 class="text-base font-bold text-slate-800 font-display flex items-center gap-2">
            <Settings class="w-4.5 h-4.5 text-slate-500" />
            Pengaturan API Email
          </h3>
          <button @click="showSettings = false" class="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer">
            <X class="w-4.5 h-4.5" />
          </button>
        </div>

        <p class="text-xs text-slate-500 leading-relaxed">
          Fitur pengiriman email instan menggunakan layanan **Resend**. API Key disimpan aman secara lokal di browser Anda.
        </p>

        <div class="space-y-2">
          <label class="text-xs font-bold text-slate-600 block">Resend API Key</label>
          <input 
            v-model="resendKeyInput" 
            type="password" 
            class="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800" 
            placeholder="re_xxxxxxxxxxxxxxxx" 
          />
        </div>

        <div v-if="savedKeyNotice" class="text-xs font-bold text-emerald-600 text-center py-1.5 bg-emerald-50 rounded-xl">
          {{ savedKeyNotice }}
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button @click="showSettings = false" class="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">
            Batal
          </button>
          <button @click="onSaveSettings" :style="{ backgroundColor: accentColor }" class="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer hover:opacity-95 transition-opacity">
            Simpan API Key
          </button>
        </div>

      </div>
    </div>

  </div>
</template>
