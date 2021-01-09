import AWS from 'aws-sdk'
import validator from '@middy/validator'
import getAuctionSchema from '../lib/schemas/getAuctionSchema'

import commonMiddleware from '../lib/commonMiddleware'
import createError from 'http-errors'
import { Stats } from 'webpack'

const dynamodb = new AWS.DynamoDB.DocumentClient()

async function getAuctions(event, context) {
  const {status} = event.queryStringParameters
  let auctions

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    IndexName: 'statusAndEndDate',
    KeyConditionExpression: '#status = :status',
    ExpressionAttributeValues:{
        ':status' : status,
    },
    ExpressionAttributeNames: {
        '#status' : 'status'
    }
  }

  try{
    const result = await dynamodb.query(params).promise()

    auctions = result.Items

  }catch(error){
      console.log(error)
      throw new createError.InternalServerError(error)
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auctions),
  };
}

export const handler = commonMiddleware(getAuctions)
    .use(validator({inputSchema: getAuctionSchema, useDefaults: true }))


