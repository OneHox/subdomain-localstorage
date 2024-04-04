const xdLocalStorage = (function () {

  var iframe;
  var requests = {};
  var requestId = -1;
  var wasInit = false;
  var iframeReady = true;
  var options = {
    iframeId: 'cross-domain-iframe',
    iframeUrl: undefined,
    initCallback: function () { }
  };

  function receiveMessage(event) {
    var data;
    try { data = JSON.parse(event.data); } catch (err) { }
    if (data) {
      if (data.id === 'iframe-ready') {
        iframeReady = true;
        options.initCallback();
      } else {
        if (requests[data.id]) {
          requests[data.id](data);
          delete requests[data.id];
        }
      }
    }
  }

  function buildMessage(action, key, value, callback) {
    requestId++;
    requests[requestId] = callback;
    var data = {
      id: requestId,
      action: action,
      key: key,
      value: value
    };
    iframe.contentWindow.postMessage(JSON.stringify(data), '*');
  }

  function start(customOptions) {
    options = XdUtils.extend(customOptions, options);
    var temp = document.createElement('div');

    if (window.addEventListener) window.addEventListener('message', receiveMessage, false);
    else window.attachEvent('onmessage', receiveMessage);

    temp.innerHTML = '<iframe id="' + options.iframeId + '" src="' + options.iframeUrl + '" style="display: none;"></iframe>';
    document.body.appendChild(temp);
    iframe = document.getElementById(options.iframeId);
  }

  function isDomReady() { return (document.readyState === 'complete'); }
  function isApiReady() {
    if (!wasInit) {
      console.log('You must call xdLocalStorage.init() before using it.');
      return false;
    }
    if (!iframeReady) {
      console.log('You must wait for iframe ready message before using the api.');
      return false;
    }
    return true;
  }

  return {
    init: function (customOptions) { // callback is optional for cases you use the api before window load.
      if (!customOptions.iframeUrl) throw 'You must specify iframeUrl';
      if (wasInit) {
        console.log('xdLocalStorage was already initialized!');
        return;
      }
      wasInit = true;
      if (isDomReady()) start(customOptions);
      else {
        if (document.addEventListener) { // All browsers expect IE < 9
          document.addEventListener('readystatechange', function () { if (isDomReady()) start(customOptions); });
        } else { // IE < 9
          document.attachEvent('readystatechange', function () { if (isDomReady()) start(customOptions); });
        }
      }
    },
    setItem: function (key, value, callback) {
      if (!isApiReady()) return;
      buildMessage('set', key, value, callback);
    },
    getItem: function (key, callback) {
      if (!isApiReady()) return;
      buildMessage('get', key, null, callback);
    },
    removeItem: function (key, callback) {
      if (!isApiReady()) return;
      buildMessage('remove', key, null, callback);
    },
    key: function (index, callback) {
      if (!isApiReady()) return;
      buildMessage('key', index, null, callback);
    },
    getSize: function (callback) {
      if (!isApiReady()) return;
      buildMessage('size', null, null, callback);
    },
    getLength: function (callback) {
      if (!isApiReady()) return;
      buildMessage('length', null, null, callback);
    },
    clear: function (callback) {
      if (!isApiReady()) return;
      buildMessage('clear', null, null, callback);
    },
    wasInit: function () {
      return wasInit;
    }
  };
})();
