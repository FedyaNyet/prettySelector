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
    '<div class="search-in-replaced" aria-hidden="true">'
        +'<span role="button" class="search-in-toggle" tabindex="0" aria-label="Expand search-in menu">'
            +'<span class="icon-sel-down"></span>'
        +'</span>'
        +'<ul data-expanded="false" aria-labelledby="keywords-in"></ul>'
    +'</div>',
    option: '<li role="button" data-section-id="0" data-option-value="all" data-selected="" tabindex="-1">Search All</li>',


    init: function(select) {
        that = this;
        this.oSelect = $(select);
        this.oSelect.after($(this.container));
        this.oReplaced = $('.search-in-replaced');
        this.oToggler = $('.search-in-toggle');
        this.oSelect.find('option').each(function(idx){
            $(this).attr('data-section-id',idx);
            $('.search-in-replaced').find('ul').append(
                $(that.option)
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
        this.oSelect.hide();
        this.oReplaced.show();
    },

    handleDropDown: function() {
        var that = this;

        this.oToggler.on('click keydown', function(e) {
            switch(e.which){
                case KEY_TAB:
                    break;
                case KEY_RETURN:
                    e.stopPropagation();
                    return $(this).closest('form').submit();
                default:
                    e.stopPropagation();
                    if (that.oToggler.next().attr('data-expanded') == "true")
                        return that.collapseReplacedMenu();
                    return that.expandReplacedMenu();
            }
        });

        this.oReplaced.find('li').on('click', function(e) {
            e.stopPropagation();
            if (that.oToggler.next().attr('data-expanded') == "true") {
                that.setSelectedStatus($(this).attr('data-section-id'));
            } 
            that.oToggler.trigger('click');
        });

        this.oSelect.on('change', function() {
            that.setSelectedStatus();
        });
    },

    expandReplacedMenu: function() {
        var that = this;

        this.oToggler.next().attr('data-expanded', true);
        this.oToggler.find('span').removeClass(this.oTogglerDown).addClass(this.oTogglerUp);

        liToFocus = this.oToggler.next().addClass('open').find('li:first')
        if (this.oToggler.next().find('[data-selected=true]').length){
            liToFocus = this.oToggler.next().find('[data-selected=true]');
        }
        liToFocus.focus();

        this.oToggler.next().off('keydown').on('keydown', function(e) {

            f = that.oToggler.next().find('li:focus');
            l = that.oToggler.next().find('li').length;

            switch(e.which){
                case KEY_DOWN:
                    that.moveFocusDown(e, f, l);
                    break;
                case KEY_UP:
                    that.moveFocusUp(e, f, l);
                    break;
                case KEY_SPACE:
                    e.preventDefault();
                case KEY_RETURN:
                    select_section_id = f.attr('data-section-id');
                    that.setSelectedStatus(select_section_id);
                    that.collapseReplacedMenu();
                case KEY_ESC:
                    that.collapseReplacedMenu();
                    break;
                case KEY_TAB:
                    e.preventDefault();
                    break;
                default:
                    break;
            }
            return;
        });
    },

    collapseReplacedMenu: function() {
       this.oToggler.next().removeClass('open');
       this.oToggler.next().attr('data-expanded', false);
       this.oToggler.find('span').removeClass(this.oTogglerUp).addClass(this.oTogglerDown);
       this.oToggler.focus();
    },

    setSelectedStatus: function(selectedId) {
        oVal = this.oSelect.val();
        if(!selectedId)
            selectedId = this.oSelect.find('option:selected').attr('data-section-id');
        if(!selectedId)
            selectedId = this.oSelect.find('option:first').attr('data-section-id');
        this.oReplaced.find('ul li').attr('data-selected', false);
        this.oSelect.find('option').removeAttr('selected').prop('selected', false);
        this.oReplaced.find('li[data-section-id='+selectedId+']').focus().attr('data-selected', true);
        sectionId = this.oReplaced.find('ul li[data-selected=true]').attr('data-section-id');
        nVal = this.oSelect.find('option[data-section-id="' + sectionId + '"]').attr('selected', 'selected').prop('selected', true).val();
        this.oSelect.val(nVal);    
        if(oVal !== nVal)
            this.oSelect.trigger('change');
    },

    moveFocusDown: function(e, f, l) {
        e.preventDefault();
        if (this.oToggler.next().find('li').index(f) >= l-1) return;
        f.next().focus();
    },

    moveFocusUp: function(e, f, l) {
        e.preventDefault();
        if (this.oToggler.next().find('li').index(f) <= 0) return;
        f.prev().focus();
    }
};