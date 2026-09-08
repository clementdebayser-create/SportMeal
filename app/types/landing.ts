import type { Component } from 'vue'

export interface Reassurance {
  icon: string
  label: string
}

export interface Step {
  title: string
  description: string
}

export interface Feature {
  title: string
  description: string
  icon: Component
  /** Classes de colonne pour la grille bento de la section bénéfices. */
  span: string
}
