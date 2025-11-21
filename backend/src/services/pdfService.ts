import pdf from 'pdf-parse';
import { Buffer } from 'buffer';

/**
 * Converts a Google Drive View URL to a Direct Download URL
 */
function getDownloadUrl(url: string): string {
  // Check if it's a Google Drive URL
  if (url.includes('drive.google.com')) {
    // Extract ID
    const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      return `https://drive.google.com/uc?export=download&id=${idMatch[1]}`;
    }
  }
  return url;
}

export async function extractTextFromDrive(url: string): Promise<string> {
  try {
    const downloadUrl = getDownloadUrl(url);
    console.log(`[PDF Service] Fetching from: ${downloadUrl}`);

    const response = await fetch(downloadUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const data = await pdf(buffer);
    
    // Cleanup text (simple whitespace normalization)
    return data.text.replace(/\s+/g, ' ').trim();

  } catch (error: any) {
    console.error('[PDF Service] Error:', error);
    throw new Error(`Could not extract text from PDF: ${error.message}`);
  }
}