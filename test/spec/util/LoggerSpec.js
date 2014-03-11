var _ = require('lodash');

var Logger = require('../../../lib/util/Logger').Logger;

var Helper = require('../Helper');

describe('Logger', function() {

  var log;

  beforeEach(Helper.initAdditionalMatchers);

  function createLogger() {

    log = {};

    log.log = function() {};
    log.debug = function() {};
    log.warn = function() {};
    log.info = function() {};

    spyOn(log, 'log');
    spyOn(log, 'warn');
    spyOn(log, 'info');
    spyOn(log, 'debug');

    return new Logger('warn', log);
  }

  it('should forward to handler', function() {

    // given
    var logger = createLogger();

    // when
    logger.warn('FOO', 'BAR');

    // then
    expect(log.warn).toHaveBeenCalledWith('FOO', 'BAR');
  });

  it('should silence verbose', function() {

    // given
    var logger = createLogger();

    // when
    logger.debug('FOO', 'BAR');

    // then
    expect(log.debug).not.toHaveBeenCalled();
  });

  it('should configure level', function() {

    // given
    var logger = createLogger();

    // when
    logger.setLevel('debug');

    logger.debug('FOO', 'BAR');

    // then
    expect(log.debug).toHaveBeenCalledWith('FOO', 'BAR');
  });

  it('should default to handler#log', function() {

    // given
    var logger = createLogger();

    // when
    logger.error('FOO', 'BAR');

    // then
    expect(log.log).toHaveBeenCalledWith('FOO', 'BAR');
  });
});