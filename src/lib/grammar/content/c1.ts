import type { GrammarTopic } from "../types";

export const C1: GrammarTopic[] = [
  {
    slug: "mixed-conditionals",
    level: "C1",
    title: "Condicionales mixtos",
    english: "Mixed conditionals",
    summary: "Conectan una condición y un resultado de tiempos distintos: un pasado que afecta al presente o un presente que explica el pasado.",
    sections: [
      {
        heading: "Cuándo usarlos",
        body: "Los condicionales clásicos mantienen el mismo plano temporal en las dos partes: el segundo habla del presente irreal (*If I had time, I would help*) y el tercero del pasado irreal (*If I had known, I would have called*). El **condicional mixto** combina ambos cuando la condición y el resultado ocurren en momentos distintos.\n\n- **Pasado → presente**: algo que no pasó tiene consecuencias hoy. *If I had taken that job, I would be living in Toronto now.*\n- **Presente → pasado**: una característica actual o permanente explica algo que pasó, o no pasó, antes. *If I weren't so shy, I would have talked to her at the party.*\n\nAntes de elegir la forma, pregúntate cuándo es verdad la condición y cuándo ocurre el resultado.",
      },
      {
        heading: "Pasado irreal → resultado presente",
        body: "Forma: *if* + **past perfect**, *would* + infinitivo sin *to*.\n\n- *If she had listened to her doctor, she wouldn't be in the hospital now.*\n- *If we hadn't missed the flight, we would be in Cancún right now.*\n\nEl resultado suele llevar marcadores de presente como *now*, *today*, *still* o *right now*. También puedes usar la forma continua (*would be living*) o cambiar *would* por *could* o *might* para expresar capacidad o posibilidad: *If I had learned French as a kid, I could work in Paris.*\n\nEl español funciona casi igual: «si hubiera estudiado, ahora tendría un mejor trabajo». Aprovecha esa intuición, pero recuerda que en inglés *would* nunca va en la parte del *if*.",
      },
      {
        heading: "Presente irreal → resultado pasado",
        body: "Forma: *if* + **past simple** (o *were*), *would have* + participio.\n\nLa condición describe algo que es verdad en general, no solo en un momento concreto: la personalidad, una habilidad o una situación estable.\n\n- *If I spoke Japanese, I would have understood the announcement.*\n- *If he weren't so stubborn, he would have apologized yesterday.*\n- *If she didn't love her job, she would have quit years ago.*\n\nEn registro cuidado se usa *were* con todas las personas (*if I were*, *if she were*); *was* es frecuente al hablar, pero en textos formales y exámenes elige *were*. En español: «si fuera más valiente, le habría dicho la verdad».",
      },
      {
        heading: "Matices y variantes",
        body: "- El orden de las cláusulas es libre: *I would be fluent now if I had practiced more.* Solo se usa coma cuando *if* va al principio.\n- *Would* se contrae en ambos tipos: *I'd be*, *I'd have gone*. En la condición, en cambio, *I'd* significa *I had*: *If I'd known…*\n- La condición puede quedar implícita con *otherwise* o *but for*: *I took a taxi; otherwise I would still be waiting.*\n- El resultado presente también funciona en preguntas: *Would you be happier now if you had stayed in Mexico?*\n- Si la condición y el resultado están en el mismo tiempo, no es mixto: usa el segundo o el tercer condicional.",
      },
    ],
    tables: [
      {
        caption: "Los dos tipos de condicional mixto.",
        columns: ["Tipo", "Condición (if)", "Resultado", "Ejemplo"],
        rows: [
          ["Pasado → presente", "if + past perfect", "would / could / might + base form", "If I had saved more money, I would be rich now."],
          ["Presente → pasado", "if + past simple / were", "would / could / might + have + past participle", "If I were taller, they would have picked me for the team."],
        ],
      },
      {
        caption: "Comparación con el segundo y el tercer condicional.",
        columns: ["Condicional", "Estructura", "Ejemplo"],
        rows: [
          ["Segundo (presente irreal)", "if + past simple, would + base form", "If I had a car, I would drive to work."],
          ["Tercero (pasado irreal)", "if + past perfect, would have + past participle", "If I had left earlier, I would have caught the train."],
          ["Mixto (pasado → presente)", "if + past perfect, would + base form", "If I had left earlier, I would be home by now."],
          ["Mixto (presente → pasado)", "if + past simple, would have + past participle", "If I had a car, I would have driven you home."],
        ],
      },
    ],
    examples: [
      ["If I had accepted that offer, I would be living in Madrid now.", "Si hubiera aceptado esa oferta, ahora estaría viviendo en Madrid."],
      ["If she hadn't broken her leg, she would be running the marathon today.", "Si no se hubiera roto la pierna, hoy estaría corriendo el maratón."],
      ["If I were more organized, I wouldn't have missed the deadline.", "Si fuera más organizado, no se me habría pasado la fecha límite."],
      ["If he didn't trust people so easily, he wouldn't have lent them all that money.", "Si no confiara tan fácilmente en la gente, no les habría prestado todo ese dinero."],
      ["We would know the results by now if they had sent the email.", "Ya sabríamos los resultados si hubieran mandado el correo."],
      ["If I had brought my glasses, I could read this menu.", "Si hubiera traído mis lentes, podría leer este menú."],
      ["If I weren't afraid of flying, I would have visited you in Australia last year.", "Si no me diera miedo volar, te habría visitado en Australia el año pasado."],
      ["If they had invested in the company back then, they might be millionaires today.", "Si hubieran invertido en la empresa en aquel entonces, hoy quizá serían millonarios."],
    ],
    mistakes: [
      ["If I would have studied medicine, I would be a doctor now.", "If I had studied medicine, I would be a doctor now.", "Después de «if» no se usa «would»; la condición pasada va en past perfect."],
      ["If she had taken the job, she would have lived in Toronto now.", "If she had taken the job, she would be living in Toronto now.", "Con «now» el resultado es presente, así que se usa «would» + infinitivo y no «would have»."],
      ["If I am more patient, I would have helped him.", "If I were more patient, I would have helped him.", "La condición presente irreal va en pasado («were»), aunque se refiera al presente."],
      ["If she hadn't missed the bus, she will be here now.", "If she hadn't missed the bus, she would be here now.", "En un condicional irreal el resultado lleva «would», nunca «will»."],
    ],
    quiz: [
      {
        prompt: "If I ___ harder when I was at school, I would have a better job now.",
        options: ["have studied", "had studied", "study", "will study"],
        answer: 1,
        explanation: "La condición se refiere al pasado (cuando estabas en la escuela), así que va en past perfect: «had studied».",
      },
      {
        prompt: "If she weren't so shy, she ___ to him at the party last night.",
        options: ["would talk", "will talk", "would have talked", "had talked"],
        answer: 2,
        explanation: "La condición es un rasgo presente y el resultado ocurrió anoche, por eso se usa «would have talked».",
      },
      {
        prompt: "If I hadn't lost my phone, I ___ show you the photos right now.",
        options: ["could", "can", "could have", "will"],
        answer: 0,
        explanation: "La condición es pasada, pero el resultado es presente («right now»), así que se usa «could» + infinitivo.",
      },
      {
        prompt: "¿Qué oración combina una condición presente con un resultado pasado?",
        options: [
          "If I had been braver, I would have quit that job years ago.",
          "If I were braver, I would quit my job.",
          "If I had been braver, I would be happier now.",
          "If I were braver, I would have quit that job years ago.",
        ],
        answer: 3,
        explanation: "Es la única que une una condición presente («were braver») con un resultado pasado («would have quit»).",
      },
      {
        prompt: "If he ___ so much money last month, he wouldn't be broke now.",
        options: ["doesn't spend", "hadn't spent", "hasn't spent", "won't spend"],
        answer: 1,
        explanation: "El gasto fue el mes pasado y la consecuencia es actual, por lo que la condición va en past perfect: «hadn't spent».",
      },
    ],
  },
  {
    slug: "inversion",
    level: "C1",
    title: "Inversión enfática",
    english: "Inversion",
    summary: "Invierte el orden sujeto-auxiliar tras expresiones negativas o restrictivas para dar énfasis, o sustituye a «if» en registro formal.",
    sections: [
      {
        heading: "Cómo funciona",
        body: "Cuando una expresión negativa o restrictiva abre la oración, el auxiliar se coloca **antes del sujeto**, como en una pregunta: *I have never seen* → *Never have I seen*.\n\n- Si ya hay auxiliar (*have*, *will*, *can*, *should*…), simplemente se invierte: *Seldom will you find a better deal.*\n- En presente o pasado simple se añade *do*, *does* o *did*: *She rarely complains* → *Rarely does she complain.*\n- Con *be* se invierte el propio verbo: *Never was I so embarrassed.*\n\nEl efecto es enfático y algo literario. Es habitual en discursos, periodismo, textos académicos y correos formales; en una charla casual puede sonar teatral o irónico. En español el orden es flexible («nunca he visto algo así») y no hay nada que invertir, pero en inglés la inversión es obligatoria cuando la expresión va al principio.",
      },
      {
        heading: "Expresiones que provocan inversión",
        body: "- *Never*, *rarely*, *seldom*: *Rarely have I felt so welcome.*\n- *Not only… but (also)*: solo se invierte la primera parte. *Not only did he lie, but he also blamed me.*\n- *No sooner… than* y *Hardly/Scarcely… when*: una acción seguida inmediatamente de otra, casi siempre con **past perfect**. *No sooner had I sat down than the phone rang.*\n- *Only then*, *only after*, *only when*, *only by*: la inversión va en la cláusula principal. *Only after the meeting did I understand.*\n- *Not until*: *Not until I got home did I realize.*\n- *Under no circumstances*, *on no account*, *at no time*: *Under no circumstances should you open this door.*\n- *Little*: *Little did they know…* equivale a «no tenían ni idea de que…».",
      },
      {
        heading: "Condicionales invertidos",
        body: "En registro formal puedes eliminar *if* y empezar con el auxiliar:\n\n1. *Had* (tercer condicional): *Had I known, I would have called.* = *If I had known…*\n2. *Should* (primer condicional, posibilidad poco probable o tono cortés): *Should you need help, call reception.*\n3. *Were* (segundo condicional): *Were I in charge, things would change.* Con otros verbos se usa *were* + *to*: *Were she to accept, we would start tomorrow.*\n\n*Were it not for* y *Had it not been for* equivalen a «de no ser por» y «de no haber sido por». La negación nunca se contrae: *Had I not seen it*, no *Hadn't I seen it*. Esta estructura es muy común en correos profesionales, contratos e instrucciones: *Should you have any questions, please contact us.*",
      },
      {
        heading: "Trampas frecuentes",
        body: "- Sin la expresión al principio no hay inversión: *I have never seen…*, *I had hardly arrived when…*\n- *No sooner* va con *than*; *hardly* y *scarcely* van con *when*. No los mezcles.\n- Con *only after*, *only when* y *not until*, la inversión no va en la subordinada sino en la principal: *Only when I saw her did I understand.*\n- *Not only* invierte la primera parte; la segunda (*but also*) mantiene el orden normal.\n- Úsala con moderación: una o dos inversiones dan fuerza a un texto; demasiadas lo vuelven artificial.",
      },
    ],
    tables: [
      {
        caption: "Inversión tras expresiones negativas o restrictivas.",
        columns: ["Expresión", "Orden normal", "Con inversión"],
        rows: [
          ["Never", "I have never felt so tired.", "Never have I felt so tired."],
          ["Rarely / Seldom", "She rarely makes mistakes.", "Rarely does she make mistakes."],
          ["Not only… but also", "He not only sings but also dances.", "Not only does he sing, but he also dances."],
          ["No sooner… than", "I had no sooner left than it started to rain.", "No sooner had I left than it started to rain."],
          ["Hardly… when", "We had hardly started when the lights went out.", "Hardly had we started when the lights went out."],
          ["Only after", "I understood only after reading it twice.", "Only after reading it twice did I understand."],
          ["Under no circumstances", "You should not leave under any circumstances.", "Under no circumstances should you leave."],
        ],
      },
      {
        caption: "Condicionales invertidos: registro formal.",
        columns: ["Tipo", "Con if", "Con inversión"],
        rows: [
          ["Tercer condicional", "If I had known, …", "Had I known, …"],
          ["Primer condicional (cortés)", "If you need anything, …", "Should you need anything, …"],
          ["Segundo condicional", "If I were in charge, …", "Were I in charge, …"],
          ["Segundo, con otro verbo", "If she accepted, …", "Were she to accept, …"],
          ["«De no ser por»", "If it weren't for your help, …", "Were it not for your help, …"],
          ["«De no haber sido por»", "If it hadn't been for the rain, …", "Had it not been for the rain, …"],
        ],
      },
    ],
    examples: [
      ["Never have I seen such a beautiful sunset.", "Nunca he visto un atardecer tan hermoso."],
      ["Not only did she finish the report, but she also presented it to the board.", "No solo terminó el informe, sino que además lo presentó ante la junta directiva."],
      ["No sooner had we arrived than it started to pour.", "Apenas habíamos llegado cuando empezó a llover a cántaros."],
      ["Only after the meeting did I realize my mistake.", "Solo después de la reunión me di cuenta de mi error."],
      ["Under no circumstances should you share your password.", "Bajo ninguna circunstancia debes compartir tu contraseña."],
      ["Had I known about the traffic, I would have left earlier.", "Si hubiera sabido lo del tráfico, habría salido antes."],
      ["Should you have any questions, please do not hesitate to contact us.", "Si tienes alguna pregunta, no dudes en contactarnos."],
      ["Were it not for your support, I would never have finished my degree.", "De no ser por tu apoyo, nunca habría terminado la carrera."],
    ],
    mistakes: [
      ["Rarely she complains about work.", "Rarely does she complain about work.", "En presente o pasado simple hay que añadir «do», «does» o «did» para invertir."],
      ["No sooner had I sat down when the phone rang.", "No sooner had I sat down than the phone rang.", "«No sooner» va con «than»; «when» se usa con «hardly» o «scarcely»."],
      ["Only after I finished the exam I realized my mistake.", "Only after I finished the exam did I realize my mistake.", "Con «only after», la inversión va en la cláusula principal, no en la subordinada."],
      ["Hadn't I seen the sign, I would have taken the wrong exit.", "Had I not seen the sign, I would have taken the wrong exit.", "En el condicional invertido la negación no se contrae: «Had I not…»."],
    ],
    quiz: [
      {
        prompt: "Never ___ such a rude waiter.",
        options: ["I have met", "have I met", "I met", "did I met"],
        answer: 1,
        explanation: "Con «never» al inicio, el auxiliar «have» se coloca antes del sujeto.",
      },
      {
        prompt: "Not only ___ late, but he also forgot the tickets.",
        options: ["he arrived", "arrived he", "did he arrive", "he did arrive"],
        answer: 2,
        explanation: "En pasado simple, la inversión necesita el auxiliar «did» antes del sujeto.",
      },
      {
        prompt: "No sooner had the movie started ___ the power went out.",
        options: ["than", "when", "that", "then"],
        answer: 0,
        explanation: "«No sooner» siempre se combina con «than».",
      },
      {
        prompt: "___ you require further information, please contact our office.",
        options: ["Had", "Were", "Would", "Should"],
        answer: 3,
        explanation: "«Should» invertido sustituye a «if» en peticiones formales sobre una posibilidad futura.",
      },
      {
        prompt: "Only when I got home ___ that my wallet was missing.",
        options: ["I noticed", "did I notice", "I did notice", "noticed I"],
        answer: 1,
        explanation: "Con «only when», la inversión va en la cláusula principal: «did I notice».",
      },
    ],
  },
  {
    slug: "cleft-sentences",
    level: "C1",
    title: "Oraciones escindidas",
    english: "Cleft sentences",
    summary: "Reorganizan la oración para destacar una parte de la información, como «fue Ana quien…» o «lo que necesito es…» en español.",
    sections: [
      {
        heading: "Para qué sirven",
        body: "Una oración escindida divide una idea en dos partes para destacar un elemento: quién, qué, cuándo, dónde o por qué. Compara:\n\n- *Maria called the police.* (neutral)\n- *It was Maria who called the police.* (fue María, no otra persona)\n- *What Maria did was call the police.* (lo que hizo fue llamar a la policía)\n\nAl hablar, el énfasis se marca a menudo con la entonación; por escrito no hay entonación, así que las *cleft sentences* hacen ese trabajo. Son útiles para corregir a alguien, contrastar ideas o presentar el punto principal de un argumento. El español tiene estructuras equivalentes («fue ella quien…», «lo que quiero es…»), así que la idea te resultará familiar; lo difícil está en los detalles de forma.",
      },
      {
        heading: "It-cleft: It is/was… that/who",
        body: "Forma: *it* + *be* + elemento destacado + *that/who* + resto de la oración.\n\n- Para personas, *who* o *that*: *It was my brother who found the keys.*\n- Para cosas, momentos y lugares, *that*: *It was in 2019 that we moved to Monterrey.*\n- *Be* va en singular aunque el foco sea plural: *It is the details that matter.*\n- El tiempo de *be* suele seguir al de la oración: *It was… that* para el pasado, *It is… that* para el presente.\n- En negativa: *It wasn't me who broke it.*\n- Con *not until*: *It wasn't until I moved abroad that I appreciated home.*\n\nCon lugares y momentos se prefiere *that* sobre *where* o *when* en registro cuidado.",
      },
      {
        heading: "Wh-cleft: What, All, The reason why",
        body: "Forma: cláusula con *what* + *be* + elemento destacado.\n\n- *What I need is a long vacation.*\n- *What annoys me is the noise.*\n- Para destacar una acción se usa *do*: *What she did was resign.* / *What you should do is call him.*\n- *All* significa «lo único que»: *All I want is some peace.*\n- *The reason (why)… is that…*: *The reason why I left is that I was bored.*\n- Otras variantes: *The thing (that) I love is…*, *The place where…*, *The person who…*\n\nEl orden puede invertirse para cerrar con fuerza: *A long vacation is what I need.* Las *wh-clefts* son muy comunes en presentaciones y conversaciones, porque anuncian lo importante antes de decirlo.",
      },
      {
        heading: "Detalles de forma y registro",
        body: "- No repitas el sujeto después de *who*: *It was Ana who called*, no *who she called*.\n- *What* ya contiene su antecedente («lo que»): no digas *the thing what* ni *all what*.\n- Con *What… did*, el verbo que sigue a *be* va en infinitivo, con o sin *to*: *What he did was (to) apologize.* Nunca en pasado: *was apologized* es incorrecto.\n- *The reason why… is because…* es muy frecuente en el habla, pero en registro formal se prefiere *is that*.\n- Las *it-clefts* son neutras y funcionan en cualquier registro; las *wh-clefts* con *all* o *what… did* resultan especialmente naturales al hablar.",
      },
    ],
    tables: [
      {
        caption: "Tipos de oración escindida.",
        columns: ["Tipo", "Estructura", "Ejemplo"],
        rows: [
          ["It-cleft", "It + be + focus + that/who + clause", "It was Luis who sent the email."],
          ["Wh-cleft", "What + subject + verb + be + focus", "What I need is more time."],
          ["Wh-cleft con acción", "What + subject + do + be + base form", "What we did was cancel the trip."],
          ["All-cleft", "All + subject + verb + be + focus", "All I want is a quiet weekend."],
          ["Reason-cleft", "The reason (why) + clause + be + that…", "The reason why I called is that I need your help."],
          ["Wh-cleft invertida", "Focus + be + what…", "More time is what I need."],
        ],
      },
      {
        caption: "De una oración neutra a una oración escindida.",
        columns: ["Foco", "Neutra", "Escindida"],
        rows: [
          ["La persona", "Carlos broke the window.", "It was Carlos who broke the window."],
          ["El objeto", "Carlos broke the window.", "It was the window that Carlos broke."],
          ["El lugar", "We met in Oaxaca.", "It was in Oaxaca that we met."],
          ["Lo que sientes", "I hate the traffic.", "What I hate is the traffic."],
          ["La acción", "She resigned.", "What she did was resign."],
        ],
      },
    ],
    examples: [
      ["It was my grandmother who taught me to cook.", "Fue mi abuela quien me enseñó a cocinar."],
      ["It wasn't until midnight that they finally arrived.", "No fue sino hasta la medianoche que por fin llegaron."],
      ["What I really need is a good night's sleep.", "Lo que realmente necesito es una buena noche de sueño."],
      ["What surprised me most was how friendly everyone was.", "Lo que más me sorprendió fue lo amables que eran todos."],
      ["All I wanted was to go home.", "Lo único que quería era irme a casa."],
      ["What you should do is talk to your manager.", "Lo que deberías hacer es hablar con tu jefe."],
      ["The reason why I'm calling is that the order hasn't arrived yet.", "El motivo por el que te llamo es que el pedido todavía no ha llegado."],
      ["It's the little things that make a difference.", "Son los pequeños detalles los que marcan la diferencia."],
    ],
    mistakes: [
      ["It was my sister who she found the keys.", "It was my sister who found the keys.", "«Who» ya funciona como sujeto; no repitas el pronombre."],
      ["All what I want is to rest.", "All I want is to rest.", "Tras «all» no se usa «what»: se omite el relativo o se usa «that»."],
      ["The thing what bothers me is the noise.", "What bothers me is the noise.", "«What» ya incluye su antecedente; con «the thing» se usa «that»."],
      ["It were the students who complained.", "It was the students who complained.", "En la «it-cleft», «be» concuerda con «it» y va en singular."],
    ],
    quiz: [
      {
        prompt: "It was in Guadalajara ___ I first met her.",
        options: ["which", "that", "what", "who"],
        answer: 1,
        explanation: "En una «it-cleft» que destaca un lugar, el resto de la oración se introduce con «that».",
      },
      {
        prompt: "___ I need right now is a strong coffee.",
        options: ["That", "Which", "It", "What"],
        answer: 3,
        explanation: "«What» equivale a «lo que» y abre la «wh-cleft».",
      },
      {
        prompt: "What he did was ___ the whole project from scratch.",
        options: ["restart", "restarted", "restarting", "has restarted"],
        answer: 0,
        explanation: "Tras «What he did was», el verbo va en infinitivo, sin terminación.",
      },
      {
        prompt: "All ___ is a little respect.",
        options: ["what I ask", "I ask", "that what I ask", "which I ask"],
        answer: 1,
        explanation: "Después de «all» se omite el relativo o se usa «that», nunca «what».",
      },
      {
        prompt: "¿Qué oración pone el foco en la persona que hizo la acción?",
        options: ["What Tom did was fix the car.", "Tom fixed the car.", "It was Tom who fixed the car.", "The car is what Tom fixed."],
        answer: 2,
        explanation: "La estructura «It was… who» destaca a la persona: fue Tom y no otro.",
      },
    ],
  },
  {
    slug: "past-modals",
    level: "C1",
    title: "Modales en pasado",
    english: "Past modals",
    summary: "Sirven para criticar, lamentar o especular sobre el pasado: lo que debiste hacer, lo que pudo pasar y lo que no hacía falta.",
    sections: [
      {
        heading: "Should have y shouldn't have",
        body: "Forma: *should (not)* + *have* + participio. Indica que algo era lo correcto y no se hizo, o al revés.\n\n- Arrepentimiento: *I should have saved more money.* («Debí haber ahorrado más»).\n- Crítica: *You shouldn't have said that to her.*\n- Expectativa no cumplida: *The package should have arrived by now.* («Ya debería haber llegado»).\n\n*Ought to have* + participio significa lo mismo, pero es más formal y menos frecuente. Cuidado con el español: decimos «debí» o «debía haber», pero *must have* **no** expresa obligación pasada sino deducción. *He must have left* significa «seguramente ya se fue». Para criticar o lamentar, usa *should have*.",
      },
      {
        heading: "Could have, might have y would have",
        body: "- *Could have*: algo era posible, pero no ocurrió. *You could have been killed!* («¡Te pudiste haber matado!»). También sirve para reprochar: *You could have told me!*\n- *Couldn't have*: imposibilidad o deducción negativa. *She couldn't have known; nobody told her.*\n- *Might have* y *may have*: especulación sobre lo que pasó. *They might have missed the bus.*\n- *Would have*: resultado imaginario, casi siempre con una condición explícita o implícita. *I would have helped you (if you had asked).* / *I'd have loved to come.*\n\nEn español todas estas ideas caben en «podría haber», «habría» o «pudo haber»; en inglés el modal concreto marca si hablas de posibilidad, deducción o resultado hipotético.",
      },
      {
        heading: "Needn't have frente a didn't need to",
        body: "Esta distinción no existe en español, donde ambas formas se traducen como «no hacía falta».\n\n- *Needn't have* + participio: la acción **sí se hizo**, pero resultó innecesaria. *I needn't have cooked; they had already eaten.* (Cociné, y fue en vano).\n- *Didn't need to* + infinitivo: la acción no era necesaria y, por lo general, **no se hizo**. *I didn't need to cook, so I ordered a pizza.*\n\n*Needn't have* es más británico y algo formal. En inglés estadounidense es más común usar *didn't need to* o *didn't have to* en ambos casos y aclarar con el contexto: *I didn't need to bring a jacket, but I brought one anyway.*",
      },
      {
        heading: "Forma, pronunciación y variantes",
        body: "- Después de *have* va siempre el participio: *should have called*, no *should have call*.\n- Al hablar, *have* se reduce: *should've*, *could've*, *would've*. Por eso muchos nativos escriben por error *should of*; no lo copies.\n- La negación va en el modal: *shouldn't have*, *couldn't have*, *wouldn't have*.\n- Forma continua: *You should have been paying attention.*\n- Forma pasiva: *The report should have been sent yesterday.*\n- En un reproche, *could have* suena más suave que *should have*: *You could have asked* transmite decepción; *You should have asked* es una crítica directa.",
      },
    ],
    tables: [
      {
        caption: "Modales perfectos: forma y uso.",
        columns: ["Uso", "Estructura", "Ejemplo"],
        rows: [
          ["Arrepentimiento o crítica", "should have + past participle", "I should have called you."],
          ["Crítica de algo que sí se hizo", "shouldn't have + past participle", "You shouldn't have shouted at him."],
          ["Posibilidad no realizada", "could have + past participle", "We could have won the game."],
          ["Imposibilidad en el pasado", "couldn't have + past participle", "He couldn't have seen us; it was dark."],
          ["Especulación", "might have / may have + past participle", "She might have forgotten."],
          ["Resultado hipotético", "would have + past participle", "I would have gone with you."],
          ["Se hizo, pero no hacía falta", "needn't have + past participle", "You needn't have waited for me."],
        ],
      },
      {
        caption: "Needn't have frente a didn't need to.",
        columns: ["¿Se hizo la acción?", "Estructura", "Ejemplo"],
        rows: [
          ["Sí, pero no hacía falta", "needn't have + past participle", "I needn't have taken a taxi; the station was close."],
          ["No, porque no hacía falta", "didn't need to + base form", "I didn't need to take a taxi, so I walked."],
          ["No (muy común en EE. UU.)", "didn't have to + base form", "We didn't have to pay; it was free."],
        ],
      },
    ],
    examples: [
      ["I should have listened to my mother.", "Debí haberle hecho caso a mi mamá."],
      ["You shouldn't have bought such an expensive gift.", "No debiste comprar un regalo tan caro."],
      ["We could have gone to the beach, but it rained all weekend.", "Pudimos haber ido a la playa, pero llovió todo el fin de semana."],
      ["You could have warned me about the exam!", "¡Pudiste haberme avisado del examen!"],
      ["She might have left her phone at the office.", "Tal vez dejó el celular en la oficina."],
      ["I would have helped you if you had asked.", "Te habría ayudado si me lo hubieras pedido."],
      ["You needn't have brought food; we had plenty.", "No hacía falta que trajeras comida; teníamos de sobra."],
      ["I didn't need to wake up early, so I slept in.", "No tenía que levantarme temprano, así que dormí hasta tarde."],
    ],
    mistakes: [
      ["I must have studied more for the exam.", "I should have studied more for the exam.", "«Must have» expresa deducción, no obligación; para lamentar algo se usa «should have»."],
      ["You should of told me.", "You should have told me.", "«Of» es un error de escritura por el sonido de «should've»; la forma correcta es «have»."],
      ["I needn't have brought an umbrella, so I left it at home.", "I didn't need to bring an umbrella, so I left it at home.", "«Needn't have» implica que la acción sí se hizo; si no se hizo, usa «didn't need to»."],
      ["You should have call me.", "You should have called me.", "Después de «have» va el participio pasado, no el infinitivo."],
    ],
    quiz: [
      {
        prompt: "I'm exhausted. I ___ to bed so late last night.",
        options: ["shouldn't go", "mustn't have gone", "shouldn't have gone", "couldn't have gone"],
        answer: 2,
        explanation: "Para lamentar algo que sí hiciste en el pasado se usa «shouldn't have» + participio.",
      },
      {
        prompt: "That driver was going way too fast. We ___ been killed!",
        options: ["could have", "should have", "needn't have", "would"],
        answer: 0,
        explanation: "«Could have» expresa un peligro posible que al final no ocurrió.",
      },
      {
        prompt: "I ___ a taxi, so I walked to the station.",
        options: ["needn't have taken", "didn't need to take", "shouldn't have taken", "couldn't have taken"],
        answer: 1,
        explanation: "No tomaste el taxi porque no hacía falta, por eso se usa «didn't need to».",
      },
      {
        prompt: "¿Qué oración indica que compraste los boletos aunque no hacía falta?",
        options: [
          "I didn't need to buy the tickets, so I saved the money.",
          "I shouldn't buy the tickets.",
          "I couldn't have bought the tickets.",
          "I needn't have bought the tickets.",
        ],
        answer: 3,
        explanation: "«Needn't have» + participio indica que la acción se realizó, pero resultó innecesaria.",
      },
      {
        prompt: "You ___ me! I would have picked you up at the airport.",
        options: ["must have called", "needn't have called", "could have called", "can have called"],
        answer: 2,
        explanation: "«Could have» sirve para reprochar algo que la otra persona pudo hacer y no hizo.",
      },
    ],
  },
  {
    slug: "participle-clauses",
    level: "C1",
    title: "Cláusulas de participio",
    english: "Participle clauses",
    summary: "Condensan dos ideas en una sola oración con un participio, un recurso típico del inglés escrito, formal y narrativo.",
    sections: [
      {
        heading: "Qué son y para qué sirven",
        body: "Una cláusula de participio sustituye una subordinada completa (con conjunción, sujeto y verbo conjugado) por un participio. El resultado es más compacto y elegante, propio de la escritura formal, la narrativa y el periodismo.\n\n- *Because I didn't know what to do, I called my dad.* → *Not knowing what to do, I called my dad.*\n- *After she had finished the report, she went home.* → *Having finished the report, she went home.*\n- *The house, which was built in 1990, needs repairs.* → *Built in 1990, the house needs repairs.*\n\nPueden expresar causa, tiempo, condición o simple descripción; el contexto indica cuál. El español usa a veces el gerundio de forma parecida («sin saber qué hacer, llamé a mi papá»), pero en inglés la estructura es más frecuente y tiene reglas más estrictas.",
      },
      {
        heading: "Tres tipos de participio",
        body: "1. **Participio presente** (*-ing*): sentido activo; acción simultánea o causa. *Walking down the street, I saw an old friend.* / *Feeling tired, she went to bed early.*\n2. **Participio perfecto** (*having* + participio): sentido activo; la acción es claramente anterior a la principal. *Having lived in London, he knows the city well.* En pasiva: *Having been warned, we took precautions.*\n3. **Participio pasado** (*-ed* o forma irregular): sentido pasivo. *Written in 1990, the novel is still popular.* / *Seen from above, the city looks tiny.*\n\nLa negación se forma con *not* delante del participio: *Not having slept, I was exhausted.* Nunca uses *don't* ni *no*.",
      },
      {
        heading: "El sujeto debe coincidir",
        body: "Regla clave: el sujeto implícito de la cláusula de participio tiene que ser el mismo que el de la cláusula principal. Si no coincide, aparece un *dangling participle* (participio colgante), que suena incorrecto o absurdo.\n\n- Incorrecto: *Walking into the room, the window was open.* (¿La ventana entró caminando?)\n- Correcto: *Walking into the room, I noticed the window was open.*\n- Incorrecto: *Having finished dinner, the dishes were washed.*\n- Correcto: *Having finished dinner, we washed the dishes.*\n\nSi los sujetos son distintos, usa una cláusula completa: *When I walked into the room, the window was open.* En registro muy formal existe la construcción absoluta, con su propio sujeto: *The meeting having ended, everyone left.* Algunas fórmulas fijas también son aceptables: *weather permitting*, *generally speaking*, *considering…*",
      },
      {
        heading: "Conjunciones, preposiciones y registro",
        body: "- Puedes conservar algunas conjunciones para aclarar el sentido: *after finishing*, *before leaving*, *while waiting*, *when asked*, *once completed*, *since moving here*.\n- Después de preposición va *-ing*: *on arriving*, *by working hard*, *without saying a word*.\n- También reducen oraciones de relativo: *the man sitting next to me* (= *who was sitting*), *products made in Mexico* (= *which are made*).\n\nEn la conversación cotidiana son menos frecuentes: ahí se prefieren las cláusulas con *because*, *when* o *after*. En correos profesionales, informes y ensayos aportan concisión, siempre que no encadenes demasiadas seguidas.",
      },
    ],
    tables: [
      {
        caption: "Formas de la cláusula de participio.",
        columns: ["Tipo y sentido", "Forma", "Ejemplo"],
        rows: [
          ["Presente: activo, simultáneo o causa", "verb + -ing", "Knowing the risks, he still accepted."],
          ["Perfecto: activo, anterior", "having + past participle", "Having finished, she left."],
          ["Perfecto pasivo: anterior", "having been + past participle", "Having been criticized, he apologized."],
          ["Pasado: pasivo", "past participle", "Made by hand, each piece is unique."],
          ["Negativo", "not + participle", "Not wanting to wait, we left."],
        ],
      },
      {
        caption: "De cláusula completa a cláusula de participio.",
        columns: ["Valor", "Cláusula completa", "Cláusula de participio"],
        rows: [
          ["Causa", "Because she felt sick, she stayed home.", "Feeling sick, she stayed home."],
          ["Tiempo (anterior)", "After I had read the email, I deleted it.", "Having read the email, I deleted it."],
          ["Tiempo (simultáneo)", "While I was waiting, I read a magazine.", "While waiting, I read a magazine."],
          ["Condición", "If it is stored properly, the cheese lasts for weeks.", "Stored properly, the cheese lasts for weeks."],
          ["Descripción", "The letter, which was written in French, was hard to read.", "Written in French, the letter was hard to read."],
        ],
      },
    ],
    examples: [
      ["Having finished her degree, she moved to Canada.", "Después de terminar la carrera, se mudó a Canadá."],
      ["Not knowing anyone at the party, I stayed close to the door.", "Como no conocía a nadie en la fiesta, me quedé cerca de la puerta."],
      ["Built in the sixteenth century, the cathedral attracts thousands of visitors.", "Construida en el siglo XVI, la catedral atrae a miles de visitantes."],
      ["Walking home last night, I saw a shooting star.", "Anoche, mientras caminaba a casa, vi una estrella fugaz."],
      ["Having been rejected twice, he decided to change his strategy.", "Tras haber sido rechazado dos veces, decidió cambiar de estrategia."],
      ["When asked about the delay, the manager refused to comment.", "Cuando le preguntaron por el retraso, el gerente se negó a hacer comentarios."],
      ["The people living next door are from Peru.", "Las personas que viven al lado son de Perú."],
      ["Feeling much better, she went back to work.", "Como se sentía mucho mejor, volvió al trabajo."],
    ],
    mistakes: [
      ["Arriving at the airport, my flight was canceled.", "Arriving at the airport, I found that my flight had been canceled.", "El sujeto de la cláusula de participio debe ser el mismo que el de la principal."],
      ["Finished the work, I went home.", "Having finished the work, I went home.", "Para una acción anterior con sentido activo se usa «having» + participio."],
      ["Writing in 1950, the book is still relevant.", "Written in 1950, the book is still relevant.", "El libro no escribe, sino que fue escrito: el sentido pasivo pide el participio pasado."],
      ["Don't knowing the answer, I stayed quiet.", "Not knowing the answer, I stayed quiet.", "La negación de un participio se forma con «not», nunca con «don't»."],
    ],
    quiz: [
      {
        prompt: "___ the email, she closed her laptop and went to bed.",
        options: ["Sent", "Having sent", "Have sent", "To send"],
        answer: 1,
        explanation: "Enviar el correo ocurrió antes y tiene sentido activo, así que se usa «having» + participio.",
      },
      {
        prompt: "___ in 1885, the bridge is one of the oldest in the city.",
        options: ["Building", "Having built", "Built", "Build"],
        answer: 2,
        explanation: "El puente fue construido: el sentido pasivo pide el participio pasado «built».",
      },
      {
        prompt: "___ what to say, he just smiled.",
        options: ["Not knowing", "Don't knowing", "No knowing", "Knowing not"],
        answer: 0,
        explanation: "La negación de un participio se forma con «not» delante.",
      },
      {
        prompt: "¿Cuál de estas oraciones tiene un participio colgante?",
        options: [
          "Opening the door, I saw the cat.",
          "Having eaten, we left the restaurant.",
          "Covered in snow, the mountain looked beautiful.",
          "Opening the door, the cat ran out.",
        ],
        answer: 3,
        explanation: "Da a entender que el gato abrió la puerta, porque el sujeto principal no coincide con quien realiza la acción.",
      },
      {
        prompt: "The woman ___ next to me on the plane was a famous chef.",
        options: ["sits", "sitting", "having sat", "who sitting"],
        answer: 1,
        explanation: "«Sitting» reduce la oración de relativo «who was sitting».",
      },
    ],
  },
  {
    slug: "subjunctive-and-unreal-past",
    level: "C1",
    title: "Subjuntivo y pasado irreal",
    english: "The subjunctive and the unreal past",
    summary: "Formas especiales para recomendaciones formales, preferencias y comparaciones irreales en las que el tiempo verbal no marca el tiempo real.",
    sections: [
      {
        heading: "El subjuntivo mandativo",
        body: "Tras verbos y adjetivos de sugerencia, exigencia o importancia, el inglés formal usa la **forma base** del verbo con todas las personas: sin *-s*, sin *to* y sin cambio de tiempo.\n\n- Verbos: *suggest*, *recommend*, *insist*, *demand*, *propose*, *request*, *require*.\n- Adjetivos: *essential*, *vital*, *important*, *crucial*, *necessary*.\n\n*I suggest that he be more careful.* / *The doctor recommended that she take a week off.* / *It is essential that every employee attend the training.*\n\nLa negación es *not* + forma base: *We insisted that he not drive.* El *that* puede omitirse. En inglés británico también es común *should*: *I suggest that he should be more careful.* El español usa aquí el subjuntivo («sugiero que sea»), y es tentador traducirlo con *is*; en inglés formal, lo correcto es la forma base.",
      },
      {
        heading: "It's (high) time y would rather + pasado",
        body: "Algunas expresiones piden **past simple** aunque hablen del presente o del futuro: el pasado indica que la situación es irreal o todavía no ocurre.\n\n- *It's time*, *It's high time*, *It's about time* + sujeto + pasado: algo que ya debería estar pasando, a menudo con tono de crítica. *It's high time you got a job.* («Ya es hora de que consigas trabajo»). Sin sujeto se usa *to*: *It's time to go.*\n- *Would rather* + otro sujeto + pasado: preferencia sobre lo que hace otra persona. *I'd rather you didn't smoke here.*\n- Con el mismo sujeto va el infinitivo sin *to*: *I'd rather stay home.*\n- Para referirse al pasado se usa **past perfect**: *I'd rather you hadn't told him.*",
      },
      {
        heading: "As if y as though",
        body: "Ambas significan «como si»; *as though* es un poco más formal.\n\n- Comparación irreal o improbable en presente: pasado simple o *were*. *He talks as if he were the boss.* (No lo es).\n- Comparación con algo anterior: **past perfect**. *She looked as if she had seen a ghost.*\n- Si la comparación puede ser cierta, se usa el tiempo normal: *It looks as if it's going to rain.* (Probablemente va a llover).\n\nEn español, «como si» siempre va con subjuntivo («como si fuera», «como si hubiera visto»). En inglés ese papel lo cumple el pasado irreal. Al hablar se oye *as if he is*, pero *were* deja claro que la comparación es imaginaria.",
      },
      {
        heading: "Were, frases hechas y registro",
        body: "- *Were* con todas las personas es la forma irreal clásica: *If I were you*, *as if she were*, *I wish it were Friday*. *Was* es común al hablar, pero *were* se prefiere en registro cuidado.\n- El subjuntivo mandativo es formal y muy habitual en el inglés estadounidense; aparece en contratos, reglamentos, actas y correos profesionales.\n- Algunas expresiones fijas conservan el subjuntivo: *So be it*, *Be that as it may*, *Come what may*, *Long live…*\n- La idea central: en estas estructuras el tiempo verbal no indica cuándo ocurre la acción, sino qué tan real o hipotética es.",
      },
    ],
    tables: [
      {
        caption: "Estructuras con subjuntivo y pasado irreal.",
        columns: ["Estructura", "Forma del verbo", "Ejemplo"],
        rows: [
          ["suggest / recommend / insist that", "base form", "They recommended that he see a specialist."],
          ["It is essential / vital that", "base form", "It is vital that she be informed."],
          ["It's (high) time + sujeto", "past simple", "It's time we left."],
          ["would rather + otro sujeto", "past simple", "I'd rather you called me first."],
          ["would rather + otro sujeto (pasado)", "past perfect", "I'd rather you hadn't come."],
          ["as if / as though (irreal)", "past simple / were", "She acts as if she owned the place."],
          ["as if / as though (anterior)", "past perfect", "He looked as if he hadn't slept."],
        ],
      },
      {
        caption: "Del subjuntivo español a la forma inglesa.",
        columns: ["Español", "Inglés"],
        rows: [
          ["Sugiero que él sea más paciente.", "I suggest that he be more patient."],
          ["Es importante que ella llegue a tiempo.", "It's important that she arrive on time."],
          ["Ya es hora de que te vayas.", "It's time you went."],
          ["Preferiría que no lo hicieras.", "I'd rather you didn't do it."],
          ["Habla como si lo supiera todo.", "He talks as if he knew everything."],
        ],
      },
    ],
    examples: [
      ["The committee recommended that the project be postponed.", "El comité recomendó que se pospusiera el proyecto."],
      ["I insist that he apologize to everyone.", "Insisto en que se disculpe con todos."],
      ["It's essential that every passenger wear a seatbelt.", "Es indispensable que todos los pasajeros usen el cinturón de seguridad."],
      ["It's high time you started taking your health seriously.", "Ya es hora de que empieces a tomarte en serio tu salud."],
      ["I'd rather you didn't tell anyone about this.", "Preferiría que no le contaras esto a nadie."],
      ["He spends money as if he were a millionaire.", "Gasta dinero como si fuera millonario."],
      ["She looked as though she had been crying.", "Tenía cara de haber estado llorando."],
      ["I'd rather you had asked me first.", "Habría preferido que me preguntaras primero."],
    ],
    mistakes: [
      ["I suggest him to take a break.", "I suggest that he take a break.", "«Suggest» no admite objeto + infinitivo; se construye con «that» + forma base."],
      ["It's time we go home.", "It's time we went home.", "Tras «It's time» + sujeto se usa pasado simple, aunque se hable del presente."],
      ["I would rather to stay home tonight.", "I would rather stay home tonight.", "Cuando el sujeto es el mismo, «would rather» va con infinitivo sin «to»."],
      ["The manager demanded that she is present at the meeting.", "The manager demanded that she be present at the meeting.", "Tras «demand that» se usa la forma base «be», no «is»."],
    ],
    quiz: [
      {
        prompt: "The doctor recommended that he ___ less salt.",
        options: ["eat", "to eat", "eating", "will eat"],
        answer: 0,
        explanation: "Tras «recommend that» se usa la forma base del verbo, sin «-s» ni «to».",
      },
      {
        prompt: "It's high time you ___ looking for a new apartment.",
        options: ["starting", "started", "will start", "to start"],
        answer: 1,
        explanation: "Después de «It's high time» + sujeto se usa pasado simple.",
      },
      {
        prompt: "I'd rather you ___ my phone without asking.",
        options: ["won't use", "not to use", "didn't use", "not using"],
        answer: 2,
        explanation: "Con «would rather» y otro sujeto, el verbo va en pasado simple.",
      },
      {
        prompt: "He talks about Paris as if he ___ there for years, but he's never even been to France.",
        options: ["lives", "will live", "is living", "had lived"],
        answer: 3,
        explanation: "La comparación es irreal y se refiere a un periodo anterior, así que va en past perfect.",
      },
      {
        prompt: "It is essential that the contract ___ signed before Friday.",
        options: ["being", "be", "to be", "has"],
        answer: 1,
        explanation: "Tras «It is essential that» se usa la forma base «be», propia del subjuntivo.",
      },
    ],
  },
];
