/**
 * Format angka ke format Rupiah (misal: Rp 1.500.000)
 */
export function formatRupiah(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format tanggal ke Bahasa Indonesia sederhana
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

/**
 * Perekstrak Foto & Metadata dari Link TikTok, Instagram, Shopee, Tokopedia, dll.
 * Menggunakan Microlink API gratis untuk melewati kendala CORS browser.
 */
export async function fetchLinkMetadata(targetUrl) {
  if (!targetUrl || typeof targetUrl !== 'string') return null;

  // Pastikan URL memiliki protokol http:// atau https://
  let cleanUrl = targetUrl.trim();
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = `https://${cleanUrl}`;
  }

  try {
    const apiUrl = `https://api.microlink.io?url=${encodeURIComponent(cleanUrl)}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error('Gagal mengambil metadata dari link');
    }

    const json = await response.json();
    if (json.status === 'success' && json.data) {
      const data = json.data;
      return {
        title: data.title || data.description || '',
        imageUrl: data.image?.url || data.logo?.url || null,
        description: data.description || '',
        publisher: data.publisher || ''
      };
    }
    return null;
  } catch (error) {
    console.warn('[LinkExtractor] Error fetching metadata:', error);
    return null;
  }
}
