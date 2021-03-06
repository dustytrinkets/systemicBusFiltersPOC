/* eslint-disable*/
module.exports = () => {
	const start = async ({ bus }) => {
		const body = { content: 'Some content' };

		const metadataNoordhoff = {
			userProperties: {
				opco: 'Noordhoff',
			},
		}
		const metadataPlantyn = {
			contentType: 'Plantyn',
		};

		const onError = mess => console.error(mess);
		const onStop = mess => console.warn(mess);
		const subscribe = await bus.subscribe(onError, onStop);

		
		let o = 1;
		const processDefault = async message => {
			console.log('Default. ', o);
			o++;
		};

		let m = 1;
		const processNoordhoff = async message => {
			console.log('Noordhoff', m);
			m++;
		};

		let n = 1;
		const processPlantyn = async message => {
			console.log('Plantyn', n);
			n++;
		};
		

		const sqlFilterConstructor = (ruleName, value) => ({
			ruleName,
			value: `${ruleName}='${value}'`
		});

		const correlationFilterConstructor = (ruleName, value) => ({
			ruleName,
			value,
		});

		let noordhoffFilter = sqlFilterConstructor('opco', 'Noordhoff')
		let plantynFilter = correlationFilterConstructor('opco', {contentType:'Plantyn'})

		const subscribeWithFilters = async () =>{
				
			await subscribe('defaultSubscription', processDefault);
			await subscribe('noordhoffSubscription', processNoordhoff, noordhoffFilter );
			await subscribe('plantynSubscription', processPlantyn, plantynFilter);
		}

		const subscribeWithNoFilters = async () =>{
				
			await subscribe('defaultSubscription', processDefault);
			await subscribe('noordhoffSubscription', processNoordhoff );
			await subscribe('plantynSubscription', processPlantyn);
		}

		const publishContents = async () =>{
			m= n = o = 1;
			await bus.publish('particleCreated')(body, metadataNoordhoff);
			await bus.publish('particleCreated')(body, metadataPlantyn);
			await bus.publish('particleCreated')(body);
		}

		const removeRules = async () => {
			m= n = o = 1;
			let defaultRules = await bus.removeSubscriptionRules('defaultSubscription');
			let noordhoffRules = await bus.removeSubscriptionRules('noordhoffSubscription');
			let plantynRules = await bus.removeSubscriptionRules('plantynSubscription');
			return {
				defaultRules,
				noordhoffRules,
				plantynRules
			}
		}

		const getRules = async () => {
			m= n = o = 1;
			let defaultRules = await bus.getSubscriptionRules('defaultSubscription');
			let noordhoffRules = await bus.getSubscriptionRules('noordhoffSubscription');
			let plantynRules = await bus.getSubscriptionRules('plantynSubscription');
			return {
				defaultRules,
				noordhoffRules,
				plantynRules
			}
		}

	


	

		// let q = 1;
		// const processDlqTestParticleCreatedMessage = async message => {
		// 	console.log('Creation test particle dead letter queue', q);
		// 	await message.complete();
		// 	q++;
		// };
		
		// bus.processDlq('defaultSubscription', processDlqTestParticleCreatedMessage);

	

		return {subscribeWithFilters, subscribeWithNoFilters, publishContents, removeRules, getRules};
	};
	return { start };
};
