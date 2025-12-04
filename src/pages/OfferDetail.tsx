import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CardHoverEffect } from '@/components/magic/CardHoverEffect'
import { GlowCard } from '@/components/magic/GlowCard'
import { AnimatedGradient } from '@/components/magic/AnimatedGradient'
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Briefcase,
  Calendar,
  User,
  Sparkles,
  Send,
  Bookmark,
  Share2,
  FileText,
} from 'lucide-react'
import api from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { useAuthStore } from '@/store/useAuthStore'

interface Offer {
  id: string
  title: string
  description: string
  salary: string
  localisation: string
  contract: string
  createdAt: string
  User?: {
    id: string
    name: string
    email: string
  }
}

export default function OfferDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuthStore()
  const [offer, setOffer] = useState<Offer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadOffer()
    }
  }, [id])

  const loadOffer = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/offers/${id}`)
      setOffer(res.data.data)
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error?.response?.data?.message || 'Impossible de charger l\'offre',
        variant: 'destructive',
      })
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = () => {
    toast({
      title: 'Candidature envoyée',
      description: 'Votre candidature a été transmise au recruteur.',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  if (!offer) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 relative">
      <AnimatedGradient />
      <div className="container mx-auto max-w-5xl px-4 py-8 relative z-10">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Retour
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <CardHoverEffect>
              <GlowCard className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 mb-4"
                    >
                      <Sparkles className="w-5 h-5 text-primary" />
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                        {offer.title}
                      </h1>
                    </motion.div>

                    <div className="flex flex-wrap gap-3 mb-6">
                      <Badge variant="secondary" className="text-sm px-3 py-1">
                        <MapPin className="w-3 h-3 mr-1.5" />
                        {offer.localisation}
                      </Badge>
                      <Badge variant="secondary" className="text-sm px-3 py-1">
                        <DollarSign className="w-3 h-3 mr-1.5" />
                        {offer.salary}
                      </Badge>
                      <Badge className="text-sm px-3 py-1 bg-primary/10 text-primary border-primary/20">
                        <Briefcase className="w-3 h-3 mr-1.5" />
                        {offer.contract}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Publiée le{' '}
                        {new Date(offer.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </GlowCard>
            </CardHoverEffect>

            {/* Description */}
            <CardHoverEffect>
              <GlowCard className="p-8">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Description du poste
                </h2>
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {offer.description}
                  </p>
                </div>
              </GlowCard>
            </CardHoverEffect>

            {/* Recruteur */}
            {offer.User && (
              <CardHoverEffect>
                <GlowCard className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    À propos du recruteur
                  </h3>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-xl font-semibold">
                        {offer.User.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-lg">{offer.User.name}</p>
                      <p className="text-sm text-muted-foreground">{offer.User.email}</p>
                    </div>
                  </div>
                </GlowCard>
              </CardHoverEffect>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Action Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlowCard className="p-6 sticky top-24">
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold mb-2">Intéressé par cette offre ?</h3>
                    <p className="text-sm text-muted-foreground">
                      Postulez maintenant et démarrez votre nouvelle aventure professionnelle
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button
                      className="w-full group relative overflow-hidden"
                      size="lg"
                      onClick={handleApply}
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        <Send className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                        Postuler maintenant
                      </span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                      >
                        <Bookmark className="w-4 h-4 mr-2" />
                        Sauvegarder
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Partager
                      </Button>
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="pt-4 border-t space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Type de contrat</span>
                      <span className="font-medium">{offer.contract}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Salaire</span>
                      <span className="font-medium">{offer.salary}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Localisation</span>
                      <span className="font-medium">{offer.localisation}</span>
                    </div>
                  </div>
                </div>
              </GlowCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

