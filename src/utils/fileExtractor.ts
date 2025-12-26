import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'

// Configuration de pdfjs-dist pour le worker
// Utilisation du worker local depuis le dossier public
if (typeof window !== 'undefined') {
  // Utiliser le worker copié dans le dossier public
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
}

export interface FileExtractionResult {
  text: string
  fileName: string
  fileType: string
}

/**
 * Extrait le texte d'un fichier PDF
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let fullText = ''

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
      fullText += pageText + '\n'
    }

    return fullText.trim()
  } catch (error) {
    throw new Error(`Erreur lors de l'extraction du texte du PDF: ${error}`)
  }
}

/**
 * Extrait le texte d'un fichier DOCX
 */
export async function extractTextFromDOCX(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return result.value.trim()
  } catch (error) {
    throw new Error(`Erreur lors de l'extraction du texte du DOCX: ${error}`)
  }
}

/**
 * Extrait le texte d'un fichier texte
 */
export async function extractTextFromText(file: File): Promise<string> {
  try {
    return await file.text()
  } catch (error) {
    throw new Error(`Erreur lors de la lecture du fichier texte: ${error}`)
  }
}

/**
 * Extrait le texte d'un fichier selon son type
 */
export async function extractTextFromFile(file: File): Promise<FileExtractionResult> {
  const fileType = file.type
  const fileName = file.name
  let text = ''

  if (fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
    text = await extractTextFromPDF(file)
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.toLowerCase().endsWith('.docx')
  ) {
    text = await extractTextFromDOCX(file)
  } else if (
    fileType === 'text/plain' ||
    fileName.toLowerCase().endsWith('.txt')
  ) {
    text = await extractTextFromText(file)
  } else {
    throw new Error(
      `Format de fichier non supporté. Formats acceptés: PDF, DOCX, TXT`
    )
  }

  if (!text || text.trim().length === 0) {
    throw new Error('Le fichier semble être vide ou ne contient pas de texte extractible')
  }

  return {
    text,
    fileName,
    fileType,
  }
}

