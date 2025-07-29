import Tesseract from 'tesseract.js';

export class OcrService {
  async extractTextFromImage(imageBuffer: Buffer): Promise<string> {
    try {
      const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng');
      return text;
    } catch (error) {
      console.error('Error during OCR processing:', error);
      throw new Error('Failed to extract text from image.');
    }
  }
}
