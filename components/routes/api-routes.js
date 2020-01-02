const { handleError, tagError } = require('../../lib/errors/errorHandler');

module.exports = () => {
	const start = async ({ app, controller, logger }) => {
		app.post('/subscribe-filters', async (req, res, next) => {
			try {
				const result = await controller.subscribeWithFilters();
				return res.json(result);
			} catch (error) {
				return next(tagError(error));
			}
		});

		app.post('/subscribe-no-filters', async (req, res, next) => {
			try {
				const result = await controller.subscribeWithNoFilters();
				return res.json(result);
			} catch (error) {
				return next(tagError(error));
			}
		});

		app.post('/publish', async (req, res, next) => {
			try {
				const result = await controller.publishContents();
				return res.json(result);
			} catch (error) {
				return next(tagError(error));
			}
		});


		app.post('/removerules', async (req, res, next) => {
			try {
				const result = await controller.removeRules();
				return res.json(result);
			} catch (error) {
				return next(tagError(error));
			}
		});

		app.post('/getrules', async (req, res, next) => {
			try {
				const result = await controller.getRules();
				return res.json(result);
			} catch (error) {
				return next(tagError(error));
			}
		});


		app.use(handleError(logger));
	};

	return { start };
};
