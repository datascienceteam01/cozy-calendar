(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    definition(module.exports, localRequire(name), module);
    var exports = cache[name] = module.exports;
    return exports;
  };

  var require = function(name) {
    var path = expand(name, '.');

    if (has(cache, path)) return cache[path];
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex];
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '"');
  };

  var define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.brunch = true;
})();

window.require.register("application", function(exports, require, module) {
  module.exports = {
    initialize: function() {
      var AlarmCollection, EventCollection, Router, SocketListener;
      Router = require('router');
      SocketListener = require('../lib/socket_listener');
      AlarmCollection = require('collections/alarms');
      EventCollection = require('collections/events');
      this.router = new Router();
      this.alarms = new AlarmCollection();
      this.events = new EventCollection();
      SocketListener.watch(this.alarms);
      SocketListener.watch(this.events);
      Backbone.history.start();
      if (typeof Object.freeze === 'function') {
        return Object.freeze(this);
      }
    }
  };
  
});
window.require.register("collections/alarms", function(exports, require, module) {
  var Alarm, AlarmCollection, ScheduleItemsCollection, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ScheduleItemsCollection = require('./scheduleitems');

  Alarm = require('../models/alarm');

  module.exports = AlarmCollection = (function(_super) {
    __extends(AlarmCollection, _super);

    function AlarmCollection() {
      _ref = AlarmCollection.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    AlarmCollection.prototype.model = Alarm;

    AlarmCollection.prototype.url = 'alarms';

    return AlarmCollection;

  })(ScheduleItemsCollection);
  
});
window.require.register("collections/events", function(exports, require, module) {
  var Event, EventCollection, ScheduleItemsCollection, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ScheduleItemsCollection = require('./scheduleitems');

  Event = require('../models/event');

  module.exports = EventCollection = (function(_super) {
    __extends(EventCollection, _super);

    function EventCollection() {
      _ref = EventCollection.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    EventCollection.prototype.model = Event;

    EventCollection.prototype.url = 'events';

    return EventCollection;

  })(ScheduleItemsCollection);
  
});
window.require.register("collections/scheduleitems", function(exports, require, module) {
  var CozyCollection, ScheduleItemsCollection, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  CozyCollection = require('../lib/cozy_collection');

  module.exports = ScheduleItemsCollection = (function(_super) {
    __extends(ScheduleItemsCollection, _super);

    function ScheduleItemsCollection() {
      _ref = ScheduleItemsCollection.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    ScheduleItemsCollection.prototype.comparator = function(si1, si2) {
      var d1, d2;
      d1 = si1.getDateObject();
      d2 = si2.getDateObject();
      if (d1.getTime() < d2.getTime()) {
        return -1;
      } else if (d1.getTime() === d2.getTime()) {
        return 0;
      } else {
        return 1;
      }
    };

    return ScheduleItemsCollection;

  })(CozyCollection);
  
});
window.require.register("helpers", function(exports, require, module) {
  exports.formatDateISO8601 = function(fullDate) {
    var date, time;
    fullDate = fullDate.split(/#/);
    if (fullDate[0].match(/([0-9]{2}\/){2}[0-9]{4}/)) {
      date = fullDate[0].split(/[\/]/);
      date = "" + date[2] + "-" + date[1] + "-" + date[0];
    } else {
      date = "undefined";
    }
    if (fullDate[1].match(/[0-9]{2}:[0-9]{2}/)) {
      time = fullDate[1].split(/:/);
      time = "" + time[0] + ":" + time[1] + ":00";
    } else {
      time = "undefined";
    }
    return "" + date + "T" + time;
  };

  exports.isDatePartValid = function(date) {
    date = date.split('T');
    return date[0].match(/[0-9]{8}/) != null;
  };

  exports.isTimePartValid = function(date) {
    date = date.split('T');
    return date[1].match(/[0-9]{6}Z/) != null;
  };

  exports.icalToISO8601 = function(icalDate) {
    var date, day, hours, minutes, month, year;
    date = icalDate.split('T');
    year = date[0].slice(0, 4);
    month = date[0].slice(4, 6);
    day = date[0].slice(6, 8);
    hours = date[1].slice(0, 2);
    minutes = date[1].slice(2, 4);
    return "" + year + "-" + month + "-" + day + "T" + hours + ":" + minutes + "Z";
  };

  exports.getPopoverDirection = function(isDayView, startDate) {
    var direction, selectedHour, selectedWeekDay;
    if (!isDayView) {
      selectedWeekDay = startDate.format('{weekday}');
      if (selectedWeekDay === 'friday' || selectedWeekDay === 'saturday' || selectedWeekDay === 'sunday') {
        direction = 'left';
      } else {
        direction = 'right';
      }
    } else {
      selectedHour = startDate.format('{HH}');
      if (selectedHour >= 4) {
        direction = 'top';
      } else {
        direction = 'bottom';
      }
    }
    return direction;
  };
  
});
window.require.register("initialize", function(exports, require, module) {
  var app;

  app = require('application');

  $(function() {
    require('lib/app_helpers');
    app.initialize();
    return $.fn.spin = function(opts, color) {
      var presets;
      presets = {
        tiny: {
          lines: 8,
          length: 2,
          width: 2,
          radius: 3
        },
        small: {
          lines: 8,
          length: 1,
          width: 2,
          radius: 5
        },
        large: {
          lines: 10,
          length: 8,
          width: 4,
          radius: 8
        }
      };
      if (Spinner) {
        return this.each(function() {
          var $this, spinner;
          $this = $(this);
          spinner = $this.data("spinner");
          if (spinner != null) {
            spinner.stop();
            return $this.data("spinner", null);
          } else if (opts !== false) {
            if (typeof opts === "string") {
              if (opts in presets) {
                opts = presets[opts];
              } else {
                opts = {};
              }
              if (color) {
                opts.color = color;
              }
            }
            spinner = new Spinner($.extend({
              color: $this.css("color")
            }, opts));
            spinner.spin(this);
            return $this.data("spinner", spinner);
          }
        });
      } else {
        console.log("Spinner class not available.");
        return null;
      }
    };
  });
  
});
window.require.register("lib/app_helpers", function(exports, require, module) {
  (function() {
    return (function() {
      var console, dummy, method, methods, _results;
      console = window.console = window.console || {};
      method = void 0;
      dummy = function() {};
      methods = 'assert,count,debug,dir,dirxml,error,exception,\
                   group,groupCollapsed,groupEnd,info,log,markTimeline,\
                   profile,profileEnd,time,timeEnd,trace,warn'.split(',');
      _results = [];
      while (method = methods.pop()) {
        _results.push(console[method] = console[method] || dummy);
      }
      return _results;
    })();
  })();
  
});
window.require.register("lib/cozy_collection", function(exports, require, module) {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  module.exports = exports.CozyCollection = (function(_super) {
    __extends(CozyCollection, _super);

    function CozyCollection() {
      _ref = CozyCollection.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    CozyCollection.prototype.move = function(item, newIndex) {
      var oldIndex;
      oldIndex = this.indexOf(item);
      if (oldIndex != null) {
        this.models.splice(newIndex, 0, this.models.splice(oldIndex, 1)[0]);
        return this.trigger("move", {
          'item': item,
          'oldIndex': oldIndex,
          'newIndex': newIndex
        });
      } else {
        return false;
      }
    };

    return CozyCollection;

  })(Backbone.Collection);
  
});
window.require.register("lib/socket_listener", function(exports, require, module) {
  var SocketListener, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  SocketListener = (function(_super) {
    __extends(SocketListener, _super);

    function SocketListener() {
      _ref = SocketListener.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    SocketListener.prototype.models = {
      'alarm': require('models/alarm')
    };

    SocketListener.prototype.events = ['alarm.create', 'alarm.update', 'alarm.delete'];

    SocketListener.prototype.onRemoteCreate = function(alarm) {
      return this.collection.add(alarm);
    };

    SocketListener.prototype.onRemoteDelete = function(alarm) {
      return this.collection.remove(alarm);
    };

    return SocketListener;

  })(CozySocketListener);

  module.exports = new SocketListener();
  
});
window.require.register("lib/view", function(exports, require, module) {
  var View, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  module.exports = View = (function(_super) {
    __extends(View, _super);

    function View() {
      _ref = View.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    View.prototype.template = function() {};

    View.prototype.initialize = function() {};

    View.prototype.render = function(templateOptions) {
      var render;
      this.beforeRender();
      render = this.template().call(null, templateOptions);
      this.$el.html(render);
      this.afterRender();
      return this;
    };

    View.prototype.beforeRender = function() {};

    View.prototype.afterRender = function() {};

    View.prototype.destroy = function() {
      this.undelegateEvents();
      this.$el.removeData().unbind();
      this.remove();
      return Backbone.View.prototype.remove.call(this);
    };

    return View;

  })(Backbone.View);
  
});
window.require.register("models/alarm", function(exports, require, module) {
  var Alarm, ScheduleItem, helpers, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  helpers = require('../helpers');

  ScheduleItem = require('./scheduleitem');

  module.exports = Alarm = (function(_super) {
    __extends(Alarm, _super);

    function Alarm() {
      _ref = Alarm.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Alarm.prototype.mainDateField = 'trigg';

    Alarm.prototype.urlRoot = 'alarms';

    Alarm.dateFormat = "{Dow} {Mon} {dd} {yyyy} {HH}:{mm}:00";

    Alarm.prototype.validate = function(attrs, options) {
      var allowedActions, errors;
      errors = [];
      if (!attrs.description || attrs.description === "") {
        errors.push({
          field: 'description',
          value: "A description must be set."
        });
      }
      if (!attrs.action || attrs.action === "") {
        errors.push({
          field: 'action',
          value: "An action must be set."
        });
      }
      allowedActions = ['DISPLAY', 'EMAIL'];
      if (allowedActions.indexOf(attrs.action) === -1) {
        errors.push({
          field: 'action',
          value: "A valid action must be set."
        });
      }
      if (!attrs.trigg || !new Date.create(attrs.trigg).isValid()) {
        errors.push({
          field: 'triggdate',
          value: "The date or time format might be invalid. " + "It must be dd/mm/yyyy and hh:mm."
        });
      }
      if (errors.length > 0) {
        return errors;
      }
    };

    return Alarm;

  })(ScheduleItem);
  
});
window.require.register("models/event", function(exports, require, module) {
  var Event, ScheduleItem, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ScheduleItem = require('./scheduleitem');

  module.exports = Event = (function(_super) {
    __extends(Event, _super);

    function Event() {
      _ref = Event.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Event.prototype.startDateField = 'start';

    Event.prototype.endDateField = 'end';

    Event.prototype.urlRoot = 'events';

    Event.prototype.validate = function(attrs, options) {
      var errors;
      errors = [];
      if (!attrs.description) {
        errors.push({
          field: 'description',
          value: "A description must be set."
        });
      }
      if (!attrs.place) {
        errors.push({
          field: 'place',
          value: "An Place must be set."
        });
      }
      if (!attrs.start || !new Date.create(attrs.start).isValid()) {
        errors.push({
          field: 'startdate',
          value: "The date or time format might be invalid. " + "It must be dd/mm/yyyy and hh:mm."
        });
      }
      if (!attrs.end || !new Date.create(attrs.end).isValid()) {
        errors.push({
          field: 'enddate',
          value: "The date or time format might be invalid. " + "It must be dd/mm/yyyy and hh:mm."
        });
      }
      /*if attrs.start > attrs.end
          console.log "pb start - end"
          errors.push
              field: 'date'
              value: "The start date might be inferor than end date  " + \
                    "It must be dd/mm/yyyy and hh:mm."
      */

      if (errors.length > 0) {
        return errors;
      }
    };

    Event.prototype.getStartDateObject = function() {
      if (this.startDateObject == null) {
        this.startDateObject = new Date.create(this.get(this.startDateField));
      }
      return this.startDateObject;
    };

    Event.prototype.getFormattedStartDate = function(formatter) {
      return this.getStartDateObject().format(formatter);
    };

    Event.prototype.getEndDateObject = function() {
      if (this.endDateObject == null) {
        this.endDateObject = new Date.create(this.get(this.endDateField));
      }
      return this.endDateObject;
    };

    Event.prototype.getFormattedEndDate = function(formatter) {
      return this.getEndDateObject().format(formatter);
    };

    return Event;

  })(ScheduleItem);
  
});
window.require.register("models/scheduleitem", function(exports, require, module) {
  var ScheduleItem, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  module.exports = ScheduleItem = (function(_super) {
    __extends(ScheduleItem, _super);

    function ScheduleItem() {
      _ref = ScheduleItem.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    ScheduleItem.prototype.mainDateField = '';

    ScheduleItem.dateFormat = "{Dow} {Mon} {dd} {yyyy} {HH}:{mm}:00";

    ScheduleItem.prototype.getDateObject = function() {
      if (this.dateObject == null) {
        this.dateObject = new Date.create(this.get(this.mainDateField));
      }
      return this.dateObject;
    };

    ScheduleItem.prototype.getFormattedDate = function(formatter) {
      return Date.create(this.get(this.mainDateField)).format(formatter);
    };

    ScheduleItem.prototype.getPreviousDateObject = function() {
      if (this.previous(this.mainDateField) != null) {
        return new Date.create(this.previous(this.mainDateField));
      } else {
        return false;
      }
    };

    ScheduleItem.prototype.getDateHash = function(date) {
      if (date == null) {
        date = this.getDateObject();
      }
      return date.format('{yyyy}{MM}{dd}');
    };

    ScheduleItem.prototype.getPreviousDateHash = function() {
      var previousDateObject;
      previousDateObject = this.getPreviousDateObject();
      if (previousDateObject) {
        return this.getDateHash(previousDateObject);
      } else {
        return false;
      }
    };

    ScheduleItem.prototype.getTimeHash = function(date) {
      if (date == null) {
        date = this.getDateObject();
      }
      return date.format('{yyyy}{MM}{dd}{HH}{mm}');
    };

    ScheduleItem.prototype.getPreviousTimeHash = function() {
      var previousDateObject;
      previousDateObject = this.getPreviousDateObject();
      if (previousDateObject) {
        return this.getTimeHash(previousDateObject);
      } else {
        return false;
      }
    };

    return ScheduleItem;

  })(Backbone.Model);
  
});
window.require.register("router", function(exports, require, module) {
  var AlarmCollection, CalendarView, ListView, Router, app, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  app = require('application');

  ListView = require('views/list_view');

  CalendarView = require('views/calendar_view');

  AlarmCollection = require('collections/alarms');

  module.exports = Router = (function(_super) {
    __extends(Router, _super);

    function Router() {
      this.displayView = __bind(this.displayView, this);
      _ref = Router.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Router.prototype.routes = {
      '': 'calendar',
      'calendar': 'calendar',
      'list': 'alarmsList'
    };

    Router.prototype.calendar = function() {
      this.displayView(CalendarView, app.alarms, app.events);
      this.handleFetch("modelAlarm", "alarms");
      return this.handleFetch("modelEvent", "events");
    };

    Router.prototype.alarmsList = function() {
      this.displayView(ListView, app.alarms, null);
      return this.handleFetch("model", "alarms");
    };

    Router.prototype.handleFetch = function(model, name) {
      if (!(app[name].length > 0)) {
        return this.mainView[model].fetch({
          success: function(collection, response, options) {
            console.log(collection);
            return console.log("Fetch: success");
          },
          error: function() {
            return console.log("Fetch: error");
          }
        });
      } else {
        return this.mainView[model].reset(app[name].toJSON());
      }
    };

    Router.prototype.displayView = function(classView, alarmsCollection, eventsCollection) {
      var container;
      if (this.mainView) {
        this.mainView.remove();
      }
      container = $(document.createElement('div'));
      container.prop('id', 'viewContainer');
      $('body').prepend(container);
      if (eventsCollection === null) {
        this.mainView = new classView({
          model: alarmsCollection
        });
      } else {
        this.mainView = new classView(alarmsCollection, eventsCollection);
      }
      return this.mainView.render();
    };

    return Router;

  })(Backbone.Router);
  
});
window.require.register("views/alarm_popover", function(exports, require, module) {
  var Alarm, AlarmPopOver, EventPopOver, View, eventFormSmallTemplate,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('../lib/view');

  Alarm = require('../models/alarm');

  EventPopOver = require('./event_popover');

  eventFormSmallTemplate = require('./templates/event_form_small');

  module.exports = AlarmPopOver = (function(_super) {
    __extends(AlarmPopOver, _super);

    function AlarmPopOver(cal) {
      this.cal = cal;
      this.onEditAlarmClicked = __bind(this.onEditAlarmClicked, this);
      this.onEventButtonClicked = __bind(this.onEventButtonClicked, this);
      this.onAlarmButtonClicked = __bind(this.onAlarmButtonClicked, this);
      this.onRemoveAlarmClicked = __bind(this.onRemoveAlarmClicked, this);
      this.bindEditEvents = __bind(this.bindEditEvents, this);
      this.bindEvents = __bind(this.bindEvents, this);
    }

    AlarmPopOver.prototype.clean = function() {
      var _ref, _ref1;
      if ((_ref = this.field) != null) {
        _ref.popover('destroy');
      }
      this.field = null;
      this.date = null;
      this.action = null;
      if (this.popoverWidget != null) {
        this.popoverWidget.find('button.close').unbind('click');
        this.popoverWidget.find('button.add-alarm').unbind('click');
        this.popoverWidget.find('button.add-event').unbind('click');
        this.popoverWidget.find('input').unbind('keyup');
        return (_ref1 = this.popoverWidget) != null ? _ref1.hide() : void 0;
      }
    };

    AlarmPopOver.prototype.createNew = function(data) {
      this.clean();
      this.field = data.field;
      this.date = data.date;
      this.action = data.action;
      this.model = data.model;
      this.modelEvent = data.modelEvent;
      return this.event = data.event;
    };

    AlarmPopOver.prototype.show = function(title, direction, content) {
      this.field.popover({
        title: '<span>' + title + '&nbsp;<i class="alarm-remove ' + 'icon-trash" /></span> <button type="button" class="close">' + '&times;</button>',
        html: true,
        placement: direction,
        content: content
      }).popover('show');
      this.popoverWidget = $('.container .popover');
      this.popoverWidget.find('input').focus();
      if (this.action === 'create') {
        return $('.alarm-remove').hide();
      } else {
        return $('.alarm-remove').show();
      }
    };

    AlarmPopOver.prototype.bindEvents = function() {
      var _this = this;
      this.popoverWidget = $('.container .popover');
      this.addAlarmButton = this.popoverWidget.find('button.add-alarm');
      this.addAlarmButton.html(this.action);
      this.addEventButton = this.popoverWidget.find('button.add-event');
      this.popoverWidget.find('button.close').click(function() {
        return _this.clean();
      });
      this.addAlarmButton.click(function() {
        return _this.onAlarmButtonClicked();
      });
      this.addEventButton.click(function() {
        return _this.onEventButtonClicked();
      });
      this.alarmDescription = this.popoverWidget.find('input');
      return this.alarmDescription.keyup(function(event) {
        if (_this.alarmDescription.val() === '') {
          return _this.addAlarmButton.addClass('disabled');
        } else if (event.keyCode === 13 || event.which === 13) {
          return _this.onAlarmButtonClicked();
        } else {
          return _this.addAlarmButton.removeClass('disabled');
        }
      });
    };

    AlarmPopOver.prototype.bindEditEvents = function() {
      var _this = this;
      this.popoverWidget = $('.container .popover');
      this.addAlarmButton = this.popoverWidget.find('button.add-alarm');
      this.addEventButton = this.popoverWidget.find('button.add-event');
      this.closeButton = this.popoverWidget.find('button.close');
      this.removeButton = this.popoverWidget.find('.alarm-remove');
      this.alarmDescription = this.popoverWidget.find('input');
      this.addAlarmButton.html(this.action);
      this.closeButton.click(function() {
        return _this.clean();
      });
      this.addAlarmButton.click(function() {
        return _this.onEditAlarmClicked();
      });
      this.removeButton.click(function() {
        return _this.onRemoveAlarmClicked();
      });
      return this.alarmDescription.keyup(function(event) {
        if (_this.alarmDescription.val() === '') {
          return _this.addAlarmButton.addClass('disabled');
        } else if (event.keyCode === 13 || event.which === 13) {
          return _this.onEditAlarmClicked();
        } else {
          return _this.addAlarmButton.removeClass('disabled');
        }
      });
    };

    AlarmPopOver.prototype.onRemoveAlarmClicked = function() {
      var alarm,
        _this = this;
      alarm = this.model.get(this.event.id);
      this.removeButton.css('width', '42px');
      this.removeButton.spin('tiny');
      return alarm.destroy({
        success: function() {
          _this.cal.fullCalendar('removeEvents', _this.event.id);
          _this.removeButton.spin();
          _this.removeButton.css('width', '14px');
          return _this.clean();
        },
        error: function() {
          this.removeButton.spin();
          this.removeButton.css('width', '14px');
          return this.clean();
        }
      });
    };

    AlarmPopOver.prototype.onAlarmButtonClicked = function() {
      var data, dueDate, smartDetection, specifiedTime, value,
        _this = this;
      dueDate = Date.create(this.date);
      if (dueDate.format('{HH}:{mm}') === '00:00') {
        dueDate.advance({
          hours: 8
        });
      }
      value = this.popoverWidget.find('input').val();
      smartDetection = value.match(/([0-9]?[0-9]:[0-9]{2})/);
      if ((smartDetection != null) && (smartDetection[1] != null)) {
        specifiedTime = smartDetection[1];
        specifiedTime = specifiedTime.split(/:/);
        dueDate.set({
          hours: specifiedTime[0],
          minutes: specifiedTime[1]
        });
        value = value.replace(/(( )?((at|à) )?[0-9]?[0-9]:[0-9]{2})/, '');
        value = value.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
      }
      data = {
        description: value,
        action: 'DISPLAY',
        trigg: dueDate.format(Alarm.dateFormat)
      };
      this.addAlarmButton.html('&nbsp;');
      this.addAlarmButton.spin('small');
      return this.model.create(data, {
        wait: true,
        success: function() {
          _this.clean();
          _this.addAlarmButton.spin();
          return _this.addAlarmButton.html(_this.action);
        },
        error: function() {
          _this.clean();
          _this.addAlarmButton.spin();
          return _this.addAlarmButton.html(_this.action);
        }
      });
    };

    AlarmPopOver.prototype.onEventButtonClicked = function() {
      var eventFormTemplate;
      this.field.popover('destroy').popover();
      this.pop = new EventPopOver(this.cal);
      this.pop.createNew({
        field: this.field,
        date: this.date,
        action: 'create',
        model: this.modelEvent
      });
      eventFormTemplate = eventFormSmallTemplate({
        editionMode: false,
        defaultValueStart: '',
        defaultValueEnd: '',
        defaultValuePlace: '',
        defaultValueDesc: ''
      });
      this.pop.show("Event creation", this.direction, eventFormTemplate);
      return this.pop.bindEvents(this.date);
    };

    AlarmPopOver.prototype.onEditAlarmClicked = function() {
      var alarm, data,
        _this = this;
      alarm = this.model.get(this.event.id);
      data = {
        description: this.alarmDescription.val()
      };
      this.cal.fullCalendar('renderEvent', this.event);
      this.addAlarmButton.html('&nbsp;');
      this.addAlarmButton.spin('small');
      return alarm.save(data, {
        wait: true,
        success: function() {
          _this.event.title = data.description;
          _this.cal.fullCalendar('renderEvent', _this.event);
          _this.addAlarmButton.spin();
          return _this.addAlarmButton.html(_this.action);
        },
        error: function() {
          this.cal.fullCalendar('renderEvent', this.event);
          this.addAlarmButton.spin();
          return this.addAlarmButton.html(this.action);
        }
      });
    };

    return AlarmPopOver;

  })(View);
  
});
window.require.register("views/alarm_view", function(exports, require, module) {
  var AlarmView, ScheduleElement, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ScheduleElement = require('./schedule_element');

  module.exports = AlarmView = (function(_super) {
    __extends(AlarmView, _super);

    function AlarmView() {
      _ref = AlarmView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    AlarmView.prototype.render = function() {
      return AlarmView.__super__.render.call(this, {
        action: this.model.get('action'),
        time: this.model.getFormattedDate('{HH}:{mm}'),
        description: this.model.get('description'),
        alarmID: this.model.id
      });
    };

    AlarmView.prototype.template = function() {
      return require('./templates/alarm');
    };

    return AlarmView;

  })(ScheduleElement);
  
});
window.require.register("views/alarmform_view", function(exports, require, module) {
  var AlarmFormView, View, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('../lib/view');

  module.exports = AlarmFormView = (function(_super) {
    __extends(AlarmFormView, _super);

    function AlarmFormView() {
      this.onSubmit = __bind(this.onSubmit, this);
      _ref = AlarmFormView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    AlarmFormView.prototype.el = '#add-alarm';

    AlarmFormView.prototype.events = {
      'focus #inputDesc': 'onFocus',
      'blur #alarm-description-input': 'onBlur',
      'keyup #alarm-description-input': 'onKeydown',
      'click .add-alarm': 'onSubmit'
    };

    AlarmFormView.prototype.initialize = function() {
      this.actions = {
        'DISPLAY': 'Popup',
        'EMAIL': 'Email'
      };
      this.data = null;
      return this.editionMode = false;
    };

    AlarmFormView.prototype.render = function() {
      var content, todayDate;
      todayDate = Date.create('now');
      content = AlarmFormView.__super__.render.call(this, {
        actions: this.actions,
        defaultAction: this.getDefaultAction('DISPLAY'),
        defaultDate: todayDate.format('{dd}/{MM}/{yyyy}'),
        defaultTime: todayDate.format('{HH}:{mm}')
      });
      this.$el.append(content);
      this.$el.parent().css('min-height', this.$el.height() + 40);
      return this.$el.affix({
        offset: {
          top: this.$el.offset().top - 10
        }
      });
    };

    AlarmFormView.prototype.afterRender = function() {
      var datePicker;
      this.descriptionField = this.$('#alarm-description-input');
      this.actionField = this.$('#action');
      this.dateField = this.$('#inputDate input');
      this.timeField = this.$('#inputTime');
      this.addAlarmButton = this.$('button.add-alarm');
      this.disableSubmitButton();
      this.validationMapper = {
        action: {
          field: this.actionField,
          placement: 'left'
        },
        description: {
          field: this.descriptionField,
          placement: 'top'
        },
        triggdate: {
          field: this.$('#date-control'),
          placement: 'bottom'
        }
      };
      datePicker = this.dateField.datepicker({
        weekStart: 1,
        format: 'dd/mm/yyyy'
      });
      datePicker.on('changeDate', function() {
        return $(this).datepicker('hide');
      });
      this.timeField.timepicker({
        minuteStep: 1,
        showMeridian: false
      });
      return this.descriptionField.focus();
    };

    AlarmFormView.prototype.template = function() {
      return require('./templates/alarm_form');
    };

    AlarmFormView.prototype.getDefaultAction = function(defaultAction) {
      var action, actionsAlreadySelected, selectedOptions;
      if (typeof defaultDefaultAction === "undefined" || defaultDefaultAction === null) {
        defaultAction = 'DISPLAY';
      }
      selectedOptions = this.$('.controls.form-inline option').filter(':selected');
      actionsAlreadySelected = [];
      selectedOptions.each(function(index, item) {
        var itemValue;
        itemValue = $(item).val();
        if (actionsAlreadySelected.indexOf(itemValue) === -1) {
          return actionsAlreadySelected.push(itemValue);
        }
      });
      for (action in this.actions) {
        if (actionsAlreadySelected.indexOf(action) === -1) {
          return action;
        }
      }
      return defaultAction;
    };

    AlarmFormView.prototype.onKeydown = function(event) {
      console.log(event.keyCode);
      if (this.descriptionField.val() === '') {
        return this.disableSubmitButton();
      } else if (event.keyCode === 13 || event.which === 13) {
        return this.onSubmit();
      } else {
        return this.enableSubmitButton();
      }
    };

    AlarmFormView.prototype.enableSubmitButton = function() {
      return this.addAlarmButton.removeClass('disabled');
    };

    AlarmFormView.prototype.disableSubmitButton = function() {
      return this.addAlarmButton.addClass('disabled');
    };

    AlarmFormView.prototype.loadAlarmData = function(alarm) {
      this.resetForm();
      this.descriptionField.val(alarm.get('description'));
      this.dateField.val(alarm.getFormattedDate('{dd}/{MM}/{yyyy}'));
      this.timeField.val(alarm.getFormattedDate('{HH}:{mm}'));
      this.data = alarm;
      this.editionMode = true;
      this.addAlarmButton.html('Edit the alarm');
      return this.enableSubmitButton();
    };

    AlarmFormView.prototype.resetForm = function() {
      var todayDate;
      this.data = null;
      this.editionMode = false;
      this.addAlarmButton.html('add the alarm');
      this.disableSubmitButton();
      this.descriptionField.val('');
      todayDate = new Date.create('now');
      this.dateField.val(todayDate.format('{dd}/{MM}/{yyyy}'));
      this.timeField.val(todayDate.format('{HH}:{mm}'));
      return this.resetErrors();
    };

    AlarmFormView.prototype.displayErrors = function(validationErrors) {
      var _this = this;
      return validationErrors.forEach(function(err) {
        var data;
        data = _this.validationMapper[err.field];
        return data.field.tooltip({
          title: err.value,
          placement: data.placement,
          container: _this.$el,
          trigger: 'manual'
        }).tooltip('show');
      });
    };

    AlarmFormView.prototype.resetErrors = function() {
      var index, mappedElement, _ref1, _results;
      _ref1 = this.validationMapper;
      _results = [];
      for (index in _ref1) {
        mappedElement = _ref1[index];
        _results.push(mappedElement.field.tooltip('destroy'));
      }
      return _results;
    };

    AlarmFormView.prototype.onSubmit = function() {
      return this.resetErrors();
    };

    return AlarmFormView;

  })(View);
  
});
window.require.register("views/alarms_list_view", function(exports, require, module) {
  var Alarm, AlarmCollection, AlarmsListView, DayProgramView, View, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('../lib/view');

  DayProgramView = require('./dayprogram_view');

  AlarmCollection = require('../collections/alarms');

  Alarm = require('../models/alarm');

  module.exports = AlarmsListView = (function(_super) {
    __extends(AlarmsListView, _super);

    function AlarmsListView() {
      _ref = AlarmsListView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    AlarmsListView.prototype.el = '#alarms';

    AlarmsListView.prototype.initialize = function() {
      this.listenTo(this.model, "add", this.onAdd);
      this.listenTo(this.model, "change", this.onChange);
      this.listenTo(this.model, "remove", this.onRemove);
      this.listenTo(this.model, "reset", this.onReset);
      this.views = {};
      this.dayPrograms = new Backbone.Collection;
      this.dayPrograms.comparator = function(dayProg1, dayProg2) {
        var d1, d2;
        d1 = new Date.create(dayProg1.get('date'));
        d2 = new Date.create(dayProg2.get('date'));
        if (d1.getTime() < d2.getTime()) {
          return -1;
        } else if (d1.getTime() === d2.getTime()) {
          return 0;
        } else {
          return 1;
        }
      };
      return this.listenTo(this.dayPrograms, "remove", this.onRemoveDayProgram);
    };

    AlarmsListView.prototype.onReset = function() {
      var _this = this;
      return this.model.forEach(function(item) {
        return _this.onAdd(item, _this.model);
      });
    };

    AlarmsListView.prototype.onAdd = function(alarm, alarms) {
      var dateHash, view,
        _this = this;
      dateHash = alarm.getDateHash();
      view = this.getSubView(dateHash, function() {
        return _this._getNewSubView(dateHash, alarm);
      });
      return view.model.get('alarms').add(alarm);
    };

    AlarmsListView.prototype.onChange = function(alarm) {
      var dateHash, prevDateHash, prevView, view,
        _this = this;
      dateHash = alarm.getDateHash();
      view = this.getSubView(dateHash, function() {
        _this.onAdd(alarm);
        return false;
      });
      prevDateHash = alarm.getPreviousDateHash();
      if ((alarm.changedAttributes().trigg != null) && prevDateHash !== dateHash) {
        prevView = this.views[prevDateHash];
        return prevView.model.get('alarms').remove(alarm);
      }
    };

    AlarmsListView.prototype.onRemoveDayProgram = function(dayProgram) {
      var dateHash;
      dateHash = dayProgram.get('dateHash');
      this.views[dateHash].destroy();
      return delete this.views[dateHash];
    };

    AlarmsListView.prototype.onRemove = function(alarm) {
      var dateHash, view,
        _this = this;
      console.log('remove alarm now');
      dateHash = alarm.getDateHash();
      view = this.getSubView(dateHash, function() {
        return null;
      });
      if (view != null) {
        return view.model.get('alarms').remove(alarm);
      }
    };

    AlarmsListView.prototype.getSubView = function(dateHash, callbackIfNotExist) {
      var tmp;
      if (this.views[dateHash] != null) {
        return this.views[dateHash];
      } else {
        tmp = callbackIfNotExist();
        if (tmp instanceof DayProgramView) {
          return this.views[dateHash] = tmp;
        } else {
          return false;
        }
      }
    };

    AlarmsListView.prototype._getNewSubView = function(dateHash, alarm) {
      var date;
      date = alarm.getDateObject().beginningOfDay();
      this._buildSubView(dateHash, date);
      return this._renderSubView(dateHash);
    };

    AlarmsListView.prototype._buildSubView = function(dateHash, date) {
      var model;
      model = new Backbone.Model({
        date: date,
        dateHash: dateHash,
        alarms: new AlarmCollection()
      });
      this.dayPrograms.add(model);
      return this.views[dateHash] = new DayProgramView({
        id: dateHash,
        model: model
      });
    };

    AlarmsListView.prototype._renderSubView = function(dateHash) {
      var index, render, selector, view;
      view = this.views[dateHash];
      index = index = this.dayPrograms.indexOf(view.model);
      render = view.render().$el;
      if (index === 0) {
        this.$el.prepend(render);
      } else if (index === this.dayPrograms.length - 1) {
        this.$el.append(render);
      } else {
        selector = "." + view.className + ":nth-of-type(" + (index + 1) + ")";
        this.$el.find(selector).before(render);
      }
      return view;
    };

    return AlarmsListView;

  })(View);
  
});
window.require.register("views/calendar_view", function(exports, require, module) {
  var Alarm, AlarmFormView, AlarmPopOver, AlarmsListView, CalendarView, Event, EventPopOver, View, alarmFormSmallTemplate, eventFormSmallTemplate, helpers, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('../lib/view');

  AlarmFormView = require('./alarmform_view');

  AlarmPopOver = require('./alarm_popover');

  AlarmsListView = require('../views/alarms_list_view');

  EventPopOver = require('./event_popover');

  helpers = require('../helpers');

  Alarm = require('../models/alarm');

  Event = require('../models/event');

  alarmFormSmallTemplate = require('./templates/alarm_form_small');

  eventFormSmallTemplate = require('./templates/event_form_small');

  module.exports = CalendarView = (function(_super) {
    __extends(CalendarView, _super);

    function CalendarView() {
      this.onEventClick = __bind(this.onEventClick, this);
      this.onEventDrop = __bind(this.onEventDrop, this);
      this.onSelect = __bind(this.onSelect, this);
      _ref = CalendarView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    CalendarView.prototype.el = '#viewContainer';

    CalendarView.prototype.initialize = function(alarm, evt) {
      this.caldata = {};
      this.modelAlarm = alarm;
      this.modelEvent = evt;
      this.listenTo(this.modelAlarm, 'add', this.onAddAlarm);
      this.listenTo(this.modelAlarm, 'reset', this.onResetAlarm);
      this.listenTo(this.modelEvent, 'add', this.onAddEvent);
      return this.listenTo(this.modelEvent, 'reset', this.onResetEvent);
    };

    CalendarView.prototype.template = function() {
      return require('./templates/calendarview');
    };

    CalendarView.prototype.afterRender = function() {
      this.cal = this.$('#alarms').fullCalendar({
        header: {
          left: 'prev,next today',
          center: 'title',
          right: 'month,agendaWeek,agendaDay'
        },
        editable: true,
        firstDay: 1,
        weekMode: 'liquid',
        aspectRatio: 2.031,
        defaultView: 'month',
        columnFormat: {
          month: 'dddd',
          week: 'ddd dd/MM',
          day: 'dddd dd/MM'
        },
        timeFormat: {
          '': 'HH:mm',
          'agenda': 'HH:mm{ - HH:mm}'
        },
        axisFormat: 'HH:mm',
        buttonText: {
          today: 'Today',
          month: 'Month',
          week: 'Week',
          day: 'Day'
        },
        selectable: true,
        selectHelper: false,
        unselectAuto: false,
        eventRender: this.onRender,
        viewDisplay: this.deletePopOver,
        select: this.onSelect,
        eventDragStop: this.onEventDragStop,
        eventDrop: this.onEventDrop,
        eventClick: this.onEventClick
      });
      this.popover = new AlarmPopOver(this.cal);
      return this.popoverEvent = new EventPopOver(this.cal);
    };

    CalendarView.prototype.onAddAlarm = function(alarm, alarms) {
      var content, endAlarm, event, index, time;
      index = alarm.getFormattedDate("{MM}-{dd}-{yyyy}");
      time = alarm.getFormattedDate("{hh}:{mm}");
      content = "" + time + " " + (alarm.get("description"));
      endAlarm = alarm.getDateObject().clone();
      endAlarm.advance({
        minutes: 30
      });
      event = {
        id: alarm.cid,
        title: alarm.get('description'),
        start: alarm.getFormattedDate(Date.ISO8601_DATETIME),
        end: endAlarm.format(Date.ISO8601_DATETIME),
        allDay: false,
        backgroundColor: '#5C5',
        borderColor: '#5C5',
        type: 'alarm'
      };
      return this.cal.fullCalendar('addEventSource', [event]);
    };

    CalendarView.prototype.onResetAlarm = function() {
      var _this = this;
      return this.modelAlarm.forEach(function(item) {
        return _this.onAddAlarm(item, _this.modelAlarm);
      });
    };

    CalendarView.prototype.onAddEvent = function(evt, events) {
      var content, endEvt, event, index, time;
      index = evt.getFormattedDate("{MM}-{dd}-{yyyy}");
      time = evt.get("start");
      content = "" + time + " " + (evt.get("description"));
      endEvt = evt.get("end");
      event = {
        id: evt.cid,
        title: evt.get('description'),
        start: evt.getFormattedStartDate(Date.ISO8601_DATETIME),
        end: evt.getFormattedEndDate(Date.ISO8601_DATETIME),
        diff: evt.get("diff"),
        place: evt.get('place'),
        allDay: false,
        backgroundColor: '#EB1',
        borderColor: '#EB1',
        type: 'event'
      };
      return this.cal.fullCalendar('addEventSource', [event]);
    };

    CalendarView.prototype.onResetEvent = function() {
      var _this = this;
      return this.modelEvent.forEach(function(item) {
        return _this.onAddEvent(item, _this.modelEvent);
      });
    };

    CalendarView.prototype.onSelect = function(startDate, endDate, allDay, jsEvent, view) {
      this.popover.clean();
      if (view.name === "month") {
        return this.handleSelectionInView(startDate, endDate, allDay, jsEvent);
      } else if (view.name === "agendaWeek") {
        return this.handleSelectionInView(startDate, endDate, allDay, jsEvent);
      } else if (view.name === "agendaDay") {
        return this.handleSelectionInView(startDate, endDate, allDay, jsEvent, true);
      }
    };

    CalendarView.prototype.onRender = function(event, element) {
      var selector, spinTarget;
      if (event.type === 'alarm') {
        selector = '.ui-resizable-handle.ui-resizable-s';
        $(element).find(selector).remove();
      }
      if (event.type === 'event') {
        selector = '.ui-resizable-handle.ui-resizable-s';
        $(element).find(selector).remove();
      }
      if ((event.isSaving != null) && event.isSaving) {
        spinTarget = $(element).find('.fc-event-time');
        spinTarget.addClass('spinning');
        spinTarget.html("&nbsp;");
        spinTarget.spin("tiny");
      }
      return element;
    };

    CalendarView.prototype.onEventDragStop = function(event, jsEvent, ui, view) {
      return event.isSaving = true;
    };

    CalendarView.prototype.onEventDrop = function(event, dayDelta, minuteDelta, allDay, revertFunc, jsEvent, ui, view) {
      var alarm, data, evt,
        _this = this;
      if (event.type === 'alarm') {
        alarm = this.modelAlarm.get(event.id);
        alarm.getDateObject().advance({
          days: dayDelta,
          minutes: minuteDelta
        });
        data = {
          trigg: alarm.getFormattedDate(Alarm.dateFormat)
        };
        return alarm.save(data, {
          wait: true,
          success: function() {
            event.isSaving = false;
            return _this.cal.fullCalendar('renderEvent', event);
          },
          error: function() {
            event.isSaving = false;
            this.cal.fullCalendar('renderEvent', event);
            return revertFunc();
          }
        });
      } else {
        evt = this.modelEvent.get(event.id);
        evt.getStartDateObject().advance({
          days: dayDelta,
          minutes: minuteDelta
        });
        evt.getEndDateObject().advance({
          days: dayDelta,
          minutes: minuteDelta
        });
        data = {
          start: evt.getFormattedStartDate(Event.dateFormat),
          end: evt.getFormattedEndDate(Event.dateFormat)
        };
        return evt.save(data, {
          wait: true,
          success: function() {
            event.isSaving = false;
            return _this.cal.fullCalendar('renderEvent', event);
          },
          error: function() {
            event.isSaving = false;
            this.cal.fullCalendar('renderEvent', event);
            return revertFunc();
          }
        });
      }
    };

    CalendarView.prototype.onEventClick = function(event, jsEvent, view) {
      var defaultValueEnd, diff, direction, endDate, eventStartTime, formTemplate, isDayView, startDate, target, _ref1, _ref2;
      target = $(jsEvent.currentTarget);
      eventStartTime = event.start.getTime();
      isDayView = view.name === 'agendaDay';
      direction = helpers.getPopoverDirection(isDayView, event.start);
      if (event.type === 'alarm') {
        this.popoverEvent.clean();
        if (!((this.popover.isExist != null) && this.popover.action === 'edit' && ((_ref1 = this.popover.date) != null ? _ref1.getTime() : void 0) === eventStartTime)) {
          this.popover.createNew({
            field: $(target),
            date: event.start,
            action: 'edit',
            model: this.modelAlarm,
            event: event
          });
          formTemplate = alarmFormSmallTemplate({
            editionMode: true,
            defaultValue: event.title
          });
          this.popover.show("Alarm edition", direction, formTemplate);
        }
        return this.popover.bindEditEvents();
      } else {
        this.popover.clean();
        if (!((this.popoverEvent.isExist != null) && this.popoverEvent.action === 'edit' && ((_ref2 = this.popoverEvent.date) != null ? _ref2.getTime() : void 0) === eventStartTime)) {
          this.popoverEvent.createNew({
            field: $(target),
            date: event.start,
            action: 'edit',
            model: this.modelEvent,
            event: event
          });
          startDate = event.start.format('{yy}:{MM}:{dd}').split(":");
          endDate = event.end.format('{yy}:{MM}:{dd}').split(":");
          diff = event.diff;
          defaultValueEnd = event.end.format('{HH}:{mm}') + "+" + diff;
          formTemplate = eventFormSmallTemplate({
            editionMode: true,
            defaultValueStart: event.start.format('{HH}:{mm}'),
            defaultValueEnd: defaultValueEnd,
            defaultValuePlace: event.place,
            defaultValueDesc: event.title
          });
          this.popoverEvent.show("Event edition", direction, formTemplate);
        }
        return this.popoverEvent.bindEditEvents();
      }
    };

    CalendarView.prototype.handleSelectionInView = function(startDate, endDate, allDay, jsEvent, isDayView) {
      var alarmFormTemplate, direction, target;
      target = $(jsEvent.target);
      direction = helpers.getPopoverDirection(isDayView, startDate);
      this.popover.createNew({
        field: $(target),
        date: startDate,
        action: 'create',
        model: this.modelAlarm,
        modelEvent: this.modelEvent
      });
      alarmFormTemplate = alarmFormSmallTemplate({
        editionMode: false,
        defaultValue: ''
      });
      this.popover.show("Alarm creation", direction, alarmFormTemplate);
      return this.popover.bindEvents(startDate);
    };

    return CalendarView;

  })(View);
  
});
window.require.register("views/dayprogram_view", function(exports, require, module) {
  var AlarmCollection, AlarmView, DayProgramView, View, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('../lib/view');

  AlarmView = require('./alarm_view');

  AlarmCollection = require('../collections/alarms');

  module.exports = DayProgramView = (function(_super) {
    __extends(DayProgramView, _super);

    function DayProgramView() {
      _ref = DayProgramView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    DayProgramView.prototype.tagName = 'div';

    DayProgramView.prototype.className = 'dayprogram';

    DayProgramView.prototype.initialize = function() {
      this.listenTo(this.model.get('alarms'), "add", this.onAdd);
      this.listenTo(this.model.get('alarms'), "change", this.onChange);
      this.listenTo(this.model.get('alarms'), "remove", this.onRemove);
      return this.views = {};
    };

    DayProgramView.prototype.onAdd = function(alarm, alarms) {
      var index, rView, render, selector;
      index = alarms.indexOf(alarm);
      rView = new AlarmView({
        id: alarm.cid,
        model: alarm
      });
      render = rView.render().$el;
      if (index === 0) {
        this.$el.find('.alarms').prepend(render);
      } else if (index === this.model.get('alarms').length - 1) {
        this.$el.find('.alarms').append(render);
      } else {
        selector = ".alarms ." + rView.className + ":nth-of-type(" + (index + 1) + ")";
        this.$el.find(selector).before(render);
      }
      return this.views[alarm.cid] = rView;
    };

    DayProgramView.prototype.onChange = function(alarm, options) {
      var newIndex, oldIndex, selector, view;
      this.views[alarm.cid].model.set(alarm.toJSON());
      if (alarm.changedAttributes().trigg != null) {
        view = this.views[alarm.cid];
        oldIndex = this.model.get('alarms').indexOf(alarm);
        this.model.get('alarms').sort();
        newIndex = this.model.get('alarms').indexOf(alarm);
        if (newIndex !== oldIndex) {
          if (newIndex === 0) {
            return this.$el.find('.alarms').prepend(view.$el);
          } else if (newIndex === this.model.get('alarms').length - 1) {
            return this.$el.find('.alarms').append(view.$el);
          } else {
            if (newIndex > oldIndex) {
              newIndex++;
            }
            selector = ".alarms ." + view.className + ":nth-of-type(" + (newIndex + 1) + ")";
            return this.$el.find(selector).before(view.$el);
          }
        }
      }
    };

    DayProgramView.prototype.onRemove = function(alarm, collection, options) {
      this.views[alarm.cid].destroy();
      if (this.model.get('alarms').length === 0) {
        return this.model.collection.remove(this.model);
      }
    };

    DayProgramView.prototype.render = function() {
      return DayProgramView.__super__.render.call(this, {
        date: this.model.get('date').format("{dd}/{MM}/{yyyy}")
      });
    };

    DayProgramView.prototype.template = function() {
      return require('./templates/dayprogram');
    };

    return DayProgramView;

  })(View);
  
});
window.require.register("views/event_popover", function(exports, require, module) {
  var Event, EventPopOver, View,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('../lib/view');

  Event = require('../models/event');

  module.exports = EventPopOver = (function(_super) {
    __extends(EventPopOver, _super);

    function EventPopOver(cal) {
      this.cal = cal;
      this.onEditEventClicked = __bind(this.onEditEventClicked, this);
      this.onEventButtonClicked = __bind(this.onEventButtonClicked, this);
      this.onRemoveEventClicked = __bind(this.onRemoveEventClicked, this);
      this.bindEditEvents = __bind(this.bindEditEvents, this);
      this.bindEvents = __bind(this.bindEvents, this);
    }

    EventPopOver.prototype.clean = function() {
      var _ref, _ref1;
      if ((_ref = this.field) != null) {
        _ref.popover('destroy');
      }
      this.field = null;
      this.date = null;
      if (this.popoverWidget != null) {
        this.popoverWidget.find('button.close').unbind('click');
        this.popoverWidget.find('button.add-event').unbind('click');
        this.popoverWidget.find('inputStart').unbind('keyup');
        this.popoverWidget.find('inputEnd').unbind('keyup');
        this.popoverWidget.find('inputPlace').unbind('keyup');
        this.popoverWidget.find('inputDesc').unbind('keyup');
        return (_ref1 = this.popoverWidget) != null ? _ref1.hide() : void 0;
      }
    };

    EventPopOver.prototype.createNew = function(data) {
      this.clean();
      this.field = data.field;
      this.date = data.date;
      this.model = data.model;
      return this.event = data.event;
    };

    EventPopOver.prototype.show = function(title, direction, content) {
      this.field.data('popover', null).popover({
        title: '<span>' + title + '&nbsp;<i class="event-remove ' + 'icon-trash" /></span> <button type="button" class="close">' + '&times;</button>',
        html: true,
        placement: direction,
        content: content
      }).popover('show');
      this.popoverWidget = $('.container .popover');
      this.popoverWidget.find('inputStart').focus();
      if (this.action === 'create') {
        return $('.event-remove').hide();
      } else {
        return $('.event-remove').show();
      }
    };

    EventPopOver.prototype.bindEvents = function() {
      var _this = this;
      this.popoverWidget = $('.container .popover');
      this.addEventButton = this.popoverWidget.find('button.add-event');
      this.popoverWidget.find('button.close').click(function() {
        return _this.clean();
      });
      this.addEventButton.click(function() {
        return _this.onEventButtonClicked();
      });
      this.eventStart = this.popoverWidget.find('inputStart');
      this.eventEnd = this.popoverWidget.find('inputEnd');
      this.eventPlace = this.popoverWidget.find('inputPlace');
      this.eventDescription = this.popoverWidget.find('inputDesc');
      return this.eventStart.keyup(function(event) {
        if (_this.eventStart.val() === '') {
          return _this.addEventButton.addClass('disabled');
        } else if (event.keyCode === 13 || event.which === 13) {
          return _this.onEventButtonClicked();
        } else {
          if (_this.eventEnd.val() === '') {
            _this.addEventButton.addClass('disabled');
            return _this.eventEnd.keyup(function(event) {
              if (_this.eventEnd.val() === '') {
                return _this.addEventButton.addClass('disabled');
              } else if (event.keyCode === 13 || event.which === 13) {
                return _this.onEventButtonClicked();
              } else {
                return _this.addEventButton.removeClass('disabled');
              }
            });
          } else {
            return _this.addEventButton.removeClass('disabled');
          }
        }
      });
    };

    EventPopOver.prototype.bindEditEvents = function() {
      var _this = this;
      this.popoverWidget = $('.container .popover');
      this.addEventButton = this.popoverWidget.find('button.add-event');
      this.closeButton = this.popoverWidget.find('button.close');
      this.removeButton = this.popoverWidget.find('.event-remove');
      this.eventStart = this.popoverWidget.find('inputStart');
      this.eventEnd = this.popoverWidget.find('inputEnd');
      this.eventPlace = this.popoverWidget.find('inputPlace');
      this.eventDescription = this.popoverWidget.find('inputDesc');
      this.addEventButton.html(this.action);
      this.closeButton.click(function() {
        return _this.clean();
      });
      this.addEventButton.click(function() {
        return _this.onEditEventClicked();
      });
      this.removeButton.click(function() {
        return _this.onRemoveEventClicked();
      });
      return this.eventStart.keyup(function(event) {
        if (_this.eventStart.val() === '') {
          return _this.addEventButton.addClass('disabled');
        } else if (event.keyCode === 13 || event.which === 13) {
          return _this.onEventButtonClicked();
        } else {
          if (_this.eventEnd.val() === '') {
            _this.addEventButton.addClass('disabled');
            return _this.eventEnd.keyup(function(event) {
              if (_this.eventEnd.val() === '') {
                return _this.addEventButton.addClass('disabled');
              } else if (event.keyCode === 13 || event.which === 13) {
                return _this.onEventButtonClicked();
              } else {
                return _this.addEventButton.removeClass('disabled');
              }
            });
          } else {
            return _this.addEventButton.removeClass('disabled');
          }
        }
      });
    };

    EventPopOver.prototype.onRemoveEventClicked = function() {
      var evt,
        _this = this;
      evt = this.model.get(this.event.id);
      this.removeButton.css('width', '42px');
      this.removeButton.spin('tiny');
      return evt.destroy({
        success: function() {
          _this.cal.fullCalendar('removeEvents', _this.event.id);
          _this.removeButton.spin();
          _this.removeButton.css('width', '14px');
          return _this.clean();
        },
        error: function() {
          this.removeButton.spin();
          this.removeButton.css('width', '14px');
          this.clean();
          return this.clean();
        }
      });
    };

    EventPopOver.prototype.onEventButtonClicked = function() {
      var data, description, dueEndDate, dueStartDate, end, newDate, place, specifiedDay, specifiedTime, start,
        _this = this;
      start = $('.popover #inputStart').val();
      end = $('.popover #inputEnd').val();
      place = $('.popover #inputPlace').val();
      description = $('.popover #inputDesc').val();
      specifiedTime = start.split(':');
      dueStartDate = Date.create(this.date);
      dueStartDate.set({
        hours: specifiedTime[0],
        minutes: specifiedTime[1]
      });
      specifiedDay = end.split('+');
      specifiedTime = specifiedDay[0].split(':');
      if (specifiedDay[1] != null) {
        newDate = this.date.advance({
          days: specifiedDay[1]
        });
        dueEndDate = Date.create(newDate);
      } else {
        specifiedDay[1] = 0;
        dueEndDate = Date.create(this.date);
      }
      dueEndDate.set({
        hours: specifiedTime[0],
        minutes: specifiedTime[1]
      });
      data = {
        start: dueStartDate.format(Event.dateFormat),
        end: dueEndDate.format(Event.dateFormat),
        diff: parseInt(specifiedDay[1]),
        place: place,
        description: description
      };
      return this.model.create(data, {
        wait: true,
        success: function() {
          _this.clean();
          _this.addEventButton.spin();
          return _this.addEventButton.html(_this.action);
        },
        error: function() {
          _this.clean();
          _this.addEventButton.spin();
          return _this.addEventButton.html(_this.action);
        }
      });
    };

    EventPopOver.prototype.onEditEventClicked = function() {
      var data, dueEndDate, dueStartDate, end, evt, newDate, specifiedDay, specifiedTime, start,
        _this = this;
      evt = this.model.get(this.event.id);
      start = $('.popover #inputStart').val();
      end = $('.popover #inputEnd').val();
      specifiedTime = start.split(':');
      dueStartDate = Date.create(this.date);
      dueStartDate.set({
        hours: specifiedTime[0],
        minutes: specifiedTime[1]
      });
      specifiedDay = end.split('+');
      specifiedTime = specifiedDay[0].split(':');
      if (specifiedDay[1] != null) {
        newDate = this.date.advance({
          days: specifiedDay[1]
        });
        dueEndDate = Date.create(newDate);
      } else {
        specifiedDay[1] = 0;
        dueEndDate = Date.create(this.date);
      }
      dueEndDate.set({
        hours: specifiedTime[0],
        minutes: specifiedTime[1]
      });
      data = {
        start: dueStartDate.format(Event.dateFormat),
        end: dueEndDate.format(Event.dateFormat),
        place: $('.popover #inputPlace').val(),
        diff: parseInt(specifiedDay[1]),
        description: $('.popover #inputDesc').val()
      };
      this.cal.fullCalendar('renderEvent', this.event);
      this.addEventButton.html('&nbsp;');
      return evt.save(data, {
        wait: true,
        success: function() {
          _this.event.title = data.description;
          return _this.cal.fullCalendar('renderEvent', _this.event);
        },
        error: function() {
          return this.cal.fullCalendar('renderEvent', this.event);
        }
      });
    };

    return EventPopOver;

  })(View);
  
});
window.require.register("views/list_view", function(exports, require, module) {
  var Alarm, AlarmCollection, AlarmFormView, AlarmsListView, ListView, View, helpers, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('../lib/view');

  AlarmFormView = require('./alarmform_view');

  AlarmsListView = require('../views/alarms_list_view');

  AlarmCollection = require('../collections/alarms');

  Alarm = require('../models/alarm');

  helpers = require('../helpers');

  module.exports = ListView = (function(_super) {
    __extends(ListView, _super);

    function ListView() {
      _ref = ListView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    ListView.prototype.el = '#viewContainer';

    ListView.prototype.events = {
      "click #add-alarm button.add-alarm": "onAddAlarmClicked",
      "click #alarms .alarms p .icon-pencil": "onEditAlarmClicked",
      "click #alarms .alarms p .icon-trash": "onRemoveAlarmClicked"
    };

    ListView.prototype.template = function() {
      return require('./templates/listview');
    };

    ListView.prototype.afterRender = function() {
      (this.alarmFormView = new AlarmFormView()).render();
      return this.alarmsListView = new AlarmsListView({
        model: this.model
      });
    };

    ListView.prototype.onAddAlarmClicked = function(event, callback) {
      var alarm, data, date, dueDate, time, _ref1,
        _this = this;
      date = this.alarmFormView.dateField.val();
      time = this.alarmFormView.timeField.val();
      dueDate = helpers.formatDateISO8601("" + date + "#" + time);
      dueDate = Date.create(dueDate);
      if (dueDate.isValid()) {
        dueDate = dueDate.format(Alarm.dateFormat);
      } else {
        dueDate = 'undefined';
      }
      data = {
        description: this.alarmFormView.descriptionField.val(),
        action: this.alarmFormView.actionField.val(),
        trigg: dueDate
      };
      if (this.alarmFormView.editionMode) {
        alarm = this.alarmFormView.data;
        alarm.save(data, {
          wait: true,
          ignoreMySocketNotification: true,
          success: function() {
            _this.alarmFormView.resetForm();
            return console.log("Save: success (attributes updated)");
          },
          error: function() {
            return console.log("Error during alarm save.");
          }
        });
      } else {
        alarm = this.model.create(data, {
          ignoreMySocketNotification: true,
          wait: true,
          success: function(model, response) {
            _this.alarmFormView.resetForm();
            return console.log('Create alarm: success');
          },
          error: function(error, xhr, options) {
            error = JSON.parse(xhr.responseText);
            return console.log("Create alarm: error: " + (error != null ? error.msg : void 0));
          }
        });
      }
      if (((_ref1 = alarm.validationError) != null ? _ref1.length : void 0) > 0) {
        return this.alarmFormView.displayErrors(alarm.validationError);
      }
    };

    ListView.prototype.onEditAlarmClicked = function(event) {
      var alarm, alarmID;
      alarmID = $(event.target).data('alarmid');
      alarm = this.model.get(alarmID);
      return this.alarmFormView.loadAlarmData(alarm);
    };

    ListView.prototype.onRemoveAlarmClicked = function(event) {
      var alarm, alarmID;
      alarmID = $(event.target).data('alarmid');
      alarm = this.model.get(alarmID);
      return alarm.destroy({
        wait: true,
        success: function() {
          return console.log("Delete alarm: success");
        },
        error: function() {
          return console.log("Delete alarm: error");
        }
      });
    };

    return ListView;

  })(View);
  
});
window.require.register("views/schedule_element", function(exports, require, module) {
  var ScheduleElement, View, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('../lib/view');

  module.exports = ScheduleElement = (function(_super) {
    __extends(ScheduleElement, _super);

    function ScheduleElement() {
      _ref = ScheduleElement.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    ScheduleElement.prototype.tagName = 'div';

    ScheduleElement.prototype.className = 'scheduleElement';

    ScheduleElement.prototype.initialize = function() {
      return this.listenTo(this.model, "change", this.onChange);
    };

    ScheduleElement.prototype.onChange = function(alarm) {
      return this.render();
    };

    return ScheduleElement;

  })(View);
  
});
window.require.register("views/templates/alarm", function(exports, require, module) {
  module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
  attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
  var buf = [];
  with (locals || {}) {
  var interp;
  buf.push('<p>' + escape((interp = time) == null ? '' : interp) + '\n' + escape((interp = description) == null ? '' : interp) + ' (' + escape((interp = action) == null ? '' : interp) + ')<i');
  buf.push(attrs({ 'data-alarmid':("" + (alarmID) + ""), "class": ('icon-pencil') }, {"data-alarmid":true}));
  buf.push('></i><i');
  buf.push(attrs({ 'data-alarmid':("" + (alarmID) + ""), "class": ('icon-trash') }, {"data-alarmid":true}));
  buf.push('></i></p>');
  }
  return buf.join("");
  };
});
window.require.register("views/templates/alarm_form", function(exports, require, module) {
  module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
  attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
  var buf = [];
  with (locals || {}) {
  var interp;
  buf.push('<div class="form-horizontal well"><div class="control-group"><input id="alarm-description-input" type="text" placeholder="What should I remind you ?" class="input-block-level"/></div><div class="form-inline"><select id="action" class="input-small">');
  // iterate actions
  ;(function(){
    if ('number' == typeof actions.length) {

      for (var action = 0, $$l = actions.length; action < $$l; action++) {
        var displayAction = actions[action];

  if ( action == defaultAction)
  {
  buf.push('<option');
  buf.push(attrs({ 'value':("" + (action) + ""), 'selected':(true) }, {"value":true,"selected":true}));
  buf.push('>' + escape((interp = displayAction) == null ? '' : interp) + '</option>');
  }
  else
  {
  buf.push('<option');
  buf.push(attrs({ 'value':("" + (action) + "") }, {"value":true}));
  buf.push('>' + escape((interp = displayAction) == null ? '' : interp) + '</option>');
  }
      }

    } else {
      var $$l = 0;
      for (var action in actions) {
        $$l++;      var displayAction = actions[action];

  if ( action == defaultAction)
  {
  buf.push('<option');
  buf.push(attrs({ 'value':("" + (action) + ""), 'selected':(true) }, {"value":true,"selected":true}));
  buf.push('>' + escape((interp = displayAction) == null ? '' : interp) + '</option>');
  }
  else
  {
  buf.push('<option');
  buf.push(attrs({ 'value':("" + (action) + "") }, {"value":true}));
  buf.push('>' + escape((interp = displayAction) == null ? '' : interp) + '</option>');
  }
      }

    }
  }).call(this);

  buf.push('</select><div id="date-control"><label for="inputDate">&nbsp;date:&nbsp;</label><div id="inputDate" class="input-append date"><input');
  buf.push(attrs({ 'type':("text"), 'value':("" + (defaultDate) + ""), "class": ('span2') }, {"type":true,"value":true}));
  buf.push('/><span class="add-on"><i class="icon-th"></i></span></div><label for="inputTime">&nbsp;&nbsp;time:&nbsp;</label><div class="input-append bootstrap-timepicker"><input');
  buf.push(attrs({ 'id':("inputTime"), 'type':("text"), 'value':("" + (defaultTime) + ""), "class": ('input-small') }, {"id":true,"type":true,"value":true}));
  buf.push('/><span class="add-on"><i class="icon-time"></i></span></div></div></div><button class="btn pull-right add-alarm">add the alarm</button><div class="clearfix"></div></div>');
  }
  return buf.join("");
  };
});
window.require.register("views/templates/alarm_form_small", function(exports, require, module) {
  module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
  attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
  var buf = [];
  with (locals || {}) {
  var interp;
  buf.push('<div><input');
  buf.push(attrs({ 'type':("text"), 'value':("" + (defaultValue) + ""), 'id':("inputDesc"), 'placeholder':("What do you want to be reminded ?"), "class": ('input-xlarge') }, {"type":true,"value":true,"id":true,"placeholder":true}));
  buf.push('/><button class="btn pull-right add-alarm disabled">');
  if ( editionMode)
  {
  buf.push('Edit');
  }
  else
  {
  buf.push('Add');
  }
  buf.push('</button>');
  if (!( editionMode))
  {
  buf.push('<p>ie: 9:00 important meeting</p>');
  }
  buf.push('<button class="btn add-event">Create Event</button></div>');
  }
  return buf.join("");
  };
});
window.require.register("views/templates/calendarview", function(exports, require, module) {
  module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
  attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
  var buf = [];
  with (locals || {}) {
  var interp;
  buf.push('<div class="container"><ul id="menu"><li><a href="#list" class="btn">Switch to List</a><a href="export/calendar.ics" target="_blank" class="btn"> <i class="icon-arrow-down icon-white"></i></a></li></ul><div id="alarms" class="well"></div></div>');
  }
  return buf.join("");
  };
});
window.require.register("views/templates/dayprogram", function(exports, require, module) {
  module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
  attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
  var buf = [];
  with (locals || {}) {
  var interp;
  buf.push('<h2>' + escape((interp = date) == null ? '' : interp) + '</h2><div class="alarms"></div>');
  }
  return buf.join("");
  };
});
window.require.register("views/templates/event", function(exports, require, module) {
  module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
  attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
  var buf = [];
  with (locals || {}) {
  var interp;
  buf.push('<p>' + escape((interp = time) == null ? '' : interp) + '\n' + escape((interp = description) == null ? '' : interp) + '<i data-eventid="" class="icon-pencil"></i><i data-eventid="" class="icon-trash"></i></p>');
  }
  return buf.join("");
  };
});
window.require.register("views/templates/event_form_small", function(exports, require, module) {
  module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
  attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
  var buf = [];
  with (locals || {}) {
  var interp;
  buf.push('<div>From  <input');
  buf.push(attrs({ 'type':("text"), 'value':("" + (defaultValueStart) + ""), 'id':("inputStart"), 'placeholder':("Start"), "class": ('input-small') }, {"type":true,"value":true,"id":true,"placeholder":true}));
  buf.push('/>To  <input');
  buf.push(attrs({ 'type':("text"), 'value':("" + (defaultValueEnd) + ""), 'id':("inputEnd"), 'placeholder':("End"), "class": ('input-small') }, {"type":true,"value":true,"id":true,"placeholder":true}));
  buf.push('/><input');
  buf.push(attrs({ 'type':("text"), 'value':("" + (defaultValuePlace) + ""), 'id':("inputPlace"), 'placeholder':("Place"), "class": ('input') }, {"type":true,"value":true,"id":true,"placeholder":true}));
  buf.push('/><button class="btn pull-right add-event">');
  if ( editionMode)
  {
  buf.push('Edit');
  }
  else
  {
  buf.push('Create');
  }
  buf.push('</button><input');
  buf.push(attrs({ 'type':("text"), 'value':("" + (defaultValueDesc) + ""), 'id':("inputDesc"), 'placeholder':("Description"), "class": ('input-xlarge') }, {"type":true,"value":true,"id":true,"placeholder":true}));
  buf.push('/></div>');
  }
  return buf.join("");
  };
});
window.require.register("views/templates/listview", function(exports, require, module) {
  module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
  attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
  var buf = [];
  with (locals || {}) {
  var interp;
  buf.push('<div class="container"><ul id="menu"><li><a href="#calendar" class="btn">Switch to calendar</a></li></ul><div class="addform"><div id="add-alarm" class="container"></div></div><div id="alarms" class="well"></div></div>');
  }
  return buf.join("");
  };
});
