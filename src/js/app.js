/* global $*/
import {settings, select, classNames} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';


const app = {

  initPages: function(){
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = thisApp.pages[0].id;

    // console.log('thisApp.pages: ', thisApp.pages);

    for(let page of thisApp.pages){
      if(page.id == idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash); //wczytanie pierwszej z podstron razem z jej id

    for(let link of thisApp.navLinks){
      link.addEventListener('click', function(event){
        event.preventDefault();
        
        const clickedElement = this;
        
        /** get page id from href attribute */
        const id = clickedElement.getAttribute('href').replace('#', '');

        // console.log('id', id);

        /** run thisApp.activatePage with that id */
        thisApp.activatePage(id);

        /** change URL hash */
        window.location.hash = '#/' + id;
      });
    }
  },

  activatePage: function(pageId){
    const thisApp = this;

    /** add class "active" to matching pages, remove from non-matching */
    for(let page of thisApp.pages){
      page.classList.toggle(classNames.pages.active, page.id == pageId);
      
      // console.log(`page: ${page.id} == ${pageId}`);

    }
    /** add class "active" to matching links, remove from non-matching */
    for(let link of thisApp.navLinks){
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId);
      // console.log('link: ', link);
    }
  },

  initMenu: function(){
    const thisApp = this;

    for(let productData in thisApp.data.products){
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initData: function(){
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.product; //adres endpointu

    fetch(url)
      .then(function(rawResponse){ //konwersja z .json na tablice
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        // console.log('parsedResponse', parsedResponse); //skonwertowana odpowiedz

        /** save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;
        /** execute initMenu method */
        thisApp.initMenu();

      });
    // console.log('thisApp.data', JSON.stringify(thisApp.data));
  },

  init: function(){
    const thisApp = this;

    thisApp.initData();
    thisApp.initCart();
    thisApp.initPages();
    thisApp.initBooking();
    thisApp.initCarousel();
  },

  initCart: function(){
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },

  initBooking: function(){
    const widgetContainer = document.querySelector(select.containerOf.booking); //znajdujemy kontener widgetu do rezerwacji stron

    new Booking(widgetContainer); //tworzymy nowa instacje klasy Booking ktorej przekazujemy kontener widgetu
  },

  initCarousel() {
    const thisApp = this;
    $('.carousel').carousel({
      interval: 3000
    });

    const logo = document.querySelector('.logo'); //klikniecie w logo odpala home

    logo.addEventListener('click', function () {
      thisApp.initPages();
    });

    // console.log('logo: ', logo);
  }

};
app.init();

