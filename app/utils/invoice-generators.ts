import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
  ImageRun,
} from "docx";
import FileSaver from "file-saver";
const { saveAs } = FileSaver;

export interface InvoiceItem {
  product: string;
  description: string;
  qty: number;
  price: number;
  discount: number; // percent
  tax: number; // percent
}

export interface InvoiceData {
  reference: string;
  date: string;
  dueDate: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  clientEmail: string;
  items: InvoiceItem[];
  message: string;
  signerName: string;
  signerTitle: string;
  logoDataUrl?: string;
  signatureDataUrl?: string;
  accentColor: string; // hex
  logoSize?: number; // px in preview, pt in pdf
  signatureSize?: number; // px in preview, pt in pdf
}

export const fmt = (n: number) =>
  n.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const lineTotal = (it: InvoiceItem) => {
  const sub = it.qty * it.price;
  const afterDisc = sub - (sub * it.discount) / 100;
  const withTax = afterDisc + (afterDisc * it.tax) / 100;
  return withTax;
};

export const subtotal = (items: InvoiceItem[]) =>
  items.reduce((s, it) => s + it.qty * it.price, 0);

export const totalDiscount = (items: InvoiceItem[]) =>
  items.reduce((s, it) => s + (it.qty * it.price * it.discount) / 100, 0);

export const grandTotal = (items: InvoiceItem[]) =>
  items.reduce((s, it) => s + lineTotal(it), 0);

// --- Terbilang (Indonesian) ---
const satuan = [
  "",
  "Satu",
  "Dua",
  "Tiga",
  "Empat",
  "Lima",
  "Enam",
  "Tujuh",
  "Delapan",
  "Sembilan",
  "Sepuluh",
  "Sebelas",
];
function terbilangNum(n: number): string {
  n = Math.floor(n);
  if (n < 12) return satuan[n];
  if (n < 20) return terbilangNum(n - 10) + " Belas";
  if (n < 100)
    return terbilangNum(Math.floor(n / 10)) + " Puluh" + (n % 10 ? " " + terbilangNum(n % 10) : "");
  if (n < 200) return "Seratus" + (n - 100 ? " " + terbilangNum(n - 100) : "");
  if (n < 1000)
    return terbilangNum(Math.floor(n / 100)) + " Ratus" + (n % 100 ? " " + terbilangNum(n % 100) : "");
  if (n < 2000) return "Seribu" + (n - 1000 ? " " + terbilangNum(n - 1000) : "");
  if (n < 1_000_000)
    return (
      terbilangNum(Math.floor(n / 1000)) +
      " Ribu" +
      (n % 1000 ? " " + terbilangNum(n % 1000) : "")
    );
  if (n < 1_000_000_000)
    return (
      terbilangNum(Math.floor(n / 1_000_000)) +
      " Juta" +
      (n % 1_000_000 ? " " + terbilangNum(n % 1_000_000) : "")
    );
  return (
    terbilangNum(Math.floor(n / 1_000_000_000)) +
    " Miliar" +
    (n % 1_000_000_000 ? " " + terbilangNum(n % 1_000_000_000) : "")
  );
}
export const terbilang = (n: number) => {
  const t = terbilangNum(n).trim();
  return (t || "Nol") + " Rupiah";
};

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const v =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  return [parseInt(v.substring(0, 2), 16), parseInt(v.substring(2, 4), 16), parseInt(v.substring(4, 6), 16)];
}

