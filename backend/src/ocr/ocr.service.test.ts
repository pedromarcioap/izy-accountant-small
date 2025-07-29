import { OcrService } from './ocr.service';
import Tesseract from 'tesseract.js';

jest.mock('tesseract.js', () => ({
  recognize: jest.fn(),
}));

describe('OcrService', () => {
  let ocrService: OcrService;

  beforeEach(() => {
    ocrService = new OcrService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should extract text from an image buffer', async () => {
    const imageBuffer = Buffer.from('fake-image-data');
    const expectedText = 'This is the extracted text.';
    (Tesseract.recognize as jest.Mock).mockResolvedValue({
      data: { text: expectedText },
    });

    const result = await ocrService.extractTextFromImage(imageBuffer);

    expect(result).toBe(expectedText);
    expect(Tesseract.recognize).toHaveBeenCalledWith(imageBuffer, 'eng');
  });

  it('should throw an error if OCR processing fails', async () => {
    const imageBuffer = Buffer.from('fake-image-data');
    const errorMessage = 'OCR failed';
    (Tesseract.recognize as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await expect(ocrService.extractTextFromImage(imageBuffer)).rejects.toThrow(
      'Failed to extract text from image.'
    );
  });
});
