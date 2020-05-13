/**
 * @fileoverview mouseover handle module for daygrid schedules
 * @author Nghia Nguyen FE Development <nghiancqt@gmail.com>
 */
'use strict';

var util = require('tui-code-snippet');
var config = require('../../config');
var domutil = require('../../common/domutil');
var DayGridMove = require('./move');

/**
 * @constructor
 * @implements {Handler}
 * @mixes CustomEvents
 * @param {Drag} [dragHandler] - Drag handler instance.
 * @param {DayGrid} [view] - daygrid view instance.
 * @param {Base} [controller] - Base controller instance.
 */
function DayGridMouseOver(dragHandler, view, controller) {
    /**
     * @type {Drag}
     */
    this.dragHandler = dragHandler;

    /**
     * @type {DayGrid}
     */
    this.view = view;

    /**
     * @type {Base}
     */
    this.controller = controller;

    dragHandler.on({
        'mouseomove': this._onMouseMove
    }, this);
}

/**
 * Destroy handler module
 */
DayGridMouseOver.prototype.destroy = function() {
    this.dragHandler.off(this);
    this.view = this.controller = this.dragHandler = null;
};

/**
 * Check target element is expected condition for activate this plugins.
 * @param {HTMLElement} target - The element to check
 * @returns {string} - model id
 */
DayGridMouseOver.prototype.checkExpectCondition = DayGridMove.prototype.checkExpectedCondition;

/**
 * Mouseover event handler
 * @param {object} hoverEvent - click event data
 * @emits DayGridMouseOver#clickSchedule
 * @emits DayGridMouseOver#collapse
 * @emits DayGridMouseOver#expand
 */

DayGridMouseOver.prototype._onMouseMove = function(hoverEvent) {
    var self = this,
        target = hoverEvent.target,
        dayGridScheduleView = this.checkExpectCondition(target),
        scheduleCollection = this.controller.schedules,
        collapseBtnElement = domutil.closest(
            target,
            config.classname('.weekday-collapse-btn')
        ),
        expandBtnElement = domutil.closest(
            target,
            config.classname('.weekday-exceed-in-week')
        ),
        containsTarget = this.view.container.contains(target);
    var blockElement, scheduleElement;

    if (!containsTarget) {
        return;
    }

    if (collapseBtnElement) {
        /**
         * click collpase btn event
         * @events DayGridMouseOver#collapse
         */
        self.fire('collapse');

        return;
    }

    if (expandBtnElement) {
        this.view.setState({
            clickedExpandBtnIndex: parseInt(domutil.getData(expandBtnElement, 'index'), 10)
        });

        /**
         * click expand btn event
         * @events DayGridMouseOver#expand
         */
        self.fire('expand');

        return;
    }

    if (!dayGridScheduleView) {
        return;
    }

    scheduleElement = domutil.closest(target, config.classname('.weekday-schedule'));
    if (scheduleElement) {
        blockElement = domutil.closest(target, config.classname('.weekday-schedule-block'));
        scheduleCollection.doWhenHas(domutil.getData(blockElement, 'id'), function(schedule) {
            /**
             * @events DayGridMouseOver#hoverSchedule
             * @type {object}
             * @property {Schedule} schedule - schedule instance
             * @property {MouseEvent} event - MouseEvent object
             */
            self.fire('mousemove', {
                schedule: schedule,
                event: hoverEvent.originEvent
            });
        });
    }
};

util.CustomEvents.mixin(DayGridMouseOver);

module.exports = DayGridMouseOver;
