const express  = require('express');
const router = express.Router();

const statecontroller = require('../controllers/stateController');
const { ensureAuthenticated, ensureAdmin } = require('../validation/authValidator');


// State routes
router.post('/state', ensureAuthenticated, ensureAdmin, statecontroller.stateRegister);
router.put('/state/update/:id',ensureAuthenticated, ensureAdmin, statecontroller.updateState);
router.get('/states',ensureAuthenticated, ensureAdmin, statecontroller.getState);
router.delete('/state/delete/:id',ensureAuthenticated, ensureAdmin, statecontroller.deleteState);
router.delete('/states/multiple-delete',ensureAuthenticated, ensureAdmin, statecontroller.deleteMultipleStates);


module.exports = router;