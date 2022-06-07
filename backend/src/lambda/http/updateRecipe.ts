import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { updateRecipe } from '../../helpers/recipes'
import { UpdateRecipeRequest } from '../../requests/UpdateRecipeRequest'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event)
    const recipeId = event.pathParameters.recipeId
    const updatedRecipe: UpdateRecipeRequest = JSON.parse(event.body)
    try {
      await updateRecipe(userId, recipeId, updatedRecipe)
      return {
        statusCode: 200,
        body: ''
      }
    } catch (err) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: err
        })
      }
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
