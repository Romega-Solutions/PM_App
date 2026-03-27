import * as ImageManipulator from "expo-image-manipulator";

export type OCRResult = {
  firstName?: string;
  lastName?: string;
  birthDate?: string; // format: YYYY-MM-DD or raw extracted
  fullText: string;
};

/**
 * Mock OCR — extracts text from an image URI.
 * Replace with real OCR (Google Vision, AWS Textract, Tesseract.js on web, etc.)
 */
export async function extractTextFromImage(uri: string): Promise<OCRResult> {
  // Simulate processing delay
  await new Promise((r) => setTimeout(r, 1500));

  // Mock extracted text (you can replace with real OCR SDK)
  const mockExtractedText = `
    DRIVER LICENSE
    First Name: MARIA
    Last Name: SANTOS
    Date of Birth: 2004-03-15
    ID: 123456789
  `;

  // Simple regex-based extraction (replace with robust parser)
  const firstNameMatch = mockExtractedText.match(/First Name:\s*(\w+)/i);
  const lastNameMatch = mockExtractedText.match(/Last Name:\s*(\w+)/i);
  const dobMatch = mockExtractedText.match(
    /Date of Birth:\s*(\d{4}-\d{2}-\d{2})/i
  );

  return {
    firstName: firstNameMatch?.[1]?.trim(),
    lastName: lastNameMatch?.[1]?.trim(),
    birthDate: dobMatch?.[1]?.trim(),
    fullText: mockExtractedText.trim(),
  };
}

/**
 * Calculate age from birthdate string (YYYY-MM-DD)
 */
export function calculateAge(birthDateString: string): number | null {
  const match = birthDateString.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const [, year, month, day] = match;
  const birthDate = new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10)
  );
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}