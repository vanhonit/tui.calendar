/**
 * @fileoverview Base calendar controller
 * @author NHN Ent. FE Development Team <e0242@nhnent.com>
 */
'use strict';

var util = global.ne.util;
var datetime = require('../datetime');
var Collection = require('../common/collection');

/**
 * @constructor
 * @mixes util.CustomEvents
 */
function Base() {
    /*eslint-disable*/
    /**
     * events collection.
     * @type {Collection}
     */
    this.events = new Collection(function(event) {
        return util.stamp(event);
    });
    /*eslint-enable*/

    /**
     * Matrix for multidate events.
     * @type {object.<string, array>}
     */
    this.dateMatrix = {};
}

/**
 * Calculate contain dates in event.
 * @param {Event} event The instance of event.
 * @returns {array} contain dates.
 */
Base.prototype._getContainDatesInEvent = function(event) {
    var start = datetime.start(event.starts),
        end = datetime.start(event.ends),
        result = [];

    while (start <= end) {
        result.push(new Date(start.getTime()));
        start.setDate(start.getDate() + 1);
    }

    return result;
};

/**********
 * CRUD
 **********/

/**
 * Create an event instance from raw data.
 * @param {object} options Data object to create event.
 * @returns {Event} The instance of Event that created.
 */
Base.prototype.createEvent = function(options) {
    return this.addEvent(Event.create(options));
};

/**
 * Add an event instance.
 * @param {Event} event The instance of Event.
 * @returns {Event} The instance of Event that added.
 */
Base.prototype.addEvent = function(event) {
    var ownEvents = this.events,
        ownMatrix = this.dateMatrix,
        matrix,
        containDates = this._getContainDatesInEvent(event),
        dformat = datetime.format,
        stamp = util.stamp,
        ymd;

    ownEvents.add(event);

    util.forEach(containDates, function(date) {
        ymd = dformat(date, 'YYYYMMDD');
        matrix = ownMatrix[ymd];

        if (!matrix) {
            matrix = ownMatrix[ymd] = [];
        }

        matrix.push(stamp(event));
    });

    return event;
};


/**
 * Return events in supplied date range.
 *
 * available only YMD.
 * @param {Date} starts start date.
 * @param {Date} ends end date.
 * @returns {object.<string, Event[]>} events grouped by dates.
 */
Base.prototype.findByDateRange = function(starts, ends) {
    var start = datetime.start(starts),
        end = datetime.start(ends),
        ownEvents = this.events,
        items = ownEvents.items,

        ownMatrix = this.dateMatrix,
        matrix,

        result = {},
        target,

        dformat = datetime.format,
        ymd;

    while (start <= end) {
        ymd = dformat(start, 'YYYYMMDD');
        matrix = ownMatrix[ymd];

        if (matrix) {
            target = result[ymd] = [];

            /*eslint-disable*/
            util.forEachArray(matrix, function(id) {
                target.push(items[id]);
            });
            /*eslint-enable*/
        }

        start.setDate(start.getDate() + 1);
    }

    return result;
};

// Update
/**
 * Update an event.
 * @param {number} id The unique id of Event instance.
 * @param {object} options updated object data.
 * @returns {Event} The event instance updated.
 */
Base.prototype.updateEvent = function(id, options) {
    var result = false;

    this.events.doWhenHas(id, function(event) {
        options = options || {};

        if (options.title) {
            event.set('title', options.title);
        }

        if (options.isAllDay) {
            event.set('isAllDay', options.isAllDay);
        }

        if (options.starts) {
            event.set('starts', new Date(options.starts));
        }

        if (options.ends) {
            event.set('ends', new Date(options.ends));
        }

        //TODO: update matrix.

        result = event;
    });

    return result;
};

// Delete
Base.prototype.delete = function() {};

/**********
 * API
 **********/

Base.prototype.sync = function() {};
Base.prototype.fetch = function(query) {};

// mixin
util.CustomEvents.mixin(Base);

module.exports = Base;
