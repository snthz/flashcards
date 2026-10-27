import type { GrammarTopic } from "../types";

export const B2: GrammarTopic[] = [
  {
    slug: "present-perfect-continuous",
    level: "B2",
    title: "El presente perfecto continuo",
    english: "Present perfect continuous",
    summary: "Sirve para acciones que empezaron en el pasado y siguen hasta ahora, o que acaban de terminar y dejan huella.",
    sections: [
      {
        heading: "¿Cuándo se usa?",
        body: "Usa el presente perfecto continuo para una actividad que **empezó en el pasado y sigue hasta ahora**, cuando te interesa la duración o el proceso:\n- *I've been studying English for three years.* (y sigo estudiando)\n- *She's been working here since March.*\n\nTambién sirve para una actividad que **acaba de terminar y deja huellas visibles**: *Your eyes are red. Have you been crying?* («¿Has estado llorando?»).\n\nEn español decimos «llevo tres años estudiando» o «estudio inglés desde hace tres años». En inglés no puedes usar el presente aquí: *I study English for three years* es incorrecto.",
      },
      {
        heading: "Cómo se forma",
        body: "La estructura es **have/has + been + verbo en -ing**:\n- Afirmativa: *I have been waiting.* / *He has been waiting.*\n- Negativa: *I haven't been sleeping well.*\n- Pregunta: *Have you been waiting long?*\n\nAl hablar casi siempre se contrae: *I've been*, *she's been*, *they've been*. Ojo: *she's been* es *she has been*, nunca *she is been*.\n\nPara preguntar por la duración usa *How long have you been...?*: *How long have you been living here?* («¿Cuánto tiempo llevas viviendo aquí?»).",
      },
      {
        heading: "Continuo o simple: proceso frente a cantidad",
        body: "El presente perfecto **simple** destaca el resultado o la **cantidad terminada**; el **continuo** destaca la **actividad y su duración**:\n- *I've been reading this book all afternoon.* (la actividad)\n- *I've read 100 pages.* (lo que logré)\n- *I've read the book.* (ya lo terminé)\n\nSi dices cuántas veces o cuántas cosas, usa el simple: *She's called me three times today*, no *She's been calling me three times today*.\n\nCon *for* y *since*, muchos verbos de acción como *live*, *work* o *teach* admiten las dos formas casi sin diferencia: *I've lived here for years* = *I've been living here for years*.",
      },
      {
        heading: "Verbos de estado",
        body: "Los verbos de estado como *know*, *like*, *love*, *want*, *believe*, *understand* o *belong* normalmente **no** van en forma continua. Con ellos, la duración se expresa con el presente perfecto simple:\n- *I've known her since 2015.* (no *I've been knowing her*)\n- *We've had this car for ten years.* (*have* = tener, poseer)\n\nEn cambio, cuando *have* expresa una actividad (*have lunch*, *have problems*, *have fun*), sí admite el continuo: *We've been having problems with the internet.*\n\nAunque en español digas «la conozco desde hace años», en inglés se dice *I've known her for years*.",
      },
    ],
    tables: [
      {
        caption: "Forma del presente perfecto continuo",
        columns: ["Persona", "Afirmativa", "Negativa", "Pregunta"],
        rows: [
          ["I / you / we / they", "I've been working", "I haven't been working", "Have you been working?"],
          ["he / she / it", "She's been working", "She hasn't been working", "Has she been working?"],
        ],
      },
      {
        caption: "Continuo frente a simple",
        columns: ["Enfoque", "Presente perfecto continuo", "Presente perfecto simple"],
        rows: [
          ["Duración frente a cantidad", "I've been writing emails all morning.", "I've written ten emails."],
          ["Proceso frente a resultado", "She's been painting the kitchen.", "She's painted the kitchen."],
          ["Verbos de estado", "—", "I've known him for years."],
        ],
      },
    ],
    examples: [
      ["I've been waiting for you for over an hour.", "Llevo más de una hora esperándote."],
      ["How long have you been learning English?", "¿Cuánto tiempo llevas aprendiendo inglés?"],
      ["Your eyes are red. Have you been crying?", "Tienes los ojos rojos. ¿Has estado llorando?"],
      ["It's been raining since this morning.", "Ha estado lloviendo desde esta mañana."],
      ["We've been looking for a new apartment, but we haven't found one yet.", "Hemos estado buscando un departamento nuevo, pero todavía no hemos encontrado ninguno."],
      ["She's been working here since 2019.", "Trabaja aquí desde 2019."],
      ["I've been reading this book all week, and I've only read half of it.", "Llevo toda la semana leyendo este libro y solo he leído la mitad."],
      ["He's tired because he's been studying all night.", "Está cansado porque ha estado estudiando toda la noche."],
    ],
    mistakes: [
      ["I study English for five years.", "I've been studying English for five years.", "Para algo que empezó en el pasado y sigue ahora, el inglés usa el presente perfecto, no el presente."],
      ["I've been knowing him since college.", "I've known him since college.", "Know es un verbo de estado y no se usa en forma continua."],
      ["She's been calling me five times today.", "She's called me five times today.", "Cuando cuentas cuántas veces pasó algo, se usa el presente perfecto simple."],
      ["I'm waiting here since ten o'clock.", "I've been waiting here since ten o'clock.", "Con since o for para una duración hasta ahora no se usa el presente continuo."],
    ],
    quiz: [
      {
        prompt: "I ___ for the bus for twenty minutes, and it still hasn't come.",
        options: ["wait", "am waiting", "have been waiting", "was waiting"],
        answer: 2,
        explanation: "La espera empezó hace veinte minutos y sigue ahora, así que va el presente perfecto continuo.",
      },
      {
        prompt: "Your eyes are all red. ___ you been crying?",
        options: ["Have", "Has", "Are", "Did"],
        answer: 0,
        explanation: "Con you el auxiliar es have, y la forma es have + been + -ing.",
      },
      {
        prompt: "So far I ___ three chapters of the book.",
        options: ["am reading", "have read", "have been reading"],
        answer: 1,
        explanation: "Se indica una cantidad terminada (tres capítulos), así que va el presente perfecto simple.",
      },
      {
        prompt: "We ___ each other since we were kids.",
        options: ["have been knowing", "are knowing", "know", "have known"],
        answer: 3,
        explanation: "Know es un verbo de estado, así que la duración se expresa con el presente perfecto simple.",
      },
      {
        prompt: "¿Cuál oración expresa «llevo dos horas cocinando»?",
        options: ["I've been cooking for two hours.", "I'm cooking for two hours.", "I cook for two hours.", "I was cooking for two hours."],
        answer: 0,
        explanation: "«Llevo + gerundio» se traduce con el presente perfecto continuo y for.",
      },
    ],
  },
  {
    slug: "past-perfect",
    level: "B2",
    title: "El pasado perfecto",
    english: "Past perfect",
    summary: "Sirve para hablar de algo que ocurrió antes de otro momento o acción del pasado: el «pasado del pasado».",
    sections: [
      {
        heading: "El pasado del pasado",
        body: "El pasado perfecto indica que una acción ocurrió **antes** de otro momento o acción del pasado. Equivale al pluscuamperfecto: «había comido», «habían salido».\n- *When I got to the station, the train had left.* (primero salió el tren y después llegué yo)\n- *When I got to the station, the train left.* (llegué y en ese momento salió)\n\nComo ves, cambiar el tiempo cambia el orden de los hechos. Úsalo cuando cuentas algo en pasado y necesitas dar un paso más atrás.",
      },
      {
        heading: "Cómo se forma",
        body: "La estructura es **had + participio pasado**, igual para todas las personas:\n- Afirmativa: *She had finished.* → *She'd finished.*\n- Negativa: *They hadn't eaten.*\n- Pregunta: *Had you met him before?*\n\nCuidado con *'d*: puede ser *had* o *would*. Si le sigue un participio (*I'd seen*), es *had*; si le sigue un infinitivo (*I'd see*), es *would*.\n\nPara la duración de algo hasta un momento del pasado existe el pasado perfecto continuo, **had been + -ing**: *She was tired because she had been working all day.*",
      },
      {
        heading: "Palabras que lo acompañan",
        body: "Es muy frecuente con expresiones que ordenan los hechos:\n- *by the time*: *By the time we arrived, the movie had started.*\n- *already*: *I had already eaten when she called.*\n- *never... before*: *I had never seen snow before that winter.*\n- *after / before*: *After he had paid, he left.*\n- *when*: *When I opened the door, they had gone.*\n\n*By the time* significa «para cuando»: en ese momento la acción ya estaba terminada. En español a veces usamos el pretérito («cuando llegamos, la película ya empezó»), pero en inglés lo natural es el pasado perfecto.",
      },
      {
        heading: "¿Cuándo es opcional?",
        body: "Si *before* o *after* ya dejan claro el orden, el pasado perfecto es opcional y muchos hablantes prefieren el pasado simple:\n- *After she finished her homework, she went out.* = *After she had finished her homework, she went out.*\n\nTampoco se usa cuando cuentas acciones **en el mismo orden en que ocurrieron**: *I got up, took a shower and left.*\n\nEn cambio, con *when* suele ser necesario, porque cambia el significado. Y nunca lo uses para «sonar más pasado»: si no hay otro momento pasado de referencia, basta con el pasado simple: *I bought a new phone yesterday.*",
      },
    ],
    tables: [
      {
        caption: "Forma del pasado perfecto",
        columns: ["Tipo", "Forma", "Ejemplo"],
        rows: [
          ["Afirmativa", "had + participio", "I had seen the movie."],
          ["Negativa", "hadn't + participio", "She hadn't called yet."],
          ["Pregunta", "Had + sujeto + participio?", "Had they left?"],
          ["Continuo", "had been + -ing", "We had been driving for hours."],
        ],
      },
      {
        caption: "El tiempo verbal cambia el orden de los hechos",
        columns: ["Qué pasó primero", "Oración"],
        rows: [
          ["Llegué yo y en ese momento ella se fue", "When I arrived, she left."],
          ["Ella se fue antes de que yo llegara", "When I arrived, she had left."],
        ],
      },
    ],
    examples: [
      ["When we got to the cinema, the movie had already started.", "Cuando llegamos al cine, la película ya había empezado."],
      ["I had never tried sushi before I moved to Los Angeles.", "Nunca había probado el sushi antes de mudarme a Los Ángeles."],
      ["By the time the police arrived, the thieves had escaped.", "Para cuando llegó la policía, los ladrones se habían escapado."],
      ["She was upset because she had lost her keys.", "Estaba molesta porque había perdido las llaves."],
      ["Had you met Daniel before the party?", "¿Ya conocías a Daniel antes de la fiesta?"],
      ["They hadn't eaten all day, so they were starving.", "No habían comido en todo el día, así que se morían de hambre."],
      ["I realized I had left my phone at home.", "Me di cuenta de que había dejado el celular en casa."],
      ["He had been working there for ten years when the company closed.", "Llevaba diez años trabajando ahí cuando cerró la empresa."],
    ],
    mistakes: [
      ["When I arrived, the class already started.", "When I arrived, the class had already started.", "Para algo anterior a otro momento del pasado se usa had + participio."],
      ["I had went to the doctor before work.", "I had gone to the doctor before work.", "Después de had va el participio (gone), no el pasado simple (went)."],
      ["Yesterday I had bought a new phone.", "Yesterday I bought a new phone.", "Sin otro momento pasado de referencia, basta con el pasado simple."],
      ["By the time I called, she has left.", "By the time I called, she had left.", "Si la referencia está en pasado, se usa had, no has."],
    ],
    quiz: [
      {
        prompt: "When I got home, my roommate ___ all the pizza.",
        options: ["has eaten", "had eaten", "eats", "is eating"],
        answer: 1,
        explanation: "Se comió la pizza antes de que yo llegara, así que va el pasado perfecto.",
      },
      {
        prompt: "By the time we arrived, the concert ___.",
        options: ["had finished", "has finished", "finishes", "is finishing"],
        answer: 0,
        explanation: "By the time marca que la acción ya había terminado antes de otro momento pasado.",
      },
      {
        prompt: "I ___ never seen the ocean before that trip.",
        options: ["have", "was", "had"],
        answer: 2,
        explanation: "La experiencia es anterior a un viaje del pasado, así que va had + participio.",
      },
      {
        prompt: "¿Qué significa «When I arrived, she had left»?",
        options: ["Ella se fue en el momento en que yo llegué.", "Ella llegó después de mí.", "Ella se iba a ir más tarde.", "Ella se fue antes de que yo llegara."],
        answer: 3,
        explanation: "Had left indica que su salida ocurrió antes de mi llegada.",
      },
      {
        prompt: "She couldn't pay because she ___ her wallet at home.",
        options: ["leaves", "had left", "has left"],
        answer: 1,
        explanation: "Dejar la cartera ocurrió antes de no poder pagar, así que va el pasado perfecto.",
      },
    ],
  },
  {
    slug: "third-conditional",
    level: "B2",
    title: "El tercer condicional",
    english: "Third conditional",
    summary: "Sirve para imaginar cómo habría sido el pasado si algo hubiera pasado de otra forma y para expresar arrepentimientos.",
    sections: [
      {
        heading: "¿Para qué sirve?",
        body: "El tercer condicional habla de un pasado **que no ocurrió**: imaginas una situación distinta y su consecuencia, también en el pasado. Por eso es ideal para arrepentimientos, reproches y especulaciones:\n- *If I had studied, I would have passed.* (no estudié y reprobé)\n- *If you had told me, I would have helped you.* (no me dijiste nada)\n\nEn español equivale a «si hubiera + participio, habría + participio»: «si hubiera estudiado, habría aprobado». La realidad siempre es la contraria de lo que dice la oración.",
      },
      {
        heading: "Cómo se forma",
        body: "Tiene dos partes:\n1. Condición: **if + had + participio**\n2. Resultado: **would have + participio**\n\nEl orden se puede invertir; si empiezas con *if*, pon coma: *If she had left earlier, she wouldn't have missed the flight.* / *She wouldn't have missed the flight if she had left earlier.*\n\nEn lugar de *would* puedes usar *could have* (posibilidad) o *might have* (probabilidad): *If we had hurried, we could have caught the bus.*\n\nEn negativa: *If I hadn't called, she wouldn't have come.*",
      },
      {
        heading: "Nunca «if I would have»",
        body: "El error más típico es poner *would* en las dos partes. La parte del *if* lleva **had**, no *would have*:\n- Incorrecto: *If I would have known, I would have come.*\n- Correcto: *If I had known, I would have come.*\n\nAunque lo escuches en conversaciones informales de algunos nativos, en inglés estándar se considera un error y nunca aparece en exámenes.\n\nEl español nos confunde porque «si lo hubiera sabido, hubiera venido» repite la misma forma en las dos partes. En inglés no: *had* en la condición y *would have* en el resultado.",
      },
      {
        heading: "Pronunciación y contracciones",
        body: "Al hablar, *would have* casi nunca se pronuncia completo. Suena **would've** /ˈwʊdəv/, muy parecido a *would of*. Por eso algunos nativos escriben *would of*, pero la forma correcta es *would've* o *would have*.\n\nLo mismo pasa con *could've*, *should've* y *might've*.\n\nLa contracción *'d* puede ser *had* o *would*, y en este condicional aparecen las dos: *If I'd known, I'd have told you* = *If I had known, I would have told you*. La primera *'d* es *had*; la segunda es *would*, porque le sigue *have*.",
      },
    ],
    tables: [
      {
        caption: "Estructura del tercer condicional",
        columns: ["Parte", "Forma", "Ejemplo"],
        rows: [
          ["Condición", "if + had + participio", "If I had seen you,"],
          ["Resultado", "would have + participio", "I would have said hello."],
          ["Resultado posible", "could have + participio", "I could have helped."],
          ["Resultado probable", "might have + participio", "It might have worked."],
        ],
      },
      {
        caption: "Contracciones habituales",
        columns: ["Forma completa", "Contracción"],
        rows: [
          ["If I had known", "If I'd known"],
          ["I would have gone", "I'd have gone / I would've gone"],
          ["She would not have come", "She wouldn't have come"],
          ["We could have won", "We could've won"],
        ],
      },
    ],
    examples: [
      ["If I had known you were coming, I would have cooked something.", "Si hubiera sabido que venías, habría cocinado algo."],
      ["If we had left earlier, we wouldn't have missed the flight.", "Si hubiéramos salido antes, no habríamos perdido el vuelo."],
      ["She would have gotten the job if she had applied on time.", "Habría conseguido el trabajo si hubiera enviado su solicitud a tiempo."],
      ["If you hadn't helped me, I couldn't have finished the project.", "Si no me hubieras ayudado, no habría podido terminar el proyecto."],
      ["What would you have done if you had lost your passport?", "¿Qué habrías hecho si hubieras perdido el pasaporte?"],
      ["If it hadn't rained, we might have gone to the beach.", "Si no hubiera llovido, quizá habríamos ido a la playa."],
      ["I would've called you if I'd had your number.", "Te habría llamado si hubiera tenido tu número."],
    ],
    mistakes: [
      ["If I would have known, I would have helped.", "If I had known, I would have helped.", "En la parte del if va had + participio, nunca would have."],
      ["We would win the game yesterday if we had played better.", "We would have won the game yesterday if we had played better.", "Para un resultado en el pasado se usa would have + participio."],
      ["I would of gone with you.", "I would have gone with you.", "Would of es una mala escritura de would've; lo correcto es would have."],
      ["If I had saw the sign, I would have stopped.", "If I had seen the sign, I would have stopped.", "Después de had va el participio (seen), no el pasado simple (saw)."],
    ],
    quiz: [
      {
        prompt: "If I ___ about the meeting, I would have gone.",
        options: ["would have known", "have known", "had known"],
        answer: 2,
        explanation: "En la condición del tercer condicional va had + participio.",
      },
      {
        prompt: "If she had taken the medicine, she ___ better sooner.",
        options: ["would have felt", "will feel", "had felt", "has felt"],
        answer: 0,
        explanation: "El resultado imaginario en el pasado se expresa con would have + participio.",
      },
      {
        prompt: "We ___ the bus if we had run.",
        options: ["had caught", "could have caught", "can catch", "will catch"],
        answer: 1,
        explanation: "Could have + participio expresa una posibilidad en el pasado que no se cumplió.",
      },
      {
        prompt: "¿Cómo se escribe correctamente lo que al hablar suena como «would of»?",
        options: ["would of", "would'of", "would've"],
        answer: 2,
        explanation: "Lo que suena como «would of» es la contracción de would have, que se escribe would've.",
      },
      {
        prompt: "¿Qué significa «If he had listened, he wouldn't have failed»?",
        options: ["Escuchó y aprobó.", "Escuchó y reprobó.", "No escuchó y aprobó.", "No escuchó y reprobó."],
        answer: 3,
        explanation: "El tercer condicional describe lo contrario de lo que pasó: no escuchó y por eso reprobó.",
      },
    ],
  },
  {
    slug: "reported-speech",
    level: "B2",
    title: "El estilo indirecto",
    english: "Reported speech",
    summary: "Sirve para contar lo que otra persona dijo o preguntó, ajustando tiempos verbales, pronombres y referencias de tiempo.",
    sections: [
      {
        heading: "El retroceso de tiempos",
        body: "Cuando cuentas lo que alguien dijo con un verbo en pasado (*said*, *told*), el tiempo verbal suele **retroceder un paso** hacia el pasado. A esto se le llama *backshift*:\n- *«I'm tired.»* → *She said she was tired.*\n- *«I've finished.»* → *He said he had finished.*\n- *«I'll call you.»* → *She said she would call me.*\n- *«I can swim.»* → *He said he could swim.*\n\nEl español hace algo parecido («dijo que estaba cansada»), así que la lógica te resultará familiar. Cambia también los pronombres según quién cuenta la historia: *«I love you.»* → *He said he loved me.*",
      },
      {
        heading: "Say o tell",
        body: "Los dos significan «decir», pero se construyen distinto:\n- **say** + lo dicho: *She said (that) she was busy.* Si mencionas a la persona, usa *to*: *She said to me that...*\n- **tell** + persona + lo dicho: *She told me (that) she was busy.*\n\nNo se dice *She said me*, ni *She told that...* sin persona. Es un error muy común porque en español «me dijo» sirve para los dos.\n\n*Tell* también se usa para órdenes y peticiones con infinitivo: *He told me to wait.* («Me dijo que esperara»). En negativa: *He told me not to wait.*",
      },
      {
        heading: "Preguntas en estilo indirecto",
        body: "Al reportar una pregunta, el orden de palabras pasa a ser el de una **afirmación** (sujeto + verbo) y desaparecen *do*, *does* y *did*:\n- *«Where do you live?»* → *She asked me where I lived.*\n- *«What time is it?»* → *He asked what time it was.*\n\nSi la pregunta es de sí o no, usa **if** o **whether**:\n- *«Are you coming?»* → *She asked if I was coming.* / *She asked whether I was coming.*\n\nAl final no va signo de interrogación, porque ya no es una pregunta directa. Los verbos más usados son *ask*, *want to know* y *wonder*.",
      },
      {
        heading: "Tiempo, lugar y cuándo no retroceder",
        body: "Si el momento o el lugar cambian, también cambian las referencias:\n- *today* → *that day*; *tomorrow* → *the next day*; *yesterday* → *the day before*\n- *here* → *there*; *this* → *that*; *next week* → *the following week*\n\nEl retroceso **no es obligatorio** cuando lo dicho sigue siendo verdad: *Ana said she lives in Monterrey* (todavía vive ahí). Tampoco hace falta si el verbo que introduce está en presente: *He says he's tired.*\n\nLos modales *would*, *could*, *should* y *might* no cambian; *must* puede quedarse igual o pasar a *had to*.",
      },
    ],
    tables: [
      {
        caption: "Retroceso de tiempos",
        columns: ["Tiempo original", "Estilo directo", "Estilo indirecto"],
        rows: [
          ["Presente simple", "I work here.", "He said he worked there."],
          ["Presente continuo", "I'm working.", "He said he was working."],
          ["Pasado simple", "I worked late.", "He said he had worked late."],
          ["Presente perfecto", "I've finished.", "He said he had finished."],
          ["will", "I'll help.", "He said he would help."],
          ["can", "I can help.", "He said he could help."],
        ],
      },
      {
        caption: "Cambios de tiempo y lugar",
        columns: ["Estilo directo", "Estilo indirecto"],
        rows: [
          ["now", "then"],
          ["today", "that day"],
          ["tomorrow", "the next day / the following day"],
          ["yesterday", "the day before / the previous day"],
          ["next week", "the following week"],
          ["here", "there"],
          ["this", "that"],
        ],
      },
    ],
    examples: [
      ["She said she was tired.", "Dijo que estaba cansada."],
      ["He told me he had already seen the movie.", "Me dijo que ya había visto la película."],
      ["They said they would call us the next day.", "Dijeron que nos llamarían al día siguiente."],
      ["My boss asked me if I could work on Saturday.", "Mi jefe me preguntó si podía trabajar el sábado."],
      ["She asked me where I lived.", "Me preguntó dónde vivía."],
      ["The doctor told me to drink more water.", "El doctor me dijo que tomara más agua."],
      ["He wanted to know whether we had finished.", "Quería saber si habíamos terminado."],
      ["Ana said she works in Guadalajara.", "Ana dijo que trabaja en Guadalajara."],
    ],
    mistakes: [
      ["She said me that she was busy.", "She told me that she was busy.", "Say no lleva a la persona directamente; con persona se usa tell."],
      ["He asked me where did I live.", "He asked me where I lived.", "En una pregunta indirecta se usa el orden de una afirmación y sin did."],
      ["She asked me do I like coffee.", "She asked me if I liked coffee.", "Las preguntas de sí o no se reportan con if o whether."],
      ["He told to me to wait.", "He told me to wait.", "Tell lleva a la persona directamente, sin to."],
    ],
    quiz: [
      {
        prompt: "She ___ me that she was moving to Canada.",
        options: ["said", "told", "asked", "spoke"],
        answer: 1,
        explanation: "Cuando la persona aparece justo después del verbo (me), se usa tell.",
      },
      {
        prompt: "He asked me where ___.",
        options: ["did I work", "do I work", "I worked", "worked I"],
        answer: 2,
        explanation: "En las preguntas indirectas se usa el orden sujeto + verbo y no se usa did.",
      },
      {
        prompt: "«Are you hungry?» → She asked me ___ hungry.",
        options: ["if I was", "was I", "that I was"],
        answer: 0,
        explanation: "Las preguntas de sí o no se reportan con if y el orden de una afirmación.",
      },
      {
        prompt: "My teacher told me ___ late again.",
        options: ["don't be", "not be", "to not being", "not to be"],
        answer: 3,
        explanation: "Una orden negativa en estilo indirecto se forma con tell + persona + not to + verbo.",
      },
      {
        prompt: "¿En qué caso no es necesario retroceder el tiempo verbal?",
        options: ["Cuando la persona habló hace mucho tiempo.", "Cuando la oración es negativa.", "Cuando lo dicho sigue siendo verdad ahora."],
        answer: 2,
        explanation: "Si lo dicho sigue siendo cierto, puedes mantener el tiempo original.",
      },
    ],
  },
  {
    slug: "modals-of-deduction",
    level: "B2",
    title: "Los modales de deducción",
    english: "Modals of deduction",
    summary: "Sirven para expresar qué tan seguro estás de algo, en presente o en pasado, a partir de las pistas que tienes.",
    sections: [
      {
        heading: "Del más seguro al menos seguro",
        body: "Con estos modales no hablas de obligación ni de permiso, sino de **qué tan seguro estás** de algo según las pistas que tienes:\n- **must**: casi seguro que sí. *She must be at home; the lights are on.*\n- **might / may / could**: es posible. *He might be stuck in traffic.*\n- **might not / may not**: es posible que no. *She may not know yet.*\n- **can't**: casi seguro que no. *That can't be Juan; he's in Japan.*\n\nEn español usamos «debe de», «seguro que», «a lo mejor», «puede que» o «no puede ser». *May* suena algo más formal que *might*, y *could* en afirmativa significa lo mismo.",
      },
      {
        heading: "Deducciones en presente",
        body: "Para el presente, usa **modal + infinitivo** (sin *to*):\n- *You must be tired after that trip.* («Debes de estar cansado»)\n- *She may know the answer.*\n- *It can't be true.*\n\nPara algo que está pasando en este momento, usa **modal + be + -ing**: *They must be sleeping; it's three in the morning.* / *He might be working late.*\n\nOjo con *could*: en afirmativa expresa posibilidad (*It could be a mistake*), pero *couldn't* equivale a *can't*: *It couldn't be him* («es imposible que sea él»).",
      },
      {
        heading: "Deducciones en pasado",
        body: "Para deducir algo sobre el pasado, usa **modal + have + participio**:\n- *must have*: *You must have been exhausted.* («Debiste de estar agotado»)\n- *might / may / could have*: *She might have missed the bus.* («A lo mejor perdió el camión»)\n- *can't / couldn't have*: *He can't have finished already; he only started at noon.*\n\nAl hablar, *have* se reduce: *must've*, *might've*, *could've* (nunca se escribe *must of*).\n\nCuidado: *could have* también expresa una oportunidad que no se aprovechó: *You could have called me!* («¡Me hubieras llamado!»).",
      },
      {
        heading: "Can't, no mustn't",
        body: "Para decir que algo es imposible, el contrario de *must* es **can't**, no *mustn't*. *Mustn't* expresa prohibición:\n- *You mustn't park here.* (está prohibido)\n- *He can't be the owner; he's only fifteen.* (es imposible)\n\nEn pasado pasa lo mismo: *She can't have seen me* («es imposible que me haya visto»). En inglés estadounidense oirás *must not* sin contraer para deducciones (*He must not be home*), pero *can't* es la forma más clara para expresar imposibilidad.\n\nY para una posibilidad concreta en afirmativa no se usa *can*: *It could be him*, no *It can be him*.",
      },
    ],
    tables: [
      {
        caption: "Grado de certeza en presente y en pasado",
        columns: ["Certeza", "Presente", "Pasado"],
        rows: [
          ["Casi seguro que sí", "She must be at work.", "She must have been at work."],
          ["Es posible", "She might / may / could be at work.", "She might / may / could have been at work."],
          ["Es posible que no", "She might not / may not be at work.", "She might not / may not have been at work."],
          ["Casi seguro que no", "She can't / couldn't be at work.", "She can't / couldn't have been at work."],
        ],
      },
    ],
    examples: [
      ["You must be hungry; you haven't eaten all day.", "Debes de tener hambre; no has comido en todo el día."],
      ["He's not answering. He might be in a meeting.", "No contesta. A lo mejor está en una junta."],
      ["That can't be right. I paid the bill yesterday.", "Eso no puede ser. Ayer pagué el recibo."],
      ["The streets are wet. It must have rained last night.", "Las calles están mojadas. Debió de llover anoche."],
      ["She may have forgotten about the meeting.", "Puede que se le haya olvidado la junta."],
      ["They can't have left already; their car is still here.", "No es posible que ya se hayan ido; su carro sigue aquí."],
      ["I can't find my keys. I could have left them at the office.", "No encuentro mis llaves. Pude haberlas dejado en la oficina."],
      ["They must be watching the game; I can hear them shouting.", "Deben de estar viendo el partido; los oigo gritar."],
    ],
    mistakes: [
      ["That mustn't be Ana; she's in Madrid.", "That can't be Ana; she's in Madrid.", "Para decir que algo es imposible se usa can't; mustn't expresa prohibición."],
      ["She must have went home.", "She must have gone home.", "Después de must have va el participio (gone), no el pasado simple (went)."],
      ["It can be the cat making that noise.", "It could be the cat making that noise.", "Para una posibilidad concreta se usa could, might o may, no can."],
      ["You must to be tired.", "You must be tired.", "Después de un modal el verbo va sin to."],
    ],
    quiz: [
      {
        prompt: "Look at all those shopping bags! She ___ spent a fortune.",
        options: ["can't have", "must", "must have", "might"],
        answer: 2,
        explanation: "Las bolsas son una pista clara sobre el pasado, así que va must have + participio.",
      },
      {
        prompt: "That ___ be Laura at the door. She's in Paris this week.",
        options: ["must", "can't", "has to", "might"],
        answer: 1,
        explanation: "Si Laura está en París, es imposible que sea ella, y la imposibilidad se expresa con can't.",
      },
      {
        prompt: "I'm not sure where Tom is. He ___ be in the library.",
        options: ["must", "can", "might", "has to"],
        answer: 2,
        explanation: "Como no estás seguro, se usa might para una posibilidad.",
      },
      {
        prompt: "He ___ have heard me; he was wearing headphones.",
        options: ["can't", "must", "should", "would"],
        answer: 0,
        explanation: "Con audífonos era imposible que me oyera, y eso se expresa con can't have.",
      },
      {
        prompt: "¿Qué significa «You must have been tired»?",
        options: ["Tenías la obligación de estar cansado.", "No es posible que estuvieras cansado.", "Tal vez estés cansado ahora.", "Seguro que estabas cansado."],
        answer: 3,
        explanation: "Must have + participio expresa una deducción casi segura sobre el pasado.",
      },
    ],
  },
  {
    slug: "wish-and-if-only",
    level: "B2",
    title: "Wish e if only: deseos y arrepentimientos",
    english: "Wish and if only",
    summary: "Sirven para desear que algo fuera distinto ahora, lamentar algo del pasado o quejarte de lo que hace otra persona.",
    sections: [
      {
        heading: "Deseos sobre el presente: wish + pasado",
        body: "Para desear que algo del **presente** fuera distinto, usa **wish + pasado simple**. El verbo va en pasado, pero la idea es presente e irreal:\n- *I wish I had more time.* («Ojalá tuviera más tiempo»)\n- *I wish I didn't live so far away.*\n- *I wish I could speak French.* (*could* para la habilidad)\n\nCon *be*, el estilo cuidado usa *were* para todas las personas: *I wish I were taller.* En la conversación también es correcto *I wish I was taller*.\n\nEn español usamos «ojalá» + imperfecto de subjuntivo; en inglés el equivalente es el pasado simple.",
      },
      {
        heading: "Arrepentimientos: wish + pasado perfecto",
        body: "Para lamentar algo que **ya pasó** (o que no pasó), usa **wish + had + participio**:\n- *I wish I had studied harder.* («Ojalá hubiera estudiado más»)\n- *She wishes she hadn't said that.*\n\nLa realidad es la contraria: estudié poco; ella sí lo dijo. Fíjate en que *wish* puede ir en presente aunque el arrepentimiento sea del pasado.\n\nNo uses *would have* después de *wish*: lo correcto es *I wish I had known*, no *I wish I would have known*, aunque lo escuches en conversaciones informales.",
      },
      {
        heading: "Quejas y deseos de cambio: wish + would",
        body: "**Wish + persona + would + infinitivo** expresa que quieres que **otra persona** o una situación cambie, casi siempre con molestia o impaciencia:\n- *I wish you would stop interrupting me.*\n- *I wish it would stop raining.*\n- *I wish my neighbors wouldn't play music so loud.*\n\nNo se usa con el mismo sujeto: en lugar de *I wish I would exercise more*, di *I wish I exercised more*. Tampoco sirve para estados que nadie puede cambiar a voluntad: *I wish I were taller*, no *I wish I would be taller*.",
      },
      {
        heading: "If only y la diferencia con hope",
        body: "**If only** funciona igual que *wish*, con los mismos tiempos, pero es más enfático y emocional. Suele ir como exclamación:\n- *If only I had more money!* (presente)\n- *If only I hadn't missed the flight!* (pasado)\n- *If only he would listen!* (queja)\n\nEquivale a «¡Ojalá...!» o «¡Si tan solo...!».\n\nPara deseos sobre el futuro que sí pueden cumplirse no se usa *wish*, sino **hope**: *I hope you pass the exam*, no *I wish you pass the exam*. Eso sí, *wish* + persona + sustantivo es correcto: *I wish you a happy birthday.*",
      },
    ],
    tables: [
      {
        caption: "Wish e if only según el momento",
        columns: ["Uso", "Estructura", "Ejemplo"],
        rows: [
          ["Deseo sobre el presente", "wish + pasado simple", "I wish I knew the answer."],
          ["Habilidad en el presente", "wish + could + infinitivo", "I wish I could drive."],
          ["Arrepentimiento del pasado", "wish + had + participio", "I wish I hadn't eaten so much."],
          ["Queja o deseo de cambio", "wish + persona + would + infinitivo", "I wish you would call more often."],
          ["Énfasis", "if only + el mismo tiempo", "If only I had listened!"],
        ],
      },
    ],
    examples: [
      ["I wish I had a car.", "Ojalá tuviera carro."],
      ["I wish I could stay longer, but I have to go.", "Ojalá pudiera quedarme más tiempo, pero me tengo que ir."],
      ["She wishes she hadn't sold her old guitar.", "Le gustaría no haber vendido su vieja guitarra."],
      ["I wish you would stop leaving your clothes on the floor.", "Me gustaría que dejaras de tirar tu ropa en el piso."],
      ["If only I had listened to my mother!", "¡Si tan solo le hubiera hecho caso a mi mamá!"],
      ["I wish it would stop raining.", "Ojalá dejara de llover."],
      ["We wish we had more time to travel.", "Ojalá tuviéramos más tiempo para viajar."],
      ["I wish I had known about the party.", "Ojalá me hubiera enterado de la fiesta."],
    ],
    mistakes: [
      ["I wish I have more free time.", "I wish I had more free time.", "Para un deseo sobre el presente, después de wish va el pasado simple."],
      ["I wish I would have studied more.", "I wish I had studied more.", "Para lamentar el pasado se usa wish + had + participio, no would have."],
      ["I wish you pass your exam.", "I hope you pass your exam.", "Para un deseo posible sobre el futuro se usa hope, no wish."],
      ["I wish I would be taller.", "I wish I were taller.", "Wish + would no se usa con el mismo sujeto ni con estados; aquí va el pasado."],
    ],
    quiz: [
      {
        prompt: "I wish I ___ how to swim.",
        options: ["know", "knew", "would know", "have known"],
        answer: 1,
        explanation: "Para un deseo sobre el presente, después de wish va el pasado simple.",
      },
      {
        prompt: "I failed the test. I wish I ___ more.",
        options: ["have studied", "would study", "had studied", "study"],
        answer: 2,
        explanation: "Es un arrepentimiento del pasado, así que va wish + had + participio.",
      },
      {
        prompt: "I wish my brother ___ borrowing my clothes without asking.",
        options: ["would stop", "stops", "will stop", "has stopped"],
        answer: 0,
        explanation: "Para quejarte de lo que hace otra persona y querer que cambie se usa wish + would.",
      },
      {
        prompt: "If only I ___ my phone at home! Now I can't call anyone.",
        options: ["wouldn't leave", "don't leave", "haven't left", "hadn't left"],
        answer: 3,
        explanation: "If only + pasado perfecto expresa arrepentimiento por algo que ya pasó.",
      },
      {
        prompt: "¿Cuál es la forma correcta de desearle suerte a alguien en su examen de mañana?",
        options: ["I wish you pass the exam.", "I hope you pass the exam.", "I wish you passed the exam."],
        answer: 1,
        explanation: "Para un deseo posible sobre el futuro se usa hope, no wish.",
      },
    ],
  },
  {
    slug: "causative-have-get",
    level: "B2",
    title: "La forma causativa con have y get",
    english: "Causative have / get",
    summary: "Sirve para decir que otra persona hace algo por ti, normalmente un servicio, como cortarte el pelo o arreglar el carro.",
    sections: [
      {
        heading: "Cuando otra persona lo hace por ti",
        body: "En español decimos «me corté el pelo» aunque lo haya hecho un peluquero. En inglés, si dices *I cut my hair*, se entiende que **tú mismo** tomaste las tijeras. Para decir que alguien lo hizo por ti, usa la forma causativa:\n- *I had my hair cut.* (me lo cortó otra persona)\n- *I cut my hair.* (me lo corté yo)\n\nSe usa sobre todo con **servicios**: *have your car repaired*, *have your eyes tested*, *get your nails done*. Importa la acción, no quién la hace; si quieres mencionarlo, añade *by*: *I had it checked by a mechanic.*",
      },
      {
        heading: "Cómo se forma",
        body: "La estructura es **have / get + objeto + participio pasado**:\n- *I'm having my house painted.*\n- *She got her phone fixed yesterday.*\n- *We need to have the windows cleaned.*\n\n*Have* o *get* se conjugan en el tiempo que necesites; el participio no cambia. Las preguntas y negativas en presente y pasado simple llevan *do*, *does* o *did*: *Did you have your hair cut?* / *I didn't get the car washed.*\n\nEl orden es clave: el objeto va **antes** del participio. *I had cut my hair* es pasado perfecto (me lo había cortado yo), no causativo.",
      },
      {
        heading: "Have o get",
        body: "Las dos formas significan casi lo mismo:\n- **have something done** es algo más neutro o formal: *We're having a new kitchen installed.*\n- **get something done** es más informal y muy común en conversación: *I need to get my passport renewed.*\n\n*Get* además puede sugerir esfuerzo o urgencia: *I finally got the printer fixed.*\n\nLa misma estructura con *have* sirve para cosas malas que te pasan sin que las pidas: *She had her bag stolen on the subway.* («Le robaron la bolsa en el metro»). Aquí no hay ningún servicio, solo alguien que sufre la acción.",
      },
      {
        heading: "Get someone to do y have someone do",
        body: "Si quieres mencionar a **la persona** que hace el trabajo, la estructura cambia:\n- **get + persona + to + infinitivo**: *I got my brother to help me move.*\n- **have + persona + infinitivo** (sin *to*): *I'll have my assistant call you.*\n\n*Get someone to do* suele implicar que convenciste o le pediste un favor a alguien: «logré que mi hermano me ayudara». *Have someone do* suena a un encargo o una instrucción normal, típica de jefes, clientes y servicios.\n\nNo los mezcles: *get him to fix it* lleva *to*; *have him fix it* no lo lleva.",
      },
    ],
    tables: [
      {
        caption: "Estructuras causativas",
        columns: ["Uso", "Forma", "Ejemplo"],
        rows: [
          ["Servicio (neutro)", "have + objeto + participio", "I had my car washed."],
          ["Servicio (informal)", "get + objeto + participio", "I got my car washed."],
          ["Algo malo que te pasa", "have + objeto + participio", "He had his wallet stolen."],
          ["Convencer a alguien", "get + persona + to + infinitivo", "I got Ana to drive me home."],
          ["Encargar algo a alguien", "have + persona + infinitivo", "I'll have Ana drive you home."],
        ],
      },
      {
        caption: "¿Lo hiciste tú o alguien más?",
        columns: ["Acción", "Lo haces tú", "Lo hace otra persona"],
        rows: [
          ["Cortar el pelo", "I cut my hair.", "I had my hair cut."],
          ["Pintar la casa", "We painted the house.", "We had the house painted."],
          ["Arreglar el celular", "I fixed my phone.", "I got my phone fixed."],
        ],
      },
    ],
    examples: [
      ["I'm going to have my hair cut tomorrow.", "Mañana voy a cortarme el pelo."],
      ["We had the house painted last summer.", "El verano pasado mandamos pintar la casa."],
      ["You should get your eyes tested.", "Deberías ir a que te revisen la vista."],
      ["Where did you get your nails done?", "¿Dónde te hiciste las uñas?"],
      ["She had her phone stolen at the concert.", "Le robaron el celular en el concierto."],
      ["I need to get my passport renewed before the trip.", "Tengo que renovar mi pasaporte antes del viaje."],
      ["I finally got my dad to lend me the car.", "Por fin logré que mi papá me prestara el carro."],
      ["The manager will have someone call you back.", "El gerente le pedirá a alguien que te regrese la llamada."],
    ],
    mistakes: [
      ["I cut my hair at the barber's.", "I had my hair cut at the barber's.", "Si otra persona lo hizo por ti, se usa la forma causativa."],
      ["I had cut my hair yesterday.", "I had my hair cut yesterday.", "El objeto va antes del participio; si no, se convierte en pasado perfecto."],
      ["I got my brother help me.", "I got my brother to help me.", "Con get + persona, el verbo va con to."],
      ["I'll have the mechanic to check the brakes.", "I'll have the mechanic check the brakes.", "Con have + persona, el verbo va sin to."],
    ],
    quiz: [
      {
        prompt: "I don't know how to fix computers, so I'm going to ___ fixed.",
        options: ["have fixed it", "have it", "it have", "fix it"],
        answer: 1,
        explanation: "La forma causativa es have + objeto + participio: have it fixed.",
      },
      {
        prompt: "She ___ her car repaired last week.",
        options: ["had", "has", "was", "did"],
        answer: 0,
        explanation: "Es un servicio en el pasado, así que va had + objeto + participio.",
      },
      {
        prompt: "I finally got my sister ___ me with my homework.",
        options: ["help", "helped", "to help"],
        answer: 2,
        explanation: "Con get + persona, el verbo va en infinitivo con to.",
      },
      {
        prompt: "I'll have my assistant ___ you the documents.",
        options: ["to send", "send", "sent"],
        answer: 1,
        explanation: "Con have + persona, el verbo va en infinitivo sin to.",
      },
      {
        prompt: "¿Qué significa «I had my bike stolen»?",
        options: ["Yo robé una bicicleta.", "Mandé a alguien a robar mi bicicleta.", "Había robado mi bicicleta.", "Me robaron la bicicleta."],
        answer: 3,
        explanation: "Have + objeto + participio también describe algo malo que te pasó sin que lo pidieras.",
      },
    ],
  },
];
