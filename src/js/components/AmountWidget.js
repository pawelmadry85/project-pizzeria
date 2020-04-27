import {select, settings} from '../settings.js';

class AmountWidget{

  constructor(element){
    const thisWidget = this;

    thisWidget.getElements(element);
    thisWidget.value = settings.amountWidget.defaultValue;
    thisWidget.setValue(thisWidget.input.value); //wywolanie metody setValue
    thisWidget.initActions(); //wywolanie metody initActions
  }

  getElements(element){
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }

  setValue(value){
    const thisWidget = this;
    const newValue = parseInt(value); //zapisujemy do zmiennej newValue wartosc przekazanego argumentu po przekonwertowaniu go na liczbe na wypadek gdyby argument byl tekstem

    /** TODO: Add validation */
    if(newValue != thisWidget.value && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {

      thisWidget.value = newValue; //zapisanie wartosci po przejsciu walidacji jako thisWidget.value
      thisWidget.announce();
    }
    thisWidget.input.value = thisWidget.value; //ustawienie nowej wartosci inputa - wyswietlenie na stronie
  }

  initActions() {
    const thisWidget = this;

    thisWidget.input.addEventListener('change', function(){
      thisWidget.setValue(thisWidget.input.value);
    });

    thisWidget.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });

    thisWidget.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
    // console.log(thisWidget);
  }

  announce(){
    const thisWidget = this;

    // storzenie wslasnego eventu 'updated'
    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.element.dispatchEvent(event);
  }
}
export default AmountWidget;