// ---------- PDF ----------
export async function generatePdf(data: InvoiceData): Promise<Blob> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;
  const [r, g, b] = hexToRgb(data.accentColor);

  // Logo (no text next to it)
  const logoSize = data.logoSize ?? 60;
  if (data.logoDataUrl) {
    try {
      doc.addImage(data.logoDataUrl, "PNG", margin, 40, logoSize, logoSize);
    } catch {
      /* noop */
    }
  }

  // INVOICE title
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(r, g, b);
  doc.text("INVOICE", pageW - margin, 60, { align: "right" });

  // Reference / dates
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "normal");
  const labelX = pageW - margin - 180;
  const valX = pageW - margin;
  let y = 95;
  const rows: [string, string][] = [
    ["Referensi", data.reference],
    ["Tanggal", data.date],
    ["Tgl. Jatuh Tempo", data.dueDate],
  ];
  rows.forEach(([k, v]) => {
    doc.text(k, labelX, y, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text(v, valX, y, { align: "right" });
    doc.setFont("helvetica", "normal");
    y += 16;
  });

  // Section headers
  const secY = 170;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(r, g, b);
  doc.text("Informasi Perusahaan", margin, secY);
  doc.text("Tagihan Kepada", pageW / 2 + 10, secY);

  doc.setDrawColor(r, g, b);
  doc.setLineWidth(0.8);
  doc.line(margin, secY + 6, pageW / 2 - 20, secY + 6);
  doc.line(pageW / 2 + 10, secY + 6, pageW - margin, secY + 6);

  // Company
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(r, g, b);
  doc.text(data.companyName, margin, secY + 26);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.text(data.companyAddress, margin, secY + 42);
  doc.text(`Telp: ${data.companyPhone}`, margin, secY + 56);
  doc.text(`Email: ${data.companyEmail}`, margin, secY + 70);

  // Client
  doc.setFont("helvetica", "bold");
  doc.setTextColor(r, g, b);
  doc.setFontSize(11);
  doc.text(data.clientName, pageW / 2 + 10, secY + 26);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.text(data.clientAddress, pageW / 2 + 10, secY + 42);
  doc.text(`Telp: ${data.clientPhone}`, pageW / 2 + 10, secY + 56);
  doc.text(`Email: ${data.clientEmail}`, pageW / 2 + 10, secY + 70);

  // Items table
  autoTable(doc, {
    startY: secY + 95,
    head: [["Produk", "Deskripsi", "Kuantitas", "Harga", "Diskon", "Pajak", "Jumlah"]],
    body: data.items.map((it) => [
      it.product,
      it.description,
      String(it.qty),
      fmt(it.price),
      `${it.discount}%`,
      `${it.tax}%`,
      fmt(lineTotal(it)),
    ]),
    styles: { fontSize: 9, cellPadding: 8, textColor: [60, 60, 60] },
    headStyles: {
      fillColor: [r, g, b],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "left",
    },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    columnStyles: {
      2: { halign: "center" },
      3: { halign: "right" },
      4: { halign: "right" },
      5: { halign: "right" },
      6: { halign: "right" },
    },
    margin: { left: margin, right: margin },
  });

  const afterTableY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 25;

  // Pesan
  doc.setFont("helvetica", "bold");
  doc.setTextColor(r, g, b);
  doc.setFontSize(11);
  doc.text("Pesan", margin, afterTableY);
  doc.setDrawColor(r, g, b);
  doc.line(margin, afterTableY + 6, pageW / 2 - 20, afterTableY + 6);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  const msgLines = doc.splitTextToSize(data.message, pageW / 2 - 60);
  doc.text(msgLines, margin, afterTableY + 24);

  doc.text("Terbilang", margin, afterTableY + 24 + msgLines.length * 12 + 16);
  doc.setFont("helvetica", "bold");
  doc.text(terbilang(grandTotal(data.items)), margin, afterTableY + 24 + msgLines.length * 12 + 30);

  // Totals
  const totalsX = pageW / 2 + 10;
  const totalsValX = pageW - margin;
  let ty = afterTableY;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(11);
  doc.text("Subtotal", totalsX, ty);
  doc.setFont("helvetica", "normal");
  doc.text(`Rp ${fmt(subtotal(data.items))}`, totalsValX, ty, { align: "right" });
  ty += 22;
  doc.setFont("helvetica", "bold");
  doc.text("Total Diskon", totalsX, ty);
  doc.setFont("helvetica", "normal");
  doc.text(`(Rp ${fmt(totalDiscount(data.items))})`, totalsValX, ty, { align: "right" });
  ty += 28;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(r, g, b);
  doc.text("Total", totalsX, ty);
  doc.text(`Rp ${fmt(grandTotal(data.items))}`, totalsValX, ty, { align: "right" });

  // Signature
  const sigY = Math.max(ty + 80, afterTableY + 140);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text("Dengan Hormat,", pageW - margin - 100, sigY, { align: "center" });
  const sigW = data.signatureSize ?? 120;
  const sigH = Math.round(sigW * 0.5);
  if (data.signatureDataUrl) {
    try {
      doc.addImage(
        data.signatureDataUrl,
        "PNG",
        pageW - margin - 100 - sigW / 2,
        sigY + 10,
        sigW,
        sigH,
      );
    } catch {
      /* noop */
    }
  }
  doc.setDrawColor(60, 60, 60);
  doc.setLineWidth(0.5);
  doc.line(pageW - margin - 180, sigY + 80, pageW - margin - 20, sigY + 80);
  doc.setFont("helvetica", "bold");
  doc.text(data.signerName, pageW - margin - 100, sigY + 94, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.text(data.signerTitle, pageW - margin - 100, sigY + 108, { align: "center" });

  return doc.output("blob");
}

export function downloadPdf(blob: Blob, filename: string) {
  saveAs(blob, filename);
}

// ---------- DOCX ----------
function colorHexNoHash(hex: string) {
  return hex.replace("#", "").toUpperCase();
}

function dataUrlToUint8(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1] ?? "";
  const bin = atob(base64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

function imgType(dataUrl: string): "png" | "jpg" {
  return dataUrl.startsWith("data:image/jpeg") || dataUrl.startsWith("data:image/jpg") ? "jpg" : "png";
}

export async function generateDocx(data: InvoiceData): Promise<Blob> {
  const accent = colorHexNoHash(data.accentColor);
  const muted = "555555";

  const noBorder = {
    top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  };

  // header table: logo only | INVOICE + meta
  const logoRuns: (TextRun | ImageRun)[] = [];
  const logoSize = data.logoSize ?? 60;
  if (data.logoDataUrl) {
    logoRuns.push(
      new ImageRun({
        type: imgType(data.logoDataUrl),
        data: dataUrlToUint8(data.logoDataUrl),
        transformation: { width: logoSize, height: logoSize },
        altText: { title: "logo", description: "logo", name: "logo" },
      } as never),
    );
  } else {
    logoRuns.push(new TextRun({ text: "" }));
  }

  const headerTable = new Table({
    width: { size: 9000, type: WidthType.DXA },
    columnWidths: [4500, 4500],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: noBorder,
            width: { size: 4500, type: WidthType.DXA },
            children: [new Paragraph({ children: logoRuns })],
          }),
          new TableCell({
            borders: noBorder,
            width: { size: 4500, type: WidthType.DXA },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: "INVOICE", bold: true, color: accent, size: 56 })],
              }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: "Referensi   ", color: muted }),
                  new TextRun({ text: data.reference, bold: true }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: "Tanggal   ", color: muted }),
                  new TextRun({ text: data.date, bold: true }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: "Tgl. Jatuh Tempo   ", color: muted }),
                  new TextRun({ text: data.dueDate, bold: true }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const infoCell = (title: string, name: string, addr: string, phone: string, email: string) =>
    new TableCell({
      borders: noBorder,
      width: { size: 4500, type: WidthType.DXA },
      children: [
        new Paragraph({
          children: [new TextRun({ text: title, bold: true, color: accent, size: 22 })],
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: accent, space: 4 } },
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({ children: [new TextRun({ text: name, bold: true, color: accent, size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: addr, color: muted })] }),
        new Paragraph({ children: [new TextRun({ text: `Telp: ${phone}`, color: muted })] }),
        new Paragraph({ children: [new TextRun({ text: `Email: ${email}`, color: muted })] }),
      ],
    });

  const infoTable = new Table({
    width: { size: 9000, type: WidthType.DXA },
    columnWidths: [4500, 4500],
    rows: [
      new TableRow({
        children: [
          infoCell("Informasi Perusahaan", data.companyName, data.companyAddress, data.companyPhone, data.companyEmail),
          infoCell("Tagihan Kepada", data.clientName, data.clientAddress, data.clientPhone, data.clientEmail),
        ],
      }),
    ],
  });

  const cellBorder = { style: BorderStyle.SINGLE, size: 2, color: "DDDDDD" };
  const cellBorders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };

  const itemHeaderCell = (text: string, w: number, align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT) =>
    new TableCell({
      borders: cellBorders,
      width: { size: w, type: WidthType.DXA },
      shading: { fill: accent, type: ShadingType.CLEAR, color: "auto" },
      margins: { top: 80, bottom: 80, left: 100, right: 100 },
      children: [new Paragraph({ alignment: align, children: [new TextRun({ text, bold: true, color: "FFFFFF" })] })],
    });

  const itemDataCell = (text: string, w: number, align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT) =>
    new TableCell({
      borders: cellBorders,
      width: { size: w, type: WidthType.DXA },
      margins: { top: 80, bottom: 80, left: 100, right: 100 },
      children: [new Paragraph({ alignment: align, children: [new TextRun({ text, color: muted })] })],
    });

  const widths = [1300, 2600, 900, 1300, 900, 900, 1100];
  const totalW = widths.reduce((a, b) => a + b, 0);

  const itemsTable = new Table({
    width: { size: totalW, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({
        children: [
          itemHeaderCell("Produk", widths[0]),
          itemHeaderCell("Deskripsi", widths[1]),
          itemHeaderCell("Kuantitas", widths[2], AlignmentType.CENTER),
          itemHeaderCell("Harga", widths[3], AlignmentType.RIGHT),
          itemHeaderCell("Diskon", widths[4], AlignmentType.RIGHT),
          itemHeaderCell("Pajak", widths[5], AlignmentType.RIGHT),
          itemHeaderCell("Jumlah", widths[6], AlignmentType.RIGHT),
        ],
      }),
      ...data.items.map(
        (it) =>
          new TableRow({
            children: [
              itemDataCell(it.product, widths[0]),
              itemDataCell(it.description, widths[1]),
              itemDataCell(String(it.qty), widths[2], AlignmentType.CENTER),
              itemDataCell(fmt(it.price), widths[3], AlignmentType.RIGHT),
              itemDataCell(`${it.discount}%`, widths[4], AlignmentType.RIGHT),
              itemDataCell(`${it.tax}%`, widths[5], AlignmentType.RIGHT),
              itemDataCell(fmt(lineTotal(it)), widths[6], AlignmentType.RIGHT),
            ],
          }),
      ),
    ],
  });

  // Totals + message side by side
  const messageCell = new TableCell({
    borders: noBorder,
    width: { size: 4500, type: WidthType.DXA },
    children: [
      new Paragraph({
        children: [new TextRun({ text: "Pesan", bold: true, color: accent, size: 22 })],
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: accent, space: 4 } },
      }),
      new Paragraph({ children: [new TextRun({ text: "" })] }),
      new Paragraph({ children: [new TextRun({ text: data.message, color: muted })] }),
      new Paragraph({ children: [new TextRun({ text: "" })] }),
      new Paragraph({ children: [new TextRun({ text: "Terbilang", color: muted })] }),
      new Paragraph({ children: [new TextRun({ text: terbilang(grandTotal(data.items)), bold: true })] }),
    ],
  });

  const totalsRow = (label: string, value: string, bold = false, big = false) =>
    new TableRow({
      children: [
        new TableCell({
          borders: noBorder,
          width: { size: 2500, type: WidthType.DXA },
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: label, bold: true, color: big ? accent : "333333", size: big ? 28 : 22 })],
            }),
          ],
        }),
        new TableCell({
          borders: noBorder,
          width: { size: 2000, type: WidthType.DXA },
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: value, bold: bold || big, color: big ? accent : "333333", size: big ? 28 : 22 })],
            }),
          ],
        }),
      ],
    });

  const totalsCell = new TableCell({
    borders: noBorder,
    width: { size: 4500, type: WidthType.DXA },
    children: [
      new Table({
        width: { size: 4500, type: WidthType.DXA },
        columnWidths: [2500, 2000],
        rows: [
          totalsRow("Subtotal", `Rp ${fmt(subtotal(data.items))}`),
          totalsRow("Total Diskon", `(Rp ${fmt(totalDiscount(data.items))})`),
          totalsRow("Total", `Rp ${fmt(grandTotal(data.items))}`, true, true),
        ],
      }),
    ],
  });

  const bottomTable = new Table({
    width: { size: 9000, type: WidthType.DXA },
    columnWidths: [4500, 4500],
    rows: [new TableRow({ children: [messageCell, totalsCell] })],
  });

  // Signature
  const sigRuns: (TextRun | ImageRun)[] = [];
  const sigW = data.signatureSize ?? 120;
  const sigH = Math.round(sigW * 0.5);
  if (data.signatureDataUrl) {
    sigRuns.push(
      new ImageRun({
        type: imgType(data.signatureDataUrl),
        data: dataUrlToUint8(data.signatureDataUrl),
        transformation: { width: sigW, height: sigH },
        altText: { title: "sig", description: "sig", name: "sig" },
      } as never),
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
        },
        children: [
          headerTable,
          new Paragraph({ children: [new TextRun({ text: "" })] }),
          infoTable,
          new Paragraph({ children: [new TextRun({ text: "" })] }),
          itemsTable,
          new Paragraph({ children: [new TextRun({ text: "" })] }),
          bottomTable,
          new Paragraph({ children: [new TextRun({ text: "" })] }),
          new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Dengan Hormat," })] }),
          new Paragraph({ alignment: AlignmentType.RIGHT, children: sigRuns.length ? sigRuns : [new TextRun({ text: "" })] }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: data.signerName, bold: true, underline: {} })],
          }),
          new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: data.signerTitle, color: muted })] }),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}

export function downloadDocx(blob: Blob, filename: string) {
  saveAs(blob, filename);
}
