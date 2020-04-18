/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

// import { utils } from "stylelint";

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

  class Product{

    constructor(id, data){
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordian();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();

    }
    //************************************************************** */
    //Metoda, ktora bedzie renderowac (tworzyc) kod pojedynczego produktu na stronie.
    renderInMenu(){
      const thisProduct = this;
      /** generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      /** create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      /** find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);
      /** add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }
    //************************************************************** */
    //Metoda odnajdujaca elementy w kontenerze produktu. Spis tresci.
    getElements(){
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable); //wyszukanie elementu ktoremu dodajemy listener eventu click.
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form); //Formularz zamowienia produktu.
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs); //Wszystkie kontrolki formularza checkboxy, selecty, etc.
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton); //Przycisk dodawania do koszyka.
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem); //Cena produktu.
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper); //Pojedynczy element o slektorze '.product__images'
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget); //Pojedynczy element pasujacy do selektora '.widget-amount'
    }
    //******************************* PO ROZWINIECIU POKARZ OPCJE PRODUKTU ******************************* */

    //Metoda, ktora po kliknieciu bedzie pokazywala opcje produktu, wybor ilosci i button dodaj do koszyka.
    initAccordian(){
      const thisProduct = this;
      /* find the clickable trigger (the element that should react to clicking) */
      const clickableTriggers = thisProduct.accordionTrigger;
      /* START: click event listener to trigger */
      clickableTriggers.addEventListener('click', function(event){
        /* prevent default action for event */
        event.preventDefault();
        /* toggle active class on element of thisProduct */
        thisProduct.element.classList.toggle('active');
        /* find all active products */
        const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
        /* START LOOP: for each active product */
        for (let activeProduct of activeProducts) {
          /* START: if the active product isn't the element of thisProduct */
          if (activeProduct != thisProduct.element) {
            /* remove class active for the active product */
            activeProduct.classList.remove('active');
            /* END: if the active product isn't the element of thisProduct */
          }
          /* END LOOP: for each active product */
        }
        /* END: click event listener to trigger */
      });
      // console.log(clickableTriggers);
    }
    //****************************** NASLUCHUJEMY NA ZMIANY W FORMULARZU ******************************** */

    //Metoda reagujaca na zmiany w formularzu zamowienia produktu
    initOrderForm(){
      const thisProduct = this;
      // console.log('initOrderForm', thisProduct);

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
    }
    //********************************* OBLICZAMY WARTOSC PRODUKTU ***************************** */

    //Metoda sluzaca do przeliczania / obliczania wartosci zamowionego produktu.
    processOrder(){
      const thisProduct = this;

      /* read all data from the form (using utils.serializeFormToObject) and save it to const formData */
      const formData = utils.serializeFormToObject(thisProduct.form);

      /* set variable price to equal thisProduct.data.price */
      let price = thisProduct.data.price;

      /* START LOOP: for each paramId in thisProduct.data.params */
      for(let paramId in thisProduct.data.params){

        /* save the element in thisProduct.data.params with key paramId as const param */
        const param = thisProduct.data.params[paramId];

        /* START LOOP: for each optionId in param.options */
        for(let optionId in param.options){

          /* save the element in param.options with key optionId as const option */
          const option = param.options[optionId];

          /** Add optionSelected const */
          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;

          /* START IF: if option is selected and option is not default */
          if(optionSelected && !option.default){

            /* add price of option to variable price */
            price += option.price; // price = price + option.price
            /* END IF: if option is selected and option is not default */
          }

          /* START ELSE IF: if option is not selected and option is default */
          else if(!optionSelected && option.default) {

            /* deduct price of option from price */
            price -= option.price; // price = price - option.price
            /* END ELSE IF: if option is not selected and option is default */
          }

          //***************************** OBSLUGA NAKLADANIA OBRAZKOW ********************************* */

          const selectedImg = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);

          if (optionSelected) {

            for (let image of selectedImg) {
              image.classList.add(classNames.menuProduct.imageVisible);
            }

          } else {

            for (let image of selectedImg) {
              image.classList.remove(classNames.menuProduct.imageVisible);
            }
          }

          /* END LOOP: for each optionId in param.options */
        }

        /* END LOOP: for each paramId in thisProduct.data.params */
      }

      /** multiply price by amount */
      price *= thisProduct.amountWidget.value;

      /* set the contents of thisProduct.priceElem to be the value of variable price */
      thisProduct.priceElem.textContent = price;
    }
    //***************************** TWORZY INSTANCJE KLASY AmountWidget I ZAPISUJE JA WE WLASCIWOSCI PRODUKTU ********************************* */
    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

      // console.log(thisProduct.amountWidget);

      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });
    }
  }

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
      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }

  }

  class Cart{
    constructor(element){
      const thisCart = this; //tworzymy stala w ktorej zapisujemy obiekt this

      thisCart.products = []; //tworzymy tablice do przechowywania produktow dodanych do koszyka

      thisCart.getElements(element);
      thisCart.initActions();

      console.log('new Cart: ', thisCart);
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {}; //tworzymy obiekt thisCart.dom do przechowywania wszystkich elementow DOM wyszukanych w komponencie koszyka
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);

    }

    initActions(){
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

    }
  }

  const app = {
    initMenu: function(){
      const thisApp = this;

      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function(){
      const thisApp = this;
      thisApp.data = dataSource;
    },

    initCart: function(){
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function(){
      const thisApp = this;
      // console.log('*** App starting ***');
      // console.log('thisApp:', thisApp);
      // console.log('classNames:', classNames);
      // console.log('settings:', settings);
      // console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };
  app.init();
}
