/*
 * jQuery FlexSlider v2.6.3
 * Copyright 2012 WooThemes
 * Contributing Author: Tyler Smith
 *
 * Unminified / readable version
 */
(function($) {

  var focused = true;

  // ==============================================
  // FlexSlider Constructor
  // ==============================================
  $.flexslider = function(el, options) {
    var slider = $(el);

    // Merge user options with defaults
    slider.vars = $.extend({}, $.flexslider.defaults, options);

    var namespace = slider.vars.namespace,
        msGestureAvailable = window.navigator && window.navigator.msPointerEnabled && window.MSGesture,
        touch = ("ontouchstart" in window || msGestureAvailable || window.DocumentTouch && document instanceof DocumentTouch) && slider.vars.touch,
        eventType = "click touchend MSPointerUp keyup",
        watchedEvent = "",
        watchedEventClearTimer,
        vertical = slider.vars.direction === "vertical",
        reverse = slider.vars.reverse,
        carousel = slider.vars.itemWidth > 0,
        fade = slider.vars.animation === "fade",
        asNavFor = slider.vars.asNavFor !== "",
        methods = {};

    // Store a reference to the slider on the DOM element
    $.data(el, "flexslider", slider);

    // ==============================================
    // Internal Methods
    // ==============================================
    methods = {

      // ------------------------------------------
      // Initialization
      // ------------------------------------------
      init: function() {
        slider.animating = false;
        slider.currentSlide = parseInt(slider.vars.startAt ? slider.vars.startAt : 0, 10);
        if (isNaN(slider.currentSlide)) {
          slider.currentSlide = 0;
        }
        slider.animatingTo = slider.currentSlide;
        slider.atEnd = slider.currentSlide === 0 || slider.currentSlide === slider.last;
        slider.containerSelector = slider.vars.selector.substr(0, slider.vars.selector.search(" "));
        slider.slides = $(slider.vars.selector, slider);
        slider.container = $(slider.containerSelector, slider);
        slider.count = slider.slides.length;
        slider.syncExists = $(slider.vars.sync).length > 0;

        // "slide" animation maps to "swing" easing
        if (slider.vars.animation === "slide") {
          slider.vars.animation = "swing";
        }

        slider.prop = vertical ? "top" : "marginLeft";
        slider.args = {};
        slider.manualPause = false;
        slider.stopped = false;
        slider.started = false;
        slider.startTimeout = null;

        // Detect CSS3 transition support
        slider.transitions = !slider.vars.video && !fade && slider.vars.useCSS && (function() {
          var div = document.createElement("div"),
              props = ["perspectiveProperty", "WebkitPerspective", "MozPerspective", "OPerspective", "msPerspective"];
          for (var i in props) {
            if (div.style[props[i]] !== undefined) {
              slider.pfx = props[i].replace("Perspective", "").toLowerCase();
              slider.prop = "-" + slider.pfx + "-transform";
              return true;
            }
          }
          return false;
        })();

        slider.ensureAnimationEnd = "";

        // Controls container
        if (slider.vars.controlsContainer !== "") {
          slider.controlsContainer = $(slider.vars.controlsContainer).length > 0 && $(slider.vars.controlsContainer);
        }

        // Manual controls
        if (slider.vars.manualControls !== "") {
          slider.manualControls = $(slider.vars.manualControls).length > 0 && $(slider.vars.manualControls);
        }

        // Custom direction nav
        if (slider.vars.customDirectionNav !== "") {
          slider.customDirectionNav = $(slider.vars.customDirectionNav).length === 2 && $(slider.vars.customDirectionNav);
        }

        // Randomize slides
        if (slider.vars.randomize) {
          slider.slides.sort(function() {
            return Math.round(Math.random()) - 0.5;
          });
          slider.container.empty().append(slider.slides);
        }

        slider.doMath();
        slider.setup("init");

        // Control nav
        if (slider.vars.controlNav) {
          methods.controlNav.setup();
        }

        // Direction nav
        if (slider.vars.directionNav) {
          methods.directionNav.setup();
        }

        // Keyboard navigation
        if (slider.vars.keyboard && ($(slider.containerSelector).length === 1 || slider.vars.multipleKeyboard)) {
          $(document).bind("keyup", function(event) {
            var keycode = event.keyCode;
            if (!slider.animating && (keycode === 39 || keycode === 37)) {
              var target = (keycode === 39) ? slider.getTarget("next") :
                           (keycode === 37) ? slider.getTarget("prev") : false;
              slider.flexAnimate(target, slider.vars.pauseOnAction);
            }
          });
        }

        // Mousewheel
        if (slider.vars.mousewheel) {
          slider.bind("mousewheel", function(event, delta, deltaX, deltaY) {
            event.preventDefault();
            var target = delta < 0 ? slider.getTarget("next") : slider.getTarget("prev");
            slider.flexAnimate(target, slider.vars.pauseOnAction);
          });
        }

        // Pause/Play
        if (slider.vars.pausePlay) {
          methods.pausePlay.setup();
        }

        // Slideshow
        if (slider.vars.slideshow && slider.vars.pauseInvisible) {
          methods.pauseInvisible.init();
        }

        if (slider.vars.slideshow) {
          // Pause on hover
          if (slider.vars.pauseOnHover) {
            slider.hover(
              function() {
                if (!slider.manualPlay && !slider.manualPause) {
                  slider.pause();
                }
              },
              function() {
                if (!slider.manualPause && !slider.manualPlay && !slider.stopped) {
                  slider.play();
                }
              }
            );
          }

          // Start slideshow (unless tab is hidden)
          if (!slider.vars.pauseInvisible || !methods.pauseInvisible.isHidden()) {
            if (slider.vars.initDelay > 0) {
              slider.startTimeout = setTimeout(slider.play, slider.vars.initDelay);
            } else {
              slider.play();
            }
          }
        }

        // asNavFor setup
        if (asNavFor) {
          methods.asNav.setup();
        }

        // Touch support
        if (touch && slider.vars.touch) {
          methods.touch();
        }

        // Resize handler (for fade with smoothHeight, or non-fade)
        if (!fade || (fade && slider.vars.smoothHeight)) {
          $(window).bind("resize orientationchange focus", methods.resize);
        }

        // Prevent image dragging
        slider.find("img").attr("draggable", "false");

        // Fire start callback
        setTimeout(function() {
          slider.vars.start(slider);
        }, 200);
      },

      // ------------------------------------------
      // asNavFor (slider as navigation for another)
      // ------------------------------------------
      asNav: {
        setup: function() {
          slider.asNav = true;
          slider.animatingTo = Math.floor(slider.currentSlide / slider.move);
          slider.currentItem = slider.currentSlide;
          slider.slides.removeClass(namespace + "active-slide").eq(slider.currentItem).addClass(namespace + "active-slide");

          if (msGestureAvailable) {
            // MS Pointer events
            el._slider = slider;
            slider.slides.each(function() {
              var slide = this;
              slide._gesture = new MSGesture();
              slide._gesture.target = slide;
              slide.addEventListener("MSPointerDown", function(e) {
                e.preventDefault();
                if (e.currentTarget._gesture) {
                  e.currentTarget._gesture.addPointer(e.pointerId);
                }
              }, false);
              slide.addEventListener("MSGestureTap", function(e) {
                e.preventDefault();
                var $slide = $(this),
                    index = $slide.index();
                if (!$(slider.vars.asNavFor).data("flexslider").animating && !$slide.hasClass("active")) {
                  slider.direction = slider.currentItem < index ? "next" : "prev";
                  slider.flexAnimate(index, slider.vars.pauseOnAction, false, true, true);
                }
              });
            });
          } else {
            // Standard touch/click events
            slider.slides.on(eventType, function(e) {
              e.preventDefault();
              var $slide = $(this),
                  index = $slide.index(),
                  scrollOffset = $slide.offset().left - $(slider).scrollLeft();

              if (scrollOffset <= 0 && $slide.hasClass(namespace + "active-slide")) {
                slider.flexAnimate(slider.getTarget("prev"), true);
              } else if (!$(slider.vars.asNavFor).data("flexslider").animating && !$slide.hasClass(namespace + "active-slide")) {
                slider.direction = slider.currentItem < index ? "next" : "prev";
                slider.flexAnimate(index, slider.vars.pauseOnAction, false, true, true);
              }
            });
          }
        }
      },

      // ------------------------------------------
      // Control Navigation (dots/thumbnails)
      // ------------------------------------------
      controlNav: {
        setup: function() {
          if (slider.manualControls) {
            methods.controlNav.setupManual();
          } else {
            methods.controlNav.setupPaging();
          }
        },

        setupPaging: function() {
          var type = (slider.vars.controlNav === "thumbnails") ? "control-thumbs" : "control-paging",
              num = 1,
              item, slide;

          slider.controlNavScaffold = $('<ol class="' + namespace + 'control-nav ' + namespace + type + '"></ol>');

          if (slider.pagingCount > 1) {
            for (var i = 0; i < slider.pagingCount; i++) {
              slide = slider.slides.eq(i);
              if (slide.attr("data-thumb-alt") === undefined) {
                slide.attr("data-thumb-alt", "");
              }
              var altText = (slide.attr("data-thumb-alt") !== "") ? ' alt="' + slide.attr("data-thumb-alt") + '"' : "";

              if (slider.vars.controlNav === "thumbnails") {
                item = '<img src="' + slide.attr("data-thumb") + '"' + altText + "/>";
              } else {
                item = '<a href="#">' + num + "</a>";
              }

              if (slider.vars.controlNav === "thumbnails" && slider.vars.thumbCaptions === true) {
                var caption = slide.attr("data-thumbcaption");
                if (caption !== "" && caption !== undefined) {
                  item += '<span class="' + namespace + 'caption">' + caption + "</span>";
                }
              }

              slider.controlNavScaffold.append("<li>" + item + "</li>");
              num++;
            }
          }

          if (slider.controlsContainer) {
            $(slider.controlsContainer).append(slider.controlNavScaffold);
          } else {
            slider.append(slider.controlNavScaffold);
          }

          methods.controlNav.set();
          methods.controlNav.active();

          slider.controlNavScaffold.delegate("a, img", eventType, function(e) {
            e.preventDefault();
            if (watchedEvent === "" || watchedEvent === e.type) {
              var $this = $(this),
                  index = slider.controlNav.index($this);
              if (!$this.hasClass(namespace + "active")) {
                slider.direction = index > slider.currentSlide ? "next" : "prev";
                slider.flexAnimate(index, slider.vars.pauseOnAction);
              }
            }
            if (watchedEvent === "") {
              watchedEvent = e.type;
            }
            methods.setToClearWatchedEvent();
          });
        },

        setupManual: function() {
          slider.controlNav = slider.manualControls;
          methods.controlNav.active();

          slider.controlNav.bind(eventType, function(e) {
            e.preventDefault();
            if (watchedEvent === "" || watchedEvent === e.type) {
              var $this = $(this),
                  index = slider.controlNav.index($this);
              if (!$this.hasClass(namespace + "active")) {
                if (index > slider.currentSlide) {
                  slider.direction = "next";
                } else {
                  slider.direction = "prev";
                }
                slider.flexAnimate(index, slider.vars.pauseOnAction);
              }
            }
            if (watchedEvent === "") {
              watchedEvent = e.type;
            }
            methods.setToClearWatchedEvent();
          });
        },

        set: function() {
          var selector = (slider.vars.controlNav === "thumbnails") ? "img" : "a";
          slider.controlNav = $("." + namespace + "control-nav li " + selector, slider.controlsContainer ? slider.controlsContainer : slider);
        },

        active: function() {
          slider.controlNav.removeClass(namespace + "active").eq(slider.animatingTo).addClass(namespace + "active");
        },

        update: function(action, pos) {
          if (slider.pagingCount > 1 && action === "add") {
            slider.controlNavScaffold.append($('<li><a href="#">' + slider.count + "</a></li>"));
          } else if (slider.pagingCount === 1) {
            slider.controlNavScaffold.find("li").remove();
          } else {
            slider.controlNav.eq(pos).closest("li").remove();
          }
          methods.controlNav.set();
          if (slider.pagingCount > 1 && slider.pagingCount !== slider.controlNav.length) {
            slider.update(pos, action);
          } else {
            methods.controlNav.active();
          }
        }
      },

      // ------------------------------------------
      // Direction Navigation (prev/next arrows)
      // ------------------------------------------
      directionNav: {
        setup: function() {
          var nav = $('<ul class="' + namespace + 'direction-nav">' +
                      '<li class="' + namespace + 'nav-prev">' +
                        '<a class="' + namespace + 'prev" href="#">' + slider.vars.prevText + '</a>' +
                      '</li>' +
                      '<li class="' + namespace + 'nav-next">' +
                        '<a class="' + namespace + 'next" href="#">' + slider.vars.nextText + '</a>' +
                      '</li>' +
                    '</ul>');

          if (slider.customDirectionNav) {
            slider.directionNav = slider.customDirectionNav;
          } else if (slider.controlsContainer) {
            $(slider.controlsContainer).append(nav);
            slider.directionNav = $("." + namespace + "direction-nav li a", slider.controlsContainer);
          } else {
            slider.append(nav);
            slider.directionNav = $("." + namespace + "direction-nav li a", slider);
          }

          methods.directionNav.update();

          slider.directionNav.bind(eventType, function(e) {
            e.preventDefault();
            var target;
            if (watchedEvent === "" || watchedEvent === e.type) {
              target = $(this).hasClass(namespace + "next") ? slider.getTarget("next") : slider.getTarget("prev");
              slider.flexAnimate(target, slider.vars.pauseOnAction);
            }
            if (watchedEvent === "") {
              watchedEvent = e.type;
            }
            methods.setToClearWatchedEvent();
          });
        },

        update: function() {
          var disabledClass = namespace + "disabled";
          if (slider.pagingCount === 1) {
            slider.directionNav.addClass(disabledClass).attr("tabindex", "-1");
          } else if (slider.vars.animationLoop) {
            slider.directionNav.removeClass(disabledClass).removeAttr("tabindex");
          } else if (slider.animatingTo === 0) {
            slider.directionNav.removeClass(disabledClass).filter("." + namespace + "prev").addClass(disabledClass).attr("tabindex", "-1");
          } else if (slider.animatingTo === slider.last) {
            slider.directionNav.removeClass(disabledClass).filter("." + namespace + "next").addClass(disabledClass).attr("tabindex", "-1");
          } else {
            slider.directionNav.removeClass(disabledClass).removeAttr("tabindex");
          }
        }
      },

      // ------------------------------------------
      // Pause/Play Button
      // ------------------------------------------
      pausePlay: {
        setup: function() {
          var pausePlayContainer = $('<div class="' + namespace + 'pauseplay"><a href="#"></a></div>');

          if (slider.controlsContainer) {
            slider.controlsContainer.append(pausePlayContainer);
            slider.pausePlay = $("." + namespace + "pauseplay a", slider.controlsContainer);
          } else {
            slider.append(pausePlayContainer);
            slider.pausePlay = $("." + namespace + "pauseplay a", slider);
          }

          methods.pausePlay.update(slider.vars.slideshow ? namespace + "pause" : namespace + "play");

          slider.pausePlay.bind(eventType, function(e) {
            e.preventDefault();
            if (watchedEvent === "" || watchedEvent === e.type) {
              if ($(this).hasClass(namespace + "pause")) {
                slider.manualPause = true;
                slider.manualPlay = false;
                slider.pause();
              } else {
                slider.manualPause = false;
                slider.manualPlay = true;
                slider.play();
              }
            }
            if (watchedEvent === "") {
              watchedEvent = e.type;
            }
            methods.setToClearWatchedEvent();
          });
        },

        update: function(state) {
          if (state === "play") {
            slider.pausePlay.removeClass(namespace + "pause").addClass(namespace + "play").html(slider.vars.playText);
          } else {
            slider.pausePlay.removeClass(namespace + "play").addClass(namespace + "pause").html(slider.vars.pauseText);
          }
        }
      },

      // ------------------------------------------
      // Touch Support
      // ------------------------------------------
      touch: function() {
        var startX, startY, offset, cwidth, dx, startT,
            onTouchStart, onTouchMove, onTouchEnd,
            scrolling = false,
            localX = 0, localY = 0, accDx = 0;

        if (msGestureAvailable) {
          // MS Gesture events (IE10+)
          el.style.msTouchAction = "none";
          el._gesture = new MSGesture();
          el._gesture.target = el;

          el.addEventListener("MSPointerDown", function(e) {
            e.stopPropagation();
            if (slider.animating) {
              e.preventDefault();
            } else {
              slider.pause();
              el._gesture.addPointer(e.pointerId);
              accDx = 0;
              cwidth = vertical ? slider.h : slider.w;
              startT = Number(new Date());

              // Calculate current offset
              offset = (carousel && reverse && slider.animatingTo === slider.last) ? 0 :
                       (carousel && reverse) ? slider.limit - (slider.itemW + slider.vars.itemMargin) * slider.move * slider.animatingTo :
                       (carousel && slider.currentSlide === slider.last) ? slider.limit :
                       carousel ? (slider.itemW + slider.vars.itemMargin) * slider.move * slider.currentSlide :
                       reverse ? (slider.last - slider.currentSlide + slider.cloneOffset) * cwidth :
                       (slider.currentSlide + slider.cloneOffset) * cwidth;
            }
          }, false);

          el._slider = slider;

          el.addEventListener("MSGestureChange", function(e) {
            e.stopPropagation();
            var sliderRef = e.target._slider;
            if (!sliderRef) return;

            var transX = -e.translationX,
                transY = -e.translationY;

            accDx += vertical ? transY : transX;
            dx = accDx;
            scrolling = vertical ? Math.abs(accDx) < Math.abs(-transX) : Math.abs(accDx) < Math.abs(-transY);

            if (e.detail === e.MSGESTURE_FLAG_INERTIA) {
              setImmediate(function() {
                el._gesture.stop();
              });
              return;
            }

            if (!scrolling || Number(new Date()) - startT > 500) {
              e.preventDefault();
              if (!fade && sliderRef.transitions) {
                if (!sliderRef.vars.animationLoop) {
                  dx = accDx / (sliderRef.currentSlide === 0 && accDx < 0 || sliderRef.currentSlide === sliderRef.last && accDx > 0 ? (Math.abs(accDx) / cwidth + 2) : 1);
                }
                sliderRef.setProps(offset + dx, "setTouch");
              }
            }
          }, false);

          el.addEventListener("MSGestureEnd", function(e) {
            e.stopPropagation();
            var sliderRef = e.target._slider;
            if (!sliderRef) return;

            if (sliderRef.animatingTo === sliderRef.currentSlide && !scrolling && dx !== null) {
              var direction = reverse ? -dx : dx,
                  target = direction > 0 ? sliderRef.getTarget("next") : sliderRef.getTarget("prev");

              if (sliderRef.canAdvance(target) && (Number(new Date()) - startT < 550 && Math.abs(direction) > 50 || Math.abs(direction) > cwidth / 2)) {
                sliderRef.flexAnimate(target, sliderRef.vars.pauseOnAction);
              } else if (!fade) {
                sliderRef.flexAnimate(sliderRef.currentSlide, sliderRef.vars.pauseOnAction, true);
              }
            }
            startX = null;
            startY = null;
            dx = null;
            offset = null;
            accDx = 0;
          }, false);

        } else {
          // Standard touch events

          onTouchStart = function(e) {
            if (slider.animating) {
              e.preventDefault();
            } else if (window.navigator.msPointerEnabled || e.touches.length === 1) {
              slider.pause();
              cwidth = vertical ? slider.h : slider.w;
              startT = Number(new Date());
              localX = e.touches[0].pageX;
              localY = e.touches[0].pageY;

              offset = (carousel && reverse && slider.animatingTo === slider.last) ? 0 :
                       (carousel && reverse) ? slider.limit - (slider.itemW + slider.vars.itemMargin) * slider.move * slider.animatingTo :
                       (carousel && slider.currentSlide === slider.last) ? slider.limit :
                       carousel ? (slider.itemW + slider.vars.itemMargin) * slider.move * slider.currentSlide :
                       reverse ? (slider.last - slider.currentSlide + slider.cloneOffset) * cwidth :
                       (slider.currentSlide + slider.cloneOffset) * cwidth;

              startX = vertical ? localY : localX;
              startY = vertical ? localX : localY;

              el.addEventListener("touchmove", onTouchMove, false);
              el.addEventListener("touchend", onTouchEnd, false);
            }
          };

          onTouchMove = function(e) {
            localX = e.touches[0].pageX;
            localY = e.touches[0].pageY;
            dx = vertical ? startX - localY : startX - localX;
            scrolling = vertical ? Math.abs(dx) < Math.abs(localX - startY) : Math.abs(dx) < Math.abs(localY - startY);

            var timeout = 500;
            if (!scrolling || Number(new Date()) - startT > timeout) {
              e.preventDefault();
              if (!fade && slider.transitions) {
                if (!slider.vars.animationLoop) {
                  dx /= (slider.currentSlide === 0 && dx < 0 || slider.currentSlide === slider.last && dx > 0) ? (Math.abs(dx) / cwidth + 2) : 1;
                }
                slider.setProps(offset + dx, "setTouch");
              }
            }
          };

          onTouchEnd = function(e) {
            el.removeEventListener("touchmove", onTouchMove, false);

            if (slider.animatingTo === slider.currentSlide && !scrolling && dx !== null) {
              var direction = reverse ? -dx : dx,
                  target = direction > 0 ? slider.getTarget("next") : slider.getTarget("prev");

              if (slider.canAdvance(target) && (Number(new Date()) - startT < 550 && Math.abs(direction) > 50 || Math.abs(direction) > cwidth / 2)) {
                slider.flexAnimate(target, slider.vars.pauseOnAction);
              } else if (!fade) {
                slider.flexAnimate(slider.currentSlide, slider.vars.pauseOnAction, true);
              }
            }

            el.removeEventListener("touchend", onTouchEnd, false);
            startX = null;
            startY = null;
            dx = null;
            offset = null;
          };

          el.addEventListener("touchstart", onTouchStart, false);
        }
      },

      // ------------------------------------------
      // Window Resize Handler
      // ------------------------------------------
      resize: function() {
        if (!slider.animating && slider.is(":visible")) {
          if (!carousel) {
            slider.doMath();
          }

          if (fade) {
            methods.smoothHeight();
          } else if (carousel) {
            slider.slides.width(slider.computedW);
            slider.update(slider.pagingCount);
            slider.setProps();
          } else if (vertical) {
            slider.viewport.height(slider.h);
            slider.setProps(slider.h, "setTotal");
          } else {
            if (slider.vars.smoothHeight) {
              methods.smoothHeight();
            }
            slider.newSlides.width(slider.computedW);
            slider.setProps(slider.computedW, "setTotal");
          }
        }
      },

      // ------------------------------------------
      // Smooth Height Transition
      // ------------------------------------------
      smoothHeight: function(duration) {
        if (!vertical || fade) {
          var target = fade ? slider : slider.viewport;
          if (duration) {
            target.animate({ height: slider.slides.eq(slider.animatingTo).innerHeight() }, duration);
          } else {
            target.innerHeight(slider.slides.eq(slider.animatingTo).innerHeight());
          }
        }
      },

      // ------------------------------------------
      // Sync (for linked sliders)
      // ------------------------------------------
      sync: function(action) {
        var syncSlider = $(slider.vars.sync).data("flexslider"),
            target = slider.animatingTo;

        switch (action) {
          case "animate":
            syncSlider.flexAnimate(target, slider.vars.pauseOnAction, false, true);
            break;
          case "play":
            if (!syncSlider.playing && !syncSlider.asNav) {
              syncSlider.play();
            }
            break;
          case "pause":
            syncSlider.pause();
            break;
        }
      },

      // ------------------------------------------
      // Unique ID (for cloned slides)
      // ------------------------------------------
      uniqueID: function($clone) {
        $clone.filter("[id]").add($clone.find("[id]")).each(function() {
          var $this = $(this);
          $this.attr("id", $this.attr("id") + "_clone");
        });
        return $clone;
      },

      // ------------------------------------------
      // Pause When Tab is Hidden
      // ------------------------------------------
      pauseInvisible: {
        visProp: null,

        init: function() {
          var hiddenProp = methods.pauseInvisible.getHiddenProp();
          if (hiddenProp) {
            var eventName = hiddenProp.replace(/[H|h]idden/, "") + "visibilitychange";
            document.addEventListener(eventName, function() {
              if (methods.pauseInvisible.isHidden()) {
                if (slider.startTimeout) {
                  clearTimeout(slider.startTimeout);
                } else {
                  slider.pause();
                }
              } else {
                if (slider.started) {
                  slider.play();
                } else {
                  if (slider.vars.initDelay > 0) {
                    setTimeout(slider.play, slider.vars.initDelay);
                  } else {
                    slider.play();
                  }
                }
              }
            });
          }
        },

        isHidden: function() {
          var prop = methods.pauseInvisible.getHiddenProp();
          if (!prop) return false;
          return document[prop];
        },

        getHiddenProp: function() {
          var prefixes = ["webkit", "moz", "ms", "o"];
          if ("hidden" in document) return "hidden";
          for (var i = 0; i < prefixes.length; i++) {
            if ((prefixes[i] + "Hidden") in document) {
              return prefixes[i] + "Hidden";
            }
          }
          return null;
        }
      },

      // ------------------------------------------
      // Clear Watched Event (prevents ghost clicks)
      // ------------------------------------------
      setToClearWatchedEvent: function() {
        clearTimeout(watchedEventClearTimer);
        watchedEventClearTimer = setTimeout(function() {
          watchedEvent = "";
        }, 3000);
      }
    };

    // ==============================================
    // Public Methods
    // ==============================================

    // ------------------------------------------
    // flexAnimate - Main animation method
    // ------------------------------------------
    slider.flexAnimate = function(target, pause, override, withSync, fromNav) {
      // Set direction
      if (!slider.vars.animationLoop && target !== slider.currentSlide) {
        slider.direction = target > slider.currentSlide ? "next" : "prev";
      }

      // asNavFor direction
      if (asNavFor && slider.pagingCount === 1) {
        slider.direction = slider.currentItem < target ? "next" : "prev";
      }

      if (!slider.animating && (slider.canAdvance(target, fromNav) || override) && slider.is(":visible")) {

        // asNavFor sync
        if (asNavFor && withSync) {
          var master = $(slider.vars.asNavFor).data("flexslider");
          slider.atEnd = target === 0 || target === slider.count - 1;
          master.flexAnimate(target, true, false, true, fromNav);
          slider.direction = slider.currentItem < target ? "next" : "prev";
          master.direction = slider.direction;

          if (Math.ceil((target + 1) / slider.visible) - 1 === slider.currentSlide || target === 0) {
            slider.currentItem = target;
            slider.slides.removeClass(namespace + "active-slide").eq(target).addClass(namespace + "active-slide");
            return false;
          }
          slider.currentItem = target;
          slider.slides.removeClass(namespace + "active-slide").eq(target).addClass(namespace + "active-slide");
          target = Math.floor(target / slider.visible);
        }

        slider.animating = true;
        slider.animatingTo = target;

        // Pause on action
        if (pause) {
          slider.pause();
        }

        // Before callback
        slider.vars.before(slider);

        // Sync
        if (slider.syncExists && !fromNav) {
          methods.sync("animate");
        }

        // Update control nav
        if (slider.vars.controlNav) {
          methods.controlNav.active();
        }

        // Update active slide class
        if (!carousel) {
          slider.slides.removeClass(namespace + "active-slide").eq(target).addClass(namespace + "active-slide");
        }

        // Update atEnd flag
        slider.atEnd = target === 0 || target === slider.last;

        // Update direction nav
        if (slider.vars.directionNav) {
          methods.directionNav.update();
        }

        // End of slides
        if (target === slider.last) {
          slider.vars.end(slider);
          if (!slider.vars.animationLoop) {
            slider.pause();
          }
        }

        // ---- FADE Animation ----
        if (fade) {
          if (touch) {
            slider.slides.eq(slider.currentSlide).css({ opacity: 0, zIndex: 1 });
            slider.slides.eq(target).css({ opacity: 1, zIndex: 2 });
            slider.wrapup(cwidth);
          } else {
            slider.slides.eq(slider.currentSlide).css({ zIndex: 1 }).animate(
              { opacity: 0 },
              slider.vars.animationSpeed,
              slider.vars.easing
            );
            slider.slides.eq(target).css({ zIndex: 2 }).animate(
              { opacity: 1 },
              slider.vars.animationSpeed,
              slider.vars.easing,
              slider.wrapup
            );
          }

        // ---- SLIDE Animation ----
        } else {
          var dimension = vertical ? slider.slides.filter(":first").height() : slider.computedW,
              margin, slidePosition, targetPos;

          if (carousel) {
            margin = slider.vars.itemMargin;
            slidePosition = (slider.itemW + margin) * slider.move * slider.animatingTo;
            targetPos = slidePosition > slider.limit && slider.visible !== 1 ? slider.limit : slidePosition;
          } else {
            if (slider.currentSlide === 0 && target === slider.count - 1 && slider.vars.animationLoop && slider.direction !== "next") {
              targetPos = reverse ? (slider.count + slider.cloneOffset) * dimension : 0;
            } else if (slider.currentSlide === slider.last && target === 0 && slider.vars.animationLoop && slider.direction !== "prev") {
              targetPos = reverse ? 0 : (slider.count + 1) * dimension;
            } else {
              targetPos = reverse ? (slider.count - 1 - target + slider.cloneOffset) * dimension : (target + slider.cloneOffset) * dimension;
            }
          }

          slider.setProps(targetPos, "", slider.vars.animationSpeed);

          if (slider.transitions) {
            if (!slider.vars.animationLoop || !slider.atEnd) {
              slider.animating = false;
              slider.currentSlide = slider.animatingTo;
            }

            slider.container.unbind("webkitTransitionEnd transitionend");
            slider.container.bind("webkitTransitionEnd transitionend", function() {
              clearTimeout(slider.ensureAnimationEnd);
              slider.wrapup(dimension);
            });

            // Fallback timeout in case transitionend doesn't fire
            clearTimeout(slider.ensureAnimationEnd);
            slider.ensureAnimationEnd = setTimeout(function() {
              slider.wrapup(dimension);
            }, slider.vars.animationSpeed + 100);

          } else {
            slider.container.animate(
              slider.args,
              slider.vars.animationSpeed,
              slider.vars.easing,
              function() {
                slider.wrapup(dimension);
              }
            );
          }
        }

        // Smooth height
        if (slider.vars.smoothHeight) {
          methods.smoothHeight(slider.vars.animationSpeed);
        }
      }
    };

    // ------------------------------------------
    // wrapup - Called after animation completes
    // ------------------------------------------
    slider.wrapup = function(dimension) {
      if (!fade && !carousel) {
        // Jump to real slide position (for looping)
        if (slider.currentSlide === 0 && slider.animatingTo === slider.last && slider.vars.animationLoop) {
          slider.setProps(dimension, "jumpEnd");
        } else if (slider.currentSlide === slider.last && slider.animatingTo === 0 && slider.vars.animationLoop) {
          slider.setProps(dimension, "jumpStart");
        }
      }
      slider.animating = false;
      slider.currentSlide = slider.animatingTo;
      slider.vars.after(slider);
    };

    // ------------------------------------------
    // animateSlides - Auto-advance (called by interval)
    // ------------------------------------------
    slider.animateSlides = function() {
      if (!slider.animating && focused) {
        slider.flexAnimate(slider.getTarget("next"));
      }
    };

    // ------------------------------------------
    // pause - Stop slideshow
    // ------------------------------------------
    slider.pause = function() {
      clearInterval(slider.animatedSlides);
      slider.animatedSlides = null;
      slider.playing = false;
      if (slider.vars.pausePlay) {
        methods.pausePlay.update("play");
      }
      if (slider.syncExists) {
        methods.sync("pause");
      }
    };

    // ------------------------------------------
    // play - Start slideshow
    // ------------------------------------------
    slider.play = function() {
      if (slider.playing) {
        clearInterval(slider.animatedSlides);
      }
      slider.animatedSlides = slider.animatedSlides || setInterval(slider.animateSlides, slider.vars.slideshowSpeed);
      slider.started = slider.playing = true;
      if (slider.vars.pausePlay) {
        methods.pausePlay.update("pause");
      }
      if (slider.syncExists) {
        methods.sync("play");
      }
    };

    // ------------------------------------------
    // stop - Permanently stop slideshow
    // ------------------------------------------
    slider.stop = function() {
      slider.pause();
      slider.stopped = true;
    };

    // ------------------------------------------
    // canAdvance - Check if slide transition is allowed
    // ------------------------------------------
    slider.canAdvance = function(target, fromNav) {
      var last = asNavFor ? slider.pagingCount - 1 : slider.last;

      if (fromNav) return true;

      if (asNavFor && slider.currentItem === slider.count - 1 && target === 0 && slider.direction === "prev") {
        return true;
      }
      if (asNavFor && slider.currentItem === 0 && target === slider.pagingCount - 1 && slider.direction !== "next") {
        return false;
      }

      if (target === slider.currentSlide && !asNavFor) {
        return false;
      }

      if (slider.vars.animationLoop) {
        return true;
      }

      if (slider.atEnd && slider.currentSlide === 0 && target === last && slider.direction !== "next") {
        return false;
      }
      if (slider.atEnd && slider.currentSlide === last && target === 0 && slider.direction === "next") {
        return false;
      }

      return true;
    };

    // ------------------------------------------
    // getTarget - Get next/prev slide index
    // ------------------------------------------
    slider.getTarget = function(direction) {
      slider.direction = direction;
      if (direction === "next") {
        return slider.currentSlide === slider.last ? 0 : slider.currentSlide + 1;
      } else {
        return slider.currentSlide === 0 ? slider.last : slider.currentSlide - 1;
      }
    };

    // ------------------------------------------
    // setProps - Set CSS transform/position
    // ------------------------------------------
    slider.setProps = function(position, special, duration) {
      var value = (function() {
        var pos = position ? position : (slider.itemW + slider.vars.itemMargin) * slider.move * slider.animatingTo;

        var target = (function() {
          if (carousel) {
            if (special === "setTouch") return position;
            if (reverse && slider.animatingTo === slider.last) return 0;
            if (reverse) return slider.limit - (slider.itemW + slider.vars.itemMargin) * slider.move * slider.animatingTo;
            if (slider.animatingTo === slider.last) return slider.limit;
            return pos;
          }

          switch (special) {
            case "setTotal":
              return reverse ? (slider.count - 1 - slider.currentSlide + slider.cloneOffset) * position : (slider.currentSlide + slider.cloneOffset) * position;
            case "setTouch":
              return reverse ? position : position;
            case "jumpEnd":
              return reverse ? position : slider.count * position;
            case "jumpStart":
              return reverse ? slider.count * position : position;
            default:
              return position;
          }
        })();

        return (-1 * target) + "px";
      })();

      if (slider.transitions) {
        value = vertical ? "translate3d(0," + value + ",0)" : "translate3d(" + value + ",0,0)";
        duration = (duration !== undefined) ? (duration / 1000) + "s" : "0s";
        slider.container.css("-" + slider.pfx + "-transition-duration", duration);
        slider.container.css("transition-duration", duration);
      }

      slider.args[slider.prop] = value;
      if (slider.transitions || duration === undefined) {
        slider.container.css(slider.args);
      }
      slider.container.css("transform", value);
    };

    // ------------------------------------------
    // setup - Initial slide layout
    // ------------------------------------------
    slider.setup = function(type) {
      // ---- FADE setup ----
      if (fade) {
        slider.slides.css({
          width: "100%",
          "float": "left",
          marginRight: "-100%",
          position: "relative"
        });

        if (type === "init") {
          if (touch) {
            slider.slides.css({
              opacity: 0,
              display: "block",
              webkitTransition: "opacity " + slider.vars.animationSpeed / 1000 + "s ease",
              zIndex: 1
            }).eq(slider.currentSlide).css({ opacity: 1, zIndex: 2 });
          } else if (slider.vars.fadeFirstSlide === false) {
            slider.slides.css({ opacity: 0, display: "block", zIndex: 1 })
              .eq(slider.currentSlide).css({ zIndex: 2 }).css({ opacity: 1 });
          } else {
            slider.slides.css({ opacity: 0, display: "block", zIndex: 1 })
              .eq(slider.currentSlide).css({ zIndex: 2 })
              .animate({ opacity: 1 }, slider.vars.animationSpeed, slider.vars.easing);
          }
        }

        if (slider.vars.smoothHeight) {
          methods.smoothHeight();
        }

      // ---- SLIDE setup ----
      } else {
        var sliderOffset, arr;

        if (type === "init") {
          slider.viewport = $('<div class="' + namespace + 'viewport"></div>')
            .css({ overflow: "hidden", position: "relative" })
            .appendTo(slider)
            .append(slider.container);

          slider.cloneCount = 0;
          slider.cloneOffset = 0;

          // Reverse order
          if (reverse) {
            arr = $.makeArray(slider.slides).reverse();
            slider.slides = $(arr);
            slider.container.empty().append(slider.slides);
          }
        }

        // Animation loop: clone first and last slides
        if (slider.vars.animationLoop && !carousel) {
          slider.cloneCount = 2;
          slider.cloneOffset = 1;
          if (type !== "init") {
            slider.container.find(".clone").remove();
          }
          slider.container
            .append(methods.uniqueID(slider.slides.first().clone().addClass("clone")).attr("aria-hidden", "true"))
            .prepend(methods.uniqueID(slider.slides.last().clone().addClass("clone")).attr("aria-hidden", "true"));
        }

        slider.newSlides = $(slider.vars.selector, slider);
        sliderOffset = reverse ? slider.count - 1 - slider.currentSlide + slider.cloneOffset : slider.currentSlide + slider.cloneOffset;

        // Vertical (non-carousel)
        if (vertical && !carousel) {
          slider.container
            .height((slider.count + slider.cloneCount) * 200 + "%")
            .css("position", "absolute")
            .width("100%");

          setTimeout(function() {
            slider.newSlides.css({ display: "block" });
            slider.doMath();
            slider.viewport.height(slider.h);
            slider.setProps(sliderOffset * slider.h, "init");
          }, type === "init" ? 100 : 0);

        // Horizontal
        } else {
          slider.container.width((slider.count + slider.cloneCount) * 200 + "%");
          slider.setProps(sliderOffset * slider.computedW, "init");

          setTimeout(function() {
            slider.doMath();
            slider.newSlides.css({
              width: slider.computedW,
              marginRight: slider.computedM,
              "float": "left",
              display: "block"
            });
            if (slider.vars.smoothHeight) {
              methods.smoothHeight();
            }
          }, type === "init" ? 100 : 0);
        }
      }

      // Set active slide class
      if (!carousel) {
        slider.slides.removeClass(namespace + "active-slide").eq(slider.currentSlide).addClass(namespace + "active-slide");
      }

      // Init callback
      slider.vars.init(slider);
    };

    // ------------------------------------------
    // doMath - Calculate dimensions
    // ------------------------------------------
    slider.doMath = function() {
      var slide = slider.slides.first(),
          margin = slider.vars.itemMargin,
          minItems = slider.vars.minItems,
          maxItems = slider.vars.maxItems;

      slider.w = (slider.viewport === undefined) ? slider.width() : slider.viewport.width();
      slider.h = slide.height();
      slider.boxPadding = slide.outerWidth() - slide.width();

      if (carousel) {
        slider.itemT = slider.vars.itemWidth + margin;
        slider.itemM = margin;
        slider.minW = minItems ? minItems * slider.itemT : slider.w;
        slider.maxW = maxItems ? maxItems * slider.itemT - margin : slider.w;

        slider.itemW = (slider.minW > slider.w) ? (slider.w - margin * (minItems - 1)) / minItems :
                       (slider.maxW < slider.w) ? (slider.w - margin * (maxItems - 1)) / maxItems :
                       (slider.vars.itemWidth > slider.w) ? slider.w : slider.vars.itemWidth;

        slider.visible = Math.floor(slider.w / slider.itemW);
        slider.move = (slider.vars.move > 0 && slider.vars.move < slider.visible) ? slider.vars.move : slider.visible;
        slider.pagingCount = Math.ceil((slider.count - slider.visible) / slider.move + 1);
        slider.last = slider.pagingCount - 1;
        slider.limit = (slider.pagingCount === 1) ? 0 :
                       (slider.vars.itemWidth > slider.w) ? slider.itemW * (slider.count - 1) + margin * (slider.count - 1) :
                       (slider.itemW + margin) * slider.count - slider.w - margin;
      } else {
        slider.itemW = slider.w;
        slider.itemM = margin;
        slider.pagingCount = slider.count;
        slider.last = slider.count - 1;
      }

      slider.computedW = slider.itemW - slider.boxPadding;
      slider.computedM = slider.itemM;
    };

    // ------------------------------------------
    // update - Recalculate after add/remove
    // ------------------------------------------
    slider.update = function(pos, action) {
      slider.doMath();

      if (!carousel) {
        if (pos < slider.currentSlide) {
          slider.currentSlide += 1;
        } else if (pos <= slider.currentSlide && pos !== 0) {
          slider.currentSlide -= 1;
        }
        slider.animatingTo = slider.currentSlide;
      }

      if (slider.vars.controlNav && !slider.manualControls) {
        if ((action === "add" && !carousel) || slider.pagingCount > slider.controlNav.length) {
          methods.controlNav.update("add");
        } else if ((action === "remove" && !carousel) || slider.pagingCount < slider.controlNav.length) {
          if (carousel && slider.currentSlide > slider.last) {
            slider.currentSlide -= 1;
            slider.animatingTo -= 1;
          }
          methods.controlNav.update("remove", slider.last);
        }
      }

      if (slider.vars.directionNav) {
        methods.directionNav.update();
      }
    };

    // ------------------------------------------
    // addSlide - Dynamically add a slide
    // ------------------------------------------
    slider.addSlide = function(obj, pos) {
      var $obj = $(obj);
      slider.count += 1;
      slider.last = slider.count - 1;

      if (vertical && reverse) {
        pos !== undefined ? slider.slides.eq(slider.count - pos).after($obj) : slider.container.prepend($obj);
      } else {
        pos !== undefined ? slider.slides.eq(pos).before($obj) : slider.container.append($obj);
      }

      slider.update(pos, "add");
      slider.slides = $(slider.vars.selector + ":not(.clone)", slider);
      slider.setup();
      slider.vars.added(slider);
    };

    // ------------------------------------------
    // removeSlide - Dynamically remove a slide
    // ------------------------------------------
    slider.removeSlide = function(obj) {
      var pos = isNaN(obj) ? slider.slides.index($(obj)) : obj;
      slider.count -= 1;
      slider.last = slider.count - 1;

      if (isNaN(obj)) {
        $(obj, slider.slides).remove();
      } else {
        if (vertical && reverse) {
          slider.slides.eq(slider.last).remove();
        } else {
          slider.slides.eq(obj).remove();
        }
      }

      slider.doMath();
      slider.update(pos, "remove");
      slider.slides = $(slider.vars.selector + ":not(.clone)", slider);
      slider.setup();
      slider.vars.removed(slider);
    };

    // Initialize!
    methods.init();
  };

  // ==============================================
  // Window Focus/Blur (pause when window loses focus)
  // ==============================================
  $(window).blur(function() {
    focused = false;
  }).focus(function() {
    focused = true;
  });

  // ==============================================
  // Default Options
  // ==============================================
  $.flexslider.defaults = {
    namespace: "flex-",             // CSS class prefix
    selector: ".slides > li",      // Slide selector
    animation: "fade",             // "fade" or "slide"
    easing: "swing",               // jQuery easing
    direction: "horizontal",       // "horizontal" or "vertical"
    reverse: false,                // Reverse slide order
    animationLoop: true,           // Loop animation
    smoothHeight: false,           // Auto-adjust height
    startAt: 0,                    // Starting slide index
    slideshow: true,               // Auto-play
    slideshowSpeed: 7000,          // Time between slides (ms)
    animationSpeed: 600,           // Transition speed (ms)
    initDelay: 0,                  // Delay before first auto-play (ms)
    randomize: false,              // Randomize slide order
    fadeFirstSlide: true,          // Fade in first slide on load
    thumbCaptions: false,          // Show captions on thumbnails
    pauseOnAction: true,           // Pause on user interaction
    pauseOnHover: false,           // Pause on mouse hover
    pauseInvisible: true,          // Pause when tab is hidden
    useCSS: true,                  // Use CSS3 transitions
    touch: true,                   // Enable touch/swipe
    video: false,                  // Video slide support
    controlNav: true,              // Show control dots
    directionNav: true,            // Show prev/next arrows
    prevText: "Previous",          // Prev button text
    nextText: "Next",              // Next button text
    keyboard: true,                // Keyboard navigation
    multipleKeyboard: false,       // Allow keyboard for multiple sliders
    mousewheel: false,             // Mousewheel navigation
    pausePlay: false,              // Show pause/play button
    pauseText: "Pause",            // Pause button text
    playText: "Play",              // Play button text
    controlsContainer: "",         // External controls container selector
    manualControls: "",            // Manual control elements selector
    customDirectionNav: "",        // Custom prev/next elements selector
    sync: "",                      // Sync with another slider selector
    asNavFor: "",                  // Act as navigation for another slider
    itemWidth: 0,                  // Carousel item width (0 = full width)
    itemMargin: 0,                 // Carousel item margin
    minItems: 1,                   // Carousel minimum visible items
    maxItems: 0,                   // Carousel maximum visible items (0 = no max)
    move: 0,                       // Carousel items to move per transition (0 = auto)
    allowOneSlide: true,           // Allow slider with single slide

    // Callback functions
    start: function() {},          // Fires after slider initializes
    before: function() {},         // Fires before each slide transition
    after: function() {},          // Fires after each slide transition
    end: function() {},            // Fires when slider reaches last slide
    added: function() {},          // Fires after a slide is added
    removed: function() {},        // Fires after a slide is removed
    init: function() {}            // Fires after slider DOM is ready
  };

  // ==============================================
  // jQuery Plugin Interface
  // ==============================================
  $.fn.flexslider = function(options) {
    if (options === undefined) {
      options = {};
    }

    if (typeof options === "object") {
      return this.each(function() {
        var $this = $(this),
            selector = options.selector ? options.selector : ".slides > li",
            $slides = $this.find(selector);

        if (($slides.length === 1 && options.allowOneSlide === false) || $slides.length === 0) {
          $slides.fadeIn(400);
          if (options.start) {
            options.start($this);
          }
        } else if ($this.data("flexslider") === undefined) {
          new $.flexslider(this, options);
        }
      });
    } else {
      // String commands: "play", "pause", "stop", "next", "prev", or slide number
      var $slider = $(this).data("flexslider");
      switch (options) {
        case "play":
          $slider.play();
          break;
        case "pause":
          $slider.pause();
          break;
        case "stop":
          $slider.stop();
          break;
        case "next":
          $slider.flexAnimate($slider.getTarget("next"), true);
          break;
        case "prev":
        case "previous":
          $slider.flexAnimate($slider.getTarget("prev"), true);
          break;
        default:
          if (typeof options === "number") {
            $slider.flexAnimate(options, true);
          }
      }
    }
  };

})(jQuery);
