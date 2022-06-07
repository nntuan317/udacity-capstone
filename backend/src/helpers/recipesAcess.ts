import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { RecipeItem } from '../models/RecipeItem'
import { RecipeUpdate } from '../models/RecipeUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('RecipesAccess')

const recipeIdIndex = process.env.RECIPES_CREATED_AT_INDEX

export class RecipesAccess {

    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly recipeTable = process.env.RECIPES_TABLE) {
    }

    async getRecipes(userId: string): Promise<RecipeItem[]> {
        logger.info(`Getting all Recipe Items for userId = ${userId}`)
        const result = await this.docClient.query({
            TableName: this.recipeTable,
            IndexName: recipeIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        const items = result.Items
        return items as RecipeItem[]
    }

    async createRecipe(recipeItem: RecipeItem): Promise<RecipeItem> {
        logger.info('Creating Recipe Item')
        await this.docClient.put({
            TableName: this.recipeTable,
            Item: recipeItem
        }).promise()

        return recipeItem
    }

    async isRecipeExists(userId:string, recipeId: string): Promise<Boolean> {
        logger.info(`Getting Recipe item, recipeId = ${recipeId}`)

        const result = await this.docClient
            .get({
                TableName: this.recipeTable,
                Key: {
                    userId: userId,
                    recipeId: recipeId
                }
            }).promise()

        return !!result.Item
    }

    async updateRecipe(userId:string, recipeId: string, recipeUpdate: RecipeUpdate) {
        logger.info(`Updating Recipe Item, recipeId = ${recipeId}`)
        await this.docClient.update({
            TableName: this.recipeTable,
            Key: {
                userId: userId,
                recipeId: recipeId
            },
            UpdateExpression: 'set #namefield = :name, description = :description, favorite = :favorite',
            ExpressionAttributeNames: {
                "#namefield": "name"
            },
            ExpressionAttributeValues: {
                ':name': recipeUpdate.name,
                ':description': recipeUpdate.description,
                ':favorite': recipeUpdate.favorite
            }
        }).promise()
    }

    async updateAttachmentUrl(userId:string, recipeId: string, url: string) {
        logger.info(`Updating image URL = ${url} with recipeId = ${recipeId}`)
        await this.docClient.update({
            TableName: this.recipeTable,
            Key: {
                userId: userId,
                recipeId: recipeId
            },
            UpdateExpression: 'set #attachmentURLField = :url',
            ExpressionAttributeNames: {
                '#attachmentURLField': 'attachmentUrl'
            },
            ExpressionAttributeValues: {
                ':url': url
            },
        }).promise()
    }

    async deleteRecipe(userId: string, recipeId: string) {
        logger.info(`Deleting Recipe Item, recipeId = ${recipeId}`)
        const param = {
            TableName: this.recipeTable,
            Key: {
                userId: userId,
                recipeId: recipeId
            }
        }
        await this.docClient.delete(param).promise()
    }
}