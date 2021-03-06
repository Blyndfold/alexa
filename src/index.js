/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * This simple sample has no external dependencies or session management, and shows the most basic
 * example of how to create a Lambda function for handling Alexa Skill requests.
 *
 * Examples:
 * One-shot model:
 *  User: "Alexa, tell Hello World to say hello"
 *  Alexa: "Hello World!"
 */

/**
 * App ID for the skill
 */
var APP_ID = 'amzn1.ask.skill.05d1e06d-e4c0-4d37-afec-ab841d45925e'; //replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";

var http = require('http');

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * HelloWorld is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var HelloWorld = function () {
    AlexaSkill.call(this, APP_ID);
};

// Function to make the initial request to our backend
function initialLookup (searchTerm, priceLevel, distance, callback) {
  var endpoint = 'http://blyndfoldme.herokuapp.com/api/random';

  if (!distance || distance === undefined) {
    distance = 5;
  }

  if (!priceLevel || priceLevel === undefined) {
    priceLevel = 2;
  }

  var queryString = `?term=${searchTerm}&price=${priceLevel}&distance=${distance}`;

  console.log(endpoint + queryString);

  http.get(endpoint + queryString, function (res) {
    var body = '';

    res.on('data', function (data) {
      body += data;
    });

    res.on('end', function () {
      var parsed = JSON.parse(body);
      return callback(parsed);
    });
  });
}

// Extend AlexaSkill
HelloWorld.prototype = Object.create(AlexaSkill.prototype);
HelloWorld.prototype.constructor = HelloWorld;

HelloWorld.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("HelloWorld onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

HelloWorld.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("HelloWorld onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    var speechOutput = "Welcome to Blindfold, what do you want to do?";
    var repromptText = "You can say hello";
    response.ask(speechOutput, repromptText);
};

HelloWorld.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("HelloWorld onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

HelloWorld.prototype.intentHandlers = {
    // register custom intent handlers
    "AMAZON.HelpIntent": function (intent, session, response) {
      response.ask("You can say hello to me!", "You can say hello to me!");
    },
    "PickCategoryIntent": function (intent, session, response) {
      var categoySlotValue = intent.slots.Category.value;
      response.ask(`Okay, I will look for a place that has ${categoySlotValue}.`);
    },
    "OneshotEventIntent": function (intent, session, response) {
      var categoySlotValue = intent.slots.Category.value;
      var costSlotValue = intent.slots.Cost.value;
      var distanceSlotValue = intent.slots.Distance.value;

      var message;

      if (categoySlotValue !== undefined) {
        message = `Okay, I found a place that has ${costSlotValue ? costSlotValue : ''} ${categoySlotValue}`;
    
        if (distanceSlotValue) {
          message += ` and is within ${distanceSlotValue} miles from you`;
        }

        message += '!';
      } else {
        message = 'Sorry, I could not understand that. I can understand things such as: find me cheap tacos.';
      }

      initialLookup(categoySlotValue, costSlotValue, distanceSlotValue, function (data) {
        console.log('Callback me maybe');
        console.log(data);

        message += ` ${data.lyft.name} is ${data.lyft.eta} minutes away. Keep an eye out for their ${data.lyft.car}.`;

        response.ask(message);
      });
    }
};

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
  // Create an instance of the HelloWorld skill.
  var helloWorld = new HelloWorld();
  helloWorld.execute(event, context);
};
