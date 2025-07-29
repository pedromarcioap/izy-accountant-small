import { Request, Response } from 'express';
import { OcrService } from '../ocr/ocr.service';

export class UploadController {
  constructor(private readonly ocrService: OcrService) {}

  async uploadAndExtract(req: Request, res: Response) {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({ error: 'No files were uploaded.' });
    }

    const files = req.files as Express.Multer.File[];
    const extractedData = [];

    try {
      for (const file of files) {
        const text = await this.ocrService.extractTextFromImage(file.buffer);
        extractedData.push({
          fileName: file.originalname,
          text: text,
        });
      }
      res.status(200).json(extractedData);
    } catch (error) {
      console.error('Error processing uploaded files:', error);
      res.status(500).json({ error: 'Failed to process uploaded files.' });
    }
  }
}
