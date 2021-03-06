const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/add', storeController.addStore);
router.post('/add', storeController.upload, catchErrors(storeController.resize), catchErrors(storeController.createStore));
router.post('/add/:id', storeController.upload, catchErrors(storeController.resize), catchErrors(storeController.updateStore));
router.get('/stores/:id/edit', catchErrors(storeController.getStore));
router.get('/stores/:slug', catchErrors(storeController.getSlug));
router.get('/tags', catchErrors(storeController.getTag));
router.get('/tags/:id', catchErrors(storeController.getTag));


module.exports = router;