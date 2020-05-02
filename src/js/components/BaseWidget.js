class BaseWidget{
  constructor(wrapperElement, initialValue){
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;

    thisWidget.correctValue = initialValue;
  }

  get value(){
    const thisWidget = this;

    return thisWidget.correctValue;
  }

  set value(value){
    const thisWidget = this;

    const newValue = thisWidget.parseValue(value); //zapisujemy do zmiennej newValue wartosc przekazanego argumentu po przekonwertowaniu go na liczbe na wypadek gdyby argument byl tekstem

    /** TODO: Add validation */
    if(newValue != thisWidget.correctValue && thisWidget.isValid(newValue)) {

      thisWidget.correctValue = newValue; //zapisanie wartosci po przejsciu walidacji jako thisWidget.correctValue
      thisWidget.announce();
    }

    thisWidget.renderValue();
  }

  setValue(value){
    const thisWidget = this;

    thisWidget.value = value;
  }

  parseValue(value){
    return parseInt(value);
  }

  isValid(value){
    return !isNaN(value);
  }

  renderValue(){
    const thisWidget = this;

    thisWidget.dom.wrapper.innerHTML = thisWidget.value;
  }

  announce(){
    const thisWidget = this;

    // storzenie wslasnego eventu 'updated'
    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}

export default BaseWidget;
