import { AnimatedGradient } from '@/components/magic/AnimatedGradient'
import { BorderBeam } from '@/components/magic/BorderBeam'
import { CardHoverEffect } from '@/components/magic/CardHoverEffect'
import { GlowCard } from '@/components/magic/GlowCard'
import { InfiniteScroll } from '@/components/magic/InfiniteScroll'
import { Particles } from '@/components/magic/Particles'
import { ShimmerButton } from '@/components/magic/ShimmerButton'
import { SparklesText } from '@/components/magic/SparklesText'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Award,
  Brain,
  Briefcase,
  Rocket,
  Shield,
  Star,
  TrendingUp,
  Users
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 relative">
      <AnimatedGradient />
      <Particles
        className="absolute inset-0 opacity-30"
        quantity={50}
        color="hsl(var(--primary))"
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,transparent)]" />
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-8"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm"
            >
              <SparklesText text="Plateforme de recrutement nouvelle génération" />
            </motion.div>

            <h1 className="text-5xl md:text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50">
              Trouve ton job de rêve
              <br />
              <span className="text-primary italic">propulsé par l'IA</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              L'alliance parfaite entre le réseau professionnel et l'efficacité du freelance.
              Une expérience fluide, intelligente et résolument moderne.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
              <ShimmerButton
                onClick={() => navigate('/register')}
                className="shadow-2xl"
              >
                <span className="flex items-center gap-2">
                  Commencer l'aventure
                  <ArrowRight className="w-4 h-4" />
                </span>
              </ShimmerButton>

              <Button
                size="lg"
                variant="link"
                className="text-foreground hover:text-primary transition-colors text-lg"
                onClick={() => navigate('/login')}
              >
                Déjà membre ? Se connecter
              </Button>
            </div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-4 mt-12"
            >
              <Badge variant="outline" className="px-4 py-2">
                <Star className="w-3 h-3 mr-1.5 fill-yellow-500 text-yellow-500" />
                4.9/5
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                <Users className="w-3 h-3 mr-1.5" />
                10k+ utilisateurs
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                <Award className="w-3 h-3 mr-1.5" />
                Certifié
              </Badge>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Pourquoi choisir Recrutement ?</h2>
            <p className="text-muted-foreground text-lg">
              Une expérience moderne et intuitive pour tous vos besoins de recrutement
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Briefcase,
                title: 'Offres personnalisées',
                description: 'Trouve des missions qui correspondent à tes compétences et tes aspirations.',
                color: 'text-blue-500',
                gradient: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Users,
                title: 'Réseau professionnel',
                description: 'Connecte-toi avec des recruteurs et des talents du monde entier.',
                color: 'text-purple-500',
                gradient: 'from-purple-500 to-pink-500'
              },
              {
                icon: Brain,
                title: 'Matching intelligent',
                description: 'Notre IA analyse ton profil et te propose les meilleures opportunités.',
                color: 'text-yellow-500',
                gradient: 'from-yellow-500 to-orange-500'
              },
              {
                icon: TrendingUp,
                title: 'Croissance de carrière',
                description: 'Suis ta progression et développe tes compétences avec des projets variés.',
                color: 'text-green-500',
                gradient: 'from-green-500 to-emerald-500'
              },
              {
                icon: Shield,
                title: 'Sécurisé et fiable',
                description: 'Plateforme sécurisée avec vérification des profils et paiements protégés.',
                color: 'text-red-500',
                gradient: 'from-red-500 to-rose-500'
              },
              {
                icon: Rocket,
                title: 'Interface moderne',
                description: 'Design élégant et intuitif pour une expérience utilisateur exceptionnelle.',
                color: 'text-pink-500',
                gradient: 'from-pink-500 to-rose-500'
              }
            ].map((feature, index) => (
              <CardHoverEffect key={feature.title}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 relative overflow-hidden"
                >
                  <BorderBeam
                    size={150}
                    duration={12}
                    delay={index * 0.2}
                    colorFrom={`hsl(var(--primary))`}
                    colorTo={`hsl(var(--primary))`}
                  />
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.gradient} bg-opacity-10 mb-4`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              </CardHoverEffect>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-12 text-center"
          >
            <BorderBeam
              size={200}
              duration={15}
              colorFrom="#ffffff"
              colorTo="#ffffff"
            />
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,transparent)]" />
            <div className="relative z-10 space-y-6">
              <h2 className="text-4xl font-bold text-primary-foreground">
                Prêt à démarrer ?
              </h2>
              <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
                Rejoins des milliers de professionnels qui ont déjà trouvé leur voie grâce à notre plateforme.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Button size="lg" variant="secondary" className="bg-background hover:bg-background/90" asChild>
                  <Link to="/register">
                    Créer un compte gratuit
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Scroll */}
      <section className="py-16 px-4 overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h3 className="text-2xl font-bold text-center mb-4">Ils nous font confiance</h3>
          </motion.div>
          <InfiniteScroll
            direction="left"
            speed={30}
            className="overflow-hidden"
          >
            {[
              { name: 'TechCorp', logo: '🚀' },
              { name: 'InnovateLab', logo: '💡' },
              { name: 'FutureDev', logo: '⚡' },
              { name: 'CloudSoft', logo: '☁️' },
              { name: 'DataFlow', logo: '📊' },
              { name: 'CodeCraft', logo: '🎨' },
            ].map((company, i) => (
              <GlowCard key={i} className="min-w-[200px] text-center p-4">
                <div className="text-4xl mb-2">{company.logo}</div>
                <div className="font-semibold">{company.name}</div>
              </GlowCard>
            ))}
          </InfiniteScroll>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12 px-4 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-primary" />
              <span className="text-lg font-semibold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Recrutement
              </span>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-right">
              © 2024 Recrutement. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

