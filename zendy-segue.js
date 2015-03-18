// Namespace for package
Segue = {};

Segue.history = [];

Segue.addToHistory = function( routeName ){
    Segue.history.push( routeName );
}
Segue.removeFromHistory = function(){
    Segue.history.pop();
}
Segue.clearHistory = function() {
    Segue.history = [];
}

// Events for layout template
// Add the following to your Meteor app:
// Template.myLayoutTemplateName.events(Segue.events);
Segue.events = {
    'click': function ( evt ) {
        Segue.transition = 'segue-fade';
    },
    'click .icon-right-nav': function () {
        Segue.addToHistory(Iron.Location.get().path);
        Segue.transition = 'segue-right-to-left';
    },
    'click .navigate-right': function () {
        Segue.addToHistory(Iron.Location.get().path);
        Segue.transition = 'segue-right-to-left';
    },
    'click .icon-left-nav': function () {
        Segue.removeFromHistory();
        Segue.transition = 'segue-left-to-right';
    },
    'click .navigate-left': function () {
        Segue.removeFromHistory();
        Segue.transition = 'segue-left-to-right';
    },
    'click .toggle': function( event ){
        var toggle = $(event.target);
        if( toggle.hasClass( 'active' ) ){
            toggle.removeClass( 'active' );
        }else{
            toggle.addClass( 'active' );
        }
    },
    'click .toggle-handle': function( event ){
        var toggle = $(event.target).parent();
        if( toggle.hasClass( 'active' ) ){
            toggle.removeClass( 'active' );
        }else{
            toggle.addClass( 'active' );
        }
    }

};

// Helpers for layout template
// Add the following to your Meteor app:
// Template.myLayoutTemplateName.helpers(Segue.helpers);
Segue.helpers = {
    transition: function () {
        return function (from, to, element) {
            return Segue.transition || 'segue-fade';
        }
    }
};

// Spacebar helpers
if( Meteor.isClient ) {

    UI.registerHelper('getPreviousPage', function () {
        return Segue.history[Segue.history.length-1];
    });
    UI.registerHelper('isActive', function (args) {
        return args.hash.menu === args.hash.active ? 'active' : '';
    });
    UI.registerHelper('getCurrentRoute', function () {
        return Router.current().route.getName();
    });
    // XXX: make this a plugin itself?
    var sideToSide = function(fromX, toX) {
        return function(options) {
            options = _.extend({
                duration: 500,
                easing: 'ease-in-out'
            }, options);

            return {
                insertElement: function(node, next, done) {
                    var $node = $(node);

                    $node
                        .css('transform', 'translateX(' + fromX + ')')
                        .insertBefore(next)
                        .velocity({
                            translateX: [0, fromX]
                        }, {
                            easing: options.easing,
                            duration: options.duration,
                            queue: false,
                            complete: function() {
                                $node.css('transform', '');
                                done();
                            }
                        });
                },
                removeElement: function(node, done) {
                    var $node = $(node);

                    $node
                        .velocity({
                            translateX: [toX]
                        }, {
                            duration: options.duration,
                            easing: options.easing,
                            complete: function() {
                                $node.remove();
                                done();
                            }
                        });
                }
            }
        }
    }
    Momentum.registerPlugin('segue-right-to-left', sideToSide('100%', '-100%'));
    Momentum.registerPlugin('segue-left-to-right', sideToSide('-100%', '100%'));
    Momentum.registerPlugin('segue-fade', function(options) {
        Segue.clearHistory();
        return {
            insertElement: function(node, next) {
                $(node)
                    .hide()
                    .insertBefore(next)
                    .velocity('fadeIn');
            },
            removeElement: function(node) {
                $(node).velocity('fadeOut', function() {
                    $(this).remove();
                });
            }
        }
    });
}
