import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getUserId } from '../utils';
import { getRecipes } from '../../helpers/recipes'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event)

    try {
      const items = await getRecipes(userId)
      return {
        statusCode: 200,
        body: JSON.stringify({
          items
        })
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

handler.use(
  cors({
    credentials: true
  })
)
