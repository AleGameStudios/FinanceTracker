import type { DollarBlueRateData } from '../types';

interface DollarBlueSource {
  name: string;
  compra: number;
  venta: number;
}

// CORS proxy to bypass CORS restrictions (for development/production)
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// Fetch with timeout and error handling
async function fetchWithTimeout(url: string, timeout = 10000): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(CORS_PROXY + encodeURIComponent(url), {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.text();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Parse dollar blue values from DolarHoy
async function fetchDolarHoy(): Promise<DollarBlueSource | null> {
  try {
    const html = await fetchWithTimeout('https://dolarhoy.com/cotizaciondolarblue');

    // Extract compra and venta from the page
    // Looking for patterns like: $1,234 or $1234
    const compraMatch = html.match(/class="compra"[^>]*>[\s\S]*?\$\s*([\d.,]+)/i) ||
                        html.match(/Compra[^$]*\$\s*([\d.,]+)/i);
    const ventaMatch = html.match(/class="venta"[^>]*>[\s\S]*?\$\s*([\d.,]+)/i) ||
                       html.match(/Venta[^$]*\$\s*([\d.,]+)/i);

    if (compraMatch && ventaMatch) {
      const compra = parseFloat(compraMatch[1].replace(/\./g, '').replace(',', '.'));
      const venta = parseFloat(ventaMatch[1].replace(/\./g, '').replace(',', '.'));

      if (!isNaN(compra) && !isNaN(venta) && compra > 0 && venta > 0) {
        return { name: 'DolarHoy', compra, venta };
      }
    }
    return null;
  } catch (error) {
    console.warn('Failed to fetch from DolarHoy:', error);
    return null;
  }
}

// Parse dollar blue values from Ambito Financiero
async function fetchAmbito(): Promise<DollarBlueSource | null> {
  try {
    const html = await fetchWithTimeout('https://www.ambito.com/contenidos/dolar-informal.html');

    // Extract compra and venta from the page
    const compraMatch = html.match(/Compra[^$]*\$\s*([\d.,]+)/i) ||
                        html.match(/data-compra="([\d.,]+)"/i);
    const ventaMatch = html.match(/Venta[^$]*\$\s*([\d.,]+)/i) ||
                       html.match(/data-venta="([\d.,]+)"/i);

    if (compraMatch && ventaMatch) {
      const compra = parseFloat(compraMatch[1].replace(/\./g, '').replace(',', '.'));
      const venta = parseFloat(ventaMatch[1].replace(/\./g, '').replace(',', '.'));

      if (!isNaN(compra) && !isNaN(venta) && compra > 0 && venta > 0) {
        return { name: 'Ambito', compra, venta };
      }
    }
    return null;
  } catch (error) {
    console.warn('Failed to fetch from Ambito:', error);
    return null;
  }
}

// Parse from Cronista
async function fetchCronista(): Promise<DollarBlueSource | null> {
  try {
    const html = await fetchWithTimeout('https://www.cronista.com/MercadosOnline/dolar.html');

    // Look for blue dollar pattern
    const blueSection = html.match(/blue[\s\S]*?compra[^$]*\$\s*([\d.,]+)[\s\S]*?venta[^$]*\$\s*([\d.,]+)/i) ||
                        html.match(/informal[\s\S]*?compra[^$]*\$\s*([\d.,]+)[\s\S]*?venta[^$]*\$\s*([\d.,]+)/i);

    if (blueSection) {
      const compra = parseFloat(blueSection[1].replace(/\./g, '').replace(',', '.'));
      const venta = parseFloat(blueSection[2].replace(/\./g, '').replace(',', '.'));

      if (!isNaN(compra) && !isNaN(venta) && compra > 0 && venta > 0) {
        return { name: 'Cronista', compra, venta };
      }
    }
    return null;
  } catch (error) {
    console.warn('Failed to fetch from Cronista:', error);
    return null;
  }
}

// Fetch from Bluelytics API (most reliable - provides aggregated data)
async function fetchBluelytics(): Promise<DollarBlueSource | null> {
  try {
    const response = await fetch('https://api.bluelytics.com.ar/v2/latest');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.blue && typeof data.blue.value_buy === 'number' && typeof data.blue.value_sell === 'number') {
      return {
        name: 'Bluelytics',
        compra: data.blue.value_buy,
        venta: data.blue.value_sell,
      };
    }
    return null;
  } catch (error) {
    console.warn('Failed to fetch from Bluelytics:', error);
    return null;
  }
}

// Fetch from DolarAPI
async function fetchDolarAPI(): Promise<DollarBlueSource | null> {
  try {
    const response = await fetch('https://dolarapi.com/v1/dolares/blue');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (typeof data.compra === 'number' && typeof data.venta === 'number') {
      return {
        name: 'DolarAPI',
        compra: data.compra,
        venta: data.venta,
      };
    }
    return null;
  } catch (error) {
    console.warn('Failed to fetch from DolarAPI:', error);
    return null;
  }
}

// Main function to fetch and aggregate dollar blue rates
export async function fetchDollarBlueRate(): Promise<DollarBlueRateData | null> {
  // Fetch from all sources in parallel
  const results = await Promise.all([
    fetchBluelytics(),
    fetchDolarAPI(),
    fetchDolarHoy(),
    fetchAmbito(),
    fetchCronista(),
  ]);

  // Filter out null results
  const validSources = results.filter((r): r is DollarBlueSource => r !== null);

  if (validSources.length === 0) {
    console.warn('Could not fetch dollar blue rate from any source');
    return null;
  }

  // Calculate averages
  const avgCompra = validSources.reduce((sum, s) => sum + s.compra, 0) / validSources.length;
  const avgVenta = validSources.reduce((sum, s) => sum + s.venta, 0) / validSources.length;
  const promedio = (avgCompra + avgVenta) / 2;

  return {
    compra: Math.round(avgCompra * 100) / 100,
    venta: Math.round(avgVenta * 100) / 100,
    promedio: Math.round(promedio * 100) / 100,
    lastUpdated: Date.now(),
    sources: validSources,
  };
}

// Check if rate data is stale (older than 1 hour)
export function isRateStale(rateData: DollarBlueRateData | undefined): boolean {
  if (!rateData) return true;
  const oneHour = 60 * 60 * 1000;
  return Date.now() - rateData.lastUpdated > oneHour;
}
