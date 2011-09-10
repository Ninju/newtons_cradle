
(function() {
var __main_module_name__ = "main";
var __resources__ = {};
function __imageResource(data) { var img = new Image(); img.src = data; return img; };
var FLIP_Y_AXIS = true;
var ENABLE_WEB_GL = false;
var SHOW_REDRAW_REGIONS = false;

__resources__["/__builtin__/event.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*global module exports require*/
/*jslint white: true, undef: true, nomen: true, bitwise: true, regexp: true, newcap: true*/


/**
 * @namespace
 * Support for listening for and triggering events
 */
var event = {};

/**
 * @private
 * @ignore
 * Returns the event listener property of an object, creating it if it doesn't
 * already exist.
 *
 * @returns {Object}
 */
function getListeners(obj, eventName) {
    if (!obj.js_listeners_) {
        obj.js_listeners_ = {};
    }
    if (!eventName) {
        return obj.js_listeners_;
    }
    if (!obj.js_listeners_[eventName]) {
        obj.js_listeners_[eventName] = {};
    }
    return obj.js_listeners_[eventName];
}

/**
 * @private
 * @ignore
 * Keep track of the next ID for each new EventListener
 */
var eventID = 0;

/**
 * @class
 * Represents an event being listened to. You should not create instances of
 * this directly, it is instead returned by event.addListener
 *
 * @extends Object
 * 
 * @param {Object} source Object to listen to for an event
 * @param {String} eventName Name of the event to listen for
 * @param {Function} handler Callback to fire when the event triggers
 */
event.EventListener = function (source, eventName, handler) {
    /**
     * Object to listen to for an event
     * @type Object 
     */
    this.source = source;
    
    /**
     * Name of the event to listen for
     * @type String
     */
    this.eventName = eventName;

    /**
     * Callback to fire when the event triggers
     * @type Function
     */
    this.handler = handler;

    /**
     * Unique ID number for this instance
     * @type Integer 
     */
    this.id = ++eventID;

    getListeners(source, eventName)[this.id] = this;
};

/**
 * Register an event listener
 *
 * @param {Object} source Object to listen to for an event
 * @param {String} eventName Name of the event to listen for
 * @param {Function} handler Callback to fire when the event triggers
 *
 * @returns {event.EventListener} The event listener. Pass to removeListener to destroy it.
 */
event.addListener = function (source, eventName, handler) {
    return new event.EventListener(source, eventName, handler);
};

/**
 * Trigger an event. All listeners will be notified.
 *
 * @param {Object} source Object to trigger the event on
 * @param {String} eventName Name of the event to trigger
 */
event.trigger = function (source, eventName) {
    var listeners = getListeners(source, eventName),
        args = Array.prototype.slice.call(arguments, 2),
        eventID,
        l;

    for (eventID in listeners) {
        if (listeners.hasOwnProperty(eventID)) {
            l = listeners[eventID];
            if (l) {
                l.handler.apply(undefined, args);
            }
        }
    }
};

/**
 * Remove a previously registered event listener
 *
 * @param {event.EventListener} listener EventListener to remove, as returned by event.addListener
 */
event.removeListener = function (listener) {
    delete getListeners(listener.source, listener.eventName)[listener.eventID];
};

/**
 * Remove a all event listeners for a given event
 *
 * @param {Object} source Object to remove listeners from
 * @param {String} eventName Name of event to remove listeners from
 */
event.clearListeners = function (source, eventName) {
    var listeners = getListeners(source, eventName),
        eventID;


    for (eventID in listeners) {
        if (listeners.hasOwnProperty(eventID)) {
            var l = listeners[eventID];
            if (l) {
                event.removeListener(l);
            }
        }
    }
};

/**
 * Remove all event listeners on an object
 *
 * @param {Object} source Object to remove listeners from
 */
event.clearInstanceListeners = function (source, eventName) {
    var listeners = getListeners(source),
        eventID;

    for (eventName in listeners) {
        if (listeners.hasOwnProperty(eventName)) {
            var el = listeners[eventName];
            for (eventID in el) {
                if (el.hasOwnProperty(eventID)) {
                    var l = el[eventID];
                    if (l) {
                        event.removeListener(l);
                    }
                }
            }
        }
    }
};

module.exports = event;

}};
__resources__["/__builtin__/global.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    evt = require('event');


/**
 * @ignore
 */
function getAccessors(obj) {
    if (!obj.js_accessors_) {
        obj.js_accessors_ = {};
    }
    return obj.js_accessors_;
}

/**
 * @ignore
 */
function getBindings(obj) {
    if (!obj.js_bindings_) {
        obj.js_bindings_ = {};
    }
    return obj.js_bindings_;
}

/**
 * @ignore
 */
function addAccessor(obj, key, target, targetKey, noNotify) {
    getAccessors(obj)[key] = {
        key: targetKey,
        target: target
    };

    if (!noNotify) {
        obj.triggerChanged(key);
    }
}


/**
 * @ignore
 */
var objectID = 0;

/**
 * @class
 * A bindable object. Allows observing and binding to its properties.
 */
var BObject = function () {};
BObject.prototype = util.extend(BObject.prototype, /** @lends BObject# */{
    /**
     * Unique ID
     * @type Integer
     */
    _id: 0,
    

    /**
     * The constructor for subclasses. Overwrite this for any initalisation you
     * need to do.
     * @ignore
     */
    init: function () {},

    /**
     * Get a property from the object. Always use this instead of trying to
     * access the property directly. This will ensure all bindings, setters and
     * getters work correctly.
     * 
     * @param {String} key Name of property to get
     * @returns {*} Value of the property
     */
    get: function (key) {
        var accessor = getAccessors(this)[key];
        if (accessor) {
            return accessor.target.get(accessor.key);
        } else {
            // Call getting function
            if (this['get_' + key]) {
                return this['get_' + key]();
            }

            return this[key];
        }
    },


    /**
     * Set a property on the object. Always use this instead of trying to
     * access the property directly. This will ensure all bindings, setters and
     * getters work correctly.
     * 
     * @param {String} key Name of property to get
     * @param {*} value New value for the property
     */
    set: function (key, value) {
        var accessor = getAccessors(this)[key],
            oldVal = this.get(key);
        if (accessor) {
            accessor.target.set(accessor.key, value);
        } else {
            if (this['set_' + key]) {
                this['set_' + key](value);
            } else {
                this[key] = value;
            }
        }
        this.triggerChanged(key, oldVal);
    },

    /**
     * Set multiple propertys in one go
     *
     * @param {Object} kvp An Object where the key is a property name and the value is the value to assign to the property
     *
     * @example
     * var props = {
     *   monkey: 'ook',
     *   cat: 'meow',
     *   dog: 'woof'
     * };
     * foo.setValues(props);
     * console.log(foo.get('cat')); // Logs 'meow'
     */
    setValues: function (kvp) {
        for (var x in kvp) {
            if (kvp.hasOwnProperty(x)) {
                this.set(x, kvp[x]);
            }
        }
    },

    changed: function (key) {
    },

    /**
     * @private
     */
    notify: function (key, oldVal) {
        var accessor = getAccessors(this)[key];
        if (accessor) {
            accessor.target.notify(accessor.key, oldVal);
        }
    },

    /**
     * @private
     */
    triggerChanged: function(key, oldVal) {
        evt.trigger(this, key.toLowerCase() + '_changed', oldVal);
    },

    /**
     * Bind the value of a property on this object to that of another object so
     * they always have the same value. Setting the value on either object will update
     * the other too.
     *
     * @param {String} key Name of the property on this object that should be bound
     * @param {BOject} target Object to bind to
     * @param {String} [targetKey=key] Key on the target object to bind to
     * @param {Boolean} [noNotify=false] Set to true to prevent this object's property triggering a 'changed' event when adding the binding
     */
    bindTo: function (key, target, targetKey, noNotify) {
        targetKey = targetKey || key;
        var self = this;
        this.unbind(key);

        var oldVal = this.get(key);

        // When bound property changes, trigger a 'changed' event on this one too
        getBindings(this)[key] = evt.addListener(target, targetKey.toLowerCase() + '_changed', function (oldVal) {
            self.triggerChanged(key, oldVal);
        });

        addAccessor(this, key, target, targetKey, noNotify);
    },

    /**
     * Remove binding from a property which set setup using BObject#bindTo.
     *
     * @param {String} key Name of the property on this object to unbind
     */
    unbind: function (key) {
        var binding = getBindings(this)[key];
        if (!binding) {
            return;
        }

        delete getBindings(this)[key];
        evt.removeListener(binding);
        // Grab current value from bound property
        var val = this.get(key);
        delete getAccessors(this)[key];
        // Set bound value
        this[key] = val;
    },

    /**
     * Remove all bindings on this object
     */
    unbindAll: function () {
        var keys = [],
            bindings = getBindings(this);
        for (var k in bindings) {
            if (bindings.hasOwnProperty(k)) {
                this.unbind(k);
            }
        }
    },

    /**
     * Unique ID for this object
     * @getter id
     * @type Integer
     */
    get_id: function() {
        if (!this._id) {
            this._id = ++objectID;
        }

        return this._id;
    }
});


/**
 * Create a new instance of this object
 * @returns {BObject} New instance of this object
 */
BObject.create = function() {
    var ret = new this();
    ret.init.apply(ret, arguments);
    return ret;
};

/**
 * Create a new subclass by extending this one
 * @returns {Object} A new subclass of this object
 */
BObject.extend = function() {
    var newObj = function() {},
        args = [],
        i,
        x;

    // Copy 'class' methods
    for (x in this) {
        if (this.hasOwnProperty(x)) {
            newObj[x] = this[x];
        }
    }


    // Add given properties to the prototype
    newObj.prototype = util.beget(this.prototype);
    args.push(newObj.prototype);
    for (i = 0; i<arguments.length; i++) {
        args.push(arguments[i]);
    }
    util.extend.apply(null, args);

    newObj.superclass = this.prototype;
    // Create new instance
    return newObj;
};

/**
 * Get a property from the class. Always use this instead of trying to
 * access the property directly. This will ensure all bindings, setters and
 * getters work correctly.
 * 
 * @function
 * @param {String} key Name of property to get
 * @returns {*} Value of the property
 */
BObject.get = BObject.prototype.get;

/**
 * Set a property on the class. Always use this instead of trying to
 * access the property directly. This will ensure all bindings, setters and
 * getters work correctly.
 * 
 * @function
 * @param {String} key Name of property to get
 * @param {*} value New value for the property
 */
BObject.set = BObject.prototype.set;

var BArray = BObject.extend(/** @lends BArray# */{

    /**
     * @constructs 
     * A bindable array. Allows observing for changes made to its contents
     *
     * @extends BObject
     * @param {Array} [array=[]] A normal JS array to use for data
     */
    init: function (array) {
        this.array = array || [];
        this.set('length', this.array.length);
    },

    /**
     * Get an item
     *
     * @param {Integer} i Index to get item from
     * @returns {*} Value stored in the array at index 'i'
     */
    getAt: function (i) {
        return this.array[i];
    },

    /**
     * Set an item -- Overwrites any existing item at index
     *
     * @param {Integer} i Index to set item to
     * @param {*} value Value to assign to index
     */
    setAt: function (i, value) {
        var oldVal = this.array[i];
        this.array[i] = value;

        evt.trigger(this, 'set_at', i, oldVal);
    },

    /**
     * Insert a new item into the array without overwriting anything
     *
     * @param {Integer} i Index to insert item at
     * @param {*} value Value to insert
     */
    insertAt: function (i, value) {
        this.array.splice(i, 0, value);
        this.set('length', this.array.length);
        evt.trigger(this, 'insert_at', i);
    },

    /**
     * Remove item from the array and return it
     *
     * @param {Integer} i Index to remove
     * @returns {*} Value that was removed
     */
    removeAt: function (i) {
        var oldVal = this.array[i];
        this.array.splice(i, 1);
        this.set('length', this.array.length);
        evt.trigger(this, 'remove_at', i, oldVal);

        return oldVal;
    },

    /**
     * Get the internal Javascript Array instance
     *
     * @returns {Array} Internal Javascript Array
     */
    getArray: function () {
        return this.array;
    },

    /**
     * Append a value to the end of the array and return its new length
     *
     * @param {*} value Value to append to the array
     * @returns {Integer} New length of the array
     */
    push: function (value) {
        this.insertAt(this.array.length, value);
        return this.array.length;
    },

    /**
     * Remove value from the end of the array and return it
     *
     * @returns {*} Value that was removed
     */
    pop: function () {
        return this.removeAt(this.array.length - 1);
    }
});

exports.BObject = BObject;
exports.BArray = BArray;

}};
__resources__["/__builtin__/libs/base64.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/**
 * Thin wrapper around JXG's Base64 utils
 */

/** @ignore */
var JXG = require('JXGUtil');

/** @namespace */
var base64 = {
    /**
     * Decode a base64 encoded string into a binary string
     *
     * @param {String} input Base64 encoded data
     * @returns {String} Binary string
     */
    decode: function(input) {
        return JXG.Util.Base64.decode(input);
    },

    /**
     * Decode a base64 encoded string into a byte array
     *
     * @param {String} input Base64 encoded data
     * @returns {Integer[]} Array of bytes
     */
    decodeAsArray: function(input, bytes) {
        bytes = bytes || 1;

        var dec = JXG.Util.Base64.decode(input),
            ar = [], i, j, len;

        for (i = 0, len = dec.length/bytes; i < len; i++){
            ar[i] = 0;
            for (j = bytes-1; j >= 0; --j){
                ar[i] += dec.charCodeAt((i *bytes) +j) << (j *8);
            }
        }
        return ar;
    },

    /**
     * Encode a binary string into base64
     *
     * @param {String} input Binary string
     * @returns {String} Base64 encoded data
     */
    encode: function(input) {
        return JXG.Util.Base64.encode(input);
    }
};

module.exports = base64;

}};
__resources__["/__builtin__/libs/box2d.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
function extend(a, b) {
  for(var c in b) {
    a[c] = b[c]
  }
}
function isInstanceOf(obj, _constructor) {
  while(typeof obj === "object") {
    if(obj.constructor === _constructor) {
      return true
    }
    obj = obj._super
  }
  return false
}
;var b2BoundValues = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2BoundValues.prototype.__constructor = function() {
  this.lowerValues = new Array;
  this.lowerValues[0] = 0;
  this.lowerValues[1] = 0;
  this.upperValues = new Array;
  this.upperValues[0] = 0;
  this.upperValues[1] = 0
};
b2BoundValues.prototype.__varz = function() {
};
b2BoundValues.prototype.lowerValues = null;
b2BoundValues.prototype.upperValues = null;var b2PairManager = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2PairManager.prototype.__constructor = function() {
  this.m_pairs = new Array;
  this.m_pairBuffer = new Array;
  this.m_pairCount = 0;
  this.m_pairBufferCount = 0;
  this.m_freePair = null
};
b2PairManager.prototype.__varz = function() {
};
b2PairManager.prototype.AddPair = function(proxy1, proxy2) {
  var pair = proxy1.pairs[proxy2];
  if(pair != null) {
    return pair
  }
  if(this.m_freePair == null) {
    this.m_freePair = new b2Pair;
    this.m_pairs.push(this.m_freePair)
  }
  pair = this.m_freePair;
  this.m_freePair = pair.next;
  pair.proxy1 = proxy1;
  pair.proxy2 = proxy2;
  pair.status = 0;
  pair.userData = null;
  pair.next = null;
  proxy1.pairs[proxy2] = pair;
  proxy2.pairs[proxy1] = pair;
  ++this.m_pairCount;
  return pair
};
b2PairManager.prototype.RemovePair = function(proxy1, proxy2) {
  var pair = proxy1.pairs[proxy2];
  if(pair == null) {
    return null
  }
  var userData = pair.userData;
  delete proxy1.pairs[proxy2];
  delete proxy2.pairs[proxy1];
  pair.next = this.m_freePair;
  pair.proxy1 = null;
  pair.proxy2 = null;
  pair.userData = null;
  pair.status = 0;
  this.m_freePair = pair;
  --this.m_pairCount;
  return userData
};
b2PairManager.prototype.Find = function(proxy1, proxy2) {
  return proxy1.pairs[proxy2]
};
b2PairManager.prototype.ValidateBuffer = function() {
};
b2PairManager.prototype.ValidateTable = function() {
};
b2PairManager.prototype.Initialize = function(broadPhase) {
  this.m_broadPhase = broadPhase
};
b2PairManager.prototype.AddBufferedPair = function(proxy1, proxy2) {
  var pair = this.AddPair(proxy1, proxy2);
  if(pair.IsBuffered() == false) {
    pair.SetBuffered();
    this.m_pairBuffer[this.m_pairBufferCount] = pair;
    ++this.m_pairBufferCount
  }
  pair.ClearRemoved();
  if(b2BroadPhase.s_validate) {
    this.ValidateBuffer()
  }
};
b2PairManager.prototype.RemoveBufferedPair = function(proxy1, proxy2) {
  var pair = this.Find(proxy1, proxy2);
  if(pair == null) {
    return
  }
  if(pair.IsBuffered() == false) {
    pair.SetBuffered();
    this.m_pairBuffer[this.m_pairBufferCount] = pair;
    ++this.m_pairBufferCount
  }
  pair.SetRemoved();
  if(b2BroadPhase.s_validate) {
    this.ValidateBuffer()
  }
};
b2PairManager.prototype.Commit = function(callback) {
  var i = 0;
  var removeCount = 0;
  for(i = 0;i < this.m_pairBufferCount;++i) {
    var pair = this.m_pairBuffer[i];
    pair.ClearBuffered();
    var proxy1 = pair.proxy1;
    var proxy2 = pair.proxy2;
    if(pair.IsRemoved()) {
    }else {
      if(pair.IsFinal() == false) {
        callback(proxy1.userData, proxy2.userData)
      }
    }
  }
  this.m_pairBufferCount = 0;
  if(b2BroadPhase.s_validate) {
    this.ValidateTable()
  }
};
b2PairManager.prototype.m_broadPhase = null;
b2PairManager.prototype.m_pairs = null;
b2PairManager.prototype.m_freePair = null;
b2PairManager.prototype.m_pairCount = 0;
b2PairManager.prototype.m_pairBuffer = null;
b2PairManager.prototype.m_pairBufferCount = 0;var b2TimeStep = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2TimeStep.prototype.__constructor = function() {
};
b2TimeStep.prototype.__varz = function() {
};
b2TimeStep.prototype.Set = function(step) {
  this.dt = step.dt;
  this.inv_dt = step.inv_dt;
  this.positionIterations = step.positionIterations;
  this.velocityIterations = step.velocityIterations;
  this.warmStarting = step.warmStarting
};
b2TimeStep.prototype.dt = null;
b2TimeStep.prototype.inv_dt = null;
b2TimeStep.prototype.dtRatio = null;
b2TimeStep.prototype.velocityIterations = 0;
b2TimeStep.prototype.positionIterations = 0;
b2TimeStep.prototype.warmStarting = null;var b2Controller = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Controller.prototype.__constructor = function() {
};
b2Controller.prototype.__varz = function() {
};
b2Controller.prototype.Step = function(step) {
};
b2Controller.prototype.Draw = function(debugDraw) {
};
b2Controller.prototype.AddBody = function(body) {
  var edge = new b2ControllerEdge;
  edge.controller = this;
  edge.body = body;
  edge.nextBody = m_bodyList;
  edge.prevBody = null;
  m_bodyList = edge;
  if(edge.nextBody) {
    edge.nextBody.prevBody = edge
  }
  m_bodyCount++;
  edge.nextController = body.m_controllerList;
  edge.prevController = null;
  body.m_controllerList = edge;
  if(edge.nextController) {
    edge.nextController.prevController = edge
  }
  body.m_controllerCount++
};
b2Controller.prototype.RemoveBody = function(body) {
  var edge = body.m_controllerList;
  while(edge && edge.controller != this) {
    edge = edge.nextController
  }
  if(edge.prevBody) {
    edge.prevBody.nextBody = edge.nextBody
  }
  if(edge.nextBody) {
    edge.nextBody.prevBody = edge.prevBody
  }
  if(edge.nextController) {
    edge.nextController.prevController = edge.prevController
  }
  if(edge.prevController) {
    edge.prevController.nextController = edge.nextController
  }
  if(m_bodyList == edge) {
    m_bodyList = edge.nextBody
  }
  if(body.m_controllerList == edge) {
    body.m_controllerList = edge.nextController
  }
  body.m_controllerCount--;
  m_bodyCount--
};
b2Controller.prototype.Clear = function() {
  while(m_bodyList) {
    this.RemoveBody(m_bodyList.body)
  }
};
b2Controller.prototype.GetNext = function() {
  return this.m_next
};
b2Controller.prototype.GetWorld = function() {
  return this.m_world
};
b2Controller.prototype.GetBodyList = function() {
  return m_bodyList
};
b2Controller.prototype.m_next = null;
b2Controller.prototype.m_prev = null;
b2Controller.prototype.m_world = null;var b2GravityController = function() {
  b2Controller.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2GravityController.prototype, b2Controller.prototype);
b2GravityController.prototype._super = b2Controller.prototype;
b2GravityController.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2GravityController.prototype.__varz = function() {
};
b2GravityController.prototype.Step = function(step) {
  var i = null;
  var body1 = null;
  var p1 = null;
  var mass1 = 0;
  var j = null;
  var body2 = null;
  var p2 = null;
  var dx = 0;
  var dy = 0;
  var r2 = 0;
  var f = null;
  if(this.invSqr) {
    for(i = m_bodyList;i;i = i.nextBody) {
      body1 = i.body;
      p1 = body1.GetWorldCenter();
      mass1 = body1.GetMass();
      for(j = m_bodyList;j != i;j = j.nextBody) {
        body2 = j.body;
        p2 = body2.GetWorldCenter();
        dx = p2.x - p1.x;
        dy = p2.y - p1.y;
        r2 = dx * dx + dy * dy;
        if(r2 < Number.MIN_VALUE) {
          continue
        }
        f = new b2Vec2(dx, dy);
        f.Multiply(this.G / r2 / Math.sqrt(r2) * mass1 * body2.GetMass());
        if(body1.IsAwake()) {
          body1.ApplyForce(f, p1)
        }
        f.Multiply(-1);
        if(body2.IsAwake()) {
          body2.ApplyForce(f, p2)
        }
      }
    }
  }else {
    for(i = m_bodyList;i;i = i.nextBody) {
      body1 = i.body;
      p1 = body1.GetWorldCenter();
      mass1 = body1.GetMass();
      for(j = m_bodyList;j != i;j = j.nextBody) {
        body2 = j.body;
        p2 = body2.GetWorldCenter();
        dx = p2.x - p1.x;
        dy = p2.y - p1.y;
        r2 = dx * dx + dy * dy;
        if(r2 < Number.MIN_VALUE) {
          continue
        }
        f = new b2Vec2(dx, dy);
        f.Multiply(this.G / r2 * mass1 * body2.GetMass());
        if(body1.IsAwake()) {
          body1.ApplyForce(f, p1)
        }
        f.Multiply(-1);
        if(body2.IsAwake()) {
          body2.ApplyForce(f, p2)
        }
      }
    }
  }
};
b2GravityController.prototype.G = 1;
b2GravityController.prototype.invSqr = true;var b2DestructionListener = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2DestructionListener.prototype.__constructor = function() {
};
b2DestructionListener.prototype.__varz = function() {
};
b2DestructionListener.prototype.SayGoodbyeJoint = function(joint) {
};
b2DestructionListener.prototype.SayGoodbyeFixture = function(fixture) {
};var b2ContactEdge = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactEdge.prototype.__constructor = function() {
};
b2ContactEdge.prototype.__varz = function() {
};
b2ContactEdge.prototype.other = null;
b2ContactEdge.prototype.contact = null;
b2ContactEdge.prototype.prev = null;
b2ContactEdge.prototype.next = null;var b2EdgeChainDef = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2EdgeChainDef.prototype.__constructor = function() {
  this.vertexCount = 0;
  this.isALoop = true;
  this.vertices = []
};
b2EdgeChainDef.prototype.__varz = function() {
};
b2EdgeChainDef.prototype.vertices = null;
b2EdgeChainDef.prototype.vertexCount = null;
b2EdgeChainDef.prototype.isALoop = null;var b2Vec2 = function(x_, y_) {
  if(arguments.length == 2) {
    this.x = x_;
    this.y = y_
  }
};
b2Vec2.Make = function(x_, y_) {
  return new b2Vec2(x_, y_)
};
b2Vec2.prototype.SetZero = function() {
  this.x = 0;
  this.y = 0
};
b2Vec2.prototype.Set = function(x_, y_) {
  this.x = x_;
  this.y = y_
};
b2Vec2.prototype.SetV = function(v) {
  this.x = v.x;
  this.y = v.y
};
b2Vec2.prototype.GetNegative = function() {
  return new b2Vec2(-this.x, -this.y)
};
b2Vec2.prototype.NegativeSelf = function() {
  this.x = -this.x;
  this.y = -this.y
};
b2Vec2.prototype.Copy = function() {
  return new b2Vec2(this.x, this.y)
};
b2Vec2.prototype.Add = function(v) {
  this.x += v.x;
  this.y += v.y
};
b2Vec2.prototype.Subtract = function(v) {
  this.x -= v.x;
  this.y -= v.y
};
b2Vec2.prototype.Multiply = function(a) {
  this.x *= a;
  this.y *= a
};
b2Vec2.prototype.MulM = function(A) {
  var tX = this.x;
  this.x = A.col1.x * tX + A.col2.x * this.y;
  this.y = A.col1.y * tX + A.col2.y * this.y
};
b2Vec2.prototype.MulTM = function(A) {
  var tX = b2Math.Dot(this, A.col1);
  this.y = b2Math.Dot(this, A.col2);
  this.x = tX
};
b2Vec2.prototype.CrossVF = function(s) {
  var tX = this.x;
  this.x = s * this.y;
  this.y = -s * tX
};
b2Vec2.prototype.CrossFV = function(s) {
  var tX = this.x;
  this.x = -s * this.y;
  this.y = s * tX
};
b2Vec2.prototype.MinV = function(b) {
  this.x = this.x < b.x ? this.x : b.x;
  this.y = this.y < b.y ? this.y : b.y
};
b2Vec2.prototype.MaxV = function(b) {
  this.x = this.x > b.x ? this.x : b.x;
  this.y = this.y > b.y ? this.y : b.y
};
b2Vec2.prototype.Abs = function() {
  if(this.x < 0) {
    this.x = -this.x
  }
  if(this.y < 0) {
    this.y = -this.y
  }
};
b2Vec2.prototype.Length = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y)
};
b2Vec2.prototype.LengthSquared = function() {
  return this.x * this.x + this.y * this.y
};
b2Vec2.prototype.Normalize = function() {
  var length = Math.sqrt(this.x * this.x + this.y * this.y);
  if(length < Number.MIN_VALUE) {
    return 0
  }
  var invLength = 1 / length;
  this.x *= invLength;
  this.y *= invLength;
  return length
};
b2Vec2.prototype.IsValid = function() {
  return b2Math.IsValid(this.x) && b2Math.IsValid(this.y)
};
b2Vec2.prototype.x = 0;
b2Vec2.prototype.y = 0;var b2Vec3 = function(x, y, z) {
  if(arguments.length == 3) {
    this.x = x;
    this.y = y;
    this.z = z
  }
};
b2Vec3.prototype.SetZero = function() {
  this.x = this.y = this.z = 0
};
b2Vec3.prototype.Set = function(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z
};
b2Vec3.prototype.SetV = function(v) {
  this.x = v.x;
  this.y = v.y;
  this.z = v.z
};
b2Vec3.prototype.GetNegative = function() {
  return new b2Vec3(-this.x, -this.y, -this.z)
};
b2Vec3.prototype.NegativeSelf = function() {
  this.x = -this.x;
  this.y = -this.y;
  this.z = -this.z
};
b2Vec3.prototype.Copy = function() {
  return new b2Vec3(this.x, this.y, this.z)
};
b2Vec3.prototype.Add = function(v) {
  this.x += v.x;
  this.y += v.y;
  this.z += v.z
};
b2Vec3.prototype.Subtract = function(v) {
  this.x -= v.x;
  this.y -= v.y;
  this.z -= v.z
};
b2Vec3.prototype.Multiply = function(a) {
  this.x *= a;
  this.y *= a;
  this.z *= a
};
b2Vec3.prototype.x = 0;
b2Vec3.prototype.y = 0;
b2Vec3.prototype.z = 0;var b2DistanceProxy = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2DistanceProxy.prototype.__constructor = function() {
};
b2DistanceProxy.prototype.__varz = function() {
};
b2DistanceProxy.prototype.Set = function(shape) {
  switch(shape.GetType()) {
    case b2Shape.e_circleShape:
      var circle = shape;
      this.m_vertices = new Array(1);
      this.m_vertices[0] = circle.m_p;
      this.m_count = 1;
      this.m_radius = circle.m_radius;
      break;
    case b2Shape.e_polygonShape:
      var polygon = shape;
      this.m_vertices = polygon.m_vertices;
      this.m_count = polygon.m_vertexCount;
      this.m_radius = polygon.m_radius;
      break;
    default:
      b2Settings.b2Assert(false)
  }
};
b2DistanceProxy.prototype.GetSupport = function(d) {
  var bestIndex = 0;
  var bestValue = this.m_vertices[0].x * d.x + this.m_vertices[0].y * d.y;
  for(var i = 1;i < this.m_count;++i) {
    var value = this.m_vertices[i].x * d.x + this.m_vertices[i].y * d.y;
    if(value > bestValue) {
      bestIndex = i;
      bestValue = value
    }
  }
  return bestIndex
};
b2DistanceProxy.prototype.GetSupportVertex = function(d) {
  var bestIndex = 0;
  var bestValue = this.m_vertices[0].x * d.x + this.m_vertices[0].y * d.y;
  for(var i = 1;i < this.m_count;++i) {
    var value = this.m_vertices[i].x * d.x + this.m_vertices[i].y * d.y;
    if(value > bestValue) {
      bestIndex = i;
      bestValue = value
    }
  }
  return this.m_vertices[bestIndex]
};
b2DistanceProxy.prototype.GetVertexCount = function() {
  return this.m_count
};
b2DistanceProxy.prototype.GetVertex = function(index) {
  b2Settings.b2Assert(0 <= index && index < this.m_count);
  return this.m_vertices[index]
};
b2DistanceProxy.prototype.m_vertices = null;
b2DistanceProxy.prototype.m_count = 0;
b2DistanceProxy.prototype.m_radius = null;var b2ContactFactory = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactFactory.prototype.__constructor = function() {
};
b2ContactFactory.prototype.__varz = function() {
  this.InitializeRegisters()
};
b2ContactFactory.prototype.AddType = function(createFcn, destroyFcn, type1, type2) {
  this.m_registers[type1][type2].createFcn = createFcn;
  this.m_registers[type1][type2].destroyFcn = destroyFcn;
  this.m_registers[type1][type2].primary = true;
  if(type1 != type2) {
    this.m_registers[type2][type1].createFcn = createFcn;
    this.m_registers[type2][type1].destroyFcn = destroyFcn;
    this.m_registers[type2][type1].primary = false
  }
};
b2ContactFactory.prototype.InitializeRegisters = function() {
  this.m_registers = new Array(b2Shape.e_shapeTypeCount);
  for(var i = 0;i < b2Shape.e_shapeTypeCount;i++) {
    this.m_registers[i] = new Array(b2Shape.e_shapeTypeCount);
    for(var j = 0;j < b2Shape.e_shapeTypeCount;j++) {
      this.m_registers[i][j] = new b2ContactRegister
    }
  }
  this.AddType(b2CircleContact.Create, b2CircleContact.Destroy, b2Shape.e_circleShape, b2Shape.e_circleShape);
  this.AddType(b2PolyAndCircleContact.Create, b2PolyAndCircleContact.Destroy, b2Shape.e_polygonShape, b2Shape.e_circleShape);
  this.AddType(b2PolygonContact.Create, b2PolygonContact.Destroy, b2Shape.e_polygonShape, b2Shape.e_polygonShape);
  this.AddType(b2EdgeAndCircleContact.Create, b2EdgeAndCircleContact.Destroy, b2Shape.e_edgeShape, b2Shape.e_circleShape);
  this.AddType(b2PolyAndEdgeContact.Create, b2PolyAndEdgeContact.Destroy, b2Shape.e_polygonShape, b2Shape.e_edgeShape)
};
b2ContactFactory.prototype.Create = function(fixtureA, fixtureB) {
  var type1 = fixtureA.GetType();
  var type2 = fixtureB.GetType();
  var reg = this.m_registers[type1][type2];
  var c;
  if(reg.pool) {
    c = reg.pool;
    reg.pool = c.m_next;
    reg.poolCount--;
    c.Reset(fixtureA, fixtureB);
    return c
  }
  var createFcn = reg.createFcn;
  if(createFcn != null) {
    if(reg.primary) {
      c = createFcn(this.m_allocator);
      c.Reset(fixtureA, fixtureB);
      return c
    }else {
      c = createFcn(this.m_allocator);
      c.Reset(fixtureB, fixtureA);
      return c
    }
  }else {
    return null
  }
};
b2ContactFactory.prototype.Destroy = function(contact) {
  if(contact.m_manifold.m_pointCount > 0) {
    contact.m_fixtureA.m_body.SetAwake(true);
    contact.m_fixtureB.m_body.SetAwake(true)
  }
  var type1 = contact.m_fixtureA.GetType();
  var type2 = contact.m_fixtureB.GetType();
  var reg = this.m_registers[type1][type2];
  if(true) {
    reg.poolCount++;
    contact.m_next = reg.pool;
    reg.pool = contact
  }
  var destroyFcn = reg.destroyFcn;
  destroyFcn(contact, this.m_allocator)
};
b2ContactFactory.prototype.m_registers = null;
b2ContactFactory.prototype.m_allocator = null;var b2ConstantAccelController = function() {
  b2Controller.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2ConstantAccelController.prototype, b2Controller.prototype);
b2ConstantAccelController.prototype._super = b2Controller.prototype;
b2ConstantAccelController.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2ConstantAccelController.prototype.__varz = function() {
  this.A = new b2Vec2(0, 0)
};
b2ConstantAccelController.prototype.Step = function(step) {
  var smallA = new b2Vec2(this.A.x * step.dt, this.A.y * step.dt);
  for(var i = m_bodyList;i;i = i.nextBody) {
    var body = i.body;
    if(!body.IsAwake()) {
      continue
    }
    body.SetLinearVelocity(new b2Vec2(body.GetLinearVelocity().x + smallA.x, body.GetLinearVelocity().y + smallA.y))
  }
};
b2ConstantAccelController.prototype.A = new b2Vec2(0, 0);var b2SeparationFunction = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2SeparationFunction.prototype.__constructor = function() {
};
b2SeparationFunction.prototype.__varz = function() {
  this.m_localPoint = new b2Vec2;
  this.m_axis = new b2Vec2
};
b2SeparationFunction.e_points = 1;
b2SeparationFunction.e_faceA = 2;
b2SeparationFunction.e_faceB = 4;
b2SeparationFunction.prototype.Initialize = function(cache, proxyA, transformA, proxyB, transformB) {
  this.m_proxyA = proxyA;
  this.m_proxyB = proxyB;
  var count = cache.count;
  b2Settings.b2Assert(0 < count && count < 3);
  var localPointA;
  var localPointA1;
  var localPointA2;
  var localPointB;
  var localPointB1;
  var localPointB2;
  var pointAX;
  var pointAY;
  var pointBX;
  var pointBY;
  var normalX;
  var normalY;
  var tMat;
  var tVec;
  var s;
  var sgn;
  if(count == 1) {
    this.m_type = b2SeparationFunction.e_points;
    localPointA = this.m_proxyA.GetVertex(cache.indexA[0]);
    localPointB = this.m_proxyB.GetVertex(cache.indexB[0]);
    tVec = localPointA;
    tMat = transformA.R;
    pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
    tVec = localPointB;
    tMat = transformB.R;
    pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
    this.m_axis.x = pointBX - pointAX;
    this.m_axis.y = pointBY - pointAY;
    this.m_axis.Normalize()
  }else {
    if(cache.indexB[0] == cache.indexB[1]) {
      this.m_type = b2SeparationFunction.e_faceA;
      localPointA1 = this.m_proxyA.GetVertex(cache.indexA[0]);
      localPointA2 = this.m_proxyA.GetVertex(cache.indexA[1]);
      localPointB = this.m_proxyB.GetVertex(cache.indexB[0]);
      this.m_localPoint.x = 0.5 * (localPointA1.x + localPointA2.x);
      this.m_localPoint.y = 0.5 * (localPointA1.y + localPointA2.y);
      this.m_axis = b2Math.CrossVF(b2Math.SubtractVV(localPointA2, localPointA1), 1);
      this.m_axis.Normalize();
      tVec = this.m_axis;
      tMat = transformA.R;
      normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      tVec = this.m_localPoint;
      tMat = transformA.R;
      pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
      pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
      tVec = localPointB;
      tMat = transformB.R;
      pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
      pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
      s = (pointBX - pointAX) * normalX + (pointBY - pointAY) * normalY;
      if(s < 0) {
        this.m_axis.NegativeSelf()
      }
    }else {
      if(cache.indexA[0] == cache.indexA[0]) {
        this.m_type = b2SeparationFunction.e_faceB;
        localPointB1 = this.m_proxyB.GetVertex(cache.indexB[0]);
        localPointB2 = this.m_proxyB.GetVertex(cache.indexB[1]);
        localPointA = this.m_proxyA.GetVertex(cache.indexA[0]);
        this.m_localPoint.x = 0.5 * (localPointB1.x + localPointB2.x);
        this.m_localPoint.y = 0.5 * (localPointB1.y + localPointB2.y);
        this.m_axis = b2Math.CrossVF(b2Math.SubtractVV(localPointB2, localPointB1), 1);
        this.m_axis.Normalize();
        tVec = this.m_axis;
        tMat = transformB.R;
        normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
        normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
        tVec = this.m_localPoint;
        tMat = transformB.R;
        pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        tVec = localPointA;
        tMat = transformA.R;
        pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        s = (pointAX - pointBX) * normalX + (pointAY - pointBY) * normalY;
        if(s < 0) {
          this.m_axis.NegativeSelf()
        }
      }else {
        localPointA1 = this.m_proxyA.GetVertex(cache.indexA[0]);
        localPointA2 = this.m_proxyA.GetVertex(cache.indexA[1]);
        localPointB1 = this.m_proxyB.GetVertex(cache.indexB[0]);
        localPointB2 = this.m_proxyB.GetVertex(cache.indexB[1]);
        var pA = b2Math.MulX(transformA, localPointA);
        var dA = b2Math.MulMV(transformA.R, b2Math.SubtractVV(localPointA2, localPointA1));
        var pB = b2Math.MulX(transformB, localPointB);
        var dB = b2Math.MulMV(transformB.R, b2Math.SubtractVV(localPointB2, localPointB1));
        var a = dA.x * dA.x + dA.y * dA.y;
        var e = dB.x * dB.x + dB.y * dB.y;
        var r = b2Math.SubtractVV(dB, dA);
        var c = dA.x * r.x + dA.y * r.y;
        var f = dB.x * r.x + dB.y * r.y;
        var b = dA.x * dB.x + dA.y * dB.y;
        var denom = a * e - b * b;
        s = 0;
        if(denom != 0) {
          s = b2Math.Clamp((b * f - c * e) / denom, 0, 1)
        }
        var t = (b * s + f) / e;
        if(t < 0) {
          t = 0;
          s = b2Math.Clamp((b - c) / a, 0, 1)
        }
        localPointA = new b2Vec2;
        localPointA.x = localPointA1.x + s * (localPointA2.x - localPointA1.x);
        localPointA.y = localPointA1.y + s * (localPointA2.y - localPointA1.y);
        localPointB = new b2Vec2;
        localPointB.x = localPointB1.x + s * (localPointB2.x - localPointB1.x);
        localPointB.y = localPointB1.y + s * (localPointB2.y - localPointB1.y);
        if(s == 0 || s == 1) {
          this.m_type = b2SeparationFunction.e_faceB;
          this.m_axis = b2Math.CrossVF(b2Math.SubtractVV(localPointB2, localPointB1), 1);
          this.m_axis.Normalize();
          this.m_localPoint = localPointB;
          tVec = this.m_axis;
          tMat = transformB.R;
          normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
          normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
          tVec = this.m_localPoint;
          tMat = transformB.R;
          pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
          pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
          tVec = localPointA;
          tMat = transformA.R;
          pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
          pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
          sgn = (pointAX - pointBX) * normalX + (pointAY - pointBY) * normalY;
          if(s < 0) {
            this.m_axis.NegativeSelf()
          }
        }else {
          this.m_type = b2SeparationFunction.e_faceA;
          this.m_axis = b2Math.CrossVF(b2Math.SubtractVV(localPointA2, localPointA1), 1);
          this.m_localPoint = localPointA;
          tVec = this.m_axis;
          tMat = transformA.R;
          normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
          normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
          tVec = this.m_localPoint;
          tMat = transformA.R;
          pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
          pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
          tVec = localPointB;
          tMat = transformB.R;
          pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
          pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
          sgn = (pointBX - pointAX) * normalX + (pointBY - pointAY) * normalY;
          if(s < 0) {
            this.m_axis.NegativeSelf()
          }
        }
      }
    }
  }
};
b2SeparationFunction.prototype.Evaluate = function(transformA, transformB) {
  var axisA;
  var axisB;
  var localPointA;
  var localPointB;
  var pointA;
  var pointB;
  var seperation;
  var normal;
  switch(this.m_type) {
    case b2SeparationFunction.e_points:
      axisA = b2Math.MulTMV(transformA.R, this.m_axis);
      axisB = b2Math.MulTMV(transformB.R, this.m_axis.GetNegative());
      localPointA = this.m_proxyA.GetSupportVertex(axisA);
      localPointB = this.m_proxyB.GetSupportVertex(axisB);
      pointA = b2Math.MulX(transformA, localPointA);
      pointB = b2Math.MulX(transformB, localPointB);
      seperation = (pointB.x - pointA.x) * this.m_axis.x + (pointB.y - pointA.y) * this.m_axis.y;
      return seperation;
    case b2SeparationFunction.e_faceA:
      normal = b2Math.MulMV(transformA.R, this.m_axis);
      pointA = b2Math.MulX(transformA, this.m_localPoint);
      axisB = b2Math.MulTMV(transformB.R, normal.GetNegative());
      localPointB = this.m_proxyB.GetSupportVertex(axisB);
      pointB = b2Math.MulX(transformB, localPointB);
      seperation = (pointB.x - pointA.x) * normal.x + (pointB.y - pointA.y) * normal.y;
      return seperation;
    case b2SeparationFunction.e_faceB:
      normal = b2Math.MulMV(transformB.R, this.m_axis);
      pointB = b2Math.MulX(transformB, this.m_localPoint);
      axisA = b2Math.MulTMV(transformA.R, normal.GetNegative());
      localPointA = this.m_proxyA.GetSupportVertex(axisA);
      pointA = b2Math.MulX(transformA, localPointA);
      seperation = (pointA.x - pointB.x) * normal.x + (pointA.y - pointB.y) * normal.y;
      return seperation;
    default:
      b2Settings.b2Assert(false);
      return 0
  }
};
b2SeparationFunction.prototype.m_proxyA = null;
b2SeparationFunction.prototype.m_proxyB = null;
b2SeparationFunction.prototype.m_type = 0;
b2SeparationFunction.prototype.m_localPoint = new b2Vec2;
b2SeparationFunction.prototype.m_axis = new b2Vec2;var b2DynamicTreePair = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2DynamicTreePair.prototype.__constructor = function() {
};
b2DynamicTreePair.prototype.__varz = function() {
};
b2DynamicTreePair.prototype.proxyA = null;
b2DynamicTreePair.prototype.proxyB = null;var b2ContactConstraintPoint = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactConstraintPoint.prototype.__constructor = function() {
};
b2ContactConstraintPoint.prototype.__varz = function() {
  this.localPoint = new b2Vec2;
  this.rA = new b2Vec2;
  this.rB = new b2Vec2
};
b2ContactConstraintPoint.prototype.localPoint = new b2Vec2;
b2ContactConstraintPoint.prototype.rA = new b2Vec2;
b2ContactConstraintPoint.prototype.rB = new b2Vec2;
b2ContactConstraintPoint.prototype.normalImpulse = null;
b2ContactConstraintPoint.prototype.tangentImpulse = null;
b2ContactConstraintPoint.prototype.normalMass = null;
b2ContactConstraintPoint.prototype.tangentMass = null;
b2ContactConstraintPoint.prototype.equalizedMass = null;
b2ContactConstraintPoint.prototype.velocityBias = null;var b2ControllerEdge = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ControllerEdge.prototype.__constructor = function() {
};
b2ControllerEdge.prototype.__varz = function() {
};
b2ControllerEdge.prototype.controller = null;
b2ControllerEdge.prototype.body = null;
b2ControllerEdge.prototype.prevBody = null;
b2ControllerEdge.prototype.nextBody = null;
b2ControllerEdge.prototype.prevController = null;
b2ControllerEdge.prototype.nextController = null;var b2DistanceInput = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2DistanceInput.prototype.__constructor = function() {
};
b2DistanceInput.prototype.__varz = function() {
};
b2DistanceInput.prototype.proxyA = null;
b2DistanceInput.prototype.proxyB = null;
b2DistanceInput.prototype.transformA = null;
b2DistanceInput.prototype.transformB = null;
b2DistanceInput.prototype.useRadii = null;var b2Settings = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Settings.prototype.__constructor = function() {
};
b2Settings.prototype.__varz = function() {
};
b2Settings.b2MixFriction = function(friction1, friction2) {
  return Math.sqrt(friction1 * friction2)
};
b2Settings.b2MixRestitution = function(restitution1, restitution2) {
  return restitution1 > restitution2 ? restitution1 : restitution2
};
b2Settings.b2Assert = function(a) {
  if(!a) {
    throw"Assertion Failed";
  }
};
b2Settings.VERSION = "2.1alpha";
b2Settings.USHRT_MAX = 65535;
b2Settings.b2_pi = Math.PI;
b2Settings.b2_maxManifoldPoints = 2;
b2Settings.b2_aabbExtension = 0.1;
b2Settings.b2_aabbMultiplier = 2;
b2Settings.b2_polygonRadius = 2 * b2Settings.b2_linearSlop;
b2Settings.b2_linearSlop = 0.0050;
b2Settings.b2_angularSlop = 2 / 180 * b2Settings.b2_pi;
b2Settings.b2_toiSlop = 8 * b2Settings.b2_linearSlop;
b2Settings.b2_maxTOIContactsPerIsland = 32;
b2Settings.b2_maxTOIJointsPerIsland = 32;
b2Settings.b2_velocityThreshold = 1;
b2Settings.b2_maxLinearCorrection = 0.2;
b2Settings.b2_maxAngularCorrection = 8 / 180 * b2Settings.b2_pi;
b2Settings.b2_maxTranslation = 2;
b2Settings.b2_maxTranslationSquared = b2Settings.b2_maxTranslation * b2Settings.b2_maxTranslation;
b2Settings.b2_maxRotation = 0.5 * b2Settings.b2_pi;
b2Settings.b2_maxRotationSquared = b2Settings.b2_maxRotation * b2Settings.b2_maxRotation;
b2Settings.b2_contactBaumgarte = 0.2;
b2Settings.b2_timeToSleep = 0.5;
b2Settings.b2_linearSleepTolerance = 0.01;
b2Settings.b2_angularSleepTolerance = 2 / 180 * b2Settings.b2_pi;var b2Proxy = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Proxy.prototype.__constructor = function() {
};
b2Proxy.prototype.__varz = function() {
  this.lowerBounds = new Array(2);
  this.upperBounds = new Array(2);
  this.pairs = new Object
};
b2Proxy.prototype.IsValid = function() {
  return this.overlapCount != b2BroadPhase.b2_invalid
};
b2Proxy.prototype.lowerBounds = new Array(2);
b2Proxy.prototype.upperBounds = new Array(2);
b2Proxy.prototype.overlapCount = 0;
b2Proxy.prototype.timeStamp = 0;
b2Proxy.prototype.pairs = new Object;
b2Proxy.prototype.next = null;
b2Proxy.prototype.userData = null;var b2Point = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Point.prototype.__constructor = function() {
};
b2Point.prototype.__varz = function() {
  this.p = new b2Vec2
};
b2Point.prototype.Support = function(xf, vX, vY) {
  return this.p
};
b2Point.prototype.GetFirstVertex = function(xf) {
  return this.p
};
b2Point.prototype.p = new b2Vec2;var b2WorldManifold = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2WorldManifold.prototype.__constructor = function() {
  this.m_points = new Array(b2Settings.b2_maxManifoldPoints);
  for(var i = 0;i < b2Settings.b2_maxManifoldPoints;i++) {
    this.m_points[i] = new b2Vec2
  }
};
b2WorldManifold.prototype.__varz = function() {
  this.m_normal = new b2Vec2
};
b2WorldManifold.prototype.Initialize = function(manifold, xfA, radiusA, xfB, radiusB) {
  if(manifold.m_pointCount == 0) {
    return
  }
  var i = 0;
  var tVec;
  var tMat;
  var normalX;
  var normalY;
  var planePointX;
  var planePointY;
  var clipPointX;
  var clipPointY;
  switch(manifold.m_type) {
    case b2Manifold.e_circles:
      tMat = xfA.R;
      tVec = manifold.m_localPoint;
      var pointAX = xfA.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      var pointAY = xfA.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      tMat = xfB.R;
      tVec = manifold.m_points[0].m_localPoint;
      var pointBX = xfB.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      var pointBY = xfB.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      var dX = pointBX - pointAX;
      var dY = pointBY - pointAY;
      var d2 = dX * dX + dY * dY;
      if(d2 > Number.MIN_VALUE * Number.MIN_VALUE) {
        var d = Math.sqrt(d2);
        this.m_normal.x = dX / d;
        this.m_normal.y = dY / d
      }else {
        this.m_normal.x = 1;
        this.m_normal.y = 0
      }
      var cAX = pointAX + radiusA * this.m_normal.x;
      var cAY = pointAY + radiusA * this.m_normal.y;
      var cBX = pointBX - radiusB * this.m_normal.x;
      var cBY = pointBY - radiusB * this.m_normal.y;
      this.m_points[0].x = 0.5 * (cAX + cBX);
      this.m_points[0].y = 0.5 * (cAY + cBY);
      break;
    case b2Manifold.e_faceA:
      tMat = xfA.R;
      tVec = manifold.m_localPlaneNormal;
      normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      tMat = xfA.R;
      tVec = manifold.m_localPoint;
      planePointX = xfA.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      planePointY = xfA.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      this.m_normal.x = normalX;
      this.m_normal.y = normalY;
      for(i = 0;i < manifold.m_pointCount;i++) {
        tMat = xfB.R;
        tVec = manifold.m_points[i].m_localPoint;
        clipPointX = xfB.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
        clipPointY = xfB.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
        this.m_points[i].x = clipPointX + 0.5 * (radiusA - (clipPointX - planePointX) * normalX - (clipPointY - planePointY) * normalY - radiusB) * normalX;
        this.m_points[i].y = clipPointY + 0.5 * (radiusA - (clipPointX - planePointX) * normalX - (clipPointY - planePointY) * normalY - radiusB) * normalY
      }
      break;
    case b2Manifold.e_faceB:
      tMat = xfB.R;
      tVec = manifold.m_localPlaneNormal;
      normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      tMat = xfB.R;
      tVec = manifold.m_localPoint;
      planePointX = xfB.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      planePointY = xfB.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      this.m_normal.x = -normalX;
      this.m_normal.y = -normalY;
      for(i = 0;i < manifold.m_pointCount;i++) {
        tMat = xfA.R;
        tVec = manifold.m_points[i].m_localPoint;
        clipPointX = xfA.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
        clipPointY = xfA.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
        this.m_points[i].x = clipPointX + 0.5 * (radiusB - (clipPointX - planePointX) * normalX - (clipPointY - planePointY) * normalY - radiusA) * normalX;
        this.m_points[i].y = clipPointY + 0.5 * (radiusB - (clipPointX - planePointX) * normalX - (clipPointY - planePointY) * normalY - radiusA) * normalY
      }
      break
  }
};
b2WorldManifold.prototype.m_normal = new b2Vec2;
b2WorldManifold.prototype.m_points = null;var b2RayCastOutput = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2RayCastOutput.prototype.__constructor = function() {
};
b2RayCastOutput.prototype.__varz = function() {
  this.normal = new b2Vec2
};
b2RayCastOutput.prototype.normal = new b2Vec2;
b2RayCastOutput.prototype.fraction = null;var b2ConstantForceController = function() {
  b2Controller.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2ConstantForceController.prototype, b2Controller.prototype);
b2ConstantForceController.prototype._super = b2Controller.prototype;
b2ConstantForceController.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2ConstantForceController.prototype.__varz = function() {
  this.F = new b2Vec2(0, 0)
};
b2ConstantForceController.prototype.Step = function(step) {
  for(var i = m_bodyList;i;i = i.nextBody) {
    var body = i.body;
    if(!body.IsAwake()) {
      continue
    }
    body.ApplyForce(this.F, body.GetWorldCenter())
  }
};
b2ConstantForceController.prototype.F = new b2Vec2(0, 0);var b2MassData = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2MassData.prototype.__constructor = function() {
};
b2MassData.prototype.__varz = function() {
  this.center = new b2Vec2(0, 0)
};
b2MassData.prototype.mass = 0;
b2MassData.prototype.center = new b2Vec2(0, 0);
b2MassData.prototype.I = 0;var b2DynamicTree = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2DynamicTree.prototype.__constructor = function() {
  this.m_root = null;
  this.m_freeList = null;
  this.m_path = 0;
  this.m_insertionCount = 0
};
b2DynamicTree.prototype.__varz = function() {
};
b2DynamicTree.prototype.AllocateNode = function() {
  if(this.m_freeList) {
    var node = this.m_freeList;
    this.m_freeList = node.parent;
    node.parent = null;
    node.child1 = null;
    node.child2 = null;
    return node
  }
  return new b2DynamicTreeNode
};
b2DynamicTree.prototype.FreeNode = function(node) {
  node.parent = this.m_freeList;
  this.m_freeList = node
};
b2DynamicTree.prototype.InsertLeaf = function(leaf) {
  ++this.m_insertionCount;
  if(this.m_root == null) {
    this.m_root = leaf;
    this.m_root.parent = null;
    return
  }
  var center = leaf.aabb.GetCenter();
  var sibling = this.m_root;
  if(sibling.IsLeaf() == false) {
    do {
      var child1 = sibling.child1;
      var child2 = sibling.child2;
      var norm1 = Math.abs((child1.aabb.lowerBound.x + child1.aabb.upperBound.x) / 2 - center.x) + Math.abs((child1.aabb.lowerBound.y + child1.aabb.upperBound.y) / 2 - center.y);
      var norm2 = Math.abs((child2.aabb.lowerBound.x + child2.aabb.upperBound.x) / 2 - center.x) + Math.abs((child2.aabb.lowerBound.y + child2.aabb.upperBound.y) / 2 - center.y);
      if(norm1 < norm2) {
        sibling = child1
      }else {
        sibling = child2
      }
    }while(sibling.IsLeaf() == false)
  }
  var node1 = sibling.parent;
  var node2 = this.AllocateNode();
  node2.parent = node1;
  node2.userData = null;
  node2.aabb.Combine(leaf.aabb, sibling.aabb);
  if(node1) {
    if(sibling.parent.child1 == sibling) {
      node1.child1 = node2
    }else {
      node1.child2 = node2
    }
    node2.child1 = sibling;
    node2.child2 = leaf;
    sibling.parent = node2;
    leaf.parent = node2;
    do {
      if(node1.aabb.Contains(node2.aabb)) {
        break
      }
      node1.aabb.Combine(node1.child1.aabb, node1.child2.aabb);
      node2 = node1;
      node1 = node1.parent
    }while(node1)
  }else {
    node2.child1 = sibling;
    node2.child2 = leaf;
    sibling.parent = node2;
    leaf.parent = node2;
    this.m_root = node2
  }
};
b2DynamicTree.prototype.RemoveLeaf = function(leaf) {
  if(leaf == this.m_root) {
    this.m_root = null;
    return
  }
  var node2 = leaf.parent;
  var node1 = node2.parent;
  var sibling;
  if(node2.child1 == leaf) {
    sibling = node2.child2
  }else {
    sibling = node2.child1
  }
  if(node1) {
    if(node1.child1 == node2) {
      node1.child1 = sibling
    }else {
      node1.child2 = sibling
    }
    sibling.parent = node1;
    this.FreeNode(node2);
    while(node1) {
      var oldAABB = node1.aabb;
      node1.aabb = b2AABB.Combine(node1.child1.aabb, node1.child2.aabb);
      if(oldAABB.Contains(node1.aabb)) {
        break
      }
      node1 = node1.parent
    }
  }else {
    this.m_root = sibling;
    sibling.parent = null;
    this.FreeNode(node2)
  }
};
b2DynamicTree.prototype.CreateProxy = function(aabb, userData) {
  var node = this.AllocateNode();
  var extendX = b2Settings.b2_aabbExtension;
  var extendY = b2Settings.b2_aabbExtension;
  node.aabb.lowerBound.x = aabb.lowerBound.x - extendX;
  node.aabb.lowerBound.y = aabb.lowerBound.y - extendY;
  node.aabb.upperBound.x = aabb.upperBound.x + extendX;
  node.aabb.upperBound.y = aabb.upperBound.y + extendY;
  node.userData = userData;
  this.InsertLeaf(node);
  return node
};
b2DynamicTree.prototype.DestroyProxy = function(proxy) {
  this.RemoveLeaf(proxy);
  this.FreeNode(proxy)
};
b2DynamicTree.prototype.MoveProxy = function(proxy, aabb, displacement) {
  b2Settings.b2Assert(proxy.IsLeaf());
  if(proxy.aabb.Contains(aabb)) {
    return false
  }
  this.RemoveLeaf(proxy);
  var extendX = b2Settings.b2_aabbExtension + b2Settings.b2_aabbMultiplier * (displacement.x > 0 ? displacement.x : -displacement.x);
  var extendY = b2Settings.b2_aabbExtension + b2Settings.b2_aabbMultiplier * (displacement.y > 0 ? displacement.y : -displacement.y);
  proxy.aabb.lowerBound.x = aabb.lowerBound.x - extendX;
  proxy.aabb.lowerBound.y = aabb.lowerBound.y - extendY;
  proxy.aabb.upperBound.x = aabb.upperBound.x + extendX;
  proxy.aabb.upperBound.y = aabb.upperBound.y + extendY;
  this.InsertLeaf(proxy);
  return true
};
b2DynamicTree.prototype.Rebalance = function(iterations) {
  if(this.m_root == null) {
    return
  }
  for(var i = 0;i < iterations;i++) {
    var node = this.m_root;
    var bit = 0;
    while(node.IsLeaf() == false) {
      node = this.m_path >> bit & 1 ? node.child2 : node.child1;
      bit = bit + 1 & 31
    }
    ++this.m_path;
    this.RemoveLeaf(node);
    this.InsertLeaf(node)
  }
};
b2DynamicTree.prototype.GetFatAABB = function(proxy) {
  return proxy.aabb
};
b2DynamicTree.prototype.GetUserData = function(proxy) {
  return proxy.userData
};
b2DynamicTree.prototype.Query = function(callback, aabb) {
  if(this.m_root == null) {
    return
  }
  var stack = new Array;
  var count = 0;
  stack[count++] = this.m_root;
  while(count > 0) {
    var node = stack[--count];
    if(node.aabb.TestOverlap(aabb)) {
      if(node.IsLeaf()) {
        var proceed = callback(node);
        if(!proceed) {
          return
        }
      }else {
        stack[count++] = node.child1;
        stack[count++] = node.child2
      }
    }
  }
};
b2DynamicTree.prototype.RayCast = function(callback, input) {
  if(this.m_root == null) {
    return
  }
  var p1 = input.p1;
  var p2 = input.p2;
  var r = b2Math.SubtractVV(p1, p2);
  r.Normalize();
  var v = b2Math.CrossFV(1, r);
  var abs_v = b2Math.AbsV(v);
  var maxFraction = input.maxFraction;
  var segmentAABB = new b2AABB;
  var tX;
  var tY;
  tX = p1.x + maxFraction * (p2.x - p1.x);
  tY = p1.y + maxFraction * (p2.y - p1.y);
  segmentAABB.lowerBound.x = Math.min(p1.x, tX);
  segmentAABB.lowerBound.y = Math.min(p1.y, tY);
  segmentAABB.upperBound.x = Math.max(p1.x, tX);
  segmentAABB.upperBound.y = Math.max(p1.y, tY);
  var stack = new Array;
  var count = 0;
  stack[count++] = this.m_root;
  while(count > 0) {
    var node = stack[--count];
    if(node.aabb.TestOverlap(segmentAABB) == false) {
      continue
    }
    var c = node.aabb.GetCenter();
    var h = node.aabb.GetExtents();
    var separation = Math.abs(v.x * (p1.x - c.x) + v.y * (p1.y - c.y)) - abs_v.x * h.x - abs_v.y * h.y;
    if(separation > 0) {
      continue
    }
    if(node.IsLeaf()) {
      var subInput = new b2RayCastInput;
      subInput.p1 = input.p1;
      subInput.p2 = input.p2;
      subInput.maxFraction = input.maxFraction;
      maxFraction = callback(subInput, node);
      if(maxFraction == 0) {
        return
      }
      tX = p1.x + maxFraction * (p2.x - p1.x);
      tY = p1.y + maxFraction * (p2.y - p1.y);
      segmentAABB.lowerBound.x = Math.min(p1.x, tX);
      segmentAABB.lowerBound.y = Math.min(p1.y, tY);
      segmentAABB.upperBound.x = Math.max(p1.x, tX);
      segmentAABB.upperBound.y = Math.max(p1.y, tY)
    }else {
      stack[count++] = node.child1;
      stack[count++] = node.child2
    }
  }
};
b2DynamicTree.prototype.m_root = null;
b2DynamicTree.prototype.m_freeList = null;
b2DynamicTree.prototype.m_path = 0;
b2DynamicTree.prototype.m_insertionCount = 0;var b2JointEdge = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2JointEdge.prototype.__constructor = function() {
};
b2JointEdge.prototype.__varz = function() {
};
b2JointEdge.prototype.other = null;
b2JointEdge.prototype.joint = null;
b2JointEdge.prototype.prev = null;
b2JointEdge.prototype.next = null;var b2RayCastInput = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2RayCastInput.prototype.__constructor = function() {
};
b2RayCastInput.prototype.__varz = function() {
  this.p1 = new b2Vec2;
  this.p2 = new b2Vec2
};
b2RayCastInput.prototype.p1 = new b2Vec2;
b2RayCastInput.prototype.p2 = new b2Vec2;
b2RayCastInput.prototype.maxFraction = null;var Features = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
Features.prototype.__constructor = function() {
};
Features.prototype.__varz = function() {
};
Features.prototype.__defineGetter__("referenceEdge", function() {
  return this._referenceEdge
});
Features.prototype.__defineSetter__("referenceEdge", function(value) {
  this._referenceEdge = value;
  this._m_id._key = this._m_id._key & 4294967040 | this._referenceEdge & 255
});
Features.prototype.__defineGetter__("incidentEdge", function() {
  return this._incidentEdge
});
Features.prototype.__defineSetter__("incidentEdge", function(value) {
  this._incidentEdge = value;
  this._m_id._key = this._m_id._key & 4294902015 | this._incidentEdge << 8 & 65280
});
Features.prototype.__defineGetter__("incidentVertex", function() {
  return this._incidentVertex
});
Features.prototype.__defineSetter__("incidentVertex", function(value) {
  this._incidentVertex = value;
  this._m_id._key = this._m_id._key & 4278255615 | this._incidentVertex << 16 & 16711680
});
Features.prototype.__defineGetter__("flip", function() {
  return this._flip
});
Features.prototype.__defineSetter__("flip", function(value) {
  this._flip = value;
  this._m_id._key = this._m_id._key & 16777215 | this._flip << 24 & 4278190080
});
Features.prototype._referenceEdge = 0;
Features.prototype._incidentEdge = 0;
Features.prototype._incidentVertex = 0;
Features.prototype._flip = 0;
Features.prototype._m_id = null;var b2FilterData = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2FilterData.prototype.__constructor = function() {
};
b2FilterData.prototype.__varz = function() {
  this.categoryBits = 1;
  this.maskBits = 65535
};
b2FilterData.prototype.Copy = function() {
  var copy = new b2FilterData;
  copy.categoryBits = this.categoryBits;
  copy.maskBits = this.maskBits;
  copy.groupIndex = this.groupIndex;
  return copy
};
b2FilterData.prototype.categoryBits = 1;
b2FilterData.prototype.maskBits = 65535;
b2FilterData.prototype.groupIndex = 0;var b2AABB = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2AABB.prototype.__constructor = function() {
};
b2AABB.prototype.__varz = function() {
  this.lowerBound = new b2Vec2;
  this.upperBound = new b2Vec2
};
b2AABB.Combine = function(aabb1, aabb2) {
  var aabb = new b2AABB;
  aabb.Combine(aabb1, aabb2);
  return aabb
};
b2AABB.prototype.IsValid = function() {
  var dX = this.upperBound.x - this.lowerBound.x;
  var dY = this.upperBound.y - this.lowerBound.y;
  var valid = dX >= 0 && dY >= 0;
  valid = valid && this.lowerBound.IsValid() && this.upperBound.IsValid();
  return valid
};
b2AABB.prototype.GetCenter = function() {
  return new b2Vec2((this.lowerBound.x + this.upperBound.x) / 2, (this.lowerBound.y + this.upperBound.y) / 2)
};
b2AABB.prototype.GetExtents = function() {
  return new b2Vec2((this.upperBound.x - this.lowerBound.x) / 2, (this.upperBound.y - this.lowerBound.y) / 2)
};
b2AABB.prototype.Contains = function(aabb) {
  var result = true && this.lowerBound.x <= aabb.lowerBound.x && this.lowerBound.y <= aabb.lowerBound.y && aabb.upperBound.x <= this.upperBound.x && aabb.upperBound.y <= this.upperBound.y;
  return result
};
b2AABB.prototype.RayCast = function(output, input) {
  var tmin = -Number.MAX_VALUE;
  var tmax = Number.MAX_VALUE;
  var pX = input.p1.x;
  var pY = input.p1.y;
  var dX = input.p2.x - input.p1.x;
  var dY = input.p2.y - input.p1.y;
  var absDX = Math.abs(dX);
  var absDY = Math.abs(dY);
  var normal = output.normal;
  var inv_d;
  var t1;
  var t2;
  var t3;
  var s;
  if(absDX < Number.MIN_VALUE) {
    if(pX < this.lowerBound.x || this.upperBound.x < pX) {
      return false
    }
  }else {
    inv_d = 1 / dX;
    t1 = (this.lowerBound.x - pX) * inv_d;
    t2 = (this.upperBound.x - pX) * inv_d;
    s = -1;
    if(t1 > t2) {
      t3 = t1;
      t1 = t2;
      t2 = t3;
      s = 1
    }
    if(t1 > tmin) {
      normal.x = s;
      normal.y = 0;
      tmin = t1
    }
    tmax = Math.min(tmax, t2);
    if(tmin > tmax) {
      return false
    }
  }
  if(absDY < Number.MIN_VALUE) {
    if(pY < this.lowerBound.y || this.upperBound.y < pY) {
      return false
    }
  }else {
    inv_d = 1 / dY;
    t1 = (this.lowerBound.y - pY) * inv_d;
    t2 = (this.upperBound.y - pY) * inv_d;
    s = -1;
    if(t1 > t2) {
      t3 = t1;
      t1 = t2;
      t2 = t3;
      s = 1
    }
    if(t1 > tmin) {
      normal.y = s;
      normal.x = 0;
      tmin = t1
    }
    tmax = Math.min(tmax, t2);
    if(tmin > tmax) {
      return false
    }
  }
  output.fraction = tmin;
  return true
};
b2AABB.prototype.TestOverlap = function(other) {
  var d1X = other.lowerBound.x - this.upperBound.x;
  var d1Y = other.lowerBound.y - this.upperBound.y;
  var d2X = this.lowerBound.x - other.upperBound.x;
  var d2Y = this.lowerBound.y - other.upperBound.y;
  if(d1X > 0 || d1Y > 0) {
    return false
  }
  if(d2X > 0 || d2Y > 0) {
    return false
  }
  return true
};
b2AABB.prototype.Combine = function(aabb1, aabb2) {
  this.lowerBound.x = Math.min(aabb1.lowerBound.x, aabb2.lowerBound.x);
  this.lowerBound.y = Math.min(aabb1.lowerBound.y, aabb2.lowerBound.y);
  this.upperBound.x = Math.max(aabb1.upperBound.x, aabb2.upperBound.x);
  this.upperBound.y = Math.max(aabb1.upperBound.y, aabb2.upperBound.y)
};
b2AABB.prototype.lowerBound = new b2Vec2;
b2AABB.prototype.upperBound = new b2Vec2;var b2Jacobian = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Jacobian.prototype.__constructor = function() {
};
b2Jacobian.prototype.__varz = function() {
  this.linearA = new b2Vec2;
  this.linearB = new b2Vec2
};
b2Jacobian.prototype.SetZero = function() {
  this.linearA.SetZero();
  this.angularA = 0;
  this.linearB.SetZero();
  this.angularB = 0
};
b2Jacobian.prototype.Set = function(x1, a1, x2, a2) {
  this.linearA.SetV(x1);
  this.angularA = a1;
  this.linearB.SetV(x2);
  this.angularB = a2
};
b2Jacobian.prototype.Compute = function(x1, a1, x2, a2) {
  return this.linearA.x * x1.x + this.linearA.y * x1.y + this.angularA * a1 + (this.linearB.x * x2.x + this.linearB.y * x2.y) + this.angularB * a2
};
b2Jacobian.prototype.linearA = new b2Vec2;
b2Jacobian.prototype.angularA = null;
b2Jacobian.prototype.linearB = new b2Vec2;
b2Jacobian.prototype.angularB = null;var b2Bound = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Bound.prototype.__constructor = function() {
};
b2Bound.prototype.__varz = function() {
};
b2Bound.prototype.IsLower = function() {
  return(this.value & 1) == 0
};
b2Bound.prototype.IsUpper = function() {
  return(this.value & 1) == 1
};
b2Bound.prototype.Swap = function(b) {
  var tempValue = this.value;
  var tempProxy = this.proxy;
  var tempStabbingCount = this.stabbingCount;
  this.value = b.value;
  this.proxy = b.proxy;
  this.stabbingCount = b.stabbingCount;
  b.value = tempValue;
  b.proxy = tempProxy;
  b.stabbingCount = tempStabbingCount
};
b2Bound.prototype.value = 0;
b2Bound.prototype.proxy = null;
b2Bound.prototype.stabbingCount = 0;var b2SimplexVertex = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2SimplexVertex.prototype.__constructor = function() {
};
b2SimplexVertex.prototype.__varz = function() {
};
b2SimplexVertex.prototype.Set = function(other) {
  this.wA.SetV(other.wA);
  this.wB.SetV(other.wB);
  this.w.SetV(other.w);
  this.a = other.a;
  this.indexA = other.indexA;
  this.indexB = other.indexB
};
b2SimplexVertex.prototype.wA = null;
b2SimplexVertex.prototype.wB = null;
b2SimplexVertex.prototype.w = null;
b2SimplexVertex.prototype.a = null;
b2SimplexVertex.prototype.indexA = 0;
b2SimplexVertex.prototype.indexB = 0;var b2Mat22 = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Mat22.prototype.__constructor = function() {
  this.col1.x = this.col2.y = 1
};
b2Mat22.prototype.__varz = function() {
  this.col1 = new b2Vec2;
  this.col2 = new b2Vec2
};
b2Mat22.FromAngle = function(angle) {
  var mat = new b2Mat22;
  mat.Set(angle);
  return mat
};
b2Mat22.FromVV = function(c1, c2) {
  var mat = new b2Mat22;
  mat.SetVV(c1, c2);
  return mat
};
b2Mat22.prototype.Set = function(angle) {
  var c = Math.cos(angle);
  var s = Math.sin(angle);
  this.col1.x = c;
  this.col2.x = -s;
  this.col1.y = s;
  this.col2.y = c
};
b2Mat22.prototype.SetVV = function(c1, c2) {
  this.col1.SetV(c1);
  this.col2.SetV(c2)
};
b2Mat22.prototype.Copy = function() {
  var mat = new b2Mat22;
  mat.SetM(this);
  return mat
};
b2Mat22.prototype.SetM = function(m) {
  this.col1.SetV(m.col1);
  this.col2.SetV(m.col2)
};
b2Mat22.prototype.AddM = function(m) {
  this.col1.x += m.col1.x;
  this.col1.y += m.col1.y;
  this.col2.x += m.col2.x;
  this.col2.y += m.col2.y
};
b2Mat22.prototype.SetIdentity = function() {
  this.col1.x = 1;
  this.col2.x = 0;
  this.col1.y = 0;
  this.col2.y = 1
};
b2Mat22.prototype.SetZero = function() {
  this.col1.x = 0;
  this.col2.x = 0;
  this.col1.y = 0;
  this.col2.y = 0
};
b2Mat22.prototype.GetAngle = function() {
  return Math.atan2(this.col1.y, this.col1.x)
};
b2Mat22.prototype.GetInverse = function(out) {
  var a = this.col1.x;
  var b = this.col2.x;
  var c = this.col1.y;
  var d = this.col2.y;
  var det = a * d - b * c;
  if(det != 0) {
    det = 1 / det
  }
  out.col1.x = det * d;
  out.col2.x = -det * b;
  out.col1.y = -det * c;
  out.col2.y = det * a;
  return out
};
b2Mat22.prototype.Solve = function(out, bX, bY) {
  var a11 = this.col1.x;
  var a12 = this.col2.x;
  var a21 = this.col1.y;
  var a22 = this.col2.y;
  var det = a11 * a22 - a12 * a21;
  if(det != 0) {
    det = 1 / det
  }
  out.x = det * (a22 * bX - a12 * bY);
  out.y = det * (a11 * bY - a21 * bX);
  return out
};
b2Mat22.prototype.Abs = function() {
  this.col1.Abs();
  this.col2.Abs()
};
b2Mat22.prototype.col1 = new b2Vec2;
b2Mat22.prototype.col2 = new b2Vec2;var b2SimplexCache = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2SimplexCache.prototype.__constructor = function() {
};
b2SimplexCache.prototype.__varz = function() {
  this.indexA = new Array(3);
  this.indexB = new Array(3)
};
b2SimplexCache.prototype.metric = null;
b2SimplexCache.prototype.count = 0;
b2SimplexCache.prototype.indexA = new Array(3);
b2SimplexCache.prototype.indexB = new Array(3);var b2Shape = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Shape.prototype.__constructor = function() {
  this.m_type = b2Shape.e_unknownShape;
  this.m_radius = b2Settings.b2_linearSlop
};
b2Shape.prototype.__varz = function() {
};
b2Shape.TestOverlap = function(shape1, transform1, shape2, transform2) {
  var input = new b2DistanceInput;
  input.proxyA = new b2DistanceProxy;
  input.proxyA.Set(shape1);
  input.proxyB = new b2DistanceProxy;
  input.proxyB.Set(shape2);
  input.transformA = transform1;
  input.transformB = transform2;
  input.useRadii = true;
  var simplexCache = new b2SimplexCache;
  simplexCache.count = 0;
  var output = new b2DistanceOutput;
  b2Distance.Distance(output, simplexCache, input);
  return output.distance < 10 * Number.MIN_VALUE
};
b2Shape.e_hitCollide = 1;
b2Shape.e_missCollide = 0;
b2Shape.e_startsInsideCollide = -1;
b2Shape.e_unknownShape = -1;
b2Shape.e_circleShape = 0;
b2Shape.e_polygonShape = 1;
b2Shape.e_edgeShape = 2;
b2Shape.e_shapeTypeCount = 3;
b2Shape.prototype.Copy = function() {
  return null
};
b2Shape.prototype.Set = function(other) {
  this.m_radius = other.m_radius
};
b2Shape.prototype.GetType = function() {
  return this.m_type
};
b2Shape.prototype.TestPoint = function(xf, p) {
  return false
};
b2Shape.prototype.RayCast = function(output, input, transform) {
  return false
};
b2Shape.prototype.ComputeAABB = function(aabb, xf) {
};
b2Shape.prototype.ComputeMass = function(massData, density) {
};
b2Shape.prototype.ComputeSubmergedArea = function(normal, offset, xf, c) {
  return 0
};
b2Shape.prototype.m_type = 0;
b2Shape.prototype.m_radius = null;var b2Segment = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Segment.prototype.__constructor = function() {
};
b2Segment.prototype.__varz = function() {
  this.p1 = new b2Vec2;
  this.p2 = new b2Vec2
};
b2Segment.prototype.TestSegment = function(lambda, normal, segment, maxLambda) {
  var s = segment.p1;
  var rX = segment.p2.x - s.x;
  var rY = segment.p2.y - s.y;
  var dX = this.p2.x - this.p1.x;
  var dY = this.p2.y - this.p1.y;
  var nX = dY;
  var nY = -dX;
  var k_slop = 100 * Number.MIN_VALUE;
  var denom = -(rX * nX + rY * nY);
  if(denom > k_slop) {
    var bX = s.x - this.p1.x;
    var bY = s.y - this.p1.y;
    var a = bX * nX + bY * nY;
    if(0 <= a && a <= maxLambda * denom) {
      var mu2 = -rX * bY + rY * bX;
      if(-k_slop * denom <= mu2 && mu2 <= denom * (1 + k_slop)) {
        a /= denom;
        var nLen = Math.sqrt(nX * nX + nY * nY);
        nX /= nLen;
        nY /= nLen;
        lambda[0] = a;
        normal.Set(nX, nY);
        return true
      }
    }
  }
  return false
};
b2Segment.prototype.Extend = function(aabb) {
  this.ExtendForward(aabb);
  this.ExtendBackward(aabb)
};
b2Segment.prototype.ExtendForward = function(aabb) {
  var dX = this.p2.x - this.p1.x;
  var dY = this.p2.y - this.p1.y;
  var lambda = Math.min(dX > 0 ? (aabb.upperBound.x - this.p1.x) / dX : dX < 0 ? (aabb.lowerBound.x - this.p1.x) / dX : Number.POSITIVE_INFINITY, dY > 0 ? (aabb.upperBound.y - this.p1.y) / dY : dY < 0 ? (aabb.lowerBound.y - this.p1.y) / dY : Number.POSITIVE_INFINITY);
  this.p2.x = this.p1.x + dX * lambda;
  this.p2.y = this.p1.y + dY * lambda
};
b2Segment.prototype.ExtendBackward = function(aabb) {
  var dX = -this.p2.x + this.p1.x;
  var dY = -this.p2.y + this.p1.y;
  var lambda = Math.min(dX > 0 ? (aabb.upperBound.x - this.p2.x) / dX : dX < 0 ? (aabb.lowerBound.x - this.p2.x) / dX : Number.POSITIVE_INFINITY, dY > 0 ? (aabb.upperBound.y - this.p2.y) / dY : dY < 0 ? (aabb.lowerBound.y - this.p2.y) / dY : Number.POSITIVE_INFINITY);
  this.p1.x = this.p2.x + dX * lambda;
  this.p1.y = this.p2.y + dY * lambda
};
b2Segment.prototype.p1 = new b2Vec2;
b2Segment.prototype.p2 = new b2Vec2;var b2ContactRegister = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactRegister.prototype.__constructor = function() {
};
b2ContactRegister.prototype.__varz = function() {
};
b2ContactRegister.prototype.createFcn = null;
b2ContactRegister.prototype.destroyFcn = null;
b2ContactRegister.prototype.primary = null;
b2ContactRegister.prototype.pool = null;
b2ContactRegister.prototype.poolCount = 0;var b2DebugDraw = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2DebugDraw.prototype.__constructor = function() {
  this.m_drawFlags = 0
};
b2DebugDraw.prototype.__varz = function() {
};
b2DebugDraw.e_shapeBit = 1;
b2DebugDraw.e_jointBit = 2;
b2DebugDraw.e_aabbBit = 4;
b2DebugDraw.e_pairBit = 8;
b2DebugDraw.e_centerOfMassBit = 16;
b2DebugDraw.e_controllerBit = 32;
b2DebugDraw.prototype.SetFlags = function(flags) {
  this.m_drawFlags = flags
};
b2DebugDraw.prototype.GetFlags = function() {
  return this.m_drawFlags
};
b2DebugDraw.prototype.AppendFlags = function(flags) {
  this.m_drawFlags |= flags
};
b2DebugDraw.prototype.ClearFlags = function(flags) {
  this.m_drawFlags &= ~flags
};
b2DebugDraw.prototype.SetSprite = function(sprite) {
  this.m_sprite = sprite
};
b2DebugDraw.prototype.GetSprite = function() {
  return this.m_sprite
};
b2DebugDraw.prototype.SetDrawScale = function(drawScale) {
  this.m_drawScale = drawScale
};
b2DebugDraw.prototype.GetDrawScale = function() {
  return this.m_drawScale
};
b2DebugDraw.prototype.SetLineThickness = function(lineThickness) {
  this.m_lineThickness = lineThickness
};
b2DebugDraw.prototype.GetLineThickness = function() {
  return this.m_lineThickness
};
b2DebugDraw.prototype.SetAlpha = function(alpha) {
  this.m_alpha = alpha
};
b2DebugDraw.prototype.GetAlpha = function() {
  return this.m_alpha
};
b2DebugDraw.prototype.SetFillAlpha = function(alpha) {
  this.m_fillAlpha = alpha
};
b2DebugDraw.prototype.GetFillAlpha = function() {
  return this.m_fillAlpha
};
b2DebugDraw.prototype.SetXFormScale = function(xformScale) {
  this.m_xformScale = xformScale
};
b2DebugDraw.prototype.GetXFormScale = function() {
  return this.m_xformScale
};
b2DebugDraw.prototype.Clear = function() {
  this.m_sprite.clearRect(0, 0, this.m_sprite.canvas.width, this.m_sprite.canvas.height)
};
b2DebugDraw.prototype.Y = function(y) {
  return this.m_sprite.canvas.height - y
};
b2DebugDraw.prototype.ToWorldPoint = function(localPoint) {
  return new b2Vec2(localPoint.x / this.m_drawScale, this.Y(localPoint.y) / this.m_drawScale)
};
b2DebugDraw.prototype.ColorStyle = function(color, alpha) {
  return"rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + alpha + ")"
};
b2DebugDraw.prototype.DrawPolygon = function(vertices, vertexCount, color) {
  this.m_sprite.graphics.lineStyle(this.m_lineThickness, color.color, this.m_alpha);
  this.m_sprite.graphics.moveTo(vertices[0].x * this.m_drawScale, vertices[0].y * this.m_drawScale);
  for(var i = 1;i < vertexCount;i++) {
    this.m_sprite.graphics.lineTo(vertices[i].x * this.m_drawScale, vertices[i].y * this.m_drawScale)
  }
  this.m_sprite.graphics.lineTo(vertices[0].x * this.m_drawScale, vertices[0].y * this.m_drawScale)
};
b2DebugDraw.prototype.DrawSolidPolygon = function(vertices, vertexCount, color) {
  this.m_sprite.strokeSyle = this.ColorStyle(color, this.m_alpha);
  this.m_sprite.lineWidth = this.m_lineThickness;
  this.m_sprite.fillStyle = this.ColorStyle(color, this.m_fillAlpha);
  this.m_sprite.beginPath();
  this.m_sprite.moveTo(vertices[0].x * this.m_drawScale, this.Y(vertices[0].y * this.m_drawScale));
  for(var i = 1;i < vertexCount;i++) {
    this.m_sprite.lineTo(vertices[i].x * this.m_drawScale, this.Y(vertices[i].y * this.m_drawScale))
  }
  this.m_sprite.lineTo(vertices[0].x * this.m_drawScale, this.Y(vertices[0].y * this.m_drawScale));
  this.m_sprite.fill();
  this.m_sprite.stroke();
  this.m_sprite.closePath()
};
b2DebugDraw.prototype.DrawCircle = function(center, radius, color) {
  this.m_sprite.graphics.lineStyle(this.m_lineThickness, color.color, this.m_alpha);
  this.m_sprite.graphics.drawCircle(center.x * this.m_drawScale, center.y * this.m_drawScale, radius * this.m_drawScale)
};
b2DebugDraw.prototype.DrawSolidCircle = function(center, radius, axis, color) {
  this.m_sprite.strokeSyle = this.ColorStyle(color, this.m_alpha);
  this.m_sprite.lineWidth = this.m_lineThickness;
  this.m_sprite.fillStyle = this.ColorStyle(color, this.m_fillAlpha);
  this.m_sprite.beginPath();
  this.m_sprite.arc(center.x * this.m_drawScale, this.Y(center.y * this.m_drawScale), radius * this.m_drawScale, 0, Math.PI * 2, true);
  this.m_sprite.fill();
  this.m_sprite.stroke();
  this.m_sprite.closePath()
};
b2DebugDraw.prototype.DrawSegment = function(p1, p2, color) {
  this.m_sprite.lineWidth = this.m_lineThickness;
  this.m_sprite.strokeSyle = this.ColorStyle(color, this.m_alpha);
  this.m_sprite.beginPath();
  this.m_sprite.moveTo(p1.x * this.m_drawScale, this.Y(p1.y * this.m_drawScale));
  this.m_sprite.lineTo(p2.x * this.m_drawScale, this.Y(p2.y * this.m_drawScale));
  this.m_sprite.stroke();
  this.m_sprite.closePath()
};
b2DebugDraw.prototype.DrawTransform = function(xf) {
  this.m_sprite.lineWidth = this.m_lineThickness;
  this.m_sprite.strokeSyle = this.ColorStyle(new b2Color(255, 0, 0), this.m_alpha);
  this.m_sprite.beginPath();
  this.m_sprite.moveTo(xf.position.x * this.m_drawScale, this.Y(xf.position.y * this.m_drawScale));
  this.m_sprite.lineTo((xf.position.x + this.m_xformScale * xf.R.col1.x) * this.m_drawScale, this.Y((xf.position.y + this.m_xformScale * xf.R.col1.y) * this.m_drawScale));
  this.m_sprite.stroke();
  this.m_sprite.closePath();
  this.m_sprite.strokeSyle = this.ColorStyle(new b2Color(0, 255, 0), this.m_alpha);
  this.m_sprite.beginPath();
  this.m_sprite.moveTo(xf.position.x * this.m_drawScale, this.Y(xf.position.y * this.m_drawScale));
  this.m_sprite.lineTo((xf.position.x + this.m_xformScale * xf.R.col2.x) * this.m_drawScale, this.Y((xf.position.y + this.m_xformScale * xf.R.col2.y) * this.m_drawScale));
  this.m_sprite.stroke();
  this.m_sprite.closePath()
};
b2DebugDraw.prototype.m_drawFlags = 0;
b2DebugDraw.prototype.m_sprite = null;
b2DebugDraw.prototype.m_drawScale = 1;
b2DebugDraw.prototype.m_lineThickness = 1;
b2DebugDraw.prototype.m_alpha = 1;
b2DebugDraw.prototype.m_fillAlpha = 1;
b2DebugDraw.prototype.m_xformScale = 1;var b2Sweep = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Sweep.prototype.__constructor = function() {
};
b2Sweep.prototype.__varz = function() {
  this.localCenter = new b2Vec2;
  this.c0 = new b2Vec2;
  this.c = new b2Vec2
};
b2Sweep.prototype.Set = function(other) {
  this.localCenter.SetV(other.localCenter);
  this.c0.SetV(other.c0);
  this.c.SetV(other.c);
  this.a0 = other.a0;
  this.a = other.a;
  this.t0 = other.t0
};
b2Sweep.prototype.Copy = function() {
  var copy = new b2Sweep;
  copy.localCenter.SetV(this.localCenter);
  copy.c0.SetV(this.c0);
  copy.c.SetV(this.c);
  copy.a0 = this.a0;
  copy.a = this.a;
  copy.t0 = this.t0;
  return copy
};
b2Sweep.prototype.GetTransform = function(xf, alpha) {
  xf.position.x = (1 - alpha) * this.c0.x + alpha * this.c.x;
  xf.position.y = (1 - alpha) * this.c0.y + alpha * this.c.y;
  var angle = (1 - alpha) * this.a0 + alpha * this.a;
  xf.R.Set(angle);
  var tMat = xf.R;
  xf.position.x -= tMat.col1.x * this.localCenter.x + tMat.col2.x * this.localCenter.y;
  xf.position.y -= tMat.col1.y * this.localCenter.x + tMat.col2.y * this.localCenter.y
};
b2Sweep.prototype.Advance = function(t) {
  if(this.t0 < t && 1 - this.t0 > Number.MIN_VALUE) {
    var alpha = (t - this.t0) / (1 - this.t0);
    this.c0.x = (1 - alpha) * this.c0.x + alpha * this.c.x;
    this.c0.y = (1 - alpha) * this.c0.y + alpha * this.c.y;
    this.a0 = (1 - alpha) * this.a0 + alpha * this.a;
    this.t0 = t
  }
};
b2Sweep.prototype.localCenter = new b2Vec2;
b2Sweep.prototype.c0 = new b2Vec2;
b2Sweep.prototype.c = new b2Vec2;
b2Sweep.prototype.a0 = null;
b2Sweep.prototype.a = null;
b2Sweep.prototype.t0 = null;var b2DistanceOutput = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2DistanceOutput.prototype.__constructor = function() {
};
b2DistanceOutput.prototype.__varz = function() {
  this.pointA = new b2Vec2;
  this.pointB = new b2Vec2
};
b2DistanceOutput.prototype.pointA = new b2Vec2;
b2DistanceOutput.prototype.pointB = new b2Vec2;
b2DistanceOutput.prototype.distance = null;
b2DistanceOutput.prototype.iterations = 0;var b2Mat33 = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Mat33.prototype.__constructor = function(c1, c2, c3) {
  if(!c1 && !c2 && !c3) {
    this.col1.SetZero();
    this.col2.SetZero();
    this.col3.SetZero()
  }else {
    this.col1.SetV(c1);
    this.col2.SetV(c2);
    this.col3.SetV(c3)
  }
};
b2Mat33.prototype.__varz = function() {
  this.col1 = new b2Vec3;
  this.col2 = new b2Vec3;
  this.col3 = new b2Vec3
};
b2Mat33.prototype.SetVVV = function(c1, c2, c3) {
  this.col1.SetV(c1);
  this.col2.SetV(c2);
  this.col3.SetV(c3)
};
b2Mat33.prototype.Copy = function() {
  return new b2Mat33(this.col1, this.col2, this.col3)
};
b2Mat33.prototype.SetM = function(m) {
  this.col1.SetV(m.col1);
  this.col2.SetV(m.col2);
  this.col3.SetV(m.col3)
};
b2Mat33.prototype.AddM = function(m) {
  this.col1.x += m.col1.x;
  this.col1.y += m.col1.y;
  this.col1.z += m.col1.z;
  this.col2.x += m.col2.x;
  this.col2.y += m.col2.y;
  this.col2.z += m.col2.z;
  this.col3.x += m.col3.x;
  this.col3.y += m.col3.y;
  this.col3.z += m.col3.z
};
b2Mat33.prototype.SetIdentity = function() {
  this.col1.x = 1;
  this.col2.x = 0;
  this.col3.x = 0;
  this.col1.y = 0;
  this.col2.y = 1;
  this.col3.y = 0;
  this.col1.z = 0;
  this.col2.z = 0;
  this.col3.z = 1
};
b2Mat33.prototype.SetZero = function() {
  this.col1.x = 0;
  this.col2.x = 0;
  this.col3.x = 0;
  this.col1.y = 0;
  this.col2.y = 0;
  this.col3.y = 0;
  this.col1.z = 0;
  this.col2.z = 0;
  this.col3.z = 0
};
b2Mat33.prototype.Solve22 = function(out, bX, bY) {
  var a11 = this.col1.x;
  var a12 = this.col2.x;
  var a21 = this.col1.y;
  var a22 = this.col2.y;
  var det = a11 * a22 - a12 * a21;
  if(det != 0) {
    det = 1 / det
  }
  out.x = det * (a22 * bX - a12 * bY);
  out.y = det * (a11 * bY - a21 * bX);
  return out
};
b2Mat33.prototype.Solve33 = function(out, bX, bY, bZ) {
  var a11 = this.col1.x;
  var a21 = this.col1.y;
  var a31 = this.col1.z;
  var a12 = this.col2.x;
  var a22 = this.col2.y;
  var a32 = this.col2.z;
  var a13 = this.col3.x;
  var a23 = this.col3.y;
  var a33 = this.col3.z;
  var det = a11 * (a22 * a33 - a32 * a23) + a21 * (a32 * a13 - a12 * a33) + a31 * (a12 * a23 - a22 * a13);
  if(det != 0) {
    det = 1 / det
  }
  out.x = det * (bX * (a22 * a33 - a32 * a23) + bY * (a32 * a13 - a12 * a33) + bZ * (a12 * a23 - a22 * a13));
  out.y = det * (a11 * (bY * a33 - bZ * a23) + a21 * (bZ * a13 - bX * a33) + a31 * (bX * a23 - bY * a13));
  out.z = det * (a11 * (a22 * bZ - a32 * bY) + a21 * (a32 * bX - a12 * bZ) + a31 * (a12 * bY - a22 * bX));
  return out
};
b2Mat33.prototype.col1 = new b2Vec3;
b2Mat33.prototype.col2 = new b2Vec3;
b2Mat33.prototype.col3 = new b2Vec3;var b2PositionSolverManifold = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2PositionSolverManifold.prototype.__constructor = function() {
  this.m_normal = new b2Vec2;
  this.m_separations = new Array(b2Settings.b2_maxManifoldPoints);
  this.m_points = new Array(b2Settings.b2_maxManifoldPoints);
  for(var i = 0;i < b2Settings.b2_maxManifoldPoints;i++) {
    this.m_points[i] = new b2Vec2
  }
};
b2PositionSolverManifold.prototype.__varz = function() {
};
b2PositionSolverManifold.circlePointA = new b2Vec2;
b2PositionSolverManifold.circlePointB = new b2Vec2;
b2PositionSolverManifold.prototype.Initialize = function(cc) {
  b2Settings.b2Assert(cc.pointCount > 0);
  var i = 0;
  var clipPointX;
  var clipPointY;
  var tMat;
  var tVec;
  var planePointX;
  var planePointY;
  switch(cc.type) {
    case b2Manifold.e_circles:
      tMat = cc.bodyA.m_xf.R;
      tVec = cc.localPoint;
      var pointAX = cc.bodyA.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
      var pointAY = cc.bodyA.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
      tMat = cc.bodyB.m_xf.R;
      tVec = cc.points[0].localPoint;
      var pointBX = cc.bodyB.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
      var pointBY = cc.bodyB.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
      var dX = pointBX - pointAX;
      var dY = pointBY - pointAY;
      var d2 = dX * dX + dY * dY;
      if(d2 > Number.MIN_VALUE * Number.MIN_VALUE) {
        var d = Math.sqrt(d2);
        this.m_normal.x = dX / d;
        this.m_normal.y = dY / d
      }else {
        this.m_normal.x = 1;
        this.m_normal.y = 0
      }
      this.m_points[0].x = 0.5 * (pointAX + pointBX);
      this.m_points[0].y = 0.5 * (pointAY + pointBY);
      this.m_separations[0] = dX * this.m_normal.x + dY * this.m_normal.y - cc.radius;
      break;
    case b2Manifold.e_faceA:
      tMat = cc.bodyA.m_xf.R;
      tVec = cc.localPlaneNormal;
      this.m_normal.x = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      this.m_normal.y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      tMat = cc.bodyA.m_xf.R;
      tVec = cc.localPoint;
      planePointX = cc.bodyA.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
      planePointY = cc.bodyA.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
      tMat = cc.bodyB.m_xf.R;
      for(i = 0;i < cc.pointCount;++i) {
        tVec = cc.points[i].localPoint;
        clipPointX = cc.bodyB.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        clipPointY = cc.bodyB.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        this.m_separations[i] = (clipPointX - planePointX) * this.m_normal.x + (clipPointY - planePointY) * this.m_normal.y - cc.radius;
        this.m_points[i].x = clipPointX;
        this.m_points[i].y = clipPointY
      }
      break;
    case b2Manifold.e_faceB:
      tMat = cc.bodyB.m_xf.R;
      tVec = cc.localPlaneNormal;
      this.m_normal.x = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      this.m_normal.y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      tMat = cc.bodyB.m_xf.R;
      tVec = cc.localPoint;
      planePointX = cc.bodyB.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
      planePointY = cc.bodyB.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
      tMat = cc.bodyA.m_xf.R;
      for(i = 0;i < cc.pointCount;++i) {
        tVec = cc.points[i].localPoint;
        clipPointX = cc.bodyA.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        clipPointY = cc.bodyA.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        this.m_separations[i] = (clipPointX - planePointX) * this.m_normal.x + (clipPointY - planePointY) * this.m_normal.y - cc.radius;
        this.m_points[i].Set(clipPointX, clipPointY)
      }
      this.m_normal.x *= -1;
      this.m_normal.y *= -1;
      break
  }
};
b2PositionSolverManifold.prototype.m_normal = null;
b2PositionSolverManifold.prototype.m_points = null;
b2PositionSolverManifold.prototype.m_separations = null;var b2OBB = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2OBB.prototype.__constructor = function() {
};
b2OBB.prototype.__varz = function() {
  this.R = new b2Mat22;
  this.center = new b2Vec2;
  this.extents = new b2Vec2
};
b2OBB.prototype.R = new b2Mat22;
b2OBB.prototype.center = new b2Vec2;
b2OBB.prototype.extents = new b2Vec2;var b2Pair = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Pair.prototype.__constructor = function() {
};
b2Pair.prototype.__varz = function() {
};
b2Pair.b2_nullProxy = b2Settings.USHRT_MAX;
b2Pair.e_pairBuffered = 1;
b2Pair.e_pairRemoved = 2;
b2Pair.e_pairFinal = 4;
b2Pair.prototype.SetBuffered = function() {
  this.status |= b2Pair.e_pairBuffered
};
b2Pair.prototype.ClearBuffered = function() {
  this.status &= ~b2Pair.e_pairBuffered
};
b2Pair.prototype.IsBuffered = function() {
  return(this.status & b2Pair.e_pairBuffered) == b2Pair.e_pairBuffered
};
b2Pair.prototype.SetRemoved = function() {
  this.status |= b2Pair.e_pairRemoved
};
b2Pair.prototype.ClearRemoved = function() {
  this.status &= ~b2Pair.e_pairRemoved
};
b2Pair.prototype.IsRemoved = function() {
  return(this.status & b2Pair.e_pairRemoved) == b2Pair.e_pairRemoved
};
b2Pair.prototype.SetFinal = function() {
  this.status |= b2Pair.e_pairFinal
};
b2Pair.prototype.IsFinal = function() {
  return(this.status & b2Pair.e_pairFinal) == b2Pair.e_pairFinal
};
b2Pair.prototype.userData = null;
b2Pair.prototype.proxy1 = null;
b2Pair.prototype.proxy2 = null;
b2Pair.prototype.next = null;
b2Pair.prototype.status = 0;var b2FixtureDef = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2FixtureDef.prototype.__constructor = function() {
  this.shape = null;
  this.userData = null;
  this.friction = 0.2;
  this.restitution = 0;
  this.density = 0;
  this.filter.categoryBits = 1;
  this.filter.maskBits = 65535;
  this.filter.groupIndex = 0;
  this.isSensor = false
};
b2FixtureDef.prototype.__varz = function() {
  this.filter = new b2FilterData
};
b2FixtureDef.prototype.shape = null;
b2FixtureDef.prototype.userData = null;
b2FixtureDef.prototype.friction = null;
b2FixtureDef.prototype.restitution = null;
b2FixtureDef.prototype.density = null;
b2FixtureDef.prototype.isSensor = null;
b2FixtureDef.prototype.filter = new b2FilterData;var b2ContactID = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactID.prototype.__constructor = function() {
  this.features._m_id = this
};
b2ContactID.prototype.__varz = function() {
  this.features = new Features
};
b2ContactID.prototype.Set = function(id) {
  key = id._key
};
b2ContactID.prototype.Copy = function() {
  var id = new b2ContactID;
  id.key = key;
  return id
};
b2ContactID.prototype.__defineSetter__("key", function() {
  return this._key
});
b2ContactID.prototype.__defineSetter__("key", function(value) {
  this._key = value;
  this.features._referenceEdge = this._key & 255;
  this.features._incidentEdge = (this._key & 65280) >> 8 & 255;
  this.features._incidentVertex = (this._key & 16711680) >> 16 & 255;
  this.features._flip = (this._key & 4278190080) >> 24 & 255
});
b2ContactID.prototype._key = 0;
b2ContactID.prototype.features = new Features;var b2Transform = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Transform.prototype.__constructor = function(pos, r) {
  if(pos) {
    this.position.SetV(pos);
    this.R.SetM(r)
  }
};
b2Transform.prototype.__varz = function() {
  this.position = new b2Vec2;
  this.R = new b2Mat22
};
b2Transform.prototype.Initialize = function(pos, r) {
  this.position.SetV(pos);
  this.R.SetM(r)
};
b2Transform.prototype.SetIdentity = function() {
  this.position.SetZero();
  this.R.SetIdentity()
};
b2Transform.prototype.Set = function(x) {
  this.position.SetV(x.position);
  this.R.SetM(x.R)
};
b2Transform.prototype.GetAngle = function() {
  return Math.atan2(this.R.col1.y, this.R.col1.x)
};
b2Transform.prototype.position = new b2Vec2;
b2Transform.prototype.R = new b2Mat22;var b2EdgeShape = function() {
  b2Shape.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2EdgeShape.prototype, b2Shape.prototype);
b2EdgeShape.prototype._super = b2Shape.prototype;
b2EdgeShape.prototype.__constructor = function(v1, v2) {
  this._super.__constructor.apply(this, []);
  this.m_type = b2Shape.e_edgeShape;
  this.m_prevEdge = null;
  this.m_nextEdge = null;
  this.m_v1 = v1;
  this.m_v2 = v2;
  this.m_direction.Set(this.m_v2.x - this.m_v1.x, this.m_v2.y - this.m_v1.y);
  this.m_length = this.m_direction.Normalize();
  this.m_normal.Set(this.m_direction.y, -this.m_direction.x);
  this.m_coreV1.Set(-b2Settings.b2_toiSlop * (this.m_normal.x - this.m_direction.x) + this.m_v1.x, -b2Settings.b2_toiSlop * (this.m_normal.y - this.m_direction.y) + this.m_v1.y);
  this.m_coreV2.Set(-b2Settings.b2_toiSlop * (this.m_normal.x + this.m_direction.x) + this.m_v2.x, -b2Settings.b2_toiSlop * (this.m_normal.y + this.m_direction.y) + this.m_v2.y);
  this.m_cornerDir1 = this.m_normal;
  this.m_cornerDir2.Set(-this.m_normal.x, -this.m_normal.y)
};
b2EdgeShape.prototype.__varz = function() {
  this.s_supportVec = new b2Vec2;
  this.m_v1 = new b2Vec2;
  this.m_v2 = new b2Vec2;
  this.m_coreV1 = new b2Vec2;
  this.m_coreV2 = new b2Vec2;
  this.m_normal = new b2Vec2;
  this.m_direction = new b2Vec2;
  this.m_cornerDir1 = new b2Vec2;
  this.m_cornerDir2 = new b2Vec2
};
b2EdgeShape.prototype.SetPrevEdge = function(edge, core, cornerDir, convex) {
  this.m_prevEdge = edge;
  this.m_coreV1 = core;
  this.m_cornerDir1 = cornerDir;
  this.m_cornerConvex1 = convex
};
b2EdgeShape.prototype.SetNextEdge = function(edge, core, cornerDir, convex) {
  this.m_nextEdge = edge;
  this.m_coreV2 = core;
  this.m_cornerDir2 = cornerDir;
  this.m_cornerConvex2 = convex
};
b2EdgeShape.prototype.TestPoint = function(transform, p) {
  return false
};
b2EdgeShape.prototype.RayCast = function(output, input, transform) {
  var tMat;
  var rX = input.p2.x - input.p1.x;
  var rY = input.p2.y - input.p1.y;
  tMat = transform.R;
  var v1X = transform.position.x + (tMat.col1.x * this.m_v1.x + tMat.col2.x * this.m_v1.y);
  var v1Y = transform.position.y + (tMat.col1.y * this.m_v1.x + tMat.col2.y * this.m_v1.y);
  var nX = transform.position.y + (tMat.col1.y * this.m_v2.x + tMat.col2.y * this.m_v2.y) - v1Y;
  var nY = -(transform.position.x + (tMat.col1.x * this.m_v2.x + tMat.col2.x * this.m_v2.y) - v1X);
  var k_slop = 100 * Number.MIN_VALUE;
  var denom = -(rX * nX + rY * nY);
  if(denom > k_slop) {
    var bX = input.p1.x - v1X;
    var bY = input.p1.y - v1Y;
    var a = bX * nX + bY * nY;
    if(0 <= a && a <= input.maxFraction * denom) {
      var mu2 = -rX * bY + rY * bX;
      if(-k_slop * denom <= mu2 && mu2 <= denom * (1 + k_slop)) {
        a /= denom;
        output.fraction = a;
        var nLen = Math.sqrt(nX * nX + nY * nY);
        output.normal.x = nX / nLen;
        output.normal.y = nY / nLen;
        return true
      }
    }
  }
  return false
};
b2EdgeShape.prototype.ComputeAABB = function(aabb, transform) {
  var tMat = transform.R;
  var v1X = transform.position.x + (tMat.col1.x * this.m_v1.x + tMat.col2.x * this.m_v1.y);
  var v1Y = transform.position.y + (tMat.col1.y * this.m_v1.x + tMat.col2.y * this.m_v1.y);
  var v2X = transform.position.x + (tMat.col1.x * this.m_v2.x + tMat.col2.x * this.m_v2.y);
  var v2Y = transform.position.y + (tMat.col1.y * this.m_v2.x + tMat.col2.y * this.m_v2.y);
  if(v1X < v2X) {
    aabb.lowerBound.x = v1X;
    aabb.upperBound.x = v2X
  }else {
    aabb.lowerBound.x = v2X;
    aabb.upperBound.x = v1X
  }
  if(v1Y < v2Y) {
    aabb.lowerBound.y = v1Y;
    aabb.upperBound.y = v2Y
  }else {
    aabb.lowerBound.y = v2Y;
    aabb.upperBound.y = v1Y
  }
};
b2EdgeShape.prototype.ComputeMass = function(massData, density) {
  massData.mass = 0;
  massData.center.SetV(this.m_v1);
  massData.I = 0
};
b2EdgeShape.prototype.ComputeSubmergedArea = function(normal, offset, xf, c) {
  var v0 = new b2Vec2(normal.x * offset, normal.y * offset);
  var v1 = b2Math.MulX(xf, this.m_v1);
  var v2 = b2Math.MulX(xf, this.m_v2);
  var d1 = b2Math.Dot(normal, v1) - offset;
  var d2 = b2Math.Dot(normal, v2) - offset;
  if(d1 > 0) {
    if(d2 > 0) {
      return 0
    }else {
      v1.x = -d2 / (d1 - d2) * v1.x + d1 / (d1 - d2) * v2.x;
      v1.y = -d2 / (d1 - d2) * v1.y + d1 / (d1 - d2) * v2.y
    }
  }else {
    if(d2 > 0) {
      v2.x = -d2 / (d1 - d2) * v1.x + d1 / (d1 - d2) * v2.x;
      v2.y = -d2 / (d1 - d2) * v1.y + d1 / (d1 - d2) * v2.y
    }else {
    }
  }
  c.x = (v0.x + v1.x + v2.x) / 3;
  c.y = (v0.y + v1.y + v2.y) / 3;
  return 0.5 * ((v1.x - v0.x) * (v2.y - v0.y) - (v1.y - v0.y) * (v2.x - v0.x))
};
b2EdgeShape.prototype.GetLength = function() {
  return this.m_length
};
b2EdgeShape.prototype.GetVertex1 = function() {
  return this.m_v1
};
b2EdgeShape.prototype.GetVertex2 = function() {
  return this.m_v2
};
b2EdgeShape.prototype.GetCoreVertex1 = function() {
  return this.m_coreV1
};
b2EdgeShape.prototype.GetCoreVertex2 = function() {
  return this.m_coreV2
};
b2EdgeShape.prototype.GetNormalVector = function() {
  return this.m_normal
};
b2EdgeShape.prototype.GetDirectionVector = function() {
  return this.m_direction
};
b2EdgeShape.prototype.GetCorner1Vector = function() {
  return this.m_cornerDir1
};
b2EdgeShape.prototype.GetCorner2Vector = function() {
  return this.m_cornerDir2
};
b2EdgeShape.prototype.Corner1IsConvex = function() {
  return this.m_cornerConvex1
};
b2EdgeShape.prototype.Corner2IsConvex = function() {
  return this.m_cornerConvex2
};
b2EdgeShape.prototype.GetFirstVertex = function(xf) {
  var tMat = xf.R;
  return new b2Vec2(xf.position.x + (tMat.col1.x * this.m_coreV1.x + tMat.col2.x * this.m_coreV1.y), xf.position.y + (tMat.col1.y * this.m_coreV1.x + tMat.col2.y * this.m_coreV1.y))
};
b2EdgeShape.prototype.GetNextEdge = function() {
  return this.m_nextEdge
};
b2EdgeShape.prototype.GetPrevEdge = function() {
  return this.m_prevEdge
};
b2EdgeShape.prototype.Support = function(xf, dX, dY) {
  var tMat = xf.R;
  var v1X = xf.position.x + (tMat.col1.x * this.m_coreV1.x + tMat.col2.x * this.m_coreV1.y);
  var v1Y = xf.position.y + (tMat.col1.y * this.m_coreV1.x + tMat.col2.y * this.m_coreV1.y);
  var v2X = xf.position.x + (tMat.col1.x * this.m_coreV2.x + tMat.col2.x * this.m_coreV2.y);
  var v2Y = xf.position.y + (tMat.col1.y * this.m_coreV2.x + tMat.col2.y * this.m_coreV2.y);
  if(v1X * dX + v1Y * dY > v2X * dX + v2Y * dY) {
    this.s_supportVec.x = v1X;
    this.s_supportVec.y = v1Y
  }else {
    this.s_supportVec.x = v2X;
    this.s_supportVec.y = v2Y
  }
  return this.s_supportVec
};
b2EdgeShape.prototype.s_supportVec = new b2Vec2;
b2EdgeShape.prototype.m_v1 = new b2Vec2;
b2EdgeShape.prototype.m_v2 = new b2Vec2;
b2EdgeShape.prototype.m_coreV1 = new b2Vec2;
b2EdgeShape.prototype.m_coreV2 = new b2Vec2;
b2EdgeShape.prototype.m_length = null;
b2EdgeShape.prototype.m_normal = new b2Vec2;
b2EdgeShape.prototype.m_direction = new b2Vec2;
b2EdgeShape.prototype.m_cornerDir1 = new b2Vec2;
b2EdgeShape.prototype.m_cornerDir2 = new b2Vec2;
b2EdgeShape.prototype.m_cornerConvex1 = null;
b2EdgeShape.prototype.m_cornerConvex2 = null;
b2EdgeShape.prototype.m_nextEdge = null;
b2EdgeShape.prototype.m_prevEdge = null;var b2BuoyancyController = function() {
  b2Controller.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2BuoyancyController.prototype, b2Controller.prototype);
b2BuoyancyController.prototype._super = b2Controller.prototype;
b2BuoyancyController.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2BuoyancyController.prototype.__varz = function() {
  this.normal = new b2Vec2(0, -1);
  this.velocity = new b2Vec2(0, 0)
};
b2BuoyancyController.prototype.Step = function(step) {
  if(!m_bodyList) {
    return
  }
  if(this.useWorldGravity) {
    this.gravity = this.GetWorld().GetGravity().Copy()
  }
  for(var i = m_bodyList;i;i = i.nextBody) {
    var body = i.body;
    if(body.IsAwake() == false) {
      continue
    }
    var areac = new b2Vec2;
    var massc = new b2Vec2;
    var area = 0;
    var mass = 0;
    for(var fixture = body.GetFixtureList();fixture;fixture = fixture.GetNext()) {
      var sc = new b2Vec2;
      var sarea = fixture.GetShape().ComputeSubmergedArea(this.normal, this.offset, body.GetTransform(), sc);
      area += sarea;
      areac.x += sarea * sc.x;
      areac.y += sarea * sc.y;
      var shapeDensity;
      if(this.useDensity) {
        shapeDensity = 1
      }else {
        shapeDensity = 1
      }
      mass += sarea * shapeDensity;
      massc.x += sarea * sc.x * shapeDensity;
      massc.y += sarea * sc.y * shapeDensity
    }
    areac.x /= area;
    areac.y /= area;
    massc.x /= mass;
    massc.y /= mass;
    if(area < Number.MIN_VALUE) {
      continue
    }
    var buoyancyForce = this.gravity.GetNegative();
    buoyancyForce.Multiply(this.density * area);
    body.ApplyForce(buoyancyForce, massc);
    var dragForce = body.GetLinearVelocityFromWorldPoint(areac);
    dragForce.Subtract(this.velocity);
    dragForce.Multiply(-this.linearDrag * area);
    body.ApplyForce(dragForce, areac);
    body.ApplyTorque(-body.GetInertia() / body.GetMass() * area * body.GetAngularVelocity() * this.angularDrag)
  }
};
b2BuoyancyController.prototype.Draw = function(debugDraw) {
  var r = 1E3;
  var p1 = new b2Vec2;
  var p2 = new b2Vec2;
  p1.x = this.normal.x * this.offset + this.normal.y * r;
  p1.y = this.normal.y * this.offset - this.normal.x * r;
  p2.x = this.normal.x * this.offset - this.normal.y * r;
  p2.y = this.normal.y * this.offset + this.normal.x * r;
  var color = new b2Color(0, 0, 1);
  debugDraw.DrawSegment(p1, p2, color)
};
b2BuoyancyController.prototype.normal = new b2Vec2(0, -1);
b2BuoyancyController.prototype.offset = 0;
b2BuoyancyController.prototype.density = 0;
b2BuoyancyController.prototype.velocity = new b2Vec2(0, 0);
b2BuoyancyController.prototype.linearDrag = 2;
b2BuoyancyController.prototype.angularDrag = 1;
b2BuoyancyController.prototype.useDensity = false;
b2BuoyancyController.prototype.useWorldGravity = true;
b2BuoyancyController.prototype.gravity = null;var b2Body = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Body.prototype.__constructor = function(bd, world) {
  this.m_flags = 0;
  if(bd.bullet) {
    this.m_flags |= b2Body.e_bulletFlag
  }
  if(bd.fixedRotation) {
    this.m_flags |= b2Body.e_fixedRotationFlag
  }
  if(bd.allowSleep) {
    this.m_flags |= b2Body.e_allowSleepFlag
  }
  if(bd.awake) {
    this.m_flags |= b2Body.e_awakeFlag
  }
  if(bd.active) {
    this.m_flags |= b2Body.e_activeFlag
  }
  this.m_world = world;
  this.m_xf.position.SetV(bd.position);
  this.m_xf.R.Set(bd.angle);
  this.m_sweep.localCenter.SetZero();
  this.m_sweep.t0 = 1;
  this.m_sweep.a0 = this.m_sweep.a = bd.angle;
  var tMat = this.m_xf.R;
  var tVec = this.m_sweep.localCenter;
  this.m_sweep.c.x = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
  this.m_sweep.c.y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
  this.m_sweep.c.x += this.m_xf.position.x;
  this.m_sweep.c.y += this.m_xf.position.y;
  this.m_sweep.c0.SetV(this.m_sweep.c);
  this.m_jointList = null;
  this.m_controllerList = null;
  this.m_contactList = null;
  this.m_controllerCount = 0;
  this.m_prev = null;
  this.m_next = null;
  this.m_linearVelocity.SetV(bd.linearVelocity);
  this.m_angularVelocity = bd.angularVelocity;
  this.m_linearDamping = bd.linearDamping;
  this.m_angularDamping = bd.angularDamping;
  this.m_force.Set(0, 0);
  this.m_torque = 0;
  this.m_sleepTime = 0;
  this.m_type = bd.type;
  if(this.m_type == b2Body.b2_dynamicBody) {
    this.m_mass = 1;
    this.m_invMass = 1
  }else {
    this.m_mass = 0;
    this.m_invMass = 0
  }
  this.m_I = 0;
  this.m_invI = 0;
  this.m_inertiaScale = bd.inertiaScale;
  this.m_userData = bd.userData;
  this.m_fixtureList = null;
  this.m_fixtureCount = 0
};
b2Body.prototype.__varz = function() {
  this.m_xf = new b2Transform;
  this.m_sweep = new b2Sweep;
  this.m_linearVelocity = new b2Vec2;
  this.m_force = new b2Vec2
};
b2Body.b2_staticBody = 0;
b2Body.b2_kinematicBody = 1;
b2Body.b2_dynamicBody = 2;
b2Body.s_xf1 = new b2Transform;
b2Body.e_islandFlag = 1;
b2Body.e_awakeFlag = 2;
b2Body.e_allowSleepFlag = 4;
b2Body.e_bulletFlag = 8;
b2Body.e_fixedRotationFlag = 16;
b2Body.e_activeFlag = 32;
b2Body.prototype.connectEdges = function(s1, s2, angle1) {
  var angle2 = Math.atan2(s2.GetDirectionVector().y, s2.GetDirectionVector().x);
  var coreOffset = Math.tan((angle2 - angle1) * 0.5);
  var core = b2Math.MulFV(coreOffset, s2.GetDirectionVector());
  core = b2Math.SubtractVV(core, s2.GetNormalVector());
  core = b2Math.MulFV(b2Settings.b2_toiSlop, core);
  core = b2Math.AddVV(core, s2.GetVertex1());
  var cornerDir = b2Math.AddVV(s1.GetDirectionVector(), s2.GetDirectionVector());
  cornerDir.Normalize();
  var convex = b2Math.Dot(s1.GetDirectionVector(), s2.GetNormalVector()) > 0;
  s1.SetNextEdge(s2, core, cornerDir, convex);
  s2.SetPrevEdge(s1, core, cornerDir, convex);
  return angle2
};
b2Body.prototype.SynchronizeFixtures = function() {
  var xf1 = b2Body.s_xf1;
  xf1.R.Set(this.m_sweep.a0);
  var tMat = xf1.R;
  var tVec = this.m_sweep.localCenter;
  xf1.position.x = this.m_sweep.c0.x - (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  xf1.position.y = this.m_sweep.c0.y - (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  var f;
  var broadPhase = this.m_world.m_contactManager.m_broadPhase;
  for(f = this.m_fixtureList;f;f = f.m_next) {
    f.Synchronize(broadPhase, xf1, this.m_xf)
  }
};
b2Body.prototype.SynchronizeTransform = function() {
  this.m_xf.R.Set(this.m_sweep.a);
  var tMat = this.m_xf.R;
  var tVec = this.m_sweep.localCenter;
  this.m_xf.position.x = this.m_sweep.c.x - (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  this.m_xf.position.y = this.m_sweep.c.y - (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y)
};
b2Body.prototype.ShouldCollide = function(other) {
  if(this.m_type != b2Body.b2_dynamicBody && other.m_type != b2Body.b2_dynamicBody) {
    return false
  }
  for(var jn = this.m_jointList;jn;jn = jn.next) {
    if(jn.other == other) {
      if(jn.joint.m_collideConnected == false) {
        return false
      }
    }
  }
  return true
};
b2Body.prototype.Advance = function(t) {
  this.m_sweep.Advance(t);
  this.m_sweep.c.SetV(this.m_sweep.c0);
  this.m_sweep.a = this.m_sweep.a0;
  this.SynchronizeTransform()
};
b2Body.prototype.CreateFixture = function(def) {
  if(this.m_world.IsLocked() == true) {
    return null
  }
  var fixture = new b2Fixture;
  fixture.Create(this, this.m_xf, def);
  if(this.m_flags & b2Body.e_activeFlag) {
    var broadPhase = this.m_world.m_contactManager.m_broadPhase;
    fixture.CreateProxy(broadPhase, this.m_xf)
  }
  fixture.m_next = this.m_fixtureList;
  this.m_fixtureList = fixture;
  ++this.m_fixtureCount;
  fixture.m_body = this;
  if(fixture.m_density > 0) {
    this.ResetMassData()
  }
  this.m_world.m_flags |= b2World.e_newFixture;
  return fixture
};
b2Body.prototype.CreateFixture2 = function(shape, density) {
  var def = new b2FixtureDef;
  def.shape = shape;
  def.density = density;
  return this.CreateFixture(def)
};
b2Body.prototype.DestroyFixture = function(fixture) {
  if(this.m_world.IsLocked() == true) {
    return
  }
  var node = this.m_fixtureList;
  var ppF = null;
  var found = false;
  while(node != null) {
    if(node == fixture) {
      if(ppF) {
        ppF.m_next = fixture.m_next
      }else {
        this.m_fixtureList = fixture.m_next
      }
      found = true;
      break
    }
    ppF = node;
    node = node.m_next
  }
  var edge = this.m_contactList;
  while(edge) {
    var c = edge.contact;
    edge = edge.next;
    var fixtureA = c.GetFixtureA();
    var fixtureB = c.GetFixtureB();
    if(fixture == fixtureA || fixture == fixtureB) {
      this.m_world.m_contactManager.Destroy(c)
    }
  }
  if(this.m_flags & b2Body.e_activeFlag) {
    var broadPhase = this.m_world.m_contactManager.m_broadPhase;
    fixture.DestroyProxy(broadPhase)
  }else {
  }
  fixture.Destroy();
  fixture.m_body = null;
  fixture.m_next = null;
  --this.m_fixtureCount;
  this.ResetMassData()
};
b2Body.prototype.SetPositionAndAngle = function(position, angle) {
  var f;
  if(this.m_world.IsLocked() == true) {
    return
  }
  this.m_xf.R.Set(angle);
  this.m_xf.position.SetV(position);
  var tMat = this.m_xf.R;
  var tVec = this.m_sweep.localCenter;
  this.m_sweep.c.x = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
  this.m_sweep.c.y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
  this.m_sweep.c.x += this.m_xf.position.x;
  this.m_sweep.c.y += this.m_xf.position.y;
  this.m_sweep.c0.SetV(this.m_sweep.c);
  this.m_sweep.a0 = this.m_sweep.a = angle;
  var broadPhase = this.m_world.m_contactManager.m_broadPhase;
  for(f = this.m_fixtureList;f;f = f.m_next) {
    f.Synchronize(broadPhase, this.m_xf, this.m_xf)
  }
  this.m_world.m_contactManager.FindNewContacts()
};
b2Body.prototype.SetTransform = function(xf) {
  this.SetPositionAndAngle(xf.position, xf.GetAngle())
};
b2Body.prototype.GetTransform = function() {
  return this.m_xf
};
b2Body.prototype.GetPosition = function() {
  return this.m_xf.position
};
b2Body.prototype.SetPosition = function(position) {
  this.SetPositionAndAngle(position, this.GetAngle())
};
b2Body.prototype.GetAngle = function() {
  return this.m_sweep.a
};
b2Body.prototype.SetAngle = function(angle) {
  this.SetPositionAndAngle(this.GetPosition(), angle)
};
b2Body.prototype.GetWorldCenter = function() {
  return this.m_sweep.c
};
b2Body.prototype.GetLocalCenter = function() {
  return this.m_sweep.localCenter
};
b2Body.prototype.SetLinearVelocity = function(v) {
  if(this.m_type == b2Body.b2_staticBody) {
    return
  }
  this.m_linearVelocity.SetV(v)
};
b2Body.prototype.GetLinearVelocity = function() {
  return this.m_linearVelocity
};
b2Body.prototype.SetAngularVelocity = function(omega) {
  if(this.m_type == b2Body.b2_staticBody) {
    return
  }
  this.m_angularVelocity = omega
};
b2Body.prototype.GetAngularVelocity = function() {
  return this.m_angularVelocity
};
b2Body.prototype.GetDefinition = function() {
  var bd = new b2BodyDef;
  bd.type = this.GetType();
  bd.allowSleep = (this.m_flags & b2Body.e_allowSleepFlag) == b2Body.e_allowSleepFlag;
  bd.angle = this.GetAngle();
  bd.angularDamping = this.m_angularDamping;
  bd.angularVelocity = this.m_angularVelocity;
  bd.fixedRotation = (this.m_flags & b2Body.e_fixedRotationFlag) == b2Body.e_fixedRotationFlag;
  bd.bullet = (this.m_flags & b2Body.e_bulletFlag) == b2Body.e_bulletFlag;
  bd.awake = (this.m_flags & b2Body.e_awakeFlag) == b2Body.e_awakeFlag;
  bd.linearDamping = this.m_linearDamping;
  bd.linearVelocity.SetV(this.GetLinearVelocity());
  bd.position = this.GetPosition();
  bd.userData = this.GetUserData();
  return bd
};
b2Body.prototype.ApplyForce = function(force, point) {
  if(this.m_type != b2Body.b2_dynamicBody) {
    return
  }
  if(this.IsAwake() == false) {
    this.SetAwake(true)
  }
  this.m_force.x += force.x;
  this.m_force.y += force.y;
  this.m_torque += (point.x - this.m_sweep.c.x) * force.y - (point.y - this.m_sweep.c.y) * force.x
};
b2Body.prototype.ApplyTorque = function(torque) {
  if(this.m_type != b2Body.b2_dynamicBody) {
    return
  }
  if(this.IsAwake() == false) {
    this.SetAwake(true)
  }
  this.m_torque += torque
};
b2Body.prototype.ApplyImpulse = function(impulse, point) {
  if(this.m_type != b2Body.b2_dynamicBody) {
    return
  }
  if(this.IsAwake() == false) {
    this.SetAwake(true)
  }
  this.m_linearVelocity.x += this.m_invMass * impulse.x;
  this.m_linearVelocity.y += this.m_invMass * impulse.y;
  this.m_angularVelocity += this.m_invI * ((point.x - this.m_sweep.c.x) * impulse.y - (point.y - this.m_sweep.c.y) * impulse.x)
};
b2Body.prototype.Split = function(callback) {
  var linearVelocity = this.GetLinearVelocity().Copy();
  var angularVelocity = this.GetAngularVelocity();
  var center = this.GetWorldCenter();
  var body1 = this;
  var body2 = this.m_world.CreateBody(this.GetDefinition());
  var prev;
  for(var f = body1.m_fixtureList;f;) {
    if(callback(f)) {
      var next = f.m_next;
      if(prev) {
        prev.m_next = next
      }else {
        body1.m_fixtureList = next
      }
      body1.m_fixtureCount--;
      f.m_next = body2.m_fixtureList;
      body2.m_fixtureList = f;
      body2.m_fixtureCount++;
      f.m_body = body2;
      f = next
    }else {
      prev = f;
      f = f.m_next
    }
  }
  body1.ResetMassData();
  body2.ResetMassData();
  var center1 = body1.GetWorldCenter();
  var center2 = body2.GetWorldCenter();
  var velocity1 = b2Math.AddVV(linearVelocity, b2Math.CrossFV(angularVelocity, b2Math.SubtractVV(center1, center)));
  var velocity2 = b2Math.AddVV(linearVelocity, b2Math.CrossFV(angularVelocity, b2Math.SubtractVV(center2, center)));
  body1.SetLinearVelocity(velocity1);
  body2.SetLinearVelocity(velocity2);
  body1.SetAngularVelocity(angularVelocity);
  body2.SetAngularVelocity(angularVelocity);
  body1.SynchronizeFixtures();
  body2.SynchronizeFixtures();
  return body2
};
b2Body.prototype.Merge = function(other) {
  var f;
  for(f = other.m_fixtureList;f;) {
    var next = f.m_next;
    other.m_fixtureCount--;
    f.m_next = this.m_fixtureList;
    this.m_fixtureList = f;
    this.m_fixtureCount++;
    f.m_body = body2;
    f = next
  }
  body1.m_fixtureCount = 0;
  var body1 = this;
  var body2 = other;
  var center1 = body1.GetWorldCenter();
  var center2 = body2.GetWorldCenter();
  var velocity1 = body1.GetLinearVelocity().Copy();
  var velocity2 = body2.GetLinearVelocity().Copy();
  var angular1 = body1.GetAngularVelocity();
  var angular = body2.GetAngularVelocity();
  body1.ResetMassData();
  this.SynchronizeFixtures()
};
b2Body.prototype.GetMass = function() {
  return this.m_mass
};
b2Body.prototype.GetInertia = function() {
  return this.m_I
};
b2Body.prototype.GetMassData = function(data) {
  data.mass = this.m_mass;
  data.I = this.m_I;
  data.center.SetV(this.m_sweep.localCenter)
};
b2Body.prototype.SetMassData = function(massData) {
  b2Settings.b2Assert(this.m_world.IsLocked() == false);
  if(this.m_world.IsLocked() == true) {
    return
  }
  if(this.m_type != b2Body.b2_dynamicBody) {
    return
  }
  this.m_invMass = 0;
  this.m_I = 0;
  this.m_invI = 0;
  this.m_mass = massData.mass;
  if(this.m_mass <= 0) {
    this.m_mass = 1
  }
  this.m_invMass = 1 / this.m_mass;
  if(massData.I > 0 && (this.m_flags & b2Body.e_fixedRotationFlag) == 0) {
    this.m_I = massData.I - this.m_mass * (massData.center.x * massData.center.x + massData.center.y * massData.center.y);
    this.m_invI = 1 / this.m_I
  }
  var oldCenter = this.m_sweep.c.Copy();
  this.m_sweep.localCenter.SetV(massData.center);
  this.m_sweep.c0.SetV(b2Math.MulX(this.m_xf, this.m_sweep.localCenter));
  this.m_sweep.c.SetV(this.m_sweep.c0);
  this.m_linearVelocity.x += this.m_angularVelocity * -(this.m_sweep.c.y - oldCenter.y);
  this.m_linearVelocity.y += this.m_angularVelocity * +(this.m_sweep.c.x - oldCenter.x)
};
b2Body.prototype.ResetMassData = function() {
  this.m_mass = 0;
  this.m_invMass = 0;
  this.m_I = 0;
  this.m_invI = 0;
  this.m_sweep.localCenter.SetZero();
  if(this.m_type == b2Body.b2_staticBody || this.m_type == b2Body.b2_kinematicBody) {
    return
  }
  var center = b2Vec2.Make(0, 0);
  for(var f = this.m_fixtureList;f;f = f.m_next) {
    if(f.m_density == 0) {
      continue
    }
    var massData = f.GetMassData();
    this.m_mass += massData.mass;
    center.x += massData.center.x * massData.mass;
    center.y += massData.center.y * massData.mass;
    this.m_I += massData.I
  }
  if(this.m_mass > 0) {
    this.m_invMass = 1 / this.m_mass;
    center.x *= this.m_invMass;
    center.y *= this.m_invMass
  }else {
    this.m_mass = 1;
    this.m_invMass = 1
  }
  if(this.m_I > 0 && (this.m_flags & b2Body.e_fixedRotationFlag) == 0) {
    this.m_I -= this.m_mass * (center.x * center.x + center.y * center.y);
    this.m_I *= this.m_inertiaScale;
    b2Settings.b2Assert(this.m_I > 0);
    this.m_invI = 1 / this.m_I
  }else {
    this.m_I = 0;
    this.m_invI = 0
  }
  var oldCenter = this.m_sweep.c.Copy();
  this.m_sweep.localCenter.SetV(center);
  this.m_sweep.c0.SetV(b2Math.MulX(this.m_xf, this.m_sweep.localCenter));
  this.m_sweep.c.SetV(this.m_sweep.c0);
  this.m_linearVelocity.x += this.m_angularVelocity * -(this.m_sweep.c.y - oldCenter.y);
  this.m_linearVelocity.y += this.m_angularVelocity * +(this.m_sweep.c.x - oldCenter.x)
};
b2Body.prototype.GetWorldPoint = function(localPoint) {
  var A = this.m_xf.R;
  var u = new b2Vec2(A.col1.x * localPoint.x + A.col2.x * localPoint.y, A.col1.y * localPoint.x + A.col2.y * localPoint.y);
  u.x += this.m_xf.position.x;
  u.y += this.m_xf.position.y;
  return u
};
b2Body.prototype.GetWorldVector = function(localVector) {
  return b2Math.MulMV(this.m_xf.R, localVector)
};
b2Body.prototype.GetLocalPoint = function(worldPoint) {
  return b2Math.MulXT(this.m_xf, worldPoint)
};
b2Body.prototype.GetLocalVector = function(worldVector) {
  return b2Math.MulTMV(this.m_xf.R, worldVector)
};
b2Body.prototype.GetLinearVelocityFromWorldPoint = function(worldPoint) {
  return new b2Vec2(this.m_linearVelocity.x - this.m_angularVelocity * (worldPoint.y - this.m_sweep.c.y), this.m_linearVelocity.y + this.m_angularVelocity * (worldPoint.x - this.m_sweep.c.x))
};
b2Body.prototype.GetLinearVelocityFromLocalPoint = function(localPoint) {
  var A = this.m_xf.R;
  var worldPoint = new b2Vec2(A.col1.x * localPoint.x + A.col2.x * localPoint.y, A.col1.y * localPoint.x + A.col2.y * localPoint.y);
  worldPoint.x += this.m_xf.position.x;
  worldPoint.y += this.m_xf.position.y;
  return new b2Vec2(this.m_linearVelocity.x - this.m_angularVelocity * (worldPoint.y - this.m_sweep.c.y), this.m_linearVelocity.y + this.m_angularVelocity * (worldPoint.x - this.m_sweep.c.x))
};
b2Body.prototype.GetLinearDamping = function() {
  return this.m_linearDamping
};
b2Body.prototype.SetLinearDamping = function(linearDamping) {
  this.m_linearDamping = linearDamping
};
b2Body.prototype.GetAngularDamping = function() {
  return this.m_angularDamping
};
b2Body.prototype.SetAngularDamping = function(angularDamping) {
  this.m_angularDamping = angularDamping
};
b2Body.prototype.SetType = function(type) {
  if(this.m_type == type) {
    return
  }
  this.m_type = type;
  this.ResetMassData();
  if(this.m_type == b2Body.b2_staticBody) {
    this.m_linearVelocity.SetZero();
    this.m_angularVelocity = 0
  }
  this.SetAwake(true);
  this.m_force.SetZero();
  this.m_torque = 0;
  for(var ce = this.m_contactList;ce;ce = ce.next) {
    ce.contact.FlagForFiltering()
  }
};
b2Body.prototype.GetType = function() {
  return this.m_type
};
b2Body.prototype.SetBullet = function(flag) {
  if(flag) {
    this.m_flags |= b2Body.e_bulletFlag
  }else {
    this.m_flags &= ~b2Body.e_bulletFlag
  }
};
b2Body.prototype.IsBullet = function() {
  return(this.m_flags & b2Body.e_bulletFlag) == b2Body.e_bulletFlag
};
b2Body.prototype.SetSleepingAllowed = function(flag) {
  if(flag) {
    this.m_flags |= b2Body.e_allowSleepFlag
  }else {
    this.m_flags &= ~b2Body.e_allowSleepFlag;
    this.SetAwake(true)
  }
};
b2Body.prototype.SetAwake = function(flag) {
  if(flag) {
    this.m_flags |= b2Body.e_awakeFlag;
    this.m_sleepTime = 0
  }else {
    this.m_flags &= ~b2Body.e_awakeFlag;
    this.m_sleepTime = 0;
    this.m_linearVelocity.SetZero();
    this.m_angularVelocity = 0;
    this.m_force.SetZero();
    this.m_torque = 0
  }
};
b2Body.prototype.IsAwake = function() {
  return(this.m_flags & b2Body.e_awakeFlag) == b2Body.e_awakeFlag
};
b2Body.prototype.SetFixedRotation = function(fixed) {
  if(fixed) {
    this.m_flags |= b2Body.e_fixedRotationFlag
  }else {
    this.m_flags &= ~b2Body.e_fixedRotationFlag
  }
  this.ResetMassData()
};
b2Body.prototype.IsFixedRotation = function() {
  return(this.m_flags & b2Body.e_fixedRotationFlag) == b2Body.e_fixedRotationFlag
};
b2Body.prototype.SetActive = function(flag) {
  if(flag == this.IsActive()) {
    return
  }
  var broadPhase;
  var f;
  if(flag) {
    this.m_flags |= b2Body.e_activeFlag;
    broadPhase = this.m_world.m_contactManager.m_broadPhase;
    for(f = this.m_fixtureList;f;f = f.m_next) {
      f.CreateProxy(broadPhase, this.m_xf)
    }
  }else {
    this.m_flags &= ~b2Body.e_activeFlag;
    broadPhase = this.m_world.m_contactManager.m_broadPhase;
    for(f = this.m_fixtureList;f;f = f.m_next) {
      f.DestroyProxy(broadPhase)
    }
    var ce = this.m_contactList;
    while(ce) {
      var ce0 = ce;
      ce = ce.next;
      this.m_world.m_contactManager.Destroy(ce0.contact)
    }
    this.m_contactList = null
  }
};
b2Body.prototype.IsActive = function() {
  return(this.m_flags & b2Body.e_activeFlag) == b2Body.e_activeFlag
};
b2Body.prototype.IsSleepingAllowed = function() {
  return(this.m_flags & b2Body.e_allowSleepFlag) == b2Body.e_allowSleepFlag
};
b2Body.prototype.GetFixtureList = function() {
  return this.m_fixtureList
};
b2Body.prototype.GetJointList = function() {
  return this.m_jointList
};
b2Body.prototype.GetControllerList = function() {
  return this.m_controllerList
};
b2Body.prototype.GetContactList = function() {
  return this.m_contactList
};
b2Body.prototype.GetNext = function() {
  return this.m_next
};
b2Body.prototype.GetUserData = function() {
  return this.m_userData
};
b2Body.prototype.SetUserData = function(data) {
  this.m_userData = data
};
b2Body.prototype.GetWorld = function() {
  return this.m_world
};
b2Body.prototype.m_flags = 0;
b2Body.prototype.m_type = 0;
b2Body.prototype.m_islandIndex = 0;
b2Body.prototype.m_xf = new b2Transform;
b2Body.prototype.m_sweep = new b2Sweep;
b2Body.prototype.m_linearVelocity = new b2Vec2;
b2Body.prototype.m_angularVelocity = null;
b2Body.prototype.m_force = new b2Vec2;
b2Body.prototype.m_torque = null;
b2Body.prototype.m_world = null;
b2Body.prototype.m_prev = null;
b2Body.prototype.m_next = null;
b2Body.prototype.m_fixtureList = null;
b2Body.prototype.m_fixtureCount = 0;
b2Body.prototype.m_controllerList = null;
b2Body.prototype.m_controllerCount = 0;
b2Body.prototype.m_jointList = null;
b2Body.prototype.m_contactList = null;
b2Body.prototype.m_mass = null;
b2Body.prototype.m_invMass = null;
b2Body.prototype.m_I = null;
b2Body.prototype.m_invI = null;
b2Body.prototype.m_inertiaScale = null;
b2Body.prototype.m_linearDamping = null;
b2Body.prototype.m_angularDamping = null;
b2Body.prototype.m_sleepTime = null;
b2Body.prototype.m_userData = null;var b2ContactImpulse = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactImpulse.prototype.__constructor = function() {
};
b2ContactImpulse.prototype.__varz = function() {
  this.normalImpulses = new Array(b2Settings.b2_maxManifoldPoints);
  this.tangentImpulses = new Array(b2Settings.b2_maxManifoldPoints)
};
b2ContactImpulse.prototype.normalImpulses = new Array(b2Settings.b2_maxManifoldPoints);
b2ContactImpulse.prototype.tangentImpulses = new Array(b2Settings.b2_maxManifoldPoints);var b2TensorDampingController = function() {
  b2Controller.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2TensorDampingController.prototype, b2Controller.prototype);
b2TensorDampingController.prototype._super = b2Controller.prototype;
b2TensorDampingController.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2TensorDampingController.prototype.__varz = function() {
  this.T = new b2Mat22
};
b2TensorDampingController.prototype.SetAxisAligned = function(xDamping, yDamping) {
  this.T.col1.x = -xDamping;
  this.T.col1.y = 0;
  this.T.col2.x = 0;
  this.T.col2.y = -yDamping;
  if(xDamping > 0 || yDamping > 0) {
    this.maxTimestep = 1 / Math.max(xDamping, yDamping)
  }else {
    this.maxTimestep = 0
  }
};
b2TensorDampingController.prototype.Step = function(step) {
  var timestep = step.dt;
  if(timestep <= Number.MIN_VALUE) {
    return
  }
  if(timestep > this.maxTimestep && this.maxTimestep > 0) {
    timestep = this.maxTimestep
  }
  for(var i = m_bodyList;i;i = i.nextBody) {
    var body = i.body;
    if(!body.IsAwake()) {
      continue
    }
    var damping = body.GetWorldVector(b2Math.MulMV(this.T, body.GetLocalVector(body.GetLinearVelocity())));
    body.SetLinearVelocity(new b2Vec2(body.GetLinearVelocity().x + damping.x * timestep, body.GetLinearVelocity().y + damping.y * timestep))
  }
};
b2TensorDampingController.prototype.T = new b2Mat22;
b2TensorDampingController.prototype.maxTimestep = 0;var b2ManifoldPoint = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ManifoldPoint.prototype.__constructor = function() {
  this.Reset()
};
b2ManifoldPoint.prototype.__varz = function() {
  this.m_localPoint = new b2Vec2;
  this.m_id = new b2ContactID
};
b2ManifoldPoint.prototype.Reset = function() {
  this.m_localPoint.SetZero();
  this.m_normalImpulse = 0;
  this.m_tangentImpulse = 0;
  this.m_id.key = 0
};
b2ManifoldPoint.prototype.Set = function(m) {
  this.m_localPoint.SetV(m.m_localPoint);
  this.m_normalImpulse = m.m_normalImpulse;
  this.m_tangentImpulse = m.m_tangentImpulse;
  this.m_id.Set(m.m_id)
};
b2ManifoldPoint.prototype.m_localPoint = new b2Vec2;
b2ManifoldPoint.prototype.m_normalImpulse = null;
b2ManifoldPoint.prototype.m_tangentImpulse = null;
b2ManifoldPoint.prototype.m_id = new b2ContactID;var b2PolygonShape = function() {
  b2Shape.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2PolygonShape.prototype, b2Shape.prototype);
b2PolygonShape.prototype._super = b2Shape.prototype;
b2PolygonShape.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.m_type = b2Shape.e_polygonShape;
  this.m_centroid = new b2Vec2;
  this.m_vertices = new Array;
  this.m_normals = new Array
};
b2PolygonShape.prototype.__varz = function() {
};
b2PolygonShape.AsArray = function(vertices, vertexCount) {
  var polygonShape = new b2PolygonShape;
  polygonShape.SetAsArray(vertices, vertexCount);
  return polygonShape
};
b2PolygonShape.AsVector = function(vertices, vertexCount) {
  var polygonShape = new b2PolygonShape;
  polygonShape.SetAsVector(vertices, vertexCount);
  return polygonShape
};
b2PolygonShape.AsBox = function(hx, hy) {
  var polygonShape = new b2PolygonShape;
  polygonShape.SetAsBox(hx, hy);
  return polygonShape
};
b2PolygonShape.AsOrientedBox = function(hx, hy, center, angle) {
  var polygonShape = new b2PolygonShape;
  polygonShape.SetAsOrientedBox(hx, hy, center, angle);
  return polygonShape
};
b2PolygonShape.AsEdge = function(v1, v2) {
  var polygonShape = new b2PolygonShape;
  polygonShape.SetAsEdge(v1, v2);
  return polygonShape
};
b2PolygonShape.ComputeCentroid = function(vs, count) {
  var c = new b2Vec2;
  var area = 0;
  var p1X = 0;
  var p1Y = 0;
  var inv3 = 1 / 3;
  for(var i = 0;i < count;++i) {
    var p2 = vs[i];
    var p3 = i + 1 < count ? vs[parseInt(i + 1)] : vs[0];
    var e1X = p2.x - p1X;
    var e1Y = p2.y - p1Y;
    var e2X = p3.x - p1X;
    var e2Y = p3.y - p1Y;
    var D = e1X * e2Y - e1Y * e2X;
    var triangleArea = 0.5 * D;
    area += triangleArea;
    c.x += triangleArea * inv3 * (p1X + p2.x + p3.x);
    c.y += triangleArea * inv3 * (p1Y + p2.y + p3.y)
  }
  c.x *= 1 / area;
  c.y *= 1 / area;
  return c
};
b2PolygonShape.ComputeOBB = function(obb, vs, count) {
  var i = 0;
  var p = new Array(count + 1);
  for(i = 0;i < count;++i) {
    p[i] = vs[i]
  }
  p[count] = p[0];
  var minArea = Number.MAX_VALUE;
  for(i = 1;i <= count;++i) {
    var root = p[parseInt(i - 1)];
    var uxX = p[i].x - root.x;
    var uxY = p[i].y - root.y;
    var length = Math.sqrt(uxX * uxX + uxY * uxY);
    uxX /= length;
    uxY /= length;
    var uyX = -uxY;
    var uyY = uxX;
    var lowerX = Number.MAX_VALUE;
    var lowerY = Number.MAX_VALUE;
    var upperX = -Number.MAX_VALUE;
    var upperY = -Number.MAX_VALUE;
    for(var j = 0;j < count;++j) {
      var dX = p[j].x - root.x;
      var dY = p[j].y - root.y;
      var rX = uxX * dX + uxY * dY;
      var rY = uyX * dX + uyY * dY;
      if(rX < lowerX) {
        lowerX = rX
      }
      if(rY < lowerY) {
        lowerY = rY
      }
      if(rX > upperX) {
        upperX = rX
      }
      if(rY > upperY) {
        upperY = rY
      }
    }
    var area = (upperX - lowerX) * (upperY - lowerY);
    if(area < 0.95 * minArea) {
      minArea = area;
      obb.R.col1.x = uxX;
      obb.R.col1.y = uxY;
      obb.R.col2.x = uyX;
      obb.R.col2.y = uyY;
      var centerX = 0.5 * (lowerX + upperX);
      var centerY = 0.5 * (lowerY + upperY);
      var tMat = obb.R;
      obb.center.x = root.x + (tMat.col1.x * centerX + tMat.col2.x * centerY);
      obb.center.y = root.y + (tMat.col1.y * centerX + tMat.col2.y * centerY);
      obb.extents.x = 0.5 * (upperX - lowerX);
      obb.extents.y = 0.5 * (upperY - lowerY)
    }
  }
};
b2PolygonShape.s_mat = new b2Mat22;
b2PolygonShape.prototype.Validate = function() {
  return false
};
b2PolygonShape.prototype.Reserve = function(count) {
  for(var i = this.m_vertices.length;i < count;i++) {
    this.m_vertices[i] = new b2Vec2;
    this.m_normals[i] = new b2Vec2
  }
};
b2PolygonShape.prototype.Copy = function() {
  var s = new b2PolygonShape;
  s.Set(this);
  return s
};
b2PolygonShape.prototype.Set = function(other) {
  this._super.Set.apply(this, [other]);
  if(isInstanceOf(other, b2PolygonShape)) {
    var other2 = other;
    this.m_centroid.SetV(other2.m_centroid);
    this.m_vertexCount = other2.m_vertexCount;
    this.Reserve(this.m_vertexCount);
    for(var i = 0;i < this.m_vertexCount;i++) {
      this.m_vertices[i].SetV(other2.m_vertices[i]);
      this.m_normals[i].SetV(other2.m_normals[i])
    }
  }
};
b2PolygonShape.prototype.SetAsArray = function(vertices, vertexCount) {
  var v = new Array;
  for(var i = 0, tVec = null;i < vertices.length, tVec = vertices[i];i++) {
    v.push(tVec)
  }
  this.SetAsVector(v, vertexCount)
};
b2PolygonShape.prototype.SetAsVector = function(vertices, vertexCount) {
  if(typeof vertexCount == "undefined") {
    vertexCount = vertices.length
  }
  b2Settings.b2Assert(2 <= vertexCount);
  this.m_vertexCount = vertexCount;
  this.Reserve(vertexCount);
  var i = 0;
  for(i = 0;i < this.m_vertexCount;i++) {
    this.m_vertices[i].SetV(vertices[i])
  }
  for(i = 0;i < this.m_vertexCount;++i) {
    var i1 = i;
    var i2 = i + 1 < this.m_vertexCount ? i + 1 : 0;
    var edge = b2Math.SubtractVV(this.m_vertices[i2], this.m_vertices[i1]);
    b2Settings.b2Assert(edge.LengthSquared() > Number.MIN_VALUE);
    this.m_normals[i].SetV(b2Math.CrossVF(edge, 1));
    this.m_normals[i].Normalize()
  }
  this.m_centroid = b2PolygonShape.ComputeCentroid(this.m_vertices, this.m_vertexCount)
};
b2PolygonShape.prototype.SetAsBox = function(hx, hy) {
  this.m_vertexCount = 4;
  this.Reserve(4);
  this.m_vertices[0].Set(-hx, -hy);
  this.m_vertices[1].Set(hx, -hy);
  this.m_vertices[2].Set(hx, hy);
  this.m_vertices[3].Set(-hx, hy);
  this.m_normals[0].Set(0, -1);
  this.m_normals[1].Set(1, 0);
  this.m_normals[2].Set(0, 1);
  this.m_normals[3].Set(-1, 0);
  this.m_centroid.SetZero()
};
b2PolygonShape.prototype.SetAsOrientedBox = function(hx, hy, center, angle) {
  this.m_vertexCount = 4;
  this.Reserve(4);
  this.m_vertices[0].Set(-hx, -hy);
  this.m_vertices[1].Set(hx, -hy);
  this.m_vertices[2].Set(hx, hy);
  this.m_vertices[3].Set(-hx, hy);
  this.m_normals[0].Set(0, -1);
  this.m_normals[1].Set(1, 0);
  this.m_normals[2].Set(0, 1);
  this.m_normals[3].Set(-1, 0);
  this.m_centroid = center;
  var xf = new b2Transform;
  xf.position = center;
  xf.R.Set(angle);
  for(var i = 0;i < this.m_vertexCount;++i) {
    this.m_vertices[i] = b2Math.MulX(xf, this.m_vertices[i]);
    this.m_normals[i] = b2Math.MulMV(xf.R, this.m_normals[i])
  }
};
b2PolygonShape.prototype.SetAsEdge = function(v1, v2) {
  this.m_vertexCount = 2;
  this.Reserve(2);
  this.m_vertices[0].SetV(v1);
  this.m_vertices[1].SetV(v2);
  this.m_centroid.x = 0.5 * (v1.x + v2.x);
  this.m_centroid.y = 0.5 * (v1.y + v2.y);
  this.m_normals[0] = b2Math.CrossVF(b2Math.SubtractVV(v2, v1), 1);
  this.m_normals[0].Normalize();
  this.m_normals[1].x = -this.m_normals[0].x;
  this.m_normals[1].y = -this.m_normals[0].y
};
b2PolygonShape.prototype.TestPoint = function(xf, p) {
  var tVec;
  var tMat = xf.R;
  var tX = p.x - xf.position.x;
  var tY = p.y - xf.position.y;
  var pLocalX = tX * tMat.col1.x + tY * tMat.col1.y;
  var pLocalY = tX * tMat.col2.x + tY * tMat.col2.y;
  for(var i = 0;i < this.m_vertexCount;++i) {
    tVec = this.m_vertices[i];
    tX = pLocalX - tVec.x;
    tY = pLocalY - tVec.y;
    tVec = this.m_normals[i];
    var dot = tVec.x * tX + tVec.y * tY;
    if(dot > 0) {
      return false
    }
  }
  return true
};
b2PolygonShape.prototype.RayCast = function(output, input, transform) {
  var lower = 0;
  var upper = input.maxFraction;
  var tX;
  var tY;
  var tMat;
  var tVec;
  tX = input.p1.x - transform.position.x;
  tY = input.p1.y - transform.position.y;
  tMat = transform.R;
  var p1X = tX * tMat.col1.x + tY * tMat.col1.y;
  var p1Y = tX * tMat.col2.x + tY * tMat.col2.y;
  tX = input.p2.x - transform.position.x;
  tY = input.p2.y - transform.position.y;
  tMat = transform.R;
  var p2X = tX * tMat.col1.x + tY * tMat.col1.y;
  var p2Y = tX * tMat.col2.x + tY * tMat.col2.y;
  var dX = p2X - p1X;
  var dY = p2Y - p1Y;
  var index = -1;
  for(var i = 0;i < this.m_vertexCount;++i) {
    tVec = this.m_vertices[i];
    tX = tVec.x - p1X;
    tY = tVec.y - p1Y;
    tVec = this.m_normals[i];
    var numerator = tVec.x * tX + tVec.y * tY;
    var denominator = tVec.x * dX + tVec.y * dY;
    if(denominator == 0) {
      if(numerator < 0) {
        return false
      }
    }else {
      if(denominator < 0 && numerator < lower * denominator) {
        lower = numerator / denominator;
        index = i
      }else {
        if(denominator > 0 && numerator < upper * denominator) {
          upper = numerator / denominator
        }
      }
    }
    if(upper < lower - Number.MIN_VALUE) {
      return false
    }
  }
  if(index >= 0) {
    output.fraction = lower;
    tMat = transform.R;
    tVec = this.m_normals[index];
    output.normal.x = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
    output.normal.y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
    return true
  }
  return false
};
b2PolygonShape.prototype.ComputeAABB = function(aabb, xf) {
  var tMat = xf.R;
  var tVec = this.m_vertices[0];
  var lowerX = xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  var lowerY = xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  var upperX = lowerX;
  var upperY = lowerY;
  for(var i = 1;i < this.m_vertexCount;++i) {
    tVec = this.m_vertices[i];
    var vX = xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    var vY = xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
    lowerX = lowerX < vX ? lowerX : vX;
    lowerY = lowerY < vY ? lowerY : vY;
    upperX = upperX > vX ? upperX : vX;
    upperY = upperY > vY ? upperY : vY
  }
  aabb.lowerBound.x = lowerX - this.m_radius;
  aabb.lowerBound.y = lowerY - this.m_radius;
  aabb.upperBound.x = upperX + this.m_radius;
  aabb.upperBound.y = upperY + this.m_radius
};
b2PolygonShape.prototype.ComputeMass = function(massData, density) {
  if(this.m_vertexCount == 2) {
    massData.center.x = 0.5 * (this.m_vertices[0].x + this.m_vertices[1].x);
    massData.center.y = 0.5 * (this.m_vertices[0].y + this.m_vertices[1].y);
    massData.mass = 0;
    massData.I = 0;
    return
  }
  var centerX = 0;
  var centerY = 0;
  var area = 0;
  var I = 0;
  var p1X = 0;
  var p1Y = 0;
  var k_inv3 = 1 / 3;
  for(var i = 0;i < this.m_vertexCount;++i) {
    var p2 = this.m_vertices[i];
    var p3 = i + 1 < this.m_vertexCount ? this.m_vertices[parseInt(i + 1)] : this.m_vertices[0];
    var e1X = p2.x - p1X;
    var e1Y = p2.y - p1Y;
    var e2X = p3.x - p1X;
    var e2Y = p3.y - p1Y;
    var D = e1X * e2Y - e1Y * e2X;
    var triangleArea = 0.5 * D;
    area += triangleArea;
    centerX += triangleArea * k_inv3 * (p1X + p2.x + p3.x);
    centerY += triangleArea * k_inv3 * (p1Y + p2.y + p3.y);
    var px = p1X;
    var py = p1Y;
    var ex1 = e1X;
    var ey1 = e1Y;
    var ex2 = e2X;
    var ey2 = e2Y;
    var intx2 = k_inv3 * (0.25 * (ex1 * ex1 + ex2 * ex1 + ex2 * ex2) + (px * ex1 + px * ex2)) + 0.5 * px * px;
    var inty2 = k_inv3 * (0.25 * (ey1 * ey1 + ey2 * ey1 + ey2 * ey2) + (py * ey1 + py * ey2)) + 0.5 * py * py;
    I += D * (intx2 + inty2)
  }
  massData.mass = density * area;
  centerX *= 1 / area;
  centerY *= 1 / area;
  massData.center.Set(centerX, centerY);
  massData.I = density * I
};
b2PolygonShape.prototype.ComputeSubmergedArea = function(normal, offset, xf, c) {
  var normalL = b2Math.MulTMV(xf.R, normal);
  var offsetL = offset - b2Math.Dot(normal, xf.position);
  var depths = new Array;
  var diveCount = 0;
  var intoIndex = -1;
  var outoIndex = -1;
  var lastSubmerged = false;
  var i = 0;
  for(i = 0;i < this.m_vertexCount;++i) {
    depths[i] = b2Math.Dot(normalL, this.m_vertices[i]) - offsetL;
    var isSubmerged = depths[i] < -Number.MIN_VALUE;
    if(i > 0) {
      if(isSubmerged) {
        if(!lastSubmerged) {
          intoIndex = i - 1;
          diveCount++
        }
      }else {
        if(lastSubmerged) {
          outoIndex = i - 1;
          diveCount++
        }
      }
    }
    lastSubmerged = isSubmerged
  }
  switch(diveCount) {
    case 0:
      if(lastSubmerged) {
        var md = new b2MassData;
        this.ComputeMass(md, 1);
        c.SetV(b2Math.MulX(xf, md.center));
        return md.mass
      }else {
        return 0
      }
      break;
    case 1:
      if(intoIndex == -1) {
        intoIndex = this.m_vertexCount - 1
      }else {
        outoIndex = this.m_vertexCount - 1
      }
      break
  }
  var intoIndex2 = (intoIndex + 1) % this.m_vertexCount;
  var outoIndex2 = (outoIndex + 1) % this.m_vertexCount;
  var intoLamdda = (0 - depths[intoIndex]) / (depths[intoIndex2] - depths[intoIndex]);
  var outoLamdda = (0 - depths[outoIndex]) / (depths[outoIndex2] - depths[outoIndex]);
  var intoVec = new b2Vec2(this.m_vertices[intoIndex].x * (1 - intoLamdda) + this.m_vertices[intoIndex2].x * intoLamdda, this.m_vertices[intoIndex].y * (1 - intoLamdda) + this.m_vertices[intoIndex2].y * intoLamdda);
  var outoVec = new b2Vec2(this.m_vertices[outoIndex].x * (1 - outoLamdda) + this.m_vertices[outoIndex2].x * outoLamdda, this.m_vertices[outoIndex].y * (1 - outoLamdda) + this.m_vertices[outoIndex2].y * outoLamdda);
  var area = 0;
  var center = new b2Vec2;
  var p2 = this.m_vertices[intoIndex2];
  var p3;
  i = intoIndex2;
  while(i != outoIndex2) {
    i = (i + 1) % this.m_vertexCount;
    if(i == outoIndex2) {
      p3 = outoVec
    }else {
      p3 = this.m_vertices[i]
    }
    var triangleArea = 0.5 * ((p2.x - intoVec.x) * (p3.y - intoVec.y) - (p2.y - intoVec.y) * (p3.x - intoVec.x));
    area += triangleArea;
    center.x += triangleArea * (intoVec.x + p2.x + p3.x) / 3;
    center.y += triangleArea * (intoVec.y + p2.y + p3.y) / 3;
    p2 = p3
  }
  center.Multiply(1 / area);
  c.SetV(b2Math.MulX(xf, center));
  return area
};
b2PolygonShape.prototype.GetVertexCount = function() {
  return this.m_vertexCount
};
b2PolygonShape.prototype.GetVertices = function() {
  return this.m_vertices
};
b2PolygonShape.prototype.GetNormals = function() {
  return this.m_normals
};
b2PolygonShape.prototype.GetSupport = function(d) {
  var bestIndex = 0;
  var bestValue = this.m_vertices[0].x * d.x + this.m_vertices[0].y * d.y;
  for(var i = 1;i < this.m_vertexCount;++i) {
    var value = this.m_vertices[i].x * d.x + this.m_vertices[i].y * d.y;
    if(value > bestValue) {
      bestIndex = i;
      bestValue = value
    }
  }
  return bestIndex
};
b2PolygonShape.prototype.GetSupportVertex = function(d) {
  var bestIndex = 0;
  var bestValue = this.m_vertices[0].x * d.x + this.m_vertices[0].y * d.y;
  for(var i = 1;i < this.m_vertexCount;++i) {
    var value = this.m_vertices[i].x * d.x + this.m_vertices[i].y * d.y;
    if(value > bestValue) {
      bestIndex = i;
      bestValue = value
    }
  }
  return this.m_vertices[bestIndex]
};
b2PolygonShape.prototype.m_centroid = null;
b2PolygonShape.prototype.m_vertices = null;
b2PolygonShape.prototype.m_normals = null;
b2PolygonShape.prototype.m_vertexCount = 0;var b2Fixture = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Fixture.prototype.__constructor = function() {
  this.m_aabb = new b2AABB;
  this.m_userData = null;
  this.m_body = null;
  this.m_next = null;
  this.m_shape = null;
  this.m_density = 0;
  this.m_friction = 0;
  this.m_restitution = 0
};
b2Fixture.prototype.__varz = function() {
  this.m_filter = new b2FilterData
};
b2Fixture.prototype.Create = function(body, xf, def) {
  this.m_userData = def.userData;
  this.m_friction = def.friction;
  this.m_restitution = def.restitution;
  this.m_body = body;
  this.m_next = null;
  this.m_filter = def.filter.Copy();
  this.m_isSensor = def.isSensor;
  this.m_shape = def.shape.Copy();
  this.m_density = def.density
};
b2Fixture.prototype.Destroy = function() {
  this.m_shape = null
};
b2Fixture.prototype.CreateProxy = function(broadPhase, xf) {
  this.m_shape.ComputeAABB(this.m_aabb, xf);
  this.m_proxy = broadPhase.CreateProxy(this.m_aabb, this)
};
b2Fixture.prototype.DestroyProxy = function(broadPhase) {
  if(this.m_proxy == null) {
    return
  }
  broadPhase.DestroyProxy(this.m_proxy);
  this.m_proxy = null
};
b2Fixture.prototype.Synchronize = function(broadPhase, transform1, transform2) {
  if(!this.m_proxy) {
    return
  }
  var aabb1 = new b2AABB;
  var aabb2 = new b2AABB;
  this.m_shape.ComputeAABB(aabb1, transform1);
  this.m_shape.ComputeAABB(aabb2, transform2);
  this.m_aabb.Combine(aabb1, aabb2);
  var displacement = b2Math.SubtractVV(transform2.position, transform1.position);
  broadPhase.MoveProxy(this.m_proxy, this.m_aabb, displacement)
};
b2Fixture.prototype.GetType = function() {
  return this.m_shape.GetType()
};
b2Fixture.prototype.GetShape = function() {
  return this.m_shape
};
b2Fixture.prototype.SetSensor = function(sensor) {
  if(this.m_isSensor == sensor) {
    return
  }
  this.m_isSensor = sensor;
  if(this.m_body == null) {
    return
  }
  var edge = this.m_body.GetContactList();
  while(edge) {
    var contact = edge.contact;
    var fixtureA = contact.GetFixtureA();
    var fixtureB = contact.GetFixtureB();
    if(fixtureA == this || fixtureB == this) {
      contact.SetSensor(fixtureA.IsSensor() || fixtureB.IsSensor())
    }
    edge = edge.next
  }
};
b2Fixture.prototype.IsSensor = function() {
  return this.m_isSensor
};
b2Fixture.prototype.SetFilterData = function(filter) {
  this.m_filter = filter.Copy();
  if(this.m_body) {
    return
  }
  var edge = this.m_body.GetContactList();
  while(edge) {
    var contact = edge.contact;
    var fixtureA = contact.GetFixtureA();
    var fixtureB = contact.GetFixtureB();
    if(fixtureA == this || fixtureB == this) {
      contact.FlagForFiltering()
    }
    edge = edge.next
  }
};
b2Fixture.prototype.GetFilterData = function() {
  return this.m_filter.Copy()
};
b2Fixture.prototype.GetBody = function() {
  return this.m_body
};
b2Fixture.prototype.GetNext = function() {
  return this.m_next
};
b2Fixture.prototype.GetUserData = function() {
  return this.m_userData
};
b2Fixture.prototype.SetUserData = function(data) {
  this.m_userData = data
};
b2Fixture.prototype.TestPoint = function(p) {
  return this.m_shape.TestPoint(this.m_body.GetTransform(), p)
};
b2Fixture.prototype.RayCast = function(output, input) {
  return this.m_shape.RayCast(output, input, this.m_body.GetTransform())
};
b2Fixture.prototype.GetMassData = function(massData) {
  if(massData == null) {
    massData = new b2MassData
  }
  this.m_shape.ComputeMass(massData, this.m_density);
  return massData
};
b2Fixture.prototype.SetDensity = function(density) {
  this.m_density = density
};
b2Fixture.prototype.GetDensity = function() {
  return this.m_density
};
b2Fixture.prototype.GetFriction = function() {
  return this.m_friction
};
b2Fixture.prototype.SetFriction = function(friction) {
  this.m_friction = friction
};
b2Fixture.prototype.GetRestitution = function() {
  return this.m_restitution
};
b2Fixture.prototype.SetRestitution = function(restitution) {
  this.m_restitution = restitution
};
b2Fixture.prototype.GetAABB = function() {
  return this.m_aabb
};
b2Fixture.prototype.m_massData = null;
b2Fixture.prototype.m_aabb = null;
b2Fixture.prototype.m_density = null;
b2Fixture.prototype.m_next = null;
b2Fixture.prototype.m_body = null;
b2Fixture.prototype.m_shape = null;
b2Fixture.prototype.m_friction = null;
b2Fixture.prototype.m_restitution = null;
b2Fixture.prototype.m_proxy = null;
b2Fixture.prototype.m_filter = new b2FilterData;
b2Fixture.prototype.m_isSensor = null;
b2Fixture.prototype.m_userData = null;var b2DynamicTreeNode = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2DynamicTreeNode.prototype.__constructor = function() {
};
b2DynamicTreeNode.prototype.__varz = function() {
  this.aabb = new b2AABB
};
b2DynamicTreeNode.prototype.IsLeaf = function() {
  return this.child1 == null
};
b2DynamicTreeNode.prototype.userData = null;
b2DynamicTreeNode.prototype.aabb = new b2AABB;
b2DynamicTreeNode.prototype.parent = null;
b2DynamicTreeNode.prototype.child1 = null;
b2DynamicTreeNode.prototype.child2 = null;var b2BodyDef = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2BodyDef.prototype.__constructor = function() {
  this.userData = null;
  this.position.Set(0, 0);
  this.angle = 0;
  this.linearVelocity.Set(0, 0);
  this.angularVelocity = 0;
  this.linearDamping = 0;
  this.angularDamping = 0;
  this.allowSleep = true;
  this.awake = true;
  this.fixedRotation = false;
  this.bullet = false;
  this.type = b2Body.b2_staticBody;
  this.active = true;
  this.inertiaScale = 1
};
b2BodyDef.prototype.__varz = function() {
  this.position = new b2Vec2;
  this.linearVelocity = new b2Vec2
};
b2BodyDef.prototype.type = 0;
b2BodyDef.prototype.position = new b2Vec2;
b2BodyDef.prototype.angle = null;
b2BodyDef.prototype.linearVelocity = new b2Vec2;
b2BodyDef.prototype.angularVelocity = null;
b2BodyDef.prototype.linearDamping = null;
b2BodyDef.prototype.angularDamping = null;
b2BodyDef.prototype.allowSleep = null;
b2BodyDef.prototype.awake = null;
b2BodyDef.prototype.fixedRotation = null;
b2BodyDef.prototype.bullet = null;
b2BodyDef.prototype.active = null;
b2BodyDef.prototype.userData = null;
b2BodyDef.prototype.inertiaScale = null;var b2DynamicTreeBroadPhase = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2DynamicTreeBroadPhase.prototype.__constructor = function() {
};
b2DynamicTreeBroadPhase.prototype.__varz = function() {
  this.m_tree = new b2DynamicTree;
  this.m_moveBuffer = new Array;
  this.m_pairBuffer = new Array
};
b2DynamicTreeBroadPhase.prototype.BufferMove = function(proxy) {
  this.m_moveBuffer[this.m_moveBuffer.length] = proxy
};
b2DynamicTreeBroadPhase.prototype.UnBufferMove = function(proxy) {
  var i = this.m_moveBuffer.indexOf(proxy);
  this.m_moveBuffer.splice(i, 1)
};
b2DynamicTreeBroadPhase.prototype.ComparePairs = function(pair1, pair2) {
  return 0
};
b2DynamicTreeBroadPhase.prototype.CreateProxy = function(aabb, userData) {
  var proxy = this.m_tree.CreateProxy(aabb, userData);
  ++this.m_proxyCount;
  this.BufferMove(proxy);
  return proxy
};
b2DynamicTreeBroadPhase.prototype.DestroyProxy = function(proxy) {
  this.UnBufferMove(proxy);
  --this.m_proxyCount;
  this.m_tree.DestroyProxy(proxy)
};
b2DynamicTreeBroadPhase.prototype.MoveProxy = function(proxy, aabb, displacement) {
  var buffer = this.m_tree.MoveProxy(proxy, aabb, displacement);
  if(buffer) {
    this.BufferMove(proxy)
  }
};
b2DynamicTreeBroadPhase.prototype.TestOverlap = function(proxyA, proxyB) {
  var aabbA = this.m_tree.GetFatAABB(proxyA);
  var aabbB = this.m_tree.GetFatAABB(proxyB);
  return aabbA.TestOverlap(aabbB)
};
b2DynamicTreeBroadPhase.prototype.GetUserData = function(proxy) {
  return this.m_tree.GetUserData(proxy)
};
b2DynamicTreeBroadPhase.prototype.GetFatAABB = function(proxy) {
  return this.m_tree.GetFatAABB(proxy)
};
b2DynamicTreeBroadPhase.prototype.GetProxyCount = function() {
  return this.m_proxyCount
};
b2DynamicTreeBroadPhase.prototype.UpdatePairs = function(callback) {
  this.m_pairCount = 0;
  for(var i = 0, queryProxy = null;i < this.m_moveBuffer.length, queryProxy = this.m_moveBuffer[i];i++) {
    var that = this;
    function QueryCallback(proxy) {
      if(proxy == queryProxy) {
        return true
      }
      if(that.m_pairCount == that.m_pairBuffer.length) {
        that.m_pairBuffer[that.m_pairCount] = new b2DynamicTreePair
      }
      var pair = that.m_pairBuffer[that.m_pairCount];
      pair.proxyA = proxy < queryProxy ? proxy : queryProxy;
      pair.proxyB = proxy >= queryProxy ? proxy : queryProxy;
      ++that.m_pairCount;
      return true
    }
    var fatAABB = this.m_tree.GetFatAABB(queryProxy);
    this.m_tree.Query(QueryCallback, fatAABB)
  }
  this.m_moveBuffer.length = 0;
  for(var i = 0;i < this.m_pairCount;) {
    var primaryPair = this.m_pairBuffer[i];
    var userDataA = this.m_tree.GetUserData(primaryPair.proxyA);
    var userDataB = this.m_tree.GetUserData(primaryPair.proxyB);
    callback(userDataA, userDataB);
    ++i;
    while(i < this.m_pairCount) {
      var pair = this.m_pairBuffer[i];
      if(pair.proxyA != primaryPair.proxyA || pair.proxyB != primaryPair.proxyB) {
        break
      }
      ++i
    }
  }
};
b2DynamicTreeBroadPhase.prototype.Query = function(callback, aabb) {
  this.m_tree.Query(callback, aabb)
};
b2DynamicTreeBroadPhase.prototype.RayCast = function(callback, input) {
  this.m_tree.RayCast(callback, input)
};
b2DynamicTreeBroadPhase.prototype.Validate = function() {
};
b2DynamicTreeBroadPhase.prototype.Rebalance = function(iterations) {
  this.m_tree.Rebalance(iterations)
};
b2DynamicTreeBroadPhase.prototype.m_tree = new b2DynamicTree;
b2DynamicTreeBroadPhase.prototype.m_proxyCount = 0;
b2DynamicTreeBroadPhase.prototype.m_moveBuffer = new Array;
b2DynamicTreeBroadPhase.prototype.m_pairBuffer = new Array;
b2DynamicTreeBroadPhase.prototype.m_pairCount = 0;var b2BroadPhase = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2BroadPhase.prototype.__constructor = function(worldAABB) {
  var i = 0;
  this.m_pairManager.Initialize(this);
  this.m_worldAABB = worldAABB;
  this.m_proxyCount = 0;
  this.m_bounds = new Array;
  for(i = 0;i < 2;i++) {
    this.m_bounds[i] = new Array
  }
  var dX = worldAABB.upperBound.x - worldAABB.lowerBound.x;
  var dY = worldAABB.upperBound.y - worldAABB.lowerBound.y;
  this.m_quantizationFactor.x = b2Settings.USHRT_MAX / dX;
  this.m_quantizationFactor.y = b2Settings.USHRT_MAX / dY;
  this.m_timeStamp = 1;
  this.m_queryResultCount = 0
};
b2BroadPhase.prototype.__varz = function() {
  this.m_pairManager = new b2PairManager;
  this.m_proxyPool = new Array;
  this.m_querySortKeys = new Array;
  this.m_queryResults = new Array;
  this.m_quantizationFactor = new b2Vec2
};
b2BroadPhase.BinarySearch = function(bounds, count, value) {
  var low = 0;
  var high = count - 1;
  while(low <= high) {
    var mid = Math.round((low + high) / 2);
    var bound = bounds[mid];
    if(bound.value > value) {
      high = mid - 1
    }else {
      if(bound.value < value) {
        low = mid + 1
      }else {
        return parseInt(mid)
      }
    }
  }
  return parseInt(low)
};
b2BroadPhase.s_validate = false;
b2BroadPhase.b2_invalid = b2Settings.USHRT_MAX;
b2BroadPhase.b2_nullEdge = b2Settings.USHRT_MAX;
b2BroadPhase.prototype.ComputeBounds = function(lowerValues, upperValues, aabb) {
  var minVertexX = aabb.lowerBound.x;
  var minVertexY = aabb.lowerBound.y;
  minVertexX = b2Math.Min(minVertexX, this.m_worldAABB.upperBound.x);
  minVertexY = b2Math.Min(minVertexY, this.m_worldAABB.upperBound.y);
  minVertexX = b2Math.Max(minVertexX, this.m_worldAABB.lowerBound.x);
  minVertexY = b2Math.Max(minVertexY, this.m_worldAABB.lowerBound.y);
  var maxVertexX = aabb.upperBound.x;
  var maxVertexY = aabb.upperBound.y;
  maxVertexX = b2Math.Min(maxVertexX, this.m_worldAABB.upperBound.x);
  maxVertexY = b2Math.Min(maxVertexY, this.m_worldAABB.upperBound.y);
  maxVertexX = b2Math.Max(maxVertexX, this.m_worldAABB.lowerBound.x);
  maxVertexY = b2Math.Max(maxVertexY, this.m_worldAABB.lowerBound.y);
  lowerValues[0] = parseInt(this.m_quantizationFactor.x * (minVertexX - this.m_worldAABB.lowerBound.x)) & b2Settings.USHRT_MAX - 1;
  upperValues[0] = parseInt(this.m_quantizationFactor.x * (maxVertexX - this.m_worldAABB.lowerBound.x)) % 65535 | 1;
  lowerValues[1] = parseInt(this.m_quantizationFactor.y * (minVertexY - this.m_worldAABB.lowerBound.y)) & b2Settings.USHRT_MAX - 1;
  upperValues[1] = parseInt(this.m_quantizationFactor.y * (maxVertexY - this.m_worldAABB.lowerBound.y)) % 65535 | 1
};
b2BroadPhase.prototype.TestOverlapValidate = function(p1, p2) {
  for(var axis = 0;axis < 2;++axis) {
    var bounds = this.m_bounds[axis];
    var bound1 = bounds[p1.lowerBounds[axis]];
    var bound2 = bounds[p2.upperBounds[axis]];
    if(bound1.value > bound2.value) {
      return false
    }
    bound1 = bounds[p1.upperBounds[axis]];
    bound2 = bounds[p2.lowerBounds[axis]];
    if(bound1.value < bound2.value) {
      return false
    }
  }
  return true
};
b2BroadPhase.prototype.QueryAxis = function(lowerQueryOut, upperQueryOut, lowerValue, upperValue, bounds, boundCount, axis) {
  var lowerQuery = b2BroadPhase.BinarySearch(bounds, boundCount, lowerValue);
  var upperQuery = b2BroadPhase.BinarySearch(bounds, boundCount, upperValue);
  var bound;
  for(var j = lowerQuery;j < upperQuery;++j) {
    bound = bounds[j];
    if(bound.IsLower()) {
      this.IncrementOverlapCount(bound.proxy)
    }
  }
  if(lowerQuery > 0) {
    var i = lowerQuery - 1;
    bound = bounds[i];
    var s = bound.stabbingCount;
    while(s) {
      bound = bounds[i];
      if(bound.IsLower()) {
        var proxy = bound.proxy;
        if(lowerQuery <= proxy.upperBounds[axis]) {
          this.IncrementOverlapCount(bound.proxy);
          --s
        }
      }
      --i
    }
  }
  lowerQueryOut[0] = lowerQuery;
  upperQueryOut[0] = upperQuery
};
b2BroadPhase.prototype.IncrementOverlapCount = function(proxy) {
  if(proxy.timeStamp < this.m_timeStamp) {
    proxy.timeStamp = this.m_timeStamp;
    proxy.overlapCount = 1
  }else {
    proxy.overlapCount = 2;
    this.m_queryResults[this.m_queryResultCount] = proxy;
    ++this.m_queryResultCount
  }
};
b2BroadPhase.prototype.IncrementTimeStamp = function() {
  if(this.m_timeStamp == b2Settings.USHRT_MAX) {
    for(var i = 0;i < this.m_proxyPool.length;++i) {
      this.m_proxyPool[i].timeStamp = 0
    }
    this.m_timeStamp = 1
  }else {
    ++this.m_timeStamp
  }
};
b2BroadPhase.prototype.InRange = function(aabb) {
  var dX;
  var dY;
  var d2X;
  var d2Y;
  dX = aabb.lowerBound.x;
  dY = aabb.lowerBound.y;
  dX -= this.m_worldAABB.upperBound.x;
  dY -= this.m_worldAABB.upperBound.y;
  d2X = this.m_worldAABB.lowerBound.x;
  d2Y = this.m_worldAABB.lowerBound.y;
  d2X -= aabb.upperBound.x;
  d2Y -= aabb.upperBound.y;
  dX = b2Math.Max(dX, d2X);
  dY = b2Math.Max(dY, d2Y);
  return b2Math.Max(dX, dY) < 0
};
b2BroadPhase.prototype.CreateProxy = function(aabb, userData) {
  var index = 0;
  var proxy;
  var i = 0;
  var j = 0;
  if(!this.m_freeProxy) {
    this.m_freeProxy = this.m_proxyPool[this.m_proxyCount] = new b2Proxy;
    this.m_freeProxy.next = null;
    this.m_freeProxy.timeStamp = 0;
    this.m_freeProxy.overlapCount = b2BroadPhase.b2_invalid;
    this.m_freeProxy.userData = null;
    for(i = 0;i < 2;i++) {
      j = this.m_proxyCount * 2;
      this.m_bounds[i][j++] = new b2Bound;
      this.m_bounds[i][j] = new b2Bound
    }
  }
  proxy = this.m_freeProxy;
  this.m_freeProxy = proxy.next;
  proxy.overlapCount = 0;
  proxy.userData = userData;
  var boundCount = 2 * this.m_proxyCount;
  var lowerValues = new Array;
  var upperValues = new Array;
  this.ComputeBounds(lowerValues, upperValues, aabb);
  for(var axis = 0;axis < 2;++axis) {
    var bounds = this.m_bounds[axis];
    var lowerIndex = 0;
    var upperIndex = 0;
    var lowerIndexOut = new Array;
    lowerIndexOut.push(lowerIndex);
    var upperIndexOut = new Array;
    upperIndexOut.push(upperIndex);
    this.QueryAxis(lowerIndexOut, upperIndexOut, lowerValues[axis], upperValues[axis], bounds, boundCount, axis);
    lowerIndex = lowerIndexOut[0];
    upperIndex = upperIndexOut[0];
    bounds.splice(upperIndex, 0, bounds[bounds.length - 1]);
    bounds.length--;
    bounds.splice(lowerIndex, 0, bounds[bounds.length - 1]);
    bounds.length--;
    ++upperIndex;
    var tBound1 = bounds[lowerIndex];
    var tBound2 = bounds[upperIndex];
    tBound1.value = lowerValues[axis];
    tBound1.proxy = proxy;
    tBound2.value = upperValues[axis];
    tBound2.proxy = proxy;
    var tBoundAS3 = bounds[parseInt(lowerIndex - 1)];
    tBound1.stabbingCount = lowerIndex == 0 ? 0 : tBoundAS3.stabbingCount;
    tBoundAS3 = bounds[parseInt(upperIndex - 1)];
    tBound2.stabbingCount = tBoundAS3.stabbingCount;
    for(index = lowerIndex;index < upperIndex;++index) {
      tBoundAS3 = bounds[index];
      tBoundAS3.stabbingCount++
    }
    for(index = lowerIndex;index < boundCount + 2;++index) {
      tBound1 = bounds[index];
      var proxy2 = tBound1.proxy;
      if(tBound1.IsLower()) {
        proxy2.lowerBounds[axis] = index
      }else {
        proxy2.upperBounds[axis] = index
      }
    }
  }
  ++this.m_proxyCount;
  for(i = 0;i < this.m_queryResultCount;++i) {
    this.m_pairManager.AddBufferedPair(proxy, this.m_queryResults[i])
  }
  this.m_queryResultCount = 0;
  this.IncrementTimeStamp();
  return proxy
};
b2BroadPhase.prototype.DestroyProxy = function(proxy_) {
  var proxy = proxy_;
  var tBound1;
  var tBound2;
  var boundCount = 2 * this.m_proxyCount;
  for(var axis = 0;axis < 2;++axis) {
    var bounds = this.m_bounds[axis];
    var lowerIndex = proxy.lowerBounds[axis];
    var upperIndex = proxy.upperBounds[axis];
    tBound1 = bounds[lowerIndex];
    var lowerValue = tBound1.value;
    tBound2 = bounds[upperIndex];
    var upperValue = tBound2.value;
    bounds.splice(upperIndex, 1);
    bounds.splice(lowerIndex, 1);
    bounds.push(tBound1);
    bounds.push(tBound2);
    var tEnd = boundCount - 2;
    for(var index = lowerIndex;index < tEnd;++index) {
      tBound1 = bounds[index];
      var proxy2 = tBound1.proxy;
      if(tBound1.IsLower()) {
        proxy2.lowerBounds[axis] = index
      }else {
        proxy2.upperBounds[axis] = index
      }
    }
    tEnd = upperIndex - 1;
    for(var index2 = lowerIndex;index2 < tEnd;++index2) {
      tBound1 = bounds[index2];
      tBound1.stabbingCount--
    }
    var ignore = new Array;
    this.QueryAxis(ignore, ignore, lowerValue, upperValue, bounds, boundCount - 2, axis)
  }
  for(var i = 0;i < this.m_queryResultCount;++i) {
    this.m_pairManager.RemoveBufferedPair(proxy, this.m_queryResults[i])
  }
  this.m_queryResultCount = 0;
  this.IncrementTimeStamp();
  proxy.userData = null;
  proxy.overlapCount = b2BroadPhase.b2_invalid;
  proxy.lowerBounds[0] = b2BroadPhase.b2_invalid;
  proxy.lowerBounds[1] = b2BroadPhase.b2_invalid;
  proxy.upperBounds[0] = b2BroadPhase.b2_invalid;
  proxy.upperBounds[1] = b2BroadPhase.b2_invalid;
  proxy.next = this.m_freeProxy;
  this.m_freeProxy = proxy;
  --this.m_proxyCount
};
b2BroadPhase.prototype.MoveProxy = function(proxy_, aabb, displacement) {
  var proxy = proxy_;
  var as3arr;
  var as3int = 0;
  var axis = 0;
  var index = 0;
  var bound;
  var prevBound;
  var nextBound;
  var nextProxyId = 0;
  var nextProxy;
  if(proxy == null) {
    return
  }
  if(aabb.IsValid() == false) {
    return
  }
  var boundCount = 2 * this.m_proxyCount;
  var newValues = new b2BoundValues;
  this.ComputeBounds(newValues.lowerValues, newValues.upperValues, aabb);
  var oldValues = new b2BoundValues;
  for(axis = 0;axis < 2;++axis) {
    bound = this.m_bounds[axis][proxy.lowerBounds[axis]];
    oldValues.lowerValues[axis] = bound.value;
    bound = this.m_bounds[axis][proxy.upperBounds[axis]];
    oldValues.upperValues[axis] = bound.value
  }
  for(axis = 0;axis < 2;++axis) {
    var bounds = this.m_bounds[axis];
    var lowerIndex = proxy.lowerBounds[axis];
    var upperIndex = proxy.upperBounds[axis];
    var lowerValue = newValues.lowerValues[axis];
    var upperValue = newValues.upperValues[axis];
    bound = bounds[lowerIndex];
    var deltaLower = lowerValue - bound.value;
    bound.value = lowerValue;
    bound = bounds[upperIndex];
    var deltaUpper = upperValue - bound.value;
    bound.value = upperValue;
    if(deltaLower < 0) {
      index = lowerIndex;
      while(index > 0 && lowerValue < bounds[parseInt(index - 1)].value) {
        bound = bounds[index];
        prevBound = bounds[parseInt(index - 1)];
        var prevProxy = prevBound.proxy;
        prevBound.stabbingCount++;
        if(prevBound.IsUpper() == true) {
          if(this.TestOverlapBound(newValues, prevProxy)) {
            this.m_pairManager.AddBufferedPair(proxy, prevProxy)
          }
          as3arr = prevProxy.upperBounds;
          as3int = as3arr[axis];
          as3int++;
          as3arr[axis] = as3int;
          bound.stabbingCount++
        }else {
          as3arr = prevProxy.lowerBounds;
          as3int = as3arr[axis];
          as3int++;
          as3arr[axis] = as3int;
          bound.stabbingCount--
        }
        as3arr = proxy.lowerBounds;
        as3int = as3arr[axis];
        as3int--;
        as3arr[axis] = as3int;
        bound.Swap(prevBound);
        --index
      }
    }
    if(deltaUpper > 0) {
      index = upperIndex;
      while(index < boundCount - 1 && bounds[parseInt(index + 1)].value <= upperValue) {
        bound = bounds[index];
        nextBound = bounds[parseInt(index + 1)];
        nextProxy = nextBound.proxy;
        nextBound.stabbingCount++;
        if(nextBound.IsLower() == true) {
          if(this.TestOverlapBound(newValues, nextProxy)) {
            this.m_pairManager.AddBufferedPair(proxy, nextProxy)
          }
          as3arr = nextProxy.lowerBounds;
          as3int = as3arr[axis];
          as3int--;
          as3arr[axis] = as3int;
          bound.stabbingCount++
        }else {
          as3arr = nextProxy.upperBounds;
          as3int = as3arr[axis];
          as3int--;
          as3arr[axis] = as3int;
          bound.stabbingCount--
        }
        as3arr = proxy.upperBounds;
        as3int = as3arr[axis];
        as3int++;
        as3arr[axis] = as3int;
        bound.Swap(nextBound);
        index++
      }
    }
    if(deltaLower > 0) {
      index = lowerIndex;
      while(index < boundCount - 1 && bounds[parseInt(index + 1)].value <= lowerValue) {
        bound = bounds[index];
        nextBound = bounds[parseInt(index + 1)];
        nextProxy = nextBound.proxy;
        nextBound.stabbingCount--;
        if(nextBound.IsUpper()) {
          if(this.TestOverlapBound(oldValues, nextProxy)) {
            this.m_pairManager.RemoveBufferedPair(proxy, nextProxy)
          }
          as3arr = nextProxy.upperBounds;
          as3int = as3arr[axis];
          as3int--;
          as3arr[axis] = as3int;
          bound.stabbingCount--
        }else {
          as3arr = nextProxy.lowerBounds;
          as3int = as3arr[axis];
          as3int--;
          as3arr[axis] = as3int;
          bound.stabbingCount++
        }
        as3arr = proxy.lowerBounds;
        as3int = as3arr[axis];
        as3int++;
        as3arr[axis] = as3int;
        bound.Swap(nextBound);
        index++
      }
    }
    if(deltaUpper < 0) {
      index = upperIndex;
      while(index > 0 && upperValue < bounds[parseInt(index - 1)].value) {
        bound = bounds[index];
        prevBound = bounds[parseInt(index - 1)];
        prevProxy = prevBound.proxy;
        prevBound.stabbingCount--;
        if(prevBound.IsLower() == true) {
          if(this.TestOverlapBound(oldValues, prevProxy)) {
            this.m_pairManager.RemoveBufferedPair(proxy, prevProxy)
          }
          as3arr = prevProxy.lowerBounds;
          as3int = as3arr[axis];
          as3int++;
          as3arr[axis] = as3int;
          bound.stabbingCount--
        }else {
          as3arr = prevProxy.upperBounds;
          as3int = as3arr[axis];
          as3int++;
          as3arr[axis] = as3int;
          bound.stabbingCount++
        }
        as3arr = proxy.upperBounds;
        as3int = as3arr[axis];
        as3int--;
        as3arr[axis] = as3int;
        bound.Swap(prevBound);
        index--
      }
    }
  }
};
b2BroadPhase.prototype.UpdatePairs = function(callback) {
  this.m_pairManager.Commit(callback)
};
b2BroadPhase.prototype.TestOverlap = function(proxyA, proxyB) {
  var proxyA_ = proxyA;
  var proxyB_ = proxyB;
  if(proxyA_.lowerBounds[0] > proxyB_.upperBounds[0]) {
    return false
  }
  if(proxyB_.lowerBounds[0] > proxyA_.upperBounds[0]) {
    return false
  }
  if(proxyA_.lowerBounds[1] > proxyB_.upperBounds[1]) {
    return false
  }
  if(proxyB_.lowerBounds[1] > proxyA_.upperBounds[1]) {
    return false
  }
  return true
};
b2BroadPhase.prototype.GetUserData = function(proxy) {
  return proxy.userData
};
b2BroadPhase.prototype.GetFatAABB = function(proxy_) {
  var aabb = new b2AABB;
  var proxy = proxy_;
  aabb.lowerBound.x = this.m_worldAABB.lowerBound.x + this.m_bounds[0][proxy.lowerBounds[0]].value / this.m_quantizationFactor.x;
  aabb.lowerBound.y = this.m_worldAABB.lowerBound.y + this.m_bounds[1][proxy.lowerBounds[1]].value / this.m_quantizationFactor.y;
  aabb.upperBound.x = this.m_worldAABB.lowerBound.x + this.m_bounds[0][proxy.upperBounds[0]].value / this.m_quantizationFactor.x;
  aabb.upperBound.y = this.m_worldAABB.lowerBound.y + this.m_bounds[1][proxy.upperBounds[1]].value / this.m_quantizationFactor.y;
  return aabb
};
b2BroadPhase.prototype.GetProxyCount = function() {
  return this.m_proxyCount
};
b2BroadPhase.prototype.Query = function(callback, aabb) {
  var lowerValues = new Array;
  var upperValues = new Array;
  this.ComputeBounds(lowerValues, upperValues, aabb);
  var lowerIndex = 0;
  var upperIndex = 0;
  var lowerIndexOut = new Array;
  lowerIndexOut.push(lowerIndex);
  var upperIndexOut = new Array;
  upperIndexOut.push(upperIndex);
  this.QueryAxis(lowerIndexOut, upperIndexOut, lowerValues[0], upperValues[0], this.m_bounds[0], 2 * this.m_proxyCount, 0);
  this.QueryAxis(lowerIndexOut, upperIndexOut, lowerValues[1], upperValues[1], this.m_bounds[1], 2 * this.m_proxyCount, 1);
  for(var i = 0;i < this.m_queryResultCount;++i) {
    var proxy = this.m_queryResults[i];
    if(!callback(proxy)) {
      break
    }
  }
  this.m_queryResultCount = 0;
  this.IncrementTimeStamp()
};
b2BroadPhase.prototype.Validate = function() {
  var pair;
  var proxy1;
  var proxy2;
  var overlap;
  for(var axis = 0;axis < 2;++axis) {
    var bounds = this.m_bounds[axis];
    var boundCount = 2 * this.m_proxyCount;
    var stabbingCount = 0;
    for(var i = 0;i < boundCount;++i) {
      var bound = bounds[i];
      if(bound.IsLower() == true) {
        stabbingCount++
      }else {
        stabbingCount--
      }
    }
  }
};
b2BroadPhase.prototype.Rebalance = function(iterations) {
};
b2BroadPhase.prototype.RayCast = function(callback, input) {
  var subInput = new b2RayCastInput;
  subInput.p1.SetV(input.p1);
  subInput.p2.SetV(input.p2);
  subInput.maxFraction = input.maxFraction;
  var dx = (input.p2.x - input.p1.x) * this.m_quantizationFactor.x;
  var dy = (input.p2.y - input.p1.y) * this.m_quantizationFactor.y;
  var sx = dx < -Number.MIN_VALUE ? -1 : dx > Number.MIN_VALUE ? 1 : 0;
  var sy = dy < -Number.MIN_VALUE ? -1 : dy > Number.MIN_VALUE ? 1 : 0;
  var p1x = this.m_quantizationFactor.x * (input.p1.x - this.m_worldAABB.lowerBound.x);
  var p1y = this.m_quantizationFactor.y * (input.p1.y - this.m_worldAABB.lowerBound.y);
  var startValues = new Array;
  var startValues2 = new Array;
  startValues[0] = parseInt(p1x) & b2Settings.USHRT_MAX - 1;
  startValues[1] = parseInt(p1y) & b2Settings.USHRT_MAX - 1;
  startValues2[0] = startValues[0] + 1;
  startValues2[1] = startValues[1] + 1;
  var startIndices = new Array;
  var xIndex = 0;
  var yIndex = 0;
  var proxy;
  var lowerIndex = 0;
  var upperIndex = 0;
  var lowerIndexOut = new Array;
  lowerIndexOut.push(lowerIndex);
  var upperIndexOut = new Array;
  upperIndexOut.push(upperIndex);
  this.QueryAxis(lowerIndexOut, upperIndexOut, startValues[0], startValues2[0], this.m_bounds[0], 2 * this.m_proxyCount, 0);
  if(sx >= 0) {
    xIndex = upperIndexOut[0] - 1
  }else {
    xIndex = lowerIndexOut[0]
  }
  this.QueryAxis(lowerIndexOut, upperIndexOut, startValues[1], startValues2[1], this.m_bounds[1], 2 * this.m_proxyCount, 1);
  if(sy >= 0) {
    yIndex = upperIndexOut[0] - 1
  }else {
    yIndex = lowerIndexOut[0]
  }
  for(var i = 0;i < this.m_queryResultCount;i++) {
    subInput.maxFraction = callback(this.m_queryResults[i], subInput)
  }
  for(;;) {
    var xProgress = 0;
    var yProgress = 0;
    xIndex += sx >= 0 ? 1 : -1;
    if(xIndex < 0 || xIndex >= this.m_proxyCount * 2) {
      break
    }
    if(sx != 0) {
      xProgress = (this.m_bounds[0][xIndex].value - p1x) / dx
    }
    yIndex += sy >= 0 ? 1 : -1;
    if(yIndex < 0 || yIndex >= this.m_proxyCount * 2) {
      break
    }
    if(sy != 0) {
      yProgress = (this.m_bounds[1][yIndex].value - p1y) / dy
    }
    for(;;) {
      if(sy == 0 || sx != 0 && xProgress < yProgress) {
        if(xProgress > subInput.maxFraction) {
          break
        }
        if(sx > 0 ? this.m_bounds[0][xIndex].IsLower() : this.m_bounds[0][xIndex].IsUpper()) {
          proxy = this.m_bounds[0][xIndex].proxy;
          if(sy >= 0) {
            if(proxy.lowerBounds[1] <= yIndex - 1 && proxy.upperBounds[1] >= yIndex) {
              subInput.maxFraction = callback(proxy, subInput)
            }
          }else {
            if(proxy.lowerBounds[1] <= yIndex && proxy.upperBounds[1] >= yIndex + 1) {
              subInput.maxFraction = callback(proxy, subInput)
            }
          }
        }
        if(subInput.maxFraction == 0) {
          break
        }
        if(sx > 0) {
          xIndex++;
          if(xIndex == this.m_proxyCount * 2) {
            break
          }
        }else {
          xIndex--;
          if(xIndex < 0) {
            break
          }
        }
        xProgress = (this.m_bounds[0][xIndex].value - p1x) / dx
      }else {
        if(yProgress > subInput.maxFraction) {
          break
        }
        if(sy > 0 ? this.m_bounds[1][yIndex].IsLower() : this.m_bounds[1][yIndex].IsUpper()) {
          proxy = this.m_bounds[1][yIndex].proxy;
          if(sx >= 0) {
            if(proxy.lowerBounds[0] <= xIndex - 1 && proxy.upperBounds[0] >= xIndex) {
              subInput.maxFraction = callback(proxy, subInput)
            }
          }else {
            if(proxy.lowerBounds[0] <= xIndex && proxy.upperBounds[0] >= xIndex + 1) {
              subInput.maxFraction = callback(proxy, subInput)
            }
          }
        }
        if(subInput.maxFraction == 0) {
          break
        }
        if(sy > 0) {
          yIndex++;
          if(yIndex == this.m_proxyCount * 2) {
            break
          }
        }else {
          yIndex--;
          if(yIndex < 0) {
            break
          }
        }
        yProgress = (this.m_bounds[1][yIndex].value - p1y) / dy
      }
    }
    break
  }
  this.m_queryResultCount = 0;
  this.IncrementTimeStamp();
  return
};
b2BroadPhase.prototype.TestOverlapBound = function(b, p) {
  for(var axis = 0;axis < 2;++axis) {
    var bounds = this.m_bounds[axis];
    var bound = bounds[p.upperBounds[axis]];
    if(b.lowerValues[axis] > bound.value) {
      return false
    }
    bound = bounds[p.lowerBounds[axis]];
    if(b.upperValues[axis] < bound.value) {
      return false
    }
  }
  return true
};
b2BroadPhase.prototype.m_pairManager = new b2PairManager;
b2BroadPhase.prototype.m_proxyPool = new Array;
b2BroadPhase.prototype.m_freeProxy = null;
b2BroadPhase.prototype.m_bounds = null;
b2BroadPhase.prototype.m_querySortKeys = new Array;
b2BroadPhase.prototype.m_queryResults = new Array;
b2BroadPhase.prototype.m_queryResultCount = 0;
b2BroadPhase.prototype.m_worldAABB = null;
b2BroadPhase.prototype.m_quantizationFactor = new b2Vec2;
b2BroadPhase.prototype.m_proxyCount = 0;
b2BroadPhase.prototype.m_timeStamp = 0;var b2Manifold = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Manifold.prototype.__constructor = function() {
  this.m_points = new Array(b2Settings.b2_maxManifoldPoints);
  for(var i = 0;i < b2Settings.b2_maxManifoldPoints;i++) {
    this.m_points[i] = new b2ManifoldPoint
  }
  this.m_localPlaneNormal = new b2Vec2;
  this.m_localPoint = new b2Vec2
};
b2Manifold.prototype.__varz = function() {
};
b2Manifold.e_circles = 1;
b2Manifold.e_faceA = 2;
b2Manifold.e_faceB = 4;
b2Manifold.prototype.Reset = function() {
  for(var i = 0;i < b2Settings.b2_maxManifoldPoints;i++) {
    this.m_points[i].Reset()
  }
  this.m_localPlaneNormal.SetZero();
  this.m_localPoint.SetZero();
  this.m_type = 0;
  this.m_pointCount = 0
};
b2Manifold.prototype.Set = function(m) {
  this.m_pointCount = m.m_pointCount;
  for(var i = 0;i < b2Settings.b2_maxManifoldPoints;i++) {
    this.m_points[i].Set(m.m_points[i])
  }
  this.m_localPlaneNormal.SetV(m.m_localPlaneNormal);
  this.m_localPoint.SetV(m.m_localPoint);
  this.m_type = m.m_type
};
b2Manifold.prototype.Copy = function() {
  var copy = new b2Manifold;
  copy.Set(this);
  return copy
};
b2Manifold.prototype.m_points = null;
b2Manifold.prototype.m_localPlaneNormal = null;
b2Manifold.prototype.m_localPoint = null;
b2Manifold.prototype.m_type = 0;
b2Manifold.prototype.m_pointCount = 0;var b2CircleShape = function() {
  b2Shape.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2CircleShape.prototype, b2Shape.prototype);
b2CircleShape.prototype._super = b2Shape.prototype;
b2CircleShape.prototype.__constructor = function(radius) {
  this._super.__constructor.apply(this, []);
  this.m_type = b2Shape.e_circleShape;
  this.m_radius = radius
};
b2CircleShape.prototype.__varz = function() {
  this.m_p = new b2Vec2
};
b2CircleShape.prototype.Copy = function() {
  var s = new b2CircleShape;
  s.Set(this);
  return s
};
b2CircleShape.prototype.Set = function(other) {
  this._super.Set.apply(this, [other]);
  if(isInstanceOf(other, b2CircleShape)) {
    var other2 = other;
    this.m_p.SetV(other2.m_p)
  }
};
b2CircleShape.prototype.TestPoint = function(transform, p) {
  var tMat = transform.R;
  var dX = transform.position.x + (tMat.col1.x * this.m_p.x + tMat.col2.x * this.m_p.y);
  var dY = transform.position.y + (tMat.col1.y * this.m_p.x + tMat.col2.y * this.m_p.y);
  dX = p.x - dX;
  dY = p.y - dY;
  return dX * dX + dY * dY <= this.m_radius * this.m_radius
};
b2CircleShape.prototype.RayCast = function(output, input, transform) {
  var tMat = transform.R;
  var positionX = transform.position.x + (tMat.col1.x * this.m_p.x + tMat.col2.x * this.m_p.y);
  var positionY = transform.position.y + (tMat.col1.y * this.m_p.x + tMat.col2.y * this.m_p.y);
  var sX = input.p1.x - positionX;
  var sY = input.p1.y - positionY;
  var b = sX * sX + sY * sY - this.m_radius * this.m_radius;
  var rX = input.p2.x - input.p1.x;
  var rY = input.p2.y - input.p1.y;
  var c = sX * rX + sY * rY;
  var rr = rX * rX + rY * rY;
  var sigma = c * c - rr * b;
  if(sigma < 0 || rr < Number.MIN_VALUE) {
    return false
  }
  var a = -(c + Math.sqrt(sigma));
  if(0 <= a && a <= input.maxFraction * rr) {
    a /= rr;
    output.fraction = a;
    output.normal.x = sX + a * rX;
    output.normal.y = sY + a * rY;
    output.normal.Normalize();
    return true
  }
  return false
};
b2CircleShape.prototype.ComputeAABB = function(aabb, transform) {
  var tMat = transform.R;
  var pX = transform.position.x + (tMat.col1.x * this.m_p.x + tMat.col2.x * this.m_p.y);
  var pY = transform.position.y + (tMat.col1.y * this.m_p.x + tMat.col2.y * this.m_p.y);
  aabb.lowerBound.Set(pX - this.m_radius, pY - this.m_radius);
  aabb.upperBound.Set(pX + this.m_radius, pY + this.m_radius)
};
b2CircleShape.prototype.ComputeMass = function(massData, density) {
  massData.mass = density * b2Settings.b2_pi * this.m_radius * this.m_radius;
  massData.center.SetV(this.m_p);
  massData.I = massData.mass * (0.5 * this.m_radius * this.m_radius + (this.m_p.x * this.m_p.x + this.m_p.y * this.m_p.y))
};
b2CircleShape.prototype.ComputeSubmergedArea = function(normal, offset, xf, c) {
  var p = b2Math.MulX(xf, this.m_p);
  var l = -(b2Math.Dot(normal, p) - offset);
  if(l < -this.m_radius + Number.MIN_VALUE) {
    return 0
  }
  if(l > this.m_radius) {
    c.SetV(p);
    return Math.PI * this.m_radius * this.m_radius
  }
  var r2 = this.m_radius * this.m_radius;
  var l2 = l * l;
  var area = r2 * (Math.asin(l / this.m_radius) + Math.PI / 2) + l * Math.sqrt(r2 - l2);
  var com = -2 / 3 * Math.pow(r2 - l2, 1.5) / area;
  c.x = p.x + normal.x * com;
  c.y = p.y + normal.y * com;
  return area
};
b2CircleShape.prototype.GetLocalPosition = function() {
  return this.m_p
};
b2CircleShape.prototype.SetLocalPosition = function(position) {
  this.m_p.SetV(position)
};
b2CircleShape.prototype.GetRadius = function() {
  return this.m_radius
};
b2CircleShape.prototype.SetRadius = function(radius) {
  this.m_radius = radius
};
b2CircleShape.prototype.m_p = new b2Vec2;var b2Joint = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Joint.prototype.__constructor = function(def) {
  b2Settings.b2Assert(def.bodyA != def.bodyB);
  this.m_type = def.type;
  this.m_prev = null;
  this.m_next = null;
  this.m_bodyA = def.bodyA;
  this.m_bodyB = def.bodyB;
  this.m_collideConnected = def.collideConnected;
  this.m_islandFlag = false;
  this.m_userData = def.userData
};
b2Joint.prototype.__varz = function() {
  this.m_edgeA = new b2JointEdge;
  this.m_edgeB = new b2JointEdge;
  this.m_localCenterA = new b2Vec2;
  this.m_localCenterB = new b2Vec2
};
b2Joint.Create = function(def, allocator) {
  var joint = null;
  switch(def.type) {
    case b2Joint.e_distanceJoint:
      joint = new b2DistanceJoint(def);
      break;
    case b2Joint.e_mouseJoint:
      joint = new b2MouseJoint(def);
      break;
    case b2Joint.e_prismaticJoint:
      joint = new b2PrismaticJoint(def);
      break;
    case b2Joint.e_revoluteJoint:
      joint = new b2RevoluteJoint(def);
      break;
    case b2Joint.e_pulleyJoint:
      joint = new b2PulleyJoint(def);
      break;
    case b2Joint.e_gearJoint:
      joint = new b2GearJoint(def);
      break;
    case b2Joint.e_lineJoint:
      joint = new b2LineJoint(def);
      break;
    case b2Joint.e_weldJoint:
      joint = new b2WeldJoint(def);
      break;
    case b2Joint.e_frictionJoint:
      joint = new b2FrictionJoint(def);
      break;
    default:
      break
  }
  return joint
};
b2Joint.Destroy = function(joint, allocator) {
};
b2Joint.e_unknownJoint = 0;
b2Joint.e_revoluteJoint = 1;
b2Joint.e_prismaticJoint = 2;
b2Joint.e_distanceJoint = 3;
b2Joint.e_pulleyJoint = 4;
b2Joint.e_mouseJoint = 5;
b2Joint.e_gearJoint = 6;
b2Joint.e_lineJoint = 7;
b2Joint.e_weldJoint = 8;
b2Joint.e_frictionJoint = 9;
b2Joint.e_inactiveLimit = 0;
b2Joint.e_atLowerLimit = 1;
b2Joint.e_atUpperLimit = 2;
b2Joint.e_equalLimits = 3;
b2Joint.prototype.InitVelocityConstraints = function(step) {
};
b2Joint.prototype.SolveVelocityConstraints = function(step) {
};
b2Joint.prototype.FinalizeVelocityConstraints = function() {
};
b2Joint.prototype.SolvePositionConstraints = function(baumgarte) {
  return false
};
b2Joint.prototype.GetType = function() {
  return this.m_type
};
b2Joint.prototype.GetAnchorA = function() {
  return null
};
b2Joint.prototype.GetAnchorB = function() {
  return null
};
b2Joint.prototype.GetReactionForce = function(inv_dt) {
  return null
};
b2Joint.prototype.GetReactionTorque = function(inv_dt) {
  return 0
};
b2Joint.prototype.GetBodyA = function() {
  return this.m_bodyA
};
b2Joint.prototype.GetBodyB = function() {
  return this.m_bodyB
};
b2Joint.prototype.GetNext = function() {
  return this.m_next
};
b2Joint.prototype.GetUserData = function() {
  return this.m_userData
};
b2Joint.prototype.SetUserData = function(data) {
  this.m_userData = data
};
b2Joint.prototype.IsActive = function() {
  return this.m_bodyA.IsActive() && this.m_bodyB.IsActive()
};
b2Joint.prototype.m_type = 0;
b2Joint.prototype.m_prev = null;
b2Joint.prototype.m_next = null;
b2Joint.prototype.m_edgeA = new b2JointEdge;
b2Joint.prototype.m_edgeB = new b2JointEdge;
b2Joint.prototype.m_bodyA = null;
b2Joint.prototype.m_bodyB = null;
b2Joint.prototype.m_islandFlag = null;
b2Joint.prototype.m_collideConnected = null;
b2Joint.prototype.m_userData = null;
b2Joint.prototype.m_localCenterA = new b2Vec2;
b2Joint.prototype.m_localCenterB = new b2Vec2;
b2Joint.prototype.m_invMassA = null;
b2Joint.prototype.m_invMassB = null;
b2Joint.prototype.m_invIA = null;
b2Joint.prototype.m_invIB = null;var b2LineJoint = function() {
  b2Joint.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2LineJoint.prototype, b2Joint.prototype);
b2LineJoint.prototype._super = b2Joint.prototype;
b2LineJoint.prototype.__constructor = function(def) {
  this._super.__constructor.apply(this, [def]);
  var tMat;
  var tX;
  var tY;
  this.m_localAnchor1.SetV(def.localAnchorA);
  this.m_localAnchor2.SetV(def.localAnchorB);
  this.m_localXAxis1.SetV(def.localAxisA);
  this.m_localYAxis1.x = -this.m_localXAxis1.y;
  this.m_localYAxis1.y = this.m_localXAxis1.x;
  this.m_impulse.SetZero();
  this.m_motorMass = 0;
  this.m_motorImpulse = 0;
  this.m_lowerTranslation = def.lowerTranslation;
  this.m_upperTranslation = def.upperTranslation;
  this.m_maxMotorForce = def.maxMotorForce;
  this.m_motorSpeed = def.motorSpeed;
  this.m_enableLimit = def.enableLimit;
  this.m_enableMotor = def.enableMotor;
  this.m_limitState = b2Joint.e_inactiveLimit;
  this.m_axis.SetZero();
  this.m_perp.SetZero()
};
b2LineJoint.prototype.__varz = function() {
  this.m_localAnchor1 = new b2Vec2;
  this.m_localAnchor2 = new b2Vec2;
  this.m_localXAxis1 = new b2Vec2;
  this.m_localYAxis1 = new b2Vec2;
  this.m_axis = new b2Vec2;
  this.m_perp = new b2Vec2;
  this.m_K = new b2Mat22;
  this.m_impulse = new b2Vec2
};
b2LineJoint.prototype.InitVelocityConstraints = function(step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  var tX;
  this.m_localCenterA.SetV(bA.GetLocalCenter());
  this.m_localCenterB.SetV(bB.GetLocalCenter());
  var xf1 = bA.GetTransform();
  var xf2 = bB.GetTransform();
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - this.m_localCenterA.x;
  var r1Y = this.m_localAnchor1.y - this.m_localCenterA.y;
  tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - this.m_localCenterB.x;
  var r2Y = this.m_localAnchor2.y - this.m_localCenterB.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var dX = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
  var dY = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
  this.m_invMassA = bA.m_invMass;
  this.m_invMassB = bB.m_invMass;
  this.m_invIA = bA.m_invI;
  this.m_invIB = bB.m_invI;
  this.m_axis.SetV(b2Math.MulMV(xf1.R, this.m_localXAxis1));
  this.m_a1 = (dX + r1X) * this.m_axis.y - (dY + r1Y) * this.m_axis.x;
  this.m_a2 = r2X * this.m_axis.y - r2Y * this.m_axis.x;
  this.m_motorMass = this.m_invMassA + this.m_invMassB + this.m_invIA * this.m_a1 * this.m_a1 + this.m_invIB * this.m_a2 * this.m_a2;
  this.m_motorMass = this.m_motorMass > Number.MIN_VALUE ? 1 / this.m_motorMass : 0;
  this.m_perp.SetV(b2Math.MulMV(xf1.R, this.m_localYAxis1));
  this.m_s1 = (dX + r1X) * this.m_perp.y - (dY + r1Y) * this.m_perp.x;
  this.m_s2 = r2X * this.m_perp.y - r2Y * this.m_perp.x;
  var m1 = this.m_invMassA;
  var m2 = this.m_invMassB;
  var i1 = this.m_invIA;
  var i2 = this.m_invIB;
  this.m_K.col1.x = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
  this.m_K.col1.y = i1 * this.m_s1 * this.m_a1 + i2 * this.m_s2 * this.m_a2;
  this.m_K.col2.x = this.m_K.col1.y;
  this.m_K.col2.y = m1 + m2 + i1 * this.m_a1 * this.m_a1 + i2 * this.m_a2 * this.m_a2;
  if(this.m_enableLimit) {
    var jointTransition = this.m_axis.x * dX + this.m_axis.y * dY;
    if(b2Math.Abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * b2Settings.b2_linearSlop) {
      this.m_limitState = b2Joint.e_equalLimits
    }else {
      if(jointTransition <= this.m_lowerTranslation) {
        if(this.m_limitState != b2Joint.e_atLowerLimit) {
          this.m_limitState = b2Joint.e_atLowerLimit;
          this.m_impulse.y = 0
        }
      }else {
        if(jointTransition >= this.m_upperTranslation) {
          if(this.m_limitState != b2Joint.e_atUpperLimit) {
            this.m_limitState = b2Joint.e_atUpperLimit;
            this.m_impulse.y = 0
          }
        }else {
          this.m_limitState = b2Joint.e_inactiveLimit;
          this.m_impulse.y = 0
        }
      }
    }
  }else {
    this.m_limitState = b2Joint.e_inactiveLimit
  }
  if(this.m_enableMotor == false) {
    this.m_motorImpulse = 0
  }
  if(step.warmStarting) {
    this.m_impulse.x *= step.dtRatio;
    this.m_impulse.y *= step.dtRatio;
    this.m_motorImpulse *= step.dtRatio;
    var PX = this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.x;
    var PY = this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.y;
    var L1 = this.m_impulse.x * this.m_s1 + (this.m_motorImpulse + this.m_impulse.y) * this.m_a1;
    var L2 = this.m_impulse.x * this.m_s2 + (this.m_motorImpulse + this.m_impulse.y) * this.m_a2;
    bA.m_linearVelocity.x -= this.m_invMassA * PX;
    bA.m_linearVelocity.y -= this.m_invMassA * PY;
    bA.m_angularVelocity -= this.m_invIA * L1;
    bB.m_linearVelocity.x += this.m_invMassB * PX;
    bB.m_linearVelocity.y += this.m_invMassB * PY;
    bB.m_angularVelocity += this.m_invIB * L2
  }else {
    this.m_impulse.SetZero();
    this.m_motorImpulse = 0
  }
};
b2LineJoint.prototype.SolveVelocityConstraints = function(step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var v1 = bA.m_linearVelocity;
  var w1 = bA.m_angularVelocity;
  var v2 = bB.m_linearVelocity;
  var w2 = bB.m_angularVelocity;
  var PX;
  var PY;
  var L1;
  var L2;
  if(this.m_enableMotor && this.m_limitState != b2Joint.e_equalLimits) {
    var Cdot = this.m_axis.x * (v2.x - v1.x) + this.m_axis.y * (v2.y - v1.y) + this.m_a2 * w2 - this.m_a1 * w1;
    var impulse = this.m_motorMass * (this.m_motorSpeed - Cdot);
    var oldImpulse = this.m_motorImpulse;
    var maxImpulse = step.dt * this.m_maxMotorForce;
    this.m_motorImpulse = b2Math.Clamp(this.m_motorImpulse + impulse, -maxImpulse, maxImpulse);
    impulse = this.m_motorImpulse - oldImpulse;
    PX = impulse * this.m_axis.x;
    PY = impulse * this.m_axis.y;
    L1 = impulse * this.m_a1;
    L2 = impulse * this.m_a2;
    v1.x -= this.m_invMassA * PX;
    v1.y -= this.m_invMassA * PY;
    w1 -= this.m_invIA * L1;
    v2.x += this.m_invMassB * PX;
    v2.y += this.m_invMassB * PY;
    w2 += this.m_invIB * L2
  }
  var Cdot1 = this.m_perp.x * (v2.x - v1.x) + this.m_perp.y * (v2.y - v1.y) + this.m_s2 * w2 - this.m_s1 * w1;
  if(this.m_enableLimit && this.m_limitState != b2Joint.e_inactiveLimit) {
    var Cdot2 = this.m_axis.x * (v2.x - v1.x) + this.m_axis.y * (v2.y - v1.y) + this.m_a2 * w2 - this.m_a1 * w1;
    var f1 = this.m_impulse.Copy();
    var df = this.m_K.Solve(new b2Vec2, -Cdot1, -Cdot2);
    this.m_impulse.Add(df);
    if(this.m_limitState == b2Joint.e_atLowerLimit) {
      this.m_impulse.y = b2Math.Max(this.m_impulse.y, 0)
    }else {
      if(this.m_limitState == b2Joint.e_atUpperLimit) {
        this.m_impulse.y = b2Math.Min(this.m_impulse.y, 0)
      }
    }
    var b = -Cdot1 - (this.m_impulse.y - f1.y) * this.m_K.col2.x;
    var f2r;
    if(this.m_K.col1.x != 0) {
      f2r = b / this.m_K.col1.x + f1.x
    }else {
      f2r = f1.x
    }
    this.m_impulse.x = f2r;
    df.x = this.m_impulse.x - f1.x;
    df.y = this.m_impulse.y - f1.y;
    PX = df.x * this.m_perp.x + df.y * this.m_axis.x;
    PY = df.x * this.m_perp.y + df.y * this.m_axis.y;
    L1 = df.x * this.m_s1 + df.y * this.m_a1;
    L2 = df.x * this.m_s2 + df.y * this.m_a2;
    v1.x -= this.m_invMassA * PX;
    v1.y -= this.m_invMassA * PY;
    w1 -= this.m_invIA * L1;
    v2.x += this.m_invMassB * PX;
    v2.y += this.m_invMassB * PY;
    w2 += this.m_invIB * L2
  }else {
    var df2;
    if(this.m_K.col1.x != 0) {
      df2 = -Cdot1 / this.m_K.col1.x
    }else {
      df2 = 0
    }
    this.m_impulse.x += df2;
    PX = df2 * this.m_perp.x;
    PY = df2 * this.m_perp.y;
    L1 = df2 * this.m_s1;
    L2 = df2 * this.m_s2;
    v1.x -= this.m_invMassA * PX;
    v1.y -= this.m_invMassA * PY;
    w1 -= this.m_invIA * L1;
    v2.x += this.m_invMassB * PX;
    v2.y += this.m_invMassB * PY;
    w2 += this.m_invIB * L2
  }
  bA.m_linearVelocity.SetV(v1);
  bA.m_angularVelocity = w1;
  bB.m_linearVelocity.SetV(v2);
  bB.m_angularVelocity = w2
};
b2LineJoint.prototype.SolvePositionConstraints = function(baumgarte) {
  var limitC;
  var oldLimitImpulse;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var c1 = bA.m_sweep.c;
  var a1 = bA.m_sweep.a;
  var c2 = bB.m_sweep.c;
  var a2 = bB.m_sweep.a;
  var tMat;
  var tX;
  var m1;
  var m2;
  var i1;
  var i2;
  var linearError = 0;
  var angularError = 0;
  var active = false;
  var C2 = 0;
  var R1 = b2Mat22.FromAngle(a1);
  var R2 = b2Mat22.FromAngle(a2);
  tMat = R1;
  var r1X = this.m_localAnchor1.x - this.m_localCenterA.x;
  var r1Y = this.m_localAnchor1.y - this.m_localCenterA.y;
  tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = R2;
  var r2X = this.m_localAnchor2.x - this.m_localCenterB.x;
  var r2Y = this.m_localAnchor2.y - this.m_localCenterB.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var dX = c2.x + r2X - c1.x - r1X;
  var dY = c2.y + r2Y - c1.y - r1Y;
  if(this.m_enableLimit) {
    this.m_axis = b2Math.MulMV(R1, this.m_localXAxis1);
    this.m_a1 = (dX + r1X) * this.m_axis.y - (dY + r1Y) * this.m_axis.x;
    this.m_a2 = r2X * this.m_axis.y - r2Y * this.m_axis.x;
    var translation = this.m_axis.x * dX + this.m_axis.y * dY;
    if(b2Math.Abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * b2Settings.b2_linearSlop) {
      C2 = b2Math.Clamp(translation, -b2Settings.b2_maxLinearCorrection, b2Settings.b2_maxLinearCorrection);
      linearError = b2Math.Abs(translation);
      active = true
    }else {
      if(translation <= this.m_lowerTranslation) {
        C2 = b2Math.Clamp(translation - this.m_lowerTranslation + b2Settings.b2_linearSlop, -b2Settings.b2_maxLinearCorrection, 0);
        linearError = this.m_lowerTranslation - translation;
        active = true
      }else {
        if(translation >= this.m_upperTranslation) {
          C2 = b2Math.Clamp(translation - this.m_upperTranslation + b2Settings.b2_linearSlop, 0, b2Settings.b2_maxLinearCorrection);
          linearError = translation - this.m_upperTranslation;
          active = true
        }
      }
    }
  }
  this.m_perp = b2Math.MulMV(R1, this.m_localYAxis1);
  this.m_s1 = (dX + r1X) * this.m_perp.y - (dY + r1Y) * this.m_perp.x;
  this.m_s2 = r2X * this.m_perp.y - r2Y * this.m_perp.x;
  var impulse = new b2Vec2;
  var C1 = this.m_perp.x * dX + this.m_perp.y * dY;
  linearError = b2Math.Max(linearError, b2Math.Abs(C1));
  angularError = 0;
  if(active) {
    m1 = this.m_invMassA;
    m2 = this.m_invMassB;
    i1 = this.m_invIA;
    i2 = this.m_invIB;
    this.m_K.col1.x = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
    this.m_K.col1.y = i1 * this.m_s1 * this.m_a1 + i2 * this.m_s2 * this.m_a2;
    this.m_K.col2.x = this.m_K.col1.y;
    this.m_K.col2.y = m1 + m2 + i1 * this.m_a1 * this.m_a1 + i2 * this.m_a2 * this.m_a2;
    this.m_K.Solve(impulse, -C1, -C2)
  }else {
    m1 = this.m_invMassA;
    m2 = this.m_invMassB;
    i1 = this.m_invIA;
    i2 = this.m_invIB;
    var k11 = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
    var impulse1;
    if(k11 != 0) {
      impulse1 = -C1 / k11
    }else {
      impulse1 = 0
    }
    impulse.x = impulse1;
    impulse.y = 0
  }
  var PX = impulse.x * this.m_perp.x + impulse.y * this.m_axis.x;
  var PY = impulse.x * this.m_perp.y + impulse.y * this.m_axis.y;
  var L1 = impulse.x * this.m_s1 + impulse.y * this.m_a1;
  var L2 = impulse.x * this.m_s2 + impulse.y * this.m_a2;
  c1.x -= this.m_invMassA * PX;
  c1.y -= this.m_invMassA * PY;
  a1 -= this.m_invIA * L1;
  c2.x += this.m_invMassB * PX;
  c2.y += this.m_invMassB * PY;
  a2 += this.m_invIB * L2;
  bA.m_sweep.a = a1;
  bB.m_sweep.a = a2;
  bA.SynchronizeTransform();
  bB.SynchronizeTransform();
  return linearError <= b2Settings.b2_linearSlop && angularError <= b2Settings.b2_angularSlop
};
b2LineJoint.prototype.GetAnchorA = function() {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
};
b2LineJoint.prototype.GetAnchorB = function() {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
};
b2LineJoint.prototype.GetReactionForce = function(inv_dt) {
  return new b2Vec2(inv_dt * (this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.x), inv_dt * (this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.y))
};
b2LineJoint.prototype.GetReactionTorque = function(inv_dt) {
  return inv_dt * this.m_impulse.y
};
b2LineJoint.prototype.GetJointTranslation = function() {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  var p1 = bA.GetWorldPoint(this.m_localAnchor1);
  var p2 = bB.GetWorldPoint(this.m_localAnchor2);
  var dX = p2.x - p1.x;
  var dY = p2.y - p1.y;
  var axis = bA.GetWorldVector(this.m_localXAxis1);
  var translation = axis.x * dX + axis.y * dY;
  return translation
};
b2LineJoint.prototype.GetJointSpeed = function() {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  var tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var p1X = bA.m_sweep.c.x + r1X;
  var p1Y = bA.m_sweep.c.y + r1Y;
  var p2X = bB.m_sweep.c.x + r2X;
  var p2Y = bB.m_sweep.c.y + r2Y;
  var dX = p2X - p1X;
  var dY = p2Y - p1Y;
  var axis = bA.GetWorldVector(this.m_localXAxis1);
  var v1 = bA.m_linearVelocity;
  var v2 = bB.m_linearVelocity;
  var w1 = bA.m_angularVelocity;
  var w2 = bB.m_angularVelocity;
  var speed = dX * -w1 * axis.y + dY * w1 * axis.x + (axis.x * (v2.x + -w2 * r2Y - v1.x - -w1 * r1Y) + axis.y * (v2.y + w2 * r2X - v1.y - w1 * r1X));
  return speed
};
b2LineJoint.prototype.IsLimitEnabled = function() {
  return this.m_enableLimit
};
b2LineJoint.prototype.EnableLimit = function(flag) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_enableLimit = flag
};
b2LineJoint.prototype.GetLowerLimit = function() {
  return this.m_lowerTranslation
};
b2LineJoint.prototype.GetUpperLimit = function() {
  return this.m_upperTranslation
};
b2LineJoint.prototype.SetLimits = function(lower, upper) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_lowerTranslation = lower;
  this.m_upperTranslation = upper
};
b2LineJoint.prototype.IsMotorEnabled = function() {
  return this.m_enableMotor
};
b2LineJoint.prototype.EnableMotor = function(flag) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_enableMotor = flag
};
b2LineJoint.prototype.SetMotorSpeed = function(speed) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_motorSpeed = speed
};
b2LineJoint.prototype.GetMotorSpeed = function() {
  return this.m_motorSpeed
};
b2LineJoint.prototype.SetMaxMotorForce = function(force) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_maxMotorForce = force
};
b2LineJoint.prototype.GetMaxMotorForce = function() {
  return this.m_maxMotorForce
};
b2LineJoint.prototype.GetMotorForce = function() {
  return this.m_motorImpulse
};
b2LineJoint.prototype.m_localAnchor1 = new b2Vec2;
b2LineJoint.prototype.m_localAnchor2 = new b2Vec2;
b2LineJoint.prototype.m_localXAxis1 = new b2Vec2;
b2LineJoint.prototype.m_localYAxis1 = new b2Vec2;
b2LineJoint.prototype.m_axis = new b2Vec2;
b2LineJoint.prototype.m_perp = new b2Vec2;
b2LineJoint.prototype.m_s1 = null;
b2LineJoint.prototype.m_s2 = null;
b2LineJoint.prototype.m_a1 = null;
b2LineJoint.prototype.m_a2 = null;
b2LineJoint.prototype.m_K = new b2Mat22;
b2LineJoint.prototype.m_impulse = new b2Vec2;
b2LineJoint.prototype.m_motorMass = null;
b2LineJoint.prototype.m_motorImpulse = null;
b2LineJoint.prototype.m_lowerTranslation = null;
b2LineJoint.prototype.m_upperTranslation = null;
b2LineJoint.prototype.m_maxMotorForce = null;
b2LineJoint.prototype.m_motorSpeed = null;
b2LineJoint.prototype.m_enableLimit = null;
b2LineJoint.prototype.m_enableMotor = null;
b2LineJoint.prototype.m_limitState = 0;var b2ContactSolver = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactSolver.prototype.__constructor = function() {
};
b2ContactSolver.prototype.__varz = function() {
  this.m_step = new b2TimeStep;
  this.m_constraints = new Array
};
b2ContactSolver.s_worldManifold = new b2WorldManifold;
b2ContactSolver.s_psm = new b2PositionSolverManifold;
b2ContactSolver.prototype.Initialize = function(step, contacts, contactCount, allocator) {
  var contact;
  this.m_step.Set(step);
  this.m_allocator = allocator;
  var i = 0;
  var tVec;
  var tMat;
  this.m_constraintCount = contactCount;
  while(this.m_constraints.length < this.m_constraintCount) {
    this.m_constraints[this.m_constraints.length] = new b2ContactConstraint
  }
  for(i = 0;i < contactCount;++i) {
    contact = contacts[i];
    var fixtureA = contact.m_fixtureA;
    var fixtureB = contact.m_fixtureB;
    var shapeA = fixtureA.m_shape;
    var shapeB = fixtureB.m_shape;
    var radiusA = shapeA.m_radius;
    var radiusB = shapeB.m_radius;
    var bodyA = fixtureA.m_body;
    var bodyB = fixtureB.m_body;
    var manifold = contact.GetManifold();
    var friction = b2Settings.b2MixFriction(fixtureA.GetFriction(), fixtureB.GetFriction());
    var restitution = b2Settings.b2MixRestitution(fixtureA.GetRestitution(), fixtureB.GetRestitution());
    var vAX = bodyA.m_linearVelocity.x;
    var vAY = bodyA.m_linearVelocity.y;
    var vBX = bodyB.m_linearVelocity.x;
    var vBY = bodyB.m_linearVelocity.y;
    var wA = bodyA.m_angularVelocity;
    var wB = bodyB.m_angularVelocity;
    b2Settings.b2Assert(manifold.m_pointCount > 0);
    b2ContactSolver.s_worldManifold.Initialize(manifold, bodyA.m_xf, radiusA, bodyB.m_xf, radiusB);
    var normalX = b2ContactSolver.s_worldManifold.m_normal.x;
    var normalY = b2ContactSolver.s_worldManifold.m_normal.y;
    var cc = this.m_constraints[i];
    cc.bodyA = bodyA;
    cc.bodyB = bodyB;
    cc.manifold = manifold;
    cc.normal.x = normalX;
    cc.normal.y = normalY;
    cc.pointCount = manifold.m_pointCount;
    cc.friction = friction;
    cc.restitution = restitution;
    cc.localPlaneNormal.x = manifold.m_localPlaneNormal.x;
    cc.localPlaneNormal.y = manifold.m_localPlaneNormal.y;
    cc.localPoint.x = manifold.m_localPoint.x;
    cc.localPoint.y = manifold.m_localPoint.y;
    cc.radius = radiusA + radiusB;
    cc.type = manifold.m_type;
    for(var k = 0;k < cc.pointCount;++k) {
      var cp = manifold.m_points[k];
      var ccp = cc.points[k];
      ccp.normalImpulse = cp.m_normalImpulse;
      ccp.tangentImpulse = cp.m_tangentImpulse;
      ccp.localPoint.SetV(cp.m_localPoint);
      var rAX = ccp.rA.x = b2ContactSolver.s_worldManifold.m_points[k].x - bodyA.m_sweep.c.x;
      var rAY = ccp.rA.y = b2ContactSolver.s_worldManifold.m_points[k].y - bodyA.m_sweep.c.y;
      var rBX = ccp.rB.x = b2ContactSolver.s_worldManifold.m_points[k].x - bodyB.m_sweep.c.x;
      var rBY = ccp.rB.y = b2ContactSolver.s_worldManifold.m_points[k].y - bodyB.m_sweep.c.y;
      var rnA = rAX * normalY - rAY * normalX;
      var rnB = rBX * normalY - rBY * normalX;
      rnA *= rnA;
      rnB *= rnB;
      var kNormal = bodyA.m_invMass + bodyB.m_invMass + bodyA.m_invI * rnA + bodyB.m_invI * rnB;
      ccp.normalMass = 1 / kNormal;
      var kEqualized = bodyA.m_mass * bodyA.m_invMass + bodyB.m_mass * bodyB.m_invMass;
      kEqualized += bodyA.m_mass * bodyA.m_invI * rnA + bodyB.m_mass * bodyB.m_invI * rnB;
      ccp.equalizedMass = 1 / kEqualized;
      var tangentX = normalY;
      var tangentY = -normalX;
      var rtA = rAX * tangentY - rAY * tangentX;
      var rtB = rBX * tangentY - rBY * tangentX;
      rtA *= rtA;
      rtB *= rtB;
      var kTangent = bodyA.m_invMass + bodyB.m_invMass + bodyA.m_invI * rtA + bodyB.m_invI * rtB;
      ccp.tangentMass = 1 / kTangent;
      ccp.velocityBias = 0;
      var tX = vBX + -wB * rBY - vAX - -wA * rAY;
      var tY = vBY + wB * rBX - vAY - wA * rAX;
      var vRel = cc.normal.x * tX + cc.normal.y * tY;
      if(vRel < -b2Settings.b2_velocityThreshold) {
        ccp.velocityBias += -cc.restitution * vRel
      }
    }
    if(cc.pointCount == 2) {
      var ccp1 = cc.points[0];
      var ccp2 = cc.points[1];
      var invMassA = bodyA.m_invMass;
      var invIA = bodyA.m_invI;
      var invMassB = bodyB.m_invMass;
      var invIB = bodyB.m_invI;
      var rn1A = ccp1.rA.x * normalY - ccp1.rA.y * normalX;
      var rn1B = ccp1.rB.x * normalY - ccp1.rB.y * normalX;
      var rn2A = ccp2.rA.x * normalY - ccp2.rA.y * normalX;
      var rn2B = ccp2.rB.x * normalY - ccp2.rB.y * normalX;
      var k11 = invMassA + invMassB + invIA * rn1A * rn1A + invIB * rn1B * rn1B;
      var k22 = invMassA + invMassB + invIA * rn2A * rn2A + invIB * rn2B * rn2B;
      var k12 = invMassA + invMassB + invIA * rn1A * rn2A + invIB * rn1B * rn2B;
      var k_maxConditionNumber = 100;
      if(k11 * k11 < k_maxConditionNumber * (k11 * k22 - k12 * k12)) {
        cc.K.col1.Set(k11, k12);
        cc.K.col2.Set(k12, k22);
        cc.K.GetInverse(cc.normalMass)
      }else {
        cc.pointCount = 1
      }
    }
  }
};
b2ContactSolver.prototype.InitVelocityConstraints = function(step) {
  var tVec;
  var tVec2;
  var tMat;
  for(var i = 0;i < this.m_constraintCount;++i) {
    var c = this.m_constraints[i];
    var bodyA = c.bodyA;
    var bodyB = c.bodyB;
    var invMassA = bodyA.m_invMass;
    var invIA = bodyA.m_invI;
    var invMassB = bodyB.m_invMass;
    var invIB = bodyB.m_invI;
    var normalX = c.normal.x;
    var normalY = c.normal.y;
    var tangentX = normalY;
    var tangentY = -normalX;
    var tX;
    var j = 0;
    var tCount = 0;
    if(step.warmStarting) {
      tCount = c.pointCount;
      for(j = 0;j < tCount;++j) {
        var ccp = c.points[j];
        ccp.normalImpulse *= step.dtRatio;
        ccp.tangentImpulse *= step.dtRatio;
        var PX = ccp.normalImpulse * normalX + ccp.tangentImpulse * tangentX;
        var PY = ccp.normalImpulse * normalY + ccp.tangentImpulse * tangentY;
        bodyA.m_angularVelocity -= invIA * (ccp.rA.x * PY - ccp.rA.y * PX);
        bodyA.m_linearVelocity.x -= invMassA * PX;
        bodyA.m_linearVelocity.y -= invMassA * PY;
        bodyB.m_angularVelocity += invIB * (ccp.rB.x * PY - ccp.rB.y * PX);
        bodyB.m_linearVelocity.x += invMassB * PX;
        bodyB.m_linearVelocity.y += invMassB * PY
      }
    }else {
      tCount = c.pointCount;
      for(j = 0;j < tCount;++j) {
        var ccp2 = c.points[j];
        ccp2.normalImpulse = 0;
        ccp2.tangentImpulse = 0
      }
    }
  }
};
b2ContactSolver.prototype.SolveVelocityConstraints = function() {
  var j = 0;
  var ccp;
  var rAX;
  var rAY;
  var rBX;
  var rBY;
  var dvX;
  var dvY;
  var vn;
  var vt;
  var lambda;
  var maxFriction;
  var newImpulse;
  var PX;
  var PY;
  var dX;
  var dY;
  var P1X;
  var P1Y;
  var P2X;
  var P2Y;
  var tMat;
  var tVec;
  for(var i = 0;i < this.m_constraintCount;++i) {
    var c = this.m_constraints[i];
    var bodyA = c.bodyA;
    var bodyB = c.bodyB;
    var wA = bodyA.m_angularVelocity;
    var wB = bodyB.m_angularVelocity;
    var vA = bodyA.m_linearVelocity;
    var vB = bodyB.m_linearVelocity;
    var invMassA = bodyA.m_invMass;
    var invIA = bodyA.m_invI;
    var invMassB = bodyB.m_invMass;
    var invIB = bodyB.m_invI;
    var normalX = c.normal.x;
    var normalY = c.normal.y;
    var tangentX = normalY;
    var tangentY = -normalX;
    var friction = c.friction;
    var tX;
    for(j = 0;j < c.pointCount;j++) {
      ccp = c.points[j];
      dvX = vB.x - wB * ccp.rB.y - vA.x + wA * ccp.rA.y;
      dvY = vB.y + wB * ccp.rB.x - vA.y - wA * ccp.rA.x;
      vt = dvX * tangentX + dvY * tangentY;
      lambda = ccp.tangentMass * -vt;
      maxFriction = friction * ccp.normalImpulse;
      newImpulse = b2Math.Clamp(ccp.tangentImpulse + lambda, -maxFriction, maxFriction);
      lambda = newImpulse - ccp.tangentImpulse;
      PX = lambda * tangentX;
      PY = lambda * tangentY;
      vA.x -= invMassA * PX;
      vA.y -= invMassA * PY;
      wA -= invIA * (ccp.rA.x * PY - ccp.rA.y * PX);
      vB.x += invMassB * PX;
      vB.y += invMassB * PY;
      wB += invIB * (ccp.rB.x * PY - ccp.rB.y * PX);
      ccp.tangentImpulse = newImpulse
    }
    var tCount = c.pointCount;
    if(c.pointCount == 1) {
      ccp = c.points[0];
      dvX = vB.x + -wB * ccp.rB.y - vA.x - -wA * ccp.rA.y;
      dvY = vB.y + wB * ccp.rB.x - vA.y - wA * ccp.rA.x;
      vn = dvX * normalX + dvY * normalY;
      lambda = -ccp.normalMass * (vn - ccp.velocityBias);
      newImpulse = ccp.normalImpulse + lambda;
      newImpulse = newImpulse > 0 ? newImpulse : 0;
      lambda = newImpulse - ccp.normalImpulse;
      PX = lambda * normalX;
      PY = lambda * normalY;
      vA.x -= invMassA * PX;
      vA.y -= invMassA * PY;
      wA -= invIA * (ccp.rA.x * PY - ccp.rA.y * PX);
      vB.x += invMassB * PX;
      vB.y += invMassB * PY;
      wB += invIB * (ccp.rB.x * PY - ccp.rB.y * PX);
      ccp.normalImpulse = newImpulse
    }else {
      var cp1 = c.points[0];
      var cp2 = c.points[1];
      var aX = cp1.normalImpulse;
      var aY = cp2.normalImpulse;
      var dv1X = vB.x - wB * cp1.rB.y - vA.x + wA * cp1.rA.y;
      var dv1Y = vB.y + wB * cp1.rB.x - vA.y - wA * cp1.rA.x;
      var dv2X = vB.x - wB * cp2.rB.y - vA.x + wA * cp2.rA.y;
      var dv2Y = vB.y + wB * cp2.rB.x - vA.y - wA * cp2.rA.x;
      var vn1 = dv1X * normalX + dv1Y * normalY;
      var vn2 = dv2X * normalX + dv2Y * normalY;
      var bX = vn1 - cp1.velocityBias;
      var bY = vn2 - cp2.velocityBias;
      tMat = c.K;
      bX -= tMat.col1.x * aX + tMat.col2.x * aY;
      bY -= tMat.col1.y * aX + tMat.col2.y * aY;
      var k_errorTol = 0.0010;
      for(;;) {
        tMat = c.normalMass;
        var xX = -(tMat.col1.x * bX + tMat.col2.x * bY);
        var xY = -(tMat.col1.y * bX + tMat.col2.y * bY);
        if(xX >= 0 && xY >= 0) {
          dX = xX - aX;
          dY = xY - aY;
          P1X = dX * normalX;
          P1Y = dX * normalY;
          P2X = dY * normalX;
          P2Y = dY * normalY;
          vA.x -= invMassA * (P1X + P2X);
          vA.y -= invMassA * (P1Y + P2Y);
          wA -= invIA * (cp1.rA.x * P1Y - cp1.rA.y * P1X + cp2.rA.x * P2Y - cp2.rA.y * P2X);
          vB.x += invMassB * (P1X + P2X);
          vB.y += invMassB * (P1Y + P2Y);
          wB += invIB * (cp1.rB.x * P1Y - cp1.rB.y * P1X + cp2.rB.x * P2Y - cp2.rB.y * P2X);
          cp1.normalImpulse = xX;
          cp2.normalImpulse = xY;
          break
        }
        xX = -cp1.normalMass * bX;
        xY = 0;
        vn1 = 0;
        vn2 = c.K.col1.y * xX + bY;
        if(xX >= 0 && vn2 >= 0) {
          dX = xX - aX;
          dY = xY - aY;
          P1X = dX * normalX;
          P1Y = dX * normalY;
          P2X = dY * normalX;
          P2Y = dY * normalY;
          vA.x -= invMassA * (P1X + P2X);
          vA.y -= invMassA * (P1Y + P2Y);
          wA -= invIA * (cp1.rA.x * P1Y - cp1.rA.y * P1X + cp2.rA.x * P2Y - cp2.rA.y * P2X);
          vB.x += invMassB * (P1X + P2X);
          vB.y += invMassB * (P1Y + P2Y);
          wB += invIB * (cp1.rB.x * P1Y - cp1.rB.y * P1X + cp2.rB.x * P2Y - cp2.rB.y * P2X);
          cp1.normalImpulse = xX;
          cp2.normalImpulse = xY;
          break
        }
        xX = 0;
        xY = -cp2.normalMass * bY;
        vn1 = c.K.col2.x * xY + bX;
        vn2 = 0;
        if(xY >= 0 && vn1 >= 0) {
          dX = xX - aX;
          dY = xY - aY;
          P1X = dX * normalX;
          P1Y = dX * normalY;
          P2X = dY * normalX;
          P2Y = dY * normalY;
          vA.x -= invMassA * (P1X + P2X);
          vA.y -= invMassA * (P1Y + P2Y);
          wA -= invIA * (cp1.rA.x * P1Y - cp1.rA.y * P1X + cp2.rA.x * P2Y - cp2.rA.y * P2X);
          vB.x += invMassB * (P1X + P2X);
          vB.y += invMassB * (P1Y + P2Y);
          wB += invIB * (cp1.rB.x * P1Y - cp1.rB.y * P1X + cp2.rB.x * P2Y - cp2.rB.y * P2X);
          cp1.normalImpulse = xX;
          cp2.normalImpulse = xY;
          break
        }
        xX = 0;
        xY = 0;
        vn1 = bX;
        vn2 = bY;
        if(vn1 >= 0 && vn2 >= 0) {
          dX = xX - aX;
          dY = xY - aY;
          P1X = dX * normalX;
          P1Y = dX * normalY;
          P2X = dY * normalX;
          P2Y = dY * normalY;
          vA.x -= invMassA * (P1X + P2X);
          vA.y -= invMassA * (P1Y + P2Y);
          wA -= invIA * (cp1.rA.x * P1Y - cp1.rA.y * P1X + cp2.rA.x * P2Y - cp2.rA.y * P2X);
          vB.x += invMassB * (P1X + P2X);
          vB.y += invMassB * (P1Y + P2Y);
          wB += invIB * (cp1.rB.x * P1Y - cp1.rB.y * P1X + cp2.rB.x * P2Y - cp2.rB.y * P2X);
          cp1.normalImpulse = xX;
          cp2.normalImpulse = xY;
          break
        }
        break
      }
    }
    bodyA.m_angularVelocity = wA;
    bodyB.m_angularVelocity = wB
  }
};
b2ContactSolver.prototype.FinalizeVelocityConstraints = function() {
  for(var i = 0;i < this.m_constraintCount;++i) {
    var c = this.m_constraints[i];
    var m = c.manifold;
    for(var j = 0;j < c.pointCount;++j) {
      var point1 = m.m_points[j];
      var point2 = c.points[j];
      point1.m_normalImpulse = point2.normalImpulse;
      point1.m_tangentImpulse = point2.tangentImpulse
    }
  }
};
b2ContactSolver.prototype.SolvePositionConstraints = function(baumgarte) {
  var minSeparation = 0;
  for(var i = 0;i < this.m_constraintCount;i++) {
    var c = this.m_constraints[i];
    var bodyA = c.bodyA;
    var bodyB = c.bodyB;
    var invMassA = bodyA.m_mass * bodyA.m_invMass;
    var invIA = bodyA.m_mass * bodyA.m_invI;
    var invMassB = bodyB.m_mass * bodyB.m_invMass;
    var invIB = bodyB.m_mass * bodyB.m_invI;
    b2ContactSolver.s_psm.Initialize(c);
    var normal = b2ContactSolver.s_psm.m_normal;
    for(var j = 0;j < c.pointCount;j++) {
      var ccp = c.points[j];
      var point = b2ContactSolver.s_psm.m_points[j];
      var separation = b2ContactSolver.s_psm.m_separations[j];
      var rAX = point.x - bodyA.m_sweep.c.x;
      var rAY = point.y - bodyA.m_sweep.c.y;
      var rBX = point.x - bodyB.m_sweep.c.x;
      var rBY = point.y - bodyB.m_sweep.c.y;
      minSeparation = minSeparation < separation ? minSeparation : separation;
      var C = b2Math.Clamp(baumgarte * (separation + b2Settings.b2_linearSlop), -b2Settings.b2_maxLinearCorrection, 0);
      var impulse = -ccp.equalizedMass * C;
      var PX = impulse * normal.x;
      var PY = impulse * normal.y;
      bodyA.m_sweep.c.x -= invMassA * PX;
      bodyA.m_sweep.c.y -= invMassA * PY;
      bodyA.m_sweep.a -= invIA * (rAX * PY - rAY * PX);
      bodyA.SynchronizeTransform();
      bodyB.m_sweep.c.x += invMassB * PX;
      bodyB.m_sweep.c.y += invMassB * PY;
      bodyB.m_sweep.a += invIB * (rBX * PY - rBY * PX);
      bodyB.SynchronizeTransform()
    }
  }
  return minSeparation > -1.5 * b2Settings.b2_linearSlop
};
b2ContactSolver.prototype.m_step = new b2TimeStep;
b2ContactSolver.prototype.m_allocator = null;
b2ContactSolver.prototype.m_constraints = new Array;
b2ContactSolver.prototype.m_constraintCount = 0;var b2Simplex = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Simplex.prototype.__constructor = function() {
  this.m_vertices[0] = this.m_v1;
  this.m_vertices[1] = this.m_v2;
  this.m_vertices[2] = this.m_v3
};
b2Simplex.prototype.__varz = function() {
  this.m_v1 = new b2SimplexVertex;
  this.m_v2 = new b2SimplexVertex;
  this.m_v3 = new b2SimplexVertex;
  this.m_vertices = new Array(3)
};
b2Simplex.prototype.ReadCache = function(cache, proxyA, transformA, proxyB, transformB) {
  b2Settings.b2Assert(0 <= cache.count && cache.count <= 3);
  var wALocal;
  var wBLocal;
  this.m_count = cache.count;
  var vertices = this.m_vertices;
  for(var i = 0;i < this.m_count;i++) {
    var v = vertices[i];
    v.indexA = cache.indexA[i];
    v.indexB = cache.indexB[i];
    wALocal = proxyA.GetVertex(v.indexA);
    wBLocal = proxyB.GetVertex(v.indexB);
    v.wA = b2Math.MulX(transformA, wALocal);
    v.wB = b2Math.MulX(transformB, wBLocal);
    v.w = b2Math.SubtractVV(v.wB, v.wA);
    v.a = 0
  }
  if(this.m_count > 1) {
    var metric1 = cache.metric;
    var metric2 = this.GetMetric();
    if(metric2 < 0.5 * metric1 || 2 * metric1 < metric2 || metric2 < Number.MIN_VALUE) {
      this.m_count = 0
    }
  }
  if(this.m_count == 0) {
    v = vertices[0];
    v.indexA = 0;
    v.indexB = 0;
    wALocal = proxyA.GetVertex(0);
    wBLocal = proxyB.GetVertex(0);
    v.wA = b2Math.MulX(transformA, wALocal);
    v.wB = b2Math.MulX(transformB, wBLocal);
    v.w = b2Math.SubtractVV(v.wB, v.wA);
    this.m_count = 1
  }
};
b2Simplex.prototype.WriteCache = function(cache) {
  cache.metric = this.GetMetric();
  cache.count = parseInt(this.m_count);
  var vertices = this.m_vertices;
  for(var i = 0;i < this.m_count;i++) {
    cache.indexA[i] = parseInt(vertices[i].indexA);
    cache.indexB[i] = parseInt(vertices[i].indexB)
  }
};
b2Simplex.prototype.GetSearchDirection = function() {
  switch(this.m_count) {
    case 1:
      return this.m_v1.w.GetNegative();
    case 2:
      var e12 = b2Math.SubtractVV(this.m_v2.w, this.m_v1.w);
      var sgn = b2Math.CrossVV(e12, this.m_v1.w.GetNegative());
      if(sgn > 0) {
        return b2Math.CrossFV(1, e12)
      }else {
        return b2Math.CrossVF(e12, 1)
      }
    ;
    default:
      b2Settings.b2Assert(false);
      return new b2Vec2
  }
};
b2Simplex.prototype.GetClosestPoint = function() {
  switch(this.m_count) {
    case 0:
      b2Settings.b2Assert(false);
      return new b2Vec2;
    case 1:
      return this.m_v1.w;
    case 2:
      return new b2Vec2(this.m_v1.a * this.m_v1.w.x + this.m_v2.a * this.m_v2.w.x, this.m_v1.a * this.m_v1.w.y + this.m_v2.a * this.m_v2.w.y);
    default:
      b2Settings.b2Assert(false);
      return new b2Vec2
  }
};
b2Simplex.prototype.GetWitnessPoints = function(pA, pB) {
  switch(this.m_count) {
    case 0:
      b2Settings.b2Assert(false);
      break;
    case 1:
      pA.SetV(this.m_v1.wA);
      pB.SetV(this.m_v1.wB);
      break;
    case 2:
      pA.x = this.m_v1.a * this.m_v1.wA.x + this.m_v2.a * this.m_v2.wA.x;
      pA.y = this.m_v1.a * this.m_v1.wA.y + this.m_v2.a * this.m_v2.wA.y;
      pB.x = this.m_v1.a * this.m_v1.wB.x + this.m_v2.a * this.m_v2.wB.x;
      pB.y = this.m_v1.a * this.m_v1.wB.y + this.m_v2.a * this.m_v2.wB.y;
      break;
    case 3:
      pB.x = pA.x = this.m_v1.a * this.m_v1.wA.x + this.m_v2.a * this.m_v2.wA.x + this.m_v3.a * this.m_v3.wA.x;
      pB.y = pA.y = this.m_v1.a * this.m_v1.wA.y + this.m_v2.a * this.m_v2.wA.y + this.m_v3.a * this.m_v3.wA.y;
      break;
    default:
      b2Settings.b2Assert(false);
      break
  }
};
b2Simplex.prototype.GetMetric = function() {
  switch(this.m_count) {
    case 0:
      b2Settings.b2Assert(false);
      return 0;
    case 1:
      return 0;
    case 2:
      return b2Math.SubtractVV(this.m_v1.w, this.m_v2.w).Length();
    case 3:
      return b2Math.CrossVV(b2Math.SubtractVV(this.m_v2.w, this.m_v1.w), b2Math.SubtractVV(this.m_v3.w, this.m_v1.w));
    default:
      b2Settings.b2Assert(false);
      return 0
  }
};
b2Simplex.prototype.Solve2 = function() {
  var w1 = this.m_v1.w;
  var w2 = this.m_v2.w;
  var e12 = b2Math.SubtractVV(w2, w1);
  var d12_2 = -(w1.x * e12.x + w1.y * e12.y);
  if(d12_2 <= 0) {
    this.m_v1.a = 1;
    this.m_count = 1;
    return
  }
  var d12_1 = w2.x * e12.x + w2.y * e12.y;
  if(d12_1 <= 0) {
    this.m_v2.a = 1;
    this.m_count = 1;
    this.m_v1.Set(this.m_v2);
    return
  }
  var inv_d12 = 1 / (d12_1 + d12_2);
  this.m_v1.a = d12_1 * inv_d12;
  this.m_v2.a = d12_2 * inv_d12;
  this.m_count = 2
};
b2Simplex.prototype.Solve3 = function() {
  var w1 = this.m_v1.w;
  var w2 = this.m_v2.w;
  var w3 = this.m_v3.w;
  var e12 = b2Math.SubtractVV(w2, w1);
  var w1e12 = b2Math.Dot(w1, e12);
  var w2e12 = b2Math.Dot(w2, e12);
  var d12_1 = w2e12;
  var d12_2 = -w1e12;
  var e13 = b2Math.SubtractVV(w3, w1);
  var w1e13 = b2Math.Dot(w1, e13);
  var w3e13 = b2Math.Dot(w3, e13);
  var d13_1 = w3e13;
  var d13_2 = -w1e13;
  var e23 = b2Math.SubtractVV(w3, w2);
  var w2e23 = b2Math.Dot(w2, e23);
  var w3e23 = b2Math.Dot(w3, e23);
  var d23_1 = w3e23;
  var d23_2 = -w2e23;
  var n123 = b2Math.CrossVV(e12, e13);
  var d123_1 = n123 * b2Math.CrossVV(w2, w3);
  var d123_2 = n123 * b2Math.CrossVV(w3, w1);
  var d123_3 = n123 * b2Math.CrossVV(w1, w2);
  if(d12_2 <= 0 && d13_2 <= 0) {
    this.m_v1.a = 1;
    this.m_count = 1;
    return
  }
  if(d12_1 > 0 && d12_2 > 0 && d123_3 <= 0) {
    var inv_d12 = 1 / (d12_1 + d12_2);
    this.m_v1.a = d12_1 * inv_d12;
    this.m_v2.a = d12_2 * inv_d12;
    this.m_count = 2;
    return
  }
  if(d13_1 > 0 && d13_2 > 0 && d123_2 <= 0) {
    var inv_d13 = 1 / (d13_1 + d13_2);
    this.m_v1.a = d13_1 * inv_d13;
    this.m_v3.a = d13_2 * inv_d13;
    this.m_count = 2;
    this.m_v2.Set(this.m_v3);
    return
  }
  if(d12_1 <= 0 && d23_2 <= 0) {
    this.m_v2.a = 1;
    this.m_count = 1;
    this.m_v1.Set(this.m_v2);
    return
  }
  if(d13_1 <= 0 && d23_1 <= 0) {
    this.m_v3.a = 1;
    this.m_count = 1;
    this.m_v1.Set(this.m_v3);
    return
  }
  if(d23_1 > 0 && d23_2 > 0 && d123_1 <= 0) {
    var inv_d23 = 1 / (d23_1 + d23_2);
    this.m_v2.a = d23_1 * inv_d23;
    this.m_v3.a = d23_2 * inv_d23;
    this.m_count = 2;
    this.m_v1.Set(this.m_v3);
    return
  }
  var inv_d123 = 1 / (d123_1 + d123_2 + d123_3);
  this.m_v1.a = d123_1 * inv_d123;
  this.m_v2.a = d123_2 * inv_d123;
  this.m_v3.a = d123_3 * inv_d123;
  this.m_count = 3
};
b2Simplex.prototype.m_v1 = new b2SimplexVertex;
b2Simplex.prototype.m_v2 = new b2SimplexVertex;
b2Simplex.prototype.m_v3 = new b2SimplexVertex;
b2Simplex.prototype.m_vertices = new Array(3);
b2Simplex.prototype.m_count = 0;var b2WeldJoint = function() {
  b2Joint.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2WeldJoint.prototype, b2Joint.prototype);
b2WeldJoint.prototype._super = b2Joint.prototype;
b2WeldJoint.prototype.__constructor = function(def) {
  this._super.__constructor.apply(this, [def]);
  this.m_localAnchorA.SetV(def.localAnchorA);
  this.m_localAnchorB.SetV(def.localAnchorB);
  this.m_referenceAngle = def.referenceAngle;
  this.m_impulse.SetZero();
  this.m_mass = new b2Mat33
};
b2WeldJoint.prototype.__varz = function() {
  this.m_localAnchorA = new b2Vec2;
  this.m_localAnchorB = new b2Vec2;
  this.m_impulse = new b2Vec3;
  this.m_mass = new b2Mat33
};
b2WeldJoint.prototype.InitVelocityConstraints = function(step) {
  var tMat;
  var tX;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  tMat = bA.m_xf.R;
  var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
  var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * rAX + tMat.col2.x * rAY;
  rAY = tMat.col1.y * rAX + tMat.col2.y * rAY;
  rAX = tX;
  tMat = bB.m_xf.R;
  var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
  var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * rBX + tMat.col2.x * rBY;
  rBY = tMat.col1.y * rBX + tMat.col2.y * rBY;
  rBX = tX;
  var mA = bA.m_invMass;
  var mB = bB.m_invMass;
  var iA = bA.m_invI;
  var iB = bB.m_invI;
  this.m_mass.col1.x = mA + mB + rAY * rAY * iA + rBY * rBY * iB;
  this.m_mass.col2.x = -rAY * rAX * iA - rBY * rBX * iB;
  this.m_mass.col3.x = -rAY * iA - rBY * iB;
  this.m_mass.col1.y = this.m_mass.col2.x;
  this.m_mass.col2.y = mA + mB + rAX * rAX * iA + rBX * rBX * iB;
  this.m_mass.col3.y = rAX * iA + rBX * iB;
  this.m_mass.col1.z = this.m_mass.col3.x;
  this.m_mass.col2.z = this.m_mass.col3.y;
  this.m_mass.col3.z = iA + iB;
  if(step.warmStarting) {
    this.m_impulse.x *= step.dtRatio;
    this.m_impulse.y *= step.dtRatio;
    this.m_impulse.z *= step.dtRatio;
    bA.m_linearVelocity.x -= mA * this.m_impulse.x;
    bA.m_linearVelocity.y -= mA * this.m_impulse.y;
    bA.m_angularVelocity -= iA * (rAX * this.m_impulse.y - rAY * this.m_impulse.x + this.m_impulse.z);
    bB.m_linearVelocity.x += mB * this.m_impulse.x;
    bB.m_linearVelocity.y += mB * this.m_impulse.y;
    bB.m_angularVelocity += iB * (rBX * this.m_impulse.y - rBY * this.m_impulse.x + this.m_impulse.z)
  }else {
    this.m_impulse.SetZero()
  }
};
b2WeldJoint.prototype.SolveVelocityConstraints = function(step) {
  var tMat;
  var tX;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var vA = bA.m_linearVelocity;
  var wA = bA.m_angularVelocity;
  var vB = bB.m_linearVelocity;
  var wB = bB.m_angularVelocity;
  var mA = bA.m_invMass;
  var mB = bB.m_invMass;
  var iA = bA.m_invI;
  var iB = bB.m_invI;
  tMat = bA.m_xf.R;
  var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
  var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * rAX + tMat.col2.x * rAY;
  rAY = tMat.col1.y * rAX + tMat.col2.y * rAY;
  rAX = tX;
  tMat = bB.m_xf.R;
  var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
  var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * rBX + tMat.col2.x * rBY;
  rBY = tMat.col1.y * rBX + tMat.col2.y * rBY;
  rBX = tX;
  var Cdot1X = vB.x - wB * rBY - vA.x + wA * rAY;
  var Cdot1Y = vB.y + wB * rBX - vA.y - wA * rAX;
  var Cdot2 = wB - wA;
  var impulse = new b2Vec3;
  this.m_mass.Solve33(impulse, -Cdot1X, -Cdot1Y, -Cdot2);
  this.m_impulse.Add(impulse);
  vA.x -= mA * impulse.x;
  vA.y -= mA * impulse.y;
  wA -= iA * (rAX * impulse.y - rAY * impulse.x + impulse.z);
  vB.x += mB * impulse.x;
  vB.y += mB * impulse.y;
  wB += iB * (rBX * impulse.y - rBY * impulse.x + impulse.z);
  bA.m_angularVelocity = wA;
  bB.m_angularVelocity = wB
};
b2WeldJoint.prototype.SolvePositionConstraints = function(baumgarte) {
  var tMat;
  var tX;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  tMat = bA.m_xf.R;
  var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
  var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * rAX + tMat.col2.x * rAY;
  rAY = tMat.col1.y * rAX + tMat.col2.y * rAY;
  rAX = tX;
  tMat = bB.m_xf.R;
  var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
  var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * rBX + tMat.col2.x * rBY;
  rBY = tMat.col1.y * rBX + tMat.col2.y * rBY;
  rBX = tX;
  var mA = bA.m_invMass;
  var mB = bB.m_invMass;
  var iA = bA.m_invI;
  var iB = bB.m_invI;
  var C1X = bB.m_sweep.c.x + rBX - bA.m_sweep.c.x - rAX;
  var C1Y = bB.m_sweep.c.y + rBY - bA.m_sweep.c.y - rAY;
  var C2 = bB.m_sweep.a - bA.m_sweep.a - this.m_referenceAngle;
  var k_allowedStretch = 10 * b2Settings.b2_linearSlop;
  var positionError = Math.sqrt(C1X * C1X + C1Y * C1Y);
  var angularError = b2Math.Abs(C2);
  if(positionError > k_allowedStretch) {
    iA *= 1;
    iB *= 1
  }
  this.m_mass.col1.x = mA + mB + rAY * rAY * iA + rBY * rBY * iB;
  this.m_mass.col2.x = -rAY * rAX * iA - rBY * rBX * iB;
  this.m_mass.col3.x = -rAY * iA - rBY * iB;
  this.m_mass.col1.y = this.m_mass.col2.x;
  this.m_mass.col2.y = mA + mB + rAX * rAX * iA + rBX * rBX * iB;
  this.m_mass.col3.y = rAX * iA + rBX * iB;
  this.m_mass.col1.z = this.m_mass.col3.x;
  this.m_mass.col2.z = this.m_mass.col3.y;
  this.m_mass.col3.z = iA + iB;
  var impulse = new b2Vec3;
  this.m_mass.Solve33(impulse, -C1X, -C1Y, -C2);
  bA.m_sweep.c.x -= mA * impulse.x;
  bA.m_sweep.c.y -= mA * impulse.y;
  bA.m_sweep.a -= iA * (rAX * impulse.y - rAY * impulse.x + impulse.z);
  bB.m_sweep.c.x += mB * impulse.x;
  bB.m_sweep.c.y += mB * impulse.y;
  bB.m_sweep.a += iB * (rBX * impulse.y - rBY * impulse.x + impulse.z);
  bA.SynchronizeTransform();
  bB.SynchronizeTransform();
  return positionError <= b2Settings.b2_linearSlop && angularError <= b2Settings.b2_angularSlop
};
b2WeldJoint.prototype.GetAnchorA = function() {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchorA)
};
b2WeldJoint.prototype.GetAnchorB = function() {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchorB)
};
b2WeldJoint.prototype.GetReactionForce = function(inv_dt) {
  return new b2Vec2(inv_dt * this.m_impulse.x, inv_dt * this.m_impulse.y)
};
b2WeldJoint.prototype.GetReactionTorque = function(inv_dt) {
  return inv_dt * this.m_impulse.z
};
b2WeldJoint.prototype.m_localAnchorA = new b2Vec2;
b2WeldJoint.prototype.m_localAnchorB = new b2Vec2;
b2WeldJoint.prototype.m_referenceAngle = null;
b2WeldJoint.prototype.m_impulse = new b2Vec3;
b2WeldJoint.prototype.m_mass = new b2Mat33;var b2Math = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Math.prototype.__constructor = function() {
};
b2Math.prototype.__varz = function() {
};
b2Math.IsValid = function(x) {
  return isFinite(x)
};
b2Math.Dot = function(a, b) {
  return a.x * b.x + a.y * b.y
};
b2Math.CrossVV = function(a, b) {
  return a.x * b.y - a.y * b.x
};
b2Math.CrossVF = function(a, s) {
  var v = new b2Vec2(s * a.y, -s * a.x);
  return v
};
b2Math.CrossFV = function(s, a) {
  var v = new b2Vec2(-s * a.y, s * a.x);
  return v
};
b2Math.MulMV = function(A, v) {
  var u = new b2Vec2(A.col1.x * v.x + A.col2.x * v.y, A.col1.y * v.x + A.col2.y * v.y);
  return u
};
b2Math.MulTMV = function(A, v) {
  var u = new b2Vec2(b2Math.Dot(v, A.col1), b2Math.Dot(v, A.col2));
  return u
};
b2Math.MulX = function(T, v) {
  var a = b2Math.MulMV(T.R, v);
  a.x += T.position.x;
  a.y += T.position.y;
  return a
};
b2Math.MulXT = function(T, v) {
  var a = b2Math.SubtractVV(v, T.position);
  var tX = a.x * T.R.col1.x + a.y * T.R.col1.y;
  a.y = a.x * T.R.col2.x + a.y * T.R.col2.y;
  a.x = tX;
  return a
};
b2Math.AddVV = function(a, b) {
  var v = new b2Vec2(a.x + b.x, a.y + b.y);
  return v
};
b2Math.SubtractVV = function(a, b) {
  var v = new b2Vec2(a.x - b.x, a.y - b.y);
  return v
};
b2Math.Distance = function(a, b) {
  var cX = a.x - b.x;
  var cY = a.y - b.y;
  return Math.sqrt(cX * cX + cY * cY)
};
b2Math.DistanceSquared = function(a, b) {
  var cX = a.x - b.x;
  var cY = a.y - b.y;
  return cX * cX + cY * cY
};
b2Math.MulFV = function(s, a) {
  var v = new b2Vec2(s * a.x, s * a.y);
  return v
};
b2Math.AddMM = function(A, B) {
  var C = b2Mat22.FromVV(b2Math.AddVV(A.col1, B.col1), b2Math.AddVV(A.col2, B.col2));
  return C
};
b2Math.MulMM = function(A, B) {
  var C = b2Mat22.FromVV(b2Math.MulMV(A, B.col1), b2Math.MulMV(A, B.col2));
  return C
};
b2Math.MulTMM = function(A, B) {
  var c1 = new b2Vec2(b2Math.Dot(A.col1, B.col1), b2Math.Dot(A.col2, B.col1));
  var c2 = new b2Vec2(b2Math.Dot(A.col1, B.col2), b2Math.Dot(A.col2, B.col2));
  var C = b2Mat22.FromVV(c1, c2);
  return C
};
b2Math.Abs = function(a) {
  return a > 0 ? a : -a
};
b2Math.AbsV = function(a) {
  var b = new b2Vec2(b2Math.Abs(a.x), b2Math.Abs(a.y));
  return b
};
b2Math.AbsM = function(A) {
  var B = b2Mat22.FromVV(b2Math.AbsV(A.col1), b2Math.AbsV(A.col2));
  return B
};
b2Math.Min = function(a, b) {
  return a < b ? a : b
};
b2Math.MinV = function(a, b) {
  var c = new b2Vec2(b2Math.Min(a.x, b.x), b2Math.Min(a.y, b.y));
  return c
};
b2Math.Max = function(a, b) {
  return a > b ? a : b
};
b2Math.MaxV = function(a, b) {
  var c = new b2Vec2(b2Math.Max(a.x, b.x), b2Math.Max(a.y, b.y));
  return c
};
b2Math.Clamp = function(a, low, high) {
  return a < low ? low : a > high ? high : a
};
b2Math.ClampV = function(a, low, high) {
  return b2Math.MaxV(low, b2Math.MinV(a, high))
};
b2Math.Swap = function(a, b) {
  var tmp = a[0];
  a[0] = b[0];
  b[0] = tmp
};
b2Math.Random = function() {
  return Math.random() * 2 - 1
};
b2Math.RandomRange = function(lo, hi) {
  var r = Math.random();
  r = (hi - lo) * r + lo;
  return r
};
b2Math.NextPowerOfTwo = function(x) {
  x |= x >> 1 & 2147483647;
  x |= x >> 2 & 1073741823;
  x |= x >> 4 & 268435455;
  x |= x >> 8 & 16777215;
  x |= x >> 16 & 65535;
  return x + 1
};
b2Math.IsPowerOfTwo = function(x) {
  var result = x > 0 && (x & x - 1) == 0;
  return result
};
b2Math.b2Vec2_zero = new b2Vec2(0, 0);
b2Math.b2Mat22_identity = b2Mat22.FromVV(new b2Vec2(1, 0), new b2Vec2(0, 1));
b2Math.b2Transform_identity = new b2Transform(b2Math.b2Vec2_zero, b2Math.b2Mat22_identity);var b2PulleyJoint = function() {
  b2Joint.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2PulleyJoint.prototype, b2Joint.prototype);
b2PulleyJoint.prototype._super = b2Joint.prototype;
b2PulleyJoint.prototype.__constructor = function(def) {
  this._super.__constructor.apply(this, [def]);
  var tMat;
  var tX;
  var tY;
  this.m_ground = this.m_bodyA.m_world.m_groundBody;
  this.m_groundAnchor1.x = def.groundAnchorA.x - this.m_ground.m_xf.position.x;
  this.m_groundAnchor1.y = def.groundAnchorA.y - this.m_ground.m_xf.position.y;
  this.m_groundAnchor2.x = def.groundAnchorB.x - this.m_ground.m_xf.position.x;
  this.m_groundAnchor2.y = def.groundAnchorB.y - this.m_ground.m_xf.position.y;
  this.m_localAnchor1.SetV(def.localAnchorA);
  this.m_localAnchor2.SetV(def.localAnchorB);
  this.m_ratio = def.ratio;
  this.m_constant = def.lengthA + this.m_ratio * def.lengthB;
  this.m_maxLength1 = b2Math.Min(def.maxLengthA, this.m_constant - this.m_ratio * b2PulleyJoint.b2_minPulleyLength);
  this.m_maxLength2 = b2Math.Min(def.maxLengthB, (this.m_constant - b2PulleyJoint.b2_minPulleyLength) / this.m_ratio);
  this.m_impulse = 0;
  this.m_limitImpulse1 = 0;
  this.m_limitImpulse2 = 0
};
b2PulleyJoint.prototype.__varz = function() {
  this.m_groundAnchor1 = new b2Vec2;
  this.m_groundAnchor2 = new b2Vec2;
  this.m_localAnchor1 = new b2Vec2;
  this.m_localAnchor2 = new b2Vec2;
  this.m_u1 = new b2Vec2;
  this.m_u2 = new b2Vec2
};
b2PulleyJoint.b2_minPulleyLength = 2;
b2PulleyJoint.prototype.InitVelocityConstraints = function(step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  var tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var p1X = bA.m_sweep.c.x + r1X;
  var p1Y = bA.m_sweep.c.y + r1Y;
  var p2X = bB.m_sweep.c.x + r2X;
  var p2Y = bB.m_sweep.c.y + r2Y;
  var s1X = this.m_ground.m_xf.position.x + this.m_groundAnchor1.x;
  var s1Y = this.m_ground.m_xf.position.y + this.m_groundAnchor1.y;
  var s2X = this.m_ground.m_xf.position.x + this.m_groundAnchor2.x;
  var s2Y = this.m_ground.m_xf.position.y + this.m_groundAnchor2.y;
  this.m_u1.Set(p1X - s1X, p1Y - s1Y);
  this.m_u2.Set(p2X - s2X, p2Y - s2Y);
  var length1 = this.m_u1.Length();
  var length2 = this.m_u2.Length();
  if(length1 > b2Settings.b2_linearSlop) {
    this.m_u1.Multiply(1 / length1)
  }else {
    this.m_u1.SetZero()
  }
  if(length2 > b2Settings.b2_linearSlop) {
    this.m_u2.Multiply(1 / length2)
  }else {
    this.m_u2.SetZero()
  }
  var C = this.m_constant - length1 - this.m_ratio * length2;
  if(C > 0) {
    this.m_state = b2Joint.e_inactiveLimit;
    this.m_impulse = 0
  }else {
    this.m_state = b2Joint.e_atUpperLimit
  }
  if(length1 < this.m_maxLength1) {
    this.m_limitState1 = b2Joint.e_inactiveLimit;
    this.m_limitImpulse1 = 0
  }else {
    this.m_limitState1 = b2Joint.e_atUpperLimit
  }
  if(length2 < this.m_maxLength2) {
    this.m_limitState2 = b2Joint.e_inactiveLimit;
    this.m_limitImpulse2 = 0
  }else {
    this.m_limitState2 = b2Joint.e_atUpperLimit
  }
  var cr1u1 = r1X * this.m_u1.y - r1Y * this.m_u1.x;
  var cr2u2 = r2X * this.m_u2.y - r2Y * this.m_u2.x;
  this.m_limitMass1 = bA.m_invMass + bA.m_invI * cr1u1 * cr1u1;
  this.m_limitMass2 = bB.m_invMass + bB.m_invI * cr2u2 * cr2u2;
  this.m_pulleyMass = this.m_limitMass1 + this.m_ratio * this.m_ratio * this.m_limitMass2;
  this.m_limitMass1 = 1 / this.m_limitMass1;
  this.m_limitMass2 = 1 / this.m_limitMass2;
  this.m_pulleyMass = 1 / this.m_pulleyMass;
  if(step.warmStarting) {
    this.m_impulse *= step.dtRatio;
    this.m_limitImpulse1 *= step.dtRatio;
    this.m_limitImpulse2 *= step.dtRatio;
    var P1X = (-this.m_impulse - this.m_limitImpulse1) * this.m_u1.x;
    var P1Y = (-this.m_impulse - this.m_limitImpulse1) * this.m_u1.y;
    var P2X = (-this.m_ratio * this.m_impulse - this.m_limitImpulse2) * this.m_u2.x;
    var P2Y = (-this.m_ratio * this.m_impulse - this.m_limitImpulse2) * this.m_u2.y;
    bA.m_linearVelocity.x += bA.m_invMass * P1X;
    bA.m_linearVelocity.y += bA.m_invMass * P1Y;
    bA.m_angularVelocity += bA.m_invI * (r1X * P1Y - r1Y * P1X);
    bB.m_linearVelocity.x += bB.m_invMass * P2X;
    bB.m_linearVelocity.y += bB.m_invMass * P2Y;
    bB.m_angularVelocity += bB.m_invI * (r2X * P2Y - r2Y * P2X)
  }else {
    this.m_impulse = 0;
    this.m_limitImpulse1 = 0;
    this.m_limitImpulse2 = 0
  }
};
b2PulleyJoint.prototype.SolveVelocityConstraints = function(step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  var tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var v1X;
  var v1Y;
  var v2X;
  var v2Y;
  var P1X;
  var P1Y;
  var P2X;
  var P2Y;
  var Cdot;
  var impulse;
  var oldImpulse;
  if(this.m_state == b2Joint.e_atUpperLimit) {
    v1X = bA.m_linearVelocity.x + -bA.m_angularVelocity * r1Y;
    v1Y = bA.m_linearVelocity.y + bA.m_angularVelocity * r1X;
    v2X = bB.m_linearVelocity.x + -bB.m_angularVelocity * r2Y;
    v2Y = bB.m_linearVelocity.y + bB.m_angularVelocity * r2X;
    Cdot = -(this.m_u1.x * v1X + this.m_u1.y * v1Y) - this.m_ratio * (this.m_u2.x * v2X + this.m_u2.y * v2Y);
    impulse = this.m_pulleyMass * -Cdot;
    oldImpulse = this.m_impulse;
    this.m_impulse = b2Math.Max(0, this.m_impulse + impulse);
    impulse = this.m_impulse - oldImpulse;
    P1X = -impulse * this.m_u1.x;
    P1Y = -impulse * this.m_u1.y;
    P2X = -this.m_ratio * impulse * this.m_u2.x;
    P2Y = -this.m_ratio * impulse * this.m_u2.y;
    bA.m_linearVelocity.x += bA.m_invMass * P1X;
    bA.m_linearVelocity.y += bA.m_invMass * P1Y;
    bA.m_angularVelocity += bA.m_invI * (r1X * P1Y - r1Y * P1X);
    bB.m_linearVelocity.x += bB.m_invMass * P2X;
    bB.m_linearVelocity.y += bB.m_invMass * P2Y;
    bB.m_angularVelocity += bB.m_invI * (r2X * P2Y - r2Y * P2X)
  }
  if(this.m_limitState1 == b2Joint.e_atUpperLimit) {
    v1X = bA.m_linearVelocity.x + -bA.m_angularVelocity * r1Y;
    v1Y = bA.m_linearVelocity.y + bA.m_angularVelocity * r1X;
    Cdot = -(this.m_u1.x * v1X + this.m_u1.y * v1Y);
    impulse = -this.m_limitMass1 * Cdot;
    oldImpulse = this.m_limitImpulse1;
    this.m_limitImpulse1 = b2Math.Max(0, this.m_limitImpulse1 + impulse);
    impulse = this.m_limitImpulse1 - oldImpulse;
    P1X = -impulse * this.m_u1.x;
    P1Y = -impulse * this.m_u1.y;
    bA.m_linearVelocity.x += bA.m_invMass * P1X;
    bA.m_linearVelocity.y += bA.m_invMass * P1Y;
    bA.m_angularVelocity += bA.m_invI * (r1X * P1Y - r1Y * P1X)
  }
  if(this.m_limitState2 == b2Joint.e_atUpperLimit) {
    v2X = bB.m_linearVelocity.x + -bB.m_angularVelocity * r2Y;
    v2Y = bB.m_linearVelocity.y + bB.m_angularVelocity * r2X;
    Cdot = -(this.m_u2.x * v2X + this.m_u2.y * v2Y);
    impulse = -this.m_limitMass2 * Cdot;
    oldImpulse = this.m_limitImpulse2;
    this.m_limitImpulse2 = b2Math.Max(0, this.m_limitImpulse2 + impulse);
    impulse = this.m_limitImpulse2 - oldImpulse;
    P2X = -impulse * this.m_u2.x;
    P2Y = -impulse * this.m_u2.y;
    bB.m_linearVelocity.x += bB.m_invMass * P2X;
    bB.m_linearVelocity.y += bB.m_invMass * P2Y;
    bB.m_angularVelocity += bB.m_invI * (r2X * P2Y - r2Y * P2X)
  }
};
b2PulleyJoint.prototype.SolvePositionConstraints = function(baumgarte) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  var s1X = this.m_ground.m_xf.position.x + this.m_groundAnchor1.x;
  var s1Y = this.m_ground.m_xf.position.y + this.m_groundAnchor1.y;
  var s2X = this.m_ground.m_xf.position.x + this.m_groundAnchor2.x;
  var s2Y = this.m_ground.m_xf.position.y + this.m_groundAnchor2.y;
  var r1X;
  var r1Y;
  var r2X;
  var r2Y;
  var p1X;
  var p1Y;
  var p2X;
  var p2Y;
  var length1;
  var length2;
  var C;
  var impulse;
  var oldImpulse;
  var oldLimitPositionImpulse;
  var tX;
  var linearError = 0;
  if(this.m_state == b2Joint.e_atUpperLimit) {
    tMat = bA.m_xf.R;
    r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
    r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
    r1X = tX;
    tMat = bB.m_xf.R;
    r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
    r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
    r2X = tX;
    p1X = bA.m_sweep.c.x + r1X;
    p1Y = bA.m_sweep.c.y + r1Y;
    p2X = bB.m_sweep.c.x + r2X;
    p2Y = bB.m_sweep.c.y + r2Y;
    this.m_u1.Set(p1X - s1X, p1Y - s1Y);
    this.m_u2.Set(p2X - s2X, p2Y - s2Y);
    length1 = this.m_u1.Length();
    length2 = this.m_u2.Length();
    if(length1 > b2Settings.b2_linearSlop) {
      this.m_u1.Multiply(1 / length1)
    }else {
      this.m_u1.SetZero()
    }
    if(length2 > b2Settings.b2_linearSlop) {
      this.m_u2.Multiply(1 / length2)
    }else {
      this.m_u2.SetZero()
    }
    C = this.m_constant - length1 - this.m_ratio * length2;
    linearError = b2Math.Max(linearError, -C);
    C = b2Math.Clamp(C + b2Settings.b2_linearSlop, -b2Settings.b2_maxLinearCorrection, 0);
    impulse = -this.m_pulleyMass * C;
    p1X = -impulse * this.m_u1.x;
    p1Y = -impulse * this.m_u1.y;
    p2X = -this.m_ratio * impulse * this.m_u2.x;
    p2Y = -this.m_ratio * impulse * this.m_u2.y;
    bA.m_sweep.c.x += bA.m_invMass * p1X;
    bA.m_sweep.c.y += bA.m_invMass * p1Y;
    bA.m_sweep.a += bA.m_invI * (r1X * p1Y - r1Y * p1X);
    bB.m_sweep.c.x += bB.m_invMass * p2X;
    bB.m_sweep.c.y += bB.m_invMass * p2Y;
    bB.m_sweep.a += bB.m_invI * (r2X * p2Y - r2Y * p2X);
    bA.SynchronizeTransform();
    bB.SynchronizeTransform()
  }
  if(this.m_limitState1 == b2Joint.e_atUpperLimit) {
    tMat = bA.m_xf.R;
    r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
    r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
    r1X = tX;
    p1X = bA.m_sweep.c.x + r1X;
    p1Y = bA.m_sweep.c.y + r1Y;
    this.m_u1.Set(p1X - s1X, p1Y - s1Y);
    length1 = this.m_u1.Length();
    if(length1 > b2Settings.b2_linearSlop) {
      this.m_u1.x *= 1 / length1;
      this.m_u1.y *= 1 / length1
    }else {
      this.m_u1.SetZero()
    }
    C = this.m_maxLength1 - length1;
    linearError = b2Math.Max(linearError, -C);
    C = b2Math.Clamp(C + b2Settings.b2_linearSlop, -b2Settings.b2_maxLinearCorrection, 0);
    impulse = -this.m_limitMass1 * C;
    p1X = -impulse * this.m_u1.x;
    p1Y = -impulse * this.m_u1.y;
    bA.m_sweep.c.x += bA.m_invMass * p1X;
    bA.m_sweep.c.y += bA.m_invMass * p1Y;
    bA.m_sweep.a += bA.m_invI * (r1X * p1Y - r1Y * p1X);
    bA.SynchronizeTransform()
  }
  if(this.m_limitState2 == b2Joint.e_atUpperLimit) {
    tMat = bB.m_xf.R;
    r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
    r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
    r2X = tX;
    p2X = bB.m_sweep.c.x + r2X;
    p2Y = bB.m_sweep.c.y + r2Y;
    this.m_u2.Set(p2X - s2X, p2Y - s2Y);
    length2 = this.m_u2.Length();
    if(length2 > b2Settings.b2_linearSlop) {
      this.m_u2.x *= 1 / length2;
      this.m_u2.y *= 1 / length2
    }else {
      this.m_u2.SetZero()
    }
    C = this.m_maxLength2 - length2;
    linearError = b2Math.Max(linearError, -C);
    C = b2Math.Clamp(C + b2Settings.b2_linearSlop, -b2Settings.b2_maxLinearCorrection, 0);
    impulse = -this.m_limitMass2 * C;
    p2X = -impulse * this.m_u2.x;
    p2Y = -impulse * this.m_u2.y;
    bB.m_sweep.c.x += bB.m_invMass * p2X;
    bB.m_sweep.c.y += bB.m_invMass * p2Y;
    bB.m_sweep.a += bB.m_invI * (r2X * p2Y - r2Y * p2X);
    bB.SynchronizeTransform()
  }
  return linearError < b2Settings.b2_linearSlop
};
b2PulleyJoint.prototype.GetAnchorA = function() {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
};
b2PulleyJoint.prototype.GetAnchorB = function() {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
};
b2PulleyJoint.prototype.GetReactionForce = function(inv_dt) {
  return new b2Vec2(inv_dt * this.m_impulse * this.m_u2.x, inv_dt * this.m_impulse * this.m_u2.y)
};
b2PulleyJoint.prototype.GetReactionTorque = function(inv_dt) {
  return 0
};
b2PulleyJoint.prototype.GetGroundAnchorA = function() {
  var a = this.m_ground.m_xf.position.Copy();
  a.Add(this.m_groundAnchor1);
  return a
};
b2PulleyJoint.prototype.GetGroundAnchorB = function() {
  var a = this.m_ground.m_xf.position.Copy();
  a.Add(this.m_groundAnchor2);
  return a
};
b2PulleyJoint.prototype.GetLength1 = function() {
  var p = this.m_bodyA.GetWorldPoint(this.m_localAnchor1);
  var sX = this.m_ground.m_xf.position.x + this.m_groundAnchor1.x;
  var sY = this.m_ground.m_xf.position.y + this.m_groundAnchor1.y;
  var dX = p.x - sX;
  var dY = p.y - sY;
  return Math.sqrt(dX * dX + dY * dY)
};
b2PulleyJoint.prototype.GetLength2 = function() {
  var p = this.m_bodyB.GetWorldPoint(this.m_localAnchor2);
  var sX = this.m_ground.m_xf.position.x + this.m_groundAnchor2.x;
  var sY = this.m_ground.m_xf.position.y + this.m_groundAnchor2.y;
  var dX = p.x - sX;
  var dY = p.y - sY;
  return Math.sqrt(dX * dX + dY * dY)
};
b2PulleyJoint.prototype.GetRatio = function() {
  return this.m_ratio
};
b2PulleyJoint.prototype.m_ground = null;
b2PulleyJoint.prototype.m_groundAnchor1 = new b2Vec2;
b2PulleyJoint.prototype.m_groundAnchor2 = new b2Vec2;
b2PulleyJoint.prototype.m_localAnchor1 = new b2Vec2;
b2PulleyJoint.prototype.m_localAnchor2 = new b2Vec2;
b2PulleyJoint.prototype.m_u1 = new b2Vec2;
b2PulleyJoint.prototype.m_u2 = new b2Vec2;
b2PulleyJoint.prototype.m_constant = null;
b2PulleyJoint.prototype.m_ratio = null;
b2PulleyJoint.prototype.m_maxLength1 = null;
b2PulleyJoint.prototype.m_maxLength2 = null;
b2PulleyJoint.prototype.m_pulleyMass = null;
b2PulleyJoint.prototype.m_limitMass1 = null;
b2PulleyJoint.prototype.m_limitMass2 = null;
b2PulleyJoint.prototype.m_impulse = null;
b2PulleyJoint.prototype.m_limitImpulse1 = null;
b2PulleyJoint.prototype.m_limitImpulse2 = null;
b2PulleyJoint.prototype.m_state = 0;
b2PulleyJoint.prototype.m_limitState1 = 0;
b2PulleyJoint.prototype.m_limitState2 = 0;var b2PrismaticJoint = function() {
  b2Joint.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2PrismaticJoint.prototype, b2Joint.prototype);
b2PrismaticJoint.prototype._super = b2Joint.prototype;
b2PrismaticJoint.prototype.__constructor = function(def) {
  this._super.__constructor.apply(this, [def]);
  var tMat;
  var tX;
  var tY;
  this.m_localAnchor1.SetV(def.localAnchorA);
  this.m_localAnchor2.SetV(def.localAnchorB);
  this.m_localXAxis1.SetV(def.localAxisA);
  this.m_localYAxis1.x = -this.m_localXAxis1.y;
  this.m_localYAxis1.y = this.m_localXAxis1.x;
  this.m_refAngle = def.referenceAngle;
  this.m_impulse.SetZero();
  this.m_motorMass = 0;
  this.m_motorImpulse = 0;
  this.m_lowerTranslation = def.lowerTranslation;
  this.m_upperTranslation = def.upperTranslation;
  this.m_maxMotorForce = def.maxMotorForce;
  this.m_motorSpeed = def.motorSpeed;
  this.m_enableLimit = def.enableLimit;
  this.m_enableMotor = def.enableMotor;
  this.m_limitState = b2Joint.e_inactiveLimit;
  this.m_axis.SetZero();
  this.m_perp.SetZero()
};
b2PrismaticJoint.prototype.__varz = function() {
  this.m_localAnchor1 = new b2Vec2;
  this.m_localAnchor2 = new b2Vec2;
  this.m_localXAxis1 = new b2Vec2;
  this.m_localYAxis1 = new b2Vec2;
  this.m_axis = new b2Vec2;
  this.m_perp = new b2Vec2;
  this.m_K = new b2Mat33;
  this.m_impulse = new b2Vec3
};
b2PrismaticJoint.prototype.InitVelocityConstraints = function(step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  var tX;
  this.m_localCenterA.SetV(bA.GetLocalCenter());
  this.m_localCenterB.SetV(bB.GetLocalCenter());
  var xf1 = bA.GetTransform();
  var xf2 = bB.GetTransform();
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - this.m_localCenterA.x;
  var r1Y = this.m_localAnchor1.y - this.m_localCenterA.y;
  tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - this.m_localCenterB.x;
  var r2Y = this.m_localAnchor2.y - this.m_localCenterB.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var dX = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
  var dY = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
  this.m_invMassA = bA.m_invMass;
  this.m_invMassB = bB.m_invMass;
  this.m_invIA = bA.m_invI;
  this.m_invIB = bB.m_invI;
  this.m_axis.SetV(b2Math.MulMV(xf1.R, this.m_localXAxis1));
  this.m_a1 = (dX + r1X) * this.m_axis.y - (dY + r1Y) * this.m_axis.x;
  this.m_a2 = r2X * this.m_axis.y - r2Y * this.m_axis.x;
  this.m_motorMass = this.m_invMassA + this.m_invMassB + this.m_invIA * this.m_a1 * this.m_a1 + this.m_invIB * this.m_a2 * this.m_a2;
  if(this.m_motorMass > Number.MIN_VALUE) {
    this.m_motorMass = 1 / this.m_motorMass
  }
  this.m_perp.SetV(b2Math.MulMV(xf1.R, this.m_localYAxis1));
  this.m_s1 = (dX + r1X) * this.m_perp.y - (dY + r1Y) * this.m_perp.x;
  this.m_s2 = r2X * this.m_perp.y - r2Y * this.m_perp.x;
  var m1 = this.m_invMassA;
  var m2 = this.m_invMassB;
  var i1 = this.m_invIA;
  var i2 = this.m_invIB;
  this.m_K.col1.x = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
  this.m_K.col1.y = i1 * this.m_s1 + i2 * this.m_s2;
  this.m_K.col1.z = i1 * this.m_s1 * this.m_a1 + i2 * this.m_s2 * this.m_a2;
  this.m_K.col2.x = this.m_K.col1.y;
  this.m_K.col2.y = i1 + i2;
  this.m_K.col2.z = i1 * this.m_a1 + i2 * this.m_a2;
  this.m_K.col3.x = this.m_K.col1.z;
  this.m_K.col3.y = this.m_K.col2.z;
  this.m_K.col3.z = m1 + m2 + i1 * this.m_a1 * this.m_a1 + i2 * this.m_a2 * this.m_a2;
  if(this.m_enableLimit) {
    var jointTransition = this.m_axis.x * dX + this.m_axis.y * dY;
    if(b2Math.Abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * b2Settings.b2_linearSlop) {
      this.m_limitState = b2Joint.e_equalLimits
    }else {
      if(jointTransition <= this.m_lowerTranslation) {
        if(this.m_limitState != b2Joint.e_atLowerLimit) {
          this.m_limitState = b2Joint.e_atLowerLimit;
          this.m_impulse.z = 0
        }
      }else {
        if(jointTransition >= this.m_upperTranslation) {
          if(this.m_limitState != b2Joint.e_atUpperLimit) {
            this.m_limitState = b2Joint.e_atUpperLimit;
            this.m_impulse.z = 0
          }
        }else {
          this.m_limitState = b2Joint.e_inactiveLimit;
          this.m_impulse.z = 0
        }
      }
    }
  }else {
    this.m_limitState = b2Joint.e_inactiveLimit
  }
  if(this.m_enableMotor == false) {
    this.m_motorImpulse = 0
  }
  if(step.warmStarting) {
    this.m_impulse.x *= step.dtRatio;
    this.m_impulse.y *= step.dtRatio;
    this.m_motorImpulse *= step.dtRatio;
    var PX = this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.x;
    var PY = this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.y;
    var L1 = this.m_impulse.x * this.m_s1 + this.m_impulse.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_a1;
    var L2 = this.m_impulse.x * this.m_s2 + this.m_impulse.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_a2;
    bA.m_linearVelocity.x -= this.m_invMassA * PX;
    bA.m_linearVelocity.y -= this.m_invMassA * PY;
    bA.m_angularVelocity -= this.m_invIA * L1;
    bB.m_linearVelocity.x += this.m_invMassB * PX;
    bB.m_linearVelocity.y += this.m_invMassB * PY;
    bB.m_angularVelocity += this.m_invIB * L2
  }else {
    this.m_impulse.SetZero();
    this.m_motorImpulse = 0
  }
};
b2PrismaticJoint.prototype.SolveVelocityConstraints = function(step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var v1 = bA.m_linearVelocity;
  var w1 = bA.m_angularVelocity;
  var v2 = bB.m_linearVelocity;
  var w2 = bB.m_angularVelocity;
  var PX;
  var PY;
  var L1;
  var L2;
  if(this.m_enableMotor && this.m_limitState != b2Joint.e_equalLimits) {
    var Cdot = this.m_axis.x * (v2.x - v1.x) + this.m_axis.y * (v2.y - v1.y) + this.m_a2 * w2 - this.m_a1 * w1;
    var impulse = this.m_motorMass * (this.m_motorSpeed - Cdot);
    var oldImpulse = this.m_motorImpulse;
    var maxImpulse = step.dt * this.m_maxMotorForce;
    this.m_motorImpulse = b2Math.Clamp(this.m_motorImpulse + impulse, -maxImpulse, maxImpulse);
    impulse = this.m_motorImpulse - oldImpulse;
    PX = impulse * this.m_axis.x;
    PY = impulse * this.m_axis.y;
    L1 = impulse * this.m_a1;
    L2 = impulse * this.m_a2;
    v1.x -= this.m_invMassA * PX;
    v1.y -= this.m_invMassA * PY;
    w1 -= this.m_invIA * L1;
    v2.x += this.m_invMassB * PX;
    v2.y += this.m_invMassB * PY;
    w2 += this.m_invIB * L2
  }
  var Cdot1X = this.m_perp.x * (v2.x - v1.x) + this.m_perp.y * (v2.y - v1.y) + this.m_s2 * w2 - this.m_s1 * w1;
  var Cdot1Y = w2 - w1;
  if(this.m_enableLimit && this.m_limitState != b2Joint.e_inactiveLimit) {
    var Cdot2 = this.m_axis.x * (v2.x - v1.x) + this.m_axis.y * (v2.y - v1.y) + this.m_a2 * w2 - this.m_a1 * w1;
    var f1 = this.m_impulse.Copy();
    var df = this.m_K.Solve33(new b2Vec3, -Cdot1X, -Cdot1Y, -Cdot2);
    this.m_impulse.Add(df);
    if(this.m_limitState == b2Joint.e_atLowerLimit) {
      this.m_impulse.z = b2Math.Max(this.m_impulse.z, 0)
    }else {
      if(this.m_limitState == b2Joint.e_atUpperLimit) {
        this.m_impulse.z = b2Math.Min(this.m_impulse.z, 0)
      }
    }
    var bX = -Cdot1X - (this.m_impulse.z - f1.z) * this.m_K.col3.x;
    var bY = -Cdot1Y - (this.m_impulse.z - f1.z) * this.m_K.col3.y;
    var f2r = this.m_K.Solve22(new b2Vec2, bX, bY);
    f2r.x += f1.x;
    f2r.y += f1.y;
    this.m_impulse.x = f2r.x;
    this.m_impulse.y = f2r.y;
    df.x = this.m_impulse.x - f1.x;
    df.y = this.m_impulse.y - f1.y;
    df.z = this.m_impulse.z - f1.z;
    PX = df.x * this.m_perp.x + df.z * this.m_axis.x;
    PY = df.x * this.m_perp.y + df.z * this.m_axis.y;
    L1 = df.x * this.m_s1 + df.y + df.z * this.m_a1;
    L2 = df.x * this.m_s2 + df.y + df.z * this.m_a2;
    v1.x -= this.m_invMassA * PX;
    v1.y -= this.m_invMassA * PY;
    w1 -= this.m_invIA * L1;
    v2.x += this.m_invMassB * PX;
    v2.y += this.m_invMassB * PY;
    w2 += this.m_invIB * L2
  }else {
    var df2 = this.m_K.Solve22(new b2Vec2, -Cdot1X, -Cdot1Y);
    this.m_impulse.x += df2.x;
    this.m_impulse.y += df2.y;
    PX = df2.x * this.m_perp.x;
    PY = df2.x * this.m_perp.y;
    L1 = df2.x * this.m_s1 + df2.y;
    L2 = df2.x * this.m_s2 + df2.y;
    v1.x -= this.m_invMassA * PX;
    v1.y -= this.m_invMassA * PY;
    w1 -= this.m_invIA * L1;
    v2.x += this.m_invMassB * PX;
    v2.y += this.m_invMassB * PY;
    w2 += this.m_invIB * L2
  }
  bA.m_linearVelocity.SetV(v1);
  bA.m_angularVelocity = w1;
  bB.m_linearVelocity.SetV(v2);
  bB.m_angularVelocity = w2
};
b2PrismaticJoint.prototype.SolvePositionConstraints = function(baumgarte) {
  var limitC;
  var oldLimitImpulse;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var c1 = bA.m_sweep.c;
  var a1 = bA.m_sweep.a;
  var c2 = bB.m_sweep.c;
  var a2 = bB.m_sweep.a;
  var tMat;
  var tX;
  var m1;
  var m2;
  var i1;
  var i2;
  var linearError = 0;
  var angularError = 0;
  var active = false;
  var C2 = 0;
  var R1 = b2Mat22.FromAngle(a1);
  var R2 = b2Mat22.FromAngle(a2);
  tMat = R1;
  var r1X = this.m_localAnchor1.x - this.m_localCenterA.x;
  var r1Y = this.m_localAnchor1.y - this.m_localCenterA.y;
  tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = R2;
  var r2X = this.m_localAnchor2.x - this.m_localCenterB.x;
  var r2Y = this.m_localAnchor2.y - this.m_localCenterB.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var dX = c2.x + r2X - c1.x - r1X;
  var dY = c2.y + r2Y - c1.y - r1Y;
  if(this.m_enableLimit) {
    this.m_axis = b2Math.MulMV(R1, this.m_localXAxis1);
    this.m_a1 = (dX + r1X) * this.m_axis.y - (dY + r1Y) * this.m_axis.x;
    this.m_a2 = r2X * this.m_axis.y - r2Y * this.m_axis.x;
    var translation = this.m_axis.x * dX + this.m_axis.y * dY;
    if(b2Math.Abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * b2Settings.b2_linearSlop) {
      C2 = b2Math.Clamp(translation, -b2Settings.b2_maxLinearCorrection, b2Settings.b2_maxLinearCorrection);
      linearError = b2Math.Abs(translation);
      active = true
    }else {
      if(translation <= this.m_lowerTranslation) {
        C2 = b2Math.Clamp(translation - this.m_lowerTranslation + b2Settings.b2_linearSlop, -b2Settings.b2_maxLinearCorrection, 0);
        linearError = this.m_lowerTranslation - translation;
        active = true
      }else {
        if(translation >= this.m_upperTranslation) {
          C2 = b2Math.Clamp(translation - this.m_upperTranslation + b2Settings.b2_linearSlop, 0, b2Settings.b2_maxLinearCorrection);
          linearError = translation - this.m_upperTranslation;
          active = true
        }
      }
    }
  }
  this.m_perp = b2Math.MulMV(R1, this.m_localYAxis1);
  this.m_s1 = (dX + r1X) * this.m_perp.y - (dY + r1Y) * this.m_perp.x;
  this.m_s2 = r2X * this.m_perp.y - r2Y * this.m_perp.x;
  var impulse = new b2Vec3;
  var C1X = this.m_perp.x * dX + this.m_perp.y * dY;
  var C1Y = a2 - a1 - this.m_refAngle;
  linearError = b2Math.Max(linearError, b2Math.Abs(C1X));
  angularError = b2Math.Abs(C1Y);
  if(active) {
    m1 = this.m_invMassA;
    m2 = this.m_invMassB;
    i1 = this.m_invIA;
    i2 = this.m_invIB;
    this.m_K.col1.x = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
    this.m_K.col1.y = i1 * this.m_s1 + i2 * this.m_s2;
    this.m_K.col1.z = i1 * this.m_s1 * this.m_a1 + i2 * this.m_s2 * this.m_a2;
    this.m_K.col2.x = this.m_K.col1.y;
    this.m_K.col2.y = i1 + i2;
    this.m_K.col2.z = i1 * this.m_a1 + i2 * this.m_a2;
    this.m_K.col3.x = this.m_K.col1.z;
    this.m_K.col3.y = this.m_K.col2.z;
    this.m_K.col3.z = m1 + m2 + i1 * this.m_a1 * this.m_a1 + i2 * this.m_a2 * this.m_a2;
    this.m_K.Solve33(impulse, -C1X, -C1Y, -C2)
  }else {
    m1 = this.m_invMassA;
    m2 = this.m_invMassB;
    i1 = this.m_invIA;
    i2 = this.m_invIB;
    var k11 = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
    var k12 = i1 * this.m_s1 + i2 * this.m_s2;
    var k22 = i1 + i2;
    this.m_K.col1.Set(k11, k12, 0);
    this.m_K.col2.Set(k12, k22, 0);
    var impulse1 = this.m_K.Solve22(new b2Vec2, -C1X, -C1Y);
    impulse.x = impulse1.x;
    impulse.y = impulse1.y;
    impulse.z = 0
  }
  var PX = impulse.x * this.m_perp.x + impulse.z * this.m_axis.x;
  var PY = impulse.x * this.m_perp.y + impulse.z * this.m_axis.y;
  var L1 = impulse.x * this.m_s1 + impulse.y + impulse.z * this.m_a1;
  var L2 = impulse.x * this.m_s2 + impulse.y + impulse.z * this.m_a2;
  c1.x -= this.m_invMassA * PX;
  c1.y -= this.m_invMassA * PY;
  a1 -= this.m_invIA * L1;
  c2.x += this.m_invMassB * PX;
  c2.y += this.m_invMassB * PY;
  a2 += this.m_invIB * L2;
  bA.m_sweep.a = a1;
  bB.m_sweep.a = a2;
  bA.SynchronizeTransform();
  bB.SynchronizeTransform();
  return linearError <= b2Settings.b2_linearSlop && angularError <= b2Settings.b2_angularSlop
};
b2PrismaticJoint.prototype.GetAnchorA = function() {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
};
b2PrismaticJoint.prototype.GetAnchorB = function() {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
};
b2PrismaticJoint.prototype.GetReactionForce = function(inv_dt) {
  return new b2Vec2(inv_dt * (this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.x), inv_dt * (this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.y))
};
b2PrismaticJoint.prototype.GetReactionTorque = function(inv_dt) {
  return inv_dt * this.m_impulse.y
};
b2PrismaticJoint.prototype.GetJointTranslation = function() {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  var p1 = bA.GetWorldPoint(this.m_localAnchor1);
  var p2 = bB.GetWorldPoint(this.m_localAnchor2);
  var dX = p2.x - p1.x;
  var dY = p2.y - p1.y;
  var axis = bA.GetWorldVector(this.m_localXAxis1);
  var translation = axis.x * dX + axis.y * dY;
  return translation
};
b2PrismaticJoint.prototype.GetJointSpeed = function() {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  var tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var p1X = bA.m_sweep.c.x + r1X;
  var p1Y = bA.m_sweep.c.y + r1Y;
  var p2X = bB.m_sweep.c.x + r2X;
  var p2Y = bB.m_sweep.c.y + r2Y;
  var dX = p2X - p1X;
  var dY = p2Y - p1Y;
  var axis = bA.GetWorldVector(this.m_localXAxis1);
  var v1 = bA.m_linearVelocity;
  var v2 = bB.m_linearVelocity;
  var w1 = bA.m_angularVelocity;
  var w2 = bB.m_angularVelocity;
  var speed = dX * -w1 * axis.y + dY * w1 * axis.x + (axis.x * (v2.x + -w2 * r2Y - v1.x - -w1 * r1Y) + axis.y * (v2.y + w2 * r2X - v1.y - w1 * r1X));
  return speed
};
b2PrismaticJoint.prototype.IsLimitEnabled = function() {
  return this.m_enableLimit
};
b2PrismaticJoint.prototype.EnableLimit = function(flag) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_enableLimit = flag
};
b2PrismaticJoint.prototype.GetLowerLimit = function() {
  return this.m_lowerTranslation
};
b2PrismaticJoint.prototype.GetUpperLimit = function() {
  return this.m_upperTranslation
};
b2PrismaticJoint.prototype.SetLimits = function(lower, upper) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_lowerTranslation = lower;
  this.m_upperTranslation = upper
};
b2PrismaticJoint.prototype.IsMotorEnabled = function() {
  return this.m_enableMotor
};
b2PrismaticJoint.prototype.EnableMotor = function(flag) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_enableMotor = flag
};
b2PrismaticJoint.prototype.SetMotorSpeed = function(speed) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_motorSpeed = speed
};
b2PrismaticJoint.prototype.GetMotorSpeed = function() {
  return this.m_motorSpeed
};
b2PrismaticJoint.prototype.SetMaxMotorForce = function(force) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_maxMotorForce = force
};
b2PrismaticJoint.prototype.GetMotorForce = function() {
  return this.m_motorImpulse
};
b2PrismaticJoint.prototype.m_localAnchor1 = new b2Vec2;
b2PrismaticJoint.prototype.m_localAnchor2 = new b2Vec2;
b2PrismaticJoint.prototype.m_localXAxis1 = new b2Vec2;
b2PrismaticJoint.prototype.m_localYAxis1 = new b2Vec2;
b2PrismaticJoint.prototype.m_refAngle = null;
b2PrismaticJoint.prototype.m_axis = new b2Vec2;
b2PrismaticJoint.prototype.m_perp = new b2Vec2;
b2PrismaticJoint.prototype.m_s1 = null;
b2PrismaticJoint.prototype.m_s2 = null;
b2PrismaticJoint.prototype.m_a1 = null;
b2PrismaticJoint.prototype.m_a2 = null;
b2PrismaticJoint.prototype.m_K = new b2Mat33;
b2PrismaticJoint.prototype.m_impulse = new b2Vec3;
b2PrismaticJoint.prototype.m_motorMass = null;
b2PrismaticJoint.prototype.m_motorImpulse = null;
b2PrismaticJoint.prototype.m_lowerTranslation = null;
b2PrismaticJoint.prototype.m_upperTranslation = null;
b2PrismaticJoint.prototype.m_maxMotorForce = null;
b2PrismaticJoint.prototype.m_motorSpeed = null;
b2PrismaticJoint.prototype.m_enableLimit = null;
b2PrismaticJoint.prototype.m_enableMotor = null;
b2PrismaticJoint.prototype.m_limitState = 0;var b2RevoluteJoint = function() {
  b2Joint.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2RevoluteJoint.prototype, b2Joint.prototype);
b2RevoluteJoint.prototype._super = b2Joint.prototype;
b2RevoluteJoint.prototype.__constructor = function(def) {
  this._super.__constructor.apply(this, [def]);
  this.m_localAnchor1.SetV(def.localAnchorA);
  this.m_localAnchor2.SetV(def.localAnchorB);
  this.m_referenceAngle = def.referenceAngle;
  this.m_impulse.SetZero();
  this.m_motorImpulse = 0;
  this.m_lowerAngle = def.lowerAngle;
  this.m_upperAngle = def.upperAngle;
  this.m_maxMotorTorque = def.maxMotorTorque;
  this.m_motorSpeed = def.motorSpeed;
  this.m_enableLimit = def.enableLimit;
  this.m_enableMotor = def.enableMotor;
  this.m_limitState = b2Joint.e_inactiveLimit
};
b2RevoluteJoint.prototype.__varz = function() {
  this.K = new b2Mat22;
  this.K1 = new b2Mat22;
  this.K2 = new b2Mat22;
  this.K3 = new b2Mat22;
  this.impulse3 = new b2Vec3;
  this.impulse2 = new b2Vec2;
  this.reduced = new b2Vec2;
  this.m_localAnchor1 = new b2Vec2;
  this.m_localAnchor2 = new b2Vec2;
  this.m_impulse = new b2Vec3;
  this.m_mass = new b2Mat33
};
b2RevoluteJoint.tImpulse = new b2Vec2;
b2RevoluteJoint.prototype.InitVelocityConstraints = function(step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  var tX;
  if(this.m_enableMotor || this.m_enableLimit) {
  }
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var m1 = bA.m_invMass;
  var m2 = bB.m_invMass;
  var i1 = bA.m_invI;
  var i2 = bB.m_invI;
  this.m_mass.col1.x = m1 + m2 + r1Y * r1Y * i1 + r2Y * r2Y * i2;
  this.m_mass.col2.x = -r1Y * r1X * i1 - r2Y * r2X * i2;
  this.m_mass.col3.x = -r1Y * i1 - r2Y * i2;
  this.m_mass.col1.y = this.m_mass.col2.x;
  this.m_mass.col2.y = m1 + m2 + r1X * r1X * i1 + r2X * r2X * i2;
  this.m_mass.col3.y = r1X * i1 + r2X * i2;
  this.m_mass.col1.z = this.m_mass.col3.x;
  this.m_mass.col2.z = this.m_mass.col3.y;
  this.m_mass.col3.z = i1 + i2;
  this.m_motorMass = 1 / (i1 + i2);
  if(this.m_enableMotor == false) {
    this.m_motorImpulse = 0
  }
  if(this.m_enableLimit) {
    var jointAngle = bB.m_sweep.a - bA.m_sweep.a - this.m_referenceAngle;
    if(b2Math.Abs(this.m_upperAngle - this.m_lowerAngle) < 2 * b2Settings.b2_angularSlop) {
      this.m_limitState = b2Joint.e_equalLimits
    }else {
      if(jointAngle <= this.m_lowerAngle) {
        if(this.m_limitState != b2Joint.e_atLowerLimit) {
          this.m_impulse.z = 0
        }
        this.m_limitState = b2Joint.e_atLowerLimit
      }else {
        if(jointAngle >= this.m_upperAngle) {
          if(this.m_limitState != b2Joint.e_atUpperLimit) {
            this.m_impulse.z = 0
          }
          this.m_limitState = b2Joint.e_atUpperLimit
        }else {
          this.m_limitState = b2Joint.e_inactiveLimit;
          this.m_impulse.z = 0
        }
      }
    }
  }else {
    this.m_limitState = b2Joint.e_inactiveLimit
  }
  if(step.warmStarting) {
    this.m_impulse.x *= step.dtRatio;
    this.m_impulse.y *= step.dtRatio;
    this.m_motorImpulse *= step.dtRatio;
    var PX = this.m_impulse.x;
    var PY = this.m_impulse.y;
    bA.m_linearVelocity.x -= m1 * PX;
    bA.m_linearVelocity.y -= m1 * PY;
    bA.m_angularVelocity -= i1 * (r1X * PY - r1Y * PX + this.m_motorImpulse + this.m_impulse.z);
    bB.m_linearVelocity.x += m2 * PX;
    bB.m_linearVelocity.y += m2 * PY;
    bB.m_angularVelocity += i2 * (r2X * PY - r2Y * PX + this.m_motorImpulse + this.m_impulse.z)
  }else {
    this.m_impulse.SetZero();
    this.m_motorImpulse = 0
  }
};
b2RevoluteJoint.prototype.SolveVelocityConstraints = function(step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  var tX;
  var newImpulse;
  var r1X;
  var r1Y;
  var r2X;
  var r2Y;
  var v1 = bA.m_linearVelocity;
  var w1 = bA.m_angularVelocity;
  var v2 = bB.m_linearVelocity;
  var w2 = bB.m_angularVelocity;
  var m1 = bA.m_invMass;
  var m2 = bB.m_invMass;
  var i1 = bA.m_invI;
  var i2 = bB.m_invI;
  if(this.m_enableMotor && this.m_limitState != b2Joint.e_equalLimits) {
    var Cdot = w2 - w1 - this.m_motorSpeed;
    var impulse = this.m_motorMass * -Cdot;
    var oldImpulse = this.m_motorImpulse;
    var maxImpulse = step.dt * this.m_maxMotorTorque;
    this.m_motorImpulse = b2Math.Clamp(this.m_motorImpulse + impulse, -maxImpulse, maxImpulse);
    impulse = this.m_motorImpulse - oldImpulse;
    w1 -= i1 * impulse;
    w2 += i2 * impulse
  }
  if(this.m_enableLimit && this.m_limitState != b2Joint.e_inactiveLimit) {
    tMat = bA.m_xf.R;
    r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
    r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
    r1X = tX;
    tMat = bB.m_xf.R;
    r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
    r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
    r2X = tX;
    var Cdot1X = v2.x + -w2 * r2Y - v1.x - -w1 * r1Y;
    var Cdot1Y = v2.y + w2 * r2X - v1.y - w1 * r1X;
    var Cdot2 = w2 - w1;
    this.m_mass.Solve33(this.impulse3, -Cdot1X, -Cdot1Y, -Cdot2);
    if(this.m_limitState == b2Joint.e_equalLimits) {
      this.m_impulse.Add(this.impulse3)
    }else {
      if(this.m_limitState == b2Joint.e_atLowerLimit) {
        newImpulse = this.m_impulse.z + this.impulse3.z;
        if(newImpulse < 0) {
          this.m_mass.Solve22(this.reduced, -Cdot1X, -Cdot1Y);
          this.impulse3.x = this.reduced.x;
          this.impulse3.y = this.reduced.y;
          this.impulse3.z = -this.m_impulse.z;
          this.m_impulse.x += this.reduced.x;
          this.m_impulse.y += this.reduced.y;
          this.m_impulse.z = 0
        }
      }else {
        if(this.m_limitState == b2Joint.e_atUpperLimit) {
          newImpulse = this.m_impulse.z + this.impulse3.z;
          if(newImpulse > 0) {
            this.m_mass.Solve22(this.reduced, -Cdot1X, -Cdot1Y);
            this.impulse3.x = this.reduced.x;
            this.impulse3.y = this.reduced.y;
            this.impulse3.z = -this.m_impulse.z;
            this.m_impulse.x += this.reduced.x;
            this.m_impulse.y += this.reduced.y;
            this.m_impulse.z = 0
          }
        }
      }
    }
    v1.x -= m1 * this.impulse3.x;
    v1.y -= m1 * this.impulse3.y;
    w1 -= i1 * (r1X * this.impulse3.y - r1Y * this.impulse3.x + this.impulse3.z);
    v2.x += m2 * this.impulse3.x;
    v2.y += m2 * this.impulse3.y;
    w2 += i2 * (r2X * this.impulse3.y - r2Y * this.impulse3.x + this.impulse3.z)
  }else {
    tMat = bA.m_xf.R;
    r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
    r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
    r1X = tX;
    tMat = bB.m_xf.R;
    r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
    r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
    r2X = tX;
    var CdotX = v2.x + -w2 * r2Y - v1.x - -w1 * r1Y;
    var CdotY = v2.y + w2 * r2X - v1.y - w1 * r1X;
    this.m_mass.Solve22(this.impulse2, -CdotX, -CdotY);
    this.m_impulse.x += this.impulse2.x;
    this.m_impulse.y += this.impulse2.y;
    v1.x -= m1 * this.impulse2.x;
    v1.y -= m1 * this.impulse2.y;
    w1 -= i1 * (r1X * this.impulse2.y - r1Y * this.impulse2.x);
    v2.x += m2 * this.impulse2.x;
    v2.y += m2 * this.impulse2.y;
    w2 += i2 * (r2X * this.impulse2.y - r2Y * this.impulse2.x)
  }
  bA.m_linearVelocity.SetV(v1);
  bA.m_angularVelocity = w1;
  bB.m_linearVelocity.SetV(v2);
  bB.m_angularVelocity = w2
};
b2RevoluteJoint.prototype.SolvePositionConstraints = function(baumgarte) {
  var oldLimitImpulse;
  var C;
  var tMat;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var angularError = 0;
  var positionError = 0;
  var tX;
  var impulseX;
  var impulseY;
  if(this.m_enableLimit && this.m_limitState != b2Joint.e_inactiveLimit) {
    var angle = bB.m_sweep.a - bA.m_sweep.a - this.m_referenceAngle;
    var limitImpulse = 0;
    if(this.m_limitState == b2Joint.e_equalLimits) {
      C = b2Math.Clamp(angle - this.m_lowerAngle, -b2Settings.b2_maxAngularCorrection, b2Settings.b2_maxAngularCorrection);
      limitImpulse = -this.m_motorMass * C;
      angularError = b2Math.Abs(C)
    }else {
      if(this.m_limitState == b2Joint.e_atLowerLimit) {
        C = angle - this.m_lowerAngle;
        angularError = -C;
        C = b2Math.Clamp(C + b2Settings.b2_angularSlop, -b2Settings.b2_maxAngularCorrection, 0);
        limitImpulse = -this.m_motorMass * C
      }else {
        if(this.m_limitState == b2Joint.e_atUpperLimit) {
          C = angle - this.m_upperAngle;
          angularError = C;
          C = b2Math.Clamp(C - b2Settings.b2_angularSlop, 0, b2Settings.b2_maxAngularCorrection);
          limitImpulse = -this.m_motorMass * C
        }
      }
    }
    bA.m_sweep.a -= bA.m_invI * limitImpulse;
    bB.m_sweep.a += bB.m_invI * limitImpulse;
    bA.SynchronizeTransform();
    bB.SynchronizeTransform()
  }
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var CX = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
  var CY = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
  var CLengthSquared = CX * CX + CY * CY;
  var CLength = Math.sqrt(CLengthSquared);
  positionError = CLength;
  var invMass1 = bA.m_invMass;
  var invMass2 = bB.m_invMass;
  var invI1 = bA.m_invI;
  var invI2 = bB.m_invI;
  var k_allowedStretch = 10 * b2Settings.b2_linearSlop;
  if(CLengthSquared > k_allowedStretch * k_allowedStretch) {
    var uX = CX / CLength;
    var uY = CY / CLength;
    var k = invMass1 + invMass2;
    var m = 1 / k;
    impulseX = m * -CX;
    impulseY = m * -CY;
    var k_beta = 0.5;
    bA.m_sweep.c.x -= k_beta * invMass1 * impulseX;
    bA.m_sweep.c.y -= k_beta * invMass1 * impulseY;
    bB.m_sweep.c.x += k_beta * invMass2 * impulseX;
    bB.m_sweep.c.y += k_beta * invMass2 * impulseY;
    CX = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
    CY = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y
  }
  this.K1.col1.x = invMass1 + invMass2;
  this.K1.col2.x = 0;
  this.K1.col1.y = 0;
  this.K1.col2.y = invMass1 + invMass2;
  this.K2.col1.x = invI1 * r1Y * r1Y;
  this.K2.col2.x = -invI1 * r1X * r1Y;
  this.K2.col1.y = -invI1 * r1X * r1Y;
  this.K2.col2.y = invI1 * r1X * r1X;
  this.K3.col1.x = invI2 * r2Y * r2Y;
  this.K3.col2.x = -invI2 * r2X * r2Y;
  this.K3.col1.y = -invI2 * r2X * r2Y;
  this.K3.col2.y = invI2 * r2X * r2X;
  this.K.SetM(this.K1);
  this.K.AddM(this.K2);
  this.K.AddM(this.K3);
  this.K.Solve(b2RevoluteJoint.tImpulse, -CX, -CY);
  impulseX = b2RevoluteJoint.tImpulse.x;
  impulseY = b2RevoluteJoint.tImpulse.y;
  bA.m_sweep.c.x -= bA.m_invMass * impulseX;
  bA.m_sweep.c.y -= bA.m_invMass * impulseY;
  bA.m_sweep.a -= bA.m_invI * (r1X * impulseY - r1Y * impulseX);
  bB.m_sweep.c.x += bB.m_invMass * impulseX;
  bB.m_sweep.c.y += bB.m_invMass * impulseY;
  bB.m_sweep.a += bB.m_invI * (r2X * impulseY - r2Y * impulseX);
  bA.SynchronizeTransform();
  bB.SynchronizeTransform();
  return positionError <= b2Settings.b2_linearSlop && angularError <= b2Settings.b2_angularSlop
};
b2RevoluteJoint.prototype.GetAnchorA = function() {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
};
b2RevoluteJoint.prototype.GetAnchorB = function() {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
};
b2RevoluteJoint.prototype.GetReactionForce = function(inv_dt) {
  return new b2Vec2(inv_dt * this.m_impulse.x, inv_dt * this.m_impulse.y)
};
b2RevoluteJoint.prototype.GetReactionTorque = function(inv_dt) {
  return inv_dt * this.m_impulse.z
};
b2RevoluteJoint.prototype.GetJointAngle = function() {
  return this.m_bodyB.m_sweep.a - this.m_bodyA.m_sweep.a - this.m_referenceAngle
};
b2RevoluteJoint.prototype.GetJointSpeed = function() {
  return this.m_bodyB.m_angularVelocity - this.m_bodyA.m_angularVelocity
};
b2RevoluteJoint.prototype.IsLimitEnabled = function() {
  return this.m_enableLimit
};
b2RevoluteJoint.prototype.EnableLimit = function(flag) {
  this.m_enableLimit = flag
};
b2RevoluteJoint.prototype.GetLowerLimit = function() {
  return this.m_lowerAngle
};
b2RevoluteJoint.prototype.GetUpperLimit = function() {
  return this.m_upperAngle
};
b2RevoluteJoint.prototype.SetLimits = function(lower, upper) {
  this.m_lowerAngle = lower;
  this.m_upperAngle = upper
};
b2RevoluteJoint.prototype.IsMotorEnabled = function() {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  return this.m_enableMotor
};
b2RevoluteJoint.prototype.EnableMotor = function(flag) {
  this.m_enableMotor = flag
};
b2RevoluteJoint.prototype.SetMotorSpeed = function(speed) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_motorSpeed = speed
};
b2RevoluteJoint.prototype.GetMotorSpeed = function() {
  return this.m_motorSpeed
};
b2RevoluteJoint.prototype.SetMaxMotorTorque = function(torque) {
  this.m_maxMotorTorque = torque
};
b2RevoluteJoint.prototype.GetMotorTorque = function() {
  return this.m_maxMotorTorque
};
b2RevoluteJoint.prototype.K = new b2Mat22;
b2RevoluteJoint.prototype.K1 = new b2Mat22;
b2RevoluteJoint.prototype.K2 = new b2Mat22;
b2RevoluteJoint.prototype.K3 = new b2Mat22;
b2RevoluteJoint.prototype.impulse3 = new b2Vec3;
b2RevoluteJoint.prototype.impulse2 = new b2Vec2;
b2RevoluteJoint.prototype.reduced = new b2Vec2;
b2RevoluteJoint.prototype.m_localAnchor1 = new b2Vec2;
b2RevoluteJoint.prototype.m_localAnchor2 = new b2Vec2;
b2RevoluteJoint.prototype.m_impulse = new b2Vec3;
b2RevoluteJoint.prototype.m_motorImpulse = null;
b2RevoluteJoint.prototype.m_mass = new b2Mat33;
b2RevoluteJoint.prototype.m_motorMass = null;
b2RevoluteJoint.prototype.m_enableMotor = null;
b2RevoluteJoint.prototype.m_maxMotorTorque = null;
b2RevoluteJoint.prototype.m_motorSpeed = null;
b2RevoluteJoint.prototype.m_enableLimit = null;
b2RevoluteJoint.prototype.m_referenceAngle = null;
b2RevoluteJoint.prototype.m_lowerAngle = null;
b2RevoluteJoint.prototype.m_upperAngle = null;
b2RevoluteJoint.prototype.m_limitState = 0;var b2JointDef = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2JointDef.prototype.__constructor = function() {
  this.type = b2Joint.e_unknownJoint;
  this.userData = null;
  this.bodyA = null;
  this.bodyB = null;
  this.collideConnected = false
};
b2JointDef.prototype.__varz = function() {
};
b2JointDef.prototype.type = 0;
b2JointDef.prototype.userData = null;
b2JointDef.prototype.bodyA = null;
b2JointDef.prototype.bodyB = null;
b2JointDef.prototype.collideConnected = null;var b2LineJointDef = function() {
  b2JointDef.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2LineJointDef.prototype, b2JointDef.prototype);
b2LineJointDef.prototype._super = b2JointDef.prototype;
b2LineJointDef.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.type = b2Joint.e_lineJoint;
  this.localAxisA.Set(1, 0);
  this.enableLimit = false;
  this.lowerTranslation = 0;
  this.upperTranslation = 0;
  this.enableMotor = false;
  this.maxMotorForce = 0;
  this.motorSpeed = 0
};
b2LineJointDef.prototype.__varz = function() {
  this.localAnchorA = new b2Vec2;
  this.localAnchorB = new b2Vec2;
  this.localAxisA = new b2Vec2
};
b2LineJointDef.prototype.Initialize = function(bA, bB, anchor, axis) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.localAnchorA = this.bodyA.GetLocalPoint(anchor);
  this.localAnchorB = this.bodyB.GetLocalPoint(anchor);
  this.localAxisA = this.bodyA.GetLocalVector(axis)
};
b2LineJointDef.prototype.localAnchorA = new b2Vec2;
b2LineJointDef.prototype.localAnchorB = new b2Vec2;
b2LineJointDef.prototype.localAxisA = new b2Vec2;
b2LineJointDef.prototype.enableLimit = null;
b2LineJointDef.prototype.lowerTranslation = null;
b2LineJointDef.prototype.upperTranslation = null;
b2LineJointDef.prototype.enableMotor = null;
b2LineJointDef.prototype.maxMotorForce = null;
b2LineJointDef.prototype.motorSpeed = null;var b2DistanceJoint = function() {
  b2Joint.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2DistanceJoint.prototype, b2Joint.prototype);
b2DistanceJoint.prototype._super = b2Joint.prototype;
b2DistanceJoint.prototype.__constructor = function(def) {
  this._super.__constructor.apply(this, [def]);
  var tMat;
  var tX;
  var tY;
  this.m_localAnchor1.SetV(def.localAnchorA);
  this.m_localAnchor2.SetV(def.localAnchorB);
  this.m_length = def.length;
  this.m_frequencyHz = def.frequencyHz;
  this.m_dampingRatio = def.dampingRatio;
  this.m_impulse = 0;
  this.m_gamma = 0;
  this.m_bias = 0
};
b2DistanceJoint.prototype.__varz = function() {
  this.m_localAnchor1 = new b2Vec2;
  this.m_localAnchor2 = new b2Vec2;
  this.m_u = new b2Vec2
};
b2DistanceJoint.prototype.InitVelocityConstraints = function(step) {
  var tMat;
  var tX;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  this.m_u.x = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
  this.m_u.y = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
  var length = Math.sqrt(this.m_u.x * this.m_u.x + this.m_u.y * this.m_u.y);
  if(length > b2Settings.b2_linearSlop) {
    this.m_u.Multiply(1 / length)
  }else {
    this.m_u.SetZero()
  }
  var cr1u = r1X * this.m_u.y - r1Y * this.m_u.x;
  var cr2u = r2X * this.m_u.y - r2Y * this.m_u.x;
  var invMass = bA.m_invMass + bA.m_invI * cr1u * cr1u + bB.m_invMass + bB.m_invI * cr2u * cr2u;
  this.m_mass = invMass != 0 ? 1 / invMass : 0;
  if(this.m_frequencyHz > 0) {
    var C = length - this.m_length;
    var omega = 2 * Math.PI * this.m_frequencyHz;
    var d = 2 * this.m_mass * this.m_dampingRatio * omega;
    var k = this.m_mass * omega * omega;
    this.m_gamma = step.dt * (d + step.dt * k);
    this.m_gamma = this.m_gamma != 0 ? 1 / this.m_gamma : 0;
    this.m_bias = C * step.dt * k * this.m_gamma;
    this.m_mass = invMass + this.m_gamma;
    this.m_mass = this.m_mass != 0 ? 1 / this.m_mass : 0
  }
  if(step.warmStarting) {
    this.m_impulse *= step.dtRatio;
    var PX = this.m_impulse * this.m_u.x;
    var PY = this.m_impulse * this.m_u.y;
    bA.m_linearVelocity.x -= bA.m_invMass * PX;
    bA.m_linearVelocity.y -= bA.m_invMass * PY;
    bA.m_angularVelocity -= bA.m_invI * (r1X * PY - r1Y * PX);
    bB.m_linearVelocity.x += bB.m_invMass * PX;
    bB.m_linearVelocity.y += bB.m_invMass * PY;
    bB.m_angularVelocity += bB.m_invI * (r2X * PY - r2Y * PX)
  }else {
    this.m_impulse = 0
  }
};
b2DistanceJoint.prototype.SolveVelocityConstraints = function(step) {
  var tMat;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  var tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var v1X = bA.m_linearVelocity.x + -bA.m_angularVelocity * r1Y;
  var v1Y = bA.m_linearVelocity.y + bA.m_angularVelocity * r1X;
  var v2X = bB.m_linearVelocity.x + -bB.m_angularVelocity * r2Y;
  var v2Y = bB.m_linearVelocity.y + bB.m_angularVelocity * r2X;
  var Cdot = this.m_u.x * (v2X - v1X) + this.m_u.y * (v2Y - v1Y);
  var impulse = -this.m_mass * (Cdot + this.m_bias + this.m_gamma * this.m_impulse);
  this.m_impulse += impulse;
  var PX = impulse * this.m_u.x;
  var PY = impulse * this.m_u.y;
  bA.m_linearVelocity.x -= bA.m_invMass * PX;
  bA.m_linearVelocity.y -= bA.m_invMass * PY;
  bA.m_angularVelocity -= bA.m_invI * (r1X * PY - r1Y * PX);
  bB.m_linearVelocity.x += bB.m_invMass * PX;
  bB.m_linearVelocity.y += bB.m_invMass * PY;
  bB.m_angularVelocity += bB.m_invI * (r2X * PY - r2Y * PX)
};
b2DistanceJoint.prototype.SolvePositionConstraints = function(baumgarte) {
  var tMat;
  if(this.m_frequencyHz > 0) {
    return true
  }
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  var tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var dX = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
  var dY = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
  var length = Math.sqrt(dX * dX + dY * dY);
  dX /= length;
  dY /= length;
  var C = length - this.m_length;
  C = b2Math.Clamp(C, -b2Settings.b2_maxLinearCorrection, b2Settings.b2_maxLinearCorrection);
  var impulse = -this.m_mass * C;
  this.m_u.Set(dX, dY);
  var PX = impulse * this.m_u.x;
  var PY = impulse * this.m_u.y;
  bA.m_sweep.c.x -= bA.m_invMass * PX;
  bA.m_sweep.c.y -= bA.m_invMass * PY;
  bA.m_sweep.a -= bA.m_invI * (r1X * PY - r1Y * PX);
  bB.m_sweep.c.x += bB.m_invMass * PX;
  bB.m_sweep.c.y += bB.m_invMass * PY;
  bB.m_sweep.a += bB.m_invI * (r2X * PY - r2Y * PX);
  bA.SynchronizeTransform();
  bB.SynchronizeTransform();
  return b2Math.Abs(C) < b2Settings.b2_linearSlop
};
b2DistanceJoint.prototype.GetAnchorA = function() {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
};
b2DistanceJoint.prototype.GetAnchorB = function() {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
};
b2DistanceJoint.prototype.GetReactionForce = function(inv_dt) {
  return new b2Vec2(inv_dt * this.m_impulse * this.m_u.x, inv_dt * this.m_impulse * this.m_u.y)
};
b2DistanceJoint.prototype.GetReactionTorque = function(inv_dt) {
  return 0
};
b2DistanceJoint.prototype.GetLength = function() {
  return this.m_length
};
b2DistanceJoint.prototype.SetLength = function(length) {
  this.m_length = length
};
b2DistanceJoint.prototype.GetFrequency = function() {
  return this.m_frequencyHz
};
b2DistanceJoint.prototype.SetFrequency = function(hz) {
  this.m_frequencyHz = hz
};
b2DistanceJoint.prototype.GetDampingRatio = function() {
  return this.m_dampingRatio
};
b2DistanceJoint.prototype.SetDampingRatio = function(ratio) {
  this.m_dampingRatio = ratio
};
b2DistanceJoint.prototype.m_localAnchor1 = new b2Vec2;
b2DistanceJoint.prototype.m_localAnchor2 = new b2Vec2;
b2DistanceJoint.prototype.m_u = new b2Vec2;
b2DistanceJoint.prototype.m_frequencyHz = null;
b2DistanceJoint.prototype.m_dampingRatio = null;
b2DistanceJoint.prototype.m_gamma = null;
b2DistanceJoint.prototype.m_bias = null;
b2DistanceJoint.prototype.m_impulse = null;
b2DistanceJoint.prototype.m_mass = null;
b2DistanceJoint.prototype.m_length = null;var b2PulleyJointDef = function() {
  b2JointDef.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2PulleyJointDef.prototype, b2JointDef.prototype);
b2PulleyJointDef.prototype._super = b2JointDef.prototype;
b2PulleyJointDef.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.type = b2Joint.e_pulleyJoint;
  this.groundAnchorA.Set(-1, 1);
  this.groundAnchorB.Set(1, 1);
  this.localAnchorA.Set(-1, 0);
  this.localAnchorB.Set(1, 0);
  this.lengthA = 0;
  this.maxLengthA = 0;
  this.lengthB = 0;
  this.maxLengthB = 0;
  this.ratio = 1;
  this.collideConnected = true
};
b2PulleyJointDef.prototype.__varz = function() {
  this.groundAnchorA = new b2Vec2;
  this.groundAnchorB = new b2Vec2;
  this.localAnchorA = new b2Vec2;
  this.localAnchorB = new b2Vec2
};
b2PulleyJointDef.prototype.Initialize = function(bA, bB, gaA, gaB, anchorA, anchorB, r) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.groundAnchorA.SetV(gaA);
  this.groundAnchorB.SetV(gaB);
  this.localAnchorA = this.bodyA.GetLocalPoint(anchorA);
  this.localAnchorB = this.bodyB.GetLocalPoint(anchorB);
  var d1X = anchorA.x - gaA.x;
  var d1Y = anchorA.y - gaA.y;
  this.lengthA = Math.sqrt(d1X * d1X + d1Y * d1Y);
  var d2X = anchorB.x - gaB.x;
  var d2Y = anchorB.y - gaB.y;
  this.lengthB = Math.sqrt(d2X * d2X + d2Y * d2Y);
  this.ratio = r;
  var C = this.lengthA + this.ratio * this.lengthB;
  this.maxLengthA = C - this.ratio * b2PulleyJoint.b2_minPulleyLength;
  this.maxLengthB = (C - b2PulleyJoint.b2_minPulleyLength) / this.ratio
};
b2PulleyJointDef.prototype.groundAnchorA = new b2Vec2;
b2PulleyJointDef.prototype.groundAnchorB = new b2Vec2;
b2PulleyJointDef.prototype.localAnchorA = new b2Vec2;
b2PulleyJointDef.prototype.localAnchorB = new b2Vec2;
b2PulleyJointDef.prototype.lengthA = null;
b2PulleyJointDef.prototype.maxLengthA = null;
b2PulleyJointDef.prototype.lengthB = null;
b2PulleyJointDef.prototype.maxLengthB = null;
b2PulleyJointDef.prototype.ratio = null;var b2DistanceJointDef = function() {
  b2JointDef.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2DistanceJointDef.prototype, b2JointDef.prototype);
b2DistanceJointDef.prototype._super = b2JointDef.prototype;
b2DistanceJointDef.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.type = b2Joint.e_distanceJoint;
  this.length = 1;
  this.frequencyHz = 0;
  this.dampingRatio = 0
};
b2DistanceJointDef.prototype.__varz = function() {
  this.localAnchorA = new b2Vec2;
  this.localAnchorB = new b2Vec2
};
b2DistanceJointDef.prototype.Initialize = function(bA, bB, anchorA, anchorB) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.localAnchorA.SetV(this.bodyA.GetLocalPoint(anchorA));
  this.localAnchorB.SetV(this.bodyB.GetLocalPoint(anchorB));
  var dX = anchorB.x - anchorA.x;
  var dY = anchorB.y - anchorA.y;
  this.length = Math.sqrt(dX * dX + dY * dY);
  this.frequencyHz = 0;
  this.dampingRatio = 0
};
b2DistanceJointDef.prototype.localAnchorA = new b2Vec2;
b2DistanceJointDef.prototype.localAnchorB = new b2Vec2;
b2DistanceJointDef.prototype.length = null;
b2DistanceJointDef.prototype.frequencyHz = null;
b2DistanceJointDef.prototype.dampingRatio = null;var b2FrictionJointDef = function() {
  b2JointDef.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2FrictionJointDef.prototype, b2JointDef.prototype);
b2FrictionJointDef.prototype._super = b2JointDef.prototype;
b2FrictionJointDef.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.type = b2Joint.e_frictionJoint;
  this.maxForce = 0;
  this.maxTorque = 0
};
b2FrictionJointDef.prototype.__varz = function() {
  this.localAnchorA = new b2Vec2;
  this.localAnchorB = new b2Vec2
};
b2FrictionJointDef.prototype.Initialize = function(bA, bB, anchor) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.localAnchorA.SetV(this.bodyA.GetLocalPoint(anchor));
  this.localAnchorB.SetV(this.bodyB.GetLocalPoint(anchor))
};
b2FrictionJointDef.prototype.localAnchorA = new b2Vec2;
b2FrictionJointDef.prototype.localAnchorB = new b2Vec2;
b2FrictionJointDef.prototype.maxForce = null;
b2FrictionJointDef.prototype.maxTorque = null;var b2WeldJointDef = function() {
  b2JointDef.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2WeldJointDef.prototype, b2JointDef.prototype);
b2WeldJointDef.prototype._super = b2JointDef.prototype;
b2WeldJointDef.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.type = b2Joint.e_weldJoint;
  this.referenceAngle = 0
};
b2WeldJointDef.prototype.__varz = function() {
  this.localAnchorA = new b2Vec2;
  this.localAnchorB = new b2Vec2
};
b2WeldJointDef.prototype.Initialize = function(bA, bB, anchor) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.localAnchorA.SetV(this.bodyA.GetLocalPoint(anchor));
  this.localAnchorB.SetV(this.bodyB.GetLocalPoint(anchor));
  this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle()
};
b2WeldJointDef.prototype.localAnchorA = new b2Vec2;
b2WeldJointDef.prototype.localAnchorB = new b2Vec2;
b2WeldJointDef.prototype.referenceAngle = null;var b2GearJointDef = function() {
  b2JointDef.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2GearJointDef.prototype, b2JointDef.prototype);
b2GearJointDef.prototype._super = b2JointDef.prototype;
b2GearJointDef.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.type = b2Joint.e_gearJoint;
  this.joint1 = null;
  this.joint2 = null;
  this.ratio = 1
};
b2GearJointDef.prototype.__varz = function() {
};
b2GearJointDef.prototype.joint1 = null;
b2GearJointDef.prototype.joint2 = null;
b2GearJointDef.prototype.ratio = null;var b2Color = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Color.prototype.__constructor = function(rr, gg, bb) {
  this._r = parseInt(255 * b2Math.Clamp(rr, 0, 1));
  this._g = parseInt(255 * b2Math.Clamp(gg, 0, 1));
  this._b = parseInt(255 * b2Math.Clamp(bb, 0, 1))
};
b2Color.prototype.__varz = function() {
};
b2Color.prototype.Set = function(rr, gg, bb) {
  this._r = parseInt(255 * b2Math.Clamp(rr, 0, 1));
  this._g = parseInt(255 * b2Math.Clamp(gg, 0, 1));
  this._b = parseInt(255 * b2Math.Clamp(bb, 0, 1))
};
b2Color.prototype.__defineGetter__("r", function() {
  return this._r
});
b2Color.prototype.__defineSetter__("r", function(rr) {
  this._r = parseInt(255 * b2Math.Clamp(rr, 0, 1))
});
b2Color.prototype.__defineGetter__("g", function() {
  return this._g
});
b2Color.prototype.__defineSetter__("g", function(gg) {
  this._g = parseInt(255 * b2Math.Clamp(gg, 0, 1))
});
b2Color.prototype.__defineGetter__("b", function() {
  return this._g
});
b2Color.prototype.__defineSetter__("b", function(bb) {
  this._b = parseInt(255 * b2Math.Clamp(bb, 0, 1))
});
b2Color.prototype.__defineGetter__("color", function() {
  return this._r << 16 | this._g << 8 | this._b
});
b2Color.prototype._r = 0;
b2Color.prototype._g = 0;
b2Color.prototype._b = 0;var b2FrictionJoint = function() {
  b2Joint.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2FrictionJoint.prototype, b2Joint.prototype);
b2FrictionJoint.prototype._super = b2Joint.prototype;
b2FrictionJoint.prototype.__constructor = function(def) {
  this._super.__constructor.apply(this, [def]);
  this.m_localAnchorA.SetV(def.localAnchorA);
  this.m_localAnchorB.SetV(def.localAnchorB);
  this.m_linearMass.SetZero();
  this.m_angularMass = 0;
  this.m_linearImpulse.SetZero();
  this.m_angularImpulse = 0;
  this.m_maxForce = def.maxForce;
  this.m_maxTorque = def.maxTorque
};
b2FrictionJoint.prototype.__varz = function() {
  this.m_localAnchorA = new b2Vec2;
  this.m_localAnchorB = new b2Vec2;
  this.m_linearImpulse = new b2Vec2;
  this.m_linearMass = new b2Mat22
};
b2FrictionJoint.prototype.InitVelocityConstraints = function(step) {
  var tMat;
  var tX;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  tMat = bA.m_xf.R;
  var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
  var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * rAX + tMat.col2.x * rAY;
  rAY = tMat.col1.y * rAX + tMat.col2.y * rAY;
  rAX = tX;
  tMat = bB.m_xf.R;
  var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
  var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * rBX + tMat.col2.x * rBY;
  rBY = tMat.col1.y * rBX + tMat.col2.y * rBY;
  rBX = tX;
  var mA = bA.m_invMass;
  var mB = bB.m_invMass;
  var iA = bA.m_invI;
  var iB = bB.m_invI;
  var K = new b2Mat22;
  K.col1.x = mA + mB;
  K.col2.x = 0;
  K.col1.y = 0;
  K.col2.y = mA + mB;
  K.col1.x += iA * rAY * rAY;
  K.col2.x += -iA * rAX * rAY;
  K.col1.y += -iA * rAX * rAY;
  K.col2.y += iA * rAX * rAX;
  K.col1.x += iB * rBY * rBY;
  K.col2.x += -iB * rBX * rBY;
  K.col1.y += -iB * rBX * rBY;
  K.col2.y += iB * rBX * rBX;
  K.GetInverse(this.m_linearMass);
  this.m_angularMass = iA + iB;
  if(this.m_angularMass > 0) {
    this.m_angularMass = 1 / this.m_angularMass
  }
  if(step.warmStarting) {
    this.m_linearImpulse.x *= step.dtRatio;
    this.m_linearImpulse.y *= step.dtRatio;
    this.m_angularImpulse *= step.dtRatio;
    var P = this.m_linearImpulse;
    bA.m_linearVelocity.x -= mA * P.x;
    bA.m_linearVelocity.y -= mA * P.y;
    bA.m_angularVelocity -= iA * (rAX * P.y - rAY * P.x + this.m_angularImpulse);
    bB.m_linearVelocity.x += mB * P.x;
    bB.m_linearVelocity.y += mB * P.y;
    bB.m_angularVelocity += iB * (rBX * P.y - rBY * P.x + this.m_angularImpulse)
  }else {
    this.m_linearImpulse.SetZero();
    this.m_angularImpulse = 0
  }
};
b2FrictionJoint.prototype.SolveVelocityConstraints = function(step) {
  var tMat;
  var tX;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var vA = bA.m_linearVelocity;
  var wA = bA.m_angularVelocity;
  var vB = bB.m_linearVelocity;
  var wB = bB.m_angularVelocity;
  var mA = bA.m_invMass;
  var mB = bB.m_invMass;
  var iA = bA.m_invI;
  var iB = bB.m_invI;
  tMat = bA.m_xf.R;
  var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
  var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * rAX + tMat.col2.x * rAY;
  rAY = tMat.col1.y * rAX + tMat.col2.y * rAY;
  rAX = tX;
  tMat = bB.m_xf.R;
  var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
  var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * rBX + tMat.col2.x * rBY;
  rBY = tMat.col1.y * rBX + tMat.col2.y * rBY;
  rBX = tX;
  var maxImpulse;
  var Cdot = wB - wA;
  var impulse = -this.m_angularMass * Cdot;
  var oldImpulse = this.m_angularImpulse;
  maxImpulse = step.dt * this.m_maxTorque;
  this.m_angularImpulse = b2Math.Clamp(this.m_angularImpulse + impulse, -maxImpulse, maxImpulse);
  impulse = this.m_angularImpulse - oldImpulse;
  wA -= iA * impulse;
  wB += iB * impulse;
  var CdotX = vB.x - wB * rBY - vA.x + wA * rAY;
  var CdotY = vB.y + wB * rBX - vA.y - wA * rAX;
  var impulseV = b2Math.MulMV(this.m_linearMass, new b2Vec2(-CdotX, -CdotY));
  var oldImpulseV = this.m_linearImpulse.Copy();
  this.m_linearImpulse.Add(impulseV);
  maxImpulse = step.dt * this.m_maxForce;
  if(this.m_linearImpulse.LengthSquared() > maxImpulse * maxImpulse) {
    this.m_linearImpulse.Normalize();
    this.m_linearImpulse.Multiply(maxImpulse)
  }
  impulseV = b2Math.SubtractVV(this.m_linearImpulse, oldImpulseV);
  vA.x -= mA * impulseV.x;
  vA.y -= mA * impulseV.y;
  wA -= iA * (rAX * impulseV.y - rAY * impulseV.x);
  vB.x += mB * impulseV.x;
  vB.y += mB * impulseV.y;
  wB += iB * (rBX * impulseV.y - rBY * impulseV.x);
  bA.m_angularVelocity = wA;
  bB.m_angularVelocity = wB
};
b2FrictionJoint.prototype.SolvePositionConstraints = function(baumgarte) {
  return true
};
b2FrictionJoint.prototype.GetAnchorA = function() {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchorA)
};
b2FrictionJoint.prototype.GetAnchorB = function() {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchorB)
};
b2FrictionJoint.prototype.GetReactionForce = function(inv_dt) {
  return new b2Vec2(inv_dt * this.m_linearImpulse.x, inv_dt * this.m_linearImpulse.y)
};
b2FrictionJoint.prototype.GetReactionTorque = function(inv_dt) {
  return inv_dt * this.m_angularImpulse
};
b2FrictionJoint.prototype.SetMaxForce = function(force) {
  this.m_maxForce = force
};
b2FrictionJoint.prototype.GetMaxForce = function() {
  return this.m_maxForce
};
b2FrictionJoint.prototype.SetMaxTorque = function(torque) {
  this.m_maxTorque = torque
};
b2FrictionJoint.prototype.GetMaxTorque = function() {
  return this.m_maxTorque
};
b2FrictionJoint.prototype.m_localAnchorA = new b2Vec2;
b2FrictionJoint.prototype.m_localAnchorB = new b2Vec2;
b2FrictionJoint.prototype.m_linearImpulse = new b2Vec2;
b2FrictionJoint.prototype.m_angularImpulse = null;
b2FrictionJoint.prototype.m_maxForce = null;
b2FrictionJoint.prototype.m_maxTorque = null;
b2FrictionJoint.prototype.m_linearMass = new b2Mat22;
b2FrictionJoint.prototype.m_angularMass = null;var b2Distance = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Distance.prototype.__constructor = function() {
};
b2Distance.prototype.__varz = function() {
};
b2Distance.Distance = function(output, cache, input) {
  ++b2Distance.b2_gjkCalls;
  var proxyA = input.proxyA;
  var proxyB = input.proxyB;
  var transformA = input.transformA;
  var transformB = input.transformB;
  var simplex = b2Distance.s_simplex;
  simplex.ReadCache(cache, proxyA, transformA, proxyB, transformB);
  var vertices = simplex.m_vertices;
  var k_maxIters = 20;
  var saveA = b2Distance.s_saveA;
  var saveB = b2Distance.s_saveB;
  var saveCount = 0;
  var closestPoint = simplex.GetClosestPoint();
  var distanceSqr1 = closestPoint.LengthSquared();
  var distanceSqr2 = distanceSqr1;
  var i = 0;
  var p;
  var iter = 0;
  while(iter < k_maxIters) {
    saveCount = simplex.m_count;
    for(i = 0;i < saveCount;i++) {
      saveA[i] = vertices[i].indexA;
      saveB[i] = vertices[i].indexB
    }
    switch(simplex.m_count) {
      case 1:
        break;
      case 2:
        simplex.Solve2();
        break;
      case 3:
        simplex.Solve3();
        break;
      default:
        b2Settings.b2Assert(false)
    }
    if(simplex.m_count == 3) {
      break
    }
    p = simplex.GetClosestPoint();
    distanceSqr2 = p.LengthSquared();
    if(distanceSqr2 > distanceSqr1) {
    }
    distanceSqr1 = distanceSqr2;
    var d = simplex.GetSearchDirection();
    if(d.LengthSquared() < Number.MIN_VALUE * Number.MIN_VALUE) {
      break
    }
    var vertex = vertices[simplex.m_count];
    vertex.indexA = proxyA.GetSupport(b2Math.MulTMV(transformA.R, d.GetNegative()));
    vertex.wA = b2Math.MulX(transformA, proxyA.GetVertex(vertex.indexA));
    vertex.indexB = proxyB.GetSupport(b2Math.MulTMV(transformB.R, d));
    vertex.wB = b2Math.MulX(transformB, proxyB.GetVertex(vertex.indexB));
    vertex.w = b2Math.SubtractVV(vertex.wB, vertex.wA);
    ++iter;
    ++b2Distance.b2_gjkIters;
    var duplicate = false;
    for(i = 0;i < saveCount;i++) {
      if(vertex.indexA == saveA[i] && vertex.indexB == saveB[i]) {
        duplicate = true;
        break
      }
    }
    if(duplicate) {
      break
    }
    ++simplex.m_count
  }
  b2Distance.b2_gjkMaxIters = b2Math.Max(b2Distance.b2_gjkMaxIters, iter);
  simplex.GetWitnessPoints(output.pointA, output.pointB);
  output.distance = b2Math.SubtractVV(output.pointA, output.pointB).Length();
  output.iterations = iter;
  simplex.WriteCache(cache);
  if(input.useRadii) {
    var rA = proxyA.m_radius;
    var rB = proxyB.m_radius;
    if(output.distance > rA + rB && output.distance > Number.MIN_VALUE) {
      output.distance -= rA + rB;
      var normal = b2Math.SubtractVV(output.pointB, output.pointA);
      normal.Normalize();
      output.pointA.x += rA * normal.x;
      output.pointA.y += rA * normal.y;
      output.pointB.x -= rB * normal.x;
      output.pointB.y -= rB * normal.y
    }else {
      p = new b2Vec2;
      p.x = 0.5 * (output.pointA.x + output.pointB.x);
      p.y = 0.5 * (output.pointA.y + output.pointB.y);
      output.pointA.x = output.pointB.x = p.x;
      output.pointA.y = output.pointB.y = p.y;
      output.distance = 0
    }
  }
};
b2Distance.b2_gjkCalls = 0;
b2Distance.b2_gjkIters = 0;
b2Distance.b2_gjkMaxIters = 0;
b2Distance.s_simplex = new b2Simplex;
b2Distance.s_saveA = new Array(3);
b2Distance.s_saveB = new Array(3);var b2MouseJoint = function() {
  b2Joint.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2MouseJoint.prototype, b2Joint.prototype);
b2MouseJoint.prototype._super = b2Joint.prototype;
b2MouseJoint.prototype.__constructor = function(def) {
  this._super.__constructor.apply(this, [def]);
  this.m_target.SetV(def.target);
  var tX = this.m_target.x - this.m_bodyB.m_xf.position.x;
  var tY = this.m_target.y - this.m_bodyB.m_xf.position.y;
  var tMat = this.m_bodyB.m_xf.R;
  this.m_localAnchor.x = tX * tMat.col1.x + tY * tMat.col1.y;
  this.m_localAnchor.y = tX * tMat.col2.x + tY * tMat.col2.y;
  this.m_maxForce = def.maxForce;
  this.m_impulse.SetZero();
  this.m_frequencyHz = def.frequencyHz;
  this.m_dampingRatio = def.dampingRatio;
  this.m_beta = 0;
  this.m_gamma = 0
};
b2MouseJoint.prototype.__varz = function() {
  this.K = new b2Mat22;
  this.K1 = new b2Mat22;
  this.K2 = new b2Mat22;
  this.m_localAnchor = new b2Vec2;
  this.m_target = new b2Vec2;
  this.m_impulse = new b2Vec2;
  this.m_mass = new b2Mat22;
  this.m_C = new b2Vec2
};
b2MouseJoint.prototype.InitVelocityConstraints = function(step) {
  var b = this.m_bodyB;
  var mass = b.GetMass();
  var omega = 2 * Math.PI * this.m_frequencyHz;
  var d = 2 * mass * this.m_dampingRatio * omega;
  var k = mass * omega * omega;
  this.m_gamma = step.dt * (d + step.dt * k);
  this.m_gamma = this.m_gamma != 0 ? 1 / this.m_gamma : 0;
  this.m_beta = step.dt * k * this.m_gamma;
  var tMat;
  tMat = b.m_xf.R;
  var rX = this.m_localAnchor.x - b.m_sweep.localCenter.x;
  var rY = this.m_localAnchor.y - b.m_sweep.localCenter.y;
  var tX = tMat.col1.x * rX + tMat.col2.x * rY;
  rY = tMat.col1.y * rX + tMat.col2.y * rY;
  rX = tX;
  var invMass = b.m_invMass;
  var invI = b.m_invI;
  this.K1.col1.x = invMass;
  this.K1.col2.x = 0;
  this.K1.col1.y = 0;
  this.K1.col2.y = invMass;
  this.K2.col1.x = invI * rY * rY;
  this.K2.col2.x = -invI * rX * rY;
  this.K2.col1.y = -invI * rX * rY;
  this.K2.col2.y = invI * rX * rX;
  this.K.SetM(this.K1);
  this.K.AddM(this.K2);
  this.K.col1.x += this.m_gamma;
  this.K.col2.y += this.m_gamma;
  this.K.GetInverse(this.m_mass);
  this.m_C.x = b.m_sweep.c.x + rX - this.m_target.x;
  this.m_C.y = b.m_sweep.c.y + rY - this.m_target.y;
  b.m_angularVelocity *= 0.98;
  this.m_impulse.x *= step.dtRatio;
  this.m_impulse.y *= step.dtRatio;
  b.m_linearVelocity.x += invMass * this.m_impulse.x;
  b.m_linearVelocity.y += invMass * this.m_impulse.y;
  b.m_angularVelocity += invI * (rX * this.m_impulse.y - rY * this.m_impulse.x)
};
b2MouseJoint.prototype.SolveVelocityConstraints = function(step) {
  var b = this.m_bodyB;
  var tMat;
  var tX;
  var tY;
  tMat = b.m_xf.R;
  var rX = this.m_localAnchor.x - b.m_sweep.localCenter.x;
  var rY = this.m_localAnchor.y - b.m_sweep.localCenter.y;
  tX = tMat.col1.x * rX + tMat.col2.x * rY;
  rY = tMat.col1.y * rX + tMat.col2.y * rY;
  rX = tX;
  var CdotX = b.m_linearVelocity.x + -b.m_angularVelocity * rY;
  var CdotY = b.m_linearVelocity.y + b.m_angularVelocity * rX;
  tMat = this.m_mass;
  tX = CdotX + this.m_beta * this.m_C.x + this.m_gamma * this.m_impulse.x;
  tY = CdotY + this.m_beta * this.m_C.y + this.m_gamma * this.m_impulse.y;
  var impulseX = -(tMat.col1.x * tX + tMat.col2.x * tY);
  var impulseY = -(tMat.col1.y * tX + tMat.col2.y * tY);
  var oldImpulseX = this.m_impulse.x;
  var oldImpulseY = this.m_impulse.y;
  this.m_impulse.x += impulseX;
  this.m_impulse.y += impulseY;
  var maxImpulse = step.dt * this.m_maxForce;
  if(this.m_impulse.LengthSquared() > maxImpulse * maxImpulse) {
    this.m_impulse.Multiply(maxImpulse / this.m_impulse.Length())
  }
  impulseX = this.m_impulse.x - oldImpulseX;
  impulseY = this.m_impulse.y - oldImpulseY;
  b.m_linearVelocity.x += b.m_invMass * impulseX;
  b.m_linearVelocity.y += b.m_invMass * impulseY;
  b.m_angularVelocity += b.m_invI * (rX * impulseY - rY * impulseX)
};
b2MouseJoint.prototype.SolvePositionConstraints = function(baumgarte) {
  return true
};
b2MouseJoint.prototype.GetAnchorA = function() {
  return this.m_target
};
b2MouseJoint.prototype.GetAnchorB = function() {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchor)
};
b2MouseJoint.prototype.GetReactionForce = function(inv_dt) {
  return new b2Vec2(inv_dt * this.m_impulse.x, inv_dt * this.m_impulse.y)
};
b2MouseJoint.prototype.GetReactionTorque = function(inv_dt) {
  return 0
};
b2MouseJoint.prototype.GetTarget = function() {
  return this.m_target
};
b2MouseJoint.prototype.SetTarget = function(target) {
  if(this.m_bodyB.IsAwake() == false) {
    this.m_bodyB.SetAwake(true)
  }
  this.m_target = target
};
b2MouseJoint.prototype.GetMaxForce = function() {
  return this.m_maxForce
};
b2MouseJoint.prototype.SetMaxForce = function(maxForce) {
  this.m_maxForce = maxForce
};
b2MouseJoint.prototype.GetFrequency = function() {
  return this.m_frequencyHz
};
b2MouseJoint.prototype.SetFrequency = function(hz) {
  this.m_frequencyHz = hz
};
b2MouseJoint.prototype.GetDampingRatio = function() {
  return this.m_dampingRatio
};
b2MouseJoint.prototype.SetDampingRatio = function(ratio) {
  this.m_dampingRatio = ratio
};
b2MouseJoint.prototype.K = new b2Mat22;
b2MouseJoint.prototype.K1 = new b2Mat22;
b2MouseJoint.prototype.K2 = new b2Mat22;
b2MouseJoint.prototype.m_localAnchor = new b2Vec2;
b2MouseJoint.prototype.m_target = new b2Vec2;
b2MouseJoint.prototype.m_impulse = new b2Vec2;
b2MouseJoint.prototype.m_mass = new b2Mat22;
b2MouseJoint.prototype.m_C = new b2Vec2;
b2MouseJoint.prototype.m_maxForce = null;
b2MouseJoint.prototype.m_frequencyHz = null;
b2MouseJoint.prototype.m_dampingRatio = null;
b2MouseJoint.prototype.m_beta = null;
b2MouseJoint.prototype.m_gamma = null;var b2PrismaticJointDef = function() {
  b2JointDef.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2PrismaticJointDef.prototype, b2JointDef.prototype);
b2PrismaticJointDef.prototype._super = b2JointDef.prototype;
b2PrismaticJointDef.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.type = b2Joint.e_prismaticJoint;
  this.localAxisA.Set(1, 0);
  this.referenceAngle = 0;
  this.enableLimit = false;
  this.lowerTranslation = 0;
  this.upperTranslation = 0;
  this.enableMotor = false;
  this.maxMotorForce = 0;
  this.motorSpeed = 0
};
b2PrismaticJointDef.prototype.__varz = function() {
  this.localAnchorA = new b2Vec2;
  this.localAnchorB = new b2Vec2;
  this.localAxisA = new b2Vec2
};
b2PrismaticJointDef.prototype.Initialize = function(bA, bB, anchor, axis) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.localAnchorA = this.bodyA.GetLocalPoint(anchor);
  this.localAnchorB = this.bodyB.GetLocalPoint(anchor);
  this.localAxisA = this.bodyA.GetLocalVector(axis);
  this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle()
};
b2PrismaticJointDef.prototype.localAnchorA = new b2Vec2;
b2PrismaticJointDef.prototype.localAnchorB = new b2Vec2;
b2PrismaticJointDef.prototype.localAxisA = new b2Vec2;
b2PrismaticJointDef.prototype.referenceAngle = null;
b2PrismaticJointDef.prototype.enableLimit = null;
b2PrismaticJointDef.prototype.lowerTranslation = null;
b2PrismaticJointDef.prototype.upperTranslation = null;
b2PrismaticJointDef.prototype.enableMotor = null;
b2PrismaticJointDef.prototype.maxMotorForce = null;
b2PrismaticJointDef.prototype.motorSpeed = null;var b2TimeOfImpact = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2TimeOfImpact.prototype.__constructor = function() {
};
b2TimeOfImpact.prototype.__varz = function() {
};
b2TimeOfImpact.TimeOfImpact = function(input) {
  ++b2TimeOfImpact.b2_toiCalls;
  var proxyA = input.proxyA;
  var proxyB = input.proxyB;
  var sweepA = input.sweepA;
  var sweepB = input.sweepB;
  b2Settings.b2Assert(sweepA.t0 == sweepB.t0);
  b2Settings.b2Assert(1 - sweepA.t0 > Number.MIN_VALUE);
  var radius = proxyA.m_radius + proxyB.m_radius;
  var tolerance = input.tolerance;
  var alpha = 0;
  var k_maxIterations = 1E3;
  var iter = 0;
  var target = 0;
  b2TimeOfImpact.s_cache.count = 0;
  b2TimeOfImpact.s_distanceInput.useRadii = false;
  for(;;) {
    sweepA.GetTransform(b2TimeOfImpact.s_xfA, alpha);
    sweepB.GetTransform(b2TimeOfImpact.s_xfB, alpha);
    b2TimeOfImpact.s_distanceInput.proxyA = proxyA;
    b2TimeOfImpact.s_distanceInput.proxyB = proxyB;
    b2TimeOfImpact.s_distanceInput.transformA = b2TimeOfImpact.s_xfA;
    b2TimeOfImpact.s_distanceInput.transformB = b2TimeOfImpact.s_xfB;
    b2Distance.Distance(b2TimeOfImpact.s_distanceOutput, b2TimeOfImpact.s_cache, b2TimeOfImpact.s_distanceInput);
    if(b2TimeOfImpact.s_distanceOutput.distance <= 0) {
      alpha = 1;
      break
    }
    b2TimeOfImpact.s_fcn.Initialize(b2TimeOfImpact.s_cache, proxyA, b2TimeOfImpact.s_xfA, proxyB, b2TimeOfImpact.s_xfB);
    var separation = b2TimeOfImpact.s_fcn.Evaluate(b2TimeOfImpact.s_xfA, b2TimeOfImpact.s_xfB);
    if(separation <= 0) {
      alpha = 1;
      break
    }
    if(iter == 0) {
      if(separation > radius) {
        target = b2Math.Max(radius - tolerance, 0.75 * radius)
      }else {
        target = b2Math.Max(separation - tolerance, 0.02 * radius)
      }
    }
    if(separation - target < 0.5 * tolerance) {
      if(iter == 0) {
        alpha = 1;
        break
      }
      break
    }
    var newAlpha = alpha;
    var x1 = alpha;
    var x2 = 1;
    var f1 = separation;
    sweepA.GetTransform(b2TimeOfImpact.s_xfA, x2);
    sweepB.GetTransform(b2TimeOfImpact.s_xfB, x2);
    var f2 = b2TimeOfImpact.s_fcn.Evaluate(b2TimeOfImpact.s_xfA, b2TimeOfImpact.s_xfB);
    if(f2 >= target) {
      alpha = 1;
      break
    }
    var rootIterCount = 0;
    for(;;) {
      var x;
      if(rootIterCount & 1) {
        x = x1 + (target - f1) * (x2 - x1) / (f2 - f1)
      }else {
        x = 0.5 * (x1 + x2)
      }
      sweepA.GetTransform(b2TimeOfImpact.s_xfA, x);
      sweepB.GetTransform(b2TimeOfImpact.s_xfB, x);
      var f = b2TimeOfImpact.s_fcn.Evaluate(b2TimeOfImpact.s_xfA, b2TimeOfImpact.s_xfB);
      if(b2Math.Abs(f - target) < 0.025 * tolerance) {
        newAlpha = x;
        break
      }
      if(f > target) {
        x1 = x;
        f1 = f
      }else {
        x2 = x;
        f2 = f
      }
      ++rootIterCount;
      ++b2TimeOfImpact.b2_toiRootIters;
      if(rootIterCount == 50) {
        break
      }
    }
    b2TimeOfImpact.b2_toiMaxRootIters = b2Math.Max(b2TimeOfImpact.b2_toiMaxRootIters, rootIterCount);
    if(newAlpha < (1 + 100 * Number.MIN_VALUE) * alpha) {
      break
    }
    alpha = newAlpha;
    iter++;
    ++b2TimeOfImpact.b2_toiIters;
    if(iter == k_maxIterations) {
      break
    }
  }
  b2TimeOfImpact.b2_toiMaxIters = b2Math.Max(b2TimeOfImpact.b2_toiMaxIters, iter);
  return alpha
};
b2TimeOfImpact.b2_toiCalls = 0;
b2TimeOfImpact.b2_toiIters = 0;
b2TimeOfImpact.b2_toiMaxIters = 0;
b2TimeOfImpact.b2_toiRootIters = 0;
b2TimeOfImpact.b2_toiMaxRootIters = 0;
b2TimeOfImpact.s_cache = new b2SimplexCache;
b2TimeOfImpact.s_distanceInput = new b2DistanceInput;
b2TimeOfImpact.s_xfA = new b2Transform;
b2TimeOfImpact.s_xfB = new b2Transform;
b2TimeOfImpact.s_fcn = new b2SeparationFunction;
b2TimeOfImpact.s_distanceOutput = new b2DistanceOutput;var b2GearJoint = function() {
  b2Joint.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2GearJoint.prototype, b2Joint.prototype);
b2GearJoint.prototype._super = b2Joint.prototype;
b2GearJoint.prototype.__constructor = function(def) {
  this._super.__constructor.apply(this, [def]);
  var type1 = def.joint1.m_type;
  var type2 = def.joint2.m_type;
  this.m_revolute1 = null;
  this.m_prismatic1 = null;
  this.m_revolute2 = null;
  this.m_prismatic2 = null;
  var coordinate1;
  var coordinate2;
  this.m_ground1 = def.joint1.GetBodyA();
  this.m_bodyA = def.joint1.GetBodyB();
  if(type1 == b2Joint.e_revoluteJoint) {
    this.m_revolute1 = def.joint1;
    this.m_groundAnchor1.SetV(this.m_revolute1.m_localAnchor1);
    this.m_localAnchor1.SetV(this.m_revolute1.m_localAnchor2);
    coordinate1 = this.m_revolute1.GetJointAngle()
  }else {
    this.m_prismatic1 = def.joint1;
    this.m_groundAnchor1.SetV(this.m_prismatic1.m_localAnchor1);
    this.m_localAnchor1.SetV(this.m_prismatic1.m_localAnchor2);
    coordinate1 = this.m_prismatic1.GetJointTranslation()
  }
  this.m_ground2 = def.joint2.GetBodyA();
  this.m_bodyB = def.joint2.GetBodyB();
  if(type2 == b2Joint.e_revoluteJoint) {
    this.m_revolute2 = def.joint2;
    this.m_groundAnchor2.SetV(this.m_revolute2.m_localAnchor1);
    this.m_localAnchor2.SetV(this.m_revolute2.m_localAnchor2);
    coordinate2 = this.m_revolute2.GetJointAngle()
  }else {
    this.m_prismatic2 = def.joint2;
    this.m_groundAnchor2.SetV(this.m_prismatic2.m_localAnchor1);
    this.m_localAnchor2.SetV(this.m_prismatic2.m_localAnchor2);
    coordinate2 = this.m_prismatic2.GetJointTranslation()
  }
  this.m_ratio = def.ratio;
  this.m_constant = coordinate1 + this.m_ratio * coordinate2;
  this.m_impulse = 0
};
b2GearJoint.prototype.__varz = function() {
  this.m_groundAnchor1 = new b2Vec2;
  this.m_groundAnchor2 = new b2Vec2;
  this.m_localAnchor1 = new b2Vec2;
  this.m_localAnchor2 = new b2Vec2;
  this.m_J = new b2Jacobian
};
b2GearJoint.prototype.InitVelocityConstraints = function(step) {
  var g1 = this.m_ground1;
  var g2 = this.m_ground2;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var ugX;
  var ugY;
  var rX;
  var rY;
  var tMat;
  var tVec;
  var crug;
  var tX;
  var K = 0;
  this.m_J.SetZero();
  if(this.m_revolute1) {
    this.m_J.angularA = -1;
    K += bA.m_invI
  }else {
    tMat = g1.m_xf.R;
    tVec = this.m_prismatic1.m_localXAxis1;
    ugX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
    ugY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
    tMat = bA.m_xf.R;
    rX = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    rY = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    tX = tMat.col1.x * rX + tMat.col2.x * rY;
    rY = tMat.col1.y * rX + tMat.col2.y * rY;
    rX = tX;
    crug = rX * ugY - rY * ugX;
    this.m_J.linearA.Set(-ugX, -ugY);
    this.m_J.angularA = -crug;
    K += bA.m_invMass + bA.m_invI * crug * crug
  }
  if(this.m_revolute2) {
    this.m_J.angularB = -this.m_ratio;
    K += this.m_ratio * this.m_ratio * bB.m_invI
  }else {
    tMat = g2.m_xf.R;
    tVec = this.m_prismatic2.m_localXAxis1;
    ugX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
    ugY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
    tMat = bB.m_xf.R;
    rX = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    rY = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * rX + tMat.col2.x * rY;
    rY = tMat.col1.y * rX + tMat.col2.y * rY;
    rX = tX;
    crug = rX * ugY - rY * ugX;
    this.m_J.linearB.Set(-this.m_ratio * ugX, -this.m_ratio * ugY);
    this.m_J.angularB = -this.m_ratio * crug;
    K += this.m_ratio * this.m_ratio * (bB.m_invMass + bB.m_invI * crug * crug)
  }
  this.m_mass = K > 0 ? 1 / K : 0;
  if(step.warmStarting) {
    bA.m_linearVelocity.x += bA.m_invMass * this.m_impulse * this.m_J.linearA.x;
    bA.m_linearVelocity.y += bA.m_invMass * this.m_impulse * this.m_J.linearA.y;
    bA.m_angularVelocity += bA.m_invI * this.m_impulse * this.m_J.angularA;
    bB.m_linearVelocity.x += bB.m_invMass * this.m_impulse * this.m_J.linearB.x;
    bB.m_linearVelocity.y += bB.m_invMass * this.m_impulse * this.m_J.linearB.y;
    bB.m_angularVelocity += bB.m_invI * this.m_impulse * this.m_J.angularB
  }else {
    this.m_impulse = 0
  }
};
b2GearJoint.prototype.SolveVelocityConstraints = function(step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var Cdot = this.m_J.Compute(bA.m_linearVelocity, bA.m_angularVelocity, bB.m_linearVelocity, bB.m_angularVelocity);
  var impulse = -this.m_mass * Cdot;
  this.m_impulse += impulse;
  bA.m_linearVelocity.x += bA.m_invMass * impulse * this.m_J.linearA.x;
  bA.m_linearVelocity.y += bA.m_invMass * impulse * this.m_J.linearA.y;
  bA.m_angularVelocity += bA.m_invI * impulse * this.m_J.angularA;
  bB.m_linearVelocity.x += bB.m_invMass * impulse * this.m_J.linearB.x;
  bB.m_linearVelocity.y += bB.m_invMass * impulse * this.m_J.linearB.y;
  bB.m_angularVelocity += bB.m_invI * impulse * this.m_J.angularB
};
b2GearJoint.prototype.SolvePositionConstraints = function(baumgarte) {
  var linearError = 0;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var coordinate1;
  var coordinate2;
  if(this.m_revolute1) {
    coordinate1 = this.m_revolute1.GetJointAngle()
  }else {
    coordinate1 = this.m_prismatic1.GetJointTranslation()
  }
  if(this.m_revolute2) {
    coordinate2 = this.m_revolute2.GetJointAngle()
  }else {
    coordinate2 = this.m_prismatic2.GetJointTranslation()
  }
  var C = this.m_constant - (coordinate1 + this.m_ratio * coordinate2);
  var impulse = -this.m_mass * C;
  bA.m_sweep.c.x += bA.m_invMass * impulse * this.m_J.linearA.x;
  bA.m_sweep.c.y += bA.m_invMass * impulse * this.m_J.linearA.y;
  bA.m_sweep.a += bA.m_invI * impulse * this.m_J.angularA;
  bB.m_sweep.c.x += bB.m_invMass * impulse * this.m_J.linearB.x;
  bB.m_sweep.c.y += bB.m_invMass * impulse * this.m_J.linearB.y;
  bB.m_sweep.a += bB.m_invI * impulse * this.m_J.angularB;
  bA.SynchronizeTransform();
  bB.SynchronizeTransform();
  return linearError < b2Settings.b2_linearSlop
};
b2GearJoint.prototype.GetAnchorA = function() {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
};
b2GearJoint.prototype.GetAnchorB = function() {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
};
b2GearJoint.prototype.GetReactionForce = function(inv_dt) {
  return new b2Vec2(inv_dt * this.m_impulse * this.m_J.linearB.x, inv_dt * this.m_impulse * this.m_J.linearB.y)
};
b2GearJoint.prototype.GetReactionTorque = function(inv_dt) {
  var tMat = this.m_bodyB.m_xf.R;
  var rX = this.m_localAnchor1.x - this.m_bodyB.m_sweep.localCenter.x;
  var rY = this.m_localAnchor1.y - this.m_bodyB.m_sweep.localCenter.y;
  var tX = tMat.col1.x * rX + tMat.col2.x * rY;
  rY = tMat.col1.y * rX + tMat.col2.y * rY;
  rX = tX;
  var PX = this.m_impulse * this.m_J.linearB.x;
  var PY = this.m_impulse * this.m_J.linearB.y;
  return inv_dt * (this.m_impulse * this.m_J.angularB - rX * PY + rY * PX)
};
b2GearJoint.prototype.GetRatio = function() {
  return this.m_ratio
};
b2GearJoint.prototype.SetRatio = function(ratio) {
  this.m_ratio = ratio
};
b2GearJoint.prototype.m_ground1 = null;
b2GearJoint.prototype.m_ground2 = null;
b2GearJoint.prototype.m_revolute1 = null;
b2GearJoint.prototype.m_prismatic1 = null;
b2GearJoint.prototype.m_revolute2 = null;
b2GearJoint.prototype.m_prismatic2 = null;
b2GearJoint.prototype.m_groundAnchor1 = new b2Vec2;
b2GearJoint.prototype.m_groundAnchor2 = new b2Vec2;
b2GearJoint.prototype.m_localAnchor1 = new b2Vec2;
b2GearJoint.prototype.m_localAnchor2 = new b2Vec2;
b2GearJoint.prototype.m_J = new b2Jacobian;
b2GearJoint.prototype.m_constant = null;
b2GearJoint.prototype.m_ratio = null;
b2GearJoint.prototype.m_mass = null;
b2GearJoint.prototype.m_impulse = null;var b2TOIInput = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2TOIInput.prototype.__constructor = function() {
};
b2TOIInput.prototype.__varz = function() {
  this.proxyA = new b2DistanceProxy;
  this.proxyB = new b2DistanceProxy;
  this.sweepA = new b2Sweep;
  this.sweepB = new b2Sweep
};
b2TOIInput.prototype.proxyA = new b2DistanceProxy;
b2TOIInput.prototype.proxyB = new b2DistanceProxy;
b2TOIInput.prototype.sweepA = new b2Sweep;
b2TOIInput.prototype.sweepB = new b2Sweep;
b2TOIInput.prototype.tolerance = null;var b2RevoluteJointDef = function() {
  b2JointDef.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2RevoluteJointDef.prototype, b2JointDef.prototype);
b2RevoluteJointDef.prototype._super = b2JointDef.prototype;
b2RevoluteJointDef.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.type = b2Joint.e_revoluteJoint;
  this.localAnchorA.Set(0, 0);
  this.localAnchorB.Set(0, 0);
  this.referenceAngle = 0;
  this.lowerAngle = 0;
  this.upperAngle = 0;
  this.maxMotorTorque = 0;
  this.motorSpeed = 0;
  this.enableLimit = false;
  this.enableMotor = false
};
b2RevoluteJointDef.prototype.__varz = function() {
  this.localAnchorA = new b2Vec2;
  this.localAnchorB = new b2Vec2
};
b2RevoluteJointDef.prototype.Initialize = function(bA, bB, anchor) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.localAnchorA = this.bodyA.GetLocalPoint(anchor);
  this.localAnchorB = this.bodyB.GetLocalPoint(anchor);
  this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle()
};
b2RevoluteJointDef.prototype.localAnchorA = new b2Vec2;
b2RevoluteJointDef.prototype.localAnchorB = new b2Vec2;
b2RevoluteJointDef.prototype.referenceAngle = null;
b2RevoluteJointDef.prototype.enableLimit = null;
b2RevoluteJointDef.prototype.lowerAngle = null;
b2RevoluteJointDef.prototype.upperAngle = null;
b2RevoluteJointDef.prototype.enableMotor = null;
b2RevoluteJointDef.prototype.motorSpeed = null;
b2RevoluteJointDef.prototype.maxMotorTorque = null;var b2MouseJointDef = function() {
  b2JointDef.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2MouseJointDef.prototype, b2JointDef.prototype);
b2MouseJointDef.prototype._super = b2JointDef.prototype;
b2MouseJointDef.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.type = b2Joint.e_mouseJoint;
  this.maxForce = 0;
  this.frequencyHz = 5;
  this.dampingRatio = 0.7
};
b2MouseJointDef.prototype.__varz = function() {
  this.target = new b2Vec2
};
b2MouseJointDef.prototype.target = new b2Vec2;
b2MouseJointDef.prototype.maxForce = null;
b2MouseJointDef.prototype.frequencyHz = null;
b2MouseJointDef.prototype.dampingRatio = null;var b2Contact = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Contact.prototype.__constructor = function() {
};
b2Contact.prototype.__varz = function() {
  this.m_nodeA = new b2ContactEdge;
  this.m_nodeB = new b2ContactEdge;
  this.m_manifold = new b2Manifold;
  this.m_oldManifold = new b2Manifold
};
b2Contact.s_input = new b2TOIInput;
b2Contact.e_sensorFlag = 1;
b2Contact.e_continuousFlag = 2;
b2Contact.e_islandFlag = 4;
b2Contact.e_toiFlag = 8;
b2Contact.e_touchingFlag = 16;
b2Contact.e_enabledFlag = 32;
b2Contact.e_filterFlag = 64;
b2Contact.prototype.Reset = function(fixtureA, fixtureB) {
  this.m_flags = b2Contact.e_enabledFlag;
  if(!fixtureA || !fixtureB) {
    this.m_fixtureA = null;
    this.m_fixtureB = null;
    return
  }
  if(fixtureA.IsSensor() || fixtureB.IsSensor()) {
    this.m_flags |= b2Contact.e_sensorFlag
  }
  var bodyA = fixtureA.GetBody();
  var bodyB = fixtureB.GetBody();
  if(bodyA.GetType() != b2Body.b2_dynamicBody || bodyA.IsBullet() || bodyB.GetType() != b2Body.b2_dynamicBody || bodyB.IsBullet()) {
    this.m_flags |= b2Contact.e_continuousFlag
  }
  this.m_fixtureA = fixtureA;
  this.m_fixtureB = fixtureB;
  this.m_manifold.m_pointCount = 0;
  this.m_prev = null;
  this.m_next = null;
  this.m_nodeA.contact = null;
  this.m_nodeA.prev = null;
  this.m_nodeA.next = null;
  this.m_nodeA.other = null;
  this.m_nodeB.contact = null;
  this.m_nodeB.prev = null;
  this.m_nodeB.next = null;
  this.m_nodeB.other = null
};
b2Contact.prototype.Update = function(listener) {
  var tManifold = this.m_oldManifold;
  this.m_oldManifold = this.m_manifold;
  this.m_manifold = tManifold;
  this.m_flags |= b2Contact.e_enabledFlag;
  var touching = false;
  var wasTouching = (this.m_flags & b2Contact.e_touchingFlag) == b2Contact.e_touchingFlag;
  var bodyA = this.m_fixtureA.m_body;
  var bodyB = this.m_fixtureB.m_body;
  var aabbOverlap = this.m_fixtureA.m_aabb.TestOverlap(this.m_fixtureB.m_aabb);
  if(this.m_flags & b2Contact.e_sensorFlag) {
    if(aabbOverlap) {
      var shapeA = this.m_fixtureA.GetShape();
      var shapeB = this.m_fixtureB.GetShape();
      var xfA = bodyA.GetTransform();
      var xfB = bodyB.GetTransform();
      touching = b2Shape.TestOverlap(shapeA, xfA, shapeB, xfB)
    }
    this.m_manifold.m_pointCount = 0
  }else {
    if(bodyA.GetType() != b2Body.b2_dynamicBody || bodyA.IsBullet() || bodyB.GetType() != b2Body.b2_dynamicBody || bodyB.IsBullet()) {
      this.m_flags |= b2Contact.e_continuousFlag
    }else {
      this.m_flags &= ~b2Contact.e_continuousFlag
    }
    if(aabbOverlap) {
      this.Evaluate();
      touching = this.m_manifold.m_pointCount > 0;
      for(var i = 0;i < this.m_manifold.m_pointCount;++i) {
        var mp2 = this.m_manifold.m_points[i];
        mp2.m_normalImpulse = 0;
        mp2.m_tangentImpulse = 0;
        var id2 = mp2.m_id;
        for(var j = 0;j < this.m_oldManifold.m_pointCount;++j) {
          var mp1 = this.m_oldManifold.m_points[j];
          if(mp1.m_id.key == id2.key) {
            mp2.m_normalImpulse = mp1.m_normalImpulse;
            mp2.m_tangentImpulse = mp1.m_tangentImpulse;
            break
          }
        }
      }
    }else {
      this.m_manifold.m_pointCount = 0
    }
    if(touching != wasTouching) {
      bodyA.SetAwake(true);
      bodyB.SetAwake(true)
    }
  }
  if(touching) {
    this.m_flags |= b2Contact.e_touchingFlag
  }else {
    this.m_flags &= ~b2Contact.e_touchingFlag
  }
  if(wasTouching == false && touching == true) {
    listener.BeginContact(this)
  }
  if(wasTouching == true && touching == false) {
    listener.EndContact(this)
  }
  if((this.m_flags & b2Contact.e_sensorFlag) == 0) {
    listener.PreSolve(this, this.m_oldManifold)
  }
};
b2Contact.prototype.Evaluate = function() {
};
b2Contact.prototype.ComputeTOI = function(sweepA, sweepB) {
  b2Contact.s_input.proxyA.Set(this.m_fixtureA.GetShape());
  b2Contact.s_input.proxyB.Set(this.m_fixtureB.GetShape());
  b2Contact.s_input.sweepA = sweepA;
  b2Contact.s_input.sweepB = sweepB;
  b2Contact.s_input.tolerance = b2Settings.b2_linearSlop;
  return b2TimeOfImpact.TimeOfImpact(b2Contact.s_input)
};
b2Contact.prototype.GetManifold = function() {
  return this.m_manifold
};
b2Contact.prototype.GetWorldManifold = function(worldManifold) {
  var bodyA = this.m_fixtureA.GetBody();
  var bodyB = this.m_fixtureB.GetBody();
  var shapeA = this.m_fixtureA.GetShape();
  var shapeB = this.m_fixtureB.GetShape();
  worldManifold.Initialize(this.m_manifold, bodyA.GetTransform(), shapeA.m_radius, bodyB.GetTransform(), shapeB.m_radius)
};
b2Contact.prototype.IsTouching = function() {
  return(this.m_flags & b2Contact.e_touchingFlag) == b2Contact.e_touchingFlag
};
b2Contact.prototype.IsContinuous = function() {
  return(this.m_flags & b2Contact.e_continuousFlag) == b2Contact.e_continuousFlag
};
b2Contact.prototype.SetSensor = function(sensor) {
  if(sensor) {
    this.m_flags |= b2Contact.e_sensorFlag
  }else {
    this.m_flags &= ~b2Contact.e_sensorFlag
  }
};
b2Contact.prototype.IsSensor = function() {
  return(this.m_flags & b2Contact.e_sensorFlag) == b2Contact.e_sensorFlag
};
b2Contact.prototype.SetEnabled = function(flag) {
  if(flag) {
    this.m_flags |= b2Contact.e_enabledFlag
  }else {
    this.m_flags &= ~b2Contact.e_enabledFlag
  }
};
b2Contact.prototype.IsEnabled = function() {
  return(this.m_flags & b2Contact.e_enabledFlag) == b2Contact.e_enabledFlag
};
b2Contact.prototype.GetNext = function() {
  return this.m_next
};
b2Contact.prototype.GetFixtureA = function() {
  return this.m_fixtureA
};
b2Contact.prototype.GetFixtureB = function() {
  return this.m_fixtureB
};
b2Contact.prototype.FlagForFiltering = function() {
  this.m_flags |= b2Contact.e_filterFlag
};
b2Contact.prototype.m_flags = 0;
b2Contact.prototype.m_prev = null;
b2Contact.prototype.m_next = null;
b2Contact.prototype.m_nodeA = new b2ContactEdge;
b2Contact.prototype.m_nodeB = new b2ContactEdge;
b2Contact.prototype.m_fixtureA = null;
b2Contact.prototype.m_fixtureB = null;
b2Contact.prototype.m_manifold = new b2Manifold;
b2Contact.prototype.m_oldManifold = new b2Manifold;
b2Contact.prototype.m_toi = null;var b2ContactConstraint = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactConstraint.prototype.__constructor = function() {
  this.points = new Array(b2Settings.b2_maxManifoldPoints);
  for(var i = 0;i < b2Settings.b2_maxManifoldPoints;i++) {
    this.points[i] = new b2ContactConstraintPoint
  }
};
b2ContactConstraint.prototype.__varz = function() {
  this.localPlaneNormal = new b2Vec2;
  this.localPoint = new b2Vec2;
  this.normal = new b2Vec2;
  this.normalMass = new b2Mat22;
  this.K = new b2Mat22
};
b2ContactConstraint.prototype.points = null;
b2ContactConstraint.prototype.localPlaneNormal = new b2Vec2;
b2ContactConstraint.prototype.localPoint = new b2Vec2;
b2ContactConstraint.prototype.normal = new b2Vec2;
b2ContactConstraint.prototype.normalMass = new b2Mat22;
b2ContactConstraint.prototype.K = new b2Mat22;
b2ContactConstraint.prototype.bodyA = null;
b2ContactConstraint.prototype.bodyB = null;
b2ContactConstraint.prototype.type = 0;
b2ContactConstraint.prototype.radius = null;
b2ContactConstraint.prototype.friction = null;
b2ContactConstraint.prototype.restitution = null;
b2ContactConstraint.prototype.pointCount = 0;
b2ContactConstraint.prototype.manifold = null;var b2ContactResult = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactResult.prototype.__constructor = function() {
};
b2ContactResult.prototype.__varz = function() {
  this.position = new b2Vec2;
  this.normal = new b2Vec2;
  this.id = new b2ContactID
};
b2ContactResult.prototype.shape1 = null;
b2ContactResult.prototype.shape2 = null;
b2ContactResult.prototype.position = new b2Vec2;
b2ContactResult.prototype.normal = new b2Vec2;
b2ContactResult.prototype.normalImpulse = null;
b2ContactResult.prototype.tangentImpulse = null;
b2ContactResult.prototype.id = new b2ContactID;var b2PolygonContact = function() {
  b2Contact.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2PolygonContact.prototype, b2Contact.prototype);
b2PolygonContact.prototype._super = b2Contact.prototype;
b2PolygonContact.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2PolygonContact.prototype.__varz = function() {
};
b2PolygonContact.Create = function(allocator) {
  return new b2PolygonContact
};
b2PolygonContact.Destroy = function(contact, allocator) {
};
b2PolygonContact.prototype.Evaluate = function() {
  var bA = this.m_fixtureA.GetBody();
  var bB = this.m_fixtureB.GetBody();
  b2Collision.CollidePolygons(this.m_manifold, this.m_fixtureA.GetShape(), bA.m_xf, this.m_fixtureB.GetShape(), bB.m_xf)
};
b2PolygonContact.prototype.Reset = function(fixtureA, fixtureB) {
  this._super.Reset.apply(this, [fixtureA, fixtureB])
};var ClipVertex = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
ClipVertex.prototype.__constructor = function() {
};
ClipVertex.prototype.__varz = function() {
  this.v = new b2Vec2;
  this.id = new b2ContactID
};
ClipVertex.prototype.Set = function(other) {
  this.v.SetV(other.v);
  this.id.Set(other.id)
};
ClipVertex.prototype.v = new b2Vec2;
ClipVertex.prototype.id = new b2ContactID;var b2ContactFilter = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactFilter.prototype.__constructor = function() {
};
b2ContactFilter.prototype.__varz = function() {
};
b2ContactFilter.b2_defaultFilter = new b2ContactFilter;
b2ContactFilter.prototype.ShouldCollide = function(fixtureA, fixtureB) {
  var filter1 = fixtureA.GetFilterData();
  var filter2 = fixtureB.GetFilterData();
  if(filter1.groupIndex == filter2.groupIndex && filter1.groupIndex != 0) {
    return filter1.groupIndex > 0
  }
  var collide = (filter1.maskBits & filter2.categoryBits) != 0 && (filter1.categoryBits & filter2.maskBits) != 0;
  return collide
};
b2ContactFilter.prototype.RayCollide = function(userData, fixture) {
  if(!userData) {
    return true
  }
  return this.ShouldCollide(userData, fixture)
};var b2NullContact = function() {
  b2Contact.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2NullContact.prototype, b2Contact.prototype);
b2NullContact.prototype._super = b2Contact.prototype;
b2NullContact.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2NullContact.prototype.__varz = function() {
};
b2NullContact.prototype.Evaluate = function() {
};var b2ContactListener = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactListener.prototype.__constructor = function() {
};
b2ContactListener.prototype.__varz = function() {
};
b2ContactListener.b2_defaultListener = new b2ContactListener;
b2ContactListener.prototype.BeginContact = function(contact) {
};
b2ContactListener.prototype.EndContact = function(contact) {
};
b2ContactListener.prototype.PreSolve = function(contact, oldManifold) {
};
b2ContactListener.prototype.PostSolve = function(contact, impulse) {
};var b2Island = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Island.prototype.__constructor = function() {
  this.m_bodies = new Array;
  this.m_contacts = new Array;
  this.m_joints = new Array
};
b2Island.prototype.__varz = function() {
};
b2Island.s_impulse = new b2ContactImpulse;
b2Island.prototype.Initialize = function(bodyCapacity, contactCapacity, jointCapacity, allocator, listener, contactSolver) {
  var i = 0;
  this.m_bodyCapacity = bodyCapacity;
  this.m_contactCapacity = contactCapacity;
  this.m_jointCapacity = jointCapacity;
  this.m_bodyCount = 0;
  this.m_contactCount = 0;
  this.m_jointCount = 0;
  this.m_allocator = allocator;
  this.m_listener = listener;
  this.m_contactSolver = contactSolver;
  for(i = this.m_bodies.length;i < bodyCapacity;i++) {
    this.m_bodies[i] = null
  }
  for(i = this.m_contacts.length;i < contactCapacity;i++) {
    this.m_contacts[i] = null
  }
  for(i = this.m_joints.length;i < jointCapacity;i++) {
    this.m_joints[i] = null
  }
};
b2Island.prototype.Clear = function() {
  this.m_bodyCount = 0;
  this.m_contactCount = 0;
  this.m_jointCount = 0
};
b2Island.prototype.Solve = function(step, gravity, allowSleep) {
  var i = 0;
  var j = 0;
  var b;
  var joint;
  for(i = 0;i < this.m_bodyCount;++i) {
    b = this.m_bodies[i];
    if(b.GetType() != b2Body.b2_dynamicBody) {
      continue
    }
    b.m_linearVelocity.x += step.dt * (gravity.x + b.m_invMass * b.m_force.x);
    b.m_linearVelocity.y += step.dt * (gravity.y + b.m_invMass * b.m_force.y);
    b.m_angularVelocity += step.dt * b.m_invI * b.m_torque;
    b.m_linearVelocity.Multiply(b2Math.Clamp(1 - step.dt * b.m_linearDamping, 0, 1));
    b.m_angularVelocity *= b2Math.Clamp(1 - step.dt * b.m_angularDamping, 0, 1)
  }
  this.m_contactSolver.Initialize(step, this.m_contacts, this.m_contactCount, this.m_allocator);
  var contactSolver = this.m_contactSolver;
  contactSolver.InitVelocityConstraints(step);
  for(i = 0;i < this.m_jointCount;++i) {
    joint = this.m_joints[i];
    joint.InitVelocityConstraints(step)
  }
  for(i = 0;i < step.velocityIterations;++i) {
    for(j = 0;j < this.m_jointCount;++j) {
      joint = this.m_joints[j];
      joint.SolveVelocityConstraints(step)
    }
    contactSolver.SolveVelocityConstraints()
  }
  for(i = 0;i < this.m_jointCount;++i) {
    joint = this.m_joints[i];
    joint.FinalizeVelocityConstraints()
  }
  contactSolver.FinalizeVelocityConstraints();
  for(i = 0;i < this.m_bodyCount;++i) {
    b = this.m_bodies[i];
    if(b.GetType() == b2Body.b2_staticBody) {
      continue
    }
    var translationX = step.dt * b.m_linearVelocity.x;
    var translationY = step.dt * b.m_linearVelocity.y;
    if(translationX * translationX + translationY * translationY > b2Settings.b2_maxTranslationSquared) {
      b.m_linearVelocity.Normalize();
      b.m_linearVelocity.x *= b2Settings.b2_maxTranslation * step.inv_dt;
      b.m_linearVelocity.y *= b2Settings.b2_maxTranslation * step.inv_dt
    }
    var rotation = step.dt * b.m_angularVelocity;
    if(rotation * rotation > b2Settings.b2_maxRotationSquared) {
      if(b.m_angularVelocity < 0) {
        b.m_angularVelocity = -b2Settings.b2_maxRotation * step.inv_dt
      }else {
        b.m_angularVelocity = b2Settings.b2_maxRotation * step.inv_dt
      }
    }
    b.m_sweep.c0.SetV(b.m_sweep.c);
    b.m_sweep.a0 = b.m_sweep.a;
    b.m_sweep.c.x += step.dt * b.m_linearVelocity.x;
    b.m_sweep.c.y += step.dt * b.m_linearVelocity.y;
    b.m_sweep.a += step.dt * b.m_angularVelocity;
    b.SynchronizeTransform()
  }
  for(i = 0;i < step.positionIterations;++i) {
    var contactsOkay = contactSolver.SolvePositionConstraints(b2Settings.b2_contactBaumgarte);
    var jointsOkay = true;
    for(j = 0;j < this.m_jointCount;++j) {
      joint = this.m_joints[j];
      var jointOkay = joint.SolvePositionConstraints(b2Settings.b2_contactBaumgarte);
      jointsOkay = jointsOkay && jointOkay
    }
    if(contactsOkay && jointsOkay) {
      break
    }
  }
  this.Report(contactSolver.m_constraints);
  if(allowSleep) {
    var minSleepTime = Number.MAX_VALUE;
    var linTolSqr = b2Settings.b2_linearSleepTolerance * b2Settings.b2_linearSleepTolerance;
    var angTolSqr = b2Settings.b2_angularSleepTolerance * b2Settings.b2_angularSleepTolerance;
    for(i = 0;i < this.m_bodyCount;++i) {
      b = this.m_bodies[i];
      if(b.GetType() == b2Body.b2_staticBody) {
        continue
      }
      if((b.m_flags & b2Body.e_allowSleepFlag) == 0) {
        b.m_sleepTime = 0;
        minSleepTime = 0
      }
      if((b.m_flags & b2Body.e_allowSleepFlag) == 0 || b.m_angularVelocity * b.m_angularVelocity > angTolSqr || b2Math.Dot(b.m_linearVelocity, b.m_linearVelocity) > linTolSqr) {
        b.m_sleepTime = 0;
        minSleepTime = 0
      }else {
        b.m_sleepTime += step.dt;
        minSleepTime = b2Math.Min(minSleepTime, b.m_sleepTime)
      }
    }
    if(minSleepTime >= b2Settings.b2_timeToSleep) {
      for(i = 0;i < this.m_bodyCount;++i) {
        b = this.m_bodies[i];
        b.SetAwake(false)
      }
    }
  }
};
b2Island.prototype.SolveTOI = function(subStep) {
  var i = 0;
  var j = 0;
  this.m_contactSolver.Initialize(subStep, this.m_contacts, this.m_contactCount, this.m_allocator);
  var contactSolver = this.m_contactSolver;
  for(i = 0;i < this.m_jointCount;++i) {
    this.m_joints[i].InitVelocityConstraints(subStep)
  }
  for(i = 0;i < subStep.velocityIterations;++i) {
    contactSolver.SolveVelocityConstraints();
    for(j = 0;j < this.m_jointCount;++j) {
      this.m_joints[j].SolveVelocityConstraints(subStep)
    }
  }
  for(i = 0;i < this.m_bodyCount;++i) {
    var b = this.m_bodies[i];
    if(b.GetType() == b2Body.b2_staticBody) {
      continue
    }
    var translationX = subStep.dt * b.m_linearVelocity.x;
    var translationY = subStep.dt * b.m_linearVelocity.y;
    if(translationX * translationX + translationY * translationY > b2Settings.b2_maxTranslationSquared) {
      b.m_linearVelocity.Normalize();
      b.m_linearVelocity.x *= b2Settings.b2_maxTranslation * subStep.inv_dt;
      b.m_linearVelocity.y *= b2Settings.b2_maxTranslation * subStep.inv_dt
    }
    var rotation = subStep.dt * b.m_angularVelocity;
    if(rotation * rotation > b2Settings.b2_maxRotationSquared) {
      if(b.m_angularVelocity < 0) {
        b.m_angularVelocity = -b2Settings.b2_maxRotation * subStep.inv_dt
      }else {
        b.m_angularVelocity = b2Settings.b2_maxRotation * subStep.inv_dt
      }
    }
    b.m_sweep.c0.SetV(b.m_sweep.c);
    b.m_sweep.a0 = b.m_sweep.a;
    b.m_sweep.c.x += subStep.dt * b.m_linearVelocity.x;
    b.m_sweep.c.y += subStep.dt * b.m_linearVelocity.y;
    b.m_sweep.a += subStep.dt * b.m_angularVelocity;
    b.SynchronizeTransform()
  }
  var k_toiBaumgarte = 0.75;
  for(i = 0;i < subStep.positionIterations;++i) {
    var contactsOkay = contactSolver.SolvePositionConstraints(k_toiBaumgarte);
    var jointsOkay = true;
    for(j = 0;j < this.m_jointCount;++j) {
      var jointOkay = this.m_joints[j].SolvePositionConstraints(b2Settings.b2_contactBaumgarte);
      jointsOkay = jointsOkay && jointOkay
    }
    if(contactsOkay && jointsOkay) {
      break
    }
  }
  this.Report(contactSolver.m_constraints)
};
b2Island.prototype.Report = function(constraints) {
  if(this.m_listener == null) {
    return
  }
  for(var i = 0;i < this.m_contactCount;++i) {
    var c = this.m_contacts[i];
    var cc = constraints[i];
    for(var j = 0;j < cc.pointCount;++j) {
      b2Island.s_impulse.normalImpulses[j] = cc.points[j].normalImpulse;
      b2Island.s_impulse.tangentImpulses[j] = cc.points[j].tangentImpulse
    }
    this.m_listener.PostSolve(c, b2Island.s_impulse)
  }
};
b2Island.prototype.AddBody = function(body) {
  body.m_islandIndex = this.m_bodyCount;
  this.m_bodies[this.m_bodyCount++] = body
};
b2Island.prototype.AddContact = function(contact) {
  this.m_contacts[this.m_contactCount++] = contact
};
b2Island.prototype.AddJoint = function(joint) {
  this.m_joints[this.m_jointCount++] = joint
};
b2Island.prototype.m_allocator = null;
b2Island.prototype.m_listener = null;
b2Island.prototype.m_contactSolver = null;
b2Island.prototype.m_bodies = null;
b2Island.prototype.m_contacts = null;
b2Island.prototype.m_joints = null;
b2Island.prototype.m_bodyCount = 0;
b2Island.prototype.m_jointCount = 0;
b2Island.prototype.m_contactCount = 0;
b2Island.prototype.m_bodyCapacity = 0;
b2Island.prototype.m_contactCapacity = 0;
b2Island.prototype.m_jointCapacity = 0;var b2PolyAndEdgeContact = function() {
  b2Contact.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2PolyAndEdgeContact.prototype, b2Contact.prototype);
b2PolyAndEdgeContact.prototype._super = b2Contact.prototype;
b2PolyAndEdgeContact.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2PolyAndEdgeContact.prototype.__varz = function() {
};
b2PolyAndEdgeContact.Create = function(allocator) {
  return new b2PolyAndEdgeContact
};
b2PolyAndEdgeContact.Destroy = function(contact, allocator) {
};
b2PolyAndEdgeContact.prototype.Evaluate = function() {
  var bA = this.m_fixtureA.GetBody();
  var bB = this.m_fixtureB.GetBody();
  this.b2CollidePolyAndEdge(this.m_manifold, this.m_fixtureA.GetShape(), bA.m_xf, this.m_fixtureB.GetShape(), bB.m_xf)
};
b2PolyAndEdgeContact.prototype.b2CollidePolyAndEdge = function(manifold, polygon, xf1, edge, xf2) {
};
b2PolyAndEdgeContact.prototype.Reset = function(fixtureA, fixtureB) {
  this._super.Reset.apply(this, [fixtureA, fixtureB]);
  b2Settings.b2Assert(fixtureA.GetType() == b2Shape.e_polygonShape);
  b2Settings.b2Assert(fixtureB.GetType() == b2Shape.e_edgeShape)
};var b2Collision = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Collision.prototype.__constructor = function() {
};
b2Collision.prototype.__varz = function() {
};
b2Collision.MakeClipPointVector = function() {
  var r = new Array(2);
  r[0] = new ClipVertex;
  r[1] = new ClipVertex;
  return r
};
b2Collision.ClipSegmentToLine = function(vOut, vIn, normal, offset) {
  var cv;
  var numOut = 0;
  cv = vIn[0];
  var vIn0 = cv.v;
  cv = vIn[1];
  var vIn1 = cv.v;
  var distance0 = normal.x * vIn0.x + normal.y * vIn0.y - offset;
  var distance1 = normal.x * vIn1.x + normal.y * vIn1.y - offset;
  if(distance0 <= 0) {
    vOut[numOut++].Set(vIn[0])
  }
  if(distance1 <= 0) {
    vOut[numOut++].Set(vIn[1])
  }
  if(distance0 * distance1 < 0) {
    var interp = distance0 / (distance0 - distance1);
    cv = vOut[numOut];
    var tVec = cv.v;
    tVec.x = vIn0.x + interp * (vIn1.x - vIn0.x);
    tVec.y = vIn0.y + interp * (vIn1.y - vIn0.y);
    cv = vOut[numOut];
    var cv2;
    if(distance0 > 0) {
      cv2 = vIn[0];
      cv.id = cv2.id
    }else {
      cv2 = vIn[1];
      cv.id = cv2.id
    }
    ++numOut
  }
  return numOut
};
b2Collision.EdgeSeparation = function(poly1, xf1, edge1, poly2, xf2) {
  var count1 = poly1.m_vertexCount;
  var vertices1 = poly1.m_vertices;
  var normals1 = poly1.m_normals;
  var count2 = poly2.m_vertexCount;
  var vertices2 = poly2.m_vertices;
  var tMat;
  var tVec;
  tMat = xf1.R;
  tVec = normals1[edge1];
  var normal1WorldX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
  var normal1WorldY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
  tMat = xf2.R;
  var normal1X = tMat.col1.x * normal1WorldX + tMat.col1.y * normal1WorldY;
  var normal1Y = tMat.col2.x * normal1WorldX + tMat.col2.y * normal1WorldY;
  var index = 0;
  var minDot = Number.MAX_VALUE;
  for(var i = 0;i < count2;++i) {
    tVec = vertices2[i];
    var dot = tVec.x * normal1X + tVec.y * normal1Y;
    if(dot < minDot) {
      minDot = dot;
      index = i
    }
  }
  tVec = vertices1[edge1];
  tMat = xf1.R;
  var v1X = xf1.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  var v1Y = xf1.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  tVec = vertices2[index];
  tMat = xf2.R;
  var v2X = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  var v2Y = xf2.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  v2X -= v1X;
  v2Y -= v1Y;
  var separation = v2X * normal1WorldX + v2Y * normal1WorldY;
  return separation
};
b2Collision.FindMaxSeparation = function(edgeIndex, poly1, xf1, poly2, xf2) {
  var count1 = poly1.m_vertexCount;
  var normals1 = poly1.m_normals;
  var tVec;
  var tMat;
  tMat = xf2.R;
  tVec = poly2.m_centroid;
  var dX = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  var dY = xf2.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  tMat = xf1.R;
  tVec = poly1.m_centroid;
  dX -= xf1.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  dY -= xf1.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  var dLocal1X = dX * xf1.R.col1.x + dY * xf1.R.col1.y;
  var dLocal1Y = dX * xf1.R.col2.x + dY * xf1.R.col2.y;
  var edge = 0;
  var maxDot = -Number.MAX_VALUE;
  for(var i = 0;i < count1;++i) {
    tVec = normals1[i];
    var dot = tVec.x * dLocal1X + tVec.y * dLocal1Y;
    if(dot > maxDot) {
      maxDot = dot;
      edge = i
    }
  }
  var s = b2Collision.EdgeSeparation(poly1, xf1, edge, poly2, xf2);
  var prevEdge = edge - 1 >= 0 ? edge - 1 : count1 - 1;
  var sPrev = b2Collision.EdgeSeparation(poly1, xf1, prevEdge, poly2, xf2);
  var nextEdge = edge + 1 < count1 ? edge + 1 : 0;
  var sNext = b2Collision.EdgeSeparation(poly1, xf1, nextEdge, poly2, xf2);
  var bestEdge = 0;
  var bestSeparation;
  var increment = 0;
  if(sPrev > s && sPrev > sNext) {
    increment = -1;
    bestEdge = prevEdge;
    bestSeparation = sPrev
  }else {
    if(sNext > s) {
      increment = 1;
      bestEdge = nextEdge;
      bestSeparation = sNext
    }else {
      edgeIndex[0] = edge;
      return s
    }
  }
  while(true) {
    if(increment == -1) {
      edge = bestEdge - 1 >= 0 ? bestEdge - 1 : count1 - 1
    }else {
      edge = bestEdge + 1 < count1 ? bestEdge + 1 : 0
    }
    s = b2Collision.EdgeSeparation(poly1, xf1, edge, poly2, xf2);
    if(s > bestSeparation) {
      bestEdge = edge;
      bestSeparation = s
    }else {
      break
    }
  }
  edgeIndex[0] = bestEdge;
  return bestSeparation
};
b2Collision.FindIncidentEdge = function(c, poly1, xf1, edge1, poly2, xf2) {
  var count1 = poly1.m_vertexCount;
  var normals1 = poly1.m_normals;
  var count2 = poly2.m_vertexCount;
  var vertices2 = poly2.m_vertices;
  var normals2 = poly2.m_normals;
  var tMat;
  var tVec;
  tMat = xf1.R;
  tVec = normals1[edge1];
  var normal1X = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
  var normal1Y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
  tMat = xf2.R;
  var tX = tMat.col1.x * normal1X + tMat.col1.y * normal1Y;
  normal1Y = tMat.col2.x * normal1X + tMat.col2.y * normal1Y;
  normal1X = tX;
  var index = 0;
  var minDot = Number.MAX_VALUE;
  for(var i = 0;i < count2;++i) {
    tVec = normals2[i];
    var dot = normal1X * tVec.x + normal1Y * tVec.y;
    if(dot < minDot) {
      minDot = dot;
      index = i
    }
  }
  var tClip;
  var i1 = index;
  var i2 = i1 + 1 < count2 ? i1 + 1 : 0;
  tClip = c[0];
  tVec = vertices2[i1];
  tMat = xf2.R;
  tClip.v.x = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  tClip.v.y = xf2.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  tClip.id.features.referenceEdge = edge1;
  tClip.id.features.incidentEdge = i1;
  tClip.id.features.incidentVertex = 0;
  tClip = c[1];
  tVec = vertices2[i2];
  tMat = xf2.R;
  tClip.v.x = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  tClip.v.y = xf2.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  tClip.id.features.referenceEdge = edge1;
  tClip.id.features.incidentEdge = i2;
  tClip.id.features.incidentVertex = 1
};
b2Collision.CollidePolygons = function(manifold, polyA, xfA, polyB, xfB) {
  var cv;
  manifold.m_pointCount = 0;
  var totalRadius = polyA.m_radius + polyB.m_radius;
  var edgeA = 0;
  b2Collision.s_edgeAO[0] = edgeA;
  var separationA = b2Collision.FindMaxSeparation(b2Collision.s_edgeAO, polyA, xfA, polyB, xfB);
  edgeA = b2Collision.s_edgeAO[0];
  if(separationA > totalRadius) {
    return
  }
  var edgeB = 0;
  b2Collision.s_edgeBO[0] = edgeB;
  var separationB = b2Collision.FindMaxSeparation(b2Collision.s_edgeBO, polyB, xfB, polyA, xfA);
  edgeB = b2Collision.s_edgeBO[0];
  if(separationB > totalRadius) {
    return
  }
  var poly1;
  var poly2;
  var xf1;
  var xf2;
  var edge1 = 0;
  var flip = 0;
  var k_relativeTol = 0.98;
  var k_absoluteTol = 0.0010;
  var tMat;
  if(separationB > k_relativeTol * separationA + k_absoluteTol) {
    poly1 = polyB;
    poly2 = polyA;
    xf1 = xfB;
    xf2 = xfA;
    edge1 = edgeB;
    manifold.m_type = b2Manifold.e_faceB;
    flip = 1
  }else {
    poly1 = polyA;
    poly2 = polyB;
    xf1 = xfA;
    xf2 = xfB;
    edge1 = edgeA;
    manifold.m_type = b2Manifold.e_faceA;
    flip = 0
  }
  var incidentEdge = b2Collision.s_incidentEdge;
  b2Collision.FindIncidentEdge(incidentEdge, poly1, xf1, edge1, poly2, xf2);
  var count1 = poly1.m_vertexCount;
  var vertices1 = poly1.m_vertices;
  var local_v11 = vertices1[edge1];
  var local_v12;
  if(edge1 + 1 < count1) {
    local_v12 = vertices1[parseInt(edge1 + 1)]
  }else {
    local_v12 = vertices1[0]
  }
  var localTangent = b2Collision.s_localTangent;
  localTangent.Set(local_v12.x - local_v11.x, local_v12.y - local_v11.y);
  localTangent.Normalize();
  var localNormal = b2Collision.s_localNormal;
  localNormal.x = localTangent.y;
  localNormal.y = -localTangent.x;
  var planePoint = b2Collision.s_planePoint;
  planePoint.Set(0.5 * (local_v11.x + local_v12.x), 0.5 * (local_v11.y + local_v12.y));
  var tangent = b2Collision.s_tangent;
  tMat = xf1.R;
  tangent.x = tMat.col1.x * localTangent.x + tMat.col2.x * localTangent.y;
  tangent.y = tMat.col1.y * localTangent.x + tMat.col2.y * localTangent.y;
  var tangent2 = b2Collision.s_tangent2;
  tangent2.x = -tangent.x;
  tangent2.y = -tangent.y;
  var normal = b2Collision.s_normal;
  normal.x = tangent.y;
  normal.y = -tangent.x;
  var v11 = b2Collision.s_v11;
  var v12 = b2Collision.s_v12;
  v11.x = xf1.position.x + (tMat.col1.x * local_v11.x + tMat.col2.x * local_v11.y);
  v11.y = xf1.position.y + (tMat.col1.y * local_v11.x + tMat.col2.y * local_v11.y);
  v12.x = xf1.position.x + (tMat.col1.x * local_v12.x + tMat.col2.x * local_v12.y);
  v12.y = xf1.position.y + (tMat.col1.y * local_v12.x + tMat.col2.y * local_v12.y);
  var frontOffset = normal.x * v11.x + normal.y * v11.y;
  var sideOffset1 = -tangent.x * v11.x - tangent.y * v11.y + totalRadius;
  var sideOffset2 = tangent.x * v12.x + tangent.y * v12.y + totalRadius;
  var clipPoints1 = b2Collision.s_clipPoints1;
  var clipPoints2 = b2Collision.s_clipPoints2;
  var np = 0;
  np = b2Collision.ClipSegmentToLine(clipPoints1, incidentEdge, tangent2, sideOffset1);
  if(np < 2) {
    return
  }
  np = b2Collision.ClipSegmentToLine(clipPoints2, clipPoints1, tangent, sideOffset2);
  if(np < 2) {
    return
  }
  manifold.m_localPlaneNormal.SetV(localNormal);
  manifold.m_localPoint.SetV(planePoint);
  var pointCount = 0;
  for(var i = 0;i < b2Settings.b2_maxManifoldPoints;++i) {
    cv = clipPoints2[i];
    var separation = normal.x * cv.v.x + normal.y * cv.v.y - frontOffset;
    if(separation <= totalRadius) {
      var cp = manifold.m_points[pointCount];
      tMat = xf2.R;
      var tX = cv.v.x - xf2.position.x;
      var tY = cv.v.y - xf2.position.y;
      cp.m_localPoint.x = tX * tMat.col1.x + tY * tMat.col1.y;
      cp.m_localPoint.y = tX * tMat.col2.x + tY * tMat.col2.y;
      cp.m_id.Set(cv.id);
      cp.m_id.features.flip = flip;
      ++pointCount
    }
  }
  manifold.m_pointCount = pointCount
};
b2Collision.CollideCircles = function(manifold, circle1, xf1, circle2, xf2) {
  manifold.m_pointCount = 0;
  var tMat;
  var tVec;
  tMat = xf1.R;
  tVec = circle1.m_p;
  var p1X = xf1.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  var p1Y = xf1.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  tMat = xf2.R;
  tVec = circle2.m_p;
  var p2X = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  var p2Y = xf2.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  var dX = p2X - p1X;
  var dY = p2Y - p1Y;
  var distSqr = dX * dX + dY * dY;
  var radius = circle1.m_radius + circle2.m_radius;
  if(distSqr > radius * radius) {
    return
  }
  manifold.m_type = b2Manifold.e_circles;
  manifold.m_localPoint.SetV(circle1.m_p);
  manifold.m_localPlaneNormal.SetZero();
  manifold.m_pointCount = 1;
  manifold.m_points[0].m_localPoint.SetV(circle2.m_p);
  manifold.m_points[0].m_id.key = 0
};
b2Collision.CollidePolygonAndCircle = function(manifold, polygon, xf1, circle, xf2) {
  manifold.m_pointCount = 0;
  var tPoint;
  var dX;
  var dY;
  var positionX;
  var positionY;
  var tVec;
  var tMat;
  tMat = xf2.R;
  tVec = circle.m_p;
  var cX = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  var cY = xf2.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  dX = cX - xf1.position.x;
  dY = cY - xf1.position.y;
  tMat = xf1.R;
  var cLocalX = dX * tMat.col1.x + dY * tMat.col1.y;
  var cLocalY = dX * tMat.col2.x + dY * tMat.col2.y;
  var dist;
  var normalIndex = 0;
  var separation = -Number.MAX_VALUE;
  var radius = polygon.m_radius + circle.m_radius;
  var vertexCount = polygon.m_vertexCount;
  var vertices = polygon.m_vertices;
  var normals = polygon.m_normals;
  for(var i = 0;i < vertexCount;++i) {
    tVec = vertices[i];
    dX = cLocalX - tVec.x;
    dY = cLocalY - tVec.y;
    tVec = normals[i];
    var s = tVec.x * dX + tVec.y * dY;
    if(s > radius) {
      return
    }
    if(s > separation) {
      separation = s;
      normalIndex = i
    }
  }
  var vertIndex1 = normalIndex;
  var vertIndex2 = vertIndex1 + 1 < vertexCount ? vertIndex1 + 1 : 0;
  var v1 = vertices[vertIndex1];
  var v2 = vertices[vertIndex2];
  if(separation < Number.MIN_VALUE) {
    manifold.m_pointCount = 1;
    manifold.m_type = b2Manifold.e_faceA;
    manifold.m_localPlaneNormal.SetV(normals[normalIndex]);
    manifold.m_localPoint.x = 0.5 * (v1.x + v2.x);
    manifold.m_localPoint.y = 0.5 * (v1.y + v2.y);
    manifold.m_points[0].m_localPoint.SetV(circle.m_p);
    manifold.m_points[0].m_id.key = 0;
    return
  }
  var u1 = (cLocalX - v1.x) * (v2.x - v1.x) + (cLocalY - v1.y) * (v2.y - v1.y);
  var u2 = (cLocalX - v2.x) * (v1.x - v2.x) + (cLocalY - v2.y) * (v1.y - v2.y);
  if(u1 <= 0) {
    if((cLocalX - v1.x) * (cLocalX - v1.x) + (cLocalY - v1.y) * (cLocalY - v1.y) > radius * radius) {
      return
    }
    manifold.m_pointCount = 1;
    manifold.m_type = b2Manifold.e_faceA;
    manifold.m_localPlaneNormal.x = cLocalX - v1.x;
    manifold.m_localPlaneNormal.y = cLocalY - v1.y;
    manifold.m_localPlaneNormal.Normalize();
    manifold.m_localPoint.SetV(v1);
    manifold.m_points[0].m_localPoint.SetV(circle.m_p);
    manifold.m_points[0].m_id.key = 0
  }else {
    if(u2 <= 0) {
      if((cLocalX - v2.x) * (cLocalX - v2.x) + (cLocalY - v2.y) * (cLocalY - v2.y) > radius * radius) {
        return
      }
      manifold.m_pointCount = 1;
      manifold.m_type = b2Manifold.e_faceA;
      manifold.m_localPlaneNormal.x = cLocalX - v2.x;
      manifold.m_localPlaneNormal.y = cLocalY - v2.y;
      manifold.m_localPlaneNormal.Normalize();
      manifold.m_localPoint.SetV(v2);
      manifold.m_points[0].m_localPoint.SetV(circle.m_p);
      manifold.m_points[0].m_id.key = 0
    }else {
      var faceCenterX = 0.5 * (v1.x + v2.x);
      var faceCenterY = 0.5 * (v1.y + v2.y);
      separation = (cLocalX - faceCenterX) * normals[vertIndex1].x + (cLocalY - faceCenterY) * normals[vertIndex1].y;
      if(separation > radius) {
        return
      }
      manifold.m_pointCount = 1;
      manifold.m_type = b2Manifold.e_faceA;
      manifold.m_localPlaneNormal.x = normals[vertIndex1].x;
      manifold.m_localPlaneNormal.y = normals[vertIndex1].y;
      manifold.m_localPlaneNormal.Normalize();
      manifold.m_localPoint.Set(faceCenterX, faceCenterY);
      manifold.m_points[0].m_localPoint.SetV(circle.m_p);
      manifold.m_points[0].m_id.key = 0
    }
  }
};
b2Collision.TestOverlap = function(a, b) {
  var t1 = b.lowerBound;
  var t2 = a.upperBound;
  var d1X = t1.x - t2.x;
  var d1Y = t1.y - t2.y;
  t1 = a.lowerBound;
  t2 = b.upperBound;
  var d2X = t1.x - t2.x;
  var d2Y = t1.y - t2.y;
  if(d1X > 0 || d1Y > 0) {
    return false
  }
  if(d2X > 0 || d2Y > 0) {
    return false
  }
  return true
};
b2Collision.b2_nullFeature = 255;
b2Collision.s_incidentEdge = b2Collision.MakeClipPointVector();
b2Collision.s_clipPoints1 = b2Collision.MakeClipPointVector();
b2Collision.s_clipPoints2 = b2Collision.MakeClipPointVector();
b2Collision.s_edgeAO = new Array(1);
b2Collision.s_edgeBO = new Array(1);
b2Collision.s_localTangent = new b2Vec2;
b2Collision.s_localNormal = new b2Vec2;
b2Collision.s_planePoint = new b2Vec2;
b2Collision.s_normal = new b2Vec2;
b2Collision.s_tangent = new b2Vec2;
b2Collision.s_tangent2 = new b2Vec2;
b2Collision.s_v11 = new b2Vec2;
b2Collision.s_v12 = new b2Vec2;
b2Collision.b2CollidePolyTempVec = new b2Vec2;var b2PolyAndCircleContact = function() {
  b2Contact.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2PolyAndCircleContact.prototype, b2Contact.prototype);
b2PolyAndCircleContact.prototype._super = b2Contact.prototype;
b2PolyAndCircleContact.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2PolyAndCircleContact.prototype.__varz = function() {
};
b2PolyAndCircleContact.Create = function(allocator) {
  return new b2PolyAndCircleContact
};
b2PolyAndCircleContact.Destroy = function(contact, allocator) {
};
b2PolyAndCircleContact.prototype.Evaluate = function() {
  var bA = this.m_fixtureA.m_body;
  var bB = this.m_fixtureB.m_body;
  b2Collision.CollidePolygonAndCircle(this.m_manifold, this.m_fixtureA.GetShape(), bA.m_xf, this.m_fixtureB.GetShape(), bB.m_xf)
};
b2PolyAndCircleContact.prototype.Reset = function(fixtureA, fixtureB) {
  this._super.Reset.apply(this, [fixtureA, fixtureB]);
  b2Settings.b2Assert(fixtureA.GetType() == b2Shape.e_polygonShape);
  b2Settings.b2Assert(fixtureB.GetType() == b2Shape.e_circleShape)
};var b2ContactPoint = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactPoint.prototype.__constructor = function() {
};
b2ContactPoint.prototype.__varz = function() {
  this.position = new b2Vec2;
  this.velocity = new b2Vec2;
  this.normal = new b2Vec2;
  this.id = new b2ContactID
};
b2ContactPoint.prototype.shape1 = null;
b2ContactPoint.prototype.shape2 = null;
b2ContactPoint.prototype.position = new b2Vec2;
b2ContactPoint.prototype.velocity = new b2Vec2;
b2ContactPoint.prototype.normal = new b2Vec2;
b2ContactPoint.prototype.separation = null;
b2ContactPoint.prototype.friction = null;
b2ContactPoint.prototype.restitution = null;
b2ContactPoint.prototype.id = new b2ContactID;var b2CircleContact = function() {
  b2Contact.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2CircleContact.prototype, b2Contact.prototype);
b2CircleContact.prototype._super = b2Contact.prototype;
b2CircleContact.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2CircleContact.prototype.__varz = function() {
};
b2CircleContact.Create = function(allocator) {
  return new b2CircleContact
};
b2CircleContact.Destroy = function(contact, allocator) {
};
b2CircleContact.prototype.Evaluate = function() {
  var bA = this.m_fixtureA.GetBody();
  var bB = this.m_fixtureB.GetBody();
  b2Collision.CollideCircles(this.m_manifold, this.m_fixtureA.GetShape(), bA.m_xf, this.m_fixtureB.GetShape(), bB.m_xf)
};
b2CircleContact.prototype.Reset = function(fixtureA, fixtureB) {
  this._super.Reset.apply(this, [fixtureA, fixtureB])
};var b2EdgeAndCircleContact = function() {
  b2Contact.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2EdgeAndCircleContact.prototype, b2Contact.prototype);
b2EdgeAndCircleContact.prototype._super = b2Contact.prototype;
b2EdgeAndCircleContact.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2EdgeAndCircleContact.prototype.__varz = function() {
};
b2EdgeAndCircleContact.Create = function(allocator) {
  return new b2EdgeAndCircleContact
};
b2EdgeAndCircleContact.Destroy = function(contact, allocator) {
};
b2EdgeAndCircleContact.prototype.Evaluate = function() {
  var bA = this.m_fixtureA.GetBody();
  var bB = this.m_fixtureB.GetBody();
  this.b2CollideEdgeAndCircle(this.m_manifold, this.m_fixtureA.GetShape(), bA.m_xf, this.m_fixtureB.GetShape(), bB.m_xf)
};
b2EdgeAndCircleContact.prototype.b2CollideEdgeAndCircle = function(manifold, edge, xf1, circle, xf2) {
};
b2EdgeAndCircleContact.prototype.Reset = function(fixtureA, fixtureB) {
  this._super.Reset.apply(this, [fixtureA, fixtureB])
};var b2ContactManager = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactManager.prototype.__constructor = function() {
  this.m_world = null;
  this.m_contactCount = 0;
  this.m_contactFilter = b2ContactFilter.b2_defaultFilter;
  this.m_contactListener = b2ContactListener.b2_defaultListener;
  this.m_contactFactory = new b2ContactFactory(this.m_allocator);
  this.m_broadPhase = new b2DynamicTreeBroadPhase
};
b2ContactManager.prototype.__varz = function() {
};
b2ContactManager.s_evalCP = new b2ContactPoint;
b2ContactManager.prototype.AddPair = function(proxyUserDataA, proxyUserDataB) {
  var fixtureA = proxyUserDataA;
  var fixtureB = proxyUserDataB;
  var bodyA = fixtureA.GetBody();
  var bodyB = fixtureB.GetBody();
  if(bodyA == bodyB) {
    return
  }
  var edge = bodyB.GetContactList();
  while(edge) {
    if(edge.other == bodyA) {
      var fA = edge.contact.GetFixtureA();
      var fB = edge.contact.GetFixtureB();
      if(fA == fixtureA && fB == fixtureB) {
        return
      }
      if(fA == fixtureB && fB == fixtureA) {
        return
      }
    }
    edge = edge.next
  }
  if(bodyB.ShouldCollide(bodyA) == false) {
    return
  }
  if(this.m_contactFilter.ShouldCollide(fixtureA, fixtureB) == false) {
    return
  }
  var c = this.m_contactFactory.Create(fixtureA, fixtureB);
  fixtureA = c.GetFixtureA();
  fixtureB = c.GetFixtureB();
  bodyA = fixtureA.m_body;
  bodyB = fixtureB.m_body;
  c.m_prev = null;
  c.m_next = this.m_world.m_contactList;
  if(this.m_world.m_contactList != null) {
    this.m_world.m_contactList.m_prev = c
  }
  this.m_world.m_contactList = c;
  c.m_nodeA.contact = c;
  c.m_nodeA.other = bodyB;
  c.m_nodeA.prev = null;
  c.m_nodeA.next = bodyA.m_contactList;
  if(bodyA.m_contactList != null) {
    bodyA.m_contactList.prev = c.m_nodeA
  }
  bodyA.m_contactList = c.m_nodeA;
  c.m_nodeB.contact = c;
  c.m_nodeB.other = bodyA;
  c.m_nodeB.prev = null;
  c.m_nodeB.next = bodyB.m_contactList;
  if(bodyB.m_contactList != null) {
    bodyB.m_contactList.prev = c.m_nodeB
  }
  bodyB.m_contactList = c.m_nodeB;
  ++this.m_world.m_contactCount;
  return
};
b2ContactManager.prototype.FindNewContacts = function() {
  var that = this;
  this.m_broadPhase.UpdatePairs(function(a, b) {
    return that.AddPair(a, b)
  })
};
b2ContactManager.prototype.Destroy = function(c) {
  var fixtureA = c.GetFixtureA();
  var fixtureB = c.GetFixtureB();
  var bodyA = fixtureA.GetBody();
  var bodyB = fixtureB.GetBody();
  if(c.IsTouching()) {
    this.m_contactListener.EndContact(c)
  }
  if(c.m_prev) {
    c.m_prev.m_next = c.m_next
  }
  if(c.m_next) {
    c.m_next.m_prev = c.m_prev
  }
  if(c == this.m_world.m_contactList) {
    this.m_world.m_contactList = c.m_next
  }
  if(c.m_nodeA.prev) {
    c.m_nodeA.prev.next = c.m_nodeA.next
  }
  if(c.m_nodeA.next) {
    c.m_nodeA.next.prev = c.m_nodeA.prev
  }
  if(c.m_nodeA == bodyA.m_contactList) {
    bodyA.m_contactList = c.m_nodeA.next
  }
  if(c.m_nodeB.prev) {
    c.m_nodeB.prev.next = c.m_nodeB.next
  }
  if(c.m_nodeB.next) {
    c.m_nodeB.next.prev = c.m_nodeB.prev
  }
  if(c.m_nodeB == bodyB.m_contactList) {
    bodyB.m_contactList = c.m_nodeB.next
  }
  this.m_contactFactory.Destroy(c);
  --this.m_contactCount
};
b2ContactManager.prototype.Collide = function() {
  var c = this.m_world.m_contactList;
  while(c) {
    var fixtureA = c.GetFixtureA();
    var fixtureB = c.GetFixtureB();
    var bodyA = fixtureA.GetBody();
    var bodyB = fixtureB.GetBody();
    if(bodyA.IsAwake() == false && bodyB.IsAwake() == false) {
      c = c.GetNext();
      continue
    }
    if(c.m_flags & b2Contact.e_filterFlag) {
      if(bodyB.ShouldCollide(bodyA) == false) {
        var cNuke = c;
        c = cNuke.GetNext();
        this.Destroy(cNuke);
        continue
      }
      if(this.m_contactFilter.ShouldCollide(fixtureA, fixtureB) == false) {
        cNuke = c;
        c = cNuke.GetNext();
        this.Destroy(cNuke);
        continue
      }
      c.m_flags &= ~b2Contact.e_filterFlag
    }
    var proxyA = fixtureA.m_proxy;
    var proxyB = fixtureB.m_proxy;
    var overlap = this.m_broadPhase.TestOverlap(proxyA, proxyB);
    if(overlap == false) {
      cNuke = c;
      c = cNuke.GetNext();
      this.Destroy(cNuke);
      continue
    }
    c.Update(this.m_contactListener);
    c = c.GetNext()
  }
};
b2ContactManager.prototype.m_world = null;
b2ContactManager.prototype.m_broadPhase = null;
b2ContactManager.prototype.m_contactList = null;
b2ContactManager.prototype.m_contactCount = 0;
b2ContactManager.prototype.m_contactFilter = null;
b2ContactManager.prototype.m_contactListener = null;
b2ContactManager.prototype.m_contactFactory = null;
b2ContactManager.prototype.m_allocator = null;var b2World = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2World.prototype.__constructor = function(gravity, doSleep) {
  this.m_destructionListener = null;
  this.m_debugDraw = null;
  this.m_bodyList = null;
  this.m_contactList = null;
  this.m_jointList = null;
  this.m_controllerList = null;
  this.m_bodyCount = 0;
  this.m_contactCount = 0;
  this.m_jointCount = 0;
  this.m_controllerCount = 0;
  b2World.m_warmStarting = true;
  b2World.m_continuousPhysics = true;
  this.m_allowSleep = doSleep;
  this.m_gravity = gravity;
  this.m_inv_dt0 = 0;
  this.m_contactManager.m_world = this;
  var bd = new b2BodyDef;
  this.m_groundBody = this.CreateBody(bd)
};
b2World.prototype.__varz = function() {
  this.s_stack = new Array;
  this.m_contactManager = new b2ContactManager;
  this.m_contactSolver = new b2ContactSolver;
  this.m_island = new b2Island
};
b2World.s_timestep2 = new b2TimeStep;
b2World.s_backupA = new b2Sweep;
b2World.s_backupB = new b2Sweep;
b2World.s_timestep = new b2TimeStep;
b2World.s_queue = new Array;
b2World.e_newFixture = 1;
b2World.e_locked = 2;
b2World.s_xf = new b2Transform;
b2World.s_jointColor = new b2Color(0.5, 0.8, 0.8);
b2World.m_warmStarting = null;
b2World.m_continuousPhysics = null;
b2World.prototype.Solve = function(step) {
  var b;
  for(var controller = this.m_controllerList;controller;controller = controller.m_next) {
    controller.Step(step)
  }
  var island = this.m_island;
  island.Initialize(this.m_bodyCount, this.m_contactCount, this.m_jointCount, null, this.m_contactManager.m_contactListener, this.m_contactSolver);
  for(b = this.m_bodyList;b;b = b.m_next) {
    b.m_flags &= ~b2Body.e_islandFlag
  }
  for(var c = this.m_contactList;c;c = c.m_next) {
    c.m_flags &= ~b2Contact.e_islandFlag
  }
  for(var j = this.m_jointList;j;j = j.m_next) {
    j.m_islandFlag = false
  }
  var stackSize = this.m_bodyCount;
  var stack = this.s_stack;
  for(var seed = this.m_bodyList;seed;seed = seed.m_next) {
    if(seed.m_flags & b2Body.e_islandFlag) {
      continue
    }
    if(seed.IsAwake() == false || seed.IsActive() == false) {
      continue
    }
    if(seed.GetType() == b2Body.b2_staticBody) {
      continue
    }
    island.Clear();
    var stackCount = 0;
    stack[stackCount++] = seed;
    seed.m_flags |= b2Body.e_islandFlag;
    while(stackCount > 0) {
      b = stack[--stackCount];
      island.AddBody(b);
      if(b.IsAwake() == false) {
        b.SetAwake(true)
      }
      if(b.GetType() == b2Body.b2_staticBody) {
        continue
      }
      var other;
      for(var ce = b.m_contactList;ce;ce = ce.next) {
        if(ce.contact.m_flags & b2Contact.e_islandFlag) {
          continue
        }
        if(ce.contact.IsSensor() == true || ce.contact.IsEnabled() == false || ce.contact.IsTouching() == false) {
          continue
        }
        island.AddContact(ce.contact);
        ce.contact.m_flags |= b2Contact.e_islandFlag;
        other = ce.other;
        if(other.m_flags & b2Body.e_islandFlag) {
          continue
        }
        stack[stackCount++] = other;
        other.m_flags |= b2Body.e_islandFlag
      }
      for(var jn = b.m_jointList;jn;jn = jn.next) {
        if(jn.joint.m_islandFlag == true) {
          continue
        }
        other = jn.other;
        if(other.IsActive() == false) {
          continue
        }
        island.AddJoint(jn.joint);
        jn.joint.m_islandFlag = true;
        if(other.m_flags & b2Body.e_islandFlag) {
          continue
        }
        stack[stackCount++] = other;
        other.m_flags |= b2Body.e_islandFlag
      }
    }
    island.Solve(step, this.m_gravity, this.m_allowSleep);
    for(var i = 0;i < island.m_bodyCount;++i) {
      b = island.m_bodies[i];
      if(b.GetType() == b2Body.b2_staticBody) {
        b.m_flags &= ~b2Body.e_islandFlag
      }
    }
  }
  for(i = 0;i < stack.length;++i) {
    if(!stack[i]) {
      break
    }
    stack[i] = null
  }
  for(b = this.m_bodyList;b;b = b.m_next) {
    if(b.IsAwake() == false || b.IsActive() == false) {
      continue
    }
    if(b.GetType() == b2Body.b2_staticBody) {
      continue
    }
    b.SynchronizeFixtures()
  }
  this.m_contactManager.FindNewContacts()
};
b2World.prototype.SolveTOI = function(step) {
  var b;
  var fA;
  var fB;
  var bA;
  var bB;
  var cEdge;
  var j;
  var island = this.m_island;
  island.Initialize(this.m_bodyCount, b2Settings.b2_maxTOIContactsPerIsland, b2Settings.b2_maxTOIJointsPerIsland, null, this.m_contactManager.m_contactListener, this.m_contactSolver);
  var queue = b2World.s_queue;
  for(b = this.m_bodyList;b;b = b.m_next) {
    b.m_flags &= ~b2Body.e_islandFlag;
    b.m_sweep.t0 = 0
  }
  var c;
  for(c = this.m_contactList;c;c = c.m_next) {
    c.m_flags &= ~(b2Contact.e_toiFlag | b2Contact.e_islandFlag)
  }
  for(j = this.m_jointList;j;j = j.m_next) {
    j.m_islandFlag = false
  }
  for(;;) {
    var minContact = null;
    var minTOI = 1;
    for(c = this.m_contactList;c;c = c.m_next) {
      if(c.IsSensor() == true || c.IsEnabled() == false || c.IsContinuous() == false) {
        continue
      }
      var toi = 1;
      if(c.m_flags & b2Contact.e_toiFlag) {
        toi = c.m_toi
      }else {
        fA = c.m_fixtureA;
        fB = c.m_fixtureB;
        bA = fA.m_body;
        bB = fB.m_body;
        if((bA.GetType() != b2Body.b2_dynamicBody || bA.IsAwake() == false) && (bB.GetType() != b2Body.b2_dynamicBody || bB.IsAwake() == false)) {
          continue
        }
        var t0 = bA.m_sweep.t0;
        if(bA.m_sweep.t0 < bB.m_sweep.t0) {
          t0 = bB.m_sweep.t0;
          bA.m_sweep.Advance(t0)
        }else {
          if(bB.m_sweep.t0 < bA.m_sweep.t0) {
            t0 = bA.m_sweep.t0;
            bB.m_sweep.Advance(t0)
          }
        }
        toi = c.ComputeTOI(bA.m_sweep, bB.m_sweep);
        b2Settings.b2Assert(0 <= toi && toi <= 1);
        if(toi > 0 && toi < 1) {
          toi = (1 - toi) * t0 + toi;
          if(toi > 1) {
            toi = 1
          }
        }
        c.m_toi = toi;
        c.m_flags |= b2Contact.e_toiFlag
      }
      if(Number.MIN_VALUE < toi && toi < minTOI) {
        minContact = c;
        minTOI = toi
      }
    }
    if(minContact == null || 1 - 100 * Number.MIN_VALUE < minTOI) {
      break
    }
    fA = minContact.m_fixtureA;
    fB = minContact.m_fixtureB;
    bA = fA.m_body;
    bB = fB.m_body;
    b2World.s_backupA.Set(bA.m_sweep);
    b2World.s_backupB.Set(bB.m_sweep);
    bA.Advance(minTOI);
    bB.Advance(minTOI);
    minContact.Update(this.m_contactManager.m_contactListener);
    minContact.m_flags &= ~b2Contact.e_toiFlag;
    if(minContact.IsSensor() == true || minContact.IsEnabled() == false) {
      bA.m_sweep.Set(b2World.s_backupA);
      bB.m_sweep.Set(b2World.s_backupB);
      bA.SynchronizeTransform();
      bB.SynchronizeTransform();
      continue
    }
    if(minContact.IsTouching() == false) {
      continue
    }
    var seed = bA;
    if(seed.GetType() != b2Body.b2_dynamicBody) {
      seed = bB
    }
    island.Clear();
    var queueStart = 0;
    var queueSize = 0;
    queue[queueStart + queueSize++] = seed;
    seed.m_flags |= b2Body.e_islandFlag;
    while(queueSize > 0) {
      b = queue[queueStart++];
      --queueSize;
      island.AddBody(b);
      if(b.IsAwake() == false) {
        b.SetAwake(true)
      }
      if(b.GetType() != b2Body.b2_dynamicBody) {
        continue
      }
      for(cEdge = b.m_contactList;cEdge;cEdge = cEdge.next) {
        if(island.m_contactCount == island.m_contactCapacity) {
          break
        }
        if(cEdge.contact.m_flags & b2Contact.e_islandFlag) {
          continue
        }
        if(cEdge.contact.IsSensor() == true || cEdge.contact.IsEnabled() == false || cEdge.contact.IsTouching() == false) {
          continue
        }
        island.AddContact(cEdge.contact);
        cEdge.contact.m_flags |= b2Contact.e_islandFlag;
        var other = cEdge.other;
        if(other.m_flags & b2Body.e_islandFlag) {
          continue
        }
        if(other.GetType() != b2Body.b2_staticBody) {
          other.Advance(minTOI);
          other.SetAwake(true)
        }
        queue[queueStart + queueSize] = other;
        ++queueSize;
        other.m_flags |= b2Body.e_islandFlag
      }
      for(var jEdge = b.m_jointList;jEdge;jEdge = jEdge.next) {
        if(island.m_jointCount == island.m_jointCapacity) {
          continue
        }
        if(jEdge.joint.m_islandFlag == true) {
          continue
        }
        other = jEdge.other;
        if(other.IsActive() == false) {
          continue
        }
        island.AddJoint(jEdge.joint);
        jEdge.joint.m_islandFlag = true;
        if(other.m_flags & b2Body.e_islandFlag) {
          continue
        }
        if(other.GetType() != b2Body.b2_staticBody) {
          other.Advance(minTOI);
          other.SetAwake(true)
        }
        queue[queueStart + queueSize] = other;
        ++queueSize;
        other.m_flags |= b2Body.e_islandFlag
      }
    }
    var subStep = b2World.s_timestep;
    subStep.warmStarting = false;
    subStep.dt = (1 - minTOI) * step.dt;
    subStep.inv_dt = 1 / subStep.dt;
    subStep.dtRatio = 0;
    subStep.velocityIterations = step.velocityIterations;
    subStep.positionIterations = step.positionIterations;
    island.SolveTOI(subStep);
    var i = 0;
    for(i = 0;i < island.m_bodyCount;++i) {
      b = island.m_bodies[i];
      b.m_flags &= ~b2Body.e_islandFlag;
      if(b.IsAwake() == false) {
        continue
      }
      if(b.GetType() != b2Body.b2_dynamicBody) {
        continue
      }
      b.SynchronizeFixtures();
      for(cEdge = b.m_contactList;cEdge;cEdge = cEdge.next) {
        cEdge.contact.m_flags &= ~b2Contact.e_toiFlag
      }
    }
    for(i = 0;i < island.m_contactCount;++i) {
      c = island.m_contacts[i];
      c.m_flags &= ~(b2Contact.e_toiFlag | b2Contact.e_islandFlag)
    }
    for(i = 0;i < island.m_jointCount;++i) {
      j = island.m_joints[i];
      j.m_islandFlag = false
    }
    this.m_contactManager.FindNewContacts()
  }
};
b2World.prototype.DrawJoint = function(joint) {
  var b1 = joint.GetBodyA();
  var b2 = joint.GetBodyB();
  var xf1 = b1.m_xf;
  var xf2 = b2.m_xf;
  var x1 = xf1.position;
  var x2 = xf2.position;
  var p1 = joint.GetAnchorA();
  var p2 = joint.GetAnchorB();
  var color = b2World.s_jointColor;
  switch(joint.m_type) {
    case b2Joint.e_distanceJoint:
      this.m_debugDraw.DrawSegment(p1, p2, color);
      break;
    case b2Joint.e_pulleyJoint:
      var pulley = joint;
      var s1 = pulley.GetGroundAnchorA();
      var s2 = pulley.GetGroundAnchorB();
      this.m_debugDraw.DrawSegment(s1, p1, color);
      this.m_debugDraw.DrawSegment(s2, p2, color);
      this.m_debugDraw.DrawSegment(s1, s2, color);
      break;
    case b2Joint.e_mouseJoint:
      this.m_debugDraw.DrawSegment(p1, p2, color);
      break;
    default:
      if(b1 != this.m_groundBody) {
        this.m_debugDraw.DrawSegment(x1, p1, color)
      }
      this.m_debugDraw.DrawSegment(p1, p2, color);
      if(b2 != this.m_groundBody) {
        this.m_debugDraw.DrawSegment(x2, p2, color)
      }
  }
};
b2World.prototype.DrawShape = function(shape, xf, color) {
  switch(shape.m_type) {
    case b2Shape.e_circleShape:
      var circle = shape;
      var center = b2Math.MulX(xf, circle.m_p);
      var radius = circle.m_radius;
      var axis = xf.R.col1;
      this.m_debugDraw.DrawSolidCircle(center, radius, axis, color);
      break;
    case b2Shape.e_polygonShape:
      var i = 0;
      var poly = shape;
      var vertexCount = poly.GetVertexCount();
      var localVertices = poly.GetVertices();
      var vertices = new Array(vertexCount);
      for(i = 0;i < vertexCount;++i) {
        vertices[i] = b2Math.MulX(xf, localVertices[i])
      }
      this.m_debugDraw.DrawSolidPolygon(vertices, vertexCount, color);
      break;
    case b2Shape.e_edgeShape:
      var edge = shape;
      this.m_debugDraw.DrawSegment(b2Math.MulX(xf, edge.GetVertex1()), b2Math.MulX(xf, edge.GetVertex2()), color);
      break
  }
};
b2World.prototype.SetDestructionListener = function(listener) {
  this.m_destructionListener = listener
};
b2World.prototype.SetContactFilter = function(filter) {
  this.m_contactManager.m_contactFilter = filter
};
b2World.prototype.SetContactListener = function(listener) {
  this.m_contactManager.m_contactListener = listener
};
b2World.prototype.SetDebugDraw = function(debugDraw) {
  this.m_debugDraw = debugDraw
};
b2World.prototype.SetBroadPhase = function(broadPhase) {
  var oldBroadPhase = this.m_contactManager.m_broadPhase;
  this.m_contactManager.m_broadPhase = broadPhase;
  for(var b = this.m_bodyList;b;b = b.m_next) {
    for(var f = b.m_fixtureList;f;f = f.m_next) {
      f.m_proxy = broadPhase.CreateProxy(oldBroadPhase.GetFatAABB(f.m_proxy), f)
    }
  }
};
b2World.prototype.Validate = function() {
  this.m_contactManager.m_broadPhase.Validate()
};
b2World.prototype.GetProxyCount = function() {
  return this.m_contactManager.m_broadPhase.GetProxyCount()
};
b2World.prototype.CreateBody = function(def) {
  if(this.IsLocked() == true) {
    return null
  }
  var b = new b2Body(def, this);
  b.m_prev = null;
  b.m_next = this.m_bodyList;
  if(this.m_bodyList) {
    this.m_bodyList.m_prev = b
  }
  this.m_bodyList = b;
  ++this.m_bodyCount;
  return b
};
b2World.prototype.DestroyBody = function(b) {
  if(this.IsLocked() == true) {
    return
  }
  var jn = b.m_jointList;
  while(jn) {
    var jn0 = jn;
    jn = jn.next;
    if(this.m_destructionListener) {
      this.m_destructionListener.SayGoodbyeJoint(jn0.joint)
    }
    this.DestroyJoint(jn0.joint)
  }
  var coe = b.m_controllerList;
  while(coe) {
    var coe0 = coe;
    coe = coe.nextController;
    coe0.controller.RemoveBody(b)
  }
  var ce = b.m_contactList;
  while(ce) {
    var ce0 = ce;
    ce = ce.next;
    this.m_contactManager.Destroy(ce0.contact)
  }
  b.m_contactList = null;
  var f = b.m_fixtureList;
  while(f) {
    var f0 = f;
    f = f.m_next;
    if(this.m_destructionListener) {
      this.m_destructionListener.SayGoodbyeFixture(f0)
    }
    f0.DestroyProxy(this.m_contactManager.m_broadPhase);
    f0.Destroy()
  }
  b.m_fixtureList = null;
  b.m_fixtureCount = 0;
  if(b.m_prev) {
    b.m_prev.m_next = b.m_next
  }
  if(b.m_next) {
    b.m_next.m_prev = b.m_prev
  }
  if(b == this.m_bodyList) {
    this.m_bodyList = b.m_next
  }
  --this.m_bodyCount
};
b2World.prototype.CreateJoint = function(def) {
  var j = b2Joint.Create(def, null);
  j.m_prev = null;
  j.m_next = this.m_jointList;
  if(this.m_jointList) {
    this.m_jointList.m_prev = j
  }
  this.m_jointList = j;
  ++this.m_jointCount;
  j.m_edgeA.joint = j;
  j.m_edgeA.other = j.m_bodyB;
  j.m_edgeA.prev = null;
  j.m_edgeA.next = j.m_bodyA.m_jointList;
  if(j.m_bodyA.m_jointList) {
    j.m_bodyA.m_jointList.prev = j.m_edgeA
  }
  j.m_bodyA.m_jointList = j.m_edgeA;
  j.m_edgeB.joint = j;
  j.m_edgeB.other = j.m_bodyA;
  j.m_edgeB.prev = null;
  j.m_edgeB.next = j.m_bodyB.m_jointList;
  if(j.m_bodyB.m_jointList) {
    j.m_bodyB.m_jointList.prev = j.m_edgeB
  }
  j.m_bodyB.m_jointList = j.m_edgeB;
  var bodyA = def.bodyA;
  var bodyB = def.bodyB;
  if(def.collideConnected == false) {
    var edge = bodyB.GetContactList();
    while(edge) {
      if(edge.other == bodyA) {
        edge.contact.FlagForFiltering()
      }
      edge = edge.next
    }
  }
  return j
};
b2World.prototype.DestroyJoint = function(j) {
  var collideConnected = j.m_collideConnected;
  if(j.m_prev) {
    j.m_prev.m_next = j.m_next
  }
  if(j.m_next) {
    j.m_next.m_prev = j.m_prev
  }
  if(j == this.m_jointList) {
    this.m_jointList = j.m_next
  }
  var bodyA = j.m_bodyA;
  var bodyB = j.m_bodyB;
  bodyA.SetAwake(true);
  bodyB.SetAwake(true);
  if(j.m_edgeA.prev) {
    j.m_edgeA.prev.next = j.m_edgeA.next
  }
  if(j.m_edgeA.next) {
    j.m_edgeA.next.prev = j.m_edgeA.prev
  }
  if(j.m_edgeA == bodyA.m_jointList) {
    bodyA.m_jointList = j.m_edgeA.next
  }
  j.m_edgeA.prev = null;
  j.m_edgeA.next = null;
  if(j.m_edgeB.prev) {
    j.m_edgeB.prev.next = j.m_edgeB.next
  }
  if(j.m_edgeB.next) {
    j.m_edgeB.next.prev = j.m_edgeB.prev
  }
  if(j.m_edgeB == bodyB.m_jointList) {
    bodyB.m_jointList = j.m_edgeB.next
  }
  j.m_edgeB.prev = null;
  j.m_edgeB.next = null;
  b2Joint.Destroy(j, null);
  --this.m_jointCount;
  if(collideConnected == false) {
    var edge = bodyB.GetContactList();
    while(edge) {
      if(edge.other == bodyA) {
        edge.contact.FlagForFiltering()
      }
      edge = edge.next
    }
  }
};
b2World.prototype.AddController = function(c) {
  c.m_next = this.m_controllerList;
  c.m_prev = null;
  this.m_controllerList = c;
  c.m_world = this;
  this.m_controllerCount++;
  return c
};
b2World.prototype.RemoveController = function(c) {
  if(c.m_prev) {
    c.m_prev.m_next = c.m_next
  }
  if(c.m_next) {
    c.m_next.m_prev = c.m_prev
  }
  if(this.m_controllerList == c) {
    this.m_controllerList = c.m_next
  }
  this.m_controllerCount--
};
b2World.prototype.CreateController = function(controller) {
  if(controller.m_world != this) {
    throw new Error("Controller can only be a member of one world");
  }
  controller.m_next = this.m_controllerList;
  controller.m_prev = null;
  if(this.m_controllerList) {
    this.m_controllerList.m_prev = controller
  }
  this.m_controllerList = controller;
  ++this.m_controllerCount;
  controller.m_world = this;
  return controller
};
b2World.prototype.DestroyController = function(controller) {
  controller.Clear();
  if(controller.m_next) {
    controller.m_next.m_prev = controller.m_prev
  }
  if(controller.m_prev) {
    controller.m_prev.m_next = controller.m_next
  }
  if(controller == this.m_controllerList) {
    this.m_controllerList = controller.m_next
  }
  --this.m_controllerCount
};
b2World.prototype.SetWarmStarting = function(flag) {
  b2World.m_warmStarting = flag
};
b2World.prototype.SetContinuousPhysics = function(flag) {
  b2World.m_continuousPhysics = flag
};
b2World.prototype.GetBodyCount = function() {
  return this.m_bodyCount
};
b2World.prototype.GetJointCount = function() {
  return this.m_jointCount
};
b2World.prototype.GetContactCount = function() {
  return this.m_contactCount
};
b2World.prototype.SetGravity = function(gravity) {
  this.m_gravity = gravity
};
b2World.prototype.GetGravity = function() {
  return this.m_gravity
};
b2World.prototype.GetGroundBody = function() {
  return this.m_groundBody
};
b2World.prototype.Step = function(dt, velocityIterations, positionIterations) {
  if(this.m_flags & b2World.e_newFixture) {
    this.m_contactManager.FindNewContacts();
    this.m_flags &= ~b2World.e_newFixture
  }
  this.m_flags |= b2World.e_locked;
  var step = b2World.s_timestep2;
  step.dt = dt;
  step.velocityIterations = velocityIterations;
  step.positionIterations = positionIterations;
  if(dt > 0) {
    step.inv_dt = 1 / dt
  }else {
    step.inv_dt = 0
  }
  step.dtRatio = this.m_inv_dt0 * dt;
  step.warmStarting = b2World.m_warmStarting;
  this.m_contactManager.Collide();
  if(step.dt > 0) {
    this.Solve(step)
  }
  if(b2World.m_continuousPhysics && step.dt > 0) {
    this.SolveTOI(step)
  }
  if(step.dt > 0) {
    this.m_inv_dt0 = step.inv_dt
  }
  this.m_flags &= ~b2World.e_locked
};
b2World.prototype.ClearForces = function() {
  for(var body = this.m_bodyList;body;body = body.m_next) {
    body.m_force.SetZero();
    body.m_torque = 0
  }
};
b2World.prototype.DrawDebugData = function() {
  if(this.m_debugDraw == null) {
    return
  }
  this.m_debugDraw.Clear();
  var flags = this.m_debugDraw.GetFlags();
  var i = 0;
  var b;
  var f;
  var s;
  var j;
  var bp;
  var invQ = new b2Vec2;
  var x1 = new b2Vec2;
  var x2 = new b2Vec2;
  var xf;
  var b1 = new b2AABB;
  var b2 = new b2AABB;
  var vs = [new b2Vec2, new b2Vec2, new b2Vec2, new b2Vec2];
  var color = new b2Color(0, 0, 0);
  if(flags & b2DebugDraw.e_shapeBit) {
    for(b = this.m_bodyList;b;b = b.m_next) {
      xf = b.m_xf;
      for(f = b.GetFixtureList();f;f = f.m_next) {
        s = f.GetShape();
        if(b.IsActive() == false) {
          color.Set(0.5, 0.5, 0.3);
          this.DrawShape(s, xf, color)
        }else {
          if(b.GetType() == b2Body.b2_staticBody) {
            color.Set(0.5, 0.9, 0.5);
            this.DrawShape(s, xf, color)
          }else {
            if(b.GetType() == b2Body.b2_kinematicBody) {
              color.Set(0.5, 0.5, 0.9);
              this.DrawShape(s, xf, color)
            }else {
              if(b.IsAwake() == false) {
                color.Set(0.6, 0.6, 0.6);
                this.DrawShape(s, xf, color)
              }else {
                color.Set(0.9, 0.7, 0.7);
                this.DrawShape(s, xf, color)
              }
            }
          }
        }
      }
    }
  }
  if(flags & b2DebugDraw.e_jointBit) {
    for(j = this.m_jointList;j;j = j.m_next) {
      this.DrawJoint(j)
    }
  }
  if(flags & b2DebugDraw.e_controllerBit) {
    for(var c = this.m_controllerList;c;c = c.m_next) {
      c.Draw(this.m_debugDraw)
    }
  }
  if(flags & b2DebugDraw.e_pairBit) {
    color.Set(0.3, 0.9, 0.9);
    for(var contact = this.m_contactManager.m_contactList;contact;contact = contact.GetNext()) {
      var fixtureA = contact.GetFixtureA();
      var fixtureB = contact.GetFixtureB();
      var cA = fixtureA.GetAABB().GetCenter();
      var cB = fixtureB.GetAABB().GetCenter();
      this.m_debugDraw.DrawSegment(cA, cB, color)
    }
  }
  if(flags & b2DebugDraw.e_aabbBit) {
    bp = this.m_contactManager.m_broadPhase;
    vs = [new b2Vec2, new b2Vec2, new b2Vec2, new b2Vec2];
    for(b = this.m_bodyList;b;b = b.GetNext()) {
      if(b.IsActive() == false) {
        continue
      }
      for(f = b.GetFixtureList();f;f = f.GetNext()) {
        var aabb = bp.GetFatAABB(f.m_proxy);
        vs[0].Set(aabb.lowerBound.x, aabb.lowerBound.y);
        vs[1].Set(aabb.upperBound.x, aabb.lowerBound.y);
        vs[2].Set(aabb.upperBound.x, aabb.upperBound.y);
        vs[3].Set(aabb.lowerBound.x, aabb.upperBound.y);
        this.m_debugDraw.DrawPolygon(vs, 4, color)
      }
    }
  }
  if(flags & b2DebugDraw.e_centerOfMassBit) {
    for(b = this.m_bodyList;b;b = b.m_next) {
      xf = b2World.s_xf;
      xf.R = b.m_xf.R;
      xf.position = b.GetWorldCenter();
      this.m_debugDraw.DrawTransform(xf)
    }
  }
};
b2World.prototype.QueryAABB = function(callback, aabb) {
  var broadPhase = this.m_contactManager.m_broadPhase;
  function WorldQueryWrapper(proxy) {
    return callback(broadPhase.GetUserData(proxy))
  }
  broadPhase.Query(WorldQueryWrapper, aabb)
};
b2World.prototype.QueryShape = function(callback, shape, transform) {
  if(transform == null) {
    transform = new b2Transform;
    transform.SetIdentity()
  }
  var broadPhase = this.m_contactManager.m_broadPhase;
  function WorldQueryWrapper(proxy) {
    var fixture = broadPhase.GetUserData(proxy);
    if(b2Shape.TestOverlap(shape, transform, fixture.GetShape(), fixture.GetBody().GetTransform())) {
      return callback(fixture)
    }
    return true
  }
  var aabb = new b2AABB;
  shape.ComputeAABB(aabb, transform);
  broadPhase.Query(WorldQueryWrapper, aabb)
};
b2World.prototype.QueryPoint = function(callback, p) {
  var broadPhase = this.m_contactManager.m_broadPhase;
  function WorldQueryWrapper(proxy) {
    var fixture = broadPhase.GetUserData(proxy);
    if(fixture.TestPoint(p)) {
      return callback(fixture)
    }
    return true
  }
  var aabb = new b2AABB;
  aabb.lowerBound.Set(p.x - b2Settings.b2_linearSlop, p.y - b2Settings.b2_linearSlop);
  aabb.upperBound.Set(p.x + b2Settings.b2_linearSlop, p.y + b2Settings.b2_linearSlop);
  broadPhase.Query(WorldQueryWrapper, aabb)
};
b2World.prototype.RayCast = function(callback, point1, point2) {
  var broadPhase = this.m_contactManager.m_broadPhase;
  var output = new b2RayCastOutput;
  function RayCastWrapper(input, proxy) {
    var userData = broadPhase.GetUserData(proxy);
    var fixture = userData;
    var hit = fixture.RayCast(output, input);
    if(hit) {
      var fraction = output.fraction;
      var point = new b2Vec2((1 - fraction) * point1.x + fraction * point2.x, (1 - fraction) * point1.y + fraction * point2.y);
      return callback(fixture, point, output.normal, fraction)
    }
    return input.maxFraction
  }
  var input = new b2RayCastInput(point1, point2);
  broadPhase.RayCast(RayCastWrapper, input)
};
b2World.prototype.RayCastOne = function(point1, point2) {
  var result;
  function RayCastOneWrapper(fixture, point, normal, fraction) {
    result = fixture;
    return fraction
  }
  this.RayCast(RayCastOneWrapper, point1, point2);
  return result
};
b2World.prototype.RayCastAll = function(point1, point2) {
  var result = new Array;
  function RayCastAllWrapper(fixture, point, normal, fraction) {
    result[result.length] = fixture;
    return 1
  }
  this.RayCast(RayCastAllWrapper, point1, point2);
  return result
};
b2World.prototype.GetBodyList = function() {
  return this.m_bodyList
};
b2World.prototype.GetJointList = function() {
  return this.m_jointList
};
b2World.prototype.GetContactList = function() {
  return this.m_contactList
};
b2World.prototype.IsLocked = function() {
  return(this.m_flags & b2World.e_locked) > 0
};
b2World.prototype.s_stack = new Array;
b2World.prototype.m_flags = 0;
b2World.prototype.m_contactManager = new b2ContactManager;
b2World.prototype.m_contactSolver = new b2ContactSolver;
b2World.prototype.m_island = new b2Island;
b2World.prototype.m_bodyList = null;
b2World.prototype.m_jointList = null;
b2World.prototype.m_contactList = null;
b2World.prototype.m_bodyCount = 0;
b2World.prototype.m_contactCount = 0;
b2World.prototype.m_jointCount = 0;
b2World.prototype.m_controllerList = null;
b2World.prototype.m_controllerCount = 0;
b2World.prototype.m_gravity = null;
b2World.prototype.m_allowSleep = null;
b2World.prototype.m_groundBody = null;
b2World.prototype.m_destructionListener = null;
b2World.prototype.m_debugDraw = null;
b2World.prototype.m_inv_dt0 = null;if(typeof exports !== "undefined") {
  exports.b2BoundValues = b2BoundValues;
  exports.b2Math = b2Math;
  exports.b2DistanceOutput = b2DistanceOutput;
  exports.b2Mat33 = b2Mat33;
  exports.b2ContactPoint = b2ContactPoint;
  exports.b2PairManager = b2PairManager;
  exports.b2PositionSolverManifold = b2PositionSolverManifold;
  exports.b2OBB = b2OBB;
  exports.b2CircleContact = b2CircleContact;
  exports.b2PulleyJoint = b2PulleyJoint;
  exports.b2Pair = b2Pair;
  exports.b2TimeStep = b2TimeStep;
  exports.b2FixtureDef = b2FixtureDef;
  exports.b2World = b2World;
  exports.b2PrismaticJoint = b2PrismaticJoint;
  exports.b2Controller = b2Controller;
  exports.b2ContactID = b2ContactID;
  exports.b2RevoluteJoint = b2RevoluteJoint;
  exports.b2JointDef = b2JointDef;
  exports.b2Transform = b2Transform;
  exports.b2GravityController = b2GravityController;
  exports.b2EdgeAndCircleContact = b2EdgeAndCircleContact;
  exports.b2EdgeShape = b2EdgeShape;
  exports.b2BuoyancyController = b2BuoyancyController;
  exports.b2LineJointDef = b2LineJointDef;
  exports.b2Contact = b2Contact;
  exports.b2DistanceJoint = b2DistanceJoint;
  exports.b2Body = b2Body;
  exports.b2DestructionListener = b2DestructionListener;
  exports.b2PulleyJointDef = b2PulleyJointDef;
  exports.b2ContactEdge = b2ContactEdge;
  exports.b2ContactConstraint = b2ContactConstraint;
  exports.b2ContactImpulse = b2ContactImpulse;
  exports.b2DistanceJointDef = b2DistanceJointDef;
  exports.b2ContactResult = b2ContactResult;
  exports.b2EdgeChainDef = b2EdgeChainDef;
  exports.b2Vec2 = b2Vec2;
  exports.b2Vec3 = b2Vec3;
  exports.b2DistanceProxy = b2DistanceProxy;
  exports.b2FrictionJointDef = b2FrictionJointDef;
  exports.b2PolygonContact = b2PolygonContact;
  exports.b2TensorDampingController = b2TensorDampingController;
  exports.b2ContactFactory = b2ContactFactory;
  exports.b2WeldJointDef = b2WeldJointDef;
  exports.b2ConstantAccelController = b2ConstantAccelController;
  exports.b2GearJointDef = b2GearJointDef;
  exports.ClipVertex = ClipVertex;
  exports.b2SeparationFunction = b2SeparationFunction;
  exports.b2ManifoldPoint = b2ManifoldPoint;
  exports.b2Color = b2Color;
  exports.b2PolygonShape = b2PolygonShape;
  exports.b2DynamicTreePair = b2DynamicTreePair;
  exports.b2ContactConstraintPoint = b2ContactConstraintPoint;
  exports.b2FrictionJoint = b2FrictionJoint;
  exports.b2ContactFilter = b2ContactFilter;
  exports.b2ControllerEdge = b2ControllerEdge;
  exports.b2Distance = b2Distance;
  exports.b2Fixture = b2Fixture;
  exports.b2DynamicTreeNode = b2DynamicTreeNode;
  exports.b2MouseJoint = b2MouseJoint;
  exports.b2DistanceInput = b2DistanceInput;
  exports.b2BodyDef = b2BodyDef;
  exports.b2DynamicTreeBroadPhase = b2DynamicTreeBroadPhase;
  exports.b2Settings = b2Settings;
  exports.b2Proxy = b2Proxy;
  exports.b2Point = b2Point;
  exports.b2BroadPhase = b2BroadPhase;
  exports.b2Manifold = b2Manifold;
  exports.b2WorldManifold = b2WorldManifold;
  exports.b2PrismaticJointDef = b2PrismaticJointDef;
  exports.b2RayCastOutput = b2RayCastOutput;
  exports.b2ConstantForceController = b2ConstantForceController;
  exports.b2TimeOfImpact = b2TimeOfImpact;
  exports.b2CircleShape = b2CircleShape;
  exports.b2MassData = b2MassData;
  exports.b2Joint = b2Joint;
  exports.b2GearJoint = b2GearJoint;
  exports.b2DynamicTree = b2DynamicTree;
  exports.b2JointEdge = b2JointEdge;
  exports.b2LineJoint = b2LineJoint;
  exports.b2NullContact = b2NullContact;
  exports.b2ContactListener = b2ContactListener;
  exports.b2RayCastInput = b2RayCastInput;
  exports.b2TOIInput = b2TOIInput;
  exports.Features = Features;
  exports.b2FilterData = b2FilterData;
  exports.b2Island = b2Island;
  exports.b2ContactManager = b2ContactManager;
  exports.b2ContactSolver = b2ContactSolver;
  exports.b2Simplex = b2Simplex;
  exports.b2AABB = b2AABB;
  exports.b2Jacobian = b2Jacobian;
  exports.b2Bound = b2Bound;
  exports.b2RevoluteJointDef = b2RevoluteJointDef;
  exports.b2PolyAndEdgeContact = b2PolyAndEdgeContact;
  exports.b2SimplexVertex = b2SimplexVertex;
  exports.b2WeldJoint = b2WeldJoint;
  exports.b2Collision = b2Collision;
  exports.b2Mat22 = b2Mat22;
  exports.b2SimplexCache = b2SimplexCache;
  exports.b2PolyAndCircleContact = b2PolyAndCircleContact;
  exports.b2MouseJointDef = b2MouseJointDef;
  exports.b2Shape = b2Shape;
  exports.b2Segment = b2Segment;
  exports.b2ContactRegister = b2ContactRegister;
  exports.b2DebugDraw = b2DebugDraw;
  exports.b2Sweep = b2Sweep
}
;

}};
__resources__["/__builtin__/libs/cocos2d/ActionManager.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    console = require('system').console,
    Timer = require('./Scheduler').Timer,
    Scheduler = require('./Scheduler').Scheduler;

var ActionManager = BObject.extend(/** @lends cocos.ActionManager# */{
    targets: null,
    currentTarget: null,
    currentTargetSalvaged: null,

    /**
     * <p>A singleton that manages all the actions. Normally you
     * won't need to use this singleton directly. 99% of the cases you will use the
     * cocos.nodes.Node interface, which uses this singleton. But there are some cases where
     * you might need to use this singleton. Examples:</p>
     *
     * <ul>
     * <li>When you want to run an action where the target is different from a cocos.nodes.Node</li>
     * <li>When you want to pause / resume the actions</li>
     * </ul>
     *
     * @memberOf cocos
     * @constructs
     * @extends BObject
     * @singleton
     */
    init: function () {
        ActionManager.superclass.init.call(this);

        Scheduler.get('sharedScheduler').scheduleUpdate({target: this, priority: 0, paused: false});
        this.targets = [];
    },

    /**
     * Adds an action with a target. If the target is already present, then the
     * action will be added to the existing target. If the target is not
     * present, a new instance of this target will be created either paused or
     * paused, and the action will be added to the newly created target. When
     * the target is paused, the queued actions won't be 'ticked'.
     *
     * @opt {cocos.nodes.Node} target Node to run the action on
     */
    addAction: function (opts) {

        var targetID = opts.target.get('id');
        var element = this.targets[targetID];

        if (!element) {
            element = this.targets[targetID] = {
                paused: false,
                target: opts.target,
                actions: []
            };
        }

        element.actions.push(opts.action);

        opts.action.startWithTarget(opts.target);
    },

    /**
     * Remove an action
     *
     * @param {cocos.actions.Action} action Action to remove
     */
    removeAction: function (action) {
        var targetID = action.originalTarget.get('id'),
            element = this.targets[targetID];

        if (!element) {
            return;
        }

        var actionIndex = element.actions.indexOf(action);

        if (actionIndex == -1) {
            return;
        }

        if (this.currentTarget == element) {
            element.currentActionSalvaged = true;
        } 
        
        element.actions[actionIndex] = null;
        element.actions.splice(actionIndex, 1); // Delete array item

        if (element.actions.length === 0) {
            if (this.currentTarget == element) {
                this.set('currentTargetSalvaged', true);
            }
        }
            
    },

    /**
     * Remove all actions for a cocos.nodes.Node
     *
     * @param {cocos.nodes.Node} target Node to remove all actions for
     */
    removeAllActionsFromTarget: function (target) {
        var targetID = target.get('id');

        var element = this.targets[targetID];
        if (!element) {
            return;
        }

        // Delete everything in array but don't replace it incase something else has a reference
        element.actions.splice(0, element.actions.length - 1);
    },

    /**
     * @private
     */
    update: function (dt) {
        var self = this;
        util.each(this.targets, function (currentTarget, i) {

            if (!currentTarget) {
                return;
            }
            self.currentTarget = currentTarget;

            if (!currentTarget.paused) {
                util.each(currentTarget.actions, function (currentAction, j) {
                    if (!currentAction) {
                        return;
                    }

                    currentTarget.currentAction = currentAction;
                    currentTarget.currentActionSalvaged = false;

                    currentTarget.currentAction.step(dt);

                    if (currentTarget.currentAction.get('isDone')) {
                        currentTarget.currentAction.stop();

                        var a = currentTarget.currentAction;
                        currentTarget.currentAction = null;
                        self.removeAction(a);
                    }

                    currentTarget.currentAction = null;

                });
            }

            if (self.currentTargetSalvaged && currentTarget.actions.length === 0) {
                self.targets[i] = null;
                delete self.targets[i];
            }
        });
    },

    pauseTarget: function (target) {
    },

	resumeTarget: function (target) {
		// TODO
	}
});

util.extend(ActionManager, /** @lends cocos.ActionManager */{
    /**
     * Singleton instance of cocos.ActionManager
     * @getter sharedManager
     * @type cocos.ActionManager
     */
    get_sharedManager: function (key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }
});

exports.ActionManager = ActionManager;

}};
__resources__["/__builtin__/libs/cocos2d/actions/Action.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    console = require('system').console;

/** 
 * @memberOf cocos.actions
 * @class Base class for Actions
 * @extends BObject
 * @constructor
 */
var Action = BObject.extend(/** @lends cocos.actions.Action# */{
    /**
     * The Node the action is being performed on
     * @type cocos.nodes.Node
     */
    target: null,
    originalTarget: null,

    /**
     * Called every frame with it's delta time.
     *
     * @param {Float} dt The delta time
     */
    step: function (dt) {
        console.log('Action.step() Override me');
    },

    /**
     * Called once per frame.
     *
     * @param {Float} time How much of the animation has played. 0.0 = just started, 1.0 just finished.
     */
    update: function (time) {
        console.log('Action.update() Override me');
    },

    /**
     * Called before the action start. It will also set the target.
     *
     * @param {cocos.nodes.Node} target The Node to run the action on
     */
    startWithTarget: function (target) {
        this.target = this.originalTarget = target;
    },

    /**
     * Called after the action has finished. It will set the 'target' to nil.
     * <strong>Important</strong>: You should never call cocos.actions.Action#stop manually.
     * Instead, use cocos.nodes.Node#stopAction(action)
     */
    stop: function () {
        this.target = null;
    },

    /**
     * @getter isDone
     * @type {Boolean} 
     */
    get_isDone: function (key) {
        return true;
    },


    /**
     * Returns a copy of this Action but in reverse
     *
     * @returns {cocos.actions.Action} A new Action in reverse
     */
    reverse: function () {
    }
});

var RepeatForever = Action.extend(/** @lends cocos.actions.RepeatForever# */{
    other: null,

    /**
     * @memberOf cocos.actions
     * @class Repeats an action forever. To repeat the an action for a limited
     * number of times use the cocos.Repeat action.
     * @extends cocos.actions.Action
     * @param {cocos.actions.Action} action An action to repeat forever
     * @constructs
     */
    init: function (action) {
        RepeatForever.superclass.init(this, action);

        this.other = action;
    },

    startWithTarget: function (target) {
        RepeatForever.superclass.startWithTarget.call(this, target);

        this.other.startWithTarget(this.target);
    },

    step: function (dt) {
        this.other.step(dt);
        if (this.other.get('isDone')) {
            var diff = dt - this.other.get('duration') - this.other.get('elapsed');
            this.other.startWithTarget(this.target);

            this.other.step(diff);
        }
    },

    get_isDone: function () {
        return false;
    },

    reverse: function () {
        return RepeatForever.create(this.other.reverse());
    },

    copy: function () {
        return RepeatForever.create(this.other.copy());
    }
});

var FiniteTimeAction = Action.extend(/** @lends cocos.actions.FiniteTimeAction# */{
    /**
     * Number of seconds to run the Action for
     * @type Float
     */
    duration: 2,

    /** 
     * Repeats an action a number of times. To repeat an action forever use the
     * cocos.RepeatForever action.
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.Action
     */
    init: function () {
        FiniteTimeAction.superclass.init.call(this);
    },

    /** @ignore */
    reverse: function () {
        console.log('FiniteTimeAction.reverse() Override me');
    }
});

exports.Action = Action;
exports.RepeatForever = RepeatForever;
exports.FiniteTimeAction = FiniteTimeAction;

}};
__resources__["/__builtin__/libs/cocos2d/actions/ActionInstant.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    act = require('./Action'),
    ccp = require('geometry').ccp;

var ActionInstant = act.FiniteTimeAction.extend(/** @lends cocos.actions.ActionInstant */{
    /**
     * @memberOf cocos.actions
     * @class Base class for actions that triggers instantly. They have no duration.
     * @extends cocos.actions.FiniteTimeAction
     * @constructs
     */
    init: function (opts) {
        ActionInstant.superclass.init.call(this, opts);

        this.duration = 0;
    },
    get_isDone: function () {
        return true;
    },
    step: function (dt) {
        this.update(1);
    },
    update: function (t) {
        // ignore
    },
    reverse: function () {
        return this.copy();
    }
});

var FlipX = ActionInstant.extend(/** @lends cocos.actions.FlipX# */{
    flipX: false,

    /**
     * @memberOf cocos.actions
     * @class Flips a sprite horizontally
     * @extends cocos.actions.ActionInstant
     * @constructs
     *
     * @opt {Boolean} flipX Should the sprite be flipped
     */
    init: function (opts) {
        FlipX.superclass.init.call(this, opts);

        this.flipX = opts.flipX;
    },
    startWithTarget: function (target) {
        FlipX.superclass.startWithTarget.call(this, target);

        target.set('flipX', this.flipX);
    },
    reverse: function () {
        return FlipX.create({flipX: !this.flipX});
    },
    copy: function () {
        return FlipX.create({flipX: this.flipX});
    }
});

var FlipY = ActionInstant.extend(/** @lends cocos.actions.FlipY# */{
    flipY: false,

    /**
     * @memberOf cocos.actions
     * @class Flips a sprite vertically
     * @extends cocos.actions.ActionInstant
     * @constructs
     *
     * @opt {Boolean} flipY Should the sprite be flipped
     */
    init: function (opts) {
        FlipY.superclass.init.call(this, opts);

        this.flipY = opts.flipY;
    },
    startWithTarget: function (target) {
        FlipY.superclass.startWithTarget.call(this, target);

        target.set('flipY', this.flipY);
    },
    reverse: function () {
        return FlipY.create({flipY: !this.flipY});
    },
    copy: function () {
        return FlipY.create({flipY: this.flipY});
    }
});

exports.ActionInstant = ActionInstant;
exports.FlipX = FlipX;
exports.FlipY = FlipY;

}};
__resources__["/__builtin__/libs/cocos2d/actions/ActionInterval.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    act = require('./Action'),
    ccp = require('geometry').ccp;

var ActionInterval = act.FiniteTimeAction.extend(/** @lends cocos.actions.ActionInterval# */{
    /**
     * Number of seconds that have elapsed
     * @type Float
     */
    elapsed: 0.0,

    _firstTick: true,

    /**
     * Base class actions that do have a finite time duration. 
     *
     * Possible actions:
     *
     * - An action with a duration of 0 seconds
     * - An action with a duration of 35.5 seconds Infinite time actions are valid
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.FiniteTimeAction
     *
     * @opt {Float} duration Number of seconds to run action for
     */
    init: function (opts) {
        ActionInterval.superclass.init.call(this, opts);

        var dur = opts.duration || 0;
        if (dur === 0) {
            dur = 0.0000001;
        }

        this.set('duration', dur);
        this.set('elapsed', 0);
        this._firstTick = true;
    },

    get_isDone: function () {
        return (this.elapsed >= this.duration);
    },

    step: function (dt) {
        if (this._firstTick) {
            this._firstTick = false;
            this.elapsed = 0;
        } else {
            this.elapsed += dt;
        }

        this.update(Math.min(1, this.elapsed / this.duration));
    },

    startWithTarget: function (target) {
        ActionInterval.superclass.startWithTarget.call(this, target);

        this.elapsed = 0.0;
        this._firstTick = true;
    },

    reverse: function () {
        throw "Reverse Action not implemented";
    }
});

var ScaleTo = ActionInterval.extend(/** @lends cocos.actions.ScaleTo# */{
    /**
     * Current X Scale
     * @type Float
     */
    scaleX: 1,

    /**
     * Current Y Scale
     * @type Float
     */
    scaleY: 1,

    /**
     * Initial X Scale
     * @type Float
     */
    startScaleX: 1,

    /**
     * Initial Y Scale
     * @type Float
     */
    startScaleY: 1,

    /**
     * Final X Scale
     * @type Float
     */
    endScaleX: 1,

    /**
     * Final Y Scale
     * @type Float
     */
    endScaleY: 1,

    /**
     * Delta X Scale
     * @type Float
     * @private
     */
    deltaX: 0.0,

    /**
     * Delta Y Scale
     * @type Float
     * @private
     */
    deltaY: 0.0,

    /**
     * Scales a cocos.Node object to a zoom factor by modifying it's scale attribute.
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.ActionInterval
     *
     * @opt {Float} duration Number of seconds to run action for
     * @opt {Float} [scale] Size to scale Node to
     * @opt {Float} [scaleX] Size to scale width of Node to
     * @opt {Float} [scaleY] Size to scale height of Node to
     */
    init: function (opts) {
        ScaleTo.superclass.init.call(this, opts);

        if (opts.scale !== undefined) {
            this.endScaleX = this.endScaleY = opts.scale;
        } else {
            this.endScaleX = opts.scaleX;
            this.endScaleY = opts.scaleY;
        }


    },

    startWithTarget: function (target) {
        ScaleTo.superclass.startWithTarget.call(this, target);

        this.startScaleX = this.target.get('scaleX');
        this.startScaleY = this.target.get('scaleY');
        this.deltaX = this.endScaleX - this.startScaleX;
        this.deltaY = this.endScaleY - this.startScaleY;
    },

    update: function (t) {
        if (!this.target) {
            return;
        }
        
        this.target.set('scaleX', this.startScaleX + this.deltaX * t);
        this.target.set('scaleY', this.startScaleY + this.deltaY * t);
    }
});

var ScaleBy = ScaleTo.extend(/** @lends cocos.actions.ScaleBy# */{
    /**
     * Scales a cocos.Node object to a zoom factor by modifying it's scale attribute.
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.ScaleTo
     *
     * @opt {Float} duration Number of seconds to run action for
     * @opt {Float} [scale] Size to scale Node by
     * @opt {Float} [scaleX] Size to scale width of Node by
     * @opt {Float} [scaleY] Size to scale height of Node by
     */
    init: function (opts) {
        ScaleBy.superclass.init.call(this, opts);
    },

    startWithTarget: function (target) {
        ScaleBy.superclass.startWithTarget.call(this, target);

        this.deltaX = this.startScaleX * this.endScaleX - this.startScaleX;
        this.deltaY = this.startScaleY * this.endScaleY - this.startScaleY;
    },

    reverse: function () {
        return ScaleBy.create({duration: this.duration, scaleX: 1 / this.endScaleX, scaleY: 1 / this.endScaleY});
    }
});


var RotateTo = ActionInterval.extend(/** @lends cocos.actions.RotateTo# */{
    /**
     * Final angle
     * @type Float
     */
    dstAngle: 0,

    /**
     * Initial angle
     * @type Float
     */
    startAngle: 0,

    /**
     * Angle delta
     * @type Float
     */
    diffAngle: 0,

    /**
     * Rotates a cocos.Node object to a certain angle by modifying its rotation
     * attribute. The direction will be decided by the shortest angle.
     * 
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.ActionInterval
     *
     * @opt {Float} duration Number of seconds to run action for
     * @opt {Float} angle Angle in degrees to rotate to
     */
    init: function (opts) {
        RotateTo.superclass.init.call(this, opts);

        this.dstAngle = opts.angle;
    },

    startWithTarget: function (target) {
        RotateTo.superclass.startWithTarget.call(this, target);

        this.startAngle = target.get('rotation');

        if (this.startAngle > 0) {
            this.startAngle = (this.startAngle % 360);
        } else {
            this.startAngle = (this.startAngle % -360);
        }

        this.diffAngle = this.dstAngle - this.startAngle;
        if (this.diffAngle > 180) {
            this.diffAngle -= 360;
        } else if (this.diffAngle < -180) {
            this.diffAngle += 360;
        }
    },

    update: function (t) {
        this.target.set('rotation', this.startAngle + this.diffAngle * t);
    }
});

var RotateBy = RotateTo.extend(/** @lends cocos.actions.RotateBy# */{
    /**
     * Number of degrees to rotate by
     * @type Float
     */
    angle: 0,

    /**
     * Rotates a cocos.Node object to a certain angle by modifying its rotation
     * attribute. The direction will be decided by the shortest angle.
     *
     * @memberOf cocos.action
     * @constructs
     * @extends cocos.actions.RotateTo
     *
     * @opt {Float} duration Number of seconds to run action for
     * @opt {Float} angle Angle in degrees to rotate by
     */
    init: function (opts) {
        RotateBy.superclass.init.call(this, opts);

        this.angle = opts.angle;
    },

    startWithTarget: function (target) {
        RotateBy.superclass.startWithTarget.call(this, target);

        this.startAngle = this.target.get('rotation');
    },

    update: function (t) {
        this.target.set('rotation', this.startAngle + this.angle * t);
    },

    reverse: function () {
        return RotateBy.create({duration: this.duration, angle: -this.angle});
    },

    copy: function () {
        return RotateBy.create({duration: this.duration, angle: this.angle});
    }
});



var Sequence = ActionInterval.extend(/** @lends cocos.actions.Sequence# */{
    /**
     * Array of actions to run
     * @type cocos.Node[]
     */
    actions: null,

    /**
     * The array index of the currently running action
     * @type Integer
     */
    currentActionIndex: 0,

    /**
     * The duration when the current action finishes
     * @type Float
     */
    currentActionEndDuration: 0,

    /**
     * Runs a number of actions sequentially, one after another
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.ActionInterval
     *
     * @opt {Float} duration Number of seconds to run action for
     * @opt {cocos.actions.Action[]} Array of actions to run in sequence
     */
    init: function (opts) {
        Sequence.superclass.init.call(this, opts);

        this.actions = util.copy(opts.actions);
        this.actionSequence = {};
        
        util.each(this.actions, util.callback(this, function (action) {
            this.duration += action.duration;
        }));
    },

    startWithTarget: function (target) {
        Sequence.superclass.startWithTarget.call(this, target);

        this.currentActionIndex = 0;
        this.currentActionEndDuration = this.actions[0].get('duration');
        this.actions[0].startWithTarget(this.target);
    },

    stop: function () {
        util.each(this.actions, function (action) {
            action.stop();
        });

        Sequence.superclass.stop.call(this);
    },

    step: function (dt) {
        if (this._firstTick) {
            this._firstTick = false;
            this.elapsed = 0;
        } else {
            this.elapsed += dt;
        }

        this.actions[this.currentActionIndex].step(dt);
        this.update(Math.min(1, this.elapsed / this.duration));
    },

    update: function (dt) {
        // Action finished onto the next one
        if (this.elapsed > this.currentActionEndDuration) {
            var previousAction = this.actions[this.currentActionIndex];
            previousAction.update(1.0);
            previousAction.stop();


            this.currentActionIndex++;

            if (this.currentActionIndex < this.actions.length) {
                var currentAction = this.actions[this.currentActionIndex];
                currentAction.startWithTarget(this.target);

                this.currentActionEndDuration += currentAction.duration;
            }
        }
    }
});

var Animate = ActionInterval.extend(/** @lends cocos.actions.Animate# */{
    animation: null,
    restoreOriginalFrame: true,
    origFrame: null,


    /**
     * Animates a sprite given the name of an Animation 
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.ActionInterval
     *
     * @opt {Float} duration Number of seconds to run action for
     * @opt {cocos.Animation} animation Animation to run
     * @opt {Boolean} [restoreOriginalFrame=true] Return to first frame when finished
     */
    init: function (opts) {
        this.animation = opts.animation;
        this.restoreOriginalFrame = opts.restoreOriginalFrame !== false;
        opts.duration = this.animation.frames.length * this.animation.delay;

        Animate.superclass.init.call(this, opts);
    },

    startWithTarget: function (target) {
        Animate.superclass.startWithTarget.call(this, target);

        if (this.restoreOriginalFrame) {
            this.set('origFrame', this.target.get('displayedFrame'));
        }
    },

    stop: function () {
        if (this.target && this.restoreOriginalFrame) {
            var sprite = this.target;
            sprite.set('displayFrame', this.origFrame);
        }

        Animate.superclass.stop.call(this);
    },

    update: function (t) {
        var frames = this.animation.get('frames'),
            numberOfFrames = frames.length,
            idx = Math.floor(t * numberOfFrames);

        if (idx >= numberOfFrames) {
            idx = numberOfFrames - 1;
        }

        var sprite = this.target;
        if (!sprite.isFrameDisplayed(frames[idx])) {
            sprite.set('displayFrame', frames[idx]);
        }
    },

    copy: function () {
        return Animate.create({animation: this.animation, restoreOriginalFrame: this.restoreOriginalFrame});
    }

});

exports.ActionInterval = ActionInterval;
exports.ScaleTo = ScaleTo;
exports.ScaleBy = ScaleBy;
exports.RotateTo = RotateTo;
exports.RotateBy = RotateBy;
exports.Sequence = Sequence;
exports.Animate = Animate;

}};
__resources__["/__builtin__/libs/cocos2d/actions/index.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    path = require('path');

var modules = 'Action ActionInterval ActionInstant'.w();

/**
 * @memberOf cocos
 * @namespace Actions used to animate or change a Node
 */
var actions = {};

util.each(modules, function (mod, i) {
    util.extend(actions, require('./' + mod));
});

module.exports = actions;

}};
__resources__["/__builtin__/libs/cocos2d/Animation.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util');

var Animation = BObject.extend(/** @lends cocos.Animation# */{
    name: null,
    delay: 0.0,
    frames: null,

    /** 
     * A cocos.Animation object is used to perform animations on the Sprite objects.
     * 
     * The Animation object contains cocos.SpriteFrame objects, and a possible delay between the frames.
     * You can animate a cocos.Animation object by using the cocos.actions.Animate action.
     * 
     * @memberOf cocos
     * @constructs
     * @extends BObject
     *
     * @opt {cocos.SpriteFrame[]} frames Frames to animate
     * @opt {Float} [delay=0.0] Delay between each frame
     * 
     * @example
     * var animation = cocos.Animation.create({frames: [f1, f2, f3], delay: 0.1});
     * sprite.runAction(cocos.actions.Animate.create({animation: animation}));
     */
    init: function (opts) {
        Animation.superclass.init.call(this, opts);

        this.frames = opts.frames || [];
        this.delay  = opts.delay  || 0.0;
    }
});

exports.Animation = Animation;

}};
__resources__["/__builtin__/libs/cocos2d/AnimationCache.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    Plist = require('Plist').Plist;

var AnimationCache = BObject.extend(/** @lends cocos.AnimationCache# */{
    /**
     * Cached animations
     * @type Object
     */
    animations: null,

    /**
     * @memberOf cocos
     * @constructs
     * @extends BObject
     * @singleton
     */
    init: function () {
        AnimationCache.superclass.init.call(this);

        this.set('animations', {});
    },

    /**
     * Add an animation to the cache
     *
     * @opt {String} name Unique name of the animation
     * @opt {cocos.Animcation} animation Animation to cache
     */
    addAnimation: function (opts) {
        var name = opts.name,
            animation = opts.animation;

        this.get('animations')[name] = animation;
    },

    /**
     * Remove an animation from the cache
     *
     * @opt {String} name Unique name of the animation
     */
    removeAnimation: function (opts) {
        var name = opts.name;

        delete this.get('animations')[name];
    },

    /**
     * Get an animation from the cache
     *
     * @opt {String} name Unique name of the animation
     * @returns {cocos.Animation} Cached animation
     */
    getAnimation: function (opts) {
        var name = opts.name;

        return this.get('animations')[name];
    }
});

/**
 * Class methods
 */
util.extend(AnimationCache, /** @lends cocos.AnimationCache */{
    /**
     * @getter sharedAnimationCache
     * @type cocos.AnimationCache
     */
    get_sharedAnimationCache: function (key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }
});

exports.AnimationCache = AnimationCache;

}};
__resources__["/__builtin__/libs/cocos2d/Director.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray FLIP_Y_AXIS SHOW_REDRAW_REGIONS*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    geo = require('geometry'),
    ccp = geo.ccp,
    Scheduler = require('./Scheduler').Scheduler,
    EventDispatcher = require('./EventDispatcher').EventDispatcher,
    Scene = require('./nodes/Scene').Scene;

var Director = BObject.extend(/** @lends cocos.Director# */{
    backgroundColor: 'rgb(0, 0, 0)',
    canvas: null,
    context: null,
    sceneStack: null,
    winSize: null,
    isPaused: false,
    maxFrameRate: 30,
    displayFPS: false,

    // Time delta
    dt: 0,
    nextDeltaTimeZero: false,
    lastUpdate: 0,

    _nextScene: null,

    /**
     * <p>Creates and handles the main view and manages how and when to execute the
     * Scenes.</p>
     *
     * <p>This class is a singleton so don't instantiate it yourself, instead use
     * cocos.Director.get('sharedDirector') to return the instance.</p>
     *
     * @memberOf cocos
     * @constructs
     * @extends BObject
     * @singleton
     */
    init: function () {
        Director.superclass.init.call(this);

        this.set('sceneStack', []);
    },

    /**
     * Append to a HTML element. It will create a canvas tag
     *
     * @param {HTMLElement} view Any HTML element to add the application to
     */
    attachInView: function (view) {
        if (!view.tagName) {
            throw "Director.attachInView must be given a HTML DOM Node";
        }

        while (view.firstChild) {
            view.removeChild(view.firstChild);
        }

        var canvas = document.createElement('canvas');
        this.set('canvas', canvas);
        canvas.setAttribute('width', view.clientWidth);
        canvas.setAttribute('height', view.clientHeight);

        var context = canvas.getContext('2d');
        this.set('context', context);

        if (FLIP_Y_AXIS) {
            context.translate(0, view.clientHeight);
            context.scale(1, -1);
        }

        view.appendChild(canvas);

        this.set('winSize', {width: view.clientWidth, height: view.clientHeight});


        // Setup event handling

        // Mouse events
        var eventDispatcher = EventDispatcher.get('sharedDispatcher');
        var self = this;
        function mouseDown(evt) {
            evt.locationInWindow = ccp(evt.clientX, evt.clientY);
            evt.locationInCanvas = self.convertEventToCanvas(evt);

            function mouseDragged(evt) {
                evt.locationInWindow = ccp(evt.clientX, evt.clientY);
                evt.locationInCanvas = self.convertEventToCanvas(evt);

                eventDispatcher.mouseDragged(evt);
            }
            function mouseUp(evt) {
                evt.locationInWindow = ccp(evt.clientX, evt.clientY);
                evt.locationInCanvas = self.convertEventToCanvas(evt);

                document.body.removeEventListener('mousemove', mouseDragged, false);
                document.body.removeEventListener('mouseup',   mouseUp,   false);


                eventDispatcher.mouseUp(evt);
            }

            document.body.addEventListener('mousemove', mouseDragged, false);
            document.body.addEventListener('mouseup',   mouseUp,   false);

            eventDispatcher.mouseDown(evt);
        }
        function mouseMoved(evt) {
            evt.locationInWindow = ccp(evt.clientX, evt.clientY);
            evt.locationInCanvas = self.convertEventToCanvas(evt);

            eventDispatcher.mouseMoved(evt);
        }
        canvas.addEventListener('mousedown', mouseDown, false);
        canvas.addEventListener('mousemove', mouseMoved, false);

        // Keyboard events
        function keyDown(evt) {
            this._keysDown = this._keysDown || {};
            eventDispatcher.keyDown(evt);
        }
        function keyUp(evt) {
            eventDispatcher.keyUp(evt);
        }
        /*
        function keyPress(evt) {
            eventDispatcher.keyPress(evt)
        }
        */
        document.documentElement.addEventListener('keydown', keyDown, false);
        document.documentElement.addEventListener('keyup', keyUp, false);
        /*
        document.documentElement.addEventListener('keypress', keyPress, false);
        */
    },

    /**
     * Enters the Director's main loop with the given Scene. Call it to run
     * only your FIRST scene. Don't call it if there is already a running
     * scene.
     *
     * @param {cocos.Scene} scene The scene to start
     */
    runWithScene: function (scene) {
        if (!(scene instanceof Scene)) {
            throw "Director.runWithScene must be given an instance of Scene";
        }

        if (this._runningScene) {
            throw "You can't run an scene if another Scene is running. Use replaceScene or pushScene instead";
        }

        this.pushScene(scene);
        this.startAnimation();
    },

    /**
     * Replaces the running scene with a new one. The running scene is
     * terminated. ONLY call it if there is a running scene.
     *
     * @param {cocos.Scene} scene The scene to replace with
     */
    replaceScene: function (scene) {
        var index = this.sceneStack.length;

        this._sendCleanupToScene = true;
        this.sceneStack.pop();
        this.sceneStack.push(scene);
        this._nextScene = scene;
    },

    /**
     * Pops out a scene from the queue. This scene will replace the running
     * one. The running scene will be deleted. If there are no more scenes in
     * the stack the execution is terminated. ONLY call it if there is a
     * running scene.
     */
    popScene: function () {
    },

    /**
     * Suspends the execution of the running scene, pushing it on the stack of
     * suspended scenes. The new scene will be executed. Try to avoid big
     * stacks of pushed scenes to reduce memory allocation. ONLY call it if
     * there is a running scene.
     *
     * @param {cocos.Scene} scene The scene to add to the stack
     */
    pushScene: function (scene) {
        this._nextScene = scene;
    },

    /**
     * The main loop is triggered again. Call this function only if
     * cocos.Directory#stopAnimation was called earlier.
     */
    startAnimation: function () {
        var animationInterval = 1.0 / this.get('maxFrameRate');
        this._animationTimer = setInterval(util.callback(this, 'drawScene'), animationInterval * 1000);
    },

    /**
     * Stops the animation. Nothing will be drawn. The main loop won't be
     * triggered anymore. If you want to pause your animation call
     * cocos.Directory#pause instead.
     */
    stopAnimation: function () {
    },

    /**
     * Calculate time since last call
     * @private
     */
    calculateDeltaTime: function () {
        var now = (new Date()).getTime() / 1000;

        if (this.nextDeltaTimeZero) {
            this.dt = 0;
            this.nextDeltaTimeZero = false;
        }

        this.dt = Math.max(0, now - this.lastUpdate);

        this.lastUpdate = now;
    },

    /**
     * The main run loop
     * @private
     */
    drawScene: function () {
        this.calculateDeltaTime();

        if (!this.isPaused) {
            Scheduler.get('sharedScheduler').tick(this.dt);
        }


        var context = this.get('context');
        context.fillStyle = this.get('backgroundColor');
        context.fillRect(0, 0, this.winSize.width, this.winSize.height);
        //this.canvas.width = this.canvas.width


        if (this._nextScene) {
            this.setNextScene();
        }

        var rect = new geo.Rect(0, 0, this.winSize.width, this.winSize.height);

        if (rect) {
            context.beginPath();
            context.rect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height);
            context.clip();
            context.closePath();
        }

        this._runningScene.visit(context, rect);

        if (SHOW_REDRAW_REGIONS) {
            if (rect) {
                context.beginPath();
                context.rect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height);
                context.fillStyle = "rgba(255, 0, 0, 0.5)";
                //context.fill();
                context.closePath();
            }
        }

        if (this.get('displayFPS')) {
            this.showFPS();
        }
    },

    /**
     * Initialises the next scene
     * @private
     */
    setNextScene: function () {
        // TODO transitions

        if (this._runningScene) {
            this._runningScene.onExit();
            if (this._sendCleanupToScene) {
                this._runningScene.cleanup();
            }
        }

        this._runningScene = this._nextScene;

        this._nextScene = null;

        this._runningScene.onEnter();
    },

    convertEventToCanvas: function (evt) {
        var x = this.canvas.offsetLeft - document.documentElement.scrollLeft,
            y = this.canvas.offsetTop - document.documentElement.scrollTop;

        var o = this.canvas;
        while ((o = o.offsetParent)) {
            x += o.offsetLeft - o.scrollLeft;
            y += o.offsetTop - o.scrollTop;
        }

        var p = geo.ccpSub(evt.locationInWindow, ccp(x, y));
        if (FLIP_Y_AXIS) {
            p.y = this.canvas.height - p.y;
        }

        return p;
    },

    showFPS: function () {
        if (!this._fpsLabel) {
            var Label = require('./nodes/Label').Label;
            this._fpsLabel = Label.create({string: '', fontSize: 16});
            this._fpsLabel.set('anchorPoint', ccp(0, 1));
            this._frames = 0;
            this._accumDt = 0;
        }


        this._frames++;
        this._accumDt += this.get('dt');
        
        if (this._accumDt > 1.0 / 3.0)  {
            var frameRate = this._frames / this._accumDt;
            this._frames = 0;
            this._accumDt = 0;

            this._fpsLabel.set('string', 'FPS: ' + (Math.round(frameRate * 100) / 100).toString());
        }
		

        var s = this.get('winSize');
        this._fpsLabel.set('position', ccp(10, s.height - 10));

        this._fpsLabel.visit(this.get('context'));
    }

});

/**
 * Class methods
 */
util.extend(Director, /** @lends cocos.Director */{
    /**
     * A shared singleton instance of cocos.Director
     *
     * @getter sharedDirector
     * @type cocos.Director
     */
    get_sharedDirector: function (key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }
});

exports.Director = Director;

}};
__resources__["/__builtin__/libs/cocos2d/EventDispatcher.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray FLIP_Y_AXIS*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    geo = require('geometry');

var EventDispatcher = BObject.extend(/** @lends cocos.EventDispatcher# */{
    dispatchEvents: true,
    keyboardDelegates: null,
    mouseDelegates: null,
    _keysDown: null,
    
    /**
     * This singleton is responsible for dispatching Mouse and Keyboard events.
     *
     * @memberOf cocos
     * @constructs
     * @extends BObject
     * @singleton
     */
    init: function () {
        EventDispatcher.superclass.init.call(this);

        this.keyboardDelegates = [];
        this.mouseDelegates = [];

        this._keysDown = {};
    },

    addDelegate: function (opts) {
        var delegate = opts.delegate,
            priority = opts.priority,
            flags    = opts.flags,
            list     = opts.list;

        var listElement = {
            delegate: delegate,
            priority: priority,
            flags: flags
        };

        var added = false;
        for (var i = 0; i < list.length; i++) {
            var elem = list[i];
            if (priority < elem.priority) {
                // Priority is lower, so insert before elem
                list.splice(i, 0, listElement);
                added = true;
                break;
            }
        }

        // High priority; append to array
        if (!added) {
            list.push(listElement);
        }
    },

    removeDelegate: function (opts) {
        var delegate = opts.delegate,
            list = opts.list;

        var idx = -1,
            i;
        for (i = 0; i < list.length; i++) {
            var l = list[i];
            if (l.delegate == delegate) {
                idx = i;
                break;
            }
        }
        if (idx == -1) {
            return;
        }
        list.splice(idx, 1);
    },
    removeAllDelegates: function (opts) {
        var list = opts.list;

        list.splice(0, list.length - 1);
    },

    addMouseDelegate: function (opts) {
        var delegate = opts.delegate,
            priority = opts.priority;

        var flags = 0;

        // TODO flags

        this.addDelegate({delegate: delegate, priority: priority, flags: flags, list: this.mouseDelegates});
    },

    removeMouseDelegate: function (opts) {
        var delegate = opts.delegate;

        this.removeDelegate({delegate: delegate, list: this.mouseDelegates});
    },

    removeAllMouseDelegate: function () {
        this.removeAllDelegates({list: this.mouseDelegates});
    },

    addKeyboardDelegate: function (opts) {
        var delegate = opts.delegate,
            priority = opts.priority;

        var flags = 0;

        // TODO flags

        this.addDelegate({delegate: delegate, priority: priority, flags: flags, list: this.keyboardDelegates});
    },

    removeKeyboardDelegate: function (opts) {
        var delegate = opts.delegate;

        this.removeDelegate({delegate: delegate, list: this.keyboardDelegates});
    },

    removeAllKeyboardDelegate: function () {
        this.removeAllDelegates({list: this.keyboardDelegates});
    },



    // Mouse Events

    mouseDown: function (evt) {
        if (!this.dispatchEvents) {
            return;
        }

        this._previousMouseMovePosition = geo.ccp(evt.clientX, evt.clientY);
        this._previousMouseDragPosition = geo.ccp(evt.clientX, evt.clientY);

        for (var i = 0; i < this.mouseDelegates.length; i++) {
            var entry = this.mouseDelegates[i];
            if (entry.delegate.mouseDown) {
                var swallows = entry.delegate.mouseDown(evt);
                if (swallows) {
                    break;
                }
            }
        }
    },
    mouseMoved: function (evt) {
        if (!this.dispatchEvents) {
            return;
        }

        if (this._previousMouseMovePosition) {
            evt.deltaX = evt.clientX - this._previousMouseMovePosition.x;
            evt.deltaY = evt.clientY - this._previousMouseMovePosition.y;
            if (FLIP_Y_AXIS) {
                evt.deltaY *= -1;
            }
        } else {
            evt.deltaX = 0;
            evt.deltaY = 0;
        }
        this._previousMouseMovePosition = geo.ccp(evt.clientX, evt.clientY);

        for (var i = 0; i < this.mouseDelegates.length; i++) {
            var entry = this.mouseDelegates[i];
            if (entry.delegate.mouseMoved) {
                var swallows = entry.delegate.mouseMoved(evt);
                if (swallows) {
                    break;
                }
            }
        }
    },
    mouseDragged: function (evt) {
        if (!this.dispatchEvents) {
            return;
        }

        if (this._previousMouseDragPosition) {
            evt.deltaX = evt.clientX - this._previousMouseDragPosition.x;
            evt.deltaY = evt.clientY - this._previousMouseDragPosition.y;
            if (FLIP_Y_AXIS) {
                evt.deltaY *= -1;
            }
        } else {
            evt.deltaX = 0;
            evt.deltaY = 0;
        }
        this._previousMouseDragPosition = geo.ccp(evt.clientX, evt.clientY);

        for (var i = 0; i < this.mouseDelegates.length; i++) {
            var entry = this.mouseDelegates[i];
            if (entry.delegate.mouseDragged) {
                var swallows = entry.delegate.mouseDragged(evt);
                if (swallows) {
                    break;
                }
            }
        }
    },
    mouseUp: function (evt) {
        if (!this.dispatchEvents) {
            return;
        }

        for (var i = 0; i < this.mouseDelegates.length; i++) {
            var entry = this.mouseDelegates[i];
            if (entry.delegate.mouseUp) {
                var swallows = entry.delegate.mouseUp(evt);
                if (swallows) {
                    break;
                }
            }
        }
    },

    // Keyboard events
    keyDown: function (evt) {
        var kc = evt.keyCode;
        if (!this.dispatchEvents || this._keysDown[kc]) {
            return;
        }

        this._keysDown[kc] = true;

        for (var i = 0; i < this.keyboardDelegates.length; i++) {
            var entry = this.keyboardDelegates[i];
            if (entry.delegate.keyDown) {
                var swallows = entry.delegate.keyDown(evt);
                if (swallows) {
                    break;
                }
            }
        }
    },

    keyUp: function (evt) {
        if (!this.dispatchEvents) {
            return;
        }

        var kc = evt.keyCode;
        if (this._keysDown[kc]) {
            delete this._keysDown[kc];
        }

        for (var i = 0; i < this.keyboardDelegates.length; i++) {
            var entry = this.keyboardDelegates[i];
            if (entry.delegate.keyUp) {
                var swallows = entry.delegate.keyUp(evt);
                if (swallows) {
                    break;
                }
            }
        }
    }

});

/**
 * Class methods
 */
util.extend(EventDispatcher, /** @lends cocos.EventDispatcher */{
    /**
     * A shared singleton instance of cocos.EventDispatcher
     *
     * @getter sharedDispatcher
     * @type cocos.EventDispatcher
     */
    get_sharedDispatcher: function (key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }
});
exports.EventDispatcher = EventDispatcher;

}};
__resources__["/__builtin__/libs/cocos2d/index.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    path = require('path');

var modules = 'SpriteFrame SpriteFrameCache Director Animation AnimationCache Scheduler ActionManager TMXXMLParser'.w();

/**
 * @namespace All cocos2d objects live in this namespace
 */
var cocos = {
    nodes: require('./nodes'),
    actions: require('./actions')
};

util.each(modules, function (mod, i) {
    util.extend(cocos, require('./' + mod));
});

module.exports = cocos;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/BatchNode.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray SHOW_REDRAW_REGIONS*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    evt = require('event'),
    geo = require('geometry'),
    ccp = geo.ccp,
    TextureAtlas = require('../TextureAtlas').TextureAtlas,
    RenderTexture = require('./RenderTexture').RenderTexture,
	Node = require('./Node').Node;

var BatchNode = Node.extend(/** @lends cocos.nodes.BatchNode# */{
    partialDraw: false,
    contentRect: null,
    renderTexture: null,
    dirty: true,

    /**
     * Region to redraw
     * @type geometry.Rect
     */
    dirtyRegion: null,
    dynamicResize: false,

    /** @private
     * Areas that need redrawing
     *
     * Not implemented
     */
    _dirtyRects: null,


    /**
     * Draws all children to an in-memory canvas and only redraws when something changes
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.Node
     *
     * @opt {geometry.Size} size The size of the in-memory canvas used for drawing to
     * @opt {Boolean} [partialDraw=false] Draw only the area visible on screen. Small maps may be slower in some browsers if this is true.
     */
	init: function (opts) {
		BatchNode.superclass.init.call(this, opts);

        var size = opts.size || geo.sizeMake(1, 1);
        this.set('partialDraw', opts.partialDraw);

        evt.addListener(this, 'contentsize_changed', util.callback(this, this._resizeCanvas));
        
		this._dirtyRects = [];
        this.set('contentRect', geo.rectMake(0, 0, size.width, size.height));
        this.renderTexture = RenderTexture.create(size);
        this.renderTexture.sprite.set('isRelativeAnchorPoint', false);
        this.addChild({child: this.renderTexture});
	},

    addChild: function (opts) {
        BatchNode.superclass.addChild.call(this, opts);

        var child = opts.child,
            z     = opts.z;

        if (child == this.renderTexture) {
            return;
        }

        // TODO handle texture resize

        // Watch for changes in child
        evt.addListener(child, 'istransformdirty_changed', util.callback(this, function () {
            this.addDirtyRegion(child.get('boundingBox'));
        }));
        evt.addListener(child, 'visible_changed', util.callback(this, function () {
            this.addDirtyRegion(child.get('boundingBox'));
        }));

        this.addDirtyRegion(child.get('boundingBox'));
    },

    removeChild: function (opts) {
        BatchNode.superclass.removeChild.call(this, opts);

        // TODO remove istransformdirty_changed and visible_changed listeners

        this.set('dirty', true);
    },

    addDirtyRegion: function (rect) {
        var region = this.get('dirtyRegion');
        if (!region) {
            region = util.copy(rect);
        } else {
            region = geo.rectUnion(region, rect);
        }

        this.set('dirtyRegion', region);
        this.set('dirty', true);
    },

    _resizeCanvas: function (oldSize) {
        var size = this.get('contentSize');

        if (geo.sizeEqualToSize(size, oldSize)) {
            return; // No change
        }


        this.renderTexture.set('contentSize', size);
        this.set('dirty', true);
    },

    update: function () {

    },

    visit: function (context) {
        if (!this.visible) {
            return;
        }

        context.save();

        this.transform(context);

        var rect = this.get('dirtyRegion');
        // Only redraw if something changed
        if (this.dirty) {

            if (rect) {
                if (this.get('partialDraw')) {
                    // Clip region to visible area
                    var s = require('../Director').Director.get('sharedDirector').get('winSize'),
                        p = this.get('position');
                    var r = new geo.Rect(
                        0, 0,
                        s.width, s.height
                    );
                    r = geo.rectApplyAffineTransform(r, this.worldToNodeTransform());
                    rect = geo.rectIntersection(r, rect);
                }

                this.renderTexture.clear(rect);

                this.renderTexture.context.save();
                this.renderTexture.context.beginPath();
                this.renderTexture.context.rect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height);
                this.renderTexture.context.clip();
                this.renderTexture.context.closePath();
            } else {
                this.renderTexture.clear();
            }

            for (var i = 0, childLen = this.children.length; i < childLen; i++) {
                var c = this.children[i];
                if (c == this.renderTexture) {
                    continue;
                }

                // Draw children inside rect
                if (!rect || geo.rectOverlapsRect(c.get('boundingBox'), rect)) {
                    c.visit(this.renderTexture.context, rect);
                }
            }

            if (SHOW_REDRAW_REGIONS) {
                if (rect) {
                    this.renderTexture.context.beginPath();
                    this.renderTexture.context.rect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height);
                    this.renderTexture.context.fillStyle = "rgba(0, 0, 255, 0.5)";
                    this.renderTexture.context.fill();
                    this.renderTexture.context.closePath();
                }
            }

            if (rect) {
                this.renderTexture.context.restore();
            }

            this.set('dirty', false);
            this.set('dirtyRegion', null);
        }

        this.renderTexture.visit(context);

        context.restore();
	},

	draw: function (ctx) {
    },

    onEnter: function () {
        if (this.get('partialDraw')) {
            evt.addListener(this.get('parent'), 'istransformdirty_changed', util.callback(this, function () {
                var box = this.get('visibleRect');
                this.addDirtyRegion(box);
            }));
        }
    }
});

var SpriteBatchNode = BatchNode.extend(/** @lends cocos.nodes.SpriteBatchNode# */{
    textureAtlas: null,

    /**
     * @memberOf cocos.nodes
     * @class A BatchNode that accepts only Sprite using the same texture
     * @extends cocos.nodes.BatchNode
     * @constructs
     *
     * @opt {String} file (Optional) Path to image to use as sprite atlas
     * @opt {Texture2D} texture (Optional) Texture to use as sprite atlas
     * @opt {cocos.TextureAtlas} textureAtlas (Optional) TextureAtlas to use as sprite atlas
     */
    init: function (opts) {
        SpriteBatchNode.superclass.init.call(this, opts);

        var file         = opts.file,
            textureAtlas = opts.textureAtlas,
            texture      = opts.texture;

        if (file || texture) {
            textureAtlas = TextureAtlas.create({file: file, texture: texture});
        }

        this.set('textureAtlas', textureAtlas);
    },

    /**
     * @getter texture
     * @type cocos.Texture2D
     */
    get_texture: function () {
		return this.textureAtlas ? this.textureAtlas.texture : null;
	}

});

exports.BatchNode = BatchNode;
exports.SpriteBatchNode = SpriteBatchNode;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/index.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    path = require('path');

var modules = 'Node Layer Scene Label Sprite TMXTiledMap BatchNode RenderTexture Menu MenuItem'.w();

/** 
 * @memberOf cocos
 * @namespace All cocos2d nodes. i.e. anything that can be added to a Scene
 */
var nodes = {};

util.each(modules, function (mod, i) {
    util.extend(nodes, require('./' + mod));
});

module.exports = nodes;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/Label.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray FLIP_Y_AXIS*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    console = require('system').console,
    Director = require('../Director').Director,
    Node = require('./Node').Node,
    ccp = require('geometry').ccp;

var Label = Node.extend(/** @lends cocos.nodes.Label# */{
    string:   '',
    fontName: 'Helvetica',
    fontSize: 16,
    fontColor: 'white',

    /**
     * Renders a simple text label
     *
     * @constructs
     * @extends cocos.nodes.Node
     *
     * @opt {String} [string=""] The text string to draw
     * @opt {Float} [fontSize=16] The size of the font
     * @opt {String} [fontName="Helvetica"] The name of the font to use
     * @opt {String} [fontColor="white"] The color of the text
     */
    init: function (opts) {
        Label.superclass.init.call(this, opts);

        util.each('fontSize fontName fontColor string'.w(), util.callback(this, function (name) {
            // Set property on init
            if (opts[name]) {
                this.set(name, opts[name]);
            }

            // Update content size
            this._updateLabelContentSize();
        }));
    },

    /** 
     * String of the font name and size to use in a format &lt;canvas&gt; understands
     *
     * @getter font
     * @type String
     */
    get_font: function (key) {
        return this.get('fontSize') + 'px ' + this.get('fontName');
    },

    draw: function (context) {
        if (FLIP_Y_AXIS) {
            context.save();

            // Flip Y axis
            context.scale(1, -1);
            context.translate(0, -this.get('fontSize'));
        }


        context.fillStyle = this.get('fontColor');
        context.font = this.get('font');
        context.textBaseline = 'top';
        if (context.fillText) {
            context.fillText(this.get('string'), 0, 0);
        } else if (context.mozDrawText) {
            context.mozDrawText(this.get('string'));
        }

        if (FLIP_Y_AXIS) {
            context.restore();
        }
    },

    /**
     * @private
     */
    _updateLabelContentSize: function () {
        var ctx = Director.get('sharedDirector').get('context');
        var size = {width: 0, height: this.get('fontSize')};

        var prevFont = ctx.font;
        ctx.font = this.get('font');

        if (ctx.measureText) {
            var txtSize = ctx.measureText(this.get('string'));
            size.width = txtSize.width;
        } else if (ctx.mozMeasureText) {
            size.width = ctx.mozMeasureText(this.get('string'));
        }

        ctx.font = prevFont;

        this.set('contentSize', size);
    }
});

module.exports.Label = Label;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/Layer.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var Node = require('./Node').Node,
    util = require('util'),
    evt = require('event'),
    Director = require('../Director').Director,
    ccp    = require('geometry').ccp,
    EventDispatcher = require('../EventDispatcher').EventDispatcher;

var Layer = Node.extend(/** @lends cocos.nodes.Layer# */{
    isMouseEnabled: false,
    isKeyboardEnabled: false,
    mouseDelegatePriority: 0,
    keyboardDelegatePriority: 0,

    /** 
     * A fullscreen Node. You need at least 1 layer in your app to add other nodes to.
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.Node
     */
    init: function () {
        Layer.superclass.init.call(this);

        var s = Director.get('sharedDirector').get('winSize');

        this.set('isRelativeAnchorPoint', false);
        this.anchorPoint = ccp(0.5, 0.5);
        this.set('contentSize', s);

        evt.addListener(this, 'ismouseenabled_changed', util.callback(this, function () {
            if (this.isRunning) {
                if (this.isMouseEnabled) {
                    EventDispatcher.get('sharedDispatcher').addMouseDelegate({delegate: this, priority: this.get('mouseDelegatePriority')});
                } else {
                    EventDispatcher.get('sharedDispatcher').removeMouseDelegate({delegate: this});
                }
            }
        }));


        evt.addListener(this, 'iskeyboardenabled_changed', util.callback(this, function () {
            if (this.isRunning) {
                if (this.isKeyboardEnabled) {
                    EventDispatcher.get('sharedDispatcher').addKeyboardDelegate({delegate: this, priority: this.get('keyboardDelegatePriority')});
                } else {
                    EventDispatcher.get('sharedDispatcher').removeKeyboardDelegate({delegate: this});
                }
            }
        }));
    },

    onEnter: function () {
        if (this.isMouseEnabled) {
            EventDispatcher.get('sharedDispatcher').addMouseDelegate({delegate: this, priority: this.get('mouseDelegatePriority')});
        }
        if (this.isKeyboardEnabled) {
            EventDispatcher.get('sharedDispatcher').addKeyboardDelegate({delegate: this, priority: this.get('keyboardDelegatePriority')});
        }

        Layer.superclass.onEnter.call(this);
    },

    onExit: function () {
        if (this.isMouseEnabled) {
            EventDispatcher.get('sharedDispatcher').removeMouseDelegate({delegate: this});
        }
        if (this.isKeyboardEnabled) {
            EventDispatcher.get('sharedDispatcher').removeKeyboardDelegate({delegate: this});
        }

        Layer.superclass.onExit.call(this);
    }
});

module.exports.Layer = Layer;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/Menu.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    Layer = require('./Layer').Layer,
    Director = require('../Director').Director,
    MenuItem = require('./MenuItem').MenuItem,
    geom = require('geometry'), ccp = geom.ccp;

/** @private
 * @constant */
var kMenuStateWaiting = 0;

/** @private
 * @constant */
var kMenuStateTrackingTouch = 1;
	

var Menu = Layer.extend(/** @lends cocos.nodes.Menu# */{
	mouseDelegatePriority: (-Number.MAX_VALUE + 1),
	state: kMenuStateWaiting,
	selectedItem: null,
	opacuty: 255,
	color: null,

    /**
     * A fullscreen node used to render a selection of menu options
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.Layer
     *
     * @opt {cocos.nodes.MenuItem[]} items An array of MenuItems to draw on the menu
     */
	init: function (opts) {
		Menu.superclass.init.call(this, opts);

		var items = opts.items;

		this.set('isMouseEnabled', true);
		
        var s = Director.get('sharedDirector').get('winSize');

		this.set('isRelativeAnchorPoint', false);
		this.anchorPoint = ccp(0.5, 0.5);
		this.set('contentSize', s);

		this.set('position', ccp(s.width / 2, s.height / 2));


		if (items) {
			var z = 0;
			util.each(items, util.callback(this, function (item) {
				this.addChild({child: item, z: z++});
			}));
		}

        
	},

	addChild: function (opts) {
		if (!opts.child instanceof MenuItem) {
			throw "Menu only supports MenuItem objects as children";
		}

        Menu.superclass.addChild.call(this, opts);
    },

    itemForMouseEvent: function (event) {
        var location = event.locationInCanvas;

        var children = this.get('children');
        for (var i = 0, len = children.length; i < len; i++) {
            var item = children[i];

            if (item.get('visible') && item.get('isEnabled')) {
                var local = item.convertToNodeSpace(location);
                
                var r = item.get('rect');
                r.origin = ccp(0, 0);

                if (geom.rectContainsPoint(r, local)) {
                    return item;
                }

            }
        }

        return null;
    },

    mouseUp: function (event) {
        if (this.selectedItem) {
            this.selectedItem.set('isSelected', false);
            this.selectedItem.activate();

            return true;
        }

        if (this.state != kMenuStateWaiting) {
            this.set('state', kMenuStateWaiting);
        }

        return false;

    },
    mouseDown: function (event) {
        if (this.state != kMenuStateWaiting || !this.visible) {
            return false;
        }

        var selectedItem = this.itemForMouseEvent(event);
        this.set('selectedItem', selectedItem);
        if (selectedItem) {
            selectedItem.set('isSelected', true);
            this.set('state', kMenuStateTrackingTouch);

            return true;
        }

        return false;
    },

    mouseDragged: function (event) {
        var currentItem = this.itemForMouseEvent(event);

        if (currentItem != this.selectedItem) {
            if (this.selectedItem) {
                this.selectedItem.set('isSelected', false);
            }
            this.set('selectedItem', currentItem);
            if (this.selectedItem) {
                this.selectedItem.set('isSelected', true);
            }
        }

        if (currentItem && this.state == kMenuStateTrackingTouch) {
            return true;
        }

        return false;
        
    }

});

exports.Menu = Menu;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/MenuItem.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    Node = require('./Node').Node,
    Sprite = require('./Sprite').Sprite,
    rectMake = require('geometry').rectMake,
    ccp = require('geometry').ccp;

var MenuItem = Node.extend(/** @lends cocos.nodes.MenuItem# */{
	isEnabled: true,
	isSelected: false,
	callback: null,

    /**
     * Base class for any buttons or options in a menu
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.Node
     *
     * @opt {Function} callback Function to call when menu item is activated
     */
	init: function (opts) {
		MenuItem.superclass.init.call(this, opts);

		var callback = opts.callback;

		this.set('anchorPoint', ccp(0.5, 0.5));
		this.set('callback', callback);
	},

	activate: function () {
		if (this.isEnabled && this.callback) {
			this.callback(this);
		}
	},

    /**
     * @getter rect
     * @type geometry.Rect
     */
	get_rect: function () {
		return rectMake(
			this.position.x - this.contentSize.width  * this.anchorPoint.x,
			this.position.y - this.contentSize.height * this.anchorPoint.y,
			this.contentSize.width,
			this.contentSize.height
		);
	}
});

var MenuItemSprite = MenuItem.extend(/** @lends cocos.nodes.MenuItemSprite# */{
	normalImage: null,
	selectedImage: null,
	disabledImage: null,

    /**
     * A menu item that accepts any cocos.nodes.Node
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.MenuItem
     *
     * @opt {cocos.nodes.Node} normalImage Main Node to draw
     * @opt {cocos.nodes.Node} selectedImage Node to draw when menu item is selected
     * @opt {cocos.nodes.Node} disabledImage Node to draw when menu item is disabled
     */
	init: function (opts) {
		MenuItemSprite.superclass.init.call(this, opts);

		var normalImage   = opts.normalImage,
			selectedImage = opts.selectedImage,
			disabledImage = opts.disabledImage;

		this.set('normalImage', normalImage);
		this.set('selectedImage', selectedImage);
		this.set('disabledImage', disabledImage);

		this.set('contentSize', normalImage.get('contentSize'));
	},

	draw: function (ctx) {
		if (this.isEnabled) {
			if (this.isSelected) {
				this.selectedImage.draw(ctx);
			} else {
				this.normalImage.draw(ctx);
			}
		} else {
			if (this.disabledImage) {
				this.disabledImage.draw(ctx);
			} else {
				this.normalImage.draw(ctx);
			}
		}
	}
});

var MenuItemImage = MenuItemSprite.extend(/** @lends cocos.nodes.MenuItemImage# */{

    /**
     * MenuItem that accepts image files
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.MenuItemSprite
     *
     * @opt {String} normalImage Main image file to draw
     * @opt {String} selectedImage Image file to draw when menu item is selected
     * @opt {String} disabledImage Image file to draw when menu item is disabled
     */
	init: function (opts) {
		var normalI   = opts.normalImage,
			selectedI = opts.selectedImage,
			disabledI = opts.disabledImage,
			callback  = opts.callback;

		var normalImage = Sprite.create({file: normalI}),
			selectedImage = Sprite.create({file: selectedI}),
			disabledImage = null;

		if (disabledI) {
			disabledImage = Sprite.create({file: disabledI});
		}

		return MenuItemImage.superclass.init.call(this, {normalImage: normalImage, selectedImage: selectedImage, disabledImage: disabledImage, callback: callback});
    }
});

exports.MenuItem = MenuItem;
exports.MenuItemImage = MenuItemImage;
exports.MenuItemSprite = MenuItemSprite;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/Node.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    evt = require('event'),
    Scheduler = require('../Scheduler').Scheduler,
    ActionManager = require('../ActionManager').ActionManager,
    geo = require('geometry'), ccp = geo.ccp;

var Node = BObject.extend(/** @lends cocos.nodes.Node# */{
    isCocosNode: true,

    /**
     * Is the node visible
     * @type boolean
     */
    visible: true,

    /**
     * Position relative to parent node
     * @type geometry.Point
     */
    position: null,

    /**
     * Parent node
     * @type cocos.nodes.Node
     */
    parent: null,

    /**
     * Unique tag to identify the node
     * @type *
     */
    tag: null,

    /**
     * Size of the node
     * @type geometry.Size
     */
    contentSize: null,

    /**
     * Nodes Z index. i.e. draw order
     * @type Integer
     */
    zOrder: 0,

    /**
     * Anchor point for scaling and rotation. 0x0 is top left and 1x1 is bottom right
     * @type geometry.Point
     */
    anchorPoint: null,

    /**
     * Anchor point for scaling and rotation in pixels from top left
     * @type geometry.Point
     */
    anchorPointInPixels: null,

    /**
     * Rotation angle in degrees
     * @type Float
     */
    rotation: 0,

    /**
     * X scale factor
     * @type Float
     */
    scaleX: 1,

    /**
     * Y scale factor
     * @type Float
     */
    scaleY: 1,
    isRunning: false,
    isRelativeAnchorPoint: true,

    isTransformDirty: true,
    isInverseDirty: true,
    inverse: null,
    transformMatrix: null,

    /**
     * The child Nodes
     * @type cocos.nodes.Node[]
     */
    children: null,

    /**
     * @memberOf cocos.nodes
     * @class The base class all visual elements extend from
     * @extends BObject
     * @constructs
     */
    init: function () {
        Node.superclass.init.call(this);
        this.set('contentSize', {width: 0, height: 0});
        this.anchorPoint = ccp(0.5, 0.5);
        this.anchorPointInPixels = ccp(0, 0);
        this.position = ccp(0, 0);
        this.children = [];

        util.each(['scaleX', 'scaleY', 'rotation', 'position', 'anchorPoint', 'contentSize', 'isRelativeAnchorPoint'], util.callback(this, function (key) {
            evt.addListener(this, key.toLowerCase() + '_changed', util.callback(this, this._dirtyTransform));
        }));
        evt.addListener(this, 'anchorpoint_changed', util.callback(this, this._updateAnchorPointInPixels));
        evt.addListener(this, 'contentsize_changed', util.callback(this, this._updateAnchorPointInPixels));
    },

    /**
     * Calculates the anchor point in pixels and updates the
     * anchorPointInPixels property
     * @private
     */
    _updateAnchorPointInPixels: function () {
        var ap = this.get('anchorPoint'),
            cs = this.get('contentSize');
        this.set('anchorPointInPixels', ccp(cs.width * ap.x, cs.height * ap.y));
    },

    /**
     * Add a child Node
     *
     * @opt {cocos.nodes.Node} child The child node to add
     * @opt {Integer} [z] Z Index for the child
     * @opt {Integer|String} [tag] A tag to reference the child with
     * @returns {cocos.nodes.Node} The node the child was added to. i.e. 'this'
     */
    addChild: function (opts) {
        if (opts.isCocosNode) {
            return this.addChild({child: opts});
        }

        var child = opts.child,
            z = opts.z,
            tag = opts.tag;

        if (z === undefined || z === null) {
            z = child.get('zOrder');
        }

        //this.insertChild({child: child, z:z});
        var added = false;

        
        for (var i = 0, childLen = this.children.length; i < childLen; i++) {
            var c = this.children[i];
            if (c.zOrder > z) {
                added = true;
                this.children.splice(i, 0, child);
                break;
            }
        }

        if (!added) {
            this.children.push(child);
        }

        child.set('tag', tag);
        child.set('zOrder', z);
        child.set('parent', this);

        if (this.isRunning) {
            child.onEnter();
        }

        return this;
    },
    getChild: function (opts) {
        var tag = opts.tag;

        for (var i = 0; i < this.children.length; i++) {
            if (this.children[i].tag == tag) {
                return this.children[i];
            }
        }

        return null;
    },

    removeChild: function (opts) {
        var child = opts.child,
            cleanup = opts.cleanup;

        if (!child) {
            return;
        }

        var children = this.get('children'),
            idx = children.indexOf(child);

        if (idx > -1) {
            this.detatchChild({child: child, cleanup: cleanup});
        }
    },

    detatchChild: function (opts) {
        var child = opts.child,
            cleanup = opts.cleanup;

        var children = this.get('children'),
            isRunning = this.get('isRunning'),
            idx = children.indexOf(child);

        if (isRunning) {
            child.onExit();
        }

        if (cleanup) {
            child.cleanup();
        }

        child.set('parent', null);
        children.splice(idx, 1);
    },

    reorderChild: function (opts) {
        var child = opts.child,
            z     = opts.z;

        var pos = this.children.indexOf(child);
        if (pos == -1) {
            throw "Node isn't a child of this node";
        }

        child.set('zOrder', z);

        // Remove child
        this.children.splice(pos, 1);

        // Add child back at correct location
        var added = false;
        for (var i = 0, childLen = this.children.length; i < childLen; i++) {
            var c = this.children[i];
            if (c.zOrder > z) {
                added = true;
                this.children.splice(i, 0, child);
                break;
            }
        }

        if (!added) {
            this.children.push(child);
        }
    },

    /**
     * Draws the node. Override to do custom drawing. If it's less efficient to
     * draw only the area inside the rect then don't bother. The result will be
     * clipped to that area anyway.
     *
     * @param {CanvasRenderingContext2D|WebGLRenderingContext} context Canvas rendering context
     * @param {geometry.Rect} rect Rectangular region that needs redrawing. Limit drawing to this area only if it's more efficient to do so.
     */
    draw: function (context, rect) {
        // All draw code goes here
    },

    /**
     * @getter scale
     * @type Float
     */
    get_scale: function () {
        if (this.scaleX != this.scaleY) {
            throw "scaleX and scaleY aren't identical";
        }

        return this.scaleX;
    },

    /**
     * @setter scale
     * @type Float
     */
    set_scale: function (val) {
        this.set('scaleX', val);
        this.set('scaleY', val);
    },

    scheduleUpdate: function (opts) {
        opts = opts || {};
        var priority = opts.priority || 0;

        Scheduler.get('sharedScheduler').scheduleUpdate({target: this, priority: priority, paused: !this.get('isRunning')});
    },

    /**
     * Triggered when the node is added to a scene
     *
     * @event
     */
    onEnter: function () {
        util.each(this.children, function (child) {
            child.onEnter();
        });

        this.resumeSchedulerAndActions();
        this.set('isRunning', true);
    },

    /**
     * Triggered when the node is removed from a scene
     *
     * @event
     */
    onExit: function () {
        this.pauseSchedulerAndActions();
        this.set('isRunning', false);

        util.each(this.children, function (child) {
            child.onExit();
        });
    },

    cleanup: function () {
        this.stopAllActions();
        this.unscheduleAllSelectors();
        util.each(this.children, function (child) {
            child.cleanup();
        });
    },

    resumeSchedulerAndActions: function () {
        Scheduler.get('sharedScheduler').resumeTarget(this);
        ActionManager.get('sharedManager').resumeTarget(this);
    },
    pauseSchedulerAndActions: function () {
        Scheduler.get('sharedScheduler').pauseTarget(this);
        ActionManager.get('sharedManager').pauseTarget(this);
    },
    unscheduleAllSelectors: function () {
        Scheduler.get('sharedScheduler').unscheduleAllSelectorsForTarget(this);
    },
    stopAllActions: function () {
        ActionManager.get('sharedManager').removeAllActionsFromTarget(this);
    },

    visit: function (context, rect) {
        if (!this.visible) {
            return;
        }

        context.save();

        this.transform(context);

        // Adjust redraw region by nodes position
        if (rect) {
            var pos = this.get('position');
            rect = new geo.Rect(rect.origin.x - pos.x, rect.origin.y - pos.y, rect.size.width, rect.size.height);
        }

        // Draw background nodes
        util.each(this.children, function (child, i) {
            if (child.zOrder < 0) {
                child.visit(context, rect);
            }
        });

        this.draw(context, rect);

        // Draw foreground nodes
        util.each(this.children, function (child, i) {
            if (child.zOrder >= 0) {
                child.visit(context, rect);
            }
        });

        context.restore();
    },
    transform: function (context) {
        // Translate
        if (this.isRelativeAnchorPoint && (this.anchorPointInPixels.x !== 0 || this.anchorPointInPixels !== 0)) {
            context.translate(Math.round(-this.anchorPointInPixels.x), Math.round(-this.anchorPointInPixels.y));
        }

        if (this.anchorPointInPixels.x !== 0 || this.anchorPointInPixels !== 0) {
            context.translate(Math.round(this.position.x + this.anchorPointInPixels.x), Math.round(this.position.y + this.anchorPointInPixels.y));
        } else {
            context.translate(Math.round(this.position.x), Math.round(this.position.y));
        }

        // Rotate
        context.rotate(geo.degreesToRadians(this.get('rotation')));

        // Scale
        context.scale(this.scaleX, this.scaleY);
 
        if (this.anchorPointInPixels.x !== 0 || this.anchorPointInPixels !== 0) {
            context.translate(Math.round(-this.anchorPointInPixels.x), Math.round(-this.anchorPointInPixels.y));
        }
    },

    runAction: function (action) {
        ActionManager.get('sharedManager').addAction({action: action, target: this, paused: this.get('isRunning')});
    },

    nodeToParentTransform: function () {
        if (this.isTransformDirty) {
            this.transformMatrix = geo.affineTransformIdentity();

            if (!this.isRelativeAnchorPoint && !geo.pointEqualToPoint(this.anchorPointInPixels, ccp(0, 0))) {
                this.transformMatrix = geo.affineTransformTranslate(this.transformMatrix, this.anchorPointInPixels.x, this.anchorPointInPixels.y);
            }
            
            if (!geo.pointEqualToPoint(this.position, ccp(0, 0))) {
                this.transformMatrix = geo.affineTransformTranslate(this.transformMatrix, this.position.x, this.position.y);
            }

            if (this.rotation !== 0) {
                this.transformMatrix = geo.affineTransformRotate(this.transformMatrix, -geo.degreesToRadians(this.rotation));
            }
            if (!(this.scaleX == 1 && this.scaleY == 1)) {
                this.transformMatrix = geo.affineTransformScale(this.transformMatrix, this.scaleX, this.scaleY);
            }
            
            if (!geo.pointEqualToPoint(this.anchorPointInPixels, ccp(0, 0))) {
                this.transformMatrix = geo.affineTransformTranslate(this.transformMatrix, -this.anchorPointInPixels.x, -this.anchorPointInPixels.y);
            }
            
            this.set('isTransformDirty', false);
                
        }

        return this.transformMatrix;
    },

    parentToNodeTransform: function () {
        // TODO
    },

    nodeToWorldTransform: function () {
        var t = this.nodeToParentTransform();

        var p;
        for (p = this.get('parent'); p; p = p.get('parent')) {
            t = geo.affineTransformConcat(t, p.nodeToParentTransform());
        }

        return t;
    },

    worldToNodeTransform: function () {
        return geo.affineTransformInvert(this.nodeToWorldTransform());
    },

    convertToNodeSpace: function (worldPoint) {
        return geo.pointApplyAffineTransform(worldPoint, this.worldToNodeTransform());
    },

    /**
     * @getter boundingBox
     * @type geometry.Rect
     */
    get_boundingBox: function () {
        var cs = this.get('contentSize');
        var rect = geo.rectMake(0, 0, cs.width, cs.height);
        rect = geo.rectApplyAffineTransform(rect, this.nodeToParentTransform());
        return rect;
    },

    /**
     * @getter worldBoundingBox
     * @type geometry.Rect
     */
    get_worldBoundingBox: function () {
        var cs = this.get('contentSize');

        var rect = geo.rectMake(0, 0, cs.width, cs.height);
        rect = geo.rectApplyAffineTransform(rect, this.nodeToWorldTransform());
        return rect;
    },

    /**
     * The area of the node currently visible on screen. Returns an rect even
     * if visible is false.
     *
     * @getter visibleRect
     * @type geometry.Rect
     */
    get_visibleRect: function () {
        var s = require('../Director').Director.get('sharedDirector').get('winSize');
        var rect = new geo.Rect(
            0, 0,
            s.width, s.height
        );

        return geo.rectApplyAffineTransform(rect, this.worldToNodeTransform());
    },

    /**
     * @private
     */
    _dirtyTransform: function () {
        this.set('isTransformDirty', true);
    }
});

module.exports.Node = Node;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/RenderTexture.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray FLIP_Y_AXIS*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    evt = require('event'),
    Node = require('./Node').Node,
    geo = require('geometry'),
    Sprite = require('./Sprite').Sprite,
    TextureAtlas = require('../TextureAtlas').TextureAtlas,
    ccp = geo.ccp;

var RenderTexture = Node.extend(/** @lends cocos.nodes.RenderTexture# */{
    canvas: null,
    context: null,
    sprite: null,

    /** 
     * An in-memory canvas which can be drawn to in the background before drawing on screen
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.Node
     *
     * @opt {Integer} width The width of the canvas
     * @opt {Integer} height The height of the canvas
     */
    init: function (opts) {
        RenderTexture.superclass.init.call(this, opts);

        var width = opts.width,
            height = opts.height;

        evt.addListener(this, 'contentsize_changed', util.callback(this, this._resizeCanvas));

        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');

        var atlas = TextureAtlas.create({canvas: this.canvas});
        this.sprite = Sprite.create({textureAtlas: atlas, rect: {origin: ccp(0, 0), size: {width: width, height: height}}});

        this.set('contentSize', geo.sizeMake(width, height));
        this.addChild(this.sprite);
        this.set('anchorPoint', ccp(0, 0));
        this.sprite.set('anchorPoint', ccp(0, 0));

    },

    /**
     * @private
     */
    _resizeCanvas: function () {
        var size = this.get('contentSize'),
            canvas = this.get('canvas');

        canvas.width  = size.width;
        canvas.height = size.height;
        if (FLIP_Y_AXIS) {
            this.context.scale(1, -1);
            this.context.translate(0, -canvas.height);
        }

        var s = this.get('sprite');
        if (s) {
            s.set('textureRect', {rect: geo.rectMake(0, 0, size.width, size.height)});
        }
    },

    /**
     * Clear the canvas
     */
    clear: function (rect) {
        if (rect) {
            this.context.clearRect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height);
        } else {
            this.canvas.width = this.canvas.width;
            if (FLIP_Y_AXIS) {
                this.context.scale(1, -1);
                this.context.translate(0, -this.canvas.height);
            }
        }
    }
});

module.exports.RenderTexture = RenderTexture;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/Scene.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var Node = require('./Node').Node;

var Scene = Node.extend(/** @lends cocos.nodes.Scene */{
    /**
     * Everything in your view will be a child of this object. You need at least 1 scene per app.
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.Node
     */
    init: function () {
        Scene.superclass.init.call(this);
    }

});

module.exports.Scene = Scene;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/Sprite.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    evt = require('event'),
    Director = require('../Director').Director,
    TextureAtlas = require('../TextureAtlas').TextureAtlas,
    Node = require('./Node').Node,
    geo = require('geometry'),
    ccp = geo.ccp;

var Sprite = Node.extend(/** @lends cocos.nodes.Sprite# */{
    textureAtlas: null,
    rect: null,
    dirty: true,
    recursiveDirty: true,
    quad: null,
    flipX: false,
    flipY: false,
    offsetPosition: null,
    unflippedOffsetPositionFromCenter: null,
    untrimmedSize: null,

    /**
     * A small 2D graphics than can be animated
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.Node
     *
     * @opt {String} file Path to image to use as sprite atlas
     * @opt {Rect} [rect] The rect in the sprite atlas image file to use as the sprite
     */
    init: function (opts) {
        Sprite.superclass.init.call(this, opts);

        opts = opts || {};

        var file         = opts.file,
            textureAtlas = opts.textureAtlas,
            texture      = opts.texture,
            frame        = opts.frame,
            spritesheet  = opts.spritesheet,
            rect         = opts.rect;

        this.set('offsetPosition', ccp(0, 0));
        this.set('unflippedOffsetPositionFromCenter', ccp(0, 0));


        if (frame) {
            texture = frame.get('texture');
            rect    = frame.get('rect');
        }

        util.each(['scale', 'scaleX', 'scaleY', 'rect', 'flipX', 'flipY'], util.callback(this, function (key) {
            evt.addListener(this, key.toLowerCase() + '_changed', util.callback(this, this._updateQuad));
        }));
        evt.addListener(this, 'textureatlas_changed', util.callback(this, this._updateTextureQuad));

        if (file || texture) {
            textureAtlas = TextureAtlas.create({file: file, texture: texture});
        } else if (spritesheet) {
            textureAtlas = spritesheet.get('textureAtlas');
            this.set('useSpriteSheet', true);
        } else if (!textureAtlas) {
            //throw "Sprite has no texture";
        }

        if (!rect && textureAtlas) {
            rect = {origin: ccp(0, 0), size: {width: textureAtlas.texture.size.width, height: textureAtlas.texture.size.height}};
        }

        if (rect) {
            this.set('rect', rect);
            this.set('contentSize', rect.size);

            this.quad = {
                drawRect: {origin: ccp(0, 0), size: rect.size},
                textureRect: rect
            };
        }

        this.set('textureAtlas', textureAtlas);

        if (frame) {
            this.set('displayFrame', frame);
        }
    },

    /**
     * @private
     */
    _updateTextureQuad: function (obj, key, texture, oldTexture) {
        if (oldTexture) {
            oldTexture.removeQuad({quad: this.get('quad')});
        }

        if (texture) {
            texture.insertQuad({quad: this.get('quad')});
        }
    },

    /**
     * @setter textureCoords
     * @type geometry.Rect
     */
    set_textureCoords: function (rect) {
        var quad = this.get('quad');
        if (!quad) {
            quad = {
                drawRect: geo.rectMake(0, 0, 0, 0), 
                textureRect: geo.rectMake(0, 0, 0, 0)
            };
        }

        quad.textureRect = util.copy(rect);

        this.set('quad', quad);
    },

    /**
     * @setter textureRect
     * @type geometry.Rect
     */
    set_textureRect: function (opts) {
        var rect = opts.rect,
            rotated = !!opts.rotated,
            untrimmedSize = opts.untrimmedSize || rect.size;

        this.set('contentSize', untrimmedSize);
        this.set('rect', util.copy(rect));
        this.set('textureCoords', rect);

        var quad = this.get('quad');

        var relativeOffset = util.copy(this.get('unflippedOffsetPositionFromCenter'));

        if (this.get('flipX')) {
            relativeOffset.x = -relativeOffset.x;
        }
        if (this.get('flipY')) {
            relativeOffset.y = -relativeOffset.y;
        }

        var offsetPosition = this.get('offsetPosition');
        offsetPosition.x =  relativeOffset.x + (this.get('contentSize').width  - rect.size.width) / 2;
        offsetPosition.y = -relativeOffset.y + (this.get('contentSize').height - rect.size.height) / 2;

        quad.drawRect.origin = util.copy(offsetPosition);
        quad.drawRect.size = util.copy(rect.size);
        if (this.flipX) {
            quad.drawRect.size.width *= -1;
            quad.drawRect.origin.x = -rect.size.width;
        }
        if (this.flipY) {
            quad.drawRect.size.height *= -1;
            quad.drawRect.origin.y = -rect.size.height;
        }

        this.set('quad', quad);
    },

    /**
     * @private
     */
    _updateQuad: function () {
        if (!this.quad) {
            this.quad = {
                drawRect: geo.rectMake(0, 0, 0, 0), 
                textureRect: geo.rectMake(0, 0, 0, 0)
            };
        }

        var relativeOffset = util.copy(this.get('unflippedOffsetPositionFromCenter'));

        if (this.get('flipX')) {
            relativeOffset.x = -relativeOffset.x;
        }
        if (this.get('flipY')) {
            relativeOffset.y = -relativeOffset.y;
        }

        var offsetPosition = this.get('offsetPosition');
        offsetPosition.x = relativeOffset.x + (this.get('contentSize').width  - this.get('rect').size.width) / 2;
        offsetPosition.y = relativeOffset.y + (this.get('contentSize').height - this.get('rect').size.height) / 2;

        this.quad.textureRect = util.copy(this.rect);
        this.quad.drawRect.origin = util.copy(offsetPosition);
        this.quad.drawRect.size = util.copy(this.rect.size);

        if (this.flipX) {
            this.quad.drawRect.size.width *= -1;
            this.quad.drawRect.origin.x = -this.rect.size.width;
        }
        if (this.flipY) {
            this.quad.drawRect.size.height *= -1;
            this.quad.drawRect.origin.y = -this.rect.size.height;
        }
    },

    updateTransform: function (ctx) {
        if (!this.useSpriteSheet) {
            throw "updateTransform is only valid when Sprite is being rendered using a SpriteSheet";
        }

        if (!this.visible) {
            this.set('dirty', false);
            this.set('recursiveDirty', false);
            return;
        }

        // TextureAtlas has hard reference to this quad so we can just update it directly
        this.quad.drawRect.origin = {
            x: this.position.x - this.anchorPointInPixels.x * this.scaleX,
            y: this.position.y - this.anchorPointInPixels.y * this.scaleY
        };
        this.quad.drawRect.size = {
            width: this.rect.size.width * this.scaleX,
            height: this.rect.size.height * this.scaleY
        };

        this.set('dirty', false);
        this.set('recursiveDirty', false);
    },

    draw: function (ctx) {
        if (!this.quad) {
            return;
        }
        this.get('textureAtlas').drawQuad(ctx, this.quad);
    },

    isFrameDisplayed: function (frame) {
        if (!this.rect || !this.textureAtlas) {
            return false;
        }
        return (frame.texture === this.textureAtlas.texture && geo.rectEqualToRect(frame.rect, this.rect));
    },


    /**
     * @setter displayFrame
     * @type cocos.SpriteFrame
     */
    set_displayFrame: function (frame) {
        if (!frame) {
            delete this.quad;
            return;
        }
        this.set('unflippedOffsetPositionFromCenter', util.copy(frame.offset));


        // change texture
        if (!this.textureAtlas || frame.texture !== this.textureAtlas.texture) {
            this.set('textureAtlas', TextureAtlas.create({texture: frame.texture}));
        }

        this.set('textureRect', {rect: frame.rect, rotated: frame.rotated, untrimmedSize: frame.originalSize});
    }
});

module.exports.Sprite = Sprite;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/TMXLayer.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray FLIP_Y_AXIS*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    SpriteBatchNode = require('./BatchNode').SpriteBatchNode,
    Sprite = require('./Sprite').Sprite,
    TMXOrientationOrtho = require('../TMXOrientation').TMXOrientationOrtho,
    TMXOrientationHex   = require('../TMXOrientation').TMXOrientationHex,
    TMXOrientationIso   = require('../TMXOrientation').TMXOrientationIso,
    geo    = require('geometry'),
    ccp    = geo.ccp,
    Node = require('./Node').Node;

var TMXLayer = SpriteBatchNode.extend(/** @lends cocos.nodes.TMXLayer# */{
    layerSize: null,
    layerName: '',
    tiles: null,
    tilset: null,
    layerOrientation: 0,
    mapTileSize: null,
    properties: null,

    /** 
     * A tile map layer loaded from a TMX file. This will probably automatically be made by cocos.TMXTiledMap
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.SpriteBatchNode
     *
     * @opt {cocos.TMXTilesetInfo} tilesetInfo
     * @opt {cocos.TMXLayerInfo} layerInfo
     * @opt {cocos.TMXMapInfo} mapInfo
     */
    init: function (opts) {
        var tilesetInfo = opts.tilesetInfo,
            layerInfo = opts.layerInfo,
            mapInfo = opts.mapInfo;

        var size = layerInfo.get('layerSize'),
            totalNumberOfTiles = size.width * size.height;

        var tex = null;
        if (tilesetInfo) {
            tex = tilesetInfo.sourceImage;
        }

        TMXLayer.superclass.init.call(this, {file: tex});

		this.set('anchorPoint', ccp(0, 0));

        this.layerName = layerInfo.get('name');
        this.layerSize = layerInfo.get('layerSize');
        this.tiles = layerInfo.get('tiles');
        this.minGID = layerInfo.get('minGID');
        this.maxGID = layerInfo.get('maxGID');
        this.opacity = layerInfo.get('opacity');
        this.properties = util.copy(layerInfo.properties);

        this.tileset = tilesetInfo;
        this.mapTileSize = mapInfo.get('tileSize');
        this.layerOrientation = mapInfo.get('orientation');

        var offset = this.calculateLayerOffset(layerInfo.get('offset'));
        this.set('position', offset);

        this.set('contentSize', geo.sizeMake(this.layerSize.width * this.mapTileSize.width, (this.layerSize.height * (this.mapTileSize.height - 1)) + this.tileset.tileSize.height));
    },

    calculateLayerOffset: function (pos) {
        var ret = ccp(0, 0);

        switch (this.layerOrientation) {
        case TMXOrientationOrtho:
            ret = ccp(pos.x * this.mapTileSize.width, pos.y * this.mapTileSize.height);
            break;
        case TMXOrientationIso:
            // TODO
            break;
        case TMXOrientationHex:
            // TODO
            break;
        }

        return ret;
    },

    setupTiles: function () {
        this.tileset.bindTo('imageSize', this.get('texture'), 'contentSize');


        for (var y = 0; y < this.layerSize.height; y++) {
            for (var x = 0; x < this.layerSize.width; x++) {
                
                var pos = x + this.layerSize.width * y,
                    gid = this.tiles[pos];
                
                if (gid !== 0) {
                    this.appendTile({gid: gid, position: ccp(x, y)});
                    
                    // Optimization: update min and max GID rendered by the layer
                    this.minGID = Math.min(gid, this.minGID);
                    this.maxGID = Math.max(gid, this.maxGID);
                }
            }
        }
    },
    appendTile: function (opts) {
        var gid = opts.gid,
            pos = opts.position;

        var z = pos.x + pos.y * this.layerSize.width;
            
        var rect = this.tileset.rectForGID(gid);
        var tile = Sprite.create({rect: rect, textureAtlas: this.textureAtlas});
        tile.set('position', this.positionAt(pos));
        tile.set('anchorPoint', ccp(0, 0));
        tile.set('opacity', this.get('opacity'));
        
        this.addChild({child: tile, z: 0, tag: z});
    },
    positionAt: function (pos) {
        switch (this.layerOrientation) {
        case TMXOrientationOrtho:
            return this.positionForOrthoAt(pos);
        case TMXOrientationIso:
            return this.positionForIsoAt(pos);
        /*
        case TMXOrientationHex:
            // TODO
        */
        default:
            return ccp(0, 0);
        }
    },
    positionForOrthoAt: function (pos) {
        var overlap = this.mapTileSize.height - this.tileset.tileSize.height;
        var x = Math.floor(pos.x * this.mapTileSize.width + 0.49);
        var y;
        if (FLIP_Y_AXIS) {
            y = Math.floor((this.get('layerSize').height - pos.y - 1) * this.mapTileSize.height + 0.49);
        } else {
            y = Math.floor(pos.y * this.mapTileSize.height + 0.49) + overlap;
        }
        return ccp(x, y);
    },

    positionForIsoAt: function (pos) {
        var mapTileSize = this.get('mapTileSize'),
            layerSize = this.get('layerSize');

        if (FLIP_Y_AXIS) {
            return ccp(
                mapTileSize.width  / 2 * (layerSize.width + pos.x - pos.y - 1),
                mapTileSize.height / 2 * ((layerSize.height * 2 - pos.x - pos.y) - 2)
            );
        } else {
            throw "Isometric tiles without FLIP_Y_AXIS is currently unsupported";
        }
    },


    tileGID: function (pos) {
        var tilesPerRow = this.get('layerSize').width,
            tilePos = pos.x + (pos.y * tilesPerRow);

        return this.tiles[tilePos];
    },
    removeTile: function (pos) {
        var gid = this.tileGID(pos);
        if (gid === 0) {
            // Tile is already blank
            return;
        }

        var tiles = this.get('tiles'),
            tilesPerRow = this.get('layerSize').width,
            tilePos = pos.x + (pos.y * tilesPerRow);


        tiles[tilePos] = 0;

        var sprite = this.getChild({tag: tilePos});
        if (sprite) {
            this.removeChild({child: sprite});
        }
    }
});

exports.TMXLayer = TMXLayer;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/TMXTiledMap.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    geo = require('geometry'),
    ccp = geo.ccp,
    Node = require('./Node').Node,
    TMXOrientationOrtho = require('../TMXOrientation').TMXOrientationOrtho,
    TMXOrientationHex   = require('../TMXOrientation').TMXOrientationHex,
    TMXOrientationIso   = require('../TMXOrientation').TMXOrientationIso,
    TMXLayer   = require('./TMXLayer').TMXLayer,
    TMXMapInfo = require('../TMXXMLParser').TMXMapInfo;

var TMXTiledMap = Node.extend(/** @lends cocos.nodes.TMXTiledMap# */{
    mapSize: null,
    tileSize: null,
    mapOrientation: 0,
    objectGroups: null,
    properties: null,
    tileProperties: null,

    /**
     * A TMX Map loaded from a .tmx file
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.Node
     *
     * @opt {String} file The file path of the TMX map to load
     */
    init: function (opts) {
        TMXTiledMap.superclass.init.call(this, opts);

        this.set('anchorPoint', ccp(0, 0));

        var mapInfo = TMXMapInfo.create(opts.file);

        this.mapSize        = mapInfo.get('mapSize');
        this.tileSize       = mapInfo.get('tileSize');
        this.mapOrientation = mapInfo.get('orientation');
        this.objectGroups   = mapInfo.get('objectGroups');
        this.properties     = mapInfo.get('properties');
        this.tileProperties = mapInfo.get('tileProperties');

        // Add layers to map
        var idx = 0;
        util.each(mapInfo.layers, util.callback(this, function (layerInfo) {
            if (layerInfo.get('visible')) {
                var child = this.parseLayer({layerInfo: layerInfo, mapInfo: mapInfo});
                this.addChild({child: child, z: idx, tag: idx});

                var childSize   = child.get('contentSize');
                var currentSize = this.get('contentSize');
                currentSize.width  = Math.max(currentSize.width,  childSize.width);
                currentSize.height = Math.max(currentSize.height, childSize.height);
                this.set('contentSize', currentSize);

                idx++;
            }
        }));
    },
    
    parseLayer: function (opts) {
        var tileset = this.tilesetForLayer(opts);
        var layer = TMXLayer.create({tilesetInfo: tileset, layerInfo: opts.layerInfo, mapInfo: opts.mapInfo});

        layer.setupTiles();

        return layer;
    },

    tilesetForLayer: function (opts) {
        var layerInfo = opts.layerInfo,
            mapInfo = opts.mapInfo,
            size = layerInfo.get('layerSize');

        // Reverse loop
        var tileset;
        for (var i = mapInfo.tilesets.length - 1; i >= 0; i--) {
            tileset = mapInfo.tilesets[i];

            for (var y = 0; y < size.height; y++) {
                for (var x = 0; x < size.width; x++) {
                    var pos = x + size.width * y, 
                        gid = layerInfo.tiles[pos];

                    if (gid !== 0 && gid >= tileset.firstGID) {
                        return tileset;
                    }
                } // for (var x
            } // for (var y
        } // for (var i

        //console.log("cocos2d: Warning: TMX Layer '%s' has no tiles", layerInfo.name);
        return tileset;
    },
    
    /**
     * Return the ObjectGroup for the secific group
     *
     * @opt {String} name The object group name
     * @returns {cocos.TMXObjectGroup} The object group
     */
    objectGroupNamed: function(opts) {
        var objectGroupName = opts.name,
            objectGroup = null;

        this.objectGroups.forEach(function(item) {

            if(item.name == objectGroupName) {
                objectGroup = item;
            }
        });
        if(objectGroup != null) {
            return objectGroup;
        }
    }
});

exports.TMXTiledMap = TMXTiledMap;


}};
__resources__["/__builtin__/libs/cocos2d/Scheduler.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util');

/** @ignore */
function HashUpdateEntry() {
    this.timers = [];
    this.timerIndex = 0;
    this.currentTimer = null;
    this.currentTimerSalvaged = false;
    this.paused = false;
}

/** @ignore */
function HashMethodEntry() {
    this.timers = [];
    this.timerIndex = 0;
    this.currentTimer = null;
    this.currentTimerSalvaged = false;
    this.paused = false;
}

var Timer = BObject.extend(/** @lends cocos.Timer# */{
    callback: null,
    interval: 0,
    elapsed: -1,

    /**
     * Runs a function repeatedly at a fixed interval
     *
     * @memberOf cocos
     * @constructs
     * @extends BObject
     *
     * @opt {Function} callback The function to run at each interval
     * @opt {Float} interval Number of milliseconds to wait between each exectuion of callback
     */
    init: function (opts) {
        Timer.superclass.init(this, opts);

        this.set('callback', opts.callback);
        this.set('interval', opts.interval || 0);
        this.set('elapsed', -1);
    },

    /**
     * @private
     */
    update: function (dt) {
        if (this.elapsed == -1) {
            this.elapsed = 0;
        } else {
            this.elapsed += dt;
        }

        if (this.elapsed >= this.interval) {
            this.callback(this.elapsed);
            this.elapsed = 0;
        }
    }
});


var Scheduler = BObject.extend(/** @lends cocos.Scheduler# */{
    updates0: null,
    updatesNeg: null,
    updatesPos: null,
    hashForUpdates: null,
    hashForMethods: null,
    timeScale: 1.0,

    /**
     * Runs the timers
     *
     * @memberOf cocos
     * @constructs
     * @extends BObject
     * @singleton
     * @private
     */
    init: function () {
        this.updates0 = [];
        this.updatesNeg = [];
        this.updatesPos = [];
        this.hashForUpdates = {};
        this.hashForMethods = {};
    },

    schedule: function (opts) {
        var target   = opts.target,
            method   = opts.method,
            interval = opts.interval,
            paused   = opts.paused || false;

        var element = this.hashForMethods[target.get('id')];

        if (!element) {
            element = new HashMethodEntry();
            this.hashForMethods[target.get('id')] = element;
            element.target = target;
            element.paused = paused;
        } else if (element.paused != paused) {
            throw "cocos.Scheduler. Trying to schedule a method with a pause value different than the target";
        }

        var timer = Timer.create({callback: util.callback(target, method), interval: interval});
        element.timers.push(timer);
    },

    scheduleUpdate: function (opts) {
        var target   = opts.target,
            priority = opts.priority,
            paused   = opts.paused;

        var i, len;
        var entry = {target: target, priority: priority, paused: paused};
        var added = false;

        if (priority === 0) {
            this.updates0.push(entry);
        } else if (priority < 0) {
            for (i = 0, len = this.updatesNeg.length; i < len; i++) {
                if (priority < this.updatesNeg[i].priority) {
                    this.updatesNeg.splice(i, 0, entry);
                    added = true;
                    break;
                }
            }

            if (!added) {
                this.updatesNeg.push(entry);
            }
        } else /* priority > 0 */{
            for (i = 0, len = this.updatesPos.length; i < len; i++) {
                if (priority < this.updatesPos[i].priority) {
                    this.updatesPos.splice(i, 0, entry);
                    added = true;
                    break;
                }
            }

            if (!added) {
                this.updatesPos.push(entry);
            }
        }

        this.hashForUpdates[target.get('id')] = entry;
    },

    tick: function (dt) {
        var i, len, x;
        if (this.timeScale != 1.0) {
            dt *= this.timeScale;
        }

        var entry;
        for (i = 0, len = this.updatesNeg.length; i < len; i++) {
            entry = this.updatesNeg[i];
            if (!entry.paused) {
                entry.target.update(dt);
            }
        }

        for (i = 0, len = this.updates0.length; i < len; i++) {
            entry = this.updates0[i];
            if (!entry.paused) {
                entry.target.update(dt);
            }
        }

        for (i = 0, len = this.updatesPos.length; i < len; i++) {
            entry = this.updatesPos[i];
            if (!entry.paused) {
                entry.target.update(dt);
            }
        }

        for (x in this.hashForMethods) {
            if (this.hashForMethods.hasOwnProperty(x)) {
                entry = this.hashForMethods[x];
                for (i = 0, len = entry.timers.length; i < len; i++) {
                    var timer = entry.timers[i];
                    timer.update(dt);
                }
            }
        }

	},

    unscheduleAllSelectorsForTarget: function (target) {
    },

    pauseTarget: function (target) {
        var element = this.hashForMethods[target.get('id')];
        if (element) {
            element.paused = true;
        }

        var elementUpdate = this.hashForUpdates[target.get('id')];
        if (elementUpdate) {
            elementUpdate.paused = true;
        }
    },

	resumeTarget: function (target) {
        var element = this.hashForMethods[target.get('id')];
        if (element) {
            element.paused = false;
        }

        var elementUpdate = this.hashForUpdates[target.get('id')];
        //console.log('foo', target.get('id'), elementUpdate);
        if (elementUpdate) {
            elementUpdate.paused = false;
        }
	}
});

util.extend(Scheduler, /** @lends cocos.Scheduler */{
    /**
     * A shared singleton instance of cocos.Scheduler
     * @getter sharedScheduler 
     * @type cocos.Scheduler
     */
    get_sharedScheduler: function (key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }
});

exports.Timer = Timer;
exports.Scheduler = Scheduler;

}};
__resources__["/__builtin__/libs/cocos2d/SpriteFrame.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    geo = require('geometry'),
    ccp = geo.ccp;

var SpriteFrame = BObject.extend(/** @lends cocos.SpriteFrame# */{
    rect: null,
    rotated: false,
    offset: null,
    originalSize: null,
    texture: null,

    /**
     * Represents a single frame of animation for a cocos.Sprite
     *
     * <p>A SpriteFrame has:<br>
     * - texture: A Texture2D that will be used by the Sprite<br>
     * - rectangle: A rectangle of the texture</p>
     *
     * <p>You can modify the frame of a Sprite by doing:</p>
     * 
     * <code>var frame = SpriteFrame.create({texture: texture, rect: rect});
     * sprite.set('displayFrame', frame);</code>
     *
     * @memberOf cocos
     * @constructs
     * @extends BObject
     *
     * @opt {cocos.Texture2D} texture The texture to draw this frame using
     * @opt {geometry.Rect} rect The rectangle inside the texture to draw
     */
    init: function (opts) {
        SpriteFrame.superclass.init(this, opts);

        this.texture      = opts.texture;
        this.rect         = opts.rect;
        this.rotated      = !!opts.rotate;
        this.offset       = opts.offset || ccp(0, 0);
        this.originalSize = opts.originalSize || util.copy(this.rect.size);
    },

    /**
     * @ignore
     */
    toString: function () {
        return "[object SpriteFrame | TextureName=" + this.texture.get('name') + ", Rect = (" + this.rect.origin.x + ", " + this.rect.origin.y + ", " + this.rect.size.width + ", " + this.rect.size.height + ")]";
    },

    /**
     * Make a copy of this frame
     *
     * @returns {cocos.SpriteFrame} Exact copy of this object
     */
    copy: function () {
        return SpriteFrame.create({rect: this.rect, rotated: this.rotated, offset: this.offset, originalSize: this.originalSize, texture: this.texture});
    }

});

exports.SpriteFrame = SpriteFrame;

}};
__resources__["/__builtin__/libs/cocos2d/SpriteFrameCache.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray FLIP_Y_AXIS*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    geo = require('geometry'),
    Plist = require('Plist').Plist,
    SpriteFrame = require('./SpriteFrame').SpriteFrame,
    Texture2D = require('./Texture2D').Texture2D;

var SpriteFrameCache = BObject.extend(/** @lends cocos.SpriteFrameCache# */{
    /**
     * List of sprite frames
     * @type Object
     */
    spriteFrames: null,

    /**
     * List of sprite frame aliases
     * @type Object
     */
    spriteFrameAliases: null,


    /**
     * @memberOf cocos
     * @extends BObject
     * @constructs
     * @singleton
     */
    init: function () {
        SpriteFrameCache.superclass.init.call(this);

        this.set('spriteFrames', {});
        this.set('spriteFrameAliases', {});
    },

    /**
     * Add SpriteFrame(s) to the cache
     *
     * @param {String} opts.file The filename of a Zwoptex .plist containing the frame definiitons.
     */
    addSpriteFrames: function (opts) {
        var plistPath = opts.file,
            plist = Plist.create({file: plistPath}),
            plistData = plist.get('data');


        var metaDataDict = plistData.metadata,
            framesDict = plistData.frames;

        var format = 0,
            texturePath = null;

        if (metaDataDict) {
            format = metaDataDict.format;
            // Get texture path from meta data
            texturePath = metaDataDict.textureFileName;
        }

        if (!texturePath) {
            // No texture path so assuming it's the same name as the .plist but ending in .png
            texturePath = plistPath.replace(/\.plist$/i, '.png');
        }


        var texture = Texture2D.create({file: texturePath});

        // Add frames
        for (var frameDictKey in framesDict) {
            if (framesDict.hasOwnProperty(frameDictKey)) {
                var frameDict = framesDict[frameDictKey],
                    spriteFrame = null;

                switch (format) {
                case 0:
                    var x = frameDict.x,
                        y =  frameDict.y,
                        w =  frameDict.width,
                        h =  frameDict.height,
                        ox = frameDict.offsetX,
                        oy = frameDict.offsetY,
                        ow = frameDict.originalWidth,
                        oh = frameDict.originalHeight;

                    // check ow/oh
                    if (!ow || !oh) {
                        //console.log("cocos2d: WARNING: originalWidth/Height not found on the CCSpriteFrame. AnchorPoint won't work as expected. Regenerate the .plist");
                    }

                    if (FLIP_Y_AXIS) {
                        oy *= -1;
                    }

                    // abs ow/oh
                    ow = Math.abs(ow);
                    oh = Math.abs(oh);

                    // create frame
                    spriteFrame = SpriteFrame.create({texture: texture,
                                                         rect: geo.rectMake(x, y, w, h),
                                                       rotate: false,
                                                       offset: geo.ccp(ox, oy),
                                                 originalSize: geo.sizeMake(ow, oh)});
                    break;

                case 1:
                case 2:
                    var frame      = geo.rectFromString(frameDict.frame),
                        rotated    = !!frameDict.rotated,
                        offset     = geo.pointFromString(frameDict.offset),
                        sourceSize = geo.sizeFromString(frameDict.sourceSize);

                    if (FLIP_Y_AXIS) {
                        offset.y *= -1;
                    }


                    // create frame
                    spriteFrame = SpriteFrame.create({texture: texture,
                                                         rect: frame,
                                                       rotate: rotated,
                                                       offset: offset,
                                                 originalSize: sourceSize});
                    break;

                case 3:
                    var spriteSize       = geo.sizeFromString(frameDict.spriteSize),
                        spriteOffset     = geo.pointFromString(frameDict.spriteOffset),
                        spriteSourceSize = geo.sizeFromString(frameDict.spriteSourceSize),
                        textureRect      = geo.rectFromString(frameDict.textureRect),
                        textureRotated   = frameDict.textureRotated;
                    

                    if (FLIP_Y_AXIS) {
                        spriteOffset.y *= -1;
                    }

                    // get aliases
                    var aliases = frameDict.aliases;
                    for (var i = 0, len = aliases.length; i < len; i++) {
                        var alias = aliases[i];
                        this.get('spriteFrameAliases')[frameDictKey] = alias;
                    }
                    
                    // create frame
                    spriteFrame = SpriteFrame.create({texture: texture,
                                                         rect: geo.rectMake(textureRect.origin.x, textureRect.origin.y, spriteSize.width, spriteSize.height),
                                                       rotate: textureRotated,
                                                       offset: spriteOffset,
                                                 originalSize: spriteSourceSize});
                    break;

                default:
                    throw "Unsupported Zwoptex format: " + format;
                }

                // Add sprite frame
                this.get('spriteFrames')[frameDictKey] = spriteFrame;
            }
        }
    },

    /**
     * Get a single SpriteFrame
     *
     * @param {String} opts.name The name of the sprite frame
     * @returns {cocos.SpriteFrame} The sprite frame
     */
    getSpriteFrame: function (opts) {
        var name = opts.name;

        var frame = this.get('spriteFrames')[name];

        if (!frame) {
            // No frame, look for an alias
            var key = this.get('spriteFrameAliases')[name];

            if (key) {
                frame = this.get('spriteFrames')[key];
            }

            if (!frame) {
                throw "Unable to find frame: " + name;
            }
        }

        return frame;
    }
});

/**
 * Class methods
 */
util.extend(SpriteFrameCache, /** @lends cocos.SpriteFrameCache */{
    /**
     * @field
     * @name cocos.SpriteFrameCache.sharedSpriteFrameCache
     * @type cocos.SpriteFrameCache
     */
    get_sharedSpriteFrameCache: function (key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }
});

exports.SpriteFrameCache = SpriteFrameCache;

}};
__resources__["/__builtin__/libs/cocos2d/Texture2D.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util');

var Texture2D = BObject.extend(/** @lends cocos.Texture2D# */{
	imgElement: null,
	size: null,
    name: null,

    /**
     * @memberOf cocos
     * @constructs
     * @extends BObject
     *
     * @opt {String} [file] The file path of the image to use as a texture
     * @opt {Texture2D|HTMLImageElement} [data] Image data to read from
     */
	init: function (opts) {
		var file = opts.file,
			data = opts.data,
			texture = opts.texture;

		if (file) {
            this.name = file;
			data = resource(file);
		} else if (texture) {
            this.name = texture.get('name');
			data = texture.get('imgElement');
		}

		this.size = {width: 0, height: 0};

		this.set('imgElement', data);
		this.set('size', {width: this.imgElement.width, height: this.imgElement.height});
	},

	drawAtPoint: function (ctx, point) {
		ctx.drawImage(this.imgElement, point.x, point.y);
	},
	drawInRect: function (ctx, rect) {
		ctx.drawImage(this.imgElement,
			rect.origin.x, rect.origin.y,
			rect.size.width, rect.size.height
		);
	},

    /**
     * @getter data
     * @type {String} Base64 encoded image data
     */
    get_data: function () {
        return this.imgElement ? this.imgElement.src : null;
	},

    /**
     * @getter contentSize
     * @type {geometry.Size} Size of the texture
     */
    get_contentSize: function () {
		return this.size;
    }
});

exports.Texture2D = Texture2D;

}};
__resources__["/__builtin__/libs/cocos2d/TextureAtlas.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray FLIP_Y_AXIS*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
	Texture2D = require('./Texture2D').Texture2D;


/* QUAD STRUCTURE
 quad = {
	 drawRect: <rect>, // Where the quad is drawn to
	 textureRect: <rect>  // The slice of the texture to draw in drawRect
 }
*/

var TextureAtlas = BObject.extend(/** @lends cocos.TextureAtlas# */{
	quads: null,
	imgElement: null,
	texture: null,

    /**
     * A single texture that can represent lots of smaller images
     *
     * @memberOf cocos
     * @constructs
     * @extends BObject
     *
     * @opt {String} file The file path of the image to use as a texture
     * @opt {Texture2D|HTMLImageElement} [data] Image data to read from
     * @opt {CanvasElement} [canvas] A canvas to use as a texture
     */
	init: function (opts) {
		var file = opts.file,
			data = opts.data,
			texture = opts.texture,
			canvas = opts.canvas;

        if (canvas) {
            // If we've been given a canvas element then we'll use that for our image
            this.imgElement = canvas;
        } else {
            texture = Texture2D.create({texture: texture, file: file, data: data});
			this.set('texture', texture);
			this.imgElement = texture.get('imgElement');
        }

		this.quads = [];
	},

	insertQuad: function (opts) {
		var quad = opts.quad,
			index = opts.index || 0;

		this.quads.splice(index, 0, quad);
	},
	removeQuad: function (opts) {
		var index = opts.index;

		this.quads.splice(index, 1);
	},


	drawQuads: function (ctx) {
		util.each(this.quads, util.callback(this, function (quad) {
            if (!quad) {
                return;
            }

			this.drawQuad(ctx, quad);
		}));
	},

	drawQuad: function (ctx, quad) {
        var sx = quad.textureRect.origin.x,
            sy = quad.textureRect.origin.y,
            sw = quad.textureRect.size.width, 
            sh = quad.textureRect.size.height;

        var dx = quad.drawRect.origin.x,
            dy = quad.drawRect.origin.y,
            dw = quad.drawRect.size.width, 
            dh = quad.drawRect.size.height;


        var scaleX = 1;
        var scaleY = 1;

        if (FLIP_Y_AXIS) {
            dy -= dh;
            dh *= -1;
        }

            
        if (dw < 0) {
            dw *= -1;
            scaleX = -1;
        }
            
        if (dh < 0) {
            dh *= -1;
            scaleY = -1;
        }

        ctx.scale(scaleX, scaleY);

        var img = this.get('imgElement');
		ctx.drawImage(img, 
			sx, sy, // Draw slice from x,y
			sw, sh, // Draw slice size
			dx, dy, // Draw at 0, 0
			dw, dh  // Draw size
		);
        ctx.scale(1, 1);
	}
});

exports.TextureAtlas = TextureAtlas;

}};
__resources__["/__builtin__/libs/cocos2d/TMXOrientation.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

/**
 * @memberOf cocos
 * @namespace
 */
var TMXOrientation = /** @lends cocos.TMXOrientation */{
    /**
     * Orthogonal orientation
     * @constant
     */
	TMXOrientationOrtho: 1,

    /**
     * Hexagonal orientation
     * @constant
     */
	TMXOrientationHex: 2,

    /**
     * Isometric orientation
     * @constant
     */
	TMXOrientationIso: 3
};

module.exports = TMXOrientation;

}};
__resources__["/__builtin__/libs/cocos2d/TMXXMLParser.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray DOMParser*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    path = require('path'),
    ccp = require('geometry').ccp,
    base64 = require('base64'),
    gzip   = require('gzip'),
    TMXOrientationOrtho = require('./TMXOrientation').TMXOrientationOrtho,
    TMXOrientationHex = require('./TMXOrientation').TMXOrientationHex,
    TMXOrientationIso = require('./TMXOrientation').TMXOrientationIso;

var TMXTilesetInfo = BObject.extend(/** @lends cocos.TMXTilesetInfo# */{
    name: '',
    firstGID: 0,
    tileSize: null,
    spacing: 0,
    margin: 0,
    sourceImage: null,

    /**
     * @memberOf cocos
     * @constructs
     * @extends BObject
     */
    init: function () {
        TMXTilesetInfo.superclass.init.call(this);
    },

    rectForGID: function (gid) {
        var rect = {size: {}, origin: ccp(0, 0)};
        rect.size = util.copy(this.tileSize);
        
        gid = gid - this.firstGID;

        var imgSize = this.get('imageSize');
        
        var maxX = Math.floor((imgSize.width - this.margin * 2 + this.spacing) / (this.tileSize.width + this.spacing));
        
        rect.origin.x = (gid % maxX) * (this.tileSize.width + this.spacing) + this.margin;
        rect.origin.y = Math.floor(gid / maxX) * (this.tileSize.height + this.spacing) + this.margin;
        
        return rect;
    }
});

var TMXLayerInfo = BObject.extend(/** @lends cocos.TMXLayerInfo# */{
    name: '',
    layerSize: null,
    tiles: null,
    visible: true,
    opacity: 255,
    minGID: 100000,
    maxGID: 0,
    properties: null,
    offset: null,

    /**
     * @memberOf cocos
     * @constructs
     * @extends BObject
     */
    init: function () {
        TMXLayerInfo.superclass.init.call(this);

        this.properties = {};
        this.offset = ccp(0, 0);
    }
});

var TMXObjectGroup = BObject.extend(/** @lends cocos.TMXObjectGroup# */{
    name: '',
    properties: null,
    offset: null,
    objects: null,

    /**
     * @memberOf cocos
     * @constructs
     * @extends BObject
     */
    init: function () {
        TMXObjectGroup.superclass.init.call(this);

        this.properties = {};
        this.objects = {};
        this.offset = ccp(0, 0);
    },

    /**
     * return the value for the specific property name
     *
     * @opt {String} name Property name
     * @returns {String} Property value
     */
    propertyNamed: function(opts) {
        var propertyName = opts.name
        return this.properties[propertyName];
    },

    /**
     * Return the object for the specific object name. It will return the 1st
     * object found on the array for the given name.
     *
     * @opt {String} name Object name
     * @returns {Object} Object
     */
    objectNamed: function(opts) {
        var objectName = opts.name;
        var object = null;
        
        this.objects.forEach(function(item) {
         
            if(item.name == objectName) {
                object = item;
            }
        });
        if(object != null) {
            return object;
        }
    }
});

var TMXMapInfo = BObject.extend(/** @lends cocos.TMXMapInfo# */{
    filename: '',
    orientation: 0,
    mapSize: null,
    tileSize: null,
    layer: null,
    tilesets: null,
    objectGroups: null,
    properties: null,
    tileProperties: null,

    /**
     * @memberOf cocos
     * @constructs
     * @extends BObject
     *
     * @param {String} tmxFile The file path of the TMX file to load
     */
    init: function (tmxFile) {
        TMXMapInfo.superclass.init.call(this, tmxFile);

        this.tilesets = [];
        this.layers = [];
        this.objectGroups = [];
        this.properties = {};
        this.tileProperties = {};
        this.filename = tmxFile;

        this.parseXMLFile(tmxFile);
    },

    parseXMLFile: function (xmlFile) {
        var parser = new DOMParser(),
            doc = parser.parseFromString(resource(xmlFile), 'text/xml');

        // PARSE <map>
        var map = doc.documentElement;

        // Set Orientation
        switch (map.getAttribute('orientation')) {
        case 'orthogonal':
            this.orientation = TMXOrientationOrtho;
            break;
        case 'isometric':
            this.orientation = TMXOrientationIso;
            break;
        case 'hexagonal':
            this.orientation = TMXOrientationHex;
            break;
        default:
            throw "cocos2d: TMXFomat: Unsupported orientation: " + map.getAttribute('orientation');
        }
        this.mapSize = {width: parseInt(map.getAttribute('width'), 10), height: parseInt(map.getAttribute('height'), 10)};
        this.tileSize = {width: parseInt(map.getAttribute('tilewidth'), 10), height: parseInt(map.getAttribute('tileheight'), 10)};


        // PARSE <tilesets>
        var tilesets = map.getElementsByTagName('tileset');
        var i, len, s;
        for (i = 0, len = tilesets.length; i < len; i++) {
            var t = tilesets[i];

            var tileset = TMXTilesetInfo.create();
            tileset.set('name', t.getAttribute('name'));
            tileset.set('firstGID', parseInt(t.getAttribute('firstgid'), 10));
            if (t.getAttribute('spacing')) {
                tileset.set('spacing', parseInt(t.getAttribute('spacing'), 10));
            }
            if (t.getAttribute('margin')) {
                tileset.set('margin', parseInt(t.getAttribute('margin'), 10));
            }

            s = {};
            s.width = parseInt(t.getAttribute('tilewidth'), 10);
            s.height = parseInt(t.getAttribute('tileheight'), 10);
            tileset.set('tileSize', s);

            // PARSE <image> We assume there's only 1
            var image = t.getElementsByTagName('image')[0];
            tileset.set('sourceImage', path.join(path.dirname(this.filename), image.getAttribute('source')));

            this.tilesets.push(tileset);
        }

        // PARSE <layers>
        var layers = map.getElementsByTagName('layer');
        for (i = 0, len = layers.length; i < len; i++) {
            var l = layers[i];
            var data = l.getElementsByTagName('data')[0];
            var layer = TMXLayerInfo.create();

            layer.set('name', l.getAttribute('name'));
            if (l.getAttribute('visible') !== false) {
                layer.set('visible', true);
            } else {
                layer.set('visible', !!parseInt(l.getAttribute('visible'), 10));
            }

            s = {};
            s.width = parseInt(l.getAttribute('width'), 10);
            s.height = parseInt(l.getAttribute('height'), 10);
            layer.set('layerSize', s);

            var opacity = l.getAttribute('opacity');
            if (opacity === undefined) {
                layer.set('opacity', 255);
            } else {
                layer.set('opacity', 255 * parseFloat(opacity));
            }

            var x = parseInt(l.getAttribute('x'), 10),
                y = parseInt(l.getAttribute('y'), 10);
            if (isNaN(x)) {
                x = 0;
            }
            if (isNaN(y)) {
                y = 0;
            }
            layer.set('offset', ccp(x, y));


            // Firefox has a 4KB limit on node values. It will split larger
            // nodes up into multiple nodes. So, we'll stitch them back
            // together.
            var nodeValue = '';
            for (var j = 0, jen = data.childNodes.length; j < jen; j++) {
                nodeValue += data.childNodes[j].nodeValue;
            }

            // Unpack the tilemap data
            var compression = data.getAttribute('compression');
            switch (compression) {
            case 'gzip':
                layer.set('tiles', gzip.unzipBase64AsArray(nodeValue, 4));
                break;
                
            // Uncompressed
            case null:
            case '': 
                layer.set('tiles', base64.decodeAsArray(nodeValue, 4));
                break;

            default: 
                throw "Unsupported TMX Tile Map compression: " + compression;
            }

            this.layers.push(layer);
        }

        // TODO PARSE <tile>

        // PARSE <objectgroup>
        var objectgroups = map.getElementsByTagName('objectgroup');
        for (i = 0, len = objectgroups.length; i < len; i++) {
            var g = objectgroups[i],
                objectGroup = TMXObjectGroup.create();

            objectGroup.set('name', g.getAttribute('name'));
            
            var properties = g.querySelectorAll('objectgroup > properties property'),
                propertiesValue = {};
            
            for(j = 0; j < properties.length; j++) {
                var property = properties[j];
                if(property.getAttribute('name')) {
                    propertiesValue[property.getAttribute('name')] = property.getAttribute('value');
                }
            }
           
            objectGroup.set('properties', propertiesValue);

            var objectsArray = [],
                objects = g.querySelectorAll('object');

            for(j = 0; j < objects.length; j++) {
                var object = objects[j];
                var objectValue = {
                    x       : parseInt(object.getAttribute('x'), 10),
                    y       : parseInt(object.getAttribute('y'), 10),
                    width   : parseInt(object.getAttribute('width'), 10),
                    height  : parseInt(object.getAttribute('height'), 10)
                };
                if(object.getAttribute('name')) {
                    objectValue.name = object.getAttribute('name');
                }
                if(object.getAttribute('type')) {
                    objectValue.name = object.getAttribute('type');
                }
                properties = object.querySelectorAll('property');
                for(var k = 0; k < properties.length; k++) {
                    property = properties[k];
                    if(property.getAttribute('name')) {
                        objectValue[property.getAttribute('name')] = property.getAttribute('value');
                    }
                }
                objectsArray.push(objectValue);

            }
            objectGroup.set('objects', objectsArray);
            this.objectGroups.push(objectGroup);
        }
    }
});

exports.TMXMapInfo = TMXMapInfo;
exports.TMXLayerInfo = TMXLayerInfo;
exports.TMXTilesetInfo = TMXTilesetInfo;
exports.TMXObjectGroup = TMXObjectGroup;
}};
__resources__["/__builtin__/libs/geometry.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util');

var RE_PAIR = /\{\s*([\d.\-]+)\s*,\s*([\d.\-]+)\s*\}/,
    RE_DOUBLE_PAIR = /\{\s*(\{[\s\d,.\-]+\})\s*,\s*(\{[\s\d,.\-]+\})\s*\}/;

/** @namespace */
var geometry = {
    /**
     * @class
     * A 2D point in space
     *
     * @param {Float} x X value
     * @param {Float} y Y value
     */
    Point: function (x, y) {
        /**
         * X coordinate
         * @type Float
         */
        this.x = x;

        /**
         * Y coordinate
         * @type Float
         */
        this.y = y;
    },

    /**
     * @class
     * A 2D size
     *
     * @param {Float} w Width
     * @param {Float} h Height
     */
    Size: function (w, h) {
        /**
         * Width
         * @type Float
         */
        this.width = w;

        /**
         * Height
         * @type Float
         */
        this.height = h;
    },

    /**
     * @class
     * A rectangle
     *
     * @param {Float} x X value
     * @param {Float} y Y value
     * @param {Float} w Width
     * @param {Float} h Height
     */
    Rect: function (x, y, w, h) {
        /**
         * Coordinate in 2D space
         * @type {geometry.Point}
         */
        this.origin = new geometry.Point(x, y);

        /**
         * Size in 2D space
         * @type {geometry.Size}
         */
        this.size   = new geometry.Size(w, h);
    },

    /**
     * @class
     * Transform matrix
     *
     * @param {Float} a
     * @param {Float} b
     * @param {Float} c
     * @param {Float} d
     * @param {Float} tx
     * @param {Float} ty
     */
    TransformMatrix: function (a, b, c, d, tx, ty) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.tx = tx;
        this.ty = ty;
    },

    /**
     * Creates a geometry.Point instance
     *
     * @param {Float} x X coordinate
     * @param {Float} y Y coordinate
     * @returns {geometry.Point} 
     */
    ccp: function (x, y) {
        return module.exports.pointMake(x, y);
    },

    /**
     * Add the values of two points together
     *
     * @param {geometry.Point} p1 First point
     * @param {geometry.Point} p2 Second point
     * @returns {geometry.Point} New point
     */
    ccpAdd: function (p1, p2) {
        return geometry.ccp(p1.x + p2.x, p1.y + p2.y);
    },

    /**
     * Subtract the values of two points
     *
     * @param {geometry.Point} p1 First point
     * @param {geometry.Point} p2 Second point
     * @returns {geometry.Point} New point
     */
    ccpSub: function (p1, p2) {
        return geometry.ccp(p1.x - p2.x, p1.y - p2.y);
    },

    /**
     * Muliply the values of two points together
     *
     * @param {geometry.Point} p1 First point
     * @param {geometry.Point} p2 Second point
     * @returns {geometry.Point} New point
     */
    ccpMult: function (p1, p2) {
        return geometry.ccp(p1.x * p2.x, p1.y * p2.y);
    },


    /**
     * Invert the values of a geometry.Point
     *
     * @param {geometry.Point} p Point to invert
     * @returns {geometry.Point} New point
     */
    ccpNeg: function (p) {
        return geometry.ccp(-p.x, -p.y);
    },

    /**
     * Round values on a geometry.Point to whole numbers
     *
     * @param {geometry.Point} p Point to round
     * @returns {geometry.Point} New point
     */
    ccpRound: function (p) {
        return geometry.ccp(Math.round(p.x), Math.round(p.y));
    },

    /**
     * Round up values on a geometry.Point to whole numbers
     *
     * @param {geometry.Point} p Point to round
     * @returns {geometry.Point} New point
     */
    ccpCeil: function (p) {
        return geometry.ccp(Math.ceil(p.x), Math.ceil(p.y));
    },

    /**
     * Round down values on a geometry.Point to whole numbers
     *
     * @param {geometry.Point} p Point to round
     * @returns {geometry.Point} New point
     */
    ccpFloor: function (p) {
        return geometry.ccp(Math.floor(p.x), Math.floor(p.y));
    },

    /**
     * A point at 0x0
     *
     * @returns {geometry.Point} New point at 0x0
     */
    PointZero: function () {
        return geometry.ccp(0, 0);
    },

    /**
     * @returns {geometry.Rect}
     */
    rectMake: function (x, y, w, h) {
        return new geometry.Rect(x, y, w, h);
    },

    /**
     * @returns {geometry.Rect}
     */
    rectFromString: function (str) {
        var matches = str.match(RE_DOUBLE_PAIR),
            p = geometry.pointFromString(matches[1]),
            s = geometry.sizeFromString(matches[2]);

        return geometry.rectMake(p.x, p.y, s.width, s.height);
    },

    /**
     * @returns {geometry.Size}
     */
    sizeMake: function (w, h) {
        return new geometry.Size(w, h);
    },

    /**
     * @returns {geometry.Size}
     */
    sizeFromString: function (str) {
        var matches = str.match(RE_PAIR),
            w = parseFloat(matches[1]),
            h = parseFloat(matches[2]);

        return geometry.sizeMake(w, h);
    },

    /**
     * @returns {geometry.Point}
     */
    pointMake: function (x, y) {
        return new geometry.Point(x, y);
    },

    /**
     * @returns {geometry.Point}
     */
    pointFromString: function (str) {
        var matches = str.match(RE_PAIR),
            x = parseFloat(matches[1]),
            y = parseFloat(matches[2]);

        return geometry.pointMake(x, y);
    },

    /**
     * @returns {Boolean}
     */
    rectContainsPoint: function (r, p) {
        return ((p.x >= r.origin.x && p.x <= r.origin.x + r.size.width) &&
                (p.y >= r.origin.y && p.y <= r.origin.y + r.size.height));
    },

    /**
     * Returns the smallest rectangle that contains the two source rectangles.
     *
     * @param {geometry.Rect} r1
     * @param {geometry.Rect} r2
     * @returns {geometry.Rect}
     */
    rectUnion: function (r1, r2) {
        var rect = new geometry.Rect(0, 0, 0, 0);

        rect.origin.x = Math.min(r1.origin.x, r2.origin.x);
        rect.origin.y = Math.min(r1.origin.y, r2.origin.y);
        rect.size.width = Math.max(r1.origin.x + r1.size.width, r2.origin.x + r2.size.width) - rect.origin.x;
        rect.size.height = Math.max(r1.origin.y + r1.size.height, r2.origin.y + r2.size.height) - rect.origin.y;

        return rect;
    },

    /**
     * @returns {Boolean}
     */
    rectOverlapsRect: function (r1, r2) {
        if (r1.origin.x + r1.size.width < r2.origin.x) {
            return false;
        }
        if (r2.origin.x + r2.size.width < r1.origin.x) {
            return false;
        }
        if (r1.origin.y + r1.size.height < r2.origin.y) {
            return false;
        }
        if (r2.origin.y + r2.size.height < r1.origin.y) {
            return false;
        }

        return true;
    },

    /**
     * Returns the overlapping portion of 2 rectangles
     *
     * @param {geometry.Rect} lhsRect First rectangle
     * @param {geometry.Rect} rhsRect Second rectangle
     * @returns {geometry.Rect} The overlapping portion of the 2 rectangles
     */
    rectIntersection: function (lhsRect, rhsRect) {

        var intersection = new geometry.Rect(
            Math.max(geometry.rectGetMinX(lhsRect), geometry.rectGetMinX(rhsRect)),
            Math.max(geometry.rectGetMinY(lhsRect), geometry.rectGetMinY(rhsRect)),
            0,
            0
        );

        intersection.size.width = Math.min(geometry.rectGetMaxX(lhsRect), geometry.rectGetMaxX(rhsRect)) - geometry.rectGetMinX(intersection);
        intersection.size.height = Math.min(geometry.rectGetMaxY(lhsRect), geometry.rectGetMaxY(rhsRect)) - geometry.rectGetMinY(intersection);

        return intersection;
    },

    /**
     * @returns {Boolean}
     */
    pointEqualToPoint: function (point1, point2) {
        return (point1.x == point2.x && point1.y == point2.y);
    },

    /**
     * @returns {Boolean}
     */
    sizeEqualToSize: function (size1, size2) {
        return (size1.width == size2.width && size1.height == size2.height);
    },

    /**
     * @returns {Boolean}
     */
    rectEqualToRect: function (rect1, rect2) {
        return (module.exports.sizeEqualToSize(rect1.size, rect2.size) && module.exports.pointEqualToPoint(rect1.origin, rect2.origin));
    },

    /**
     * @returns {Float}
     */
    rectGetMinX: function (rect) {
        return rect.origin.x;
    },

    /**
     * @returns {Float}
     */
    rectGetMinY: function (rect) {
        return rect.origin.y;
    },

    /**
     * @returns {Float}
     */
    rectGetMaxX: function (rect) {
        return rect.origin.x + rect.size.width;
    },

    /**
     * @returns {Float}
     */
    rectGetMaxY: function (rect) {
        return rect.origin.y + rect.size.height;
    },

    boundingRectMake: function (p1, p2, p3, p4) {
        var minX = Math.min(p1.x, p2.x, p3.x, p4.x);
        var minY = Math.min(p1.y, p2.y, p3.y, p4.y);
        var maxX = Math.max(p1.x, p2.x, p3.x, p4.x);
        var maxY = Math.max(p1.y, p2.y, p3.y, p4.y);

        return new geometry.Rect(minX, minY, (maxX - minX), (maxY - minY));
    },

    /**
     * @returns {geometry.Point}
     */
    pointApplyAffineTransform: function (point, t) {

        /*
        aPoint.x * aTransform.a + aPoint.y * aTransform.c + aTransform.tx,
        aPoint.x * aTransform.b + aPoint.y * aTransform.d + aTransform.ty
        */

        return new geometry.Point(t.a * point.x + t.c * point.y + t.tx, t.b * point.x + t.d * point.y + t.ty);

    },

    /**
     * Apply a transform matrix to a rectangle
     *
     * @param {geometry.Rect} rect Rectangle to transform
     * @param {geometry.TransformMatrix} trans TransformMatrix to apply to rectangle
     * @returns {geometry.Rect} A new transformed rectangle
     */
    rectApplyAffineTransform: function (rect, trans) {

        var p1 = geometry.ccp(geometry.rectGetMinX(rect), geometry.rectGetMinY(rect));
        var p2 = geometry.ccp(geometry.rectGetMaxX(rect), geometry.rectGetMinY(rect));
        var p3 = geometry.ccp(geometry.rectGetMinX(rect), geometry.rectGetMaxY(rect));
        var p4 = geometry.ccp(geometry.rectGetMaxX(rect), geometry.rectGetMaxY(rect));

        p1 = geometry.pointApplyAffineTransform(p1, trans);
        p2 = geometry.pointApplyAffineTransform(p2, trans);
        p3 = geometry.pointApplyAffineTransform(p3, trans);
        p4 = geometry.pointApplyAffineTransform(p4, trans);

        return geometry.boundingRectMake(p1, p2, p3, p4);
    },

    /**
     * Inverts a transform matrix
     *
     * @param {geometry.TransformMatrix} trans TransformMatrix to invert
     * @returns {geometry.TransformMatrix} New transform matrix
     */
    affineTransformInvert: function (trans) {
        var determinant = 1 / (trans.a * trans.d - trans.b * trans.c);

        return new geometry.TransformMatrix(
            determinant * trans.d,
            -determinant * trans.b,
            -determinant * trans.c,
            determinant * trans.a,
            determinant * (trans.c * trans.ty - trans.d * trans.tx),
            determinant * (trans.b * trans.tx - trans.a * trans.ty)
        );
    },

    /**
     * Multiply 2 transform matrices together
     * @param {geometry.TransformMatrix} lhs Left matrix
     * @param {geometry.TransformMatrix} rhs Right matrix
     * @returns {geometry.TransformMatrix} New transform matrix
     */
    affineTransformConcat: function (lhs, rhs) {
        return new geometry.TransformMatrix(
            lhs.a * rhs.a + lhs.b * rhs.c,
            lhs.a * rhs.b + lhs.b * rhs.d,
            lhs.c * rhs.a + lhs.d * rhs.c,
            lhs.c * rhs.b + lhs.d * rhs.d,
            lhs.tx * rhs.a + lhs.ty * rhs.c + rhs.tx,
            lhs.tx * rhs.b + lhs.ty * rhs.d + rhs.ty
        );
    },

    /**
     * @returns {Float}
     */
    degreesToRadians: function (angle) {
        return angle / 180.0 * Math.PI;
    },

    /**
     * @returns {Float}
     */
    radiansToDegrees: function (angle) {
        return angle * (180.0 / Math.PI);
    },

    /**
     * Translate (move) a transform matrix
     *
     * @param {geometry.TransformMatrix} trans TransformMatrix to translate
     * @param {Float} tx Amount to translate along X axis
     * @param {Float} ty Amount to translate along Y axis
     * @returns {geometry.TransformMatrix} A new TransformMatrix
     */
    affineTransformTranslate: function (trans, tx, ty) {
        var newTrans = util.copy(trans);
        newTrans.tx = trans.tx + trans.a * tx + trans.c * ty;
        newTrans.ty = trans.ty + trans.b * tx + trans.d * ty;
        return newTrans;
    },

    /**
     * Rotate a transform matrix
     *
     * @param {geometry.TransformMatrix} trans TransformMatrix to rotate
     * @param {Float} angle Angle in radians
     * @returns {geometry.TransformMatrix} A new TransformMatrix
     */
    affineTransformRotate: function (trans, angle) {
        var sin = Math.sin(angle),
            cos = Math.cos(angle);

        return new geometry.TransformMatrix(
            trans.a * cos + trans.c * sin,
            trans.b * cos + trans.d * sin,
            trans.c * cos - trans.a * sin,
            trans.d * cos - trans.b * sin,
            trans.tx,
            trans.ty
        );
    },

    /**
     * Scale a transform matrix
     *
     * @param {geometry.TransformMatrix} trans TransformMatrix to scale
     * @param {Float} sx X scale factor
     * @param {Float} [sy=sx] Y scale factor
     * @returns {geometry.TransformMatrix} A new TransformMatrix
     */
    affineTransformScale: function (trans, sx, sy) {
        if (sy === undefined) {
            sy = sx;
        }

        return new geometry.TransformMatrix(trans.a * sx, trans.b * sx, trans.c * sy, trans.d * sy, trans.tx, trans.ty);
    },

    /**
     * @returns {geometry.TransformMatrix} identity matrix
     */
    affineTransformIdentity: function () {
        return new geometry.TransformMatrix(1, 0, 0, 1, 0, 0);
    }
};

module.exports = geometry;

}};
__resources__["/__builtin__/libs/gzip.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/**
 * @fileoverview 
 */

/** @ignore */
var JXG = require('./JXGUtil');

/**
 * @namespace
 * Wrappers around JXG's GZip utils
 * @see JXG.Util
 */
var gzip = {
    /**
     * Unpack a gzipped byte array
     *
     * @param {Integer[]} input Byte array
     * @returns {String} Unpacked byte string
     */
    unzip: function(input) {
        return (new JXG.Util.Unzip(input)).unzip()[0][0];
    },

    /**
     * Unpack a gzipped byte string encoded as base64
     *
     * @param {String} input Byte string encoded as base64
     * @returns {String} Unpacked byte string
     */
    unzipBase64: function(input) {
        return (new JXG.Util.Unzip(JXG.Util.Base64.decodeAsArray(input))).unzip()[0][0];
    },

    /**
     * Unpack a gzipped byte string encoded as base64
     *
     * @param {String} input Byte string encoded as base64
     * @param {Integer} bytes Bytes per array item
     * @returns {Integer[]} Unpacked byte array
     */
    unzipBase64AsArray: function(input, bytes) {
        bytes = bytes || 1;

        var dec = this.unzipBase64(input),
            ar = [], i, j, len;
        for (i = 0, len = dec.length/bytes; i < len; i++){
            ar[i] = 0;
            for (j = bytes-1; j >= 0; --j){
                ar[i] += dec.charCodeAt((i *bytes) +j) << (j *8);
            }
        }
        return ar;
    },

    /**
     * Unpack a gzipped byte array
     *
     * @param {Integer[]} input Byte array
     * @param {Integer} bytes Bytes per array item
     * @returns {Integer[]} Unpacked byte array
     */
    unzipAsArray: function (input, bytes) {
        bytes = bytes || 1;

        var dec = this.unzip(input),
            ar = [], i, j, len;
        for (i = 0, len = dec.length/bytes; i < len; i++){
            ar[i] = 0;
            for (j = bytes-1; j >= 0; --j){
                ar[i] += dec.charCodeAt((i *bytes) +j) << (j *8);
            }
        }
        return ar;
    }

};

module.exports = gzip;

}};
__resources__["/__builtin__/libs/JXGUtil.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*
    Copyright 2008,2009
        Matthias Ehmann,
        Michael Gerhaeuser,
        Carsten Miller,
        Bianca Valentin,
        Alfred Wassermann,
        Peter Wilfahrt

    This file is part of JSXGraph.

    JSXGraph is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    JSXGraph is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with JSXGraph.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
 * @fileoverview Utilities for uncompressing and base64 decoding
 */

/** @namespace */
var JXG = {};

/**
  * @class Util class
  * Class for gunzipping, unzipping and base64 decoding of files.
  * It is used for reading GEONExT, Geogebra and Intergeo files.
  *
  * Only Huffman codes are decoded in gunzip.
  * The code is based on the source code for gunzip.c by Pasi Ojala 
  * @see <a href="http://www.cs.tut.fi/~albert/Dev/gunzip/gunzip.c">http://www.cs.tut.fi/~albert/Dev/gunzip/gunzip.c</a>
  * @see <a href="http://www.cs.tut.fi/~albert">http://www.cs.tut.fi/~albert</a>
  */
JXG.Util = {};
                                 
/**
 * Unzip zip files
 */
JXG.Util.Unzip = function (barray){
    var outputArr = [],
        output = "",
        debug = false,
        gpflags,
        files = 0,
        unzipped = [],
        crc,
        buf32k = new Array(32768),
        bIdx = 0,
        modeZIP=false,

        CRC, SIZE,
    
        bitReverse = [
        0x00, 0x80, 0x40, 0xc0, 0x20, 0xa0, 0x60, 0xe0,
        0x10, 0x90, 0x50, 0xd0, 0x30, 0xb0, 0x70, 0xf0,
        0x08, 0x88, 0x48, 0xc8, 0x28, 0xa8, 0x68, 0xe8,
        0x18, 0x98, 0x58, 0xd8, 0x38, 0xb8, 0x78, 0xf8,
        0x04, 0x84, 0x44, 0xc4, 0x24, 0xa4, 0x64, 0xe4,
        0x14, 0x94, 0x54, 0xd4, 0x34, 0xb4, 0x74, 0xf4,
        0x0c, 0x8c, 0x4c, 0xcc, 0x2c, 0xac, 0x6c, 0xec,
        0x1c, 0x9c, 0x5c, 0xdc, 0x3c, 0xbc, 0x7c, 0xfc,
        0x02, 0x82, 0x42, 0xc2, 0x22, 0xa2, 0x62, 0xe2,
        0x12, 0x92, 0x52, 0xd2, 0x32, 0xb2, 0x72, 0xf2,
        0x0a, 0x8a, 0x4a, 0xca, 0x2a, 0xaa, 0x6a, 0xea,
        0x1a, 0x9a, 0x5a, 0xda, 0x3a, 0xba, 0x7a, 0xfa,
        0x06, 0x86, 0x46, 0xc6, 0x26, 0xa6, 0x66, 0xe6,
        0x16, 0x96, 0x56, 0xd6, 0x36, 0xb6, 0x76, 0xf6,
        0x0e, 0x8e, 0x4e, 0xce, 0x2e, 0xae, 0x6e, 0xee,
        0x1e, 0x9e, 0x5e, 0xde, 0x3e, 0xbe, 0x7e, 0xfe,
        0x01, 0x81, 0x41, 0xc1, 0x21, 0xa1, 0x61, 0xe1,
        0x11, 0x91, 0x51, 0xd1, 0x31, 0xb1, 0x71, 0xf1,
        0x09, 0x89, 0x49, 0xc9, 0x29, 0xa9, 0x69, 0xe9,
        0x19, 0x99, 0x59, 0xd9, 0x39, 0xb9, 0x79, 0xf9,
        0x05, 0x85, 0x45, 0xc5, 0x25, 0xa5, 0x65, 0xe5,
        0x15, 0x95, 0x55, 0xd5, 0x35, 0xb5, 0x75, 0xf5,
        0x0d, 0x8d, 0x4d, 0xcd, 0x2d, 0xad, 0x6d, 0xed,
        0x1d, 0x9d, 0x5d, 0xdd, 0x3d, 0xbd, 0x7d, 0xfd,
        0x03, 0x83, 0x43, 0xc3, 0x23, 0xa3, 0x63, 0xe3,
        0x13, 0x93, 0x53, 0xd3, 0x33, 0xb3, 0x73, 0xf3,
        0x0b, 0x8b, 0x4b, 0xcb, 0x2b, 0xab, 0x6b, 0xeb,
        0x1b, 0x9b, 0x5b, 0xdb, 0x3b, 0xbb, 0x7b, 0xfb,
        0x07, 0x87, 0x47, 0xc7, 0x27, 0xa7, 0x67, 0xe7,
        0x17, 0x97, 0x57, 0xd7, 0x37, 0xb7, 0x77, 0xf7,
        0x0f, 0x8f, 0x4f, 0xcf, 0x2f, 0xaf, 0x6f, 0xef,
        0x1f, 0x9f, 0x5f, 0xdf, 0x3f, 0xbf, 0x7f, 0xff
    ],
    
    cplens = [
        3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
        35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0
    ],

    cplext = [
        0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2,
        3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 99, 99
    ], /* 99==invalid */

    cpdist = [
        0x0001, 0x0002, 0x0003, 0x0004, 0x0005, 0x0007, 0x0009, 0x000d,
        0x0011, 0x0019, 0x0021, 0x0031, 0x0041, 0x0061, 0x0081, 0x00c1,
        0x0101, 0x0181, 0x0201, 0x0301, 0x0401, 0x0601, 0x0801, 0x0c01,
        0x1001, 0x1801, 0x2001, 0x3001, 0x4001, 0x6001
    ],

    cpdext = [
        0,  0,  0,  0,  1,  1,  2,  2,
        3,  3,  4,  4,  5,  5,  6,  6,
        7,  7,  8,  8,  9,  9, 10, 10,
        11, 11, 12, 12, 13, 13
    ],
    
    border = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15],
    
    bA = barray,

    bytepos=0,
    bitpos=0,
    bb = 1,
    bits=0,
    
    NAMEMAX = 256,
    
    nameBuf = [],
    
    fileout;
    
    function readByte(){
        bits+=8;
        if (bytepos<bA.length){
            //if (debug)
            //    document.write(bytepos+": "+bA[bytepos]+"<br>");
            return bA[bytepos++];
        } else
            return -1;
    };

    function byteAlign(){
        bb = 1;
    };
    
    function readBit(){
        var carry;
        bits++;
        carry = (bb & 1);
        bb >>= 1;
        if (bb==0){
            bb = readByte();
            carry = (bb & 1);
            bb = (bb>>1) | 0x80;
        }
        return carry;
    };

    function readBits(a) {
        var res = 0,
            i = a;
    
        while(i--) {
            res = (res<<1) | readBit();
        }
        if(a) {
            res = bitReverse[res]>>(8-a);
        }
        return res;
    };
        
    function flushBuffer(){
        //document.write('FLUSHBUFFER:'+buf32k);
        bIdx = 0;
    };
    function addBuffer(a){
        SIZE++;
        //CRC=updcrc(a,crc);
        buf32k[bIdx++] = a;
        outputArr.push(String.fromCharCode(a));
        //output+=String.fromCharCode(a);
        if(bIdx==0x8000){
            //document.write('ADDBUFFER:'+buf32k);
            bIdx=0;
        }
    };
    
    function HufNode() {
        this.b0=0;
        this.b1=0;
        this.jump = null;
        this.jumppos = -1;
    };

    var LITERALS = 288;
    
    var literalTree = new Array(LITERALS);
    var distanceTree = new Array(32);
    var treepos=0;
    var Places = null;
    var Places2 = null;
    
    var impDistanceTree = new Array(64);
    var impLengthTree = new Array(64);
    
    var len = 0;
    var fpos = new Array(17);
    fpos[0]=0;
    var flens;
    var fmax;
    
    function IsPat() {
        while (1) {
            if (fpos[len] >= fmax)
                return -1;
            if (flens[fpos[len]] == len)
                return fpos[len]++;
            fpos[len]++;
        }
    };

    function Rec() {
        var curplace = Places[treepos];
        var tmp;
        if (debug)
    		document.write("<br>len:"+len+" treepos:"+treepos);
        if(len==17) { //war 17
            return -1;
        }
        treepos++;
        len++;
    	
        tmp = IsPat();
        if (debug)
        	document.write("<br>IsPat "+tmp);
        if(tmp >= 0) {
            curplace.b0 = tmp;    /* leaf cell for 0-bit */
            if (debug)
            	document.write("<br>b0 "+curplace.b0);
        } else {
        /* Not a Leaf cell */
        curplace.b0 = 0x8000;
        if (debug)
        	document.write("<br>b0 "+curplace.b0);
        if(Rec())
            return -1;
        }
        tmp = IsPat();
        if(tmp >= 0) {
            curplace.b1 = tmp;    /* leaf cell for 1-bit */
            if (debug)
            	document.write("<br>b1 "+curplace.b1);
            curplace.jump = null;    /* Just for the display routine */
        } else {
            /* Not a Leaf cell */
            curplace.b1 = 0x8000;
            if (debug)
            	document.write("<br>b1 "+curplace.b1);
            curplace.jump = Places[treepos];
            curplace.jumppos = treepos;
            if(Rec())
                return -1;
        }
        len--;
        return 0;
    };

    function CreateTree(currentTree, numval, lengths, show) {
        var i;
        /* Create the Huffman decode tree/table */
        //document.write("<br>createtree<br>");
        if (debug)
        	document.write("currentTree "+currentTree+" numval "+numval+" lengths "+lengths+" show "+show);
        Places = currentTree;
        treepos=0;
        flens = lengths;
        fmax  = numval;
        for (i=0;i<17;i++)
            fpos[i] = 0;
        len = 0;
        if(Rec()) {
            //fprintf(stderr, "invalid huffman tree\n");
            if (debug)
            	alert("invalid huffman tree\n");
            return -1;
        }
        if (debug){
        	document.write('<br>Tree: '+Places.length);
        	for (var a=0;a<32;a++){
            	document.write("Places["+a+"].b0="+Places[a].b0+"<br>");
            	document.write("Places["+a+"].b1="+Places[a].b1+"<br>");
        	}
        }

        return 0;
    };
    
    function DecodeValue(currentTree) {
        var len, i,
            xtreepos=0,
            X = currentTree[xtreepos],
            b;

        /* decode one symbol of the data */
        while(1) {
            b=readBit();
            if (debug)
            	document.write("b="+b);
            if(b) {
                if(!(X.b1 & 0x8000)){
                	if (debug)
                    	document.write("ret1");
                    return X.b1;    /* If leaf node, return data */
                }
                X = X.jump;
                len = currentTree.length;
                for (i=0;i<len;i++){
                    if (currentTree[i]===X){
                        xtreepos=i;
                        break;
                    }
                }
                //xtreepos++;
            } else {
                if(!(X.b0 & 0x8000)){
                	if (debug)
                    	document.write("ret2");
                    return X.b0;    /* If leaf node, return data */
                }
                //X++; //??????????????????
                xtreepos++;
                X = currentTree[xtreepos];
            }
        }
        if (debug)
        	document.write("ret3");
        return -1;
    };
    
    function DeflateLoop() {
    var last, c, type, i, len;

    do {
        /*if((last = readBit())){
            fprintf(errfp, "Last Block: ");
        } else {
            fprintf(errfp, "Not Last Block: ");
        }*/
        last = readBit();
        type = readBits(2);
        switch(type) {
            case 0:
            	if (debug)
                	alert("Stored\n");
                break;
            case 1:
            	if (debug)
                	alert("Fixed Huffman codes\n");
                break;
            case 2:
            	if (debug)
                	alert("Dynamic Huffman codes\n");
                break;
            case 3:
            	if (debug)
                	alert("Reserved block type!!\n");
                break;
            default:
            	if (debug)
                	alert("Unexpected value %d!\n", type);
                break;
        }

        if(type==0) {
            var blockLen, cSum;

            // Stored 
            byteAlign();
            blockLen = readByte();
            blockLen |= (readByte()<<8);

            cSum = readByte();
            cSum |= (readByte()<<8);

            if(((blockLen ^ ~cSum) & 0xffff)) {
                document.write("BlockLen checksum mismatch\n");
            }
            while(blockLen--) {
                c = readByte();
                addBuffer(c);
            }
        } else if(type==1) {
            var j;

            /* Fixed Huffman tables -- fixed decode routine */
            while(1) {
            /*
                256    0000000        0
                :   :     :
                279    0010111        23
                0   00110000    48
                :    :      :
                143    10111111    191
                280 11000000    192
                :    :      :
                287 11000111    199
                144    110010000    400
                :    :       :
                255    111111111    511
    
                Note the bit order!
                */

            j = (bitReverse[readBits(7)]>>1);
            if(j > 23) {
                j = (j<<1) | readBit();    /* 48..255 */

                if(j > 199) {    /* 200..255 */
                    j -= 128;    /*  72..127 */
                    j = (j<<1) | readBit();        /* 144..255 << */
                } else {        /*  48..199 */
                    j -= 48;    /*   0..151 */
                    if(j > 143) {
                        j = j+136;    /* 280..287 << */
                        /*   0..143 << */
                    }
                }
            } else {    /*   0..23 */
                j += 256;    /* 256..279 << */
            }
            if(j < 256) {
                addBuffer(j);
                //document.write("out:"+String.fromCharCode(j));
                /*fprintf(errfp, "@%d %02x\n", SIZE, j);*/
            } else if(j == 256) {
                /* EOF */
                break;
            } else {
                var len, dist;

                j -= 256 + 1;    /* bytes + EOF */
                len = readBits(cplext[j]) + cplens[j];

                j = bitReverse[readBits(5)]>>3;
                if(cpdext[j] > 8) {
                    dist = readBits(8);
                    dist |= (readBits(cpdext[j]-8)<<8);
                } else {
                    dist = readBits(cpdext[j]);
                }
                dist += cpdist[j];

                /*fprintf(errfp, "@%d (l%02x,d%04x)\n", SIZE, len, dist);*/
                for(j=0;j<len;j++) {
                    var c = buf32k[(bIdx - dist) & 0x7fff];
                    addBuffer(c);
                }
            }
            } // while
        } else if(type==2) {
            var j, n, literalCodes, distCodes, lenCodes;
            var ll = new Array(288+32);    // "static" just to preserve stack
    
            // Dynamic Huffman tables 
    
            literalCodes = 257 + readBits(5);
            distCodes = 1 + readBits(5);
            lenCodes = 4 + readBits(4);
            //document.write("<br>param: "+literalCodes+" "+distCodes+" "+lenCodes+"<br>");
            for(j=0; j<19; j++) {
                ll[j] = 0;
            }
    
            // Get the decode tree code lengths
    
            //document.write("<br>");
            for(j=0; j<lenCodes; j++) {
                ll[border[j]] = readBits(3);
                //document.write(ll[border[j]]+" ");
            }
            //fprintf(errfp, "\n");
            //document.write('<br>ll:'+ll);
            len = distanceTree.length;
            for (i=0; i<len; i++)
                distanceTree[i]=new HufNode();
            if(CreateTree(distanceTree, 19, ll, 0)) {
                flushBuffer();
                return 1;
            }
            if (debug){
            	document.write("<br>distanceTree");
            	for(var a=0;a<distanceTree.length;a++){
                	document.write("<br>"+distanceTree[a].b0+" "+distanceTree[a].b1+" "+distanceTree[a].jump+" "+distanceTree[a].jumppos);
                	/*if (distanceTree[a].jumppos!=-1)
                    	document.write(" "+distanceTree[a].jump.b0+" "+distanceTree[a].jump.b1);
                	*/
            	}
            }
            //document.write('<BR>tree created');
    
            //read in literal and distance code lengths
            n = literalCodes + distCodes;
            i = 0;
            var z=-1;
            if (debug)
            	document.write("<br>n="+n+" bits: "+bits+"<br>");
            while(i < n) {
                z++;
                j = DecodeValue(distanceTree);
                if (debug)
                	document.write("<br>"+z+" i:"+i+" decode: "+j+"    bits "+bits+"<br>");
                if(j<16) {    // length of code in bits (0..15)
                       ll[i++] = j;
                } else if(j==16) {    // repeat last length 3 to 6 times 
                       var l;
                    j = 3 + readBits(2);
                    if(i+j > n) {
                        flushBuffer();
                        return 1;
                    }
                    l = i ? ll[i-1] : 0;
                    while(j--) {
                        ll[i++] = l;
                    }
                } else {
                    if(j==17) {        // 3 to 10 zero length codes
                        j = 3 + readBits(3);
                    } else {        // j == 18: 11 to 138 zero length codes 
                        j = 11 + readBits(7);
                    }
                    if(i+j > n) {
                        flushBuffer();
                        return 1;
                    }
                    while(j--) {
                        ll[i++] = 0;
                    }
                }
            }
            /*for(j=0; j<literalCodes+distCodes; j++) {
                //fprintf(errfp, "%d ", ll[j]);
                if ((j&7)==7)
                    fprintf(errfp, "\n");
            }
            fprintf(errfp, "\n");*/
            // Can overwrite tree decode tree as it is not used anymore
            len = literalTree.length;
            for (i=0; i<len; i++)
                literalTree[i]=new HufNode();
            if(CreateTree(literalTree, literalCodes, ll, 0)) {
                flushBuffer();
                return 1;
            }
            len = literalTree.length;
            for (i=0; i<len; i++)
                distanceTree[i]=new HufNode();
            var ll2 = new Array();
            for (i=literalCodes; i <ll.length; i++){
                ll2[i-literalCodes]=ll[i];
            }    
            if(CreateTree(distanceTree, distCodes, ll2, 0)) {
                flushBuffer();
                return 1;
            }
            if (debug)
           		document.write("<br>literalTree");
            while(1) {
                j = DecodeValue(literalTree);
                if(j >= 256) {        // In C64: if carry set
                    var len, dist;
                    j -= 256;
                    if(j == 0) {
                        // EOF
                        break;
                    }
                    j--;
                    len = readBits(cplext[j]) + cplens[j];
    
                    j = DecodeValue(distanceTree);
                    if(cpdext[j] > 8) {
                        dist = readBits(8);
                        dist |= (readBits(cpdext[j]-8)<<8);
                    } else {
                        dist = readBits(cpdext[j]);
                    }
                    dist += cpdist[j];
                    while(len--) {
                        var c = buf32k[(bIdx - dist) & 0x7fff];
                        addBuffer(c);
                    }
                } else {
                    addBuffer(j);
                }
            }
        }
    } while(!last);
    flushBuffer();

    byteAlign();
    return 0;
};

JXG.Util.Unzip.prototype.unzipFile = function(name) {
    var i;
	this.unzip();
	//alert(unzipped[0][1]);
	for (i=0;i<unzipped.length;i++){
		if(unzipped[i][1]==name) {
			return unzipped[i][0];
		}
	}
	
  };
    
    
JXG.Util.Unzip.prototype.unzip = function() {
	//convertToByteArray(input);
	if (debug)
		alert(bA);
	/*for (i=0;i<bA.length*8;i++){
		document.write(readBit());
		if ((i+1)%8==0)
			document.write(" ");
	}*/
	/*for (i=0;i<bA.length;i++){
		document.write(readByte()+" ");
		if ((i+1)%8==0)
			document.write(" ");
	}
	for (i=0;i<bA.length;i++){
		document.write(bA[i]+" ");
		if ((i+1)%16==0)
			document.write("<br>");
	}	
	*/
	//alert(bA);
	nextFile();
	return unzipped;
  };
    
 function nextFile(){
 	if (debug)
 		alert("NEXTFILE");
 	outputArr = [];
 	var tmp = [];
 	modeZIP = false;
	tmp[0] = readByte();
	tmp[1] = readByte();
	if (debug)
		alert("type: "+tmp[0]+" "+tmp[1]);
	if (tmp[0] == parseInt("78",16) && tmp[1] == parseInt("da",16)){ //GZIP
		if (debug)
			alert("GEONExT-GZIP");
		DeflateLoop();
		if (debug)
			alert(outputArr.join(''));
		unzipped[files] = new Array(2);
    	unzipped[files][0] = outputArr.join('');
    	unzipped[files][1] = "geonext.gxt";
    	files++;
	}
	if (tmp[0] == parseInt("1f",16) && tmp[1] == parseInt("8b",16)){ //GZIP
		if (debug)
			alert("GZIP");
		//DeflateLoop();
		skipdir();
		if (debug)
			alert(outputArr.join(''));
		unzipped[files] = new Array(2);
    	unzipped[files][0] = outputArr.join('');
    	unzipped[files][1] = "file";
    	files++;
	}
	if (tmp[0] == parseInt("50",16) && tmp[1] == parseInt("4b",16)){ //ZIP
		modeZIP = true;
		tmp[2] = readByte();
		tmp[3] = readByte();
		if (tmp[2] == parseInt("3",16) && tmp[3] == parseInt("4",16)){
			//MODE_ZIP
			tmp[0] = readByte();
			tmp[1] = readByte();
			if (debug)
				alert("ZIP-Version: "+tmp[1]+" "+tmp[0]/10+"."+tmp[0]%10);
			
			gpflags = readByte();
			gpflags |= (readByte()<<8);
			if (debug)
				alert("gpflags: "+gpflags);
			
			var method = readByte();
			method |= (readByte()<<8);
			if (debug)
				alert("method: "+method);
			
			readByte();
			readByte();
			readByte();
			readByte();
			
			var crc = readByte();
			crc |= (readByte()<<8);
			crc |= (readByte()<<16);
			crc |= (readByte()<<24);
			
			var compSize = readByte();
			compSize |= (readByte()<<8);
			compSize |= (readByte()<<16);
			compSize |= (readByte()<<24);
			
			var size = readByte();
			size |= (readByte()<<8);
			size |= (readByte()<<16);
			size |= (readByte()<<24);
			
			if (debug)
				alert("local CRC: "+crc+"\nlocal Size: "+size+"\nlocal CompSize: "+compSize);
			
			var filelen = readByte();
			filelen |= (readByte()<<8);
			
			var extralen = readByte();
			extralen |= (readByte()<<8);
			
			if (debug)
				alert("filelen "+filelen);
			i = 0;
			nameBuf = [];
			while (filelen--){ 
				var c = readByte();
				if (c == "/" | c ==":"){
					i = 0;
				} else if (i < NAMEMAX-1)
					nameBuf[i++] = String.fromCharCode(c);
			}
			if (debug)
				alert("nameBuf: "+nameBuf);
			
			//nameBuf[i] = "\0";
			if (!fileout)
				fileout = nameBuf;
			
			var i = 0;
			while (i < extralen){
				c = readByte();
				i++;
			}
				
			CRC = 0xffffffff;
			SIZE = 0;
			
			if (size = 0 && fileOut.charAt(fileout.length-1)=="/"){
				//skipdir
				if (debug)
					alert("skipdir");
			}
			if (method == 8){
				DeflateLoop();
				if (debug)
					alert(outputArr.join(''));
				unzipped[files] = new Array(2);
				unzipped[files][0] = outputArr.join('');
    			unzipped[files][1] = nameBuf.join('');
    			files++;
				//return outputArr.join('');
			}
			skipdir();
		}
	}
 };
	
function skipdir(){
    var crc, 
        tmp = [],
        compSize, size, os, i, c;
    
	if ((gpflags & 8)) {
		tmp[0] = readByte();
		tmp[1] = readByte();
		tmp[2] = readByte();
		tmp[3] = readByte();
		
		if (tmp[0] == parseInt("50",16) && 
            tmp[1] == parseInt("4b",16) && 
            tmp[2] == parseInt("07",16) && 
            tmp[3] == parseInt("08",16))
        {
            crc = readByte();
            crc |= (readByte()<<8);
            crc |= (readByte()<<16);
            crc |= (readByte()<<24);
		} else {
			crc = tmp[0] | (tmp[1]<<8) | (tmp[2]<<16) | (tmp[3]<<24);
		}
		
		compSize = readByte();
		compSize |= (readByte()<<8);
		compSize |= (readByte()<<16);
		compSize |= (readByte()<<24);
		
		size = readByte();
		size |= (readByte()<<8);
		size |= (readByte()<<16);
		size |= (readByte()<<24);
		
		if (debug)
			alert("CRC:");
	}

	if (modeZIP)
		nextFile();
	
	tmp[0] = readByte();
	if (tmp[0] != 8) {
		if (debug)
			alert("Unknown compression method!");
        return 0;	
	}
	
	gpflags = readByte();
	if (debug){
		if ((gpflags & ~(parseInt("1f",16))))
			alert("Unknown flags set!");
	}
	
	readByte();
	readByte();
	readByte();
	readByte();
	
	readByte();
	os = readByte();
	
	if ((gpflags & 4)){
		tmp[0] = readByte();
		tmp[2] = readByte();
		len = tmp[0] + 256*tmp[1];
		if (debug)
			alert("Extra field size: "+len);
		for (i=0;i<len;i++)
			readByte();
	}
	
	if ((gpflags & 8)){
		i=0;
		nameBuf=[];
		while (c=readByte()){
			if(c == "7" || c == ":")
				i=0;
			if (i<NAMEMAX-1)
				nameBuf[i++] = c;
		}
		//nameBuf[i] = "\0";
		if (debug)
			alert("original file name: "+nameBuf);
	}
		
	if ((gpflags & 16)){
		while (c=readByte()){
			//FILE COMMENT
		}
	}
	
	if ((gpflags & 2)){
		readByte();
		readByte();
	}
	
	DeflateLoop();
	
	crc = readByte();
	crc |= (readByte()<<8);
	crc |= (readByte()<<16);
	crc |= (readByte()<<24);
	
	size = readByte();
	size |= (readByte()<<8);
	size |= (readByte()<<16);
	size |= (readByte()<<24);
	
	if (modeZIP)
		nextFile();
	
};

};

/**
*  Base64 encoding / decoding
*  @see <a href="http://www.webtoolkit.info/">http://www.webtoolkit.info/</A>
*/
JXG.Util.Base64 = {

    // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode : function (input) {
        var output = [],
            chr1, chr2, chr3, enc1, enc2, enc3, enc4,
            i = 0;

        input = JXG.Util.Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output.push([this._keyStr.charAt(enc1),
                         this._keyStr.charAt(enc2),
                         this._keyStr.charAt(enc3),
                         this._keyStr.charAt(enc4)].join(''));
        }

        return output.join('');
    },

    // public method for decoding
    decode : function (input, utf8) {
        var output = [],
            chr1, chr2, chr3,
            enc1, enc2, enc3, enc4,
            i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output.push(String.fromCharCode(chr1));

            if (enc3 != 64) {
                output.push(String.fromCharCode(chr2));
            }
            if (enc4 != 64) {
                output.push(String.fromCharCode(chr3));
            }
        }
        
        output = output.join(''); 
        
        if (utf8) {
            output = JXG.Util.Base64._utf8_decode(output);
        }
        return output;

    },

    // private method for UTF-8 encoding
    _utf8_encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    // private method for UTF-8 decoding
    _utf8_decode : function (utftext) {
        var string = [],
            i = 0,
            c = 0, c2 = 0, c3 = 0;

        while ( i < utftext.length ) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string.push(String.fromCharCode(c));
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string.push(String.fromCharCode(((c & 31) << 6) | (c2 & 63)));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string.push(String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)));
                i += 3;
            }
        }
        return string.join('');
    },
    
    _destrip: function (stripped, wrap){
        var lines = [], lineno, i,
            destripped = [];
        
        if (wrap==null) 
            wrap = 76;
            
        stripped.replace(/ /g, "");
        lineno = stripped.length / wrap;
        for (i = 0; i < lineno; i++)
            lines[i]=stripped.substr(i * wrap, wrap);
        if (lineno != stripped.length / wrap)
            lines[lines.length]=stripped.substr(lineno * wrap, stripped.length-(lineno * wrap));
            
        for (i = 0; i < lines.length; i++)
            destripped.push(lines[i]);
        return destripped.join('\n');
    },
    
    decodeAsArray: function (input){
        var dec = this.decode(input),
            ar = [], i;
        for (i=0;i<dec.length;i++){
            ar[i]=dec.charCodeAt(i);
        }
        return ar;
    },
    
    decodeGEONExT : function (input) {
        return decodeAsArray(destrip(input),false);
    }
};

/**
 * @private
 */
JXG.Util.asciiCharCodeAt = function(str,i){
	var c = str.charCodeAt(i);
	if (c>255){
    	switch (c) {
			case 8364: c=128;
	    	break;
	    	case 8218: c=130;
	    	break;
	    	case 402: c=131;
	    	break;
	    	case 8222: c=132;
	    	break;
	    	case 8230: c=133;
	    	break;
	    	case 8224: c=134;
	    	break;
	    	case 8225: c=135;
	    	break;
	    	case 710: c=136;
	    	break;
	    	case 8240: c=137;
	    	break;
	    	case 352: c=138;
	    	break;
	    	case 8249: c=139;
	    	break;
	    	case 338: c=140;
	    	break;
	    	case 381: c=142;
	    	break;
	    	case 8216: c=145;
	    	break;
	    	case 8217: c=146;
	    	break;
	    	case 8220: c=147;
	    	break;
	    	case 8221: c=148;
	    	break;
	    	case 8226: c=149;
	    	break;
	    	case 8211: c=150;
	    	break;
	    	case 8212: c=151;
	    	break;
	    	case 732: c=152;
	    	break;
	    	case 8482: c=153;
	    	break;
	    	case 353: c=154;
	    	break;
	    	case 8250: c=155;
	    	break;
	    	case 339: c=156;
	    	break;
	    	case 382: c=158;
	    	break;
	    	case 376: c=159;
	    	break;
	    	default:
	    	break;
	    }
	}
	return c;
};

/**
 * Decoding string into utf-8
 * @param {String} string to decode
 * @return {String} utf8 decoded string
 */
JXG.Util.utf8Decode = function(utftext) {
  var string = [];
  var i = 0;
  var c = 0, c1 = 0, c2 = 0;

  while ( i < utftext.length ) {
    c = utftext.charCodeAt(i);

    if (c < 128) {
      string.push(String.fromCharCode(c));
      i++;
    } else if((c > 191) && (c < 224)) {
      c2 = utftext.charCodeAt(i+1);
      string.push(String.fromCharCode(((c & 31) << 6) | (c2 & 63)));
      i += 2;
    } else {
      c2 = utftext.charCodeAt(i+1);
      c3 = utftext.charCodeAt(i+2);
      string.push(String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)));
      i += 3;
    }
  };
  return string.join('');
};

// Added to exports for Cocos2d
module.exports = JXG;

}};
__resources__["/__builtin__/libs/Plist.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/**
 * XML Node types
 */
var ELEMENT_NODE                = 1,
    ATTRIBUTE_NODE              = 2,
    TEXT_NODE                   = 3,
    CDATA_SECTION_NODE          = 4,
    ENTITY_REFERENCE_NODE       = 5,
    ENTITY_NODE                 = 6,
    PROCESSING_INSTRUCTION_NODE = 7,
    COMMENT_NODE                = 8,
    DOCUMENT_NODE               = 9,
    DOCUMENT_TYPE_NODE          = 10,
    DOCUMENT_FRAGMENT_NODE      = 11,
    NOTATION_NODE               = 12;


var Plist = BObject.extend (/** @lends Plist# */{
    /**
     * The unserialized data inside the Plist file
     * @type Object
     */
    data: null,

    /**
     * An object representation of an XML Property List file
     *
     * @constructs
     * @extends BObject
     * @param {Options} opts Options
     * @config {String} [file] The path to a .plist file
     * @config {String} [data] The contents of a .plist file
     */
    init: function(opts) {
        var file = opts['file'],
            data = opts['data'];

        if (file && !data) {
            data = resource(file);
        }


        var parser = new DOMParser(),
            doc = parser.parseFromString(data, 'text/xml'),
            plist = doc.documentElement;

        if (plist.tagName != 'plist') {
            throw "Not a plist file";
        }


        // Get first real node
        var node = null;
        for (var i = 0, len = plist.childNodes.length; i < len; i++) {
            node = plist.childNodes[i];
            if (node.nodeType == ELEMENT_NODE) {
                break;
            }
        }

        this.set('data', this.parseNode_(node));
    },


    /**
     * @private
     * Parses an XML node inside the Plist file
     * @returns {Object/Array/String/Integer/Float} A JS representation of the node value
     */
    parseNode_: function(node) {
        var data = null;
        switch(node.tagName) {
        case 'dict':
            data = this.parseDict_(node); 
            break;
        case 'array':
            data = this.parseArray_(node); 
            break;
        case 'string':
            // FIXME - This needs to handle Firefox's 4KB nodeValue limit
            data = node.firstChild.nodeValue;
            break
        case 'false':
            data = false;
            break
        case 'true':
            data = true;
            break
        case 'real':
            data = parseFloat(node.firstChild.nodeValue);
            break
        case 'integer':
            data = parseInt(node.firstChild.nodeValue, 10);
            break
        }

        return data;
    },

    /**
     * @private
     * Parses a <dict> node in a plist file
     *
     * @param {XMLElement}
     * @returns {Object} A simple key/value JS Object representing the <dict>
     */
    parseDict_: function(node) {
        var data = {};

        var key = null;
        for (var i = 0, len = node.childNodes.length; i < len; i++) {
            var child = node.childNodes[i];
            if (child.nodeType != ELEMENT_NODE) {
                continue;
            }

            // Grab the key, next noe should be the value
            if (child.tagName == 'key') {
                key = child.firstChild.nodeValue;
            } else {
                // Parse the value node
                data[key] = this.parseNode_(child);
            }
        }


        return data;
    },

    /**
     * @private
     * Parses an <array> node in a plist file
     *
     * @param {XMLElement}
     * @returns {Array} A simple JS Array representing the <array>
     */
    parseArray_: function(node) {
        var data = [];

        for (var i = 0, len = node.childNodes.length; i < len; i++) {
            var child = node.childNodes[i];
            if (child.nodeType != ELEMENT_NODE) {
                continue;
            }

            data.push(this.parseNode_(child));
        }

        return data;
    }
});


exports.Plist = Plist;

}};
__resources__["/__builtin__/libs/qunit.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*
 * QUnit - A JavaScript Unit Testing Framework
 * 
 * http://docs.jquery.com/QUnit
 *
 * Copyright (c) 2011 John Resig, Jörn Zaefferer
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * or GPL (GPL-LICENSE.txt) licenses.
 */

(function(window) {

var defined = {
	setTimeout: typeof window.setTimeout !== "undefined",
	sessionStorage: (function() {
		try {
			return !!sessionStorage.getItem;
		} catch(e){
			return false;
		}
  })()
}

var testId = 0;

var Test = function(name, testName, expected, testEnvironmentArg, async, callback) {
	this.name = name;
	this.testName = testName;
	this.expected = expected;
	this.testEnvironmentArg = testEnvironmentArg;
	this.async = async;
	this.callback = callback;
	this.assertions = [];
};
Test.prototype = {
	init: function() {
		var tests = id("qunit-tests");
		if (tests) {
			var b = document.createElement("strong");
				b.innerHTML = "Running " + this.name;
			var li = document.createElement("li");
				li.appendChild( b );
				li.id = this.id = "test-output" + testId++;
			tests.appendChild( li );
		}
	},
	setup: function() {
		if (this.module != config.previousModule) {
			if ( config.previousModule ) {
				QUnit.moduleDone( {
					name: config.previousModule,
					failed: config.moduleStats.bad,
					passed: config.moduleStats.all - config.moduleStats.bad,
					total: config.moduleStats.all
				} );
			}
			config.previousModule = this.module;
			config.moduleStats = { all: 0, bad: 0 };
			QUnit.moduleStart( {
				name: this.module
			} );
		}

		config.current = this;
		this.testEnvironment = extend({
			setup: function() {},
			teardown: function() {}
		}, this.moduleTestEnvironment);
		if (this.testEnvironmentArg) {
			extend(this.testEnvironment, this.testEnvironmentArg);
		}

		QUnit.testStart( {
			name: this.testName
		} );

		// allow utility functions to access the current test environment
		// TODO why??
		QUnit.current_testEnvironment = this.testEnvironment;
		
		try {
			if ( !config.pollution ) {
				saveGlobal();
			}

			this.testEnvironment.setup.call(this.testEnvironment);
		} catch(e) {
			QUnit.ok( false, "Setup failed on " + this.testName + ": " + e.message );
		}
	},
	run: function() {
		if ( this.async ) {
			QUnit.stop();
		}

		if ( config.notrycatch ) {
			this.callback.call(this.testEnvironment);
			return;
		}
		try {
			this.callback.call(this.testEnvironment);
		} catch(e) {
			fail("Test " + this.testName + " died, exception and test follows", e, this.callback);
			QUnit.ok( false, "Died on test #" + (this.assertions.length + 1) + ": " + e.message + " - " + QUnit.jsDump.parse(e) );
			// else next test will carry the responsibility
			saveGlobal();

			// Restart the tests if they're blocking
			if ( config.blocking ) {
				start();
			}
		}
	},
	teardown: function() {
		try {
			checkPollution();
			this.testEnvironment.teardown.call(this.testEnvironment);
		} catch(e) {
			QUnit.ok( false, "Teardown failed on " + this.testName + ": " + e.message );
		}
	},
	finish: function() {
		if ( this.expected && this.expected != this.assertions.length ) {
			QUnit.ok( false, "Expected " + this.expected + " assertions, but " + this.assertions.length + " were run" );
		}
		
		var good = 0, bad = 0,
			tests = id("qunit-tests");

		config.stats.all += this.assertions.length;
		config.moduleStats.all += this.assertions.length;

		if ( tests ) {
			var ol  = document.createElement("ol");

			for ( var i = 0; i < this.assertions.length; i++ ) {
				var assertion = this.assertions[i];

				var li = document.createElement("li");
				li.className = assertion.result ? "pass" : "fail";
				li.innerHTML = assertion.message || (assertion.result ? "okay" : "failed");
				ol.appendChild( li );

				if ( assertion.result ) {
					good++;
				} else {
					bad++;
					config.stats.bad++;
					config.moduleStats.bad++;
				}
			}

			// store result when possible
			defined.sessionStorage && sessionStorage.setItem("qunit-" + this.testName, bad);

			if (bad == 0) {
				ol.style.display = "none";
			}

			var b = document.createElement("strong");
			b.innerHTML = this.name + " <b class='counts'>(<b class='failed'>" + bad + "</b>, <b class='passed'>" + good + "</b>, " + this.assertions.length + ")</b>";
			
			addEvent(b, "click", function() {
				var next = b.nextSibling, display = next.style.display;
				next.style.display = display === "none" ? "block" : "none";
			});
			
			addEvent(b, "dblclick", function(e) {
				var target = e && e.target ? e.target : window.event.srcElement;
				if ( target.nodeName.toLowerCase() == "span" || target.nodeName.toLowerCase() == "b" ) {
					target = target.parentNode;
				}
				if ( window.location && target.nodeName.toLowerCase() === "strong" ) {
					window.location.search = "?" + encodeURIComponent(getText([target]).replace(/\(.+\)$/, "").replace(/(^\s*|\s*$)/g, ""));
				}
			});

			var li = id(this.id);
			li.className = bad ? "fail" : "pass";
			li.style.display = resultDisplayStyle(!bad);
			li.removeChild( li.firstChild );
			li.appendChild( b );
			li.appendChild( ol );

		} else {
			for ( var i = 0; i < this.assertions.length; i++ ) {
				if ( !this.assertions[i].result ) {
					bad++;
					config.stats.bad++;
					config.moduleStats.bad++;
				}
			}
		}

		try {
			QUnit.reset();
		} catch(e) {
			fail("reset() failed, following Test " + this.testName + ", exception and reset fn follows", e, QUnit.reset);
		}

		QUnit.testDone( {
			name: this.testName,
			failed: bad,
			passed: this.assertions.length - bad,
			total: this.assertions.length
		} );
	},
	
	queue: function() {
		var test = this;
		synchronize(function() {
			test.init();
		});
		function run() {
			// each of these can by async
			synchronize(function() {
				test.setup();
			});
			synchronize(function() {
				test.run();
			});
			synchronize(function() {
				test.teardown();
			});
			synchronize(function() {
				test.finish();
			});
		}
		// defer when previous test run passed, if storage is available
		var bad = defined.sessionStorage && +sessionStorage.getItem("qunit-" + this.testName);
		if (bad) {
			run();
		} else {
			synchronize(run);
		};
	}
	
}

var QUnit = {

	// call on start of module test to prepend name to all tests
	module: function(name, testEnvironment) {
		config.currentModule = name;
		config.currentModuleTestEnviroment = testEnvironment;
	},

	asyncTest: function(testName, expected, callback) {
		if ( arguments.length === 2 ) {
			callback = expected;
			expected = 0;
		}

		QUnit.test(testName, expected, callback, true);
	},
	
	test: function(testName, expected, callback, async) {
		var name = '<span class="test-name">' + testName + '</span>', testEnvironmentArg;

		if ( arguments.length === 2 ) {
			callback = expected;
			expected = null;
		}
		// is 2nd argument a testEnvironment?
		if ( expected && typeof expected === 'object') {
			testEnvironmentArg =  expected;
			expected = null;
		}

		if ( config.currentModule ) {
			name = '<span class="module-name">' + config.currentModule + "</span>: " + name;
		}

		if ( !validTest(config.currentModule + ": " + testName) ) {
			return;
		}
		
		var test = new Test(name, testName, expected, testEnvironmentArg, async, callback);
		test.module = config.currentModule;
		test.moduleTestEnvironment = config.currentModuleTestEnviroment;
		test.queue();
	},
	
	/**
	 * Specify the number of expected assertions to gurantee that failed test (no assertions are run at all) don't slip through.
	 */
	expect: function(asserts) {
		config.current.expected = asserts;
	},

	/**
	 * Asserts true.
	 * @example ok( "asdfasdf".length > 5, "There must be at least 5 chars" );
	 */
	ok: function(a, msg) {
		a = !!a;
		var details = {
			result: a,
			message: msg
		};
		msg = escapeHtml(msg);
		QUnit.log(details);
		config.current.assertions.push({
			result: a,
			message: msg
		});
	},

	/**
	 * Checks that the first two arguments are equal, with an optional message.
	 * Prints out both actual and expected values.
	 *
	 * Prefered to ok( actual == expected, message )
	 *
	 * @example equal( format("Received {0} bytes.", 2), "Received 2 bytes." );
	 *
	 * @param Object actual
	 * @param Object expected
	 * @param String message (optional)
	 */
	equal: function(actual, expected, message) {
		QUnit.push(expected == actual, actual, expected, message);
	},

	notEqual: function(actual, expected, message) {
		QUnit.push(expected != actual, actual, expected, message);
	},
	
	deepEqual: function(actual, expected, message) {
		QUnit.push(QUnit.equiv(actual, expected), actual, expected, message);
	},

	notDeepEqual: function(actual, expected, message) {
		QUnit.push(!QUnit.equiv(actual, expected), actual, expected, message);
	},

	strictEqual: function(actual, expected, message) {
		QUnit.push(expected === actual, actual, expected, message);
	},

	notStrictEqual: function(actual, expected, message) {
		QUnit.push(expected !== actual, actual, expected, message);
	},

	raises: function(block, expected, message) {
		var actual, ok = false;
	
		if (typeof expected === 'string') {
			message = expected;
			expected = null;
		}
	
		try {
			block();
		} catch (e) {
			actual = e;
		}
	
		if (actual) {
			// we don't want to validate thrown error
			if (!expected) {
				ok = true;
			// expected is a regexp	
			} else if (QUnit.objectType(expected) === "regexp") {
				ok = expected.test(actual);
			// expected is a constructor	
			} else if (actual instanceof expected) {
				ok = true;
			// expected is a validation function which returns true is validation passed	
			} else if (expected.call({}, actual) === true) {
				ok = true;
			}
		}
			
		QUnit.ok(ok, message);
	},

	start: function() {
		config.semaphore--;
		if (config.semaphore > 0) {
			// don't start until equal number of stop-calls
			return;
		}
		if (config.semaphore < 0) {
			// ignore if start is called more often then stop
			config.semaphore = 0;
		}
		// A slight delay, to avoid any current callbacks
		if ( defined.setTimeout ) {
			window.setTimeout(function() {
				if ( config.timeout ) {
					clearTimeout(config.timeout);
				}

				config.blocking = false;
				process();
			}, 13);
		} else {
			config.blocking = false;
			process();
		}
	},
	
	stop: function(timeout) {
		config.semaphore++;
		config.blocking = true;

		if ( timeout && defined.setTimeout ) {
			clearTimeout(config.timeout);
			config.timeout = window.setTimeout(function() {
				QUnit.ok( false, "Test timed out" );
				QUnit.start();
			}, timeout);
		}
	}

};

// Backwards compatibility, deprecated
QUnit.equals = QUnit.equal;
QUnit.same = QUnit.deepEqual;

// Maintain internal state
var config = {
	// The queue of tests to run
	queue: [],

	// block until document ready
	blocking: true
};

// Load paramaters
(function() {
	var location = window.location || { search: "", protocol: "file:" },
		GETParams = location.search.slice(1).split('&');

	for ( var i = 0; i < GETParams.length; i++ ) {
		GETParams[i] = decodeURIComponent( GETParams[i] );
		if ( GETParams[i] === "noglobals" ) {
			GETParams.splice( i, 1 );
			i--;
			config.noglobals = true;
		} else if ( GETParams[i] === "notrycatch" ) {
			GETParams.splice( i, 1 );
			i--;
			config.notrycatch = true;
		} else if ( GETParams[i].search('=') > -1 ) {
			GETParams.splice( i, 1 );
			i--;
		}
	}
	
	// restrict modules/tests by get parameters
	config.filters = GETParams;
	
	// Figure out if we're running the tests from a server or not
	QUnit.isLocal = !!(location.protocol === 'file:');
})();

// Expose the API as global variables, unless an 'exports'
// object exists, in that case we assume we're in CommonJS
if ( typeof exports === "undefined" || typeof require === "undefined" ) {
	extend(window, QUnit);
	window.QUnit = QUnit;
} else {
	extend(exports, QUnit);
	exports.QUnit = QUnit;
}

// define these after exposing globals to keep them in these QUnit namespace only
extend(QUnit, {
	config: config,

	// Initialize the configuration options
	init: function() {
		extend(config, {
			stats: { all: 0, bad: 0 },
			moduleStats: { all: 0, bad: 0 },
			started: +new Date,
			updateRate: 1000,
			blocking: false,
			autostart: true,
			autorun: false,
			filters: [],
			queue: [],
			semaphore: 0
		});

		var tests = id("qunit-tests"),
			banner = id("qunit-banner"),
			result = id("qunit-testresult");

		if ( tests ) {
			tests.innerHTML = "";
		}

		if ( banner ) {
			banner.className = "";
		}

		if ( result ) {
			result.parentNode.removeChild( result );
		}
	},
	
	/**
	 * Resets the test setup. Useful for tests that modify the DOM.
	 * 
	 * If jQuery is available, uses jQuery's html(), otherwise just innerHTML.
	 */
	reset: function() {
		if ( window.jQuery ) {
			jQuery( "#main, #qunit-fixture" ).html( config.fixture );
		} else {
			var main = id( 'main' ) || id( 'qunit-fixture' );
			if ( main ) {
				main.innerHTML = config.fixture;
			}
		}
	},
	
	/**
	 * Trigger an event on an element.
	 *
	 * @example triggerEvent( document.body, "click" );
	 *
	 * @param DOMElement elem
	 * @param String type
	 */
	triggerEvent: function( elem, type, event ) {
		if ( document.createEvent ) {
			event = document.createEvent("MouseEvents");
			event.initMouseEvent(type, true, true, elem.ownerDocument.defaultView,
				0, 0, 0, 0, 0, false, false, false, false, 0, null);
			elem.dispatchEvent( event );

		} else if ( elem.fireEvent ) {
			elem.fireEvent("on"+type);
		}
	},
	
	// Safe object type checking
	is: function( type, obj ) {
		return QUnit.objectType( obj ) == type;
	},
	
	objectType: function( obj ) {
		if (typeof obj === "undefined") {
				return "undefined";

		// consider: typeof null === object
		}
		if (obj === null) {
				return "null";
		}

		var type = Object.prototype.toString.call( obj )
			.match(/^\[object\s(.*)\]$/)[1] || '';

		switch (type) {
				case 'Number':
						if (isNaN(obj)) {
								return "nan";
						} else {
								return "number";
						}
				case 'String':
				case 'Boolean':
				case 'Array':
				case 'Date':
				case 'RegExp':
				case 'Function':
						return type.toLowerCase();
		}
		if (typeof obj === "object") {
				return "object";
		}
		return undefined;
	},
	
	push: function(result, actual, expected, message) {
		var details = {
			result: result,
			message: message,
			actual: actual,
			expected: expected
		};
		
		message = escapeHtml(message) || (result ? "okay" : "failed");
		message = '<span class="test-message">' + message + "</span>";
		expected = escapeHtml(QUnit.jsDump.parse(expected));
		actual = escapeHtml(QUnit.jsDump.parse(actual));
		var output = message + '<table><tr class="test-expected"><th>Expected: </th><td><pre>' + expected + '</pre></td></tr>';
		if (actual != expected) {
			output += '<tr class="test-actual"><th>Result: </th><td><pre>' + actual + '</pre></td></tr>';
			output += '<tr class="test-diff"><th>Diff: </th><td><pre>' + QUnit.diff(expected, actual) +'</pre></td></tr>';
		}
		if (!result) {
			var source = sourceFromStacktrace();
			if (source) {
				details.source = source;
				output += '<tr class="test-source"><th>Source: </th><td><pre>' + source +'</pre></td></tr>';
			}
		}
		output += "</table>";
		
		QUnit.log(details);
		
		config.current.assertions.push({
			result: !!result,
			message: output
		});
	},
	
	// Logging callbacks; all receive a single argument with the listed properties
	// run test/logs.html for any related changes
	begin: function() {},
	// done: { failed, passed, total, runtime }
	done: function() {},
	// log: { result, actual, expected, message }
	log: function() {},
	// testStart: { name }
	testStart: function() {},
	// testDone: { name, failed, passed, total }
	testDone: function() {},
	// moduleStart: { name }
	moduleStart: function() {},
	// moduleDone: { name, failed, passed, total }
	moduleDone: function() {}
});

if ( typeof document === "undefined" || document.readyState === "complete" ) {
	config.autorun = true;
}

addEvent(window, "load", function() {
	QUnit.begin({});
	
	// Initialize the config, saving the execution queue
	var oldconfig = extend({}, config);
	QUnit.init();
	extend(config, oldconfig);

	config.blocking = false;

	var userAgent = id("qunit-userAgent");
	if ( userAgent ) {
		userAgent.innerHTML = navigator.userAgent;
	}
	var banner = id("qunit-header");
	if ( banner ) {
		var paramsIndex = location.href.lastIndexOf(location.search);
		if ( paramsIndex > -1 ) {
			var mainPageLocation = location.href.slice(0, paramsIndex);
			if ( mainPageLocation == location.href ) {
				banner.innerHTML = '<a href=""> ' + banner.innerHTML + '</a> ';
			} else {
				var testName = decodeURIComponent(location.search.slice(1));
				banner.innerHTML = '<a href="' + mainPageLocation + '">' + banner.innerHTML + '</a> &#8250; <a href="">' + testName + '</a>';
			}
		}
	}
	
	var toolbar = id("qunit-testrunner-toolbar");
	if ( toolbar ) {
		var filter = document.createElement("input");
		filter.type = "checkbox";
		filter.id = "qunit-filter-pass";
		addEvent( filter, "click", function() {
			var li = document.getElementsByTagName("li");
			for ( var i = 0; i < li.length; i++ ) {
				if ( li[i].className.indexOf("pass") > -1 ) {
					li[i].style.display = filter.checked ? "none" : "";
				}
			}
			if ( defined.sessionStorage ) {
				sessionStorage.setItem("qunit-filter-passed-tests", filter.checked ? "true" : "");
			}
		});
		if ( defined.sessionStorage && sessionStorage.getItem("qunit-filter-passed-tests") ) {
			filter.checked = true;
		}
		toolbar.appendChild( filter );

		var label = document.createElement("label");
		label.setAttribute("for", "qunit-filter-pass");
		label.innerHTML = "Hide passed tests";
		toolbar.appendChild( label );
	}

	var main = id('main') || id('qunit-fixture');
	if ( main ) {
		config.fixture = main.innerHTML;
	}

	if (config.autostart) {
		QUnit.start();
	}
});

function done() {
	config.autorun = true;

	// Log the last module results
	if ( config.currentModule ) {
		QUnit.moduleDone( {
			name: config.currentModule,
			failed: config.moduleStats.bad,
			passed: config.moduleStats.all - config.moduleStats.bad,
			total: config.moduleStats.all
		} );
	}

	var banner = id("qunit-banner"),
		tests = id("qunit-tests"),
		runtime = +new Date - config.started,
		passed = config.stats.all - config.stats.bad,
		html = [
			'Tests completed in ',
			runtime,
			' milliseconds.<br/>',
			'<span class="passed">',
			passed,
			'</span> tests of <span class="total">',
			config.stats.all,
			'</span> passed, <span class="failed">',
			config.stats.bad,
			'</span> failed.'
		].join('');

	if ( banner ) {
		banner.className = (config.stats.bad ? "qunit-fail" : "qunit-pass");
	}

	if ( tests ) {	
		var result = id("qunit-testresult");

		if ( !result ) {
			result = document.createElement("p");
			result.id = "qunit-testresult";
			result.className = "result";
			tests.parentNode.insertBefore( result, tests.nextSibling );
		}

		result.innerHTML = html;
	}

	QUnit.done( {
		failed: config.stats.bad,
		passed: passed, 
		total: config.stats.all,
		runtime: runtime
	} );
}

function validTest( name ) {
	var i = config.filters.length,
		run = false;

	if ( !i ) {
		return true;
	}
	
	while ( i-- ) {
		var filter = config.filters[i],
			not = filter.charAt(0) == '!';

		if ( not ) {
			filter = filter.slice(1);
		}

		if ( name.indexOf(filter) !== -1 ) {
			return !not;
		}

		if ( not ) {
			run = true;
		}
	}

	return run;
}

// so far supports only Firefox, Chrome and Opera (buggy)
// could be extended in the future to use something like https://github.com/csnover/TraceKit
function sourceFromStacktrace() {
	try {
		throw new Error();
	} catch ( e ) {
		if (e.stacktrace) {
			// Opera
			return e.stacktrace.split("\n")[6];
		} else if (e.stack) {
			// Firefox, Chrome
			return e.stack.split("\n")[4];
		}
	}
}

function resultDisplayStyle(passed) {
	return passed && id("qunit-filter-pass") && id("qunit-filter-pass").checked ? 'none' : '';
}

function escapeHtml(s) {
	if (!s) {
		return "";
	}
	s = s + "";
	return s.replace(/[\&"<>\\]/g, function(s) {
		switch(s) {
			case "&": return "&amp;";
			case "\\": return "\\\\";
			case '"': return '\"';
			case "<": return "&lt;";
			case ">": return "&gt;";
			default: return s;
		}
	});
}

function synchronize( callback ) {
	config.queue.push( callback );

	if ( config.autorun && !config.blocking ) {
		process();
	}
}

function process() {
	var start = (new Date()).getTime();

	while ( config.queue.length && !config.blocking ) {
		if ( config.updateRate <= 0 || (((new Date()).getTime() - start) < config.updateRate) ) {
			config.queue.shift()();
		} else {
			window.setTimeout( process, 13 );
			break;
		}
	}
  if (!config.blocking && !config.queue.length) {
    done();
  }
}

function saveGlobal() {
	config.pollution = [];
	
	if ( config.noglobals ) {
		for ( var key in window ) {
			config.pollution.push( key );
		}
	}
}

function checkPollution( name ) {
	var old = config.pollution;
	saveGlobal();
	
	var newGlobals = diff( old, config.pollution );
	if ( newGlobals.length > 0 ) {
		ok( false, "Introduced global variable(s): " + newGlobals.join(", ") );
		config.current.expected++;
	}

	var deletedGlobals = diff( config.pollution, old );
	if ( deletedGlobals.length > 0 ) {
		ok( false, "Deleted global variable(s): " + deletedGlobals.join(", ") );
		config.current.expected++;
	}
}

// returns a new Array with the elements that are in a but not in b
function diff( a, b ) {
	var result = a.slice();
	for ( var i = 0; i < result.length; i++ ) {
		for ( var j = 0; j < b.length; j++ ) {
			if ( result[i] === b[j] ) {
				result.splice(i, 1);
				i--;
				break;
			}
		}
	}
	return result;
}

function fail(message, exception, callback) {
	if ( typeof console !== "undefined" && console.error && console.warn ) {
		console.error(message);
		console.error(exception);
		console.warn(callback.toString());

	} else if ( window.opera && opera.postError ) {
		opera.postError(message, exception, callback.toString);
	}
}

function extend(a, b) {
	for ( var prop in b ) {
		a[prop] = b[prop];
	}

	return a;
}

function addEvent(elem, type, fn) {
	if ( elem.addEventListener ) {
		elem.addEventListener( type, fn, false );
	} else if ( elem.attachEvent ) {
		elem.attachEvent( "on" + type, fn );
	} else {
		fn();
	}
}

function id(name) {
	return !!(typeof document !== "undefined" && document && document.getElementById) &&
		document.getElementById( name );
}

// Test for equality any JavaScript type.
// Discussions and reference: http://philrathe.com/articles/equiv
// Test suites: http://philrathe.com/tests/equiv
// Author: Philippe Rathé <prathe@gmail.com>
QUnit.equiv = function () {

    var innerEquiv; // the real equiv function
    var callers = []; // stack to decide between skip/abort functions
    var parents = []; // stack to avoiding loops from circular referencing

    // Call the o related callback with the given arguments.
    function bindCallbacks(o, callbacks, args) {
        var prop = QUnit.objectType(o);
        if (prop) {
            if (QUnit.objectType(callbacks[prop]) === "function") {
                return callbacks[prop].apply(callbacks, args);
            } else {
                return callbacks[prop]; // or undefined
            }
        }
    }
    
    var callbacks = function () {

        // for string, boolean, number and null
        function useStrictEquality(b, a) {
            if (b instanceof a.constructor || a instanceof b.constructor) {
                // to catch short annotaion VS 'new' annotation of a declaration
                // e.g. var i = 1;
                //      var j = new Number(1);
                return a == b;
            } else {
                return a === b;
            }
        }

        return {
            "string": useStrictEquality,
            "boolean": useStrictEquality,
            "number": useStrictEquality,
            "null": useStrictEquality,
            "undefined": useStrictEquality,

            "nan": function (b) {
                return isNaN(b);
            },

            "date": function (b, a) {
                return QUnit.objectType(b) === "date" && a.valueOf() === b.valueOf();
            },

            "regexp": function (b, a) {
                return QUnit.objectType(b) === "regexp" &&
                    a.source === b.source && // the regex itself
                    a.global === b.global && // and its modifers (gmi) ...
                    a.ignoreCase === b.ignoreCase &&
                    a.multiline === b.multiline;
            },

            // - skip when the property is a method of an instance (OOP)
            // - abort otherwise,
            //   initial === would have catch identical references anyway
            "function": function () {
                var caller = callers[callers.length - 1];
                return caller !== Object &&
                        typeof caller !== "undefined";
            },

            "array": function (b, a) {
                var i, j, loop;
                var len;

                // b could be an object literal here
                if ( ! (QUnit.objectType(b) === "array")) {
                    return false;
                }   
                
                len = a.length;
                if (len !== b.length) { // safe and faster
                    return false;
                }
                
                //track reference to avoid circular references
                parents.push(a);
                for (i = 0; i < len; i++) {
                    loop = false;
                    for(j=0;j<parents.length;j++){
                        if(parents[j] === a[i]){
                            loop = true;//dont rewalk array
                        }
                    }
                    if (!loop && ! innerEquiv(a[i], b[i])) {
                        parents.pop();
                        return false;
                    }
                }
                parents.pop();
                return true;
            },

            "object": function (b, a) {
                var i, j, loop;
                var eq = true; // unless we can proove it
                var aProperties = [], bProperties = []; // collection of strings

                // comparing constructors is more strict than using instanceof
                if ( a.constructor !== b.constructor) {
                    return false;
                }

                // stack constructor before traversing properties
                callers.push(a.constructor);
                //track reference to avoid circular references
                parents.push(a);
                
                for (i in a) { // be strict: don't ensures hasOwnProperty and go deep
                    loop = false;
                    for(j=0;j<parents.length;j++){
                        if(parents[j] === a[i])
                            loop = true; //don't go down the same path twice
                    }
                    aProperties.push(i); // collect a's properties

                    if (!loop && ! innerEquiv(a[i], b[i])) {
                        eq = false;
                        break;
                    }
                }

                callers.pop(); // unstack, we are done
                parents.pop();

                for (i in b) {
                    bProperties.push(i); // collect b's properties
                }

                // Ensures identical properties name
                return eq && innerEquiv(aProperties.sort(), bProperties.sort());
            }
        };
    }();

    innerEquiv = function () { // can take multiple arguments
        var args = Array.prototype.slice.apply(arguments);
        if (args.length < 2) {
            return true; // end transition
        }

        return (function (a, b) {
            if (a === b) {
                return true; // catch the most you can
            } else if (a === null || b === null || typeof a === "undefined" || typeof b === "undefined" || QUnit.objectType(a) !== QUnit.objectType(b)) {
                return false; // don't lose time with error prone cases
            } else {
                return bindCallbacks(a, callbacks, [b, a]);
            }

        // apply transition with (1..n) arguments
        })(args[0], args[1]) && arguments.callee.apply(this, args.splice(1, args.length -1));
    };

    return innerEquiv;

}();

/**
 * jsDump
 * Copyright (c) 2008 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Licensed under BSD (http://www.opensource.org/licenses/bsd-license.php)
 * Date: 5/15/2008
 * @projectDescription Advanced and extensible data dumping for Javascript.
 * @version 1.0.0
 * @author Ariel Flesler
 * @link {http://flesler.blogspot.com/2008/05/jsdump-pretty-dump-of-any-javascript.html}
 */
QUnit.jsDump = (function() {
	function quote( str ) {
		return '"' + str.toString().replace(/"/g, '\\"') + '"';
	};
	function literal( o ) {
		return o + '';	
	};
	function join( pre, arr, post ) {
		var s = jsDump.separator(),
			base = jsDump.indent(),
			inner = jsDump.indent(1);
		if ( arr.join )
			arr = arr.join( ',' + s + inner );
		if ( !arr )
			return pre + post;
		return [ pre, inner + arr, base + post ].join(s);
	};
	function array( arr ) {
		var i = arr.length,	ret = Array(i);					
		this.up();
		while ( i-- )
			ret[i] = this.parse( arr[i] );				
		this.down();
		return join( '[', ret, ']' );
	};
	
	var reName = /^function (\w+)/;
	
	var jsDump = {
		parse:function( obj, type ) { //type is used mostly internally, you can fix a (custom)type in advance
			var	parser = this.parsers[ type || this.typeOf(obj) ];
			type = typeof parser;			
			
			return type == 'function' ? parser.call( this, obj ) :
				   type == 'string' ? parser :
				   this.parsers.error;
		},
		typeOf:function( obj ) {
			var type;
			if ( obj === null ) {
				type = "null";
			} else if (typeof obj === "undefined") {
				type = "undefined";
			} else if (QUnit.is("RegExp", obj)) {
				type = "regexp";
			} else if (QUnit.is("Date", obj)) {
				type = "date";
			} else if (QUnit.is("Function", obj)) {
				type = "function";
			} else if (typeof obj.setInterval !== undefined && typeof obj.document !== "undefined" && typeof obj.nodeType === "undefined") {
				type = "window";
			} else if (obj.nodeType === 9) {
				type = "document";
			} else if (obj.nodeType) {
				type = "node";
			} else if (typeof obj === "object" && typeof obj.length === "number" && obj.length >= 0) {
				type = "array";
			} else {
				type = typeof obj;
			}
			return type;
		},
		separator:function() {
			return this.multiline ?	this.HTML ? '<br />' : '\n' : this.HTML ? '&nbsp;' : ' ';
		},
		indent:function( extra ) {// extra can be a number, shortcut for increasing-calling-decreasing
			if ( !this.multiline )
				return '';
			var chr = this.indentChar;
			if ( this.HTML )
				chr = chr.replace(/\t/g,'   ').replace(/ /g,'&nbsp;');
			return Array( this._depth_ + (extra||0) ).join(chr);
		},
		up:function( a ) {
			this._depth_ += a || 1;
		},
		down:function( a ) {
			this._depth_ -= a || 1;
		},
		setParser:function( name, parser ) {
			this.parsers[name] = parser;
		},
		// The next 3 are exposed so you can use them
		quote:quote, 
		literal:literal,
		join:join,
		//
		_depth_: 1,
		// This is the list of parsers, to modify them, use jsDump.setParser
		parsers:{
			window: '[Window]',
			document: '[Document]',
			error:'[ERROR]', //when no parser is found, shouldn't happen
			unknown: '[Unknown]',
			'null':'null',
			undefined:'undefined',
			'function':function( fn ) {
				var ret = 'function',
					name = 'name' in fn ? fn.name : (reName.exec(fn)||[])[1];//functions never have name in IE
				if ( name )
					ret += ' ' + name;
				ret += '(';
				
				ret = [ ret, QUnit.jsDump.parse( fn, 'functionArgs' ), '){'].join('');
				return join( ret, QUnit.jsDump.parse(fn,'functionCode'), '}' );
			},
			array: array,
			nodelist: array,
			arguments: array,
			object:function( map ) {
				var ret = [ ];
				QUnit.jsDump.up();
				for ( var key in map )
					ret.push( QUnit.jsDump.parse(key,'key') + ': ' + QUnit.jsDump.parse(map[key]) );
				QUnit.jsDump.down();
				return join( '{', ret, '}' );
			},
			node:function( node ) {
				var open = QUnit.jsDump.HTML ? '&lt;' : '<',
					close = QUnit.jsDump.HTML ? '&gt;' : '>';
					
				var tag = node.nodeName.toLowerCase(),
					ret = open + tag;
					
				for ( var a in QUnit.jsDump.DOMAttrs ) {
					var val = node[QUnit.jsDump.DOMAttrs[a]];
					if ( val )
						ret += ' ' + a + '=' + QUnit.jsDump.parse( val, 'attribute' );
				}
				return ret + close + open + '/' + tag + close;
			},
			functionArgs:function( fn ) {//function calls it internally, it's the arguments part of the function
				var l = fn.length;
				if ( !l ) return '';				
				
				var args = Array(l);
				while ( l-- )
					args[l] = String.fromCharCode(97+l);//97 is 'a'
				return ' ' + args.join(', ') + ' ';
			},
			key:quote, //object calls it internally, the key part of an item in a map
			functionCode:'[code]', //function calls it internally, it's the content of the function
			attribute:quote, //node calls it internally, it's an html attribute value
			string:quote,
			date:quote,
			regexp:literal, //regex
			number:literal,
			'boolean':literal
		},
		DOMAttrs:{//attributes to dump from nodes, name=>realName
			id:'id',
			name:'name',
			'class':'className'
		},
		HTML:false,//if true, entities are escaped ( <, >, \t, space and \n )
		indentChar:'  ',//indentation unit
		multiline:true //if true, items in a collection, are separated by a \n, else just a space.
	};

	return jsDump;
})();

// from Sizzle.js
function getText( elems ) {
	var ret = "", elem;

	for ( var i = 0; elems[i]; i++ ) {
		elem = elems[i];

		// Get the text from text nodes and CDATA nodes
		if ( elem.nodeType === 3 || elem.nodeType === 4 ) {
			ret += elem.nodeValue;

		// Traverse everything else, except comment nodes
		} else if ( elem.nodeType !== 8 ) {
			ret += getText( elem.childNodes );
		}
	}

	return ret;
};

/*
 * Javascript Diff Algorithm
 *  By John Resig (http://ejohn.org/)
 *  Modified by Chu Alan "sprite"
 *
 * Released under the MIT license.
 *
 * More Info:
 *  http://ejohn.org/projects/javascript-diff-algorithm/
 *  
 * Usage: QUnit.diff(expected, actual)
 * 
 * QUnit.diff("the quick brown fox jumped over", "the quick fox jumps over") == "the  quick <del>brown </del> fox <del>jumped </del><ins>jumps </ins> over"
 */
QUnit.diff = (function() {
	function diff(o, n){
		var ns = new Object();
		var os = new Object();
		
		for (var i = 0; i < n.length; i++) {
			if (ns[n[i]] == null) 
				ns[n[i]] = {
					rows: new Array(),
					o: null
				};
			ns[n[i]].rows.push(i);
		}
		
		for (var i = 0; i < o.length; i++) {
			if (os[o[i]] == null) 
				os[o[i]] = {
					rows: new Array(),
					n: null
				};
			os[o[i]].rows.push(i);
		}
		
		for (var i in ns) {
			if (ns[i].rows.length == 1 && typeof(os[i]) != "undefined" && os[i].rows.length == 1) {
				n[ns[i].rows[0]] = {
					text: n[ns[i].rows[0]],
					row: os[i].rows[0]
				};
				o[os[i].rows[0]] = {
					text: o[os[i].rows[0]],
					row: ns[i].rows[0]
				};
			}
		}
		
		for (var i = 0; i < n.length - 1; i++) {
			if (n[i].text != null && n[i + 1].text == null && n[i].row + 1 < o.length && o[n[i].row + 1].text == null &&
			n[i + 1] == o[n[i].row + 1]) {
				n[i + 1] = {
					text: n[i + 1],
					row: n[i].row + 1
				};
				o[n[i].row + 1] = {
					text: o[n[i].row + 1],
					row: i + 1
				};
			}
		}
		
		for (var i = n.length - 1; i > 0; i--) {
			if (n[i].text != null && n[i - 1].text == null && n[i].row > 0 && o[n[i].row - 1].text == null &&
			n[i - 1] == o[n[i].row - 1]) {
				n[i - 1] = {
					text: n[i - 1],
					row: n[i].row - 1
				};
				o[n[i].row - 1] = {
					text: o[n[i].row - 1],
					row: i - 1
				};
			}
		}
		
		return {
			o: o,
			n: n
		};
	}
	
	return function(o, n){
		o = o.replace(/\s+$/, '');
		n = n.replace(/\s+$/, '');
		var out = diff(o == "" ? [] : o.split(/\s+/), n == "" ? [] : n.split(/\s+/));

		var str = "";
		
		var oSpace = o.match(/\s+/g);
		if (oSpace == null) {
			oSpace = [" "];
		}
		else {
			oSpace.push(" ");
		}
		var nSpace = n.match(/\s+/g);
		if (nSpace == null) {
			nSpace = [" "];
		}
		else {
			nSpace.push(" ");
		}
		
		if (out.n.length == 0) {
			for (var i = 0; i < out.o.length; i++) {
				str += '<del>' + out.o[i] + oSpace[i] + "</del>";
			}
		}
		else {
			if (out.n[0].text == null) {
				for (n = 0; n < out.o.length && out.o[n].text == null; n++) {
					str += '<del>' + out.o[n] + oSpace[n] + "</del>";
				}
			}
			
			for (var i = 0; i < out.n.length; i++) {
				if (out.n[i].text == null) {
					str += '<ins>' + out.n[i] + nSpace[i] + "</ins>";
				}
				else {
					var pre = "";
					
					for (n = out.n[i].row + 1; n < out.o.length && out.o[n].text == null; n++) {
						pre += '<del>' + out.o[n] + oSpace[n] + "</del>";
					}
					str += " " + out.n[i].text + nSpace[i] + pre;
				}
			}
		}
		
		return str;
	};
})();

})(this);

}};
__resources__["/__builtin__/libs/util.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var path = require('path');

/**
 * @namespace
 * Useful utility functions
 */
var util = {
    /**
     * Merge two or more objects and return the result.
     *
     * @param {Object} firstObject First object to merge with
     * @param {Object} secondObject Second object to merge with
     * @param {Object} [...] More objects to merge
     * @returns {Object} A new object containing the properties of all the objects passed in
     */
    merge: function(firstObject, secondObject) {
        var result = {};

        for (var i = 0; i < arguments.length; i++) {
            var obj = arguments[i];

            for (var x in obj) {
                if (!obj.hasOwnProperty(x)) {
                    continue;
                }

                result[x] = obj[x];
            }
        };

        return result;
    },

    /**
     * Creates a deep copy of an object
     *
     * @param {Object} obj The Object to copy
     * @returns {Object} A copy of the original Object
     */
    copy: function(obj) {
        if (obj === null) {
            return null;
        }

        var copy;

        if (obj instanceof Array) {
            copy = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                copy[i] = arguments.callee(obj[i]);
            }
        } else if (typeof(obj) == 'object') {
            if (typeof(obj.copy) == 'function') {
                copy = obj.copy();
            } else {
                copy = {};

                var o, x;
                for (x in obj) {
                    copy[x] = arguments.callee(obj[x]);
                }
            }
        } else {
            // Primative type. Doesn't need copying
            copy = obj;
        }

        return copy;
    },

    /**
     * Iterates over an array and calls a function for each item.
     *
     * @param {Array} arr An Array to iterate over
     * @param {Function} func A function to call for each item in the array
     * @returns {Array} The original array
     */
    each: function(arr, func) {
        var i = 0,
            len = arr.length;
        for (i = 0; i < len; i++) {
            func(arr[i], i);
        }

        return arr;
    },

    /**
     * Iterates over an array, calls a function for each item and returns the results.
     *
     * @param {Array} arr An Array to iterate over
     * @param {Function} func A function to call for each item in the array
     * @returns {Array} The return values from each function call
     */
    map: function(arr, func) {
        var i = 0,
            len = arr.length,
            result = [];

        for (i = 0; i < len; i++) {
            result.push(func(arr[i], i));
        }

        return result;
    },

    extend: function(target, ext) {
        if (arguments.length < 2) {
            throw "You must provide at least a target and 1 object to extend from"
        }

        var i, j, obj, key, val;

        for (i = 1; i < arguments.length; i++) {
            obj = arguments[i];
            for (key in obj) {
                // Don't copy built-ins
                if (!obj.hasOwnProperty(key)) {
                    continue;
                }

                val = obj[key];
                // Don't copy undefineds or references to target (would cause infinite loop)
                if (val === undefined || val === target) {
                    continue;
                }

                // Replace existing function and store reference to it in .base
                if (val instanceof Function && target[key] && val !== target[key]) {
                    val.base = target[key];
                    val._isProperty = val.base._isProperty;
                }
                target[key] = val;

                if (val instanceof Function) {
                    // If this function observes make a reference to it so we can set
                    // them up when this get instantiated
                    if (val._observing) {
                        // Force a COPY of the array or we will probably end up with various
                        // classes sharing the same one.
                        if (!target._observingFunctions) {
                            target._observingFunctions = [];
                        } else {
                            target._observingFunctions = target._observingFunctions.slice(0);
                        }


                        for (j = 0; j<val._observing.length; j++) {
                            target._observingFunctions.push({property:val._observing[j], method: key});
                        }
                    } // if (val._observing)

                    // If this is a computer property then add it to the list so get/set know where to look
                    if (val._isProperty) {
                        if (!target._computedProperties) {
                            target._computedProperties = [];
                        } else {
                            target._computedProperties = target._computedProperties.slice(0);
                        }

                        target._computedProperties.push(key)
                    }
                }
        
            }
        }


        return target;
    },

    beget: function(o) {
        var F = function(){};
        F.prototype = o;
        var ret  = new F();
        F.prototype = null;
        return ret;
    },

    callback: function(target, method) {
        if (typeof(method) == 'string') {
            method = target[method];
        }

        return function() {
            method.apply(target, arguments);
        }
    },

    domReady: function() {
        if (this._isReady) {
            return;
        }

        if (!document.body) {
            setTimeout(function() { util.domReady(); }, 13);
        }

        window.__isReady = true;

        if (window.__readyList) {
            var fn, i = 0;
            while ( (fn = window.__readyList[ i++ ]) ) {
                fn.call(document);
            }

            window.__readyList = null;
            delete window.__readyList;
        }
    },


    /**
     * Adapted from jQuery
     * @ignore
     */
    bindReady: function() {

        if (window.__readyBound) {
            return;
        }

        window.__readyBound = true;

        // Catch cases where $(document).ready() is called after the
        // browser event has already occurred.
        if ( document.readyState === "complete" ) {
            return util.domReady();
        }

        // Mozilla, Opera and webkit nightlies currently support this event
        if ( document.addEventListener ) {
            // Use the handy event callback
            //document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );
            
            // A fallback to window.onload, that will always work
            window.addEventListener( "load", util.domReady, false );

        // If IE event model is used
        } else if ( document.attachEvent ) {
            // ensure firing before onload,
            // maybe late but safe also for iframes
            //document.attachEvent("onreadystatechange", DOMContentLoaded);
            
            // A fallback to window.onload, that will always work
            window.attachEvent( "onload", util.domReady );

            // If IE and not a frame
            /*
            // continually check to see if the document is ready
            var toplevel = false;

            try {
                toplevel = window.frameElement == null;
            } catch(e) {}

            if ( document.documentElement.doScroll && toplevel ) {
                doScrollCheck();
            }
            */
        }
    },



    ready: function(func) {
        if (window.__isReady) {
            func()
        } else {
            if (!window.__readyList) {
                window.__readyList = [];
            }
            window.__readyList.push(func);
        }

        util.bindReady();
    },


    /**
     * Tests if a given object is an Array
     *
     * @param {Array} ar The object to test
     *
     * @returns {Boolean} True if it is an Array, otherwise false
     */
    isArray: function(ar) {
      return ar instanceof Array
          || (ar && ar !== Object.prototype && util.isArray(ar.__proto__));
    },


    /**
     * Tests if a given object is a RegExp
     *
     * @param {RegExp} ar The object to test
     *
     * @returns {Boolean} True if it is an RegExp, otherwise false
     */
    isRegExp: function(re) {
      var s = ""+re;
      return re instanceof RegExp // easy case
          || typeof(re) === "function" // duck-type for context-switching evalcx case
          && re.constructor.name === "RegExp"
          && re.compile
          && re.test
          && re.exec
          && s.charAt(0) === "/"
          && s.substr(-1) === "/";
    },


    /**
     * Tests if a given object is a Date
     *
     * @param {Date} ar The object to test
     *
     * @returns {Boolean} True if it is an Date, otherwise false
     */
    isDate: function(d) {
        if (d instanceof Date) return true;
        if (typeof d !== "object") return false;
        var properties = Date.prototype && Object.getOwnPropertyNames(Date.prototype);
        var proto = d.__proto__ && Object.getOwnPropertyNames(d.__proto__);
        return JSON.stringify(proto) === JSON.stringify(properties);
    },

    /**
     * Utility to populate a namespace's index with its modules
     *
     * @param {Object} parent The module the namespace lives in. parent.exports will be populated automatically
     * @param {String} modules A space separated string of all the module names
     *
     * @returns {Object} The index namespace
     */
    populateIndex: function(parent, modules) {
        var namespace = {};
        modules = modules.split(' ');

        util.each(modules, function(mod, i) {
            // Use the global 'require' which allows overriding the parent module
            util.extend(namespace, window.require('./' + mod, parent));
        });

        parent.exports = namespace;

        return namespace;
    }


}

util.extend(String.prototype, /** @scope String.prototype */ {
    /**
     * Create an array of words from a string
     *
     * @returns {String[]} Array of the words in the string
     */
    w: function() {
        return this.split(' ');
    }
});




module.exports = util;

}};
__resources__["/__builtin__/path.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/** @namespace */
var path = {
    /**
     * Returns full directory path for the filename given. The path must be formed using forward slashes '/'.
     *
     * @param {String} path Path to return the directory name of
     * @returns {String} Directory name
     */
    dirname: function(path) {
        var tokens = path.split('/');
        tokens.pop();
        return tokens.join('/');
    },

    /**
     * Returns just the filename portion of a path.
     *
     * @param {String} path Path to return the filename portion of
     * @returns {String} Filename
     */
    basename: function(path) {
        var tokens = path.split('/');
        return tokens[tokens.length-1];
    },

    /**
     * Joins multiple paths together to form a single path
     * @param {String} ... Any number of string arguments to join together
     * @returns {String} The joined path
     */
    join: function () {
        return module.exports.normalize(Array.prototype.join.call(arguments, "/"));
    },

    /**
     * Tests if a path exists
     *
     * @param {String} path Path to test
     * @returns {Boolean} True if the path exists, false if not
     */
    exists: function(path) {
        return (__resources__[path] !== undefined);
    },

    /**
     * @private
     */
    normalizeArray: function (parts, keepBlanks) {
      var directories = [], prev;
      for (var i = 0, l = parts.length - 1; i <= l; i++) {
        var directory = parts[i];

        // if it's blank, but it's not the first thing, and not the last thing, skip it.
        if (directory === "" && i !== 0 && i !== l && !keepBlanks) continue;

        // if it's a dot, and there was some previous dir already, then skip it.
        if (directory === "." && prev !== undefined) continue;

        // if it starts with "", and is a . or .., then skip it.
        if (directories.length === 1 && directories[0] === "" && (
            directory === "." || directory === "..")) continue;

        if (
          directory === ".."
          && directories.length
          && prev !== ".."
          && prev !== "."
          && prev !== undefined
          && (prev !== "" || keepBlanks)
        ) {
          directories.pop();
          prev = directories.slice(-1)[0]
        } else {
          if (prev === ".") directories.pop();
          directories.push(directory);
          prev = directory;
        }
      }
      return directories;
    },

    /**
     * Returns the real path by expanding any '.' and '..' portions
     *
     * @param {String} path Path to normalize
     * @param {Boolean} [keepBlanks=false] Whether to keep blanks. i.e. double slashes in a path
     * @returns {String} Normalized path
     */
    normalize: function (path, keepBlanks) {
      return module.exports.normalizeArray(path.split("/"), keepBlanks).join("/");
    }
};

module.exports = path;

}};
__resources__["/__builtin__/system.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/** @namespace */
var system = {
    /** @namespace */
    stdio: {
        /**
         * Print text and objects to the debug console if the browser has one
         * 
         * @param {*} Any value to output
         */
        print: function() {
            if (console) {
                console.log.apply(console, arguments);
            } else {
                // TODO
            }
        }
    }
};

if (window.console) {
    system.console = window.console
} else {
    system.console = {
        log: function(){}
    }
}

}};
__resources__["/main.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
// Import the cocos2d module
var cocos = require('cocos2d'),
// Import the geometry module
    geo = require('geometry'),
// Import box2d Physics Engine
    box2d = require('box2d');

var PTM_RATIO = 30;

// Create a new layer
var PhysicsDemo = cocos.nodes.Layer.extend({
    world: null,
    bodies: null,
    selectedBody: null,
    mouseJoint: null,

    init: function() {
        // You must always call the super class version of init
        PhysicsDemo.superclass.init.call(this);

        this.set('isMouseEnabled', true);

        this.set('bodies', []);

        // Get size of canvas
        var s = cocos.Director.get('sharedDirector').get('winSize');

        this.demo();
        this.scheduleUpdate();
    },

    update: function(dt) {
        var world = this.get('world'),
            mouseJoint = this.get('mouseJoint');

        world.Step(dt, 10, 10);
        //world.DrawDebugData();
        world.ClearForces();

        var bodies = this.get('bodies');
        for (var i = 0, len = bodies.length; i < len; i++) {
            var body = bodies[i],
                pos = body.GetPosition(),
                angle = geo.radiansToDegrees(body.GetAngle()),
                offset = body.sprite.get( "offset" );
            if( offset ) {
              body.sprite.set('position', new geo.Point(pos.x * PTM_RATIO + offset.x, pos.y * PTM_RATIO + offset.y));
            } else {
              body.sprite.set('position', new geo.Point(pos.x * PTM_RATIO, pos.y * PTM_RATIO));
            }
            body.sprite.set('rotation', angle);
        }
    },

    demo: function() {
        var world = new box2d.b2World(
            new box2d.b2Vec2(0, -10),    //gravity
            true                  //allow sleep
        );
        this.set('world', world);

        var director = cocos.Director.get( "sharedDirector" );
        var winSize  = director.get( "winSize" );

        var background = cocos.nodes.Sprite.create( { file : "/resources/background.jpg" } );
        background.set( "position", geo.ccp( winSize.width / 2, winSize.height / 2 ) );
        this.addChild( { child : background, z : -1 } );

        var fixDef = new box2d.b2FixtureDef;
        fixDef.density = 1.0;
        fixDef.friction = 0.5;
        fixDef.restitution = 0.2;

        var bodyDef = new box2d.b2BodyDef;

        //create ground
        bodyDef.type = box2d.b2Body.b2_staticBody;
        fixDef.shape = new box2d.b2PolygonShape;
        fixDef.shape.SetAsBox(20, 2);
        bodyDef.position.Set(10, 400 / PTM_RATIO + 2);
        world.CreateBody(bodyDef).CreateFixture(fixDef);
        bodyDef.position.Set(10, -2);
        world.CreateBody(bodyDef).CreateFixture(fixDef);
        fixDef.shape.SetAsBox(2, 14);
        bodyDef.position.Set(-2, 13);
        world.CreateBody(bodyDef).CreateFixture(fixDef);
        bodyDef.position.Set(22, 13);
        world.CreateBody(bodyDef).CreateFixture(fixDef);

        /* ---------------------------------------------------------
         * GIRDER
         * --------------------------------------------------------- */

        bodyDef.type = box2d.b2Body.b2_staticBody;
        bodyDef.position.Set( (winSize.width / 2) / PTM_RATIO, (winSize.height * 4 / 5) / PTM_RATIO );

        fixDef.shape = new box2d.b2PolygonShape;
        fixDef.shape.SetAsBox( 175 / PTM_RATIO, 39 / PTM_RATIO );

        var girder = cocos.nodes.Sprite.create( { file : "/resources/girder.png" } );
        girder.set( "position", new geo.Point( bodyDef.position.x * PTM_RATIO, bodyDef.position.y * PTM_RATIO ) );
        this.addChild( { child : girder, z : 1 } );

        girderBody = world.CreateBody( bodyDef );
        girderBody.CreateFixture( fixDef );
        this.get( "bodies" ).push( girderBody );
        girderBody.sprite = girder;

        /* ---------------------------------------------------------
         * BALLS
         * --------------------------------------------------------- */

        var ballRadius = 50;

        bodyDef.type = box2d.b2Body.b2_dynamicBody;

        fixDef.shape = new box2d.b2CircleShape( (ballRadius / 2) / PTM_RATIO );
        fixDef.restitution = 1.0;
        fixDef.density     = 1.0;
        fixDef.friction    = 1.0;

        var jointDef = new box2d.b2RevoluteJointDef;

        for( i = 0; i < 5; i++ ) {
          bodyDef.angularDamping = 0.1;
          bodyDef.bullet = true;

          bodyDef.position.Set( (winSize.width / 3 + (ballRadius + 2) * i) / PTM_RATIO, girderBody.GetPosition().y - 250 / PTM_RATIO);
          var ball = cocos.nodes.Sprite.create( { file : "/resources/ball_with_string.png" } );
          ball.set( "position", new geo.Point( bodyDef.position.x * PTM_RATIO, bodyDef.position.y * PTM_RATIO ) );
          ball.set( "offset", { x : 0, y : 100 } );

          this.addChild( ball );

          var ballBody = world.CreateBody( bodyDef );
          ballBody.CreateFixture( fixDef );
          this.get( "bodies" ).push( ballBody );
          ballBody.sprite = ball;

          jointDef.Initialize( girderBody, ballBody, new box2d.b2Vec2( ballBody.GetPosition().x, girderBody.GetPosition().y ) );

          world.CreateJoint( jointDef );
        }

        console.log( cocos.Texture2D );

        /*
        //setup debug draw
        var debugDraw = new box2d.b2DebugDraw();
            debugDraw.SetSprite(document.getElementById('debug-canvas').getContext("2d"));
            debugDraw.SetDrawScale(30.0);
            debugDraw.SetFillAlpha(0.5);
            debugDraw.SetLineThickness(1.0);
            debugDraw.SetFlags(box2d.b2DebugDraw.e_shapeBit | box2d.b2DebugDraw.e_jointBit);
            world.SetDebugDraw(debugDraw);
        */
    },

    getBodyAtPoint: function (point) {
        point = new geo.Point(point.x /PTM_RATIO, point.y /PTM_RATIO);
        var world = this.get('world');
        var mousePVec = new box2d.b2Vec2(point.x, point.y);
        var aabb = new box2d.b2AABB();
        aabb.lowerBound.Set(point.x - 0.001, point.y - 0.001);
        aabb.upperBound.Set(point.x + 0.001, point.y + 0.001);


        var self = this;
        function getBodyCB(fixture) {
            if(fixture.GetBody().GetType() != box2d.b2Body.b2_staticBody) {
                if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)) {
                    self.set('selectedBody', fixture.GetBody());
                    return false;
                }
            }
            return true;
        }


        // Query the world for overlapping shapes.

        this.set('selectedBody', null);
        world.QueryAABB(getBodyCB, aabb);
        return this.get('selectedBody');
    },

    mouseDown: function(evt) {
        var point = evt.locationInCanvas,
            world = this.get('world'),
            mouseJoint = this.get('mouseJoint');

        if (!mouseJoint) {
            var body = this.getBodyAtPoint(point);
            if(body) {
                var md = new box2d.b2MouseJointDef();
                md.bodyA = world.GetGroundBody();
                md.bodyB = body;
                md.target.Set(point.x /PTM_RATIO, point.y /PTM_RATIO);
                md.collideConnected = true;
                md.maxForce = 300.0 * body.GetMass();
                mouseJoint = world.CreateJoint(md);
                body.SetAwake(true);
                this.set('mouseJoint', mouseJoint);
            }
        }
    },

    mouseDragged: function(evt) {
        var point = evt.locationInCanvas,
            world = this.get('world'),
            mouseJoint = this.get('mouseJoint');

        if (mouseJoint) {
            mouseJoint.SetTarget(new box2d.b2Vec2(point.x /PTM_RATIO, point.y /PTM_RATIO));
        }
    },

    mouseUp: function(evt) {
        var mouseJoint = this.get('mouseJoint'),
            world = this.get('world');

        if (mouseJoint) {
            world.DestroyJoint(mouseJoint);
            this.set('mouseJoint', null);
        }
    }
});

// Initialise everything

// Get director
var director = cocos.Director.get('sharedDirector');

// Attach director to our <div> element
director.attachInView(document.getElementById('cocos2d-app'));

director.set('displayFPS', false);

// Create a scene
var scene = cocos.nodes.Scene.create();

// Add our layer to the scene
scene.addChild({child: PhysicsDemo.create()});

// Run the scene
director.runWithScene(scene);

}};
__resources__["/resources/background.jpg"] = {meta: {mimetype: "image/jpeg"}, data: __imageResource("data:image/jpeg;base64,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")};
__resources__["/resources/ball.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,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")};
__resources__["/resources/ball_with_string.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,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")};
__resources__["/resources/crate.jpg"] = {meta: {mimetype: "image/jpeg"}, data: __imageResource("data:image/jpeg;base64,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")};
__resources__["/resources/girder.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,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")};
__resources__["/resources/steel_ball.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,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")};
__resources__["/resources/steel_ball_small.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,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")};/*globals module exports resource require window Module __main_module_name__ __resources__*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

function resource(path) {
    return __resources__[path].data;
}

(function () {
    var process = {};
    var modulePaths = ['/__builtin__', '/__builtin__/libs', '/libs', '/'];

    var path; // Will be loaded further down

    function resolveModulePath(request, parent) {
        // If not a relative path then search the modulePaths for it
        var start = request.substring(0, 2);
        if (start !== "./" && start !== "..") {
            return modulePaths;
        }

        var parentIsIndex = path.basename(parent.filename).match(/^index\.js$/),
            parentPath    = parentIsIndex ? parent.id : path.dirname(parent.id);

        // Relative path so searching inside parent's directory
        return [path.dirname(parent.filename)];
    }

    function findModulePath(id, dirs) {
        if (id.charAt(0) === '/') {
            dirs = [''];
        }
        for (var i = 0; i < dirs.length; i++) {
            var dir = dirs[i];
            var p = path.join(dir, id);

            // Check for index first
            if (path.exists(path.join(p, 'index.js'))) {
                return path.join(p, 'index.js');
            } else if (path.exists(p + '.js')) {
                return p + '.js';
            }
        }

        return false;
    }

    function loadModule(request, parent) {
        parent = parent || process.mainModule;

        var paths    = resolveModulePath(request, parent),
            filename = findModulePath(request, paths);

        if (filename === false) {
            throw "Unable to find module: " + request;
        }


        if (parent) {
            var cachedModule = parent.moduleCache[filename];
            if (cachedModule) {
                return cachedModule;
            }
        }

        //console.log('Loading module: ', filename);

        var module = new Module(filename, parent);

        // Assign main module to process
        if (request == __main_module_name__ && !process.mainModule) {
            process.mainModule = module;
        }

        // Run all the code in the module
        module._initialize(filename);

        return module;
    }

    function Module(id, parent) {
        this.id = id;
        this.parent = parent;
        this.children = [];
        this.exports = {};

        if (parent) {
            this.moduleCache = parent.moduleCache;
            parent.children.push(this);
        } else {
            this.moduleCache = {};
        }
        this.moduleCache[this.id] = this;

        this.filename = null;
        this.dirname = null;
    }

    Module.prototype._initialize = function (filename) {
        var module = this;
        function require(request) {
            return loadModule(request, module).exports;
        }

        this.filename = filename;

        // Work around incase this IS the path module
        if (path) {
            this.dirname = path.dirname(filename);
        } else {
            this.dirname = '';
        }

        require.paths = modulePaths;
        require.main = process.mainModule;

        __resources__[this.filename].data.apply(this.exports, [this.exports, require, this, this.filename, this.dirname]);

        return this;
    };

    // Manually load the path module because we need it to load other modules
    path = (new Module('path'))._initialize('/__builtin__/path.js').exports;

    var util = loadModule('util').exports;
    util.ready(function () {
        // Populate globals
        var globals = loadModule('global').exports;
        for (var x in globals) {
            if (globals.hasOwnProperty(x)) {
                window[x] = globals[x];
            }
        }

        process.mainModule = loadModule(__main_module_name__);
        if (process.mainModule.exports.main) {
            process.mainModule.exports.main();
        }

        // Add a global require. Useful in the debug console.
        window.require = function require(request, parent) {
            return loadModule(request, parent).exports;
        };
        window.require.main = process.mainModule;
        window.require.paths = modulePaths;

    });
})();

// vim:ft=javascript

})();
