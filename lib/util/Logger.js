var LEVEL_MAP = {
  'trace': 0,
  'debug': 1,
  'info': 2,
  'warn': 3,
  'error': 4,
  'none': 5
};

var DEFAULT_LEVEL = 'warn';

function Logger(defaultLevel, handler) {

  var level;

  function setLevel(l) {
    level = LEVEL_MAP[l || DEFAULT_LEVEL] || LEVEL_MAP[DEFAULT_LEVEL];
  }

  function setHandler(h) {
    handler = h || console;
  }

  function log(type, args) {

    var requestedLevel = LEVEL_MAP[type] || LEVEL_MAP.none,
        logArgs;

    if (level <= requestedLevel) {
      if (handler) {
        logArgs = Array.prototype.slice.call(args);

        fn = handler[type] || handler.log;
        if (fn) {
          fn.apply(handler, logArgs);
        }
      }
    }
  }

  setLevel(defaultLevel);
  setHandler(handler || console);

  return {
    info: function() {
      log('info', arguments);
    },

    warn: function() {
      log('warn', arguments);
    },

    error: function() {
      log('error', arguments);
    },

    debug: function() {
      log('debug', arguments);
    },

    setLevel: setLevel,

    getLevels: function() {
      return LEVEL_MAP;
    },

    logging: function(temporaryLevel, fn) {
      var old = level;

      setLevel(temporaryLevel);

      fn();

      level = old;
    }
  };
}

module.exports = new Logger();
module.exports.Logger = Logger;