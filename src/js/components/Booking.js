import {templates, select, settings} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element){
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();

    // console.log('thisBooking', thisBooking);
    // console.log('element', element);
  }

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };
    // console.log('getData params', params);

    const urls = {
      booking:       settings.db.url  + '/' + settings.db.booking
                                      + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url  + '/' + settings.db.event
                                      + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url  + '/' + settings.db.event
                                      + '?' + params.eventsRepeat.join('&'),
    };

    // console.log('getData urls', urls);
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];

        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),

        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        console.log(bookings);
        console.log(eventsCurrent);
        console.log(eventsRepeat);

      });

  }

  render(element){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget(); //generowanie kodu HTML za pomoca szablonu templates.bookingWidget

    thisBooking.dom = {}; //pusty obiekt thisBooking.dom

    thisBooking.dom.wrapper = element; //zapisanie do obietku wlasciwosci wrapper rowna otrzymanemu argumentowi

    thisBooking.dom.wrapper.innerHTML = generatedHTML; //zamianna zawartosci wrappera na kod HTML wygenerowany z szablonu

    thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount); //zapisanie pojedynczego elementu znalezionego we wrapperze i pasujacego do selektora thisBooking.dom.peopleAmount

    thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount); //znalezienie i zapisanie hoursAmount analogicznie jak wyzej

    thisBooking.dom.datePicker = element.querySelector(select.widgets.datePicker.wrapper);

    thisBooking.dom.hourPicker = element.querySelector(select.widgets.hourPicker.wrapper);
    // console.log(thisBooking.dom.hourPicker);

  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount); //zapisywanie nowych instacji klasy AmountWidget i przekazanie jako argument wlasciwosci z obiektu thisBooking.dom
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount); //zapisywanie nowych instacji klasy AmountWidget i przekazanie jako argument wlasciwosci z obiektu thisBooking.dom
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker); //tworzenie nowej instancji klasy DatePicker i zapisanie jej do wlasciwosci thisBooking.datePicker
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker); //tworzenie nowej instancji klasy HourPicker i zapisanie jej do wlasciwosci thisBooking.hourPicker
  }
}

export default Booking;
