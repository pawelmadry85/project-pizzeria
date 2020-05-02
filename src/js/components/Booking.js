import { templates, select } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element){
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidget();
  }

  render(element){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget(); //generowanie kodu HTML za pomoca szablonu templates.bookingWidget

    thisBooking.dom = {}; //pusty obiekt thisBooking.dom

    thisBooking.dom.wrapper = element; //zapisanie do obietku wlasciwosci wrapper rowna otrzymanemu argumentowi

    thisBooking.dom.wrapper.innerHTML = generatedHTML; //zamianna zawartosci wrappera na kod HTML wygenerowany z szablonu

    thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount); //zapisanie pojedynczego elementu znalezionego we wrapperze i pasujacego do selektora thisBooking.dom.peopleAmount

    thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount); //znalezienie i zapisanie hoursAmount analogicznie jak wyzej
  }

  initWidget(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount); //zapisywanie nowych instacji klasy AmountWidget i przekazanie jako argument wlasciwosci z obiektu thisBooking.dom
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount); //zapisywanie nowych instacji klasy AmountWidget i przekazanie jako argument wlasciwosci z obiektu thisBooking.dom
  }
}

export default Booking;
