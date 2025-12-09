import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CardHoverEffect } from '@/components/magic/CardHoverEffect'
import { GlowCard } from '@/components/magic/GlowCard'
import { AnimatedGradient } from '@/components/magic/AnimatedGradient'
import { StatCard } from '@/components/stats/StatCard'
import {
  Users,
  Briefcase,
  FileText,
  UserCheck,
  TrendingUp,
  Shield,
  Eye,
  Trash2,
  Edit,
  Plus,
  BarChart3,
  Calendar,
} from 'lucide-react'
import api from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { useAuthStore } from '@/store/useAuthStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface User {
  id: string
  name: string
  email: string
  role: 'student' | 'entreprise' | 'admin'
  about?: string
  adress?: string
  createdAt: string
}

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
  }
}

interface Application {
  id: string
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  createdAt: string
  User?: {
    name: string
  }
  Offer?: {
    title: string
  }
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuthStore()
  const [users, setUsers] = useState<User[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'offers' | 'applications'>('overview')
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [deletingOfferId, setDeletingOfferId] = useState<string | null>(null)
  const [updatingAppId, setUpdatingAppId] = useState<string | null>(null)

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/')
      return
    }
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      const [usersRes, offersRes, applicationsRes] = await Promise.all([
        api.get('/users'),
        api.get('/offers'),
        api.get('/applications/all'),
      ])
      
