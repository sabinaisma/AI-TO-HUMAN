import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF worker
// Note: In a real production build, this should be handled by the bundler.
// For this environment, we point to a CDN.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

export const extractTextFromFile = async (file: File): Promise<string> => {
  const fileType = file.name.split('.').pop()?.toLowerCase();

  switch (fileType) {
    case 'pdf':
      return await extractPdfText(file);
    case 'docx':
      return await extractDocxText(file);
    case 'txt':
    case 'md':
      return await file.text();
    default:
      throw new Error('Unsupported file type. Please upload PDF, DOCX, TXT, or MD.');
  }
};

const extractDocxText = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};

const extractPdfText = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n\n';
  }
  
  return fullText;
};