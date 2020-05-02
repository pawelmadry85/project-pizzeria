/* global rangeSlider */

import BaseWidget from './BaseWidget.js';
import {select, settings} from '../settings.js';
import { utils } from '../utils.js';

class HourPickier extends BaseWidget{
  constructor(wrapper){
    super(wrapper, settings.hours.open);

    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.input);

    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.output);

    thisWidget.initPlugin();
    thisWidget.value = thisWidget.dom.input.value;
  }

  initPlugin(){
    const thisWidget = this;

    rangeSlider.create(thisWidget.dom.input);

    thisWidget.dom.input.addEventListener('input', function(){
      thisWidget.value = thisWidget.dom.input.value;
    });

  }

  parseValue(newValue){
    return utils.numberToHour(newValue); //przekazanie otrzymanej wartosci do funkcji utils.numberToHour i zwrocenie wartosci otrzymanej z funkcji czyli zamiana 12 na 12:00 a 12.5 na 12:30
  }

  isValid(){
    return true;
  }

  renderValue(){
    const thisWidget = this;

    thisWidget.dom.output.innerHTML = thisWidget.value;
  }
}

export default HourPickier;
