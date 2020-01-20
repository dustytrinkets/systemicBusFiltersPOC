# systemicBusFiltersPOC

A POC for adding filters to subscriptions through systemic-azure-bus for Azure Service Bus.

To run the project correctly, make this changes on the __systemic-azure-bus__ package :

On the __index.js__:
-   Change the *'subscribe'* function to this:

    ```
    const subscribe = onError => async (subscriptionId, handler, rule) => {
        const { topic, subscription, errorHandling } = subscriptions[subscriptionId] || {};
        if (!topic || !subscription) throw new Error(`Data for subscription ${subscriptionId} non found!`);
        const receiver = await topicClientFactory.createReceiver(topic, subscription, rule);

        const onMessageHandler = async brokeredMessage => {
            const topicErrorStrategies = {
                retry: errorStrategies.retry(topic),
                deadLetter: errorStrategies.deadLetter(topic),
                exponentialBackoff: errorStrategies.exponentialBackoff(topic, topicClientFactory),
            };
            try {
                enqueuedItems++;
                debug(`Enqueued items increase | ${enqueuedItems} items`);
                debug(`Handling message on topic ${topic}`);
                await handler({ body: getBodyDecoded(brokeredMessage.body, brokeredMessage.userProperties.contentEncoding), userProperties: brokeredMessage.userProperties, properties: getProperties(brokeredMessage) });
                await brokeredMessage.complete();
            } catch (e) {
                const subscriptionErrorStrategy = (errorHandling || {}).strategy;
                const errorStrategy = e.strategy || subscriptionErrorStrategy || 'retry';
                debug(`Handling error with strategy ${errorStrategy} on topic ${topic}`);
                const errorHandler = topicErrorStrategies[errorStrategy] || topicErrorStrategies.retry;
                await errorHandler(brokeredMessage, errorHandling || {});
            } finally {
                enqueuedItems--;
                debug(`Enqueued items decrease | ${enqueuedItems} items`);
            }
        };
        receiver.registerMessageHandler(onMessageHandler, onError, { autoComplete: false });
    };
    ```

-  Add and export these functions:

    ```
    const removeSubscriptionRules = async (subscriptionId) => {
        const { topic, subscription } = subscriptions[subscriptionId] || {};
        if (!topic || !subscription) throw new Error(`Data for subscription ${subscriptionId} non found!`);
        const rules = await topicClientFactory.removeClientRules(topic, subscription);
        return rules;
    };

    const getSubscriptionRules = async subscriptionId => {
        const { topic, subscription } = subscriptions[subscriptionId] || {};
        if (!topic || !subscription) throw new Error(`Data for subscription ${subscriptionId} non found!`);
        const client = connection.createSubscriptionClient(topic, subscription);
        let rules = await client.getRules();
        return rules;
    };
    ```

On the __lib/clientFactories/topics.js__

-  Change the *createReceiver* to this:

    ```
    const createReceiver = async (topic, subscription, rule) => {
		debug(`Preparing connection to receive messages from topic ${topic} on subscription ${subscription}...`);
		const client = connection.createSubscriptionClient(topic, subscription);
		await removeAllRules(client);
		if (rule){
			await client.addRule(rule.property, rule.value);
		} else {
			await client.addRule("$Default", "1=1");
		}
		registeredClients.push(client);
		const receiver = client.createReceiver();
		registeredReceivers.push(receiver);
		return receiver;
	};
    ```


-  Add the following functions, and export the *removeClientRules* and the *getClientRules*.

    ```
    const asyncForEach = async (array, callback) => {
		// eslint-disable-next-line no-plusplus
		for (let index = 0; index < array.length; index++) {
			// eslint-disable-next-line no-await-in-loop
			await callback(array[index], index, array);
		}
	};

	const removeAllRules = async client => {
		const rules = await client.getRules();
		await asyncForEach(rules, async rule => {
			await client.removeRule(rule.name)
		})
	}

	const removeClientRules = async (topic, subscription) =>{
		const client = connection.createSubscriptionClient(topic, subscription);
		await removeAllRules(client);
		await client.addRule("$Default", "1=1");
		registeredClients.push(client);	
		let rules = await client.getRules()
		return rules
	}
    ```