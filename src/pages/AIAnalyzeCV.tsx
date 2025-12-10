import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
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
  Sparkles as SparklesIcon,
} from 'lucide-react'
import { analyzeCV, extractTextFromFile } from '@/lib/ai'
import { useToast } from '@/components/ui/use-toast'
import { useAuthStore } from '@/store/useAuthStore'
import api from '@/lib/api'

export default function AIAnalyzeCV() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [cvText, setCvText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [profileCompetences, setProfileCompetences] = useState<{ id: string; name: string }[]>([])
  const [availableCompetences, setAvailableCompetences] = useState<{ id: string; name: string }[]>([])
  const [suggestedCompetences, setSuggestedCompetences] = useState<{ id: string; name: string }[]>([])
  const [addingCompetences, setAddingCompetences] = useState(false)
  const [ownershipVerified, setOwnershipVerified] = useState(true)
  const [ownershipMessage, setOwnershipMessage] = useState<string | null>(null)
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get('/users/profile')
        const data = res.data.data
        setProfileCompetences(data?.Competences || [])
      } catch (error: any) {
        console.error('Erreur profil', error)
      }
    }

    const loadCompetences = async () => {
      try {
        const res = await api.get('/competences')
        setAvailableCompetences(res.data.data || [])
      } catch (error: any) {
        console.error('Erreur competences', error)
      }
    }

    loadProfile()
    loadCompetences()
  }, [])

  const lowerCvText = useMemo(() => cvText.toLowerCase(), [cvText])

  const verifyOwnership = (text: string) => {
    if (!user) {
      setOwnershipVerified(true)
      setOwnershipMessage(null)
      return
    }
    const emailMatch = user.email && text.toLowerCase().includes(user.email.toLowerCase())
    const nameMatch = user.name && text.toLowerCase().includes(user.name.toLowerCase())
    const ok = emailMatch || nameMatch
    setOwnershipVerified(ok)
    setOwnershipMessage(
      ok
        ? null
        : "Le CV importé ne semble pas correspondre à votre compte (nom ou email introuvable)."
    )
    if (!ok) {
      toast({
        title: 'Vérification du CV',
        description:
          'Nom ou email du CV introuvable. Veuillez vérifier que ce CV est bien le vôtre.',
        variant: 'destructive',
      })
    }
  }

  const computeSuggestedCompetences = (text: string) => {
    if (!text) {
      setSuggestedCompetences([])
      return
    }
    const lower = text.toLowerCase()
    const ownedIds = new Set(profileCompetences.map((c) => c.id))
    const found: { id: string; name: string }[] = []
    availableCompetences.forEach((comp) => {
      const nameLower = comp.name.toLowerCase()
      if (lower.includes(nameLower) && !ownedIds.has(comp.id)) {
        found.push(comp)
      }
    })
    setSuggestedCompetences(found)
  }

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
      const extracted = result?.data
      setCvText(extracted?.text || '')
      verifyOwnership(extracted?.text || '')
      computeSuggestedCompetences(extracted?.text || '')
      toast({
        title: 'Fichier chargé',
        description: `Texte extrait de ${extracted?.file_name ?? 'fichier'} (${extracted?.character_count ?? 0} caractères)`,
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
    setSuggestedCompetences([])
    setOwnershipVerified(true)
    setOwnershipMessage(null)
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
    if (!ownershipVerified) {
      toast({
        title: 'Vérification requise',
        description: 'Le CV ne correspond pas à votre compte (nom/email manquant).',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)
      const result = await analyzeCV(cvText, jobDescription || undefined)
      setAnalysis(result?.data?.content || '')
      toast({
        title: 'Analyse terminée',
        description: 'Votre CV a été analysé avec succès.',
      })
      if ((result?.data?.content || '').length > 0) {
        setShowAnalysisModal(true)
      }
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
    <>
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

            <div className="space-y-3">
              {!ownershipVerified && ownershipMessage && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {ownershipMessage}
                </div>
              )}
              <Button
                onClick={handleAnalyze}
                disabled={loading || !cvText.trim() || !ownershipVerified}
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
                    className="space-y-4"
                  >
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="space-y-2 w-full">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold">Analyse complète</h3>
                            <Button variant="outline" size="sm" onClick={() => setShowAnalysisModal(true)}>
                              Voir en grand
                            </Button>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-2 max-h-56 overflow-y-auto pr-1">
                            {analysis.split('\n').map((line, idx) => {
                              const trimmed = line.trim()
                              if (!trimmed) return null
                              const isBullet = trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('•')
                              return isBullet ? (
                                <div key={idx} className="flex items-start gap-2">
                                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/70" />
                                  <span>{trimmed.replace(/^[-*•]\s*/, '')}</span>
                                </div>
                              ) : (
                                <p key={idx} className="leading-relaxed">
                                  {trimmed}
                                </p>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {suggestedCompetences.length > 0 && (
                      <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <SparklesIcon className="w-4 h-4 text-primary" />
                            <h4 className="font-semibold">Compétences détectées manquantes</h4>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setShowSuggestionsModal(true)}>
                            Voir les suggestions
                          </Button>
                        </div>
                      </div>
                    )}
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

      <Dialog open={showAnalysisModal} onOpenChange={setShowAnalysisModal}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Résultat de l'analyse</DialogTitle>
          <DialogDescription>
            Analyse complète générée par l'IA sur votre CV
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto pr-2 space-y-2 max-h-[60vh]">
          {analysis &&
            analysis.split('\n').map((line, idx) => {
              const trimmed = line.trim()
              if (!trimmed) return null
              const isBullet = trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('•')
              return isBullet ? (
                <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/70" />
                  <span>{trimmed.replace(/^[-*•]\s*/, '')}</span>
                </div>
              ) : (
                <p key={idx} className="text-sm leading-relaxed text-muted-foreground">
                  {trimmed}
                </p>
              )
            })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowAnalysisModal(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

      <Dialog open={showSuggestionsModal} onOpenChange={setShowSuggestionsModal}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Compétences détectées dans le CV</DialogTitle>
          <DialogDescription>
            Ces compétences apparaissent dans le CV mais pas encore dans votre profil.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {suggestedCompetences.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucune compétence manquante détectée.</p>
          )}
          {suggestedCompetences.length > 0 && (
            <>
              <div className="flex flex-wrap gap-2">
                {suggestedCompetences.map((comp) => (
                  <Badge key={comp.id} variant="secondary">
                    {comp.name}
                  </Badge>
                ))}
              </div>
              <Button
                className="w-full"
                onClick={async () => {
                  try {
                    setAddingCompetences(true)
                    await api.post('/users/competences', {
                      competenceIds: suggestedCompetences.map((c) => c.id),
                    })
                    toast({
                      title: 'Compétences ajoutées',
                      description: 'Les compétences détectées ont été ajoutées à votre profil.',
                    })
                    setSuggestedCompetences([])
                  } catch (error: any) {
                    toast({
                      title: 'Erreur',
                      description:
                        error?.response?.data?.message ||
                        'Impossible d\'ajouter les compétences détectées',
                      variant: 'destructive',
                    })
                  } finally {
                    setAddingCompetences(false)
                  }
                }}
                disabled={addingCompetences || suggestedCompetences.length === 0}
              >
                {addingCompetences ? 'Ajout...' : 'Ajouter toutes les compétences détectées'}
              </Button>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowSuggestionsModal(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}

