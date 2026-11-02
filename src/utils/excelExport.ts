import { UnitRiskItem, ClinicalIncident } from '../types/clinical';

/**
 * Utility untuk mengekspor data ke file Microsoft Excel (.xls) berformat HTML Spreadsheet
 * Dilengkapi kop surat resmi RSU SHANTI GRAHA, pewarnaan sel sesuai standar STARKES KARS,
 * border sel yang rapi, dan pengaturan lebar kolom (column width) otomatis.
 */

// Helper to escape HTML characters
function escapeHtml(str: string | number | undefined | null): string {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Ekspor Matriks Risk Register ke format Excel (.xls)
 */
export function exportRiskRegisterToExcel(
  items: UnitRiskItem[],
  contextInfo: {
    title: string;
    scopeLabel: string;
    officerName?: string;
  }
) {
  const officer = contextInfo.officerName || 'Ns.Nyoman adi Sedana,S.Kep';
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const currentTime = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Calculate statistics
  const total = items.length;
  const ekstrem = items.filter(i => i.grade === 'EKSTREM').length;
  const tinggi = items.filter(i => i.grade === 'TINGGI').length;
  const sedang = items.filter(i => i.grade === 'SEDANG').length;
  const rendah = items.filter(i => i.grade === 'RENDAH').length;
  const disetujui = items.filter(i => i.verifStatus === 'Disetujui').length;
  const controlled = items.filter(i => i.status === 'Controlled').length;

  let html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>Risk Register STARKES</x:Name>
          <x:WorksheetOptions>
            <x:DisplayGridlines/>
            <x:FitToPage/>
            <x:Print>
              <x:FitWidth>1</x:FitWidth>
              <x:FitHeight>99</x:FitHeight>
              <x:ValidPrinterInfo/>
            </x:Print>
          </x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
  <style>
    body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; font-size: 11pt; color: #0b1c30; }
    table { border-collapse: collapse; width: 100%; mso-displayed-decimal-separator: "."; mso-displayed-thousand-separator: ","; }
    th { background-color: #005d42; color: #ffffff; font-weight: bold; font-size: 10pt; text-align: center; border: 1px solid #004b35; padding: 10px 8px; vertical-align: middle; }
    td { font-size: 10pt; border: 1px solid #cbd5e1; padding: 8px 6px; vertical-align: top; mso-number-format: "\\@"; }
    .num-cell { text-align: center; mso-number-format: "0"; }
    .text-center { text-align: center; }
    .text-left { text-align: left; }
    .bold { font-weight: bold; }
    
    /* Grade colors */
    .grade-ekstrem { background-color: #ffe4e6; color: #9f1239; font-weight: bold; text-align: center; }
    .grade-tinggi { background-color: #ffedd5; color: #9a3412; font-weight: bold; text-align: center; }
    .grade-sedang { background-color: #fef08a; color: #854d0e; font-weight: bold; text-align: center; }
    .grade-rendah { background-color: #dcfce7; color: #166534; font-weight: bold; text-align: center; }
    
    /* Verif colors */
    .verif-disetujui { background-color: #ecfdf5; color: #065f46; font-weight: bold; text-align: center; }
    .verif-revisi { background-color: #fff1f2; color: #9f1239; font-weight: bold; text-align: center; }
    .verif-pending { background-color: #eff4ff; color: #005683; font-weight: bold; text-align: center; }

    /* Status colors */
    .status-controlled { background-color: #f0fdf4; color: #15803d; font-weight: bold; text-align: center; }
    .status-progress { background-color: #f8fafc; color: #0284c7; font-weight: bold; text-align: center; }
    .status-open { background-color: #fef2f2; color: #b91c1c; font-weight: bold; text-align: center; }
  </style>
</head>
<body>
  <table>
    <!-- KOP RESMI RUMAH SAKIT -->
    <tr>
      <td colspan="18" style="background-color: #005d42; color: #ffffff; text-align: center; font-size: 15pt; font-weight: bold; padding: 12px; border: none;">
        RUMAH SAKIT UMUM SHANTI GRAHA
      </td>
    </tr>
    <tr>
      <td colspan="18" style="background-color: #047857; color: #ffffff; text-align: center; font-size: 11pt; font-weight: bold; padding: 6px; border: none;">
        KOMITE MUTU &amp; KESELAMATAN PASIEN (KMKP)
      </td>
    </tr>
    <tr>
      <td colspan="18" style="background-color: #e6f4ea; color: #005d42; text-align: center; font-size: 12pt; font-weight: bold; padding: 8px; border-bottom: 2px solid #005d42;">
        ${escapeHtml(contextInfo.title.toUpperCase())}
      </td>
    </tr>
    <tr>
      <td colspan="18" style="height: 8px; border: none;"></td>
    </tr>

    <!-- METADATA DOKUMEN -->
    <tr>
      <td colspan="4" style="font-weight: bold; background-color: #f8fafc; border: 1px solid #cbd5e1;">Cakupan / Unit Kerja:</td>
      <td colspan="5" style="border: 1px solid #cbd5e1;">${escapeHtml(contextInfo.scopeLabel)}</td>
      <td colspan="3" style="font-weight: bold; background-color: #f8fafc; border: 1px solid #cbd5e1;">Tanggal Ekspor:</td>
      <td colspan="6" style="border: 1px solid #cbd5e1;">${escapeHtml(currentDate)} pukul ${escapeHtml(currentTime)} WITA</td>
    </tr>
    <tr>
      <td colspan="4" style="font-weight: bold; background-color: #f8fafc; border: 1px solid #cbd5e1;">Penanggung Jawab:</td>
      <td colspan="5" style="border: 1px solid #cbd5e1; font-weight: bold; color: #005d42;">${escapeHtml(officer)}</td>
      <td colspan="3" style="font-weight: bold; background-color: #f8fafc; border: 1px solid #cbd5e1;">Standar Regulasi:</td>
      <td colspan="6" style="border: 1px solid #cbd5e1;">STARKES KARS 2022/2026 (11 Kategori PPI &amp; 7 MFK)</td>
    </tr>
    <tr>
      <td colspan="4" style="font-weight: bold; background-color: #f8fafc; border: 1px solid #cbd5e1;">Ringkasan Data:</td>
      <td colspan="14" style="border: 1px solid #cbd5e1;">
        Total: <strong>${total}</strong> item | 
        Ekstrem [15-25]: <span style="color: #9f1239; font-weight: bold;">${ekstrem}</span> | 
        Tinggi [10-14]: <span style="color: #9a3412; font-weight: bold;">${tinggi}</span> | 
        Sedang [4-9]: <span style="color: #854d0e; font-weight: bold;">${sedang}</span> | 
        Rendah [1-3]: <span style="color: #166534; font-weight: bold;">${rendah}</span> | 
        Terverifikasi KMKP: <span style="color: #065f46; font-weight: bold;">${disetujui}</span> | 
        Terkendali (Controlled): <span style="color: #15803d; font-weight: bold;">${controlled}</span>
      </td>
    </tr>
    <tr>
      <td colspan="18" style="height: 12px; border: none;"></td>
    </tr>

    <!-- HEADER KOLOM TABEL -->
    <thead>
      <tr>
        <th style="width: 45px;">No.</th>
        <th style="width: 110px;">Kode Risiko</th>
        <th style="width: 140px;">Unit Kerja</th>
        <th style="width: 220px;">Klasifikasi Standar STARKES</th>
        <th style="width: 320px;">Pernyataan Risiko (Potensi Bahaya)</th>
        <th style="width: 280px;">Akar Masalah (Penyebab Dasar)</th>
        <th style="width: 75px;">Prob. (P)</th>
        <th style="width: 75px;">Dampak (D)</th>
        <th style="width: 80px;">Skor (P×D)</th>
        <th style="width: 120px;">Grade Risiko</th>
        <th style="width: 340px;">Rencana Mitigasi &amp; Pengendalian</th>
        <th style="width: 320px; background-color: #047857;">Implementasi Yang Sudah Dilakukan</th>
        <th style="width: 180px;">Penanggung Jawab (PIC)</th>
        <th style="width: 95px;">Target</th>
        <th style="width: 150px;">Unit Verifikator</th>
        <th style="width: 120px;">Status Verifikasi</th>
        <th style="width: 240px;">Catatan Hasil Pemeriksaan</th>
        <th style="width: 110px;">Pengendalian</th>
      </tr>
    </thead>
    <tbody>
`;

  if (items.length === 0) {
    html += `
      <tr>
        <td colspan="18" style="text-align: center; padding: 30px; font-style: italic; color: #64748b;">
          Tidak ada data risiko yang sesuai dengan kriteria filter yang dipilih.
        </td>
      </tr>
    `;
  } else {
    items.forEach((item, index) => {
      const gradeClass = 
        item.grade === 'EKSTREM' ? 'grade-ekstrem' :
        item.grade === 'TINGGI' ? 'grade-tinggi' :
        item.grade === 'SEDANG' ? 'grade-sedang' : 'grade-rendah';

      const verifClass = 
        item.verifStatus === 'Disetujui' ? 'verif-disetujui' :
        item.verifStatus === 'Perlu Revisi' ? 'verif-revisi' : 'verif-pending';

      const statusClass = 
        item.status === 'Controlled' ? 'status-controlled' :
        item.status === 'In Progress' ? 'status-progress' : 'status-open';

      const rowBg = index % 2 === 0 ? '#ffffff' : '#f8fafc';

      html += `
      <tr style="background-color: ${rowBg};">
        <td class="num-cell" style="text-align: center;">${index + 1}</td>
        <td style="font-family: Consolas, monospace; font-weight: bold; text-align: center;">${escapeHtml(item.id)}</td>
        <td style="font-weight: bold;">${escapeHtml(item.unitLabel || item.unit)}</td>
        <td style="font-size: 9.5pt;">${escapeHtml(item.categoryName)}</td>
        <td style="line-height: 1.35;">${escapeHtml(item.statement)}</td>
        <td style="color: #475569; line-height: 1.35;">${escapeHtml(item.rootCause)}</td>
        <td class="num-cell">${item.p}</td>
        <td class="num-cell">${item.d}</td>
        <td class="num-cell" style="font-weight: bold;">${item.score}</td>
        <td class="${gradeClass}">${escapeHtml(item.grade)} [${item.score}]</td>
        <td style="line-height: 1.35;">${escapeHtml(item.mitigation)}</td>
        <td style="line-height: 1.35; color: #005d42; font-weight: 600; background-color: #f0fdf4;">${escapeHtml(item.implementedActions || '-')}</td>
        <td style="font-weight: 600;">${escapeHtml(item.pic)}</td>
        <td class="text-center" style="font-family: Consolas, monospace; font-size: 9pt;">${escapeHtml(item.target)}</td>
        <td style="font-size: 9pt;">${escapeHtml(item.verifierUnit)}</td>
        <td class="${verifClass}">${escapeHtml(item.verifStatus)}</td>
        <td style="font-style: italic; font-size: 9pt; color: #475569;">${escapeHtml(item.verifNote || '-')}</td>
        <td class="${statusClass}">${escapeHtml(item.status)}</td>
      </tr>
      `;
    });
  }

  html += `
    </tbody>
    <!-- FOOTER TABEL STATISTIK -->
    <tfoot>
      <tr>
        <td colspan="18" style="height: 10px; border: none;"></td>
      </tr>
      <tr style="background-color: #f1f5f9; font-weight: bold;">
        <td colspan="6" style="text-align: right; padding: 8px;">TOTAL KESELURUHAN RISIKO TERDAFTAR:</td>
        <td colspan="3" class="num-cell" style="font-size: 11pt; color: #005d42;">${total} ITEM</td>
        <td colspan="9" style="font-size: 9.5pt;">
          Ekstrem: ${ekstrem} | Tinggi: ${tinggi} | Sedang: ${sedang} | Rendah: ${rendah}
        </td>
      </tr>
      <tr>
        <td colspan="17" style="height: 20px; border: none;"></td>
      </tr>

      <!-- TANDA TANGAN RESMI PENGESAHAN DOKUMEN -->
      <tr>
        <td colspan="5" style="border: none; text-align: center; vertical-align: top;">
          <p style="margin: 0; font-size: 10pt; color: #64748b;">Disiapkan oleh,</p>
          <p style="margin: 4px 0 50px 0; font-weight: bold;">Komite Mutu &amp; Manajemen Risiko</p>
          <p style="margin: 0; font-weight: bold; text-decoration: underline;">${escapeHtml(officer)}</p>
          <p style="margin: 2px 0 0 0; font-size: 9pt; color: #64748b;">RSU SHANTI GRAHA</p>
        </td>
        <td colspan="6" style="border: none;"></td>
        <td colspan="6" style="border: none; text-align: center; vertical-align: top;">
          <p style="margin: 0; font-size: 10pt; color: #64748b;">Mengetahui &amp; Menyetujui,</p>
          <p style="margin: 4px 0 50px 0; font-weight: bold;">Direktur Medis &amp; Keperawatan</p>
          <p style="margin: 0; font-weight: bold; text-decoration: underline;">dr. Direktur Medis, Sp.B</p>
          <p style="margin: 2px 0 0 0; font-size: 9pt; color: #64748b;">RSU SHANTI GRAHA</p>
        </td>
      </tr>
      <tr>
        <td colspan="17" style="height: 15px; border: none;"></td>
      </tr>
      <tr>
        <td colspan="17" style="border: none; text-align: center; font-size: 8.5pt; color: #94a3b8; font-style: italic;">
          Dokumen ini dihasilkan secara otomatis melalui SIM-KPRS RSU SHANTI GRAHA sesuai Standar Akreditasi Kemenkes RI / STARKES KARS 2026.
        </td>
      </tr>
    </tfoot>
  </table>
</body>
</html>
`;

  // Create download link with Blob
  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const cleanFilename = contextInfo.title
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 50);
  const filename = `${cleanFilename}_RSU_SHANTI_GRAHA_${new Date().toISOString().slice(0, 10)}.xls`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Ekspor Registri Insiden Keselamatan Pasien (IKP) ke format Excel (.xls)
 */
export function exportIncidentsToExcel(
  incidents: ClinicalIncident[],
  officerName?: string
) {
  const officer = officerName || 'Ns.Nyoman adi Sedana,S.Kep';
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const currentTime = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const total = incidents.length;
  const sentinel = incidents.filter(i => i.incidentType === 'SENTINEL').length;
  const ktd = incidents.filter(i => i.incidentType === 'KTD').length;
  const knc = incidents.filter(i => i.incidentType === 'KNC').length;
  const ktc = incidents.filter(i => i.incidentType === 'KTC').length;
  const kpc = incidents.filter(i => i.incidentType === 'KPC').length;

  let html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>Registri IKP STARKES</x:Name>
          <x:WorksheetOptions>
            <x:DisplayGridlines/>
            <x:FitToPage/>
          </x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
  <style>
    body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; font-size: 11pt; color: #0b1c30; }
    table { border-collapse: collapse; width: 100%; }
    th { background-color: #005d42; color: #ffffff; font-weight: bold; font-size: 10pt; text-align: center; border: 1px solid #004b35; padding: 10px 8px; }
    td { font-size: 10pt; border: 1px solid #cbd5e1; padding: 8px 6px; vertical-align: top; mso-number-format: "\\@"; }
    .num-cell { text-align: center; }
    .type-sentinel { background-color: #ffe4e6; color: #9f1239; font-weight: bold; text-align: center; }
    .type-ktd { background-color: #ffedd5; color: #9a3412; font-weight: bold; text-align: center; }
    .type-knc { background-color: #fef08a; color: #854d0e; font-weight: bold; text-align: center; }
    .type-ktc { background-color: #eff4ff; color: #005683; font-weight: bold; text-align: center; }
    .type-kpc { background-color: #f1f5f9; color: #334155; font-weight: bold; text-align: center; }
  </style>
</head>
<body>
  <table>
    <tr>
      <td colspan="10" style="background-color: #005d42; color: #ffffff; text-align: center; font-size: 15pt; font-weight: bold; padding: 12px; border: none;">
        RUMAH SAKIT UMUM SHANTI GRAHA
      </td>
    </tr>
    <tr>
      <td colspan="10" style="background-color: #047857; color: #ffffff; text-align: center; font-size: 11pt; font-weight: bold; padding: 6px; border: none;">
        KOMITE MUTU &amp; KESELAMATAN PASIEN (KMKP)
      </td>
    </tr>
    <tr>
      <td colspan="10" style="background-color: #e6f4ea; color: #005d42; text-align: center; font-size: 12pt; font-weight: bold; padding: 8px; border-bottom: 2px solid #005d42;">
        REGISTRI LAPORAN INSIDEN KESELAMATAN PASIEN (IKP) - STANDAR KNKP KEMENKES RI
      </td>
    </tr>
    <tr><td colspan="10" style="height: 8px; border: none;"></td></tr>
    <tr>
      <td colspan="3" style="font-weight: bold; background-color: #f8fafc; border: 1px solid #cbd5e1;">Tanggal Unduh:</td>
      <td colspan="3" style="border: 1px solid #cbd5e1;">${escapeHtml(currentDate)} pukul ${escapeHtml(currentTime)} WITA</td>
      <td colspan="2" style="font-weight: bold; background-color: #f8fafc; border: 1px solid #cbd5e1;">Petugas Mutu (KMKP):</td>
      <td colspan="2" style="border: 1px solid #cbd5e1; font-weight: bold; color: #005d42;">${escapeHtml(officer)}</td>
    </tr>
    <tr>
      <td colspan="3" style="font-weight: bold; background-color: #f8fafc; border: 1px solid #cbd5e1;">Statistik Insiden:</td>
      <td colspan="7" style="border: 1px solid #cbd5e1;">
        Total: <strong>${total}</strong> | 
        Sentinel: <strong style="color: #9f1239;">${sentinel}</strong> | 
        KTD: <strong style="color: #9a3412;">${ktd}</strong> | 
        KNC: <strong style="color: #854d0e;">${knc}</strong> | 
        KTC: <strong style="color: #005683;">${ktc}</strong> | 
        KPC: <strong>${kpc}</strong>
      </td>
    </tr>
    <tr><td colspan="10" style="height: 12px; border: none;"></td></tr>
    <thead>
      <tr>
        <th style="width: 45px;">No.</th>
        <th style="width: 120px;">ID Insiden</th>
        <th style="width: 140px;">Hash Pasien</th>
        <th style="width: 160px;">Unit / Departemen</th>
        <th style="width: 110px;">Tgl Kejadian</th>
        <th style="width: 120px;">Jenis Insiden</th>
        <th style="width: 80px;">Skor Risiko</th>
        <th style="width: 120px;">Tingkat Risiko</th>
        <th style="width: 150px;">Status Progres</th>
        <th style="width: 200px;">Petugas Risiko (KMKP)</th>
      </tr>
    </thead>
    <tbody>
`;

  incidents.forEach((inc, idx) => {
    const typeClass = 
      inc.incidentType === 'SENTINEL' ? 'type-sentinel' :
      inc.incidentType === 'KTD' ? 'type-ktd' :
      inc.incidentType === 'KNC' ? 'type-knc' :
      inc.incidentType === 'KTC' ? 'type-ktc' : 'type-kpc';

    const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';

    html += `
      <tr style="background-color: ${rowBg};">
        <td class="num-cell">${idx + 1}</td>
        <td style="font-family: Consolas, monospace; font-weight: bold; text-align: center;">${escapeHtml(inc.id)}</td>
        <td style="font-family: Consolas, monospace; text-align: center;">${escapeHtml(inc.patientHash)}</td>
        <td style="font-weight: bold;">${escapeHtml(inc.department)}</td>
        <td style="text-align: center;">${escapeHtml(inc.incidentDate)}</td>
        <td class="${typeClass}">${escapeHtml(inc.incidentType)}</td>
        <td class="num-cell" style="font-weight: bold;">${inc.riskScore}</td>
        <td style="text-align: center; font-weight: bold;">${escapeHtml(inc.riskLevel)}</td>
        <td style="text-align: center;">${escapeHtml(inc.status)}</td>
        <td>${escapeHtml(inc.riskOfficer)}</td>
      </tr>
    `;
  });

  html += `
    </tbody>
    <tfoot>
      <tr><td colspan="10" style="height: 15px; border: none;"></td></tr>
      <tr>
        <td colspan="10" style="text-align: center; font-size: 8.5pt; color: #94a3b8; font-style: italic; border: none;">
          RSU SHANTI GRAHA - Sistem Informasi Keselamatan Pasien Rumah Sakit (SIM-KPRS)
        </td>
      </tr>
    </tfoot>
  </table>
</body>
</html>
`;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const filename = `Registri_IKP_RSU_SHANTI_GRAHA_${new Date().toISOString().slice(0, 10)}.xls`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
