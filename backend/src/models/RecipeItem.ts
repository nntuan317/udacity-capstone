export interface RecipeItem {
  userId: string
  recipeId: string
  createdAt: string
  name: string
  description: string
  favorite: boolean
  attachmentUrl?: string
}
