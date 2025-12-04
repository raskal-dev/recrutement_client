import { Button } from "@/components/ui/button"

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">Bienvenue sur Recrutement</h1>
      <p className="text-muted-foreground mb-8">
        Plateforme de recrutement combinant LinkedIn et Upwork
      </p>
      <Button>Commencer</Button>
    </div>
  )
}

export default Home

