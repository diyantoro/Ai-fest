import pdfParse from 'pdf-parse';

/**
 * Extracts raw text content from a PDF Buffer
 * @param {Buffer} pdfBuffer 
 * @returns {Promise<string>} Cleaned text string
 */
export async function parsePdf(pdfBuffer) {
  try {
    const data = await pdfParse(pdfBuffer);
    const text = data.text ? data.text.trim() : '';
    if (!text) {
      throw new Error('PDF file appears to be empty or contains non-extractable scanned images.');
    }
    return text;
  } catch (error) {
    throw new Error(`PDF Parsing failed: ${error.message}`);
  }
}
