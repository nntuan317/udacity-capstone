import { RecipesAccess } from './recipesAcess'
import { RecipeItem } from '../models/RecipeItem'
import { CreateRecipeRequest } from '../requests/CreateRecipeRequest'
import { UpdateRecipeRequest } from '../requests/UpdateRecipeRequest'
import * as uuid from 'uuid'
import { RecipeUpdate } from '../models/RecipeUpdate';
import { createLogger } from '../utils/logger'

const logger = createLogger('recipes')

const recipesAccess = new RecipesAccess()

export async function getRecipes(userId: string): Promise<RecipeItem[]> {
    return await recipesAccess.getRecipes(userId)
}

export async function createRecipe(
    createRecipeRequest: CreateRecipeRequest,
    userId: string
): Promise<RecipeItem> {
    const recipeId = uuid.v4()

    return await recipesAccess.createRecipe({
        recipeId: recipeId,
        userId: userId,
        createdAt: new Date().toISOString(),
        ...createRecipeRequest,
        favorite: false,
        attachmentUrl: ''
    })
}

export async function updateRecipe(
    userId:string,
    recipeId: string,
    updateRecipeRequest: UpdateRecipeRequest
) {
    const validRecipeId: Boolean = await recipesAccess.isRecipeExists(userId, recipeId)
    if (!validRecipeId) {
        throw new Error('Recipe item does not exist')
    }

    const updatedRecipe: RecipeUpdate = {
        name: updateRecipeRequest.name,
        description: updateRecipeRequest.description,
        favorite: updateRecipeRequest.favorite
    }

    return await recipesAccess.updateRecipe(userId, recipeId, updatedRecipe)
}

export async function deleteRecipe(userId:string, recipeId: string) {
    const validRecipeId = await recipesAccess.isRecipeExists(userId, recipeId)
    if (!validRecipeId) {
        logger.info('Delete: cannot find item id')
        throw new Error('Recipe item does not exist')
    }

    return await recipesAccess.deleteRecipe(userId, recipeId)
}

export async function updateImageUrl(userId:string, recipeId: string, bucketName: string) {
    const url: string = `https://${bucketName}.s3.amazonaws.com/${recipeId}`
    await recipesAccess.updateAttachmentUrl(userId, recipeId, url)
}

