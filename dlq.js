require('dotenv').config();

const { ServiceBusClient, ReceiveMode, TopicClient } = require('@azure/service-bus');

const connectionString = process.env.CONNECTION_STRING_SERVICE_BUS;
const topicName = process.env.TOPIC;
const subscriptionName = process.env.SUBSCRIPTION;
const sbClient = ServiceBusClient.createFromConnectionString(connectionString);

const sendMessage = async () => {
	const queueClient = sbClient.createTopicClient(topicName);
	const sender = queueClient.createSender();

	const message = {
		body: { name: '3Creamy Chicken Pasta', type: 'Dinner' },
		contentType: 'application/json',
		label: 'Recipe',
		test: 'test',
	};
	await sender.send(message);
	await queueClient.close();
};

const receiveMessage = async () => {
	// If receiving from a Subscription, use `createSubscriptionClient` instead of `createQueueClient`
	const queueClient = sbClient.createSubscriptionClient(topicName, subscriptionName);
	const receiver = queueClient.createReceiver(ReceiveMode.peekLock);

	const messages = await receiver.receiveMessages(5);


	if (messages.length) {
		console.log(
			'>>>>> Deadletter the one message received from the main queue - ',
			messages[0].body,
		);
		console.log(messages);
		// Send to Deadletter the message received
		await messages[0].deadLetter({
			deadletterReason: 'Incorrect Recipe type',
			deadLetterErrorDescription: 'Recipe type does not  match preferences.',
		});
	} else {
		console.log('>>>> Error: No messages were received from the main queue.');
	}

	await queueClient.close();
};


async function main() {
	try {
		// Sending a message to ensure that there is atleast one message in the main queue
		await sendMessage();

		await receiveMessage();
	} finally {
		await sbClient.close();
	}
}

main().catch(err => {
	console.log('Error occurred: ', err);
});
