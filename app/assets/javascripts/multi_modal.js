require('./helpers/event_target');
require('./helpers/request_animation_frame');
var transitionEnd = require('./helpers/transition_end');

var multiModal;

var MultiModal = (function() {
  function MultiModal() {
    this.escapeKeycode                 = 27;
    this.transitionDurationBackdropIn  = 450;
    this.transitionDurationBackdropOut = 700;
    this.transitionDurationModalIn     = 350;
    this.transitionDurationModalOut    = 250;
    this.scrollbarWidth                = window.innerWidth - document.documentElement.clientWidth + 'px';
    this.transitionEnd                 = transitionEnd ? transitionEnd : 'transitionend';

    this.isActive                      = false;
    this.isAnimating                   = false;
    this.backdropIsAnimating           = false;
    this.modalIsAnimating              = false;

    this._escCloseListeners            = {};
    this._closeListener                = this.close.bind(this);
    this._closeAllListener             = this.closeAll.bind(this);
    this._outerClickListener           = this._outerClick.bind(this);

    this.bootstrap();
  }

  MultiModal.prototype.bootstrap = function() {
    this.modalToggles = document.querySelectorAll('.js-m-modal-toggle');
    this.modals       = document.querySelectorAll('.js-m-modal');
    this.modalDialogs = document.querySelectorAll('.js-m-modal-dialog');
    this.modalWrapper = document.querySelector('.js-m-modal-wrapper');
    this.backdrop     = document.querySelector('.js-m-modal-backdrop');
    this.isIE         = this.modalWrapper && this.modalWrapper.classList.contains('js-m-modal-ie');

    this.modalToggles.forEach(function(modalToggle) {
      modalToggle.addEventListener('click', this._toggleModal.bind(this));
    }.bind(this));

    this.verticallyPositionModals();
  };

  MultiModal.prototype.open = function(id, callback) {
    if (this.isAnimating) return;
    this.isAnimating = true;

    if (!this.isActive) {
      this._fadeInBackdrop();
      this._disableScrolling();
      this.modalWrapper.classList.add('is-active');
      this.isActive = true;
    }

    if (typeof id === 'string') {
      var modal = this._selectModalById(id);
    } else {
      var modal = this.modals[0];
    }

    this._animateInModal(modal, callback);
    this._animateInOpenModals();
  };

  MultiModal.prototype.close = function(id) {
    if (this.isAnimating) return;
    this.isAnimating = true;

    var modal;

    if (typeof id === 'string') {
      modal = this._selectModalById(id);
    } else {
      this.modals.forEach(function(modalElement) {
        if (modalElement.getAttribute('data-modal-level') == 1) {
          modal = modalElement;
        }
      });
    }

    this._animateOutModal(modal);
    this._animateOutOpenModals();

    window.requestAnimationFrame(function() {
      var totalLevels = 0;

      this.modals.forEach(function(modal) {
        totalLevels += parseInt(modal.getAttribute('data-modal-level'));
      });

      if (totalLevels === 0) {
        this._fadeOutBackdrop();
      }
    }.bind(this));
  };

  MultiModal.prototype.closeAll = function() {
    if (this.isAnimating) return;
    this.isAnimating = true;

    this.modals.forEach(function(modal) {
      if (modal.getAttribute('data-modal-level') > 0) {
        this._animateOutModal(modal);
      }
    }.bind(this));

    window.requestAnimationFrame(function() {
      this._fadeOutBackdrop();

      this.backdrop.addEventListenerOnce(this.transitionEnd, function() {
        this.modalWrapper.classList.remove('is-active');
        this._enableScrolling();
        this.isAnimating = false;
        this.isActive = false;
      }.bind(this)).transitionEndFallback(this.transitionDurationBackdropOut);
    }.bind(this));
  };

  MultiModal.prototype.verticallyPositionModals = function() {
    if (!this.isIE) return;

    this.modalDialogs.forEach(function(modalDialog) {
      modalDialog.style.marginTop = ((this.modalWrapper.clientHeight - modalDialog.clientHeight) / 2) + 'px';
    }.bind(this));
  };

  // private

  MultiModal.prototype._toggleModal = function(event) {
    this.open(event.currentTarget.getAttribute('data-modal-id'));
  };

  MultiModal.prototype._selectModalById = function(id) {
    var modal;

    this.modals.forEach(function(modalElement) {
      if (modalElement.getAttribute('data-modal-id') == id) {
        modal = modalElement;
      }
    });

    return modal;
  };

  MultiModal.prototype._animateInModal = function(modal, callback) {
    this.modalIsAnimating = true;
    modal.classList.add('is-prepared');

    window.requestAnimationFrame(function() {
      modal.setAttribute('data-modal-level', '1');

      modal.addEventListenerOnce(this.transitionEnd, function() {
        this.modalIsAnimating = false;
        this._setAnimatingState();
        this._addModalEventListeners(modal);

        if (typeof callback === 'function') {
          callback();
        }
      }.bind(this)).transitionEndFallback(this.transitionDurationModalIn);
    }.bind(this));
  };

  MultiModal.prototype._animateOutModal = function(modal) {
    this.modalIsAnimating = true;
    modal.classList.add('is-closing');

    window.requestAnimationFrame(function() {
      modal.setAttribute('data-modal-level', '0');

      modal.addEventListenerOnce(this.transitionEnd, function() {
        modal.classList.remove('is-prepared', 'is-closing');
        this.modalIsAnimating = false;
        this._setAnimatingState();
        this._removeModalEventListeners(modal);
      }.bind(this)).transitionEndFallback(this.transitionDurationModalOut);
    }.bind(this));
  };

  MultiModal.prototype._animateInOpenModals = function() {
    this.modals.forEach(function(modal) {
      if (modal.getAttribute('data-modal-level') > 0) {
        modal.setAttribute('data-modal-level', parseInt(modal.getAttribute('data-modal-level')) + 1);
      }
    });
  };

  MultiModal.prototype._animateOutOpenModals = function() {
    this.modals.forEach(function(modal) {
      if (modal.getAttribute('data-modal-level') > 1) {
        modal.setAttribute('data-modal-level', parseInt(modal.getAttribute('data-modal-level')) - 1);
      }
    });
  };

  MultiModal.prototype._fadeInBackdrop = function() {
    if (this.isActive) return;
    this.backdropIsAnimating = true;

    this.backdrop.classList.add('is-prepared');

    window.requestAnimationFrame(function() {
      this.backdrop.classList.add('is-active');

      this.backdrop.addEventListenerOnce(this.transitionEnd, function() {
        this.backdropIsAnimating = false;
        this._setAnimatingState();
      }.bind(this)).transitionEndFallback(this.transitionDurationBackdropIn);
    }.bind(this));
  };

  MultiModal.prototype._fadeOutBackdrop = function() {
    this.backdropIsAnimating = true;
    this.backdrop.classList.add('is-closing');

    window.requestAnimationFrame(function() {
      this.backdrop.classList.remove('is-active');

      this.backdrop.addEventListenerOnce(this.transitionEnd, function() {
        this.backdrop.classList.remove('is-prepared', 'is-closing');
        this.modalWrapper.classList.remove('is-active');
        this.backdropIsAnimating = false;
        this._enableScrolling();
        this._setAnimatingState();
        this.isActive = false;
      }.bind(this)).transitionEndFallback(this.transitionDurationBackdropOut);
    }.bind(this));
  };

  MultiModal.prototype._enableScrolling = function() {
    document.documentElement.style.overflow = '';
    document.body.style.marginRight = '';
  };

  MultiModal.prototype._disableScrolling = function() {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.marginRight = this.scrollbarWidth;
  };

  MultiModal.prototype._outerClick = function(event) {
    event.stopPropagation();
    if (event.target !== event.currentTarget) return;

    this.close();
  };

  MultiModal.prototype._setAnimatingState = function() {
    if (this.backdropIsAnimating || this.modalIsAnimating) return;

    this.isAnimating = false;
  };

  MultiModal.prototype._escClose = function(event) {
    if (event.which !== this.escapeKeycode) return;

    this.close();
  };

  MultiModal.prototype._addModalEventListeners = function(modal) {
    var modalCloseElements    = modal.querySelectorAll('.js-m-modal-close');
    var modalCloseAllElements = modal.querySelectorAll('.js-m-modal-close-all');
    var modalOuterElements    = modal.querySelectorAll('.js-m-modal-outer');

    this._escCloseListeners[modal.getAttribute('data-modal-id')] = this._escClose.bind(this);

    window.addEventListener('keydown', this._escCloseListeners[modal.getAttribute('data-modal-id')]);

    modalCloseElements.forEach(function(modalClose) {
      modalClose.addEventListener('click', this._closeListener);
    }.bind(this));

    modalCloseAllElements.forEach(function(modalCloseAll) {
      modalCloseAll.addEventListener('click', this._closeAllListener);
    }.bind(this));

    modalOuterElements.forEach(function(modalOuter) {
      modalOuter.addEventListener('click', this._outerClickListener);
    }.bind(this));
  };

  MultiModal.prototype._removeModalEventListeners = function(modal) {
    var modalCloseElements    = modal.querySelectorAll('.js-m-modal-close');
    var modalCloseAllElements = modal.querySelectorAll('.js-m-modal-close-all');
    var modalOuterElements    = modal.querySelectorAll('.js-m-modal-outer');

    window.removeEventListener('keydown', this._escCloseListeners[modal.getAttribute('data-modal-id')]);

    modalCloseElements.forEach(function(modalClose) {
      modalClose.removeEventListener('click', this._closeListener);
    }.bind(this));

    modalCloseAllElements.forEach(function(modalCloseAll) {
      modalCloseAll.removeEventListener('click', this._closeAllListener);
    }.bind(this));

    modalOuterElements.forEach(function(modalOuter) {
      modalOuter.removeEventListener('click', this._outerClickListener);
    }.bind(this));
  };

  return MultiModal;
})();

multiModal = new MultiModal();

window.onresize = function() {
  multiModal.verticallyPositionModals();
}

module.exports = multiModal;
