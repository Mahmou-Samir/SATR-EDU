import { extractTextFromPdf } from "@/lib/pdf-text";
import { generateExamFromContent } from "@/lib/exam-ai-generator";
import { isOpenAIConfigured } from "@/lib/openai-client";
import type { ExamQuestion } from "@/lib/exam-types";

export type ExamGenerationResult = {
  questions: ExamQuestion[];
  sourceText: string;
  ocrUsed: boolean;
  aiGenerated: true;
};

export async function buildExamFromPdf(
  pdfBuffer: Buffer,
  pdfName: string,
  title: string,
  questionCount = 10
): Promise<ExamGenerationResult> {
  if (!isOpenAIConfigured()) {
    throw new Error("OPENAI_API_KEY is required for AI exam generation");
  }

  let extractedText = "";
  try {
    extractedText = await extractTextFromPdf(pdfBuffer);
  } catch (err) {
    console.warn("PDF text extraction failed, will use AI OCR:", err);
  }

  const result = await generateExamFromContent({
    title,
    text: extractedText,
    pdfBuffer,
    pdfName,
    questionCount,
  });

  return {
    questions: result.questions,
    sourceText: result.sourceText || extractedText.slice(0, 400),
    ocrUsed: result.ocrUsed,
    aiGenerated: true,
  };
}
