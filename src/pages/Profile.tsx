import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CardHoverEffect } from '@/components/magic/CardHoverEffect'
import { GlowCard } from '@/components/magic/GlowCard'
import { AnimatedGradient } from '@/components/magic/AnimatedGradient'
import { ExperienceForm } from '@/components/experiences/ExperienceForm'
import {
  User,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Sparkles,
  Brain,
  ArrowLeft,
  CheckCircle2,
  Award,
  Star,
  UserCircle,
  FileText,
} from 'lucide-react'
import api from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { useAuthStore } from '@/store/useAuthStore'
import { useNavigate } from 'react-router-dom'

interface Competence {
  id: string
  name: string
}

interface Experience {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
}

interface UserProfile {
  id: string
  name: string
  email: string
  about?: string
  adress?: string
  role: string
  Competences?: Competence[]
  Experiences?: Experience[]
}

const profileSchema = z.object({
  name: z.string().min(2, 'Nom trop court'),
  email: z.string().email('Email invalide'),
  about: z.string().optional(),
  adress: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function Profile() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const { toast } = useToast()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [competences, setCompetences] = useState<Competence[]>([])
  const [availableCompetences, setAvailableCompetences] = useState<Competence[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [showAddCompetence, setShowAddCompetence] = useState(false)
  const [selectedCompetences, setSelectedCompetences] = useState<string[]>([])
  const [showExperienceForm, setShowExperienceForm] = useState(false)
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null)
  const [experienceLoading, setExperienceLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    loadProfile()
    loadCompetences()
  }, [])

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        email: profile.email,
        about: profile.about || '',
        adress: profile.adress || '',
      })
      if (profile.Competences) {
        setCompetences(profile.Competences)
      }
    }
  }, [profile, reset])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const res = await api.get('/users/profile')
      const profileData = res.data.data
      setProfile(profileData)
      
      // Les expériences et compétences sont maintenant incluses dans le profil depuis le backend
      // Pas besoin de setExperiences car elles sont dans profile.Experiences
      if (profileData.Competences) {
        setCompetences(profileData.Competences)
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error?.response?.data?.message || 'Impossible de charger le profil',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const loadCompetences = async () => {
    try {
      const res = await api.get('/competences')
      setAvailableCompetences(res.data.data || [])
    } catch (error: any) {
      console.error('Erreur lors du chargement des compétences:', error)
    }
  }

  const onSubmit = async (data: ProfileFormValues) => {
    if (!profile) return

    try {
      const res = await api.put(`/users/${profile.id}`, data)
      setProfile(res.data.data)
      setUser(res.data.data)
      setIsEditing(false)
      toast({
        title: 'Profil mis à jour',
        description: 'Vos informations ont été modifiées avec succès.',
      })
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error?.response?.data?.message || 'Impossible de mettre à jour le profil',
        variant: 'destructive',
      })
    }
  }

  const handleAddCompetences = async () => {
    if (selectedCompetences.length === 0) return

    try {
      await api.post('/users/competences', {
        competenceIds: selectedCompetences,
      })
      await loadProfile()
      setShowAddCompetence(false)
      setSelectedCompetences([])
      toast({
        title: 'Compétences ajoutées',
        description: 'Vos compétences ont été mises à jour.',
      })
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error?.response?.data?.message || 'Impossible d\'ajouter les compétences',
        variant: 'destructive',
      })
    }
  }

  const handleExperienceSubmit = async (data: {
    title: string
    description: string
    startDate: string
    endDate: string
  }) => {
    try {
      setExperienceLoading(true)
      if (editingExperience) {
        // TODO: Implémenter la modification quand l'endpoint sera disponible
        toast({
          title: 'Modification',
          description: 'La modification des expériences sera bientôt disponible.',
        })
      } else {
        await api.post('/experiences', data)
        await loadProfile()
        setShowExperienceForm(false)
        setEditingExperience(null)
        toast({
          title: 'Expérience ajoutée',
          description: 'Votre expérience a été ajoutée avec succès.',
        })
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error?.response?.data?.message || 'Impossible d\'ajouter l\'expérience',
        variant: 'destructive',
      })
    } finally {
      setExperienceLoading(false)
    }
  }

  const handleDeleteExperience = async (experienceId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette expérience ?')) return

    try {
      await api.delete(`/experiences/${experienceId}`)
      await loadProfile()
      toast({
        title: 'Expérience supprimée',
        description: 'Votre expérience a été supprimée avec succès.',
      })
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error?.response?.data?.message || 'Impossible de supprimer l\'expérience',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Chargement du profil...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Profil non trouvé</div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="absolute inset-0 z-0 opacity-20">
        <AnimatedGradient />
      </div>
      <div className="container mx-auto max-w-7xl px-4 py-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <Sparkles className="w-8 h-8 text-primary" />
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-foreground">
                Mon Profil
              </h1>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar - Info principale */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <GlowCard className="p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                    <Avatar className="w-32 h-32 mx-auto relative border-4 border-primary/20">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-4xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold">
                        {profile.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </motion.div>
                <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  {profile.name}
                </h2>
                <Badge 
                  variant="secondary" 
                  className="mb-6 px-4 py-1.5 text-sm font-medium"
                >
                  <Award className="w-3 h-3 mr-1.5" />
                  {profile.role === 'student' ? 'Candidat' : profile.role === 'entreprise' ? 'Recruteur' : 'Admin'}
                </Badge>
                <div className="space-y-3 text-sm">
                  <motion.div 
                    className="flex items-center gap-2 justify-center text-muted-foreground hover:text-foreground transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    <Mail className="w-4 h-4" />
                    <span className="break-all">{profile.email}</span>
                  </motion.div>
                  {profile.adress && (
                    <motion.div 
                      className="flex items-center gap-2 justify-center text-muted-foreground hover:text-foreground transition-colors"
                      whileHover={{ x: 5 }}
                    >
                      <MapPin className="w-4 h-4" />
                      <span>{profile.adress}</span>
                    </motion.div>
                  )}
                </div>
              </GlowCard>
            </motion.div>

            {/* Compétences */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <GlowCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    Compétences
                  </h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowAddCompetence(!showAddCompetence)}
                    className="hover:bg-primary/10"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {showAddCompetence && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-4 rounded-lg bg-muted/50 border border-border space-y-4"
                  >
                    <p className="text-sm font-medium text-muted-foreground">Sélectionnez les compétences à ajouter :</p>
                    <div className="flex flex-wrap gap-2">
                      {availableCompetences
                        .filter(c => !competences.find(uc => uc.id === c.id))
                        .map(comp => (
                          <motion.div
                            key={comp.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Badge
                              variant={selectedCompetences.includes(comp.id) ? 'default' : 'outline'}
                              className="cursor-pointer px-3 py-1.5 text-sm transition-all hover:bg-primary/10"
                              onClick={() => {
                                setSelectedCompetences(prev =>
                                  prev.includes(comp.id)
                                    ? prev.filter(id => id !== comp.id)
                                    : [...prev, comp.id]
                                )
                              }}
                            >
                              {selectedCompetences.includes(comp.id) && (
                                <CheckCircle2 className="w-3 h-3 mr-1.5" />
                              )}
                              {comp.name}
                            </Badge>
                          </motion.div>
                        ))}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" onClick={handleAddCompetences} className="flex-1">
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowAddCompetence(false)
                          setSelectedCompetences([])
                        }}
                      >
                        Annuler
                      </Button>
                    </div>
                  </motion.div>
                )}

                <div className="flex flex-wrap gap-2 min-h-[40px]">
                  {competences.length > 0 ? (
                    competences.map((comp, index) => (
                      <motion.div
                        key={comp.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <Badge 
                          variant="secondary" 
                          className="px-3 py-1.5 text-sm font-medium bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
                        >
                          <Star className="w-3 h-3 mr-1.5" />
                          {comp.name}
                        </Badge>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic w-full text-center py-2">
                      Aucune compétence ajoutée
                    </p>
                  )}
                </div>
              </GlowCard>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations personnelles */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <CardHoverEffect>
                <GlowCard className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-semibold flex items-center gap-3">
                      <motion.div 
                        className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <UserCircle className="w-6 h-6 text-primary" />
                      </motion.div>
                      <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                        Informations personnelles
                      </span>
                    </h3>
                    {!isEditing && (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setIsEditing(true)}
                          className="hover:bg-primary/10 hover:border-primary/30 transition-all"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </Button>
                      </motion.div>
                    )}
                  </div>

                {isEditing ? (
                  <motion.form 
                    onSubmit={handleSubmit(onSubmit)} 
                    className="space-y-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" />
                          Nom complet
                        </label>
                        <Input {...register('name')} className="h-11" />
                        {errors.name && (
                          <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                            <X className="w-3 h-3" />
                            {errors.name.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                          <Mail className="w-4 h-4 text-primary" />
                          Email
                        </label>
                        <Input type="email" {...register('email')} className="h-11" />
                        {errors.email && (
                          <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                            <X className="w-3 h-3" />
                            {errors.email.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          À propos
                        </label>
                        <Input {...register('about')} placeholder="Parlez-nous de vous..." className="h-11" />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          Adresse
                        </label>
                        <Input {...register('adress')} placeholder="Ville, Pays" className="h-11" />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-border">
                      <Button type="submit" className="flex-1 group">
                        <Save className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                        Enregistrer
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false)
                          reset()
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Annuler
                      </Button>
                    </div>
                  </motion.form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nom complet */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="group relative p-5 rounded-xl border border-border bg-gradient-to-br from-card to-muted/30 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5"
                    >
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/10 border border-blue-500/20">
                          <User className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                            Nom complet
                          </p>
                          <p className="text-lg font-bold text-foreground truncate group-hover:text-primary transition-colors">
                            {profile.name}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Email */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      whileHover={{ scale: 1.02 }}
                      className="group relative p-5 rounded-xl border border-border bg-gradient-to-br from-card to-muted/30 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5"
                    >
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/10 border border-purple-500/20">
                          <Mail className="w-5 h-5 text-purple-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                            Email
                          </p>
                          <p className="text-lg font-bold text-foreground break-all group-hover:text-primary transition-colors">
                            {profile.email}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* À propos */}
                    {profile.about && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ scale: 1.02 }}
                        className="group relative p-5 rounded-xl border border-border bg-gradient-to-br from-card to-muted/30 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5 md:col-span-2"
                      >
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-lg bg-gradient-to-br from-green-500/20 to-green-500/10 border border-green-500/20">
                            <FileText className="w-5 h-5 text-green-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                              À propos
                            </p>
                            <p className="text-base text-foreground leading-relaxed group-hover:text-primary/90 transition-colors">
                              {profile.about}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Adresse */}
                    {profile.adress && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ scale: 1.02 }}
                        className="group relative p-5 rounded-xl border border-border bg-gradient-to-br from-card to-muted/30 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5 md:col-span-2"
                      >
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-500/10 border border-orange-500/20">
                            <MapPin className="w-5 h-5 text-orange-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                              Adresse
                            </p>
                            <p className="text-lg font-bold text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                              <MapPin className="w-4 h-4 text-primary opacity-60" />
                              {profile.adress}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </GlowCard>
            </CardHoverEffect>
            </motion.div>

            {/* IA Tools */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <CardHoverEffect>
                <GlowCard className="p-6 bg-gradient-to-br from-primary/5 to-primary/0 border-primary/20">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Brain className="w-5 h-5 text-primary" />
                    </div>
                    Outils IA
                  </h3>
                  <Button
                    variant="outline"
                    className="w-full justify-start group hover:bg-primary/10 hover:border-primary/30 transition-all"
                    onClick={() => navigate('/ai/analyze-cv')}
                  >
                    <Brain className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                    Analyser mon CV
                    <Sparkles className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </GlowCard>
              </CardHoverEffect>
            </motion.div>

            {/* Expériences */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <CardHoverEffect>
                <GlowCard className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      Expériences professionnelles
                    </h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingExperience(null)
                        setShowExperienceForm(true)
                      }}
                      className="hover:bg-primary/10"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter
                    </Button>
                  </div>

                  {profile.Experiences && profile.Experiences.length > 0 ? (
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent" />
                      
                      <div className="space-y-6">
                        {profile.Experiences.map((exp, index) => (
                          <motion.div
                            key={exp.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative pl-12"
                          >
                            {/* Timeline dot */}
                            <div className="absolute left-0 top-2 w-8 h-8 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            </div>
                            
                            <div className="group relative p-5 rounded-xl border border-border bg-card hover:bg-muted/50 transition-all hover:shadow-lg hover:shadow-primary/5">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-2">
                                  <h4 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                                    {exp.title}
                                  </h4>
                                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                    {exp.description}
                                  </p>
                                  <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground pt-2">
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(exp.startDate).toLocaleDateString('fr-FR', {
                                        month: 'short',
                                        year: 'numeric',
                                      })}
                                    </div>
                                    <span className="text-primary">→</span>
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(exp.endDate).toLocaleDateString('fr-FR', {
                                        month: 'short',
                                        year: 'numeric',
                                      })}
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteExperience(exp.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                        <Calendar className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">
                        Aucune expérience ajoutée
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Cliquez sur "Ajouter" pour commencer
                      </p>
                    </div>
                  )}
                </GlowCard>
              </CardHoverEffect>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Experience Form Dialog */}
      <ExperienceForm
        open={showExperienceForm}
        onOpenChange={setShowExperienceForm}
        onSubmit={handleExperienceSubmit}
        defaultValues={editingExperience ? {
          title: editingExperience.title,
          description: editingExperience.description,
          startDate: editingExperience.startDate.split('T')[0],
          endDate: editingExperience.endDate.split('T')[0],
        } : undefined}
        loading={experienceLoading}
      />
    </div>
  )
}

