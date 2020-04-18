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
    //************************************************************** */
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
    //************************************************************** */

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
        thisProduct.addToCart();
      });
    }
    //************************************************************** */
    //Metoda sluzaca do przeliczania / obliczania wartosci zamowionego produktu.
    processOrder(){
      const thisProduct = this;

      /* read all data from the form (using utils.serializeFormToObject) and save it to const formData */
      const formData = utils.serializeFormToObject(thisProduct.form);

      thisProduct.params = {};

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

          if(optionSelected){

            if(!thisProduct.params[paramId]){

              thisProduct.params[paramId] = {
                label: param.label,
                options: {},
              };
            }

            thisProduct.params[paramId].options[optionId] = option.label;
            // console.log(thisProduct.params);

            for(let image of selectedImg){
              image.classList.add(classNames.menuProduct.imageVisible);
            }

          } else{

            for(let image of selectedImg){
              image.classList.remove(classNames.menuProduct.imageVisible);
            }
          }

          /* END LOOP: for each optionId in param.options */
        }

        /* END LOOP: for each paramId in thisProduct.data.params */
      }

      /** multiply price by amount */ //cena za calosc
      // price *= thisProduct.amountWidget.value;
      thisProduct.priceSingle = price; //cena jednej sztuki
      thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value; //cena za calosc = cena jednej sztuki * cyfra w widgecie amountWidget

      /* set the contents of thisProduct.priceElem to be the value of variable price */ //cena za sztuke
      // thisProduct.priceElem.textContent = price;
      thisProduct.priceElem.innerHTML = thisProduct.price;
    }
    //************************************************************** */
    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

      // console.log(thisProduct.amountWidget);

      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });
    }
    //************************************************************** */
    addToCart(){
      const thisProduct = this;

      thisProduct.name = thisProduct.data.name;
      thisProduct.amount = thisProduct.amountWidget.value;

      app.cart.add(thisProduct); //przekazanie calej instancji jako argumentu metody app.cart.add, metoda add otrzymuje odwolanie do tej instancji czyli mozliwosc odczytywania wlasciwosci i wykonywania jej metod.
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

      // console.log('new Cart: ', thisCart);
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {}; //tworzymy obiekt thisCart.dom do przechowywania wszystkich elementow DOM wyszukanych w komponencie koszyka
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger); //wyszukanie elementu ktoremu dodajemy listener eventu click czyli dodajemy selektor aktive
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList); //wyszukanie listy produktow w koszyku
    }

    initActions(){
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
    }

    add(menuProduct){
      const thisCart = this;

      /** generate HTML based on template */
      const generatedHTML = templates.cartProduct(menuProduct);
      // console.log(generatedHTML);

      /** create element using utils.createElementFromHTML */
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      // console.log(generatedDOM);

      thisCart.dom.productList.appendChild(generatedDOM);

      thisCart.products.push(new CartProduct(menuProduct, generatedDOM)); //tworzenie nowej instancji klasy new CartProduct oraz dodanie jej do tablicy thisCart.products
      console.log('thisCart.products: ', thisCart.products);

    }
  }

  class CartProduct {
    constructor(menuProduct, element){
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      // console.log(thisCartProduct);
    }

    getElements(element){
      const thisCartProduct = this;

      thisCartProduct.dom = {};

      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }

    initAmountWidget(){
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);

      // console.log(thisProduct.amountWidget);

      thisCartProduct.dom.amountWidget.addEventListener('updated', function(){

        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
        console.log(thisCartProduct.dom.price); //wstawieni ceny bedacej wynikiem mnozenia priceSingle i amount

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

    initCart: function(){
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },
  };
  app.init();
}
