import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

export interface PDFOptions {
  html: string;
  fileName: string;
  directory?: string;
}

export class PDFService {
  static async generatePDF(options: PDFOptions) {
    try {
      const { html, fileName, directory } = options;

      const pdf = await Print.printToFileAsync({
        html,
      });


      return pdf;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  static generateTanamanHTML(detailData: any, language: string) {
    const isIndonesian = language === 'id';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4CAF50; padding-bottom: 20px; }
          .title { color: #4CAF50; font-size: 24px; margin-bottom: 10px; }
          .section { margin-bottom: 25px; }
          .section-title { color: #333; font-size: 18px; font-weight: bold; margin-bottom: 10px; border-left: 4px solid #4CAF50; padding-left: 10px; }
          .card { background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
          .bullet-item { margin-bottom: 8px; }
          .bullet { color: #4CAF50; }
          .step-item { margin-bottom: 15px; }
          .step-title { font-weight: bold; color: #333; margin-bottom: 5px; }
          .step-desc { color: #666; }
          .bold { font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">${detailData.nama} - ${isIndonesian ? 'Detail Tanaman' : 'Plant Details'}</h1>
          <p>${isIndonesian ? 'Laporan Detail Tanaman Hidroponik' : 'Hydroponic Plant Detail Report'}</p>
        </div>

        <div class="section">
          <h2 class="section-title">${isIndonesian ? 'Deskripsi' : 'Description'}</h2>
          <div class="card">
            <p>${detailData.deskripsi[language]}</p>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">${isIndonesian ? 'Keunggulan' : 'Advantages'}</h2>
          <div class="card">
            ${detailData.keunggulan[language].map((item: string) => `
              <div class="bullet-item">
                <span class="bullet">•</span> ${item}
              </div>
            `).join('')}
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">${isIndonesian ? 'Syarat Tumbuh' : 'Growth Requirements'}</h2>
          <div class="card">
            <div class="bullet-item"><span class="bullet">•</span> pH: <span class="bold">${detailData.syaratTumbuh.ph}</span></div>
            <div class="bullet-item"><span class="bullet">•</span> EC/TDS: <span class="bold">${detailData.syaratTumbuh.ec}</span></div>
            <div class="bullet-item"><span class="bullet">•</span> ${isIndonesian ? 'Suhu Ideal' : 'Ideal Temperature'}: <span class="bold">${detailData.syaratTumbuh.suhuIdeal}</span></div>
            <div class="bullet-item"><span class="bullet">•</span> ${isIndonesian ? 'Cahaya' : 'Light'}: <span class="bold">${detailData.syaratTumbuh.cahaya}</span></div>
            <div class="bullet-item"><span class="bullet">•</span> ${isIndonesian ? 'Kelembapan' : 'Humidity'}: <span class="bold">${detailData.syaratTumbuh.kelembapan}</span></div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">${isIndonesian ? 'Cara Penanaman' : 'Planting Method'}</h2>
          <div class="card">
            ${detailData.caraPenanaman[language].map((step: any, index: number) => `
              <div class="step-item">
                <div class="step-title">${step.title}</div>
                <div class="step-desc">${step.desc}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">${isIndonesian ? 'Informasi Panen' : 'Harvest Information'}</h2>
          <div class="card">
            <div class="bullet-item">
              <span class="bullet">•</span> ${isIndonesian ? 'Lama Panen' : 'Harvest Period'}: <span class="bold">${detailData.lamaPanen}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>${isIndonesian ? 'Dibuat pada' : 'Generated on'} ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
      </html>
    `;
  }

  static generateHewanHTML(detailData: any, language: string) {
    const isIndonesian = language === 'id';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #FF6B35; padding-bottom: 20px; }
          .title { color: #FF6B35; font-size: 24px; margin-bottom: 10px; }
          .section { margin-bottom: 25px; }
          .section-title { color: #333; font-size: 18px; font-weight: bold; margin-bottom: 10px; border-left: 4px solid #FF6B35; padding-left: 10px; }
          .card { background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
          .bullet-item { margin-bottom: 8px; }
          .bullet { color: #FF6B35; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
          .info-item { margin-bottom: 10px; }
          .info-label { font-weight: bold; color: #333; }
          .info-value { color: #666; }
          .footer { text-align: center; margin-top: 30px; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">${detailData.nama} - ${isIndonesian ? 'Detail Hewan' : 'Animal Details'}</h1>
          <p>${isIndonesian ? 'Laporan Detail Peternakan' : 'Livestock Detail Report'}</p>
        </div>

        <div class="section">
          <h2 class="section-title">${isIndonesian ? 'Informasi Umum' : 'General Information'}</h2>
          <div class="card">
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">${isIndonesian ? 'Jenis Hewan' : 'Animal Type'}</div>
                <div class="info-value">${detailData.jenis_hewan}</div>
              </div>
              <div class="info-item">
                <div class="info-label">${isIndonesian ? 'Nama Kandang' : 'Coop Name'}</div>
                <div class="info-value">${detailData.nm_kandang}</div>
              </div>
              <div class="info-item">
                <div class="info-label">${isIndonesian ? 'Kapasitas' : 'Capacity'}</div>
                <div class="info-value">${detailData.kapasitas}</div>
              </div>
              <div class="info-item">
                <div class="info-label">${isIndonesian ? 'Jumlah Hewan' : 'Animal Count'}</div>
                <div class="info-value">${detailData.jumlah_hewan}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">${isIndonesian ? 'Produksi' : 'Production'}</h2>
          <div class="card">
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">${isIndonesian ? 'Hasil Produksi' : 'Production Output'}</div>
                <div class="info-value">${detailData.Hasil_Produksi}</div>
              </div>
              <div class="info-item">
                <div class="info-label">${isIndonesian ? 'Jumlah Produksi' : 'Production Quantity'}</div>
                <div class="info-value">${detailData.Jml_produksi}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">${isIndonesian ? 'Keterangan' : 'Description'}</h2>
          <div class="card">
            <p>${detailData.keterangan || (isIndonesian ? 'Tidak ada keterangan tambahan' : 'No additional description')}</p>
          </div>
        </div>

        <div class="footer">
          <p>${isIndonesian ? 'Dibuat pada' : 'Generated on'} ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
      </html>
    `;
  }
}