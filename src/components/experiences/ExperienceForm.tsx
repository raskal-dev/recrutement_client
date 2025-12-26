import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Calendar } from 'lucide-react'

const experienceSchema = z.object({
  title: z.string().min(2, 'Le titre est requis'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  startDate: z.string().min(1, 'La date de début est requise'),
  endDate: z.string().min(1, 'La date de fin est requise'),
})
.refine((data) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const startDate = new Date(data.startDate)
  startDate.setHours(0, 0, 0, 0)
  return startDate <= today
}, {
  message: 'La date de début ne peut pas être dans le futur',
  path: ['startDate'],
})
.refine((data) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endDate = new Date(data.endDate)
  endDate.setHours(0, 0, 0, 0)
  return endDate <= today
}, {
  message: 'La date de fin ne peut pas être dans le futur',
  path: ['endDate'],
})
.refine((data) => {
  return new Date(data.endDate) >= new Date(data.startDate)
}, {
  message: 'La date de fin doit être après la date de début',
  path: ['endDate'],
})

type ExperienceFormValues = z.infer<typeof experienceSchema>

interface ExperienceFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ExperienceFormValues) => void
  defaultValues?: ExperienceFormValues
  loading?: boolean
}

export function ExperienceForm({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  loading = false,
}: ExperienceFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: defaultValues || {
      title: '',
      description: '',
      startDate: '',
      endDate: '',
    },
  })

  const handleFormSubmit = (data: ExperienceFormValues) => {
    onSubmit(data)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {defaultValues ? 'Modifier l\'expérience' : 'Ajouter une expérience'}
          </DialogTitle>
          <DialogDescription>
            Remplissez les informations concernant votre expérience professionnelle
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre du poste *</Label>
            <Input
              id="title"
              placeholder="Ex: Développeur Full Stack"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              rows={4}
              placeholder="Décrivez vos missions et responsabilités..."
              {...register('description')}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Date de début *</Label>
              <Input
                id="startDate"
                type="date"
                max={new Date().toISOString().split('T')[0]}
                {...register('startDate')}
              />
              {errors.startDate && (
                <p className="text-sm text-destructive">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Date de fin *</Label>
              <Input
                id="endDate"
                type="date"
                max={new Date().toISOString().split('T')[0]}
                {...register('endDate')}
              />
              {errors.endDate && (
                <p className="text-sm text-destructive">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                reset()
              }}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : defaultValues ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

