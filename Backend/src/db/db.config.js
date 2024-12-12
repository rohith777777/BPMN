const { logger } = require('../../logger');
const { DynamoDBClient, ListTablesCommand } = require('@aws-sdk/client-dynamodb');

// Initialize DynamoDB client with logging
let dynamoDBClient;
try {
  dynamoDBClient = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  // Check connection by calling an operation, such as ListTables (requires permission)
  dynamoDBClient.send(new ListTablesCommand({}))
    .then(() => {
      logger.info("Connected to DynamoDB successfully");
    })
    .catch((error) => {
      logger.error("Error connecting to DynamoDB:", error);
    });
} catch (error) {
  logger.error("Failed to initialize DynamoDB client:", error);
}

module.exports = dynamoDBClient;