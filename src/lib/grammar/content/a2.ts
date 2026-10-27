import type { GrammarTopic } from "../types";

export const A2: GrammarTopic[] = [
  {
    slug: "past-simple",
    level: "A2",
    title: "El pasado simple",
    english: "Past simple",
    summary:
      "Sirve para hablar de acciones terminadas en un momento concreto del pasado: ayer, la semana pasada o hace un año.",
    sections: [
      {
        heading: "Cuándo se usa",
        body: "Usa el pasado simple para acciones que empezaron y terminaron en el pasado, sobre todo cuando dices o sabes cuándo pasaron: *yesterday*, *last week*, *two days ago*, *in 2020*.\n\n- *I called my mom yesterday.*\n- *We moved to Guadalajara three years ago.*\n\nEquivale casi siempre al pretérito del español (*llamé*, *nos mudamos*) y a veces al imperfecto cuando hablas de hábitos: *I played soccer every Saturday* («jugaba futbol cada sábado»). La forma es la misma para todas las personas: *I worked*, *she worked*, *they worked*.",
      },
      {
        heading: "Verbos regulares e irregulares",
        body: "Los verbos regulares forman el pasado con **-ed**, con algunas reglas de ortografía:\n\n- Regla general: *work* → *worked*, *play* → *played*\n- Si termina en *-e*, solo se añade *-d*: *live* → *lived*\n- Si termina en consonante + *y*, cambia a *-ied*: *study* → *studied* (pero *play* → *played*)\n- Si tiene una sílaba con consonante-vocal-consonante, se duplica la última letra: *stop* → *stopped*, *plan* → *planned*\n\nLos irregulares no siguen ninguna regla y hay que aprenderlos de memoria: *go* → *went*, *have* → *had*, *eat* → *ate*, *buy* → *bought*, *see* → *saw*.",
      },
      {
        heading: "Cómo se pronuncia la terminación -ed",
        body: "La terminación **-ed** tiene tres pronunciaciones y casi nunca suena como «ed»:\n\n1. **/t/** después de sonidos sordos (*p*, *k*, *f*, *s*, *sh*, *ch*): *stopped*, *worked*, *watched*\n2. **/d/** después de sonidos sonoros y vocales: *played*, *lived*, *called*\n3. **/ɪd/** solo después de *t* o *d*: *wanted*, *needed*, *visited*\n\nSolo en el tercer caso se añade una sílaba. *Worked* tiene una sílaba («workt»), no dos. Pronunciar «work-ed» es uno de los errores más comunes de los hispanohablantes.",
      },
      {
        heading: "Negativas y preguntas con did",
        body: "Para negar y preguntar se usa el auxiliar **did** con todas las personas. Como *did* ya indica el pasado, el verbo principal vuelve a su forma base:\n\n- Negativa: *I didn't go* (no *I didn't went*)\n- Pregunta: *Did you see the game?*\n- Con palabra interrogativa: *Where did you go?*\n- Respuestas cortas: *Yes, I did.* / *No, I didn't.*\n\nOjo: el verbo *be* no usa *did*. Se dice *I wasn't tired* y *Were you at home?*",
      },
    ],
    tables: [
      {
        caption: "Formas del pasado simple",
        columns: ["Forma", "Regular (work)", "Irregular (go)"],
        rows: [
          ["Afirmativa", "I worked yesterday.", "I went home early."],
          ["Negativa", "I didn't work yesterday.", "I didn't go home early."],
          ["Pregunta", "Did you work yesterday?", "Did you go home early?"],
          ["Respuesta corta", "Yes, I did. / No, I didn't.", "Yes, I did. / No, I didn't."],
        ],
      },
      {
        caption: "Pronunciación de -ed",
        columns: ["Sonido", "Después de", "Ejemplos"],
        rows: [
          ["/t/", "sonidos sordos: p, k, f, s, sh, ch", "stopped, worked, laughed, washed, watched"],
          ["/d/", "sonidos sonoros y vocales", "played, lived, called, opened"],
          ["/ɪd/", "t y d", "wanted, needed, visited, decided"],
        ],
      },
    ],
    examples: [
      ["I watched a movie with my sister last night.", "Anoche vi una película con mi hermana."],
      ["We went to the beach in December.", "Fuimos a la playa en diciembre."],
      ["She didn't call me yesterday.", "Ella no me llamó ayer."],
      ["Did you finish your homework?", "¿Terminaste tu tarea?"],
      ["They bought a new car two weeks ago.", "Compraron un carro nuevo hace dos semanas."],
      ["I studied English for three hours.", "Estudié inglés durante tres horas."],
      ["What did you eat for breakfast?", "¿Qué desayunaste?"],
      ["He lost his keys and missed the bus.", "Perdió sus llaves y se le fue el autobús."],
    ],
    mistakes: [
      [
        "I didn't went to the party.",
        "I didn't go to the party.",
        "Después de *didn't* el verbo va en forma base, porque el pasado ya está en *did*.",
      ],
      [
        "Did you saw the game?",
        "Did you see the game?",
        "En las preguntas con *did* el verbo principal no cambia a pasado.",
      ],
      [
        "Where you went last weekend?",
        "Where did you go last weekend?",
        "Las preguntas en pasado necesitan *did* antes del sujeto.",
      ],
      [
        "I study a lot yesterday.",
        "I studied a lot yesterday.",
        "Con *yesterday* la acción es pasada, así que el verbo necesita la forma en pasado.",
      ],
    ],
    quiz: [
      {
        prompt: "Last summer we ___ to Cancún.",
        options: ["go", "went", "goed", "gone"],
        answer: 1,
        explanation: "*Go* es irregular y su pasado es *went*.",
      },
      {
        prompt: "I didn't ___ your message.",
        options: ["see", "saw", "seen"],
        answer: 0,
        explanation: "Después de *didn't* va el verbo en forma base.",
      },
      {
        prompt: "___ you call your mom yesterday?",
        options: ["Do", "Were", "Did"],
        answer: 2,
        explanation: "Las preguntas en pasado con un verbo distinto de *be* se forman con *did*.",
      },
      {
        prompt: "¿Cómo se pronuncia la terminación de *wanted*?",
        options: ["/t/", "/d/", "/ɪd/"],
        answer: 2,
        explanation: "Después de *t* o *d*, la terminación *-ed* se pronuncia /ɪd/ y añade una sílaba.",
      },
      {
        prompt: "She ___ for her exam last weekend.",
        options: ["studyed", "studyied", "study", "studied"],
        answer: 3,
        explanation: "Si el verbo termina en consonante + *y*, la *y* cambia a *-ied*: *study* → *studied*.",
      },
    ],
  },
  {
    slug: "past-continuous",
    level: "A2",
    title: "El pasado continuo",
    english: "Past continuous",
    summary:
      "Describe una acción que estaba en progreso en un momento del pasado, a menudo interrumpida por otra más corta.",
    sections: [
      {
        heading: "Cuándo se usa",
        body: "El pasado continuo describe una acción que **estaba en progreso** en un momento del pasado. Se usa para:\n\n- Decir qué hacías a cierta hora: *At nine I was having dinner.*\n- Describir el fondo de una historia: *It was raining and people were running.*\n- Una acción larga interrumpida por otra corta: *I was cooking when the phone rang.*\n- Dos acciones largas al mismo tiempo: *I was reading while she was watching TV.*\n\nEquivale a «estaba + gerundio» (*estaba cocinando*) y muchas veces al imperfecto (*cocinaba*).",
      },
      {
        heading: "Cómo se forma",
        body: "Se forma con **was** o **were** + verbo con **-ing**:\n\n- *was* con *I*, *he*, *she* e *it*\n- *were* con *you*, *we* y *they*\n\nPara negar se añade *not*: *wasn't*, *weren't*. Para preguntar se invierte el orden: *Were you sleeping?* Respuestas cortas: *Yes, I was.* / *No, I wasn't.*\n\nOrtografía de *-ing*: si el verbo termina en *-e*, se quita (*make* → *making*); si tiene una sílaba con consonante-vocal-consonante, se duplica la última letra (*run* → *running*, *sit* → *sitting*).",
      },
      {
        heading: "When y while",
        body: "Los dos conectores unen el pasado continuo con el pasado simple, pero cada uno introduce un tipo de acción:\n\n- **when** + pasado simple: la acción corta que interrumpe. *I was sleeping when you called.*\n- **while** + pasado continuo: la acción larga. *While I was sleeping, you called.*\n\nSi la oración empieza con *when* o *while*, pon una coma después de esa parte. Si las dos acciones van en pasado simple con *when*, una pasa después de la otra: *When you called, I answered.*",
      },
      {
        heading: "Ojo con el imperfecto",
        body: "El imperfecto del español no siempre se traduce con pasado continuo:\n\n- Para hábitos se usa el pasado simple: «De niño vivía en Puebla» → *As a child, I lived in Puebla.*\n- Los verbos de estado (*know*, *like*, *want*, *need*, *understand*) casi nunca van en forma continua: «Sabía la respuesta» → *I knew the answer*, no *I was knowing*.\n\nUsa el pasado continuo solo cuando la acción estaba realmente en desarrollo en ese momento.",
      },
    ],
    tables: [
      {
        caption: "Formas del pasado continuo",
        columns: ["Sujeto", "Afirmativa", "Negativa", "Pregunta"],
        rows: [
          ["I", "I was working.", "I wasn't working.", "Was I working?"],
          ["he / she / it", "She was working.", "She wasn't working.", "Was she working?"],
          ["you / we / they", "They were working.", "They weren't working.", "Were they working?"],
        ],
      },
      {
        caption: "Pasado continuo con pasado simple",
        columns: ["Conector", "Estructura", "Ejemplo"],
        rows: [
          ["when", "pasado continuo + when + pasado simple", "I was driving when it started to rain."],
          ["while", "while + pasado continuo, pasado simple", "While I was driving, it started to rain."],
          ["while", "pasado continuo + while + pasado continuo", "She was cooking while he was cleaning."],
        ],
      },
    ],
    examples: [
      ["I was taking a shower when the lights went out.", "Me estaba bañando cuando se fue la luz."],
      ["What were you doing at ten last night?", "¿Qué estabas haciendo anoche a las diez?"],
      ["It was raining, so we stayed home.", "Estaba lloviendo, así que nos quedamos en casa."],
      ["While I was cooking, my brother was setting the table.", "Mientras yo cocinaba, mi hermano ponía la mesa."],
      ["She wasn't listening when the teacher explained the homework.", "No estaba poniendo atención cuando la maestra explicó la tarea."],
      ["We were walking to the park when we saw an accident.", "Íbamos caminando al parque cuando vimos un accidente."],
      ["Were you working when I called you?", "¿Estabas trabajando cuando te llamé?"],
      ["They weren't sleeping; they were playing video games.", "No estaban durmiendo; estaban jugando videojuegos."],
    ],
    mistakes: [
      [
        "I was cook when you called.",
        "I was cooking when you called.",
        "Después de *was* o *were* el verbo necesita la terminación *-ing*.",
      ],
      [
        "They was playing soccer.",
        "They were playing soccer.",
        "Con *you*, *we* y *they* se usa *were*, no *was*.",
      ],
      [
        "I was knowing the answer.",
        "I knew the answer.",
        "Los verbos de estado como *know* no se usan en forma continua.",
      ],
      [
        "I was reading when the doorbell was ringing.",
        "I was reading when the doorbell rang.",
        "La acción corta que interrumpe va en pasado simple, no en continuo.",
      ],
    ],
    quiz: [
      {
        prompt: "Yesterday at 7 a.m. we ___ breakfast.",
        options: ["were having", "was having", "were have"],
        answer: 0,
        explanation: "Con *we* se usa *were* y el verbo lleva *-ing*.",
      },
      {
        prompt: "I was watching TV when my dad ___ home.",
        options: ["arriving", "arrived", "arrives", "arrive"],
        answer: 1,
        explanation: "La acción corta que interrumpe va en pasado simple.",
      },
      {
        prompt: "I was walking to school ___ I found a wallet.",
        options: ["while", "during", "when"],
        answer: 2,
        explanation: "*When* introduce la acción corta en pasado simple que interrumpe a la larga.",
      },
      {
        prompt: "She ___ studying when I saw her; she was sleeping.",
        options: ["wasn't", "weren't", "didn't"],
        answer: 0,
        explanation: "La negativa del pasado continuo con *she* es *wasn't* + verbo con *-ing*.",
      },
      {
        prompt: "¿Cuál es la pregunta correcta?",
        options: [
          "Did you sleeping when I called?",
          "Was you sleeping when I called?",
          "Were you sleeping when I called?",
        ],
        answer: 2,
        explanation: "La pregunta se forma invirtiendo *were* y el sujeto, y con *you* siempre va *were*.",
      },
    ],
  },
  {
    slug: "comparatives-superlatives",
    level: "A2",
    title: "Comparativos y superlativos",
    english: "Comparatives and superlatives",
    summary:
      "Sirven para comparar dos cosas o para decir que una destaca sobre todas las demás de su grupo.",
    sections: [
      {
        heading: "Adjetivos cortos: -er y -est",
        body: "Los adjetivos de una sílaba forman el comparativo con **-er** y el superlativo con **the** + **-est**: *tall* → *taller* → *the tallest*.\n\n- Si terminan en *-e*, solo se añade *-r* o *-st*: *nice* → *nicer* → *the nicest*\n- Si tienen consonante-vocal-consonante, se duplica la última letra: *big* → *bigger* → *the biggest*\n- Los de dos sílabas terminados en *-y* cambian la *y* por *i*: *happy* → *happier* → *the happiest*\n\nPara comparar dos cosas se usa **than**: *My brother is taller than me.*",
      },
      {
        heading: "Adjetivos largos: more y most",
        body: "En general, los adjetivos de dos sílabas o más (salvo los terminados en *-y*) usan **more** y **the most**:\n\n- *expensive* → *more expensive* → *the most expensive*\n- *interesting* → *more interesting* → *the most interesting*\n\nEn español siempre decimos «más», pero en inglés *more* es solo para adjetivos largos. Nunca se combinan las dos formas: *more bigger* es incorrecto. Para lo contrario se usa *less*: *This hotel is less expensive than that one.*",
      },
      {
        heading: "Irregulares y el superlativo",
        body: "Algunos adjetivos muy comunes son irregulares:\n\n- *good* → *better* → *the best*\n- *bad* → *worse* → *the worst*\n- *far* → *farther* / *further* → *the farthest* / *the furthest*\n\nEl superlativo casi siempre lleva *the*: *She's the best student.* Para decir «de» después del superlativo, con lugares y grupos se usa **in**: «el más alto de la clase» → *the tallest in the class*; «la mejor taquería de la ciudad» → *the best taco place in the city*.",
      },
      {
        heading: "Igualdad con as … as",
        body: "Para decir que dos cosas son iguales se usa **as** + adjetivo + **as**, que equivale a «tan … como»: *Ana is as tall as her mom.*\n\nEn negativa significa «no tan … como»: *My phone isn't as expensive as yours.* Es una forma muy natural de decir que algo es menos.\n\nCon *as … as* el adjetivo no cambia: *as tall as*, nunca *as taller as*. Y recuerda: después de un comparativo, «que» se dice *than*, no *that*: *older than me*.",
      },
    ],
    tables: [
      {
        caption: "Cómo se forman",
        columns: ["Tipo", "Adjetivo", "Comparativo", "Superlativo"],
        rows: [
          ["Una sílaba", "cheap", "cheaper", "the cheapest"],
          ["Termina en -e", "nice", "nicer", "the nicest"],
          ["Consonante-vocal-consonante", "big", "bigger", "the biggest"],
          ["Termina en -y", "easy", "easier", "the easiest"],
          ["Dos sílabas o más", "expensive", "more expensive", "the most expensive"],
          ["Irregular", "good", "better", "the best"],
          ["Irregular", "bad", "worse", "the worst"],
          ["Irregular", "far", "farther / further", "the farthest / the furthest"],
        ],
      },
      {
        caption: "Comparar dos cosas",
        columns: ["Estructura", "Ejemplo", "Significado"],
        rows: [
          ["comparativo + than", "Ana is taller than Tom.", "Ana es más alta que Tom."],
          ["as + adjetivo + as", "Tom is as tall as Ana.", "Tom es tan alto como Ana."],
          ["not as + adjetivo + as", "Tom isn't as tall as Ana.", "Tom no es tan alto como Ana."],
        ],
      },
    ],
    examples: [
      ["My sister is older than me.", "Mi hermana es mayor que yo."],
      ["This is the best taco place in the city.", "Esta es la mejor taquería de la ciudad."],
      ["Today is hotter than yesterday.", "Hoy hace más calor que ayer."],
      ["The exam was easier than I expected.", "El examen fue más fácil de lo que esperaba."],
      ["Is the airport farther than the bus station?", "¿El aeropuerto está más lejos que la central de autobuses?"],
      ["My new phone isn't as expensive as my old one.", "Mi celular nuevo no es tan caro como el anterior."],
      ["It was the worst day of the week.", "Fue el peor día de la semana."],
      ["This chair is more comfortable than the sofa.", "Esta silla es más cómoda que el sillón."],
    ],
    mistakes: [
      [
        "She is more tall than me.",
        "She is taller than me.",
        "Los adjetivos cortos forman el comparativo con *-er*, no con *more*.",
      ],
      [
        "This book is more better.",
        "This book is better.",
        "*Better* ya es comparativo y no se combina con *more*.",
      ],
      [
        "He is taller that his father.",
        "He is taller than his father.",
        "Después de un comparativo, «que» se dice *than*.",
      ],
      [
        "She is the smartest of the class.",
        "She is the smartest in the class.",
        "Con lugares y grupos el superlativo usa *in*, no *of*.",
      ],
    ],
    quiz: [
      {
        prompt: "My house is ___ than yours.",
        options: ["big", "bigger", "biggest", "more big"],
        answer: 1,
        explanation: "*Big* es corto: su comparativo es *bigger*, con la *g* duplicada.",
      },
      {
        prompt: "This is ___ restaurant in town.",
        options: ["the most good", "the better", "the best", "best"],
        answer: 2,
        explanation: "El superlativo de *good* es irregular y lleva *the*: *the best*.",
      },
      {
        prompt: "My car isn't as fast ___ yours.",
        options: ["as", "than", "that"],
        answer: 0,
        explanation: "La estructura de igualdad es *as* + adjetivo + *as*, también en negativa.",
      },
      {
        prompt: "For me, math is ___ than history.",
        options: ["difficulter", "most difficult", "the more difficult", "more difficult"],
        answer: 3,
        explanation: "*Difficult* es un adjetivo largo, así que su comparativo es *more difficult*.",
      },
      {
        prompt: "Yesterday was bad, but today is even ___.",
        options: ["worse", "badder", "worst"],
        answer: 0,
        explanation: "El comparativo irregular de *bad* es *worse*; *worst* es el superlativo.",
      },
    ],
  },
  {
    slug: "going-to-and-will",
    level: "A2",
    title: "El futuro con going to y will",
    english: "Going to vs will",
    summary:
      "Explica cómo hablar de planes, predicciones, decisiones del momento y promesas, y qué forma de futuro elegir en cada caso.",
    sections: [
      {
        heading: "Going to: planes y evidencias",
        body: "Se forma con **be** + **going to** + verbo base y equivale a «voy a + infinitivo». Se usa para:\n\n- Planes e intenciones que decidiste **antes** de hablar: *I'm going to visit my grandma this weekend.*\n- Predicciones basadas en algo que ves o sabes ahora: *Look at those clouds. It's going to rain.*\n\nNegativa: *I'm not going to buy it.* Pregunta: *Are you going to come?* En la conversación rápida suena como *gonna*, pero no lo escribas en textos formales.",
      },
      {
        heading: "Will: decisiones, promesas y predicciones",
        body: "Se forma con **will** + verbo base, igual para todas las personas. Se contrae como *'ll* y la negativa es *won't*. Se usa para:\n\n- Decisiones tomadas en el momento: *The phone is ringing. I'll get it.*\n- Promesas y ofrecimientos: *I'll help you. I won't tell anyone.*\n- Predicciones basadas en tu opinión, a menudo con *I think* o *probably*: *I think you'll love this movie.*\n\nEn español solemos usar el presente para decisiones rápidas («Yo contesto»), pero en inglés se necesita *will*: *I'll answer it.*",
      },
      {
        heading: "¿Cuál elijo?",
        body: "Pregúntate cuándo tomaste la decisión y en qué se basa tu predicción:\n\n- Ya lo tenías planeado → *going to*: *I'm going to buy a bike. I already have the money.*\n- Lo decides ahora mismo → *will*: *Oh, it's on sale! I'll buy it.*\n- Ves una señal clara → *going to*: *Be careful! You're going to fall.*\n- Es tu opinión o creencia → *will*: *I think Mexico will win.*",
      },
      {
        heading: "Planes fijos: presente continuo",
        body: "Para citas y planes ya acordados con otras personas, con fecha u hora, el inglés usa mucho el **presente continuo**:\n\n- *I'm meeting Ana at six.*\n- *We're flying to Cancún on Friday.*\n\n*Going to* también es correcto aquí, pero el presente continuo suena más natural cuando el plan ya está en la agenda. En español decimos «Mañana veo a Ana», pero en inglés no se usa el presente simple para planes personales: *I'm seeing Ana tomorrow*, no *I see Ana tomorrow*.",
      },
    ],
    tables: [
      {
        caption: "Formas",
        columns: ["Forma", "going to", "will"],
        rows: [
          ["Afirmativa", "She's going to travel.", "She'll travel."],
          ["Negativa", "She isn't going to travel.", "She won't travel."],
          ["Pregunta", "Is she going to travel?", "Will she travel?"],
        ],
      },
      {
        caption: "Usos",
        columns: ["Uso", "Estructura", "Ejemplo"],
        rows: [
          ["Plan decidido antes", "be going to + verbo", "I'm going to study medicine."],
          ["Predicción con evidencia", "be going to + verbo", "Look at the sky. It's going to rain."],
          ["Decisión en el momento", "will + verbo", "I'm thirsty. I'll get some water."],
          ["Promesa u ofrecimiento", "will + verbo", "I'll call you tonight."],
          ["Predicción con opinión", "will + verbo", "I think it will be a great party."],
          ["Plan fijo con fecha u hora", "presente continuo", "I'm seeing the dentist at four."],
        ],
      },
    ],
    examples: [
      ["We're going to paint the kitchen this weekend.", "Vamos a pintar la cocina este fin de semana."],
      ["Watch out! You're going to drop your phone.", "¡Cuidado! Se te va a caer el celular."],
      ["I'm cold. I'll close the window.", "Tengo frío. Cierro la ventana."],
      ["Don't worry, I won't forget your birthday.", "No te preocupes, no voy a olvidar tu cumpleaños."],
      ["I think it will be sunny tomorrow.", "Creo que mañana va a hacer sol."],
      ["Are you going to watch the game tonight?", "¿Vas a ver el partido hoy en la noche?"],
      ["I'm having lunch with my boss on Friday.", "El viernes como con mi jefe."],
      ["Will you help me with these boxes?", "¿Me ayudas con estas cajas?"],
    ],
    mistakes: [
      [
        "I will to call you later.",
        "I'll call you later.",
        "Después de *will* va el verbo en forma base, sin *to*.",
      ],
      [
        "The phone is ringing. I answer it.",
        "The phone is ringing. I'll answer it.",
        "Para una decisión tomada en el momento se usa *will*, no el presente.",
      ],
      [
        "I going to travel next month.",
        "I'm going to travel next month.",
        "*Going to* necesita el verbo *be*: *am*, *is* o *are*.",
      ],
      [
        "Tomorrow I see the doctor at ten.",
        "Tomorrow I'm seeing the doctor at ten.",
        "Para citas y planes fijos se usa el presente continuo, no el presente simple.",
      ],
    ],
    quiz: [
      {
        prompt: "Look at those black clouds! It ___ rain.",
        options: ["going to", "is going to", "will to"],
        answer: 1,
        explanation: "Para predecir algo que ya se ve venir se usa *be going to*, y no puede faltar *is*.",
      },
      {
        prompt: "A: I'm so thirsty. B: Wait here, I ___ you a glass of water.",
        options: ["'ll get", "get", "got"],
        answer: 0,
        explanation: "Es un ofrecimiento decidido en ese momento, así que se usa *will*.",
      },
      {
        prompt: "¿Qué expresa *I'm going to study medicine*?",
        options: ["Una decisión que acabas de tomar", "Una promesa", "Un plan que ya tenías decidido"],
        answer: 2,
        explanation: "*Going to* expresa planes e intenciones decididos antes de hablar.",
      },
      {
        prompt: "I promise I ___ tell anyone your secret.",
        options: ["don't", "won't", "am not"],
        answer: 1,
        explanation: "Las promesas se expresan con *will*, y su negativa es *won't*.",
      },
      {
        prompt: "I think you ___ love this movie.",
        options: ["will", "are", "going to"],
        answer: 0,
        explanation: "Para una predicción basada en tu opinión, con *I think*, se usa *will* + verbo base.",
      },
    ],
  },
  {
    slug: "countable-uncountable",
    level: "A2",
    title: "Sustantivos contables e incontables",
    english: "Countable and uncountable nouns",
    summary:
      "Aprende qué sustantivos se pueden contar y qué palabras usar con cada tipo para hablar de cantidades.",
    sections: [
      {
        heading: "Contables e incontables",
        body: "Los sustantivos **contables** se pueden contar uno por uno: tienen singular y plural y pueden llevar *a* o *an*: *an apple*, *two apples*.\n\nLos **incontables** son sustancias, materiales o ideas que no se cuentan por unidades: *water*, *rice*, *money*, *time*, *music*. No llevan *a* ni *an*, no tienen plural y van con el verbo en singular: *The water is cold.*\n\nPara contarlos se usa una unidad o un recipiente: *a glass of water*, *two bottles of milk*, *a piece of cake*.",
      },
      {
        heading: "Trampas para hispanohablantes",
        body: "Algunas palabras que en español usamos en plural son incontables en inglés:\n\n- *advice* (consejos): *some advice* o *a piece of advice*, nunca *an advice* ni *advices*\n- *information* (información, datos): nunca *informations*\n- *news* (noticias): termina en *-s*, pero va con verbo singular: *The news is good.*\n- *furniture* (muebles), *homework* (tareas), *luggage* (maletas, equipaje)\n\nPara hablar de una sola unidad, usa *a piece of*: *a piece of furniture* es «un mueble».",
      },
      {
        heading: "Some, any, much y many",
        body: "Estas palabras dependen del tipo de sustantivo y del tipo de oración:\n\n- **some**: en afirmativas, con contables en plural e incontables: *I have some friends in Canada. We need some milk.* También en ofrecimientos y peticiones: *Would you like some coffee?*\n- **any**: en negativas y preguntas: *There aren't any eggs. Do you have any money?*\n- **many**: con contables en plural: *How many people came?*\n- **much**: con incontables: *How much time do we have?*\n\n*Much* y *many* se usan sobre todo en negativas y preguntas. En afirmativas suena más natural *a lot of*: *I have a lot of work*, mejor que *I have much work*.",
      },
      {
        heading: "A lot of, a few y a little",
        body: "Para hablar de cantidades en afirmativas, estas son las más útiles:\n\n- **a lot of** (o *lots of*): «mucho» o «muchos», con contables e incontables: *a lot of books*, *a lot of water*\n- **a few** + contable en plural: «unos cuantos»: *I need a few minutes.*\n- **a little** + incontable: «un poco de»: *Add a little salt.*\n\nCuidado: sin *a*, *few* y *little* significan «poco» o «pocos» con un tono negativo, como si no fuera suficiente: *I have a few friends* (tengo algunos amigos) frente a *I have few friends* (tengo pocos amigos).",
      },
    ],
    tables: [
      {
        caption: "Qué palabra usar con cada tipo",
        columns: ["Palabra", "Contables en plural", "Incontables"],
        rows: [
          ["some", "some eggs", "some milk"],
          ["any", "any eggs", "any milk"],
          ["many", "many eggs", "—"],
          ["much", "—", "much milk"],
          ["a lot of", "a lot of eggs", "a lot of milk"],
          ["a few", "a few eggs", "—"],
          ["a little", "—", "a little milk"],
          ["How …?", "How many eggs?", "How much milk?"],
        ],
      },
      {
        caption: "Cómo contar los incontables",
        columns: ["Incontable", "Una unidad", "Español"],
        rows: [
          ["advice", "a piece of advice", "un consejo"],
          ["information", "a piece of information", "un dato"],
          ["news", "a piece of news", "una noticia"],
          ["furniture", "a piece of furniture", "un mueble"],
          ["bread", "a slice of bread", "una rebanada de pan"],
          ["water", "a glass of water", "un vaso de agua"],
        ],
      },
    ],
    examples: [
      ["Can you give me some advice?", "¿Me puedes dar un consejo?"],
      ["There isn't any milk in the fridge.", "No hay leche en el refri."],
      ["How many brothers and sisters do you have?", "¿Cuántos hermanos tienes?"],
      ["We don't have much time.", "No tenemos mucho tiempo."],
      ["I have a lot of homework this week.", "Tengo mucha tarea esta semana."],
      ["I need a few minutes to get ready.", "Necesito unos minutos para arreglarme."],
      ["Add a little salt to the soup.", "Ponle un poco de sal a la sopa."],
      ["I have some good news for you!", "¡Tengo buenas noticias para ti!"],
    ],
    mistakes: [
      [
        "She gave me a good advice.",
        "She gave me some good advice.",
        "*Advice* es incontable: no lleva *a* ni tiene plural.",
      ],
      [
        "I need more informations.",
        "I need more information.",
        "*Information* es incontable y nunca lleva *-s*.",
      ],
      [
        "How much people came?",
        "How many people came?",
        "*People* es un plural contable, así que se usa *many*.",
      ],
      [
        "The news are bad.",
        "The news is bad.",
        "*News* parece plural, pero es incontable y va con verbo singular.",
      ],
    ],
    quiz: [
      {
        prompt: "There isn't ___ coffee left.",
        options: ["some", "any", "many"],
        answer: 1,
        explanation: "En negativas se usa *any*, y *many* no va con incontables como *coffee*.",
      },
      {
        prompt: "How ___ apples do we need?",
        options: ["many", "much", "little"],
        answer: 0,
        explanation: "*Apples* es contable en plural, así que se pregunta con *How many*.",
      },
      {
        prompt: "Can I give you ___ advice?",
        options: ["an", "a", "some", "many"],
        answer: 2,
        explanation: "*Advice* es incontable: no lleva *a* ni *an* y se usa con *some*.",
      },
      {
        prompt: "I only need ___ sugar in my coffee.",
        options: ["a few", "many", "few", "a little"],
        answer: 3,
        explanation: "Con incontables como *sugar*, «un poco de» se dice *a little*.",
      },
      {
        prompt: "¿Cuál oración es correcta?",
        options: ["The news are terrible.", "The news is terrible.", "The newses are terrible."],
        answer: 1,
        explanation: "*News* es incontable y va con verbo en singular.",
      },
    ],
  },
  {
    slug: "adverbs-of-frequency",
    level: "A2",
    title: "Adverbios de frecuencia",
    english: "Adverbs of frequency",
    summary:
      "Sirven para decir con qué frecuencia haces algo, desde siempre hasta nunca, y tienen un lugar fijo en la oración.",
    sections: [
      {
        heading: "Qué expresan",
        body: "Los adverbios de frecuencia responden a la pregunta «¿con qué frecuencia?» y van de *always* (siempre) a *never* (nunca). Se usan sobre todo con el presente simple para hablar de rutinas y hábitos: *I usually get up at seven.*\n\nAlgunos matices:\n\n- *often* es «a menudo» o «seguido»; en su pronunciación la *t* suele ser muda («ófen»)\n- *rarely* y *hardly ever* significan «casi nunca»\n- *usually* y *normally* son casi sinónimos",
      },
      {
        heading: "Posición en la oración",
        body: "En español el adverbio puede moverse («Siempre llego tarde», «Llego siempre tarde»), pero en inglés tiene un lugar fijo:\n\n- **Antes del verbo principal**: *I usually walk to work. She never eats meat.*\n- **Después del verbo be**: *He is always late. They are often tired.*\n- **Entre el auxiliar y el verbo**: *I don't usually drink coffee. I can never remember her name.*\n\nNunca va entre el verbo y su complemento: *I go always to the gym* es incorrecto.",
      },
      {
        heading: "Never y las negativas",
        body: "*Never* ya es negativo, así que no se combina con *don't* ni *doesn't*. En español decimos «No como nunca carne», pero en inglés solo hay una negación: *I never eat meat.*\n\nCon los demás adverbios sí puedes usar una negativa normal: *I don't often go out* («no salgo mucho»).\n\n*Sometimes* y *usually* también pueden ir al principio de la oración: *Sometimes I cook dinner.* *Always* y *never* no suelen ir al principio, salvo en órdenes como *Never give up.*",
      },
      {
        heading: "Preguntas con How often",
        body: "Para preguntar por la frecuencia se usa **How often** + *do/does* + sujeto + verbo: *How often do you go to the gym?*\n\nPuedes responder con un adverbio o con una expresión de frecuencia, que va al final de la oración:\n\n- *every day*, *every weekend*\n- *once a week* (una vez a la semana), *twice a month* (dos veces al mes), *three times a year* (tres veces al año)\n\nEn preguntas de sí o no, el adverbio va después del sujeto: *Do you often eat out?*",
      },
    ],
    tables: [
      {
        caption: "Escala de frecuencia",
        columns: ["Adverbio", "Español", "Frecuencia aproximada"],
        rows: [
          ["always", "siempre", "100 %"],
          ["usually", "normalmente", "80 %"],
          ["often", "a menudo", "60 %"],
          ["sometimes", "a veces", "40 %"],
          ["rarely / hardly ever", "casi nunca", "10 %"],
          ["never", "nunca", "0 %"],
        ],
      },
      {
        caption: "Dónde va el adverbio",
        columns: ["Caso", "Posición", "Ejemplo"],
        rows: [
          ["Verbo normal", "antes del verbo", "I often play soccer."],
          ["Verbo be", "después de be", "She is never late."],
          ["Auxiliar o modal", "entre el auxiliar y el verbo", "I don't usually cook. / I can always help."],
          ["Pregunta", "después del sujeto", "Do you usually take the bus?"],
        ],
      },
    ],
    examples: [
      ["I always have coffee in the morning.", "Siempre tomo café en la mañana."],
      ["She is usually at home on Sundays.", "Normalmente está en casa los domingos."],
      ["We often eat tacos on Fridays.", "Con frecuencia comemos tacos los viernes."],
      ["Sometimes I forget my keys.", "A veces se me olvidan las llaves."],
      ["He rarely watches TV.", "Casi nunca ve la tele."],
      ["I never drink soda.", "Nunca tomo refresco."],
      ["How often do you call your parents?", "¿Cada cuánto llamas a tus papás?"],
      ["I go to the gym three times a week.", "Voy al gimnasio tres veces a la semana."],
    ],
    mistakes: [
      [
        "I go always to work by bus.",
        "I always go to work by bus.",
        "El adverbio va antes del verbo principal, no después.",
      ],
      [
        "She always is happy.",
        "She is always happy.",
        "Con el verbo *be*, el adverbio va después.",
      ],
      [
        "I don't never eat meat.",
        "I never eat meat.",
        "*Never* ya es negativo y en inglés no se usa doble negación.",
      ],
      [
        "How often you go to the movies?",
        "How often do you go to the movies?",
        "Las preguntas con *How often* necesitan el auxiliar *do* o *does*.",
      ],
    ],
    quiz: [
      {
        prompt: "I ___ breakfast at 7 a.m.",
        options: ["usually have", "have usually", "usually having"],
        answer: 0,
        explanation: "El adverbio va antes del verbo principal, que se conjuga en presente simple.",
      },
      {
        prompt: "¿Cuál es el orden correcto?",
        options: ["She always is tired.", "She is always tired.", "Always she is tired."],
        answer: 1,
        explanation: "Con el verbo *be*, el adverbio de frecuencia va después.",
      },
      {
        prompt: "___ do you go to the dentist? — Twice a year.",
        options: ["How much", "How many", "How often"],
        answer: 2,
        explanation: "Para preguntar con qué frecuencia se usa *How often*.",
      },
      {
        prompt: "I ___ eat fish. I hate it!",
        options: ["always", "usually", "often", "never"],
        answer: 3,
        explanation: "Si odias el pescado, lo lógico es que nunca lo comas: *never*.",
      },
      {
        prompt: "¿Cómo se dice «Nunca como carne»?",
        options: ["I never eat meat.", "I eat never meat.", "I don't eat never meat."],
        answer: 0,
        explanation: "*Never* va antes del verbo principal y no se combina con *don't*.",
      },
    ],
  },
  {
    slug: "have-to-must",
    level: "A2",
    title: "Obligación: have to y must",
    english: "Have to and must",
    summary:
      "Sirve para expresar obligación, falta de obligación y prohibición, sin confundir «no tener que» con «no deber».",
    sections: [
      {
        heading: "Obligación: must y have to",
        body: "Los dos significan «tener que» o «deber» y van seguidos del verbo base:\n\n- **must**: obligación que siente quien habla, o reglas escritas y avisos: *I must call my mom. Passengers must wear a seatbelt.*\n- **have to**: obligación que viene de fuera (trabajo, escuela, leyes) y es la forma más común en la conversación: *I have to wear a uniform at work.*\n\n*Must* nunca cambia ni lleva *to*: *she must*, no *she musts*. *Have to* sí se conjuga: *she has to*. *Must* no tiene pasado; se usa *had to*: *Yesterday I had to work late.*",
      },
      {
        heading: "Don't have to: no es necesario",
        body: "**Don't have to** (*doesn't have to* con *he*, *she* e *it*) indica que **no hay obligación**: puedes hacerlo si quieres, pero no es necesario.\n\n- *You don't have to come.* (No tienes que venir.)\n- *She doesn't have to work on Saturdays.*\n\nLas preguntas se forman con *do* o *does*: *Do you have to wear a uniform? Does he have to pay?*\n\nPronunciación: *have to* suena «jáf-ta» y *has to* suena «jás-ta».",
      },
      {
        heading: "Mustn't: está prohibido",
        body: "**Mustn't** (*must not*) significa que algo **está prohibido** o que es muy importante no hacerlo:\n\n- *You mustn't smoke here.*\n- *You mustn't tell anyone.*\n\nSe pronuncia «más-ent»: la primera *t* es muda. En inglés americano hablado se oye más *can't* para las prohibiciones: *You can't park here.*",
      },
      {
        heading: "La trampa: don't have to no es mustn't",
        body: "En español «no tienes que» y «no debes» se parecen, pero en inglés significan cosas muy distintas:\n\n- *You don't have to pay.* = No es necesario pagar (es gratis u opcional).\n- *You mustn't pay.* = Está prohibido pagar.\n\nUn truco: si puedes añadir «si no quieres», usa *don't have to*. Si la idea es «no lo hagas, está prohibido», usa *mustn't*.",
      },
    ],
    tables: [
      {
        caption: "Obligación, falta de obligación y prohibición",
        columns: ["Significado", "Estructura", "Ejemplo"],
        rows: [
          ["Obligación", "must + verbo", "You must wear a helmet."],
          ["Obligación", "have to / has to + verbo", "She has to get up early."],
          ["Sin obligación", "don't / doesn't have to + verbo", "You don't have to bring anything."],
          ["Prohibición", "mustn't + verbo", "You mustn't use your phone in the exam."],
          ["Obligación en pasado", "had to + verbo", "We had to wait an hour."],
        ],
      },
      {
        caption: "Have to en todas sus formas",
        columns: ["Forma", "I / you / we / they", "he / she / it"],
        rows: [
          ["Afirmativa", "I have to work.", "He has to work."],
          ["Negativa", "I don't have to work.", "He doesn't have to work."],
          ["Pregunta", "Do you have to work?", "Does he have to work?"],
        ],
      },
    ],
    examples: [
      ["I have to finish this report today.", "Tengo que terminar este reporte hoy."],
      ["You must be at the airport two hours before your flight.", "Debes estar en el aeropuerto dos horas antes de tu vuelo."],
      ["You don't have to bring anything to the party.", "No tienes que traer nada a la fiesta."],
      ["You mustn't touch the paintings.", "No debes tocar las pinturas."],
      ["Does your sister have to wear a uniform?", "¿Tu hermana tiene que usar uniforme?"],
      ["We had to take a taxi because it was raining.", "Tuvimos que tomar un taxi porque estaba lloviendo."],
      ["Tomorrow is Sunday, so I don't have to get up early.", "Mañana es domingo, así que no tengo que levantarme temprano."],
      ["I must remember to call the bank.", "Tengo que acordarme de llamar al banco."],
    ],
    mistakes: [
      [
        "She have to work tomorrow.",
        "She has to work tomorrow.",
        "Con *he*, *she* e *it* se usa *has to*.",
      ],
      [
        "You must to wear a helmet.",
        "You must wear a helmet.",
        "*Must* va seguido del verbo sin *to*.",
      ],
      [
        "You mustn't come if you're busy.",
        "You don't have to come if you're busy.",
        "Si algo es opcional se usa *don't have to*; *mustn't* significa que está prohibido.",
      ],
      [
        "Yesterday I must work late.",
        "Yesterday I had to work late.",
        "*Must* no tiene pasado; para el pasado se usa *had to*.",
      ],
    ],
    quiz: [
      {
        prompt: "The museum is free. You ___ pay.",
        options: ["mustn't", "don't have to", "must"],
        answer: 1,
        explanation: "Si es gratis, pagar no es necesario, pero tampoco está prohibido: *don't have to*.",
      },
      {
        prompt: "You ___ use your phone during the exam. It's not allowed.",
        options: ["mustn't", "don't have to", "have to"],
        answer: 0,
        explanation: "Algo que no está permitido es una prohibición, y se expresa con *mustn't*.",
      },
      {
        prompt: "My dad ___ work on Saturdays.",
        options: ["have to", "musts", "must to", "has to"],
        answer: 3,
        explanation: "Con *he*, *she* e *it* se usa *has to*; *must* no cambia ni lleva *to*.",
      },
      {
        prompt: "Last week we ___ study for three exams.",
        options: ["had to", "must", "musted"],
        answer: 0,
        explanation: "*Must* no tiene pasado, así que la obligación en pasado se expresa con *had to*.",
      },
      {
        prompt: "¿Qué significa *You don't have to wait*?",
        options: ["Está prohibido esperar.", "Debes esperar.", "No es necesario que esperes."],
        answer: 2,
        explanation: "*Don't have to* indica que no hay obligación, no que esté prohibido.",
      },
    ],
  },
  {
    slug: "object-pronouns",
    level: "A2",
    title: "Pronombres de sujeto y de objeto",
    english: "Subject and object pronouns",
    summary:
      "Distingue los pronombres que hacen la acción de los que la reciben, y aprende dónde va cada uno en la oración.",
    sections: [
      {
        heading: "Sujeto y objeto",
        body: "Los pronombres de **sujeto** hacen la acción y van antes del verbo: *I*, *you*, *he*, *she*, *it*, *we*, *they*.\n\nLos pronombres de **objeto** reciben la acción: *me*, *you*, *him*, *her*, *it*, *us*, *them*. *She loves him, and he loves her.*\n\n*You* e *it* tienen la misma forma en los dos casos. *It* es para cosas y animales; *them* sirve para personas y cosas en plural. Recuerda que en inglés el sujeto es obligatorio: «Es mi hermano» → *He's my brother*; «Llueve» → *It's raining*.",
      },
      {
        heading: "Después del verbo",
        body: "En español el pronombre va antes del verbo conjugado («Te quiero», «Lo vi»). En inglés va **después**:\n\n- *I love you.*\n- *I saw him yesterday.*\n- *Call me later.*\n- *Help us, please.*\n\nTampoco se repite el pronombre como en español: «A ella la conozco» → *I know her*, sin duplicar.",
      },
      {
        heading: "Después de preposiciones",
        body: "Después de preposiciones como *with*, *for*, *to*, *about*, *from* o *between* siempre va un pronombre de objeto:\n\n- «conmigo» → *with me*\n- «para ti» → *for you*\n- «con él» → *with him*\n- «sobre ellos» → *about them*\n\n*This gift is for you. Can I go with you? Talk to her.* Nunca digas *with I* ni *for she*.",
      },
      {
        heading: "Me too e It's me",
        body: "En respuestas cortas, el inglés usa el pronombre de objeto aunque en español usemos «yo»:\n\n- *A: I'm hungry. B: Me too.* («Yo también»)\n- *A: I don't like coffee. B: Me neither.* («Yo tampoco»)\n- *Who wants pizza? — Me!*\n- *Who is it? — It's me.* («Soy yo»)\n\nTambién es lo normal después de *than* en comparaciones informales: *She's taller than me.*",
      },
    ],
    tables: [
      {
        caption: "Pronombres de sujeto y de objeto",
        columns: ["Sujeto", "Objeto", "Ejemplo", "Español"],
        rows: [
          ["I", "me", "Call me tonight.", "Llámame esta noche."],
          ["you", "you", "I'll help you.", "Yo te ayudo."],
          ["he", "him", "I saw him yesterday.", "Lo vi ayer."],
          ["she", "her", "We love her.", "La queremos."],
          ["it", "it", "I lost it.", "Lo perdí."],
          ["we", "us", "Come with us.", "Ven con nosotros."],
          ["they", "them", "I don't know them.", "No los conozco."],
        ],
      },
    ],
    examples: [
      ["Can you help me with this box?", "¿Me ayudas con esta caja?"],
      ["I called her, but she didn't answer.", "La llamé, pero no contestó."],
      ["This present is for you.", "Este regalo es para ti."],
      ["Do you want to come with us?", "¿Quieres venir con nosotros?"],
      ["I don't know them very well.", "No los conozco muy bien."],
      ["A: I love this song. B: Me too!", "A: Me encanta esta canción. B: ¡A mí también!"],
      ["Who's there? It's me, open the door.", "¿Quién es? Soy yo, abre la puerta."],
      ["Tell him the truth.", "Dile la verdad."],
    ],
    mistakes: [
      [
        "I him saw at the mall.",
        "I saw him at the mall.",
        "En inglés el pronombre de objeto va después del verbo, no antes.",
      ],
      [
        "This is for I.",
        "This is for me.",
        "Después de una preposición se usa el pronombre de objeto.",
      ],
      [
        "Is my brother.",
        "He's my brother.",
        "En inglés el sujeto es obligatorio, aunque en español se omita.",
      ],
      [
        "A: I'm tired. B: I too.",
        "A: I'm tired. B: Me too.",
        "Para decir «yo también» en una respuesta corta se usa *Me too*.",
      ],
    ],
    quiz: [
      {
        prompt: "Where's Maria? I need to talk to ___.",
        options: ["she", "her", "hers"],
        answer: 1,
        explanation: "Después de la preposición *to* va el pronombre de objeto *her*.",
      },
      {
        prompt: "My parents are great. I love ___ a lot.",
        options: ["them", "they", "their"],
        answer: 0,
        explanation: "*Them* es el pronombre de objeto que recibe la acción de *love*.",
      },
      {
        prompt: "Can you come with ___ to the store?",
        options: ["I", "my", "me"],
        answer: 2,
        explanation: "Después de *with* se usa el pronombre de objeto *me*.",
      },
      {
        prompt: "A: I don't like Mondays. B: ___ neither.",
        options: ["I", "My", "Mine", "Me"],
        answer: 3,
        explanation: "«Yo tampoco» en una respuesta corta se dice *Me neither*.",
      },
      {
        prompt: "¿Cómo se dice «Lo vi ayer» hablando de tu amigo?",
        options: ["I saw him yesterday.", "I him saw yesterday.", "I saw he yesterday."],
        answer: 0,
        explanation: "El pronombre de objeto *him* va después del verbo.",
      },
    ],
  },
];
