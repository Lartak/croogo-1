/**
 * Simple AJAX autocomplete wrapper/plugin using Bootstrap typeahead
 *
 * @license MIT
 * @author rchavik@gmail.com
 * @package Croogo
 */
;(function ($, window, document, undefined ) {

  var defaults = {

    // URL to retrieve autocomplete results
    url: undefined,

    // allow multiple entries per element
    multiple: false,

    // selector of related element that stores the actual selected value
    relatedElement: undefined,

    // field name that will be used as primary key
    primaryKey: "id",

    // field name that will be displayed in the autocomplete field
    displayField: "title",

    // field name that will be used when querying from the autocomplete URL
    queryField: undefined
  };

  var pluginName = 'typeahead_autocomplete';

  function Plugin(element, options) {
    this.element = element;

    this.options = $.extend({}, defaults, options);

    var elConfig = $(element).data();
    for (field in defaults) {
      var key = field.toLowerCase();
      if (typeof elConfig[key] !== 'undefined') {
        this.options[field] = elConfig[key];
      }
    }
    this.init(this);
  }
  Plugin.prototype = {
    init: function (plugin) {
      var options = plugin.options;
      var results = [];
      var map = {};
      var $rel = $(options.relatedElement);
      var $element = $(plugin.element);
      var originalValues;

      $element
        .on('focus', function() {
          originalValues = {
            rel: $rel.val(),
            el: this.value
          };
        })
        .on('blur', function(e) {
          if (this.value.length == 0) {
            $rel.val('');
          }
          if ($rel.val().length == 0) {
            this.value = '';
          }
          if (originalValues.rel === $rel.val()) {
            this.value = originalValues.el;
          }
        });
      $element.typeahead({
        matcher: function (item) {
          var tQuery = '';
          if (options.multiple) {
            var result = /([^,]+)$/.exec(this.query);
            if (result && result[1]) {
              tQuery = result[1].trim();
            }
            if (tQuery && item && item.toLowerCase().indexOf(tQuery.toLowerCase()) !== -1) {
              return true;
            }
          } else {
            if (item && item.toLowerCase().indexOf(this.query.trim().toLowerCase()) !== -1) {
              return true;
            }
          }
        },
        updater: function(item) {
          if (options.multiple) {
            var data = [];
            var complete = this.$element.val().replace(/[^,]*$/, '') + item;
            $.each(complete.split(','), function(index, value) {
              data.push(map[value]);
            });
            $rel.val(data.join());
            return complete;
          } else {
            $rel.val(map[item]);
            return item;
          }
        },
        source: function(q, process) {
          var param = {};
          if (options.multiple) {
            q = q.split(',').pop().trim();
            if (q == '' || q.length < options.minLength) {
              return;
            }
          }
          param[options.queryField] = q;

          var onSuccess = function (json) {
            $.each(json.data, function (i, result) {
              if (typeof map[result.attributes[options.displayField]] == 'undefined') {
                map[result.attributes[options.displayField]] = result[options.primaryKey];
                results.push(result.attributes[options.displayField]);
              }
            });
            return process(results);
          };

          $.get({
            url: options.url,
            data: param,
            headers: {
              'Accept': 'application/vnd.api+json',
            },
            success: onSuccess,
          });
        }
      });
    }
  };

  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
      }
    });
  };

})(jQuery, window, document);
