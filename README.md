# Frontend - Recrutement Client

Frontend React avec TypeScript utilisant Vite et les meilleures bibliothèques UI.

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

## Bibliothèques UI utilisées

### shadcn/ui
Composants UI de base déjà configurés. Pour ajouter de nouveaux composants :

```bash
npx shadcn-ui@latest add [component-name]
```

### Origin UI
Composants supplémentaires basés sur shadcn. Visitez [originui.com](https://originui.com) pour copier les composants.

### Magic UI
Animations et effets magiques. Visitez [magicui.design](https://magicui.design) pour les composants d'animation.

### Autres ressources
- **shadcn/studio** - Outil pour créer des composants personnalisés
- **tailark.com** - Composants Tailwind supplémentaires
- **ElevenLabs UI** - Composants pour intégration ElevenLabs
- **AI SDK** - Déjà installé pour l'intégration IA
- **Dice UI** - Composants supplémentaires
- **ReUI** - Bibliothèque de composants React
- **21st.dev** - Composants modernes

## Structure du projet

```
src/
├── components/     # Composants réutilisables
│   └── ui/        # Composants shadcn/ui
├── lib/           # Utilitaires et configurations
├── pages/         # Pages de l'application
├── store/         # Store Zustand pour l'état global
└── App.tsx        # Composant principal
```

## Configuration

Créer un fichier `.env` avec :
```
VITE_API_URL=http://localhost:3000/api
VITE_AI_SERVICE_URL=http://localhost:8000
```

## Utilisation de l'IA

Le service IA est déjà intégré via `src/lib/ai.ts`. Exemple :

```typescript
import { chatWithAI, analyzeCV } from '@/lib/ai'

// Chat simple
const response = await chatWithAI([
  { role: 'user', content: 'Bonjour' }
])

// Analyse de CV
const analysis = await analyzeCV(cvText, jobDescription)
```

## État global (Zustand)

L'authentification est gérée via Zustand dans `src/store/useAuthStore.ts` :

```typescript
import { useAuthStore } from '@/store/useAuthStore'

const { user, login, logout, isAuthenticated } = useAuthStore()
```

