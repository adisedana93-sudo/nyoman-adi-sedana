import React, { useState } from 'react';
import { 
  BookOpen, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  Scale, 
  ChevronRight,
  ExternalLink,
  Layers,
  Crosshair
} from 'lucide-react';
import { SKP_STANDARDS } from '../data/mockClinicalData';

export const SkpGuideView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'SKP' | 'TRIAGE' | 'JUST_CULTURE'>('SKP');
  const [selectedSkp, setSelectedSkp] = useState<string>('SKP.3');

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2e8f0] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0b1c30] tracking-tight">
            Standar Sasaran Keselamatan Pasien (SKP) & Panduan Akreditasi
          </h2>
          <p className="text-xs sm:text-sm text-[#475569] mt-0.5">
            Pedoman Standar Nasional Akreditasi Rumah Sakit (STARKES Kemenkes RI) & Panduan Investigasi Insiden KNKP.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 bg-[#f1f5f9] p-1 rounded-[6px] border border-[#e2e8f0]">
          <button
            onClick={() => setActiveTab('SKP')}
            className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold transition cursor-pointer ${
              activeTab === 'SKP' ? 'bg-[#005d42] text-white' : 'text-[#475569] hover:text-[#0b1c30]'
            }`}
          >
            6 Sasaran SKP
          </button>
          <button
            onClick={() => setActiveTab('TRIAGE')}
            className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold transition cursor-pointer ${
              activeTab === 'TRIAGE' ? 'bg-[#005d42] text-white' : 'text-[#475569] hover:text-[#0b1c30]'
            }`}
          >
            Triage Klasifikasi IKP
          </button>
          <button
            onClick={() => setActiveTab('JUST_CULTURE')}
            className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold transition cursor-pointer ${
              activeTab === 'JUST_CULTURE' ? 'bg-[#005d42] text-white' : 'text-[#475569] hover:text-[#0b1c30]'
            }`}
          >
            Budaya Adil (Just Culture)
          </button>
        </div>
      </div>

      {/* Tab Content: 6 SKP */}
      {activeTab === 'SKP' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: SKP List */}
          <div className="lg:col-span-5 space-y-2.5">
            {SKP_STANDARDS.map((skp) => {
              const isSelected = selectedSkp === skp.code;
              return (
                <div
                  key={skp.code}
                  onClick={() => setSelectedSkp(skp.code)}
                  className={`p-4 rounded-[6px] border transition cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#005d42] ring-2 ring-[#005d42]/10 shadow-sm'
                      : 'bg-white border-[#e2e8f0] hover:bg-[#f8fafc]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      style={{ color: skp.color }}
                      className="font-mono text-xs font-bold px-2 py-0.5 rounded-[4px] bg-slate-100"
                    >
                      {skp.code}
                    </span>
                    <span className="text-[10px] text-[#64748b] font-medium">{skp.kemenkesRef}</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#0b1c30] mt-1">
                    {skp.title}
                  </h4>
                  <p className="text-xs text-[#515f74] mt-1 line-clamp-2">
                    {skp.shortDesc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right: Detailed SKP Protocol Specification */}
          <div className="lg:col-span-7 bg-white border border-[#e2e8f0] rounded-[8px] p-6 shadow-xs space-y-5">
            {selectedSkp === 'SKP.3' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#e11d48] bg-[#fff1f2] px-2 py-0.5 rounded-[4px] border border-[#fecdd3]">
                      STANDAR AKREDITASI SKP.3
                    </span>
                    <h3 className="text-base font-bold text-[#0b1c30] mt-1.5">
                      Meningkatkan Keamanan Obat-obatan yang Harus Diwaspadai (High Alert Medications)
                    </h3>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-[#334155] leading-relaxed">
                  <p>
                    Obat yang berisiko tinggi menyebabkan dampak fatal atau bahaya besar bagi keselamatan pasien jika digunakan secara keliru meliputi:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Elektrolit Konsentrat Tinggi:</strong> Kalium Klorida (KCl &ge; 7.46%), Natrium Klorida pekat (NaCl &gt; 0.9%), Magnesium Sulfat (MgSO4 &ge; 20% & 40%). Dilarang disimpan di unit rawat inap biasa kecuali di ICU/OK dengan lemari terkunci ganda.</li>
                    <li><strong>Obat Sitostatika & Kemoterapi:</strong> Wajib direkonstitusi di Clean Room Farmasi bertekanan negatif.</li>
                    <li><strong>Obat LASA (Look-Alike Sound-Alike / NORUM):</strong> Wajib dipisahkan secara fisik, menggunakan penulisan huruf besar kapital (TALL-man Lettering), contoh: <em>EPINEPHrine</em> vs <em>ePHEDrine</em>, <em>DOPAmine</em> vs <em>DOBUTamine</em>.</li>
                  </ul>

                  <div className="p-3 bg-[#ecfdf5] border border-[#a7f3d0] rounded-[4px] text-[#065f46]">
                    <strong className="block mb-1 font-bold">Protokol Verifikasi 7 Benar & Double Check:</strong>
                    1. Benar Pasien (2 pengenal) • 2. Benar Obat • 3. Benar Dosis • 4. Benar Rute • 5. Benar Waktu • 6. Benar Dokumentasi • 7. Benar Informasi.
                  </div>
                </div>
              </div>
            ) : selectedSkp === 'SKP.1' ? (
              <div className="space-y-4">
                <div className="border-b border-[#e2e8f0] pb-3">
                  <span className="font-mono text-xs font-bold text-[#0284c7] bg-[#eff4ff] px-2 py-0.5 rounded-[4px] border border-[#d5e3fc]">
                    STANDAR AKREDITASI SKP.1
                  </span>
                  <h3 className="text-base font-bold text-[#0b1c30] mt-1.5">
                    Mengidentifikasi Pasien dengan Benar
                  </h3>
                </div>
                <div className="space-y-3 text-xs text-[#334155] leading-relaxed">
                  <p>
                    Identifikasi pasien dilakukan menggunakan minimal 2 (dua) identitas yang tidak boleh berubah: <strong>Nama Lengkap Pasien</strong> dan <strong>Tanggal Lahir</strong> atau <strong>Nomor Rekam Medis</strong>.
                  </p>
                  <div className="p-3 bg-[#fff7ed] border border-[#ffedd5] rounded-[4px] text-[#9a3412]">
                    <strong>Dilarang keras</strong> mengidentifikasi pasien berdasarkan nomor kamar, nomor ranjang (bed), atau diagnosa klinis!
                  </div>
                  <h4 className="font-bold text-[#0b1c30] pt-2">Kode Warna Gelang Pasien Standar Kemenkes:</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 border rounded-[4px] bg-[#eff4ff] border-[#d5e3fc] text-[#005683]">
                      <strong>Biru Muda:</strong> Pasien Laki-laki
                    </div>
                    <div className="p-2 border rounded-[4px] bg-[#fff1f2] border-[#fecdd3] text-[#9f1239]">
                      <strong>Merah Muda:</strong> Pasien Perempuan
                    </div>
                    <div className="p-2 border rounded-[4px] bg-[#fefce8] border-[#fef08a] text-[#854d0e]">
                      <strong>Kuning:</strong> Risiko Jatuh Tinggi
                    </div>
                    <div className="p-2 border rounded-[4px] bg-[#fff1f2] border-[#fecdd3] text-[#9f1239]">
                      <strong>Merah:</strong> Alergi Berat
                    </div>
                    <div className="p-2 border rounded-[4px] bg-[#f8fafc] border-[#cbd5e1] text-[#334155]">
                      <strong>Ungu:</strong> Do Not Resuscitate (DNR)
                    </div>
                  </div>
                </div>
              </div>
            ) : selectedSkp === 'SKP.4' ? (
              <div className="space-y-4">
                <div className="border-b border-[#e2e8f0] pb-3">
                  <span className="font-mono text-xs font-bold text-[#f97316] bg-[#fff7ed] px-2 py-0.5 rounded-[4px] border border-[#ffedd5]">
                    STANDAR AKREDITASI SKP.4
                  </span>
                  <h3 className="text-base font-bold text-[#0b1c30] mt-1.5">
                    Memastikan Lokasi Pembedahan yang Benar, Prosedur Benar, dan Pasien Benar
                  </h3>
                </div>
                <div className="space-y-3 text-xs text-[#334155] leading-relaxed">
                  <p>
                    Penerapan Surgical Safety Checklist WHO wajib diterapkan dalam 3 fase di kamar bedah dan tindakan invasif:
                  </p>
                  <ol className="list-decimal pl-5 space-y-1.5">
                    <li><strong>Sign-In (Sebelum Induksi Anestesi):</strong> Verifikasi identitas, penandaan lokasi operasi (site marking) oleh operator yang melakukan tindakan, kesiapan mesin anestesi dan pulse oximeter, riwayat alergi dan risiko aspirasi/perdarahan.</li>
                    <li><strong>Time-Out (Sebelum Insisi Kulit):</strong> Seluruh tim berhenti beraktivitas sejenak, perkenalan nama dan peran masing-masing anggota tim bedah, konfirmasi nama pasien, prosedur yang akan dilakukan, pemberian antibiotik profilaksis 60 menit sebelumnya, antisipasi kejadian kritis.</li>
                    <li><strong>Sign-Out (Sebelum Menutup Luka & Meninggalkan OK):</strong> Konfirmasi nama tindakan yang dilakukan, kelengkapan hitungan kassa, jarum, dan instrumen bedah, pelabelan spesimen biopsi, dan rencana perawatan pasca bedah.</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-b border-[#e2e8f0] pb-3">
                  <span className="font-mono text-xs font-bold text-[#005d42] bg-[#ecfdf5] px-2 py-0.5 rounded-[4px] border border-[#a7f3d0]">
                    STANDAR AKREDITASI {selectedSkp}
                  </span>
                  <h3 className="text-base font-bold text-[#0b1c30] mt-1.5">
                    {SKP_STANDARDS.find(s => s.code === selectedSkp)?.title}
                  </h3>
                </div>
                <p className="text-xs text-[#334155] leading-relaxed">
                  {SKP_STANDARDS.find(s => s.code === selectedSkp)?.shortDesc}
                </p>
                <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[4px] text-xs text-[#475569]">
                  Setiap insiden yang berkaitan dengan pelanggaran kepatuhan standar ini wajib dilaporkan dalam kurun waktu 2x24 jam ke Komite Mutu & Keselamatan Pasien (KMKP).
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content: Triage Klasifikasi IKP */}
      {activeTab === 'TRIAGE' && (
        <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-6 shadow-xs space-y-5">
          <div className="border-b border-[#e2e8f0] pb-3">
            <h3 className="text-base font-bold text-[#0b1c30]">
              Matriks Triage & Definisi Operasional Insiden Keselamatan Pasien (IKP)
            </h3>
            <p className="text-xs text-[#475569] mt-0.5">
              Berdasarkan Peraturan Menteri Kesehatan Republik Indonesia (PMK No. 11 Tahun 2017 tentang Keselamatan Pasien).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-[6px] border border-[#fecdd3] bg-[#fff1f2] space-y-2">
              <span className="font-bold text-xs text-[#9f1239] px-2 py-0.5 bg-white border border-[#fecdd3] rounded-[4px] inline-block">
                1. Kejadian Sentinel (Sentinel Event)
              </span>
              <p className="text-xs text-[#9f1239] leading-relaxed">
                Suatu kejadian tidak diharapkan (KTD) yang mengakibatkan <strong>kematian tidak terduga</strong>, cedera permanen, atau kehilangan fungsi yang tidak terkait dengan perjalanan alamiah penyakit pasien.
              </p>
              <div className="text-[11px] font-semibold text-[#e11d48] pt-2 border-t border-[#fecdd3]">
                Alur: Wajib RCA maks 45 hari + Lapor Direksi & KNKP &lt; 2x24 jam.
              </div>
            </div>

            <div className="p-4 rounded-[6px] border border-[#ffedd5] bg-[#fff7ed] space-y-2">
              <span className="font-bold text-xs text-[#9a3412] px-2 py-0.5 bg-white border border-[#ffedd5] rounded-[4px] inline-block">
                2. KTD (Kejadian Tidak Diharapkan)
              </span>
              <p className="text-xs text-[#9a3412] leading-relaxed">
                Insiden yang mengakibatkan <strong>cedera pada pasien</strong> akibat tata kelola klinis, bukan karena penyakit yang mendasarinya (Adverse Event).
              </p>
              <div className="text-[11px] font-semibold text-[#f97316] pt-2 border-t border-[#ffedd5]">
                Alur: Grading risiko matriks 5x5 menentukan investigasi komprehensif atau sederhana.
              </div>
            </div>

            <div className="p-4 rounded-[6px] border border-[#fef08a] bg-[#fefce8] space-y-2">
              <span className="font-bold text-xs text-[#854d0e] px-2 py-0.5 bg-white border border-[#fef08a] rounded-[4px] inline-block">
                3. KNC (Kejadian Nyaris Celaka)
              </span>
              <p className="text-xs text-[#854d0e] leading-relaxed">
                Terjadinya insiden yang <strong>belum sampai terpapar</strong> ke pasien karena segera diketahui dan digagalkan oleh sistem atau petugas (Near Miss).
              </p>
              <div className="text-[11px] font-semibold text-[#ca8a04] pt-2 border-t border-[#fef08a]">
                Alur: Sangat berharga untuk deteksi kelemahan sistem preventif.
              </div>
            </div>

            <div className="p-4 rounded-[6px] border border-[#d5e3fc] bg-[#eff4ff] space-y-2">
              <span className="font-bold text-xs text-[#005683] px-2 py-0.5 bg-white border border-[#d5e3fc] rounded-[4px] inline-block">
                4. KTC (Kejadian Tidak Cedera)
              </span>
              <p className="text-xs text-[#005683] leading-relaxed">
                Insiden yang <strong>sudah terpapar ke pasien</strong>, tetapi ternyata tidak menimbulkan cedera klinis (misal: obat salah tertelan pasien namun tanpa efek toksik).
              </p>
              <div className="text-[11px] font-semibold text-[#0284c7] pt-2 border-t border-[#d5e3fc]">
                Alur: Investigasi sederhana oleh kepala unit kerja.
              </div>
            </div>

            <div className="p-4 rounded-[6px] border border-[#e2e8f0] bg-[#f8fafc] space-y-2">
              <span className="font-bold text-xs text-[#334155] px-2 py-0.5 bg-white border border-[#cbd5e1] rounded-[4px] inline-block">
                5. KPC (Kondisi Potensial Cedera)
              </span>
              <p className="text-xs text-[#334155] leading-relaxed">
                Kondisi yang sangat <strong>berpotensi untuk menimbulkan cedera</strong>, tetapi belum terjadi insiden (contoh: kabel defibrilator terkelupas, lantai licin tanpa tanda peringatan).
              </p>
              <div className="text-[11px] font-semibold text-[#475569] pt-2 border-t border-[#e2e8f0]">
                Alur: Mitigasi fasilitas dan pemeliharaan sarana (IPSRS).
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Just Culture / Budaya Adil */}
      {activeTab === 'JUST_CULTURE' && (
        <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-6 shadow-xs space-y-5">
          <div className="border-b border-[#e2e8f0] pb-3">
            <h3 className="text-base font-bold text-[#0b1c30] flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#005d42]" />
              Prinsip Budaya Adil (Just Culture) dalam Tata Kelola Klinis
            </h3>
            <p className="text-xs text-[#475569] mt-0.5">
              Membedakan antara kekeliruan manusia murni (human error), perilaku berisiko (at-risk behavior), dan kelalaian berat yang disengaja (reckless conduct).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-[6px] border border-[#a7f3d0] bg-[#ecfdf5]">
              <div className="font-bold text-[#065f46] text-sm mb-2">1. Human Error (Kekeliruan Murni)</div>
              <p className="text-[#065f46] leading-relaxed mb-3">
                Kekeliruan tidak disengaja akibat slip, lapse, atau kelelahan kognitif saat menjalankan protokol yang kompleks.
              </p>
              <div className="font-semibold text-[#005d42] bg-white p-2 rounded-[4px] border border-[#a7f3d0]">
                Respons Manajemen: Konseling, perbaikan desain sistem, coaching suportif, tanpa sanksi (No-Blame).
              </div>
            </div>

            <div className="p-4 rounded-[6px] border border-[#fef08a] bg-[#fefce8]">
              <div className="font-bold text-[#854d0e] text-sm mb-2">2. At-Risk Behavior (Perilaku Berisiko)</div>
              <p className="text-[#854d0e] leading-relaxed mb-3">
                Mengambil jalan pintas (shortcut) karena merasa aman atau terbiasa melompati tahapan SOP demi efisiensi waktu.
              </p>
              <div className="font-semibold text-[#854d0e] bg-white p-2 rounded-[4px] border border-[#fef08a]">
                Respons Manajemen: Pelatihan ulang (re-training), penegasan insentif keselamatan, audit berkala.
              </div>
            </div>

            <div className="p-4 rounded-[6px] border border-[#fecdd3] bg-[#fff1f2]">
              <div className="font-bold text-[#9f1239] text-sm mb-2">3. Reckless Conduct (Kelalaian Berat)</div>
              <p className="text-[#9f1239] leading-relaxed mb-3">
                Secara sadar mengabaikan risiko bahaya besar yang sudah diketahui secara nyata (misal: bekerja di bawah pengaruh zat/alkohol).
              </p>
              <div className="font-semibold text-[#e11d48] bg-white p-2 rounded-[4px] border border-[#fecdd3]">
                Respons Manajemen: Tindakan disiplin komite etik dan penegakan hukum profesi medis.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
