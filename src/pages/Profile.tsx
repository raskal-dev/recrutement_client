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
  Sparkles
} from 'lucide-react'
import api from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { useAuthStore } from '@/store/useAuthStore'

interface Competence {
  id: number
  name: string
}

interface Experience {
  id: number
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
  const { user: authUser, setUser } = useAuthStore()
  const { toast } = useToast()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [competences, setCompetences] = useState<Competence[]>([])
  const [availableCompetences, setAvailableCompetences] = useState<Competence[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [showAddCompetence, setShowAddCompetence] = useState(false)
  const [selectedCompetences, setSelectedCompetences] = useState<number[]>([])

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
      setProfile(res.data.data)
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 relative">
      <AnimatedGradient />
      <div className="container mx-auto max-w-6xl px-4 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Mon Profil
            </h1>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar - Info principale */}
          <div className="md:col-span-1 space-y-6">
            <GlowCard className="p-6 text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage src="" />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {profile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold mb-2">{profile.name}</h2>
              <Badge variant="secondary" className="mb-4">
                {profile.role === 'student' ? 'Candidat' : profile.role === 'entreprise' ? 'Recruteur' : 'Admin'}
              </Badge>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 justify-center">
                  <Mail className="w-4 h-4" />
                  <span>{profile.email}</span>
                </div>
                {profile.adress && (
                  <div className="flex items-center gap-2 justify-center">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.adress}</span>
                  </div>
                )}
              </div>
            </GlowCard>

            {/* Compétences */}
            <GlowCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Compétences
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowAddCompetence(!showAddCompetence)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {showAddCompetence && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-4 space-y-2"
                >
                  <div className="flex flex-wrap gap-2">
                    {availableCompetences
                      .filter(c => !competences.find(uc => uc.id === c.id))
                      .map(comp => (
                        <Badge
                          key={comp.id}
                          variant={selectedCompetences.includes(comp.id) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            setSelectedCompetences(prev =>
                              prev.includes(comp.id)
                                ? prev.filter(id => id !== comp.id)
                                : [...prev, comp.id]
                            )
                          }}
                        >
                          {comp.name}
                        </Badge>
                      ))}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddCompetences}>
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

              <div className="flex flex-wrap gap-2">
                {competences.length > 0 ? (
                  competences.map(comp => (
                    <Badge key={comp.id} variant="secondary">
                      {comp.name}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Aucune compétence ajoutée</p>
                )}
              </div>
            </GlowCard>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Informations personnelles */}
            <CardHoverEffect>
              <GlowCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Informations personnelles
                  </h3>
                  {!isEditing && (
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Nom complet</label>
                      <Input {...register('name')} />
                      {errors.name && (
                        <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Email</label>
                      <Input type="email" {...register('email')} />
                      {errors.email && (
                        <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">À propos</label>
                      <Input {...register('about')} placeholder="Parlez-nous de vous..." />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Adresse</label>
                      <Input {...register('adress')} placeholder="Ville, Pays" />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit">
                        <Save className="w-4 h-4 mr-2" />
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
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Nom complet</label>
                      <p className="text-base font-medium">{profile.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Email</label>
                      <p className="text-base font-medium">{profile.email}</p>
                    </div>
                    {profile.about && (
                      <div>
                        <label className="text-sm text-muted-foreground">À propos</label>
                        <p className="text-base">{profile.about}</p>
                      </div>
                    )}
                    {profile.adress && (
                      <div>
                        <label className="text-sm text-muted-foreground">Adresse</label>
                        <p className="text-base">{profile.adress}</p>
                      </div>
                    )}
                  </div>
                )}
              </GlowCard>
            </CardHoverEffect>

            {/* Expériences */}
            <CardHoverEffect>
              <GlowCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Expériences professionnelles
                  </h3>
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                </div>

                {profile.Experiences && profile.Experiences.length > 0 ? (
                  <div className="space-y-4">
                    {profile.Experiences.map(exp => (
                      <div
                        key={exp.id}
                        className="p-4 rounded-lg border border-border bg-muted/30"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{exp.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{exp.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>
                                {new Date(exp.startDate).toLocaleDateString('fr-FR', {
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                              <span>-</span>
                              <span>
                                {new Date(exp.endDate).toLocaleDateString('fr-FR', {
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Aucune expérience ajoutée
                  </p>
                )}
              </GlowCard>
            </CardHoverEffect>
          </div>
        </div>
      </div>
    </div>
  )
}

