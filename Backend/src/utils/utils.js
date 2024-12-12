/**
 * Format DynamoDB item into a standard JSON object.
 * @param {Object} rawItem - Raw DynamoDB item.
 * @param {Array<string>} excludeFields - Fields to exclude from the result.
 * @returns {Object} - Formatted JSON object.
 */
function formatDynamoDBItem(rawItem, excludeFields = []) {
    const formattedItem = {};
  
    for (const key in rawItem) {
      if (excludeFields.includes(key)) {
        continue; // Skip excluded fields
      }
  
      // Extract the value from the DynamoDB data type (S, N, etc.)
      const [dataType, value] = Object.entries(rawItem[key])[0];
      formattedItem[key] = dataType === 'N' ? Number(value) : value;
    }
  
    return formattedItem;
  }
  
module.exports = {
    formatDynamoDBItem
}