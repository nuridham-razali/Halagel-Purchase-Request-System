import { PurchaseLog } from '../type';

const SCRIPT_URL_KEY = 'halagel_app_script_url';

export const getScriptUrl = (): string | null => {
  return localStorage.getItem(SCRIPT_URL_KEY);
};

export const setScriptUrl = (url: string) => {
  localStorage.setItem(SCRIPT_URL_KEY, url);
};

export const clearScriptUrl = () => {
  localStorage.removeItem(SCRIPT_URL_KEY);
};

export const fetchLogsFromSheets = async (): Promise<PurchaseLog[]> => {
  const url = getScriptUrl();
  if (!url) return [];

  try {
    const res = await fetch(url);
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
  let url = getScriptUrl();
  if (!url) {
    url = window.prompt("Please enter your Google Apps Script Web App URL to configure Google Sheets Database:");
    if (!url) {
      throw new Error("Sync cancelled. Apps Script URL is required.");
    }
    setScriptUrl(url);
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
      clearScriptUrl();
      throw new Error(`Failed to connect to the Apps Script URL. Please check the URL. Try syncing again to re-enter.`);
    }
    throw err;
  }
};
