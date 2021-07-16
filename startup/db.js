const winston = require('winston');
const mongoose = require('mongoose');
const config = require('config');

const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
});

module.exports = function () {
  const db = config.get('db');

  mongoose.set('useCreateIndex', true);
  mongoose
    .connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => logger.info(`Connected to ${db}...`));
};
