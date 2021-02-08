const modelSrc = require('../models/m-2');

let processor = require('./cad').gProcessor;
processor.setJsCad(modelSrc);