      setUsers(usersRes.data.data || [])
      setOffers(offersRes.data.data || [])
      setApplications(applicationsRes.data.data || [])
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error?.response?.data?.message || 'Impossible de charger les données',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return
    try {
      setDeletingUserId(userId)
      await api.delete(`/users/${userId}`)
      toast({ title: 'Utilisateur supprimé' })
      setUsers((prev) => prev.filter((u) => u.id !== userId))
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error?.response?.data?.message || 'Impossible de supprimer cet utilisateur',
        variant: 'destructive',
      })
    } finally {
      setDeletingUserId(null)
    }
  }

  const handleDeleteOffer = async (offerId: string) => {
    if (!window.confirm('Supprimer cette offre ?')) return
    try {
      setDeletingOfferId(offerId)
      await api.delete(`/offers/${offerId}`)
      toast({ title: 'Offre supprimée' })
      setOffers((prev) => prev.filter((o) => o.id !== offerId))
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error?.response?.data?.message || 'Impossible de supprimer cette offre',
        variant: 'destructive',
      })
    } finally {
      setDeletingOfferId(null)
    }
  }

  const handleUpdateApplicationStatus = async (applicationId: string, status: Application['status']) => {
    try {
      setUpdatingAppId(applicationId)
      await api.put(`/applications/${applicationId}/status`, { status })
      toast({ title: 'Statut mis à jour', description: `La candidature est maintenant "${status}"` })
      setApplications((prev) =>
        prev.map((a) => (a.id === applicationId ? { ...a, status } : a))
      )
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error?.response?.data?.message || 'Impossible de mettre à jour le statut',
        variant: 'destructive',
      })
    } finally {
      setUpdatingAppId(null)
    }
  }

  const stats = {
    totalUsers: users.length,
    totalOffers: offers.length,
    totalApplications: applications.length,
    pendingApplications: applications.filter(a => a.status === 'pending').length,
    students: users.filter(u => u.role === 'student').length,
    entreprises: users.filter(u => u.role === 'entreprise').length,
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 relative">
      <AnimatedGradient />
      <div className="container mx-auto max-w-7xl px-4 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-6 h-6 text-primary" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Administration
                </h1>
              </div>
              <p className="text-muted-foreground">
                Gestion complète de la plateforme de recrutement
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b mb-6">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
              { id: 'users', label: 'Utilisateurs', icon: Users },
              { id: 'offers', label: 'Offres', icon: Briefcase },
              { id: 'applications', label: 'Candidatures', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center gap-2 px-4 py-2 border-b-2 transition-colors
                    ${activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Utilisateurs"
                value={stats.totalUsers}
                icon={Users}
                trend={{ value: stats.students, isPositive: true }}
                glowColor="hsl(var(--primary))"
              />
              <StatCard
                title="Offres d'emploi"
                value={stats.totalOffers}
                icon={Briefcase}
                glowColor="hsl(142, 76%, 36%)"
              />
              <StatCard
                title="Candidatures"
                value={stats.totalApplications}
                icon={FileText}
                trend={{ value: stats.pendingApplications, isPositive: false }}
                glowColor="hsl(280, 100%, 70%)"
              />
              <StatCard
                title="Recruteurs"
                value={stats.entreprises}
                icon={UserCheck}
                glowColor="hsl(24, 95%, 53%)"
              />
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <CardHoverEffect>
                <GlowCard className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Répartition des utilisateurs
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Étudiants</span>
                      <Badge variant="secondary">{stats.students}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Entreprises</span>
                      <Badge variant="secondary">{stats.entreprises}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Administrateurs</span>
                      <Badge variant="secondary">{users.filter(u => u.role === 'admin').length}</Badge>
                    </div>
                  </div>
                </GlowCard>
              </CardHoverEffect>

              <CardHoverEffect>
                <GlowCard className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Statut des candidatures
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">En attente</span>
                      <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                        {applications.filter(a => a.status === 'pending').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Acceptées</span>
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                        {applications.filter(a => a.status === 'accepted').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Refusées</span>
                      <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
                        {applications.filter(a => a.status === 'rejected').length}
                      </Badge>
                    </div>
                  </div>
                </GlowCard>
              </CardHoverEffect>
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Gestion des utilisateurs</h2>
              <Badge variant="secondary">{users.length} utilisateur{users.length > 1 ? 's' : ''}</Badge>
            </div>
            {users.length === 0 ? (
              <CardHoverEffect>
                <GlowCard className="p-12 text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Aucun utilisateur</p>
                </GlowCard>
              </CardHoverEffect>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((userItem, index) => (
                  <motion.div
                    key={userItem.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <CardHoverEffect>
                      <GlowCard className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-1">{userItem.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{userItem.email}</p>
                            <Badge
                              variant={
                                userItem.role === 'admin' ? 'default' :
                                userItem.role === 'entreprise' ? 'secondary' : 'outline'
                              }
                            >
                              {userItem.role === 'admin' ? 'Admin' :
                               userItem.role === 'entreprise' ? 'Recruteur' : 'Candidat'}
                            </Badge>
                          </div>
                        </div>
                        {userItem.about && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {userItem.about}
                          </p>
                        )}
                        <div className="flex items-center gap-2 pt-4 border-t">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/profile/${userItem.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Voir
                          </Button>
                          {userItem.role !== 'admin' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteUser(userItem.id)}
                              disabled={deletingUserId === userItem.id}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {deletingUserId === userItem.id ? 'Suppression...' : 'Supprimer'}
                            </Button>
                          )}
                        </div>
                      </GlowCard>
                    </CardHoverEffect>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Offers Tab */}
        {activeTab === 'offers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Gestion des offres</h2>
              <Badge variant="secondary">{offers.length} offre{offers.length > 1 ? 's' : ''}</Badge>
            </div>
            {offers.length === 0 ? (
              <CardHoverEffect>
                <GlowCard className="p-12 text-center">
                  <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Aucune offre</p>
                </GlowCard>
              </CardHoverEffect>
            ) : (
              <div className="space-y-4">
                {offers.map((offer, index) => (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <CardHoverEffect>
                      <GlowCard className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-2">{offer.title}</h3>
                            <p className="text-muted-foreground mb-4 line-clamp-2">{offer.description}</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              <Badge variant="outline">{offer.localisation}</Badge>
                              <Badge variant="outline">{offer.salary}</Badge>
                              <Badge variant="secondary">{offer.contract}</Badge>
                            </div>
                            {offer.User && (
                              <p className="text-sm text-muted-foreground">
                                Par <span className="font-medium">{offer.User.name}</span>
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/offers/${offer.id}`)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Voir
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/offers/${offer.id}/applications`)}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              Candidatures
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteOffer(offer.id)}
                              disabled={deletingOfferId === offer.id}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {deletingOfferId === offer.id ? 'Suppression...' : 'Supprimer'}
                            </Button>
                          </div>
                        </div>
                      </GlowCard>
                    </CardHoverEffect>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Toutes les candidatures</h2>
              <Badge variant="secondary">{applications.length} candidature{applications.length > 1 ? 's' : ''}</Badge>
            </div>
            {applications.length === 0 ? (
              <CardHoverEffect>
                <GlowCard className="p-12 text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Aucune candidature</p>
                </GlowCard>
              </CardHoverEffect>
            ) : (
              <div className="space-y-4">
                {applications.map((application, index) => (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <CardHoverEffect>
                      <GlowCard className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">
                                {application.User?.name || 'Candidat'}
                              </h3>
                              <Badge
                                variant={
                                  application.status === 'accepted' ? 'default' :
                                  application.status === 'rejected' ? 'destructive' : 'secondary'
                                }
                              >
                                {application.status === 'pending' && 'En attente'}
                                {application.status === 'reviewed' && 'Examinée'}
                                {application.status === 'accepted' && 'Acceptée'}
                                {application.status === 'rejected' && 'Refusée'}
                              </Badge>
                            </div>
                            {application.Offer && (
                              <p className="text-muted-foreground mb-2">
                                Pour l'offre : <span className="font-medium">{application.Offer.title}</span>
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground">
                              {new Date(application.createdAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline">
                              Statut
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {(['pending', 'reviewed', 'accepted', 'rejected'] as Application['status'][]).map((statusOption) => (
                              <DropdownMenuItem
                                key={statusOption}
                                onClick={() => handleUpdateApplicationStatus(application.id, statusOption)}
                                disabled={updatingAppId === application.id}
                              >
                                {statusOption === 'pending' && 'En attente'}
                                {statusOption === 'reviewed' && 'Examinée'}
                                {statusOption === 'accepted' && 'Acceptée'}
                                {statusOption === 'rejected' && 'Refusée'}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        </div>
                      </GlowCard>
                    </CardHoverEffect>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

