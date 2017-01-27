var getTransitionEnd = function() {
  if (window.QUnit) {
    return false;
  }

  var el = document.createElement('div');

  var TransitionEndEvent = {
    WebkitTransition: 'webkitTransitionEnd',
    MozTransition: 'transitionend',
    OTransition: 'oTransitionEnd otransitionend',
    transition: 'transitionend'
  };

  for (var name in TransitionEndEvent) {
    if (el.style[name] !== undefined) {
      return TransitionEndEvent[name];
    }
  }

  return false;
};

var transitionEnd = getTransitionEnd();

var EventTarget = EventTarget || Element;

EventTarget.prototype.transitionEndFallback = function(duration) {
  if (transitionEnd) return this;

  var transitionendEvent = document.createEvent('TransitionEvent');
  transitionendEvent.initEvent('transitionend', true, true);

  window.setTimeout(function() {
    this.dispatchEvent(transitionendEvent);
  }.bind(this), duration);

  return this;
};

module.exports = transitionEnd;
