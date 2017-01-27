'use strict';

var EventTarget = EventTarget || Element;

EventTarget.prototype.addEventListenerOnce = function(name, callback) {
  var eventWrapper = function(event) {
    this.removeEventListener(name, eventWrapper);
    callback(event);
  }.bind(this);

  this.addEventListener(name, eventWrapper);

  return this;
};
