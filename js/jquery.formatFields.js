/**
 *
 * jquery.formatField
 * Author: emerson.morgado@gmail.com
 */
(function ($) {

    var settings = {};

    /**
     *  Verifica o tipo do elemento para processar corretamente
     */
    function checkType($el){
        // <input type="text" data-custom-type="number" value=""/>
        var dataType = $el.data('custom-type');
        switch (dataType) {
            case 'number':
                number($el);
                break;
            case 'phone':
                phone($el);
                break;
            case 'time':
                time($el);
                break;
            default:
                break;
        }
    }
    //····························································
    //  FORMATADORES
    //····························································

    function number($el){
        $el.on('keypress', function (event) {
            var which = event.which;
            if (event.ctrlKey && (which === 99 || which === 118 || which === 120)) {
                return true;
            }
            var numericKeyCodes = [];
            if ($el.data('allow-fp') == true) {
                numericKeyCodes = [0, 8, 44, 46, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57];
            } else {
                numericKeyCodes = [0, 8, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57];
            }
            if ($el.data('allow-negative') == true) {
                numericKeyCodes.push(45);
            }
            if ($.inArray(which, numericKeyCodes) > -1) {
                return true;
            } else {
                return false;
            }
        }).addClass('align-right');
    }

    function phone($el){
        $el.on('keyup', function (event) {
            var which = event.which;
            if (event.ctrlKey && (which === 99 || which === 118 || which === 120)) {
                return true;
            } else if (which === 8 || which === 0) {
                return true;
            }
            var phoneString = "";
            var strNumber = $el.val().replace(/[^0-9]/g, '');
            var phoneSize = 15;
            if (strNumber.length > 0) {
                phoneString = "("
            }
            if (strNumber.length < 11) {
                // (11) 1212-4567 - 1112124567
                $.each(strNumber.split(''), function (i, v) {
                    switch (i) {
                    case 1:
                        phoneString = phoneString + v + ") "
                        break;
                    case 6:
                        phoneString = phoneString + "-"
                    default:
                        if (phoneString.length < 14) {
                            phoneString = phoneString + v
                        }
                        break;
                    }
                });
                phoneSize = 14;
            } else if (strNumber.length < 12) {
                // (11) 12123-4567 - 11121234567
                $.each(strNumber.split(''), function (i, v) {
                    switch (i) {
                    case 1:
                        phoneString = phoneString + v + ") "
                        break;
                    case 7:
                        phoneString = phoneString + "-"
                    default:
                        if (phoneString.length < 15) {
                            phoneString = phoneString + v
                        }
                        break;
                    }
                });
                phoneSize = 15;
            } else {
                phoneString = $el.val();
            }
            $el.val(phoneString.replace(/[^0-9\)\(\-\ ]/g, '').substr(0, phoneSize));
        });
        $el.on('change', function () {
            if ($el.val().length > 0 && $el.val().length < 14) {
                $el.parent().addClass('has-error');
            } else {
                $el.parent().removeClass('has-error');
            }
        });
    }

    function time($el){
        var timeSize = 5;
        $el.on('keyup', function (event) {
            var which = event.which;

            if (event.ctrlKey && (which === 99 || which === 118 || which === 120)) {
                return true;
            } else if (which === 8 || which === 0 || which === 37 || which === 39) {
                return true;
            }

            var value = $el.val().replace(/[^0-9]/g, '');
            var timeString = "";

            // Adicionamos um atributo no data para identificar que o valor é valido
            // Quando o evento change é disparado
            $el.data('valid', false);

            // 00:00
            $.each(value.split(''), function (i, v) {
                switch (i) {
                case 2:
                    timeString = timeString += ':'+v
                    break;
                default:
                    timeString += v;
                    break;
                }
            });

            // Verifico os tempos
            if(timeString.length === timeSize){

                var value = $el.val().replace(/[^0-9]/g, '');
                var valid = true;
                var horas = value.substr(0,2);
                var minutos = value.substr(2,4);
                if(horas > 23){
                    valid = false;
                }
                if(minutos > 59){
                    valid = false;
                }
                $el.data('valid', valid);

                if(valid === true){
                    $el.parent().removeClass('has-error');
                }
            } else {
                $el.parent().addClass('has-error');
            }

            $el.val(timeString.replace(/[^0-9\:]/g, '').substr(0, timeSize));
        });
        $el.on('change', function () {

            if ( $el.data('valid') === false ) {
                $el.parent().addClass('has-error');
                $el.trigger("error", [{message: 'Data inválida.'}]); // Dispara o evento error
            } else {
                $el.parent().removeClass('has-error');
            }
        }).addClass('align-center');
    }


    //····························································
    //   INICIALIZAÇÃO
    //····························································
    var methods = {
        init: function (options) {
            if (this.length < 0) {
                return false;
            }
            settings = $.extend(settings, options);
            var $el = $(this);
            checkType($el);
        }
    }

    $.fn.formatFields = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.formatFields');
        }
    };

})(jQuery);

$(function(){
    $('input').each(function(i, el){
        $(el).formatFields();
    });
});
