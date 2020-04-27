import {select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';


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

  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

    // console.log(thisProduct.amountWidget);

    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }

  addToCart(){
    const thisProduct = this;

    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;

    // app.cart.add(thisProduct); //przekazanie calej instancji jako argumentu metody app.cart.add, metoda add otrzymuje odwolanie do tej instancji czyli mozliwosc odczytywania wlasciwosci i wykonywania jej metod.

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });
    thisProduct.element.dispatchEvent(event);

  }
}
export default Product;
