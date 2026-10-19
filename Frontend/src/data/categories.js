// Preset post categories and the icon shown before a post's caption.
// Custom categories fall back to DEFAULT_CATEGORY_ICON.
export const CATEGORY_ICONS = {
  Nature: 'mountain',
  Travel: 'plane',
  Adventure: 'compass',
  Food: 'food',
  People: 'profile',
  Animals: 'paw',
  Architecture: 'building',
  Art: 'palette',
  Sports: 'ball',
  Lifestyle: 'heart',
}

export const CATEGORIES = Object.keys(CATEGORY_ICONS)

export const DEFAULT_CATEGORY_ICON = 'sparkle'

export const categoryIcon = category => CATEGORY_ICONS[category] || DEFAULT_CATEGORY_ICON

export const EMOJI_CHOICES = ['⛰️', '🌊', '🌅', '🌲', '🌸', '✈️', '🏖️', '🍕', '☕', '🐶', '🎨', '⚽', '❤️', '✨', '🎉', '😊']
