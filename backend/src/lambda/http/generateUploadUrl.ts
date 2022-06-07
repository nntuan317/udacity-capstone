import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getUserId } from '../utils'
import { getUploadUrl } from '../../helpers/attachmentUtils'
import { updateImageUrl } from '../../helpers/recipes'
import { createLogger } from '../../utils/logger'

const logger = createLogger('generatUploadUrl')

const bucketName = process.env.ATTACHMENT_S3_BUCKET

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const recipeId = event.pathParameters.recipeId
    const userId = getUserId(event)
    const url = await getUploadUrl(userId, recipeId)

    try {
      await updateImageUrl(userId, recipeId, bucketName)
      return {
        statusCode: 200,
        body: JSON.stringify({
          uploadUrl: url
        })
      }
    } catch (err) {
      logger.error(`Get error e = ${err.message}`)
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
