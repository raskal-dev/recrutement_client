import { useState } from 'react'
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
} from 'lucide-react'
import { analyzeCV } from '@/lib/ai'
import { useToast } from '@/components/ui/use-toast'

export default function AIAnalyzeCV() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [cvText, setCvText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!cvText.trim()) {
      toast({
        title: 'CV requis',
        description: 'Veuillez coller le contenu de votre CV',
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
                  Contenu de votre CV *
                </Label>
                <textarea
                  id="cv"
                  rows={12}
                  placeholder="Collez ici le contenu de votre CV (expériences, compétences, formations, etc.)"
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {cvText.length} caractères
                </p>
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

