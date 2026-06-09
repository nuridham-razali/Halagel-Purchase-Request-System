import { PurchaseLog } from '../type';

// Make sure to add your Apps Script Web App URL in your .env file
// Example: VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
const SCRIPT_URL = (import.meta as any).env.VITE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbx5nHdCs-P59IZkqxN6nBvPH19mNnfgTImObYgDf2_YIQ4WiWzIX0AZyFpwmu3lK--MaA/exec';

export const getScriptUrl = (): string | null => {
  return SCRIPT_URL || null;
};

export const fetchLogsFromSheets = async (): Promise<PurchaseLog[]> => {
  const url = getScriptUrl();
  if (!url) return [];

  try {
    const fetchUrl = `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`;
    const res = await fetch(fetchUrl, {
      cache: 'no-store'
    });
    const data = await res.json();
    if (data.status === 'success' && data.logs) {
      // Sort descending by ID
      return data.logs.sort((a: any, b: any) => Number(b.id) - Number(a.id));
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch logs from Google Sheets", error);
    return [];
  }
};

export const syncLogsToSheetsDB = async (logs: PurchaseLog[]) => {
  const url = getScriptUrl();
  if (!url) {
    throw new Error("Apps Script URL is not configured. Please add VITE_APPS_SCRIPT_URL to your .env file.");
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({ action: 'save', logs }),
    });

    const result = await res.json();
    if (result.status === 'error') {
      throw new Error(result.message);
    }
    return result.sheetUrl;
  } catch (err: any) {
    if (err.message === 'Failed to fetch') {
      throw new Error(`Failed to connect to the Apps Script URL. Please check the URL and CORS settings.`);
    }
    throw err;
  }
};
