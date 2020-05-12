import {select, classNames, settings, templates} from '../settings.js';
import {utils} from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart{
  constructor(element){
    const thisCart = this; //tworzymy stala w ktorej zapisujemy obiekt this

    thisCart.products = []; //tworzymy tablice do przechowywania produktow dodanych do koszyka
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

    thisCart.getElements(element);
    thisCart.initActions();
  }

  getElements(element){
    const thisCart = this;

    thisCart.dom = {}; //tworzymy obiekt thisCart.dom do przechowywania wszystkich elementow DOM wyszukanych w komponencie koszyka
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList); //wyszukanie listy produktow w koszyku
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);

    thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

    for(let key of thisCart.renderTotalsKeys){
      thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
      // console.log(thisCart.dom[key]);
    }
  }

  initActions(){
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function(){ //nasluchujemy na klikniecie na koszyk i dodajemy klasie selektor active
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('updated', function(){ //nasluchujemy na liscie produktow, w ktorej umieszczamy produkty, w ktorych znajduje sie widget liczby sztuk, ktory generuje ten event, dzieki wlasciwosci bubbles "uslyszymy" go na tej liscie i mozemy wtedy wykonac metode update
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function(){
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
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
    // console.log('thisCart.products: ', thisCart.products);

    thisCart.update();

  }

  update(){
    const thisCart = this;

    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    for (let product of thisCart.products) {
      thisCart.subtotalPrice += product.price;
      thisCart.totalNumber += product.amount;
    }

    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee; //cena koncowa z podatkiem
    // console.log('totalPrice: ', thisCart.totalPrice);

    for(let key of thisCart.renderTotalsKeys){
      for(let elem of thisCart.dom[key]){
        elem.innerHTML = thisCart[key];
      }
    }
  }

  remove(cartProduct){
    const thisCart = this;

    const index = thisCart.products.indexOf(cartProduct);
    
    thisCart.products.splice(index,1);

    // console.log(thisCart.products);

    cartProduct.dom.wrapper.remove();

    thisCart.update();
  }

  sendOrder(){

    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.order;

    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalNumber: thisCart.totalNumber,
      subtotalPrice: thisCart.subtotalPrice,
      totalPrice: thisCart.totalPrice,
      deliveryFee: thisCart.deliveryFee,
      products: [],
    };

    // console.log('totalPrice', payload.totalPrice);

    for (let product of thisCart.products) {
      product.getData();
      delete product.dom;
      delete product.amountWidget;
      payload.products.push(product);
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
        console.log('parsedResponse ', parsedResponse);
      });
  }
}

export default Cart;
