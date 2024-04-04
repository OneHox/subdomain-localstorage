(function () {

  var defaultData = {
  };

  function postData(id, data) {
    var mergedData = XdUtils.extend({...data, id}, defaultData);
    parent.postMessage(JSON.stringify(mergedData), '*');
  }

  function getData(id, key) {
    var value = localStorage.getItem(key);
    postData(id, { key, value  });
  }

  function setData(id, key, value) {
    localStorage.setItem(key, value);
    var checkGet = localStorage.getItem(key);
    postData(id, { success: checkGet === value });
  }

  function removeData(id, key) {
    localStorage.removeItem(key);
    postData(id, {});
  }

  function getKey(id, index) {
    var key = localStorage.key(index);
    postData(id, { key: key });
  }

  function getSize(id) {
    var size = JSON.stringify(localStorage).length;
    postData(id, { size: size });
  }

  function getLength(id) {
    var length = localStorage.length;
    postData(id, { length: length });
  }

  function clear(id) {
    localStorage.clear();
    postData(id, {});
  }

  function receiveMessage(event) {
    var data;
    try { data = JSON.parse(event.data); } catch {}

    if (data) {
      if (data.action === 'set') {
        setData(data.id, data.key, data.value);
      } else if (data.action === 'get') {
        getData(data.id, data.key);
      } else if (data.action === 'remove') {
        removeData(data.id, data.key);
      } else if (data.action === 'key') {
        getKey(data.id, data.key);
      } else if (data.action === 'size') {
        getSize(data.id);
      } else if (data.action === 'length') {
        getLength(data.id);
      } else if (data.action === 'clear') {
        clear(data.id);
      }
    }
  }

  if (window.addEventListener) {
    window.addEventListener('message', receiveMessage, false);
  } else {
    window.attachEvent('onmessage', receiveMessage);
  }

  function sendOnLoad() {
    var data = {
      id: 'iframe-ready'
    };
    parent.postMessage(JSON.stringify(data), '*');
  }
  // on creation
  sendOnLoad();
})();