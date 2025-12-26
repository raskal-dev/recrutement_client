import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CardHoverEffect } from '@/components/magic/CardHoverEffect'
import { GlowCard } from '@/components/magic/GlowCard'
import { AnimatedGradient } from '@/components/magic/AnimatedGradient'
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  MapPin,
  DollarSign,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Loader2,
} from 'lucide-react'
import api from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { useAuthStore } from '@/store/useAuthStore'

interface Application {
  id: string
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  coverLetter?: string
  OfferId: string
  createdAt: string
  updatedAt: string
  Offer?: {
    id: string
    title: string
    description: string
    salary: string
    localisation: string
    contract: string
    User?: {
      id: string
      name: string
      email: string
    }
  }
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

export default function MyApplications() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuthStore()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== 'student') {
      navigate('/')
      return
    }
    loadApplications()
  }, [user])

  const loadApplications = async () => {
    try {
      setLoading(true)
      const res = await api.get('/applications/user')
      setApplications(res.data.data || [])
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error?.response?.data?.message || 'Impossible de charger vos candidatures',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
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
                  Mes candidatures
                </h1>
                <p className="text-muted-foreground mt-2">
                  {applications.length} candidature{applications.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <CardHoverEffect>
            <GlowCard className="p-12 text-center">
              <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Aucune candidature</h3>
              <p className="text-muted-foreground mb-6">
                Vous n'avez pas encore postulé à une offre
              </p>
              <Button onClick={() => navigate('/')}>
                Parcourir les offres
              </Button>
            </GlowCard>
          </CardHoverEffect>
        ) : (
          <div className="space-y-4">
            {applications.map((application, index) => {
              const status = statusConfig[application.status]
              const StatusIcon = status.icon

              return (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CardHoverEffect>
                    <GlowCard className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {application.Offer && (
                            <>
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <h3 className="text-xl font-semibold mb-2 hover:text-primary transition-colors cursor-pointer"
                                      onClick={() => navigate(`/offers/${application.OfferId}`)}>
                                    {application.Offer.title}
                                  </h3>
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    <Badge variant="secondary" className="text-xs">
                                      <MapPin className="w-3 h-3 mr-1" />
                                      {application.Offer.localisation}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      <DollarSign className="w-3 h-3 mr-1" />
                                      {application.Offer.salary}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      <Briefcase className="w-3 h-3 mr-1" />
                                      {application.Offer.contract}
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              {application.Offer.User && (
                                <div className="text-sm text-muted-foreground mb-4">
                                  <span>Recruteur: </span>
                                  <span className="font-medium">{application.Offer.User.name}</span>
                                </div>
                              )}
                            </>
                          )}

                          <div className="flex items-center gap-4 flex-wrap">
                            <Badge className={`${status.color} border`}>
                              <StatusIcon className={`w-3 h-3 mr-1.5 ${status.iconColor}`} />
                              {status.label}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              Postulé le {new Date(application.createdAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </div>
                          </div>

                          {application.coverLetter && (
                            <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium">Lettre de motivation</span>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-3">
                                {application.coverLetter}
                              </p>
                            </div>
                          )}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/offers/${application.OfferId}`)}
                        >
                          Voir l'offre
                        </Button>
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

