import { templates, select, settings, classNames } from '../settings.js';
import { utils } from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  render(element) {
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget(); //generowanie kodu HTML za pomoca szablonu templates.bookingWidget
    
    thisBooking.dom = {}; //pusty obiekt thisBooking.dom
    thisBooking.dom.wrapper = element; //zapisanie do obietku wlasciwosci wrapper rowna otrzymanemu argumentowi
    thisBooking.dom.wrapper.innerHTML = generatedHTML; //zamianna zawartosci wrappera na kod HTML wygenerowany z szablonu
    thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount); //zapisanie pojedynczego elementu znalezionego we wrapperze 
    thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount); //znalezienie i zapisanie hoursAmount analogicznie jak wyzej
    thisBooking.dom.datePicker = element.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = element.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = element.querySelectorAll(select.booking.tables);
    thisBooking.dom.form = element.querySelector(select.booking.form);
    thisBooking.dom.address = element.querySelector(select.booking.address);
    thisBooking.dom.phone = element.querySelector(select.booking.phone);
    thisBooking.dom.starters = element.querySelectorAll(select.booking.starter);
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
    });

    thisBooking.dom.wrapper.addEventListener('submit', function (){
      event.preventDefault();

      thisBooking.sendBooking();
      thisBooking.getData();
    });
  }

  getData() {
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey = utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey = utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: utils.queryParams(startDateParam),
      eventsCurrent: settings.db.notRepeatParam + '&' + utils.queryParams(startDateParam),
      eventsRepeat: settings.db.repeatParam + '&' + utils.queryParams(endDateParam),
    };
    // console.log('getData params', params);

    const urls = { // adresy zapytan do API
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat,
    };
    // console.log('getData urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function ([bookingsResponse, eventsCurrentResponse, eventsRepeatResponse]) {
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsRepeat) {

      const minDate = thisBooking.datePicker.minDate;
      const maxDate = thisBooking.datePicker.maxDate;

      if (item.repeat == 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    // console.log('thisBooking.booked:', thisBooking.booked);

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, tables) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      // console.log('loop', hourBlock);

      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }

      // console.log(tables);

      for(let table of tables) {

        if (thisBooking.booked[date][hourBlock].indexOf(table) == -1) {

          for (let tableItem of tables) {
            thisBooking.booked[date][hourBlock].push(tableItem);
          }
        }
      }
    }
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value); //aktualna data i czas

    let allAvailable = false;

    if (typeof thisBooking.booked[thisBooking.date] == 'undefined' || typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined') {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);

      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
        console.log(tableId);
      }

      if (!allAvailable && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
        table.classList.remove(classNames.booking.tableChoosed);
      }
      
      table.addEventListener('click', function () {
        const tableChoosed = table.classList.contains(classNames.booking.tableBooked);
        
        if (!tableChoosed) {
          table.classList.add(classNames.booking.tableBooked);
          table.classList.add(classNames.booking.tableChoosed);
          thisBooking.tableIsBooked = tableId;
        }
      });
    }
  }

  sendBooking() {
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;

    const payload = {
      date: thisBooking.date,
      hour: utils.numberToHour(thisBooking.hour),
      duration: thisBooking.hoursAmount.value,
      table: [],
      ppl: thisBooking.peopleAmount.value,
      starters: [],
      address: thisBooking.dom.address.value,
      phone: thisBooking.dom.phone.value,
    };

    for (let table of thisBooking.dom.tables) {
      let tableChoosed = table.classList.contains(classNames.booking.tableChoosed);

      if (tableChoosed) {
        const tableId = table.getAttribute(settings.booking.tableIdAttribute);
        payload.table.push(tableId);
      }
    }

    for (let starter of thisBooking.dom.starters) {
      if (starter.checked == true) {
        payload.starters.push(starter.value);
      }
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse: ', parsedResponse);
        // console.log('payLoad', payload);
        thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
      });
  }
}

export default Booking;
