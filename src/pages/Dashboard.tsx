import { AnimatedGradient } from '@/components/magic/AnimatedGradient'
import { CardHoverEffect } from '@/components/magic/CardHoverEffect'
import { ShimmerButton } from '@/components/magic/ShimmerButton'
import { StatCard } from '@/components/stats/StatCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import api from '@/lib/api'
import { useAuthStore } from '@/store/useAuthStore'
import { motion } from 'framer-motion'
import {
  Briefcase,
  CheckCircle2,
  DollarSign,
  FileText,
  LayoutDashboard,
  MapPin,
  Plus,
  Search,
  Target,
  TrendingUp,
  Users,
  XCircle
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Offer {
  id: string
  title: string
  description: string
  salary: string
  localisation: string
  contract: string
  createdAt: string
  matchingScore?: number
  matchingCompetences?: { id: string; name: string }[]
  missingCompetences?: { id: string; name: string }[]
  Competences?: { id: string; name: string }[]
  User?: {
    name: string
  }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLocation, setFilterLocation] = useState('')
  const { toast } = useToast()

  const isRecruiter = user?.role === 'entreprise'
  const isAdmin = user?.role === 'admin'
  const isStudent = user?.role === 'student'

  useEffect(() => {
    loadOffers()
  }, [])

  const loadOffers = async () => {
    try {
      setLoading(true)
      // Pour les étudiants, utiliser l'endpoint de matching qui inclut les scores
      if (isStudent) {
        const res = await api.get('/matching/offers')
        setOffers(res.data.data || [])
      } else {
        // Pour les recruteurs et admins, utiliser l'endpoint normal
        const res = await api.get('/offers')
        setOffers(res.data.data || [])
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error?.response?.data?.message || 'Impossible de charger les offres',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLocation = !filterLocation || offer.localisation.toLowerCase().includes(filterLocation.toLowerCase())
    return matchesSearch && matchesLocation
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 relative">
      <AnimatedGradient />
      <div className="container mx-auto max-w-7xl px-4 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card/30 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <LayoutDashboard className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-4xl font-black tracking-tight">
                  {isRecruiter ? 'Tableau de bord' : 'Explore tes opportunités'}
                </h1>
              </div>
              <p className="text-muted-foreground text-lg ml-11">
                Bienvenue, <span className="text-foreground font-semibold">{user?.name}</span> 👋
              </p>
            </div>

            <div className="flex items-center gap-4">
              {isRecruiter && (
                <ShimmerButton
                  onClick={() => navigate('/offers/new')}
                  className="shadow-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle offre
                </ShimmerButton>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Cards - Uniquement pour les admins */}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Offres disponibles"
              value={offers.length}
              icon={Briefcase}
              trend={{ value: 12, isPositive: true }}
              glowColor="hsl(var(--primary))"
            />
            <StatCard
              title="Nouvelles cette semaine"
              value={offers.filter(o => {
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return new Date(o.createdAt) > weekAgo
              }).length}
              icon={TrendingUp}
              glowColor="hsl(142, 76%, 36%)"
            />
            <StatCard
              title="Recruteurs actifs"
              value={new Set(offers.map(o => o.User?.name).filter(Boolean)).size}
              icon={Users}
              glowColor="hsl(280, 100%, 70%)"
            />
          </div>
        )}

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher un poste, une compétence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Localisation..."
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </motion.div>

        {/* Offers Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-muted-foreground">Chargement des offres...</div>
          </div>
        ) : filteredOffers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Aucune offre trouvée</h3>
            <p className="text-muted-foreground">
              {offers.length === 0
                ? 'Aucune offre disponible pour le moment.'
                : 'Essayez de modifier vos critères de recherche.'}
            </p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((offer, index) => (
              <CardHoverEffect key={offer.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative overflow-hidden"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                        {offer.title}
                      </h3>
                      {isStudent && offer.matchingScore !== undefined && (
                        <Badge
                          variant={offer.matchingScore >= 70 ? "default" : offer.matchingScore >= 50 ? "secondary" : "outline"}
                          className="ml-2 flex items-center gap-1"
                        >
                          <Target className="w-3 h-3" />
                          {offer.matchingScore}%
                        </Badge>
                      )}
                    </div>

                    {isStudent && offer.matchingScore !== undefined && offer.matchingScore < 100 && (
                      <div className="p-3 rounded-lg bg-muted/50 border border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">Correspondance</span>
                        </div>
                        {offer.matchingCompetences && offer.matchingCompetences.length > 0 && (
                          <div className="mb-2">
                            <div className="flex items-center gap-1 mb-1">
                              <CheckCircle2 className="w-3 h-3 text-green-500" />
                              <span className="text-xs text-muted-foreground">Compétences correspondantes:</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {offer.matchingCompetences.map((comp) => (
                                <Badge key={comp.id} variant="secondary" className="text-xs">
                                  {comp.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {offer.missingCompetences && offer.missingCompetences.length > 0 && (
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <XCircle className="w-3 h-3 text-orange-500" />
                              <span className="text-xs text-muted-foreground">Compétences manquantes:</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {offer.missingCompetences.slice(0, 3).map((comp) => (
                                <Badge key={comp.id} variant="outline" className="text-xs">
                                  {comp.name}
                                </Badge>
                              ))}
                              {offer.missingCompetences.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{offer.missingCompetences.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <p className="text-muted-foreground line-clamp-3">
                      {offer.description}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <Badge variant="outline" className="text-xs">
                        <MapPin className="w-3 h-3 mr-1" />
                        {offer.localisation}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <DollarSign className="w-3 h-3 mr-1" />
                        {offer.salary}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <Briefcase className="w-3 h-3 mr-1" />
                        {offer.contract}
                      </Badge>
                    </div>

                    {offer.User && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground">
                          Par <span className="font-medium">{offer.User.name}</span>
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        className="flex-1 group-hover:bg-primary/90 transition-all"
                        variant="default"
                        onClick={() => navigate(`/offers/${offer.id}`)}
                      >
                        Voir l'offre
                      </Button>
                      {isRecruiter && (
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/offers/${offer.id}/applications`)}
                          className="flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          Candidatures
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </CardHoverEffect>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

