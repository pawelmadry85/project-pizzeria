/* global flatpickr */

import BaseWidget from './BaseWidget.js';
import {select, settings} from '../settings.js';
import {utils} from '../utils.js';

class DatePicker extends BaseWidget{
  constructor(wrapper){
    super(wrapper, utils.dateToStr(new Date()));
    // const date = new Date();
    // console.log(date);

    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);

    thisWidget.initPlugin();
  }

  initPlugin() {
    const thisWidget = this;

    thisWidget.minDate = new Date(thisWidget.value);
    thisWidget.maxDate = new Date(utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture));

    console.log(thisWidget.minDate);
    console.log(thisWidget.maxDate);

    // add plugin flatpickr

    flatpickr(thisWidget.dom.input, {
      defaultDate: thisWidget.minDate,
      minDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,
      'disable': [
        function (date) {
          // return true to disable
          return (date.getDay() === 1); //nieczynne w poniedzialek
        }
      ],
      'locale': {
        'firstDayOfWeek': 1 //tydzien zaczynamy od poniedzialku
      },
      onChange: function (selectedDates, dateStr) { //wykrycie zmiany wartosci - wybor daty przez uzytkownika
        thisWidget.value = dateStr;
      },
    });

  }

  parseValue(newValue){ //nadpisanie metody parseValue, tak aby po prostu zwracala otrzymany argument, nie wykonujac na nim zadnej operacji
    return newValue;
  }

  isValid(){ //metoda isValid ma zwracac prawde true
    return true;
  }

  renderValue(){ //metoda z pusta wartoscia
  }
}

export default DatePicker;
