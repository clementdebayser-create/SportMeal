import { ChefHat, Dumbbell, Gauge, Heart, Sparkles } from 'lucide-vue-next'
import type { Feature, Reassurance, Step } from '~/types/landing'

export const REASSURANCES: Reassurance[] = [
  { icon: '🏋️', label: 'Adapté à ton sport' },
  { icon: '🎯', label: 'Pensé pour ton objectif' },
  { icon: '🍽️', label: 'Selon tes goûts' },
]

export const STEPS: Step[] = [
  {
    title: 'Ton profil',
    description: 'Choisis ton sport, ton niveau et ton objectif.',
  },
  {
    title: 'Tes goûts',
    description: 'Indique tes préférences et les aliments que tu apprécies.',
  },
  {
    title: 'Tes recettes',
    description: 'Découvre des recettes adaptées à ton profil et à tes envies.',
  },
]

export const FEATURES: Feature[] = [
  {
    title: 'Recettes personnalisées',
    description: 'Des suggestions construites autour de ton profil, pas d’un plan générique.',
    icon: Sparkles,
    span: 'lg:col-span-2',
  },
  {
    title: 'Adaptation au sport pratiqué',
    description: 'Course, musculation, sports collectifs : l’assiette suit l’effort.',
    icon: Dumbbell,
    span: 'lg:col-span-2',
  },
  {
    title: 'Niveau et objectif',
    description: 'Débutant ou confirmé, prise de muscle ou récupération : le rythme s’ajuste.',
    icon: Gauge,
    span: 'lg:col-span-2',
  },
  {
    title: 'Personnalisation selon les goûts',
    description: 'Tes préférences alimentaires restent au centre, sans forcer un régime austère.',
    icon: Heart,
    span: 'lg:col-span-3',
  },
  {
    title: 'Suggestions rapides et faciles',
    description: 'Des recettes claires, réalistes et simples à suivre au quotidien.',
    icon: ChefHat,
    span: 'lg:col-span-3',
  },
]
