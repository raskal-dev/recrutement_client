import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { CardHoverEffect } from '@/components/magic/CardHoverEffect'
import { GlowCard } from '@/components/magic/GlowCard'
import { AnimatedGradient } from '@/components/magic/AnimatedGradient'
import {
  ArrowLeft,
  Sparkles,
  FileText,
  Brain,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Briefcase,
  Upload,
  X,
  File,
} from 'lucide-react'
import { analyzeCV } from '@/lib/ai'
import { useToast } from '@/components/ui/use-toast'
import { extractTextFromFile } from '@/utils/fileExtractor'

export default function AIAnalyzeCV() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [cvText, setCvText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = async (file: File) => {
    if (!file) return

    // Vérifier le type de fichier
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ]
    const validExtensions = ['.pdf', '.docx', '.txt']
    const fileName = file.name.toLowerCase()

    if (
      !validTypes.includes(file.type) &&
      !validExtensions.some((ext) => fileName.endsWith(ext))
    ) {
      toast({
        title: 'Format non supporté',
        description: 'Veuillez sélectionner un fichier PDF, DOCX ou TXT',
        variant: 'destructive',
      })
      return
    }

    // Vérifier la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Fichier trop volumineux',
        description: 'Le fichier ne doit pas dépasser 10MB',
        variant: 'destructive',
      })
      return
    }

    try {
      setExtracting(true)
      setUploadedFile(file)
      const result = await extractTextFromFile(file)
      setCvText(result.text)
      toast({
        title: 'Fichier chargé',
        description: `Texte extrait de ${result.fileName} (${result.text.length} caractères)`,
      })
    } catch (error: any) {
      toast({
        title: 'Erreur d\'extraction',
        description: error?.message || 'Impossible d\'extraire le texte du fichier',
        variant: 'destructive',
      })
      setUploadedFile(null)
    } finally {
      setExtracting(false)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setCvText('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleAnalyze = async () => {
    if (!cvText.trim()) {
      toast({
        title: 'CV requis',
        description: 'Veuillez télécharger un fichier CV ou entrer le contenu',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)
      const result = await analyzeCV(cvText, jobDescription || undefined)
      setAnalysis(result.content)
      toast({
        title: 'Analyse terminée',
        description: 'Votre CV a été analysé avec succès.',
      })
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error?.message || 'Impossible d\'analyser le CV',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 relative">
      <AnimatedGradient />
      <div className="container mx-auto max-w-4xl px-4 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Retour
          </Button>
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-6 h-6 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Analyse de CV avec IA
            </h1>
          </div>
          <p className="text-muted-foreground">
            Obtenez des suggestions personnalisées pour améliorer votre CV
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            <CardHoverEffect>
              <GlowCard className="p-6">
                <Label htmlFor="cv" className="text-base font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Télécharger votre CV *
                </Label>

                {!uploadedFile ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                      isDragging
                        ? 'border-primary bg-primary/5 scale-[1.02]'
                        : 'border-input hover:border-primary/50 hover:bg-primary/5'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="cv"
                      accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    {extracting ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground">
                          Extraction du texte en cours...
                        </p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
                        <p className="text-sm font-medium mb-2">
                          Glissez-déposez votre CV ici
                        </p>
                        <p className="text-xs text-muted-foreground mb-4">
                          ou
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="group"
                        >
                          <File className="w-4 h-4 mr-2" />
                          Sélectionner un fichier
                        </Button>
                        <p className="text-xs text-muted-foreground mt-4">
                          Formats acceptés: PDF, DOCX, TXT (max 10MB)
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-primary/20 bg-primary/5">
                      <div className="flex items-center gap-3">
                        <File className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{uploadedFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(uploadedFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFile}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Contenu extrait ({cvText.length} caractères)
                      </Label>
                      <textarea
                        rows={8}
                        value={cvText}
                        onChange={(e) => setCvText(e.target.value)}
                        placeholder="Le contenu extrait apparaîtra ici. Vous pouvez le modifier si nécessaire."
                        className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      />
                    </div>
                  </div>
                )}
              </GlowCard>
            </CardHoverEffect>

            <CardHoverEffect>
              <GlowCard className="p-6">
                <Label htmlFor="job" className="text-base font-semibold mb-3 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Description de poste (optionnel)
                </Label>
                <textarea
                  id="job"
                  rows={6}
                  placeholder="Collez ici la description d'un poste pour une analyse comparative..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  L'analyse comparera votre CV avec cette description pour des suggestions ciblées
                </p>
              </GlowCard>
            </CardHoverEffect>

            <Button
              onClick={handleAnalyze}
              disabled={loading || !cvText.trim()}
              size="lg"
              className="w-full group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                    Analyser mon CV
                  </>
                )}
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </Button>
          </div>

          {/* Results Section */}
          <div>
            <CardHoverEffect>
              <GlowCard className="p-6 min-h-[500px]">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">Résultats de l'analyse</h2>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full py-20">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                    <p className="text-muted-foreground">Analyse en cours...</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      L'IA examine votre CV et génère des recommandations
                    </p>
                  </div>
                ) : analysis ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="prose prose-sm max-w-none"
                  >
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold mb-2">Analyse complète</h3>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">
                            {analysis}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Remplissez votre CV et cliquez sur "Analyser" pour obtenir des recommandations
                    </p>
                  </div>
                )}
              </GlowCard>
            </CardHoverEffect>
          </div>
        </div>
      </div>
    </div>
  )
}

