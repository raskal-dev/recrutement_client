import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CardHoverEffect } from '@/components/magic/CardHoverEffect'
import { GlowCard } from '@/components/magic/GlowCard'
import { AnimatedGradient } from '@/components/magic/AnimatedGradient'
import {
  ArrowLeft,
  Sparkles,
  Briefcase,
  MapPin,
  DollarSign,
  FileText,
  Send,
  Zap,
} from 'lucide-react'
import api from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { chatWithAI, generateJobDescription } from '@/lib/ai'

const offerSchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
  description: z.string().min(50, 'La description doit contenir au moins 50 caractères'),
  salary: z.string().min(1, 'Le salaire est requis'),
  localisation: z.string().min(2, 'La localisation est requise'),
  contract: z.string().min(1, 'Le type de contrat est requis'),
})

type OfferFormValues = z.infer<typeof offerSchema>

export default function CreateOffer() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [requirements, setRequirements] = useState('')
  const [skills, setSkills] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
  })

  const watchedTitle = watch('title')
  const watchedDescription = watch('description')

  const handleGenerateWithAI = async () => {
    if (!watchedTitle || !requirements || !skills) {
      toast({
        title: 'Informations manquantes',
        description: 'Veuillez remplir le titre, les exigences et les compétences',
        variant: 'destructive',
      })
      return
    }

    try {
      setAiLoading(true)
      const result = await generateJobDescription(
        watchedTitle,
        'Votre entreprise',
        requirements.split(',').map(r => r.trim()),
        skills.split(',').map(s => s.trim())
      )

      if (result.content) {
        setValue('description', result.content)
        toast({
          title: 'Description générée',
          description: 'L\'IA a généré une description pour votre offre.',
        })
      }
    } catch (error: any) {
      toast({
        title: 'Erreur IA',
        description: error?.message || 'Impossible de générer la description',
        variant: 'destructive',
      })
    } finally {
      setAiLoading(false)
    }
  }

  const onSubmit = async (data: OfferFormValues) => {
    try {
      setLoading(true)
      const res = await api.post('/offers', data)
      toast({
        title: 'Offre créée',
        description: 'Votre offre a été publiée avec succès.',
      })
      navigate(`/offers/${res.data.data.id}`)
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error?.response?.data?.message || 'Impossible de créer l\'offre',
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
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Créer une offre d'emploi
            </h1>
          </div>
          <p className="text-muted-foreground">
            Remplissez les informations ci-dessous pour publier votre offre
          </p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Titre */}
          <CardHoverEffect>
            <GlowCard className="p-6">
              <Label htmlFor="title" className="text-base font-semibold mb-3 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Titre du poste *
              </Label>
              <Input
                id="title"
                placeholder="Ex: Développeur Full Stack React/Node.js"
                {...register('title')}
                className="text-lg"
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-2">{errors.title.message}</p>
              )}
            </GlowCard>
          </CardHoverEffect>

          {/* Description avec IA */}
          <CardHoverEffect>
            <GlowCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Label htmlFor="description" className="text-base font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Description du poste *
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateWithAI}
                  disabled={aiLoading || !watchedTitle}
                  className="group"
                >
                  <Zap className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                  {aiLoading ? 'Génération...' : 'Générer avec IA'}
                </Button>
              </div>

              {/* Aide IA */}
              {!watchedDescription && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-4 p-4 rounded-lg bg-primary/5 border border-primary/20"
                >
                  <p className="text-sm text-muted-foreground mb-3">
                    Pour générer une description optimisée avec l'IA, remplissez :
                  </p>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="requirements" className="text-xs text-muted-foreground">
                        Exigences (séparées par des virgules)
                      </Label>
                      <Input
                        id="requirements"
                        placeholder="Ex: 3 ans d'expérience, Master en informatique..."
                        value={requirements}
                        onChange={(e) => setRequirements(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="skills" className="text-xs text-muted-foreground">
                        Compétences requises (séparées par des virgules)
                      </Label>
                      <Input
                        id="skills"
                        placeholder="Ex: React, Node.js, TypeScript, PostgreSQL..."
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <textarea
                id="description"
                rows={12}
                placeholder="Décrivez le poste, les responsabilités, les missions principales..."
                {...register('description')}
                className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-2">{errors.description.message}</p>
              )}
            </GlowCard>
          </CardHoverEffect>

          {/* Informations complémentaires */}
          <div className="grid md:grid-cols-2 gap-6">
            <CardHoverEffect>
              <GlowCard className="p-6">
                <Label htmlFor="salary" className="text-base font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Salaire *
                </Label>
                <Input
                  id="salary"
                  placeholder="Ex: 45k€ - 60k€ / an"
                  {...register('salary')}
                />
                {errors.salary && (
                  <p className="text-sm text-destructive mt-2">{errors.salary.message}</p>
                )}
              </GlowCard>
            </CardHoverEffect>

            <CardHoverEffect>
              <GlowCard className="p-6">
                <Label htmlFor="localisation" className="text-base font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Localisation *
                </Label>
                <Input
                  id="localisation"
                  placeholder="Ex: Paris, France"
                  {...register('localisation')}
                />
                {errors.localisation && (
                  <p className="text-sm text-destructive mt-2">{errors.localisation.message}</p>
                )}
              </GlowCard>
            </CardHoverEffect>
          </div>

          {/* Type de contrat */}
          <CardHoverEffect>
            <GlowCard className="p-6">
              <Label htmlFor="contract" className="text-base font-semibold mb-3 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Type de contrat *
              </Label>
              <select
                id="contract"
                {...register('contract')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Sélectionnez un type</option>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Freelance">Freelance</option>
                <option value="Stage">Stage</option>
                <option value="Alternance">Alternance</option>
                <option value="Temps partiel">Temps partiel</option>
              </select>
              {errors.contract && (
                <p className="text-sm text-destructive mt-2">{errors.contract.message}</p>
              )}
            </GlowCard>
          </CardHoverEffect>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="flex-1 group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center">
                <Send className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                {loading ? 'Publication...' : 'Publier l\'offre'}
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate(-1)}
            >
              Annuler
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

