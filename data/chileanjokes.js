'use strict';

var ChileanJokes = function Constructor() {
    this.jokes = [
      {
        text: '-¿Papa, te puedo hacer una pregunta?\n-Si\n-¿Que planeta es este?\n-La tierra\n-Seguro\n-Si, ¿Tu profesora no te pasa geografía? \n-Si, pero ni ella sabe\n-¿Como no va a saber?\n-Cada vez que ve una noticia ella dice: "En que mundo estamos"'
      },
      {
        text: 'Una Secretaria encara al Jefe de Personal de la empresa donde trabaja, y le dice:\n- ¡Señor Jefe, va a tener que aumentarme el sueldo...! ¡Sepa que hay tres compañías que andan detrás mío!\n-¿Ah, sí...? ¿Y puede saberse cuáles son esas compañías...?\n-¡Pues...la compañía de luz, la de gas y la del teléfono!.'
      },
      {
        text: 'primer acto:una mosca con bata\nsegundo acto:otra mosca con bata\ntercer acto: otra mosca con bata \n\ncomo se llama la obra?\n\ncon bata la mosca :joy:'
      },
      {
        text: 'Había una vez un señor durmiendo y suena el telefono\n :telephone_receiver: RING,RING!!!!\nseñor:¿quien sera a esta hora?\n!alo¡\ntelefono:señor,¿usted fue el que pidio que lo despertaran a las 7:00?\nseñor:si,soy yo ¿que pasa?\ntelefono:pues le informo que puede dormir tres horitas mas...\nporque recien son las 4:00 :alarm_clock:'
      },
      {
        text: 'QUÉ LE DIJO UN ÁRBOL :christmas_tree: A OTRO ÁRBOL :deciduous_tree:?\n"Se te ve el pajarito :smirk:" :joy: '
      },
      {
        text: 'primer acto: sangre en un semáforo :vertical_traffic_light:\nsegundo acto: sangre en un disco pare :no_entry_sign:\ntercer acto: sangre en un ceda el paso :children_crossing:\npregunta: como se llama la obra ? :grey_question:\nrespuesta: LA REGLA DEL TRANSITO :eyes:\n'
      }
    ];
};

ChileanJokes.prototype.getRandomJoke = function () {
  var jokesCount = this.jokes.length;
  var random = Math.floor((Math.random() * jokesCount) + 1) - 1;
  return this.jokes[random];
};

module.exports = ChileanJokes;
