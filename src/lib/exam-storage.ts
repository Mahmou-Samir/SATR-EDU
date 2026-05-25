import fs from "fs/promises";
import path from "path";

const UPLOAD_ROOT = path.join(/* turbopackIgnore: true */ process.cwd(), "uploads", "exams");

const MAX_PDF_BYTES = 12 * 1024 * 1024;

export function validatePdfFile(file: File | null): { ok: true } | { ok: false; error: string } {
  if (!file) {
    return { ok: false, error: "PDF file is required" };
  }
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return { ok: false, error: "Only PDF files are allowed" };
  }
  if (file.size > MAX_PDF_BYTES) {
    return { ok: false, error: "PDF must be 12 MB or smaller" };
  }
  return { ok: true };
}

export async function saveExamPdf(teacherId: string, examId: string, buffer: Buffer): Promise<string> {
  const dir = path.join(UPLOAD_ROOT, teacherId);
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${examId}.pdf`);
  await fs.writeFile(filePath, buffer);
  return path.relative(process.cwd(), filePath).replace(/\\/g, "/");
}

export async function deleteExamPdf(relativePath?: string | null): Promise<void> {
  if (!relativePath) return;
  const fullPath = path.join(/* turbopackIgnore: true */ process.cwd(), relativePath);
  try {
    await fs.unlink(fullPath);
  } catch {
    // ignore missing files
  }
}

export async function readExamPdf(relativePath: string): Promise<Buffer> {
  const fullPath = path.join(/* turbopackIgnore: true */ process.cwd(), relativePath);
  return fs.readFile(fullPath);
}
