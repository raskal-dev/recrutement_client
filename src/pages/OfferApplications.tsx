import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CardHoverEffect } from '@/components/magic/CardHoverEffect'
import { GlowCard } from '@/components/magic/GlowCard'
import { AnimatedGradient } from '@/components/magic/AnimatedGradient'
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  User,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Loader2,
  Mail,
  MapPin,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import api from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { useAuthStore } from '@/store/useAuthStore'

interface Application {
  id: string
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  coverLetter?: string
  UserId: string
  OfferId: string
  createdAt: string
  updatedAt: string
  User?: {
    id: string
    name: string
    email: string
    about?: string
    adress?: string
  }
}

interface Offer {
  id: string
  title: string
  description: string
  salary: string
  localisation: string
  contract: string
  UserId: string
}

const statusConfig = {
  pending: {
    label: 'En attente',
    icon: Clock,
    color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    iconColor: 'text-yellow-600',
  },
  reviewed: {
    label: 'En cours d\'examen',
    icon: Eye,
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    iconColor: 'text-blue-600',
  },
  accepted: {
    label: 'Acceptée',
    icon: CheckCircle2,
    color: 'bg-green-500/10 text-green-600 border-green-500/20',
    iconColor: 'text-green-600',
  },
  rejected: {
    label: 'Refusée',
    icon: XCircle,
    color: 'bg-red-500/10 text-red-600 border-red-500/20',
    iconColor: 'text-red-600',
  },
}

export default function OfferApplications() {
  const { offerId } = useParams<{ offerId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuthStore()
  const [applications, setApplications] = useState<Application[]>([])
  const [offer, setOffer] = useState<Offer | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [expandedApplications, setExpandedApplications] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (user?.role !== 'entreprise') {
      navigate('/')
      return
    }
    if (offerId) {
      loadApplications()
      loadOffer()
    }
  }, [offerId, user])

  const loadOffer = async () => {
    if (!offerId) return
    try {
      const res = await api.get(`/offers/${offerId}`)
      setOffer(res.data.data)
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error?.response?.data?.message || 'Impossible de charger l\'offre',
        variant: 'destructive',
      })
    }
  }

  const loadApplications = async () => {
    if (!offerId) return
    try {
      setLoading(true)
      const res = await api.get(`/applications/offer/${offerId}`)
      setApplications(res.data.data || [])
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error?.response?.data?.message || 'Impossible de charger les candidatures',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (applicationId: string, status: 'pending' | 'reviewed' | 'accepted' | 'rejected') => {
    try {
      setUpdatingStatus(applicationId)
      await api.put(`/applications/${applicationId}/status`, { status })
      
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId ? { ...app, status } : app
        )
      )
      
      toast({
        title: 'Statut mis à jour',
        description: `La candidature a été ${statusConfig[status].label.toLowerCase()}`,
      })
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error?.response?.data?.message || 'Impossible de mettre à jour le statut',
        variant: 'destructive',
      })
    } finally {
      setUpdatingStatus(null)
    }
  }

  const toggleExpand = (applicationId: string) => {
    setExpandedApplications(prev => {
      const newSet = new Set(prev)
      if (newSet.has(applicationId)) {
        newSet.delete(applicationId)
      } else {
        newSet.add(applicationId)
      }
      return newSet
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Retour
              </Button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Candidatures
                </h1>
                {offer && (
                  <p className="text-muted-foreground mt-2">
                    {offer.title} • {applications.length} candidature{applications.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Offer Info */}
        {offer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <CardHoverEffect>
              <GlowCard className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold mb-3">{offer.title}</h2>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        <MapPin className="w-3 h-3 mr-1" />
                        {offer.localisation}
                      </Badge>
                      <Badge variant="secondary">
                        <DollarSign className="w-3 h-3 mr-1" />
                        {offer.salary}
                      </Badge>
                      <Badge variant="secondary">
                        <Briefcase className="w-3 h-3 mr-1" />
                        {offer.contract}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/offers/${offer.id}`)}
                  >
                    Voir l'offre
                  </Button>
                </div>
              </GlowCard>
            </CardHoverEffect>
          </motion.div>
        )}

        {/* Applications List */}
        {applications.length === 0 ? (
          <CardHoverEffect>
            <GlowCard className="p-12 text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Aucune candidature</h3>
              <p className="text-muted-foreground">
                Aucune candidature n'a encore été reçue pour cette offre
              </p>
            </GlowCard>
          </CardHoverEffect>
        ) : (
          <div className="space-y-4">
            {applications.map((application, index) => {
              const status = statusConfig[application.status]
              const StatusIcon = status.icon
              const isExpanded = expandedApplications.has(application.id)

              return (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CardHoverEffect>
                    <GlowCard className="p-6">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src="" />
                              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                                {application.User?.name?.charAt(0).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold mb-1">
                                {application.User?.name || 'Candidat'}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <Mail className="w-4 h-4" />
                                {application.User?.email}
                              </div>
                              {application.User?.adress && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MapPin className="w-4 h-4" />
                                  {application.User.adress}
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge className={`${status.color} border`}>
                            <StatusIcon className={`w-3 h-3 mr-1.5 ${status.iconColor}`} />
                            {status.label}
                          </Badge>
                        </div>

                        {/* Candidate Info */}
                        {application.User?.about && (
                          <div className="pl-16">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {application.User.about}
                            </p>
                          </div>
                        )}

                        {/* Cover Letter */}
                        {application.coverLetter && (
                          <div className="pl-16">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpand(application.id)}
                              className="flex items-center gap-2 text-primary hover:text-primary/80"
                            >
                              <FileText className="w-4 h-4" />
                              Lettre de motivation
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </Button>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-2 p-4 rounded-lg bg-muted/50 border border-border"
                              >
                                <p className="text-sm text-muted-foreground whitespace-pre-line">
                                  {application.coverLetter}
                                </p>
                              </motion.div>
                            )}
                          </div>
                        )}

                        {/* Date */}
                        <div className="pl-16 flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          Candidature reçue le {new Date(application.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </div>

                        {/* Actions */}
                        <div className="pl-16 flex items-center gap-2 pt-2 border-t">
                          {application.status !== 'accepted' && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => updateStatus(application.id, 'accepted')}
                              disabled={updatingStatus === application.id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {updatingStatus === application.id ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                              )}
                              Accepter
                            </Button>
                          )}
                          {application.status !== 'rejected' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateStatus(application.id, 'rejected')}
                              disabled={updatingStatus === application.id}
                            >
                              {updatingStatus === application.id ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4 mr-2" />
                              )}
                              Refuser
                            </Button>
                          )}
                          {application.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(application.id, 'reviewed')}
                              disabled={updatingStatus === application.id}
                            >
                              {updatingStatus === application.id ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Eye className="w-4 h-4 mr-2" />
                              )}
                              Marquer comme examinée
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/profile/${application.UserId}`)}
                          >
                            <User className="w-4 h-4 mr-2" />
                            Voir le profil
                          </Button>
                        </div>
                      </div>
                    </GlowCard>
                  </CardHoverEffect>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

