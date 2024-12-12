const fs = require('fs');
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require('uuid');
const jwt = require("jsonwebtoken");
const { PutItemCommand, GetItemCommand, QueryCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const dynamoDBClient = require("../db/db.config");
const s3Client = require("../s3/s3.config");
const { formatDynamoDBItem } = require("../utils/utils");

const defaultXML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                  id="Definitions_1"
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="Start">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Task_1" name="Sample Task">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:task>
    <bpmn:endEvent id="EndEvent_1" name="End">
      <bpmn:incoming>Flow_2</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="EndEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="152" y="102" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_1_di" bpmnElement="Task_1">
        <dc:Bounds x="240" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="392" y="102" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="188" y="120" />
        <di:waypoint x="240" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="340" y="120" />
        <di:waypoint x="392" y="120" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Fetch user from DynamoDB
    const getItemCommand = new GetItemCommand({
      TableName: 'users',
      Key: {
        email: { S: email }
      }
    });

    const { Item } = await dynamoDBClient.send(getItemCommand);

    if (!Item) {
      return res.status(200).json({ status: false, message: "Invalid email or password" });
    }
    // Compare provided password with stored hashed password
    const isPasswordValid = await bcrypt.compare(password, Item.password.S);

    if (!isPasswordValid) {
      return res.status(200).json({ status: false, message: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign({ user: { userID: Item.id.S, email: email }, role: "user" }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_SECRET_EXPIRE
    });

    res.json({
      status: true,
      message: 'Login success!',
      token: token
    });
  } catch (err) {
    console.error("Server error during login:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(200).json({ status: false, message: "All fields is required!" });
  }
  try {
    // Fetch user from DynamoDB
    const getItemCommand = new GetItemCommand({
      TableName: 'users',
      Key: {
        email: { S: email }
      }
    });

    const { Item } = await dynamoDBClient.send(getItemCommand);
    if (!Item) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      const newID = uuidv4();
      const diagramID = uuidv4();
      // DynamoDB parameters to put the user
      const putItemCommand = new PutItemCommand({
        TableName: 'users',
        TableName: 'users',
        Item: {
          id: { S: newID },
          name: { S: name },
          email: { S: email },
          password: { S: hashedPassword },
        }
      });
      const putItemCommandDiagram = new PutItemCommand({
        TableName: 'diagrams',
        Item: {
          id: { S: diagramID },
          userID: { S: newID },
          email: { S: email },
          xml: { S: defaultXML }
        }
      });
      // Put the new user into DynamoDB
      await dynamoDBClient.send(putItemCommand);
      await dynamoDBClient.send(putItemCommandDiagram);
      // Generate a JWT token
      const token = jwt.sign(
        { user: { userID: newID, email: email }, role: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_SECRET_EXPIRE }
      );

      return res.json({
        status: true,
        userId: newID,
        token: token,
        message: "Registered successfully"
      });
    } else if (Item.email.S === email) {
      return res.status(200).json({ status: false, message: "Email is already exist!" });
    }

  } catch (err) {
    console.error("Server error during signup:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserProfile = async (req, res) => {
  // try {
  //   // Fetch user from DynamoDB
  //   const getItemCommand = new GetItemCommand({
  //     TableName: 'users',
  //     Key: {
  //       email: { S: req.user.email }
  //     }
  //   });

  //   const { Item } = await dynamoDBClient.send(getItemCommand);

  //   if (!Item) {
  //     return res.status(404).json({ status: false, message: "User not found!" });
  //   }
  //   const data = formatDynamoDBItem(Item, ['password'])
  //   return res.json({
  //     status: true,
  //     data: data
  //   });
  // } catch (err) {
  //   console.error("Server error during getting profile:", err);
  //   res.status(500).json({ message: "Server error" });
  // }
};

exports.getDiagram = async (req, res) => {
  try {
    const params = {
      TableName: 'diagrams',
      IndexName: 'userID-index', // Replace with your GSI name
      KeyConditionExpression: 'userID = :userID', // Use 'userID' as partition key in GSI
      ExpressionAttributeValues: {
        ':userID': { S: req.user.userID }
      }
    };

    const command = new QueryCommand(params);
    const response = await dynamoDBClient.send(command);

    // Format the response items using your utility function
    const formattedData = response.Items.map(item => formatDynamoDBItem(item));
    return res.send({
      status: true,
      data: formattedData
    })
  } catch (error) {
    console.error('Error fetching diagrams:', error);
    res.status(500).json({ message: "Server error" });
  }
}

exports.updateDiagram = async (req, res) => {
  try {
    // Extract the diagramId and xmlData from the request body
    const { id, xml } = req.body; // Assuming body contains diagramId and new XML data

    // Create update parameters for DynamoDB
    const params = {
      TableName: 'diagrams',  // Replace with your DynamoDB table name
      Key: {
        id: { S: id }, // Partition key (diagramId)
        userID: { S: req.user.userID }
      },
      UpdateExpression: 'SET xml = :xml',  // Only update the xmlData field
      ExpressionAttributeValues: {
        ':xml': { S: xml },  // New XML data
      },
      ReturnValues: 'ALL_NEW',  // Return the updated item (optional)
    };

    // Send the update request to DynamoDB
    const command = new UpdateItemCommand(params);
    const response = await dynamoDBClient.send(command);
    // Return the updated diagram XML data as response
    return res.send({ status: true, xml: xml });  // Send the new XML data back

  } catch (error) {
    console.error("Error updating diagram:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createDiagram = async (req, res) => {
  try {
    // Extract the diagramId and xmlData from the request body
    const { id } = req.body; // Assuming body contains diagramId and new XML data
    const xml = defaultXML;

    console.log("id: ", id);

    // Create update parameters for DynamoDB
    const params = {
      TableName: 'diagrams',  // Replace with your DynamoDB table name
      Key: {
        id: { S: id }, // Partition key (diagramId)
        userID: { S: req.user.userID }
      },
      UpdateExpression: 'SET xml = :xml',  // Only update the xmlData field
      ExpressionAttributeValues: {
        ':xml': { S: xml },  // New XML data
      },
      ReturnValues: 'ALL_NEW',  // Return the updated item (optional)
    };

    // Send the update request to DynamoDB
    const command = new UpdateItemCommand(params);
    const response = await dynamoDBClient.send(command);
    // Return the updated diagram XML data as response
    return res.send({ status: true, xml: xml });  // Send the new XML data back

  } catch (error) {
    console.error("Error updating diagram:", error);
    res.status(500).json({ message: "Server error" });
  }
};