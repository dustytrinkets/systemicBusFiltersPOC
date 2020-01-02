/* eslint-disable*/
module.exports = () => {
	const start = async ({ bus }) => {
		const body = { content: 'Some content' };

		const metadataNoordhoff = {
			userProperties: {
				liberContent: 'Noordhoff',
			},
		}
		const metadataPlantyn = {
			userProperties: {
				liberContent: 'Plantyn',
			},
		}

		const onError = mess => console.error(mess);
		const onStop = mess => console.warn(mess);
		const subscribe = await bus.subscribe(onError, onStop);

		
		let o = 1;
		const processTestCreatedDefault = async message => {
			console.log('Test Creation particle active: Default. ', o);
			o++;
		};

		let m = 1;
		const processTestCreatedNoordhoff = async message => {
			console.log('Test Creation particle active: Noordhoff', m);
			m++;
		};

		let n = 1;
		const processTestCreatedPlantyn = async message => {
			console.log('Test Creation particle active: Plantyn', n);
			n++;
		};
		

		const filterConstructor = (property, value) => ({
			property,
			value: `${property}='${value}'`
		});
		let noordhoffFilter = filterConstructor('liberContent', 'Noordhoff')
		let plantynFilter = filterConstructor('liberContent', 'Plantyn')

		const subscribeWithFilters = async () =>{
				
			await subscribe('defaultSubscription', processTestCreatedDefault);
			await subscribe('noordhoffSubscription', processTestCreatedNoordhoff, noordhoffFilter );
			await subscribe('plantynSubscription', processTestCreatedPlantyn, plantynFilter);

			await bus.publish('particleCreated')(body, metadataNoordhoff);
			await bus.publish('particleCreated')(body, metadataPlantyn);
			await bus.publish('particleCreated')(body);
		}

		const subscribeWithNoFilters = async () =>{
				
			await subscribe('defaultSubscription', processTestCreatedDefault);
			await subscribe('noordhoffSubscription', processTestCreatedNoordhoff );
			await subscribe('plantynSubscription', processTestCreatedPlantyn);

			await bus.publish('particleCreated')(body, metadataNoordhoff);
			await bus.publish('particleCreated')(body, metadataPlantyn);
			await bus.publish('particleCreated')(body);
		}

		const removeRules = async () => {
			let defaultRules = await bus.removeRules('defaultSubscription');
			let noordhoffRules = await bus.removeRules('noordhoffSubscription');
			let plantynRules = await bus.removeRules('plantynSubscription');
			return {
				defaultRules,
				noordhoffRules,
				plantynRules
			}
		}

		const getRules = async () => {
			let defaultRules = await bus.getRules('defaultSubscription');
			let noordhoffRules = await bus.getRules('noordhoffSubscription');
			let plantynRules = await bus.getRules('plantynSubscription');
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

	

		return {subscribeWithFilters, subscribeWithNoFilters, removeRules, getRules};
	};
	return { start };
};
