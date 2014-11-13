/*
 * Custom select replacement (that's also accessible!)
 * Replaces a default select menu with a styleable div and list 
 * and passes values back and forth with each.
 * The select element's value is what's sent with the form, 
 * while the replacing element updates visually.
 *
 * UI: Chris Rodriguez (clrux)
 * Code: Fyodor Wolf (fydo23)
 * Created: 29 Oct 2014
 * Updated: 30 Oct 2014
 * Version: 0.2.2
 */

var KEY_TAB = 9;
var KEY_RETURN = 13;
var KEY_ESC = 27;
var KEY_UP = 38;
var KEY_DOWN = 40;
var KEY_SPACE = 32;

var PrettySelector = {

    oSelect:        false,
    oReplaced:      false,
    oToggler:       false,

    oTogglerDown:   'icon-sel-down',
    oTogglerUp:     'icon-sel-up',
    container:
    '<div class="search-in-replaced">'
        +'<span role="button" class="search-in-toggle" tabindex="0" aria-label="Expand search-in menu">'
            +'<span class="icon-sel-down"></span>'
        +'</span>'
        +'<ul data-expanded="false" aria-labelledby="keywords-in"></ul>'
    +'</div>',
    option: '<li role="button" data-section-id="0" data-option-value="all" data-selected="" tabindex="-1">Search All</li>',


    init: function(select) {
        s = this;
        s.oSelect = $(select);
        s.oSelect.after($(this.container));
        s.oReplaced = $('.search-in-replaced');
        s.oToggler = $('.search-in-toggle');
        s.oSelect.find('option').each(function(idx){
            $(this).attr('data-section-id',idx);
            $('.search-in-replaced').find('ul').append(
                $(s.option)
                    .attr("data-section-id",idx)
                    .attr('data-option-value',$(this).val())
                    .attr("data-selected", $(this).is(':selected'))
                    .html($(this).html())
            );
        });
        this.replaceSelectMenu();
        this.handleDropDown();
        this.setSelectedStatus();
    },

    replaceSelectMenu: function() {
        // s.oSelect.addClass('sr-only');
        s.oSelect.hide();
        s.oReplaced.show();
    },

    handleDropDown: function() {
        var that = this;

        s.oToggler.on('click keydown', function(e) {
            e.stopPropagation();
            if (e.which == KEY_TAB) return that.collapseReplacedMenu();
            if (e.which == KEY_RETURN) return $(this).closest('form').submit();
            if (s.oToggler.next().attr('data-expanded') == "true") {
                return that.collapseReplacedMenu();
            }
            return that.expandReplacedMenu();
        });

        s.oReplaced.find('li').on('click', function(e) {
            e.stopPropagation();
            if (s.oToggler.next().attr('data-expanded') == "true") {
                that.setSelectedStatus($(this).attr('data-section-id'));
            } 
            s.oToggler.trigger('click');
        });

        s.oSelect.on('change', function() {
            that.setSelectedStatus();
        });
    },

    expandReplacedMenu: function() {
        var that = this;

        s.oToggler.next().attr('data-expanded', true);
        s.oToggler.find('span').removeClass(s.oTogglerDown).addClass(s.oTogglerUp);

        liToFocus = s.oToggler.next().addClass('open').find('li:first')
        if (s.oToggler.next().find('[data-selected=true]').length){
            liToFocus = s.oToggler.next().find('[data-selected=true]');
        }
        liToFocus.focus();

        s.oToggler.next().off('keydown').on('keydown', function(e, f, l) {

            f = s.oToggler.next().find('li:focus');
            l = s.oToggler.next().find('li').length;

            switch(e.which){
                case KEY_DOWN:
                    that.moveFocusDown(e, f, l);
                    break;
                case KEY_UP:
                    that.moveFocusUp(e, f, l);
                    break;
                case KEY_RETURN:
                case KEY_SPACE:
                    select_section_id = f.attr('data-section-id');
                    that.setSelectedStatus(select_section_id);
                case KEY_TAB:
                    that.collapseReplacedMenu();
                default:
                    break;
            }
            return;
        });
    },

    collapseReplacedMenu: function() {
        s.oToggler.next().removeClass('open');
        s.oToggler.next().attr('data-expanded', false);
        s.oToggler.find('span').removeClass(s.oTogglerUp).addClass(s.oTogglerDown);
        s.oToggler.focus();
    },

    setSelectedStatus: function(selectedId) {
        if(!selectedId)
            selectedId = s.oSelect.find('option:selected').attr('data-section-id');
        if(!selectedId)
            selectedId = s.oSelect.find('option:first').attr('data-section-id');
        s.oReplaced.find('ul li').attr('data-selected', false);
        s.oSelect.find('option').removeAttr('selected').prop('selected', false);
        s.oReplaced.find('li[data-section-id='+selectedId+']').focus().attr('data-selected', true);
        sectionId = s.oReplaced.find('ul li[data-selected=true]').attr('data-section-id');
        s.oSelect.find('option[data-section-id="' + sectionId + '"]').attr('selected', 'selected').prop('selected', true);
    },

    moveFocusDown: function(e, f, l) {
        e.preventDefault();
        if (s.oToggler.next().find('li').index(f) >= l-1) return;
        f.next().focus();
    },

    moveFocusUp: function(e, f, l) {
        e.preventDefault();
        if (s.oToggler.next().find('li').index(f) <= 0) return;
        f.prev().focus();
    }
};