// Centralized cuisine data to ensure consistency across components
export interface CuisineCategory {
  name: string
  description: string
  icon: string
  slug: string
  searchTerms: string[]
}

export const CUISINE_CATEGORIES: CuisineCategory[] = [
  {
    name: 'Italian',
    description: 'Authentic pasta, pizza, and classic Italian dishes',
    icon: '🍝',
    slug: 'italian',
    searchTerms: ['italian', 'pasta', 'pizza', 'italian food']
  },
  {
    name: 'Mexican',
    description: 'Traditional tacos, enchiladas, and Mexican favorites',
    icon: '🌮',
    slug: 'mexican',
    searchTerms: ['mexican', 'tacos', 'burritos', 'enchiladas', 'mexican food']
  },
  {
    name: 'Steakhouse',
    description: 'Premium steaks, grilled specialties, and fine dining',
    icon: '🥩',
    slug: 'steakhouse',
    searchTerms: ['steakhouse', 'steak', 'beef', 'grilled', 'fine dining']
  },
  {
    name: 'Asian',
    description: 'Sushi, Chinese, Thai, and other Asian cuisines',
    icon: '🍜',
    slug: 'asian',
    searchTerms: ['asian', 'sushi', 'chinese', 'thai', 'japanese', 'korean']
  },
  {
    name: 'Breakfast',
    description: 'All-day breakfast, brunch, and morning favorites',
    icon: '🥞',
    slug: 'breakfast',
    searchTerms: ['breakfast', 'brunch', 'pancakes', 'eggs', 'morning']
  },
  {
    name: 'BBQ',
    description: 'Smoked meats, barbecue classics, and comfort food',
    icon: '🍖',
    slug: 'bbq',
    searchTerms: ['bbq', 'barbecue', 'smoked', 'ribs', 'brisket']
  },
  {
    name: 'American',
    description: 'Classic American fare, burgers, and comfort food',
    icon: '🍔',
    slug: 'american',
    searchTerms: ['american', 'burger', 'comfort food', 'classic']
  },
  {
    name: 'Seafood',
    description: 'Fresh fish, shellfish, and coastal favorites',
    icon: '🦐',
    slug: 'seafood',
    searchTerms: ['seafood', 'fish', 'shrimp', 'crab', 'oysters']
  },
  {
    name: 'Indian',
    description: 'Curry, tandoor, and traditional Indian dishes',
    icon: '🍛',
    slug: 'indian',
    searchTerms: ['indian', 'curry', 'tandoor', 'indian food']
  },
  {
    name: 'Fast Food',
    description: 'Quick service, burgers, and fast casual dining',
    icon: '🍟',
    slug: 'fast-food',
    searchTerms: ['fast food', 'quick', 'burgers', 'chicken']
  }
]

// Helper functions for cuisine operations
export const getCuisineByName = (name: string): CuisineCategory | undefined => {
  return CUISINE_CATEGORIES.find(cuisine => 
    cuisine.name.toLowerCase() === name.toLowerCase() ||
    cuisine.slug === name.toLowerCase()
  )
}

export const getCuisineBySlug = (slug: string): CuisineCategory | undefined => {
  return CUISINE_CATEGORIES.find(cuisine => cuisine.slug === slug)
}

export const getPopularCuisines = (): CuisineCategory[] => {
  return CUISINE_CATEGORIES.slice(0, 6) // First 6 are most popular
}

export const searchCuisines = (query: string): CuisineCategory[] => {
  const searchTerm = query.toLowerCase().trim()
  return CUISINE_CATEGORIES.filter(cuisine =>
    cuisine.name.toLowerCase().includes(searchTerm) ||
    cuisine.searchTerms.some(term => term.includes(searchTerm))
  )
}