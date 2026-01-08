export type PokemonTypeColorKey =
  | 'colorless'
  | 'fire'
  | 'water'
  | 'grass'
  | 'lightning'
  | 'psychic'
  | 'fighting'
  | 'darkness'
  | 'metal'
  | 'dragon'
  | 'fairy'

interface PokemonTypeColor {
  base: string
  gradientFrom: string
  gradientTo: string
  text?: string
}

export const POKEMON_TYPE_COLORS: Record<PokemonTypeColorKey, PokemonTypeColor> = {
  colorless: { base: '#C7C1B7', gradientFrom: '#dcd7cf', gradientTo: '#b8b2a7', text: '#2f1f17' },
  fire: { base: '#F04A3A', gradientFrom: '#ff7043', gradientTo: '#d84315' },
  water: { base: '#2E7FCE', gradientFrom: '#4fa3ff', gradientTo: '#1f5fab' },
  grass: { base: '#4CB050', gradientFrom: '#6dd56a', gradientTo: '#2f8638' },
  lightning: { base: '#F9C437', gradientFrom: '#ffe066', gradientTo: '#f1a500', text: '#3b2c00' },
  psychic: { base: '#A73ACE', gradientFrom: '#c473ff', gradientTo: '#7b1fa2' },
  fighting: { base: '#C66A2B', gradientFrom: '#dd8d4a', gradientTo: '#9c4518' },
  darkness: { base: '#3A3A43', gradientFrom: '#565669', gradientTo: '#1d1d24' },
  metal: { base: '#A0A9B4', gradientFrom: '#c5ceda', gradientTo: '#7e8793', text: '#1f2430' },
  dragon: { base: '#8F6C2F', gradientFrom: '#b48b44', gradientTo: '#6d4c1c' },
  fairy: { base: '#EE62A8', gradientFrom: '#ff8ac4', gradientTo: '#d43b86' },
}

const DEFAULT_TYPE_COLOR: PokemonTypeColor = {
  base: '#7f5af0',
  gradientFrom: '#a28bff',
  gradientTo: '#623cf5',
}

export const getTypeColor = (type?: string): PokemonTypeColor => {
  if (!type) return DEFAULT_TYPE_COLOR
  const normalized = type.trim().toLowerCase() as PokemonTypeColorKey
  return POKEMON_TYPE_COLORS[normalized] ?? DEFAULT_TYPE_COLOR
}
