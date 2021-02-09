const modelSrc = require('../models/origin');

let processor = require('./cad').gProcessor;
processor.setJsCad(modelSrc);
