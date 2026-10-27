import type { GrammarTopic } from "../types";

export const B1: GrammarTopic[] = [
  {
    slug: "present-perfect",
    level: "B1",
    title: "El presente perfecto",
    english: "Present perfect",
    summary:
      "Sirve para hablar de experiencias, resultados recientes y situaciones que empezaron en el pasado y siguen hasta hoy.",
    sections: [
      {
        heading: "¿Cuándo se usa?",
        body: "El presente perfecto conecta el pasado con el presente. No importa *cuándo* pasó algo, sino que tiene relevancia ahora. Se usa para:\n- **Experiencias de vida**, sin decir cuándo: *I have been to Paris.*\n- **Resultados recientes** que se notan ahora: *I've lost my keys* (y todavía no aparecen).\n- **Situaciones que empezaron en el pasado y siguen**: *She has lived here for ten years.*\n\nSi dices el momento exacto (*yesterday*, *in 2020*), ya no es presente perfecto: es pasado simple.",
      },
      {
        heading: "Cómo se forma",
        body: "Se forma con **have** o **has** + **participio pasado**.\n- *I / you / we / they* → **have**: *They have finished.*\n- *he / she / it* → **has**: *He has finished.*\n\nEn la conversación se contrae: *I've*, *she's*, *we've*. Negativo: *haven't* / *hasn't*. Pregunta: se invierte el orden, *Have you seen it?*\n\nLos verbos regulares forman el participio con *-ed* (*worked*, *played*), pero muchos verbos frecuentes son irregulares: *go → gone*, *see → seen*, *eat → eaten*. Conviene aprenderlos en tres columnas: *go, went, gone*.",
      },
      {
        heading: "Ever, never, just, already y yet",
        body: "Estas palabras acompañan mucho al presente perfecto:\n- **ever** (alguna vez), en preguntas: *Have you ever tried sushi?*\n- **never** (nunca), con verbo afirmativo, sin *not*: *I've never seen snow.*\n- **just** (acabar de), entre *have* y el participio: *She's just left.*\n- **already** (ya), en afirmativo: *We've already eaten.*\n- **yet** (todavía / ya), al final, en negativo y preguntas: *I haven't called him yet.* / *Have you finished yet?*\n\n«Acabo de llegar» no se traduce con *finish*, sino con *just*: *I've just arrived.*",
      },
      {
        heading: "For y since: desde cuándo",
        body: "Para algo que empezó en el pasado y sigue, el español usa el presente: «vivo aquí desde 2019», «hace tres años que trabajo aquí». El inglés **no** usa el presente en este caso, sino el presente perfecto.\n- **for** + duración: *for three years*, *for a week*, *for a long time*.\n- **since** + punto de inicio: *since 2019*, *since Monday*, *since I was a child*.\n\n*I've worked here for three years.* = «Trabajo aquí desde hace tres años». Decir *I work here since 2019* es un error muy común entre hispanohablantes.",
      },
    ],
    tables: [
      {
        caption: "Formas del presente perfecto",
        columns: ["Sujeto", "Afirmativa", "Negativa", "Pregunta"],
        rows: [
          ["I / you / we / they", "They have left.", "They haven't left.", "Have they left?"],
          ["he / she / it", "She has left.", "She hasn't left.", "Has she left?"],
        ],
      },
      {
        caption: "Participios irregulares frecuentes",
        columns: ["Infinitivo", "Pasado", "Participio", "Significado"],
        rows: [
          ["go", "went", "gone", "ir"],
          ["see", "saw", "seen", "ver"],
          ["eat", "ate", "eaten", "comer"],
          ["write", "wrote", "written", "escribir"],
          ["do", "did", "done", "hacer"],
          ["be", "was / were", "been", "ser / estar"],
          ["take", "took", "taken", "tomar / llevar"],
          ["buy", "bought", "bought", "comprar"],
        ],
      },
    ],
    examples: [
      ["Have you ever been to Mexico City?", "¿Alguna vez has estado en la Ciudad de México?"],
      ["I've never eaten octopus.", "Nunca he comido pulpo."],
      ["She's just finished her homework.", "Acaba de terminar su tarea."],
      ["We haven't decided yet.", "Todavía no hemos decidido."],
      ["They've already bought the tickets.", "Ya compraron los boletos."],
      ["I've lived in this city since 2018.", "Vivo en esta ciudad desde 2018."],
      ["He has worked here for five years.", "Lleva cinco años trabajando aquí."],
      ["I've lost my phone. Can you call it?", "Perdí mi celular. ¿Le puedes marcar?"],
    ],
    mistakes: [
      ["I live here since 2019.", "I've lived here since 2019.", "Para algo que empezó en el pasado y sigue, el inglés usa presente perfecto, no presente."],
      ["She have finished.", "She has finished.", "Con *he*, *she* e *it* el auxiliar es *has*."],
      ["Have you ever went to Cancún?", "Have you ever been to Cancún?", "Después de *have* va el participio (*been*), no el pasado (*went*)."],
      ["I haven't never seen snow.", "I've never seen snow.", "En inglés no se usa doble negación: *never* ya es negativo."],
    ],
    quiz: [
      {
        prompt: "She ___ in London since 2020.",
        options: ["lives", "has lived", "lived", "is living"],
        answer: 1,
        explanation: "Con *since* y una situación que sigue hasta hoy se usa el presente perfecto.",
      },
      {
        prompt: "Have you ___ been to Japan?",
        options: ["ever", "yet", "since", "for"],
        answer: 0,
        explanation: "*Ever* significa «alguna vez» y va en preguntas sobre experiencias.",
      },
      {
        prompt: "I haven't finished my homework ___.",
        options: ["already", "just", "yet", "ever"],
        answer: 2,
        explanation: "*Yet* va al final de oraciones negativas con el sentido de «todavía».",
      },
      {
        prompt: "We've known each other ___ ten years.",
        options: ["since", "for", "during", "from"],
        answer: 1,
        explanation: "*For* va con una duración; *since* va con el momento en que empezó algo.",
      },
      {
        prompt: "¿Cómo se dice «acabo de comer»?",
        options: ["I finish eating.", "I've already eat.", "I just eat.", "I've just eaten."],
        answer: 3,
        explanation: "«Acabar de» se expresa con *have just* + participio.",
      },
    ],
  },
  {
    slug: "present-perfect-vs-past-simple",
    level: "B1",
    title: "Presente perfecto o pasado simple",
    english: "Present perfect vs past simple",
    summary:
      "Te ayuda a elegir entre los dos tiempos según si el momento del que hablas ya terminó o sigue abierto.",
    sections: [
      {
        heading: "La regla principal",
        body: "La diferencia no está en qué tan lejos pasó algo, sino en el **periodo de tiempo** del que hablas.\n- **Pasado simple**: un momento terminado y concreto. *I saw her yesterday.*\n- **Presente perfecto**: un periodo que llega hasta ahora, o una experiencia sin fecha. *I've seen her three times this week.*\n\nUn truco útil: si puedes responder «¿cuándo?» con una fecha o un momento cerrado, usa pasado simple. Si el periodo sigue abierto o la fecha no importa, usa presente perfecto.",
      },
      {
        heading: "Palabras que obligan al pasado simple",
        body: "Con expresiones de tiempo terminado, el presente perfecto es incorrecto:\n- *yesterday*, *last night*, *last week*, *last year*\n- *in 2019*, *in March*, *on Monday*\n- *two days ago*, *a long time ago*\n- *when I was a child*, *when I lived in Monterrey*\n- preguntas con *When...?*: *When did you arrive?*\n\nAunque la acción sea reciente, si mencionas el momento, va en pasado simple: *I called her an hour ago*, no *I've called her an hour ago*.",
      },
      {
        heading: "Periodos sin terminar",
        body: "Con periodos que todavía no terminan se usa presente perfecto:\n- *today*, *this week*, *this month*, *this year*\n- *so far* (hasta ahora), *recently*, *lately*\n\n*I've drunk three coffees today.* El día sigue y podrías tomar otro.\n\nCompara: *I drank three coffees yesterday.* Ayer ya terminó.\n\nCon *this morning* depende de la hora: si todavía es de mañana, *I've called him twice this morning*; si ya es de tarde, *I called him twice this morning*.",
      },
      {
        heading: "La trampa para hispanohablantes",
        body: "En México casi siempre usamos el pretérito: «¿Ya comiste?», «Nunca fui a Europa», «Hoy trabajé mucho». Por eso es fácil pasar todo al pasado simple en inglés.\n\nPara **experiencias de vida** sin fecha, el inglés prefiere el presente perfecto: «Nunca fui a Europa» → *I've never been to Europe.*\n\nUna conversación típica empieza con presente perfecto (la experiencia) y sigue con pasado simple (los detalles):\n- *Have you ever been to Oaxaca?*\n- *Yes, I have. I went last year and loved it.*",
      },
    ],
    tables: [
      {
        caption: "Expresiones de tiempo",
        columns: ["Pasado simple (tiempo terminado)", "Presente perfecto (tiempo abierto o sin fecha)"],
        rows: [
          ["yesterday", "today"],
          ["last week", "this week"],
          ["in 2019", "since 2019"],
          ["three days ago", "for three days"],
          ["when I was a child", "ever / never"],
          ["When did you...?", "How long have you...?"],
        ],
      },
      {
        caption: "Misma idea, distinto significado",
        columns: ["Pasado simple", "Presente perfecto", "Diferencia"],
        rows: [
          ["I lived in Puebla for two years.", "I've lived in Puebla for two years.", "Ya no vives ahí / sigues viviendo ahí"],
          ["She wrote three books.", "She has written three books.", "Su carrera terminó / puede escribir más"],
          ["Did you see Ana this morning?", "Have you seen Ana this morning?", "Ya es de tarde / todavía es de mañana"],
        ],
      },
    ],
    examples: [
      ["I visited my grandparents last weekend.", "Visité a mis abuelos el fin de semana pasado."],
      ["I've visited my grandparents three times this month.", "He visitado a mis abuelos tres veces este mes."],
      ["We moved to Guadalajara in 2021.", "Nos mudamos a Guadalajara en 2021."],
      ["We've lived in Guadalajara since 2021.", "Vivimos en Guadalajara desde 2021."],
      ["Have you ever met someone famous?", "¿Alguna vez has conocido a alguien famoso?"],
      ["I met a famous singer at the airport two years ago.", "Conocí a un cantante famoso en el aeropuerto hace dos años."],
      ["It has rained a lot this week.", "Ha llovido mucho esta semana."],
      ["When did you start learning English?", "¿Cuándo empezaste a aprender inglés?"],
    ],
    mistakes: [
      ["I have finished the project last Friday.", "I finished the project last Friday.", "*Last Friday* es un momento terminado, así que pide pasado simple."],
      ["When have you arrived?", "When did you arrive?", "Las preguntas con *When* piden un momento concreto y van en pasado simple."],
      ["I've seen him two days ago.", "I saw him two days ago.", "*Ago* siempre va con pasado simple."],
      ["I didn't see him since Monday.", "I haven't seen him since Monday.", "*Since* marca un periodo que llega hasta hoy, así que pide presente perfecto."],
    ],
    quiz: [
      {
        prompt: "I ___ my wallet two days ago.",
        options: ["lost", "have lost", "have lose", "lose"],
        answer: 0,
        explanation: "*Ago* marca un momento terminado, así que se usa pasado simple.",
      },
      {
        prompt: "She ___ three emails so far today.",
        options: ["sent", "sends", "has sent", "was sending"],
        answer: 2,
        explanation: "*So far today* es un periodo que sigue abierto, así que pide presente perfecto.",
      },
      {
        prompt: "We ___ to Mérida in 2018.",
        options: ["have gone", "went", "have been", "go"],
        answer: 1,
        explanation: "*In 2018* es un momento terminado, así que va en pasado simple.",
      },
      {
        prompt: "How long ___ you known Carlos?",
        options: ["did", "do", "have", "are"],
        answer: 2,
        explanation: "*Known* es participio y la pregunta abarca hasta hoy, así que se usa *have*.",
      },
      {
        prompt: "¿Qué oración es correcta?",
        options: [
          "I've seen that movie last night.",
          "I've saw that movie last night.",
          "I have see that movie last night.",
          "I saw that movie last night.",
        ],
        answer: 3,
        explanation: "*Last night* ya terminó, así que se usa pasado simple: *I saw*.",
      },
    ],
  },
  {
    slug: "first-conditional",
    level: "B1",
    title: "El primer condicional",
    english: "First conditional",
    summary:
      "Sirve para hablar de situaciones posibles en el futuro y de sus consecuencias probables.",
    sections: [
      {
        heading: "¿Cuándo se usa?",
        body: "El primer condicional habla de algo **real y posible** en el futuro: si pasa una cosa, probablemente pasará otra.\n- *If it rains, we'll stay home.*\n- *If you study, you'll pass the exam.*\n\nTambién sirve para advertencias, promesas y amenazas:\n- *If you touch that, you'll get burned.*\n- *If you help me, I'll buy you lunch.*\n\nLa situación es realista: quien habla cree que de verdad puede pasar.",
      },
      {
        heading: "Cómo se forma",
        body: "**If + presente simple**, **will + verbo base**.\n\n*If I have time, I'll call you.*\n\nEl orden se puede invertir; cuando *if* va en medio, no lleva coma: *I'll call you if I have time.*\n\nEn la parte del resultado también puedes usar *can*, *may*, *might* o un imperativo:\n- *If you finish early, you can go home.*\n- *If you see Laura, tell her to call me.*\n\nLa negación funciona igual que siempre: *If you don't hurry, you won't catch the bus.*",
      },
      {
        heading: "Sin will después de if, when y as soon as",
        body: "Después de *if* nunca va *will*, aunque hables del futuro: *If it rains...*, no *If it will rain...*\n\nLo mismo pasa con **when**, **as soon as**, **before**, **after** y **until**. En español aquí usamos subjuntivo («cuando llegues», «en cuanto termine»); en inglés se usa **presente simple**:\n- *I'll call you when I arrive.* (no *when I will arrive*)\n- *As soon as she finishes, we'll leave.*\n- *Wait here until I come back.*\n\nFíjate en la diferencia entre **if** y **when**: *if* expresa algo posible; *when*, algo que seguro va a pasar.",
      },
      {
        heading: "Unless: a menos que",
        body: "**Unless** significa «a menos que» y equivale a *if... not*. Por eso va con verbo afirmativo:\n- *You'll miss the bus unless you hurry.*\n- *You'll miss the bus if you don't hurry.*\n\nLas dos oraciones dicen lo mismo. El error típico es añadir otra negación: *unless you don't hurry* no tiene sentido, porque *unless* ya incluye el «no».\n\nTambién puede ir al principio: *Unless it stops raining, we won't go out.*",
      },
    ],
    tables: [
      {
        caption: "Estructura",
        columns: ["Condición", "Resultado"],
        rows: [
          ["If it rains,", "we'll stay home."],
          ["If you don't hurry,", "you'll miss the bus."],
          ["Unless you hurry,", "you'll miss the bus."],
          ["As soon as I get home,", "I'll text you."],
          ["When she calls,", "I'll tell her."],
        ],
      },
      {
        caption: "Conectores con presente simple para hablar del futuro",
        columns: ["Conector", "Significado", "Ejemplo"],
        rows: [
          ["if", "si", "If I see him, I'll tell him."],
          ["unless", "a menos que", "I won't go unless you come."],
          ["when", "cuando", "When I finish, I'll call you."],
          ["as soon as", "en cuanto, tan pronto como", "As soon as he arrives, we'll eat."],
          ["until", "hasta que", "I'll wait until you come back."],
          ["before / after", "antes de que / después de que", "Call me before you leave."],
        ],
      },
    ],
    examples: [
      ["If you study every day, you'll improve quickly.", "Si estudias todos los días, vas a mejorar rápido."],
      ["If it's sunny tomorrow, we'll go to the beach.", "Si mañana hace sol, vamos a ir a la playa."],
      ["I won't go to the party unless you come with me.", "No voy a ir a la fiesta a menos que vengas conmigo."],
      ["I'll call you as soon as I land.", "Te marco en cuanto aterrice."],
      ["When you get to the hotel, send me a message.", "Cuando llegues al hotel, mándame un mensaje."],
      ["If she doesn't hurry, she'll miss the train.", "Si no se apura, va a perder el tren."],
      ["What will you do if they don't accept your offer?", "¿Qué vas a hacer si no aceptan tu oferta?"],
    ],
    mistakes: [
      ["If it will rain, we'll stay home.", "If it rains, we'll stay home.", "Después de *if* se usa presente simple, no *will*."],
      ["I'll call you when I will arrive.", "I'll call you when I arrive.", "Después de *when* con sentido de futuro se usa presente simple."],
      ["Unless you don't study, you'll fail.", "Unless you study, you'll fail.", "*Unless* ya significa *if not*, así que el verbo va en afirmativo."],
    ],
    quiz: [
      {
        prompt: "If you ___ late again, the teacher will be angry.",
        options: ["will arrive", "arrive", "arrived", "would arrive"],
        answer: 1,
        explanation: "En el primer condicional, después de *if* va el presente simple.",
      },
      {
        prompt: "I ___ you as soon as I get the results.",
        options: ["call", "called", "would call", "will call"],
        answer: 3,
        explanation: "El resultado futuro lleva *will*, y después de *as soon as* va presente simple.",
      },
      {
        prompt: "You'll fail the exam ___ you study harder.",
        options: ["if", "when", "unless", "as soon as"],
        answer: 2,
        explanation: "*Unless* significa «a menos que», que es lo único que da sentido a la oración.",
      },
      {
        prompt: "When she ___ home, she'll make dinner.",
        options: ["gets", "will get", "got", "get"],
        answer: 0,
        explanation: "Después de *when* con sentido de futuro se usa presente simple, y con *she* lleva *-s*.",
      },
      {
        prompt: "¿Cómo se dice «Si no te apuras, vamos a llegar tarde»?",
        options: [
          "If you won't hurry, we'll be late.",
          "Unless you don't hurry, we'll be late.",
          "If you don't hurry, we were late.",
          "If you don't hurry, we'll be late.",
        ],
        answer: 3,
        explanation: "La condición va en presente simple y el resultado con *will*.",
      },
    ],
  },
  {
    slug: "second-conditional",
    level: "B1",
    title: "El segundo condicional",
    english: "Second conditional",
    summary:
      "Sirve para imaginar situaciones irreales o poco probables en el presente o el futuro, y lo que pasaría.",
    sections: [
      {
        heading: "¿Cuándo se usa?",
        body: "El segundo condicional habla de situaciones **imaginarias**: cosas que no son verdad ahora o que ves muy poco probables.\n- *If I had more money, I would travel more.* (pero no tengo más dinero)\n- *If I won the lottery, I'd buy a house.* (es muy difícil que pase)\n\nAunque el verbo de la condición va en pasado, **no habla del pasado**: habla del presente o de un futuro imaginado. También se usa mucho para pedir consejos o hacer preguntas hipotéticas: *What would you do if...?*",
      },
      {
        heading: "Cómo se forma",
        body: "**If + pasado simple**, **would + verbo base**.\n\n*If she lived closer, she would visit us more often.*\n\n*Would* se contrae como *'d*: *I'd*, *we'd*, *they'd*. Negativo: *wouldn't*. En el resultado también puedes usar *could* (podría) o *might* (quizá): *If I had a car, I could drive you.*\n\nEn español se usa el **imperfecto de subjuntivo** + **condicional**: «Si tuviera dinero, viajaría». El inglés usa el pasado simple normal: *If I had money...*, nunca *If I would have money*.",
      },
      {
        heading: "If I were you",
        body: "Con el verbo *be*, el inglés cuidado usa **were** para todas las personas: *If I were*, *If she were*, *If it were*.\n- *If I were rich, I'd stop working.*\n- *If he were here, he'd know what to do.*\n\nPara dar consejos existe una frase fija, **If I were you**, que equivale a «yo que tú» o «si yo fuera tú»:\n- *If I were you, I'd talk to her.*\n- *I wouldn't do that if I were you.*\n\nEs una de las formas más naturales de aconsejar en inglés.",
      },
      {
        heading: "¿Primer o segundo condicional?",
        body: "La diferencia está en qué tan **real** ves la situación:\n- *If I see Mario, I'll tell him.* Es posible que lo vea hoy.\n- *If I saw a ghost, I'd run.* No espero ver un fantasma.\n\nA veces las dos son correctas y cambia la actitud de quien habla:\n- *If I get the job, I'll move to Monterrey.* Hice la entrevista y tengo buenas posibilidades.\n- *If I got the job, I'd move to Monterrey.* Lo veo difícil.\n\nNo mezcles las estructuras: *If I had time, I will help you* es incorrecto.",
      },
    ],
    tables: [
      {
        caption: "Estructura",
        columns: ["Condición (if + pasado)", "Resultado (would + verbo)"],
        rows: [
          ["If I had more time,", "I would learn to play the guitar."],
          ["If she spoke English,", "she could get a better job."],
          ["If we lived near the beach,", "we'd swim every day."],
          ["If I were you,", "I wouldn't buy that phone."],
          ["If it didn't rain so much,", "we'd go out more."],
        ],
      },
      {
        caption: "Primer y segundo condicional",
        columns: ["Tipo", "Estructura", "Ejemplo"],
        rows: [
          ["Primer condicional (posible)", "if + present, will + verb", "If I have time, I'll help you."],
          ["Segundo condicional (imaginario)", "if + past, would + verb", "If I had time, I'd help you."],
        ],
      },
    ],
    examples: [
      ["If I had a car, I'd drive to work.", "Si tuviera carro, iría manejando al trabajo."],
      ["If I were you, I'd apologize.", "Yo que tú, pediría disculpas."],
      ["What would you do if you lost your job?", "¿Qué harías si perdieras tu trabajo?"],
      ["If she knew the answer, she would tell us.", "Si supiera la respuesta, nos la diría."],
      ["We could go out if it weren't so cold.", "Podríamos salir si no hiciera tanto frío."],
      ["If I won the lottery, I wouldn't work anymore.", "Si me ganara la lotería, ya no trabajaría."],
      ["If he were taller, he'd play basketball.", "Si fuera más alto, jugaría básquetbol."],
    ],
    mistakes: [
      ["If I would have money, I would travel.", "If I had money, I would travel.", "Después de *if* va el pasado simple, no *would*."],
      ["If I am you, I would call her.", "If I were you, I would call her.", "Para dar consejos la frase fija es *If I were you*."],
      ["If I had time, I will help you.", "If I had time, I would help you.", "Si la condición va en pasado, el resultado lleva *would*, no *will*."],
      ["If I knew, I would to tell you.", "If I knew, I would tell you.", "Después de *would* va el verbo base sin *to*."],
    ],
    quiz: [
      {
        prompt: "If I ___ more free time, I would learn French.",
        options: ["have", "had", "would have", "will have"],
        answer: 1,
        explanation: "En el segundo condicional, después de *if* va el pasado simple.",
      },
      {
        prompt: "If I were you, I ___ that job.",
        options: ["will take", "take", "would take", "took"],
        answer: 2,
        explanation: "El resultado del segundo condicional se forma con *would* + verbo base.",
      },
      {
        prompt: "If she ___ here, she would help us.",
        options: ["is", "would be", "will be", "were"],
        answer: 3,
        explanation: "En una condición imaginaria con *be* se usa *were*, incluso con *she*.",
      },
      {
        prompt: "¿Qué oración habla de una situación imaginaria?",
        options: [
          "If I lived in Japan, I'd eat sushi every day.",
          "If it rains, I'll stay home.",
          "When I get home, I'll call you.",
          "If you study, you'll pass.",
        ],
        answer: 0,
        explanation: "*If* + pasado y *would* indican algo que no es real ahora.",
      },
      {
        prompt: "¿Cómo se dice «Si supiera su número, le marcaría»?",
        options: [
          "If I know his number, I'd call him.",
          "If I would know his number, I'd call him.",
          "If I knew his number, I'd call him.",
          "If I knew his number, I'll call him.",
        ],
        answer: 2,
        explanation: "La condición va en pasado simple (*knew*) y el resultado con *would* (*'d*).",
      },
    ],
  },
  {
    slug: "passive-voice",
    level: "B1",
    title: "La voz pasiva",
    english: "Passive voice (present and past simple)",
    summary:
      "Sirve para centrarte en la acción o en quien la recibe, cuando no importa o no se sabe quién la hizo.",
    sections: [
      {
        heading: "¿Cuándo se usa?",
        body: "En la voz activa el sujeto hace la acción: *Someone stole my bike.* En la pasiva, el sujeto la recibe: *My bike was stolen.*\n\nSe usa cuando:\n- No sabemos quién lo hizo: *My phone was stolen.*\n- No importa o es obvio: *English is spoken here.*\n- Queremos destacar el objeto o el resultado: *This bridge was built in 1890.*\n\nEs muy común en noticias, instrucciones, textos técnicos y descripciones de procesos.",
      },
      {
        heading: "Cómo se forma",
        body: "**be + participio pasado**. El tiempo lo marca *be*:\n- Presente simple: **am / is / are** + participio. *Coffee is grown in Chiapas.*\n- Pasado simple: **was / were** + participio. *The letters were sent yesterday.*\n\nNegativo: *isn't made*, *weren't invited*. Pregunta: *Is it made...?*, *Was it built...?*\n\nPara decir quién hizo la acción usa **by**: *One Hundred Years of Solitude was written by Gabriel García Márquez.* Agrégalo solo si aporta información.",
      },
      {
        heading: "El «se» del español",
        body: "El español suele usar **se** donde el inglés usa la pasiva:\n- «Aquí se habla inglés» → *English is spoken here.*\n- «Se vendieron todos los boletos» → *All the tickets were sold.*\n- «Se construyó en 1950» → *It was built in 1950.*\n\nNo traduzcas el *se* palabra por palabra: *Here speaks English* no tiene sentido en inglés. Busca qué cosa recibe la acción, ponla como sujeto y usa *be* + participio. En la conversación también se usa un sujeto general: *They speak English here.*",
      },
      {
        heading: "Was born: nacer",
        body: "«Nacer» en inglés se expresa con la pasiva: **be born**. Por eso «nací» es **I was born**, nunca *I born* ni *I am born*.\n- *I was born in Guadalajara.*\n- *My daughter was born on March 3rd.*\n- *Where were you born?*\n\nUsa **in** con ciudades, países, meses y años (*in 1998*, *in Mexico*) y **on** con fechas completas o días (*on May 5th*). Para preguntar la fecha: *When were you born?*",
      },
    ],
    tables: [
      {
        caption: "Activa y pasiva",
        columns: ["Tiempo", "Activa", "Pasiva"],
        rows: [
          ["Presente simple", "They make these shoes in León.", "These shoes are made in León."],
          ["Presente simple", "People speak Spanish in Chile.", "Spanish is spoken in Chile."],
          ["Pasado simple", "Someone stole my wallet.", "My wallet was stolen."],
          ["Pasado simple", "Frida Kahlo painted this picture.", "This picture was painted by Frida Kahlo."],
        ],
      },
      {
        caption: "Formas de be en la pasiva",
        columns: ["Sujeto", "Presente simple", "Pasado simple"],
        rows: [
          ["I", "I am invited.", "I was invited."],
          ["he / she / it", "It is made.", "It was made."],
          ["you / we / they", "They are sold.", "They were sold."],
        ],
      },
    ],
    examples: [
      ["Tequila is made from agave.", "El tequila se hace con agave."],
      ["This house was built in 1950.", "Esta casa se construyó en 1950."],
      ["My car was stolen last night.", "Anoche me robaron el carro."],
      ["Were you invited to the wedding?", "¿Te invitaron a la boda?"],
      ["The emails are checked every morning.", "Los correos se revisan todas las mañanas."],
      ["The Mona Lisa was painted by Leonardo da Vinci.", "La Mona Lisa fue pintada por Leonardo da Vinci."],
      ["I was born in Puebla in 1998.", "Nací en Puebla en 1998."],
      ["The package wasn't delivered on time.", "El paquete no se entregó a tiempo."],
    ],
    mistakes: [
      ["I born in 1995.", "I was born in 1995.", "«Nacer» en inglés es pasiva: *be born*."],
      ["The windows was cleaned yesterday.", "The windows were cleaned yesterday.", "Con un sujeto plural se usa *were*."],
      ["Here speaks Spanish.", "Spanish is spoken here.", "El «se» impersonal se traduce con la pasiva, no palabra por palabra."],
      ["The cake was make by my mom.", "The cake was made by my mom.", "En la pasiva se usa el participio, no el verbo base."],
    ],
    quiz: [
      {
        prompt: "This cheese ___ in Oaxaca.",
        options: ["makes", "is made", "is make", "made"],
        answer: 1,
        explanation: "La pasiva en presente se forma con *is* + participio (*made*).",
      },
      {
        prompt: "Where ___ you born?",
        options: ["are", "did", "were", "was"],
        answer: 2,
        explanation: "*Be born* va en pasado, y con *you* se usa *were*.",
      },
      {
        prompt: "The windows ___ broken during the storm.",
        options: ["were", "was", "are", "did"],
        answer: 0,
        explanation: "Es pasado y el sujeto es plural, así que se usa *were* + participio.",
      },
      {
        prompt: "The novel was written ___ a young Mexican author.",
        options: ["from", "of", "with", "by"],
        answer: 3,
        explanation: "En la pasiva, quien hace la acción se introduce con *by*.",
      },
      {
        prompt: "¿Cómo se dice «Se vendieron todos los boletos»?",
        options: [
          "All the tickets sold themselves.",
          "All the tickets were sold.",
          "It sold all the tickets.",
          "All the tickets was sold.",
        ],
        answer: 1,
        explanation: "El «se» se traduce con la pasiva: *were* + participio, porque *tickets* es plural.",
      },
    ],
  },
  {
    slug: "relative-clauses",
    level: "B1",
    title: "Las oraciones de relativo",
    english: "Defining relative clauses",
    summary:
      "Sirven para precisar de qué persona, cosa o lugar hablas, como el «que», el «donde» o el «cuyo» del español.",
    sections: [
      {
        heading: "¿Para qué sirven?",
        body: "Una oración de relativo especificativa identifica exactamente de quién o de qué hablas. Sin ella, la frase queda incompleta:\n- *The woman who lives next door is a doctor.* (¿qué mujer? la que vive al lado)\n- *I lost the book that you lent me.* (¿qué libro? el que me prestaste)\n\nEn español casi todo se resuelve con «que». En inglés eliges el pronombre según aquello a lo que se refiere: una persona, una cosa, un lugar o una posesión.",
      },
      {
        heading: "Qué pronombre usar",
        body: "- **who**: personas. *The man who called you is my uncle.*\n- **which**: cosas y animales. *The phone which I bought works well.*\n- **that**: personas o cosas; con cosas es más común que *which* en la conversación. *The car that he drives is old.*\n- **where**: lugares. *That's the restaurant where we met.*\n- **whose**: posesión, «cuyo» o «cuya». *I have a friend whose father is a pilot.*\n\n*Whose* es mucho más común en inglés que «cuyo» en español: «un amigo que su papá es piloto» se dice *a friend whose father is a pilot*.",
      },
      {
        heading: "Cuándo se puede omitir el pronombre",
        body: "Puedes quitar *who*, *which* o *that* cuando el pronombre es el **objeto** del verbo, es decir, cuando después viene otro sujeto:\n- *The movie (that) we saw was boring.* (*we* es el sujeto de *saw*)\n- *The girl (who) I met is from Lima.*\n\nNo se puede quitar cuando el pronombre es el **sujeto**, es decir, cuando después viene directamente el verbo:\n- *The man who lives here is friendly.* (no *The man lives here is friendly*)\n\nEn la conversación, la versión sin pronombre es muy frecuente.",
      },
      {
        heading: "Errores típicos de hispanohablantes",
        body: "- **No repitas el objeto**: en español a veces decimos «la casa que la compré». En inglés el pronombre relativo ya ocupa ese lugar: *the house that I bought*, no *the house that I bought it*.\n- **Who no es para cosas**: *the book who...* es incorrecto.\n- **Where no lleva preposición**: *the city where I live*, no *the city where I live in*. Si usas *that* o *which*, la preposición va al final: *the city that I live in*.",
      },
    ],
    tables: [
      {
        caption: "Pronombres relativos",
        columns: ["Pronombre", "Se usa para", "Ejemplo"],
        rows: [
          ["who", "personas", "The teacher who helped me is retired."],
          ["which", "cosas y animales", "The dog which bit me was huge."],
          ["that", "personas y cosas", "The song that you sang is beautiful."],
          ["where", "lugares", "This is the town where I grew up."],
          ["whose", "posesión (cuyo, cuya)", "She's the girl whose brother plays soccer."],
        ],
      },
      {
        caption: "¿Se puede omitir?",
        columns: ["Función del pronombre", "Ejemplo", "¿Se omite?"],
        rows: [
          ["Sujeto", "The bus that goes downtown is late.", "No"],
          ["Objeto", "The bus (that) I took was late.", "Sí"],
          ["Sujeto", "People who exercise sleep better.", "No"],
          ["Objeto", "The people (who) I work with are nice.", "Sí"],
        ],
      },
    ],
    examples: [
      ["The woman who works at the bakery is very kind.", "La señora que trabaja en la panadería es muy amable."],
      ["I can't find the keys that I left on the table.", "No encuentro las llaves que dejé en la mesa."],
      ["This is the café where I study every afternoon.", "Esta es la cafetería donde estudio todas las tardes."],
      ["I have a friend whose sister lives in Canada.", "Tengo un amigo cuya hermana vive en Canadá."],
      ["The movie we watched last night was amazing.", "La película que vimos anoche estuvo increíble."],
      ["Do you know anyone who speaks German?", "¿Conoces a alguien que hable alemán?"],
      ["The laptop which I bought last year is already slow.", "La laptop que compré el año pasado ya está lenta."],
    ],
    mistakes: [
      ["The book who I read was great.", "The book that I read was great.", "*Who* es solo para personas; para cosas usa *that* o *which*."],
      ["This is the house that I bought it.", "This is the house that I bought.", "El pronombre relativo ya ocupa el lugar del objeto, así que no se repite *it*."],
      ["The man lives next door is a teacher.", "The man who lives next door is a teacher.", "Cuando el pronombre es el sujeto del verbo, no se puede omitir."],
      ["I have a friend that his father is a pilot.", "I have a friend whose father is a pilot.", "Para expresar posesión se usa *whose*, no *that his*."],
    ],
    quiz: [
      {
        prompt: "The girl ___ sits next to me is from Colombia.",
        options: ["which", "who", "where", "whose"],
        answer: 1,
        explanation: "Se refiere a una persona y es el sujeto de *sits*, así que va *who*.",
      },
      {
        prompt: "That's the hospital ___ I was born.",
        options: ["which", "that", "where", "who"],
        answer: 2,
        explanation: "Para lugares se usa *where*, sin preposición al final.",
      },
      {
        prompt: "I met a man ___ car was stolen last week.",
        options: ["whose", "who", "that", "which"],
        answer: 0,
        explanation: "*Whose* expresa posesión: el carro es de ese hombre.",
      },
      {
        prompt: "¿En qué oración se puede omitir el pronombre relativo?",
        options: [
          "The man who called you is my boss.",
          "The dog that bit me ran away.",
          "The students who passed got a prize.",
          "The cake that you made was delicious.",
        ],
        answer: 3,
        explanation: "Ahí *that* es el objeto de *made* (le sigue el sujeto *you*), así que se puede quitar.",
      },
      {
        prompt: "The keys ___ are on the table are mine.",
        options: ["who", "where", "which", "whose"],
        answer: 2,
        explanation: "Para cosas se usa *which* (o *that*), nunca *who*.",
      },
    ],
  },
  {
    slug: "gerunds-and-infinitives",
    level: "B1",
    title: "Gerundio o infinitivo",
    english: "Gerunds and infinitives",
    summary:
      "Te ayuda a decidir si después de un verbo o una preposición va la forma -ing o to + infinitivo.",
    sections: [
      {
        heading: "Verbos seguidos de -ing",
        body: "Algunos verbos siempre van seguidos de la forma **-ing**. Hay que memorizarlos, porque en español después de un verbo usamos el infinitivo («disfruto cocinar»):\n- **enjoy**: *I enjoy cooking.*\n- **avoid**: *She avoids driving at night.*\n- **finish**: *Have you finished eating?*\n- **mind**: *Do you mind waiting?*\n- también: *suggest*, *keep*, *practice*, *miss*, *consider*, *can't stand*\n\n*I enjoy to cook* es uno de los errores más frecuentes entre hispanohablantes.",
      },
      {
        heading: "Verbos seguidos de to + infinitivo",
        body: "Otros verbos van con **to + verbo base**. Muchos expresan planes, deseos o decisiones hacia el futuro:\n- **want**: *I want to learn Italian.*\n- **decide**: *We decided to stay.*\n- **hope**: *I hope to see you soon.*\n- **plan**: *They're planning to move.*\n- también: *need*, *would like*, *promise*, *agree*, *refuse*, *learn*\n\nAlgunos verbos aceptan las dos formas casi sin cambio de significado: *like*, *love*, *hate*, *start*, *begin*. *I started working* = *I started to work*.",
      },
      {
        heading: "Después de una preposición, siempre -ing",
        body: "Cuando un verbo va después de una preposición (*in*, *at*, *of*, *about*, *for*, *without*, *before*, *after*), se usa **-ing**. En español aquí usamos el infinitivo, y por eso cuesta:\n- «Soy bueno para dibujar» → *I'm good at drawing.*\n- «Gracias por ayudarme» → *Thanks for helping me.*\n- «Se fue sin decir adiós» → *He left without saying goodbye.*\n- «Me interesa aprender» → *I'm interested in learning.*\n\nTambién se usa *-ing* cuando la acción es el sujeto: *Swimming is good for you.* («Nadar es bueno para ti»)",
      },
      {
        heading: "Stop, remember y try cambian de significado",
        body: "- **stop + -ing**: dejar de hacer algo. *I stopped smoking.* (ya no fumo)\n- **stop + to**: detenerse para hacer otra cosa. *I stopped to smoke.* (me paré a fumar)\n- **remember + -ing**: recordar algo que ya pasó. *I remember meeting her.*\n- **remember + to**: acordarse de hacer algo pendiente. *Remember to call your mom.*\n- **try + -ing**: probar algo para ver si funciona. *Try restarting your phone.*\n- **try + to**: esforzarse por lograr algo difícil. *I tried to open the window, but it was stuck.*",
      },
    ],
    tables: [
      {
        caption: "¿-ing o to?",
        columns: ["Verbo + -ing", "Verbo + to + infinitivo"],
        rows: [
          ["enjoy reading", "want to read"],
          ["avoid eating sugar", "decide to eat less"],
          ["finish working", "hope to work"],
          ["mind waiting", "plan to travel"],
          ["keep trying", "need to rest"],
          ["suggest going out", "promise to call"],
        ],
      },
      {
        caption: "Verbos que cambian de significado",
        columns: ["Forma", "Ejemplo", "Significado"],
        rows: [
          ["stop + -ing", "I stopped drinking coffee.", "Dejé de tomar café."],
          ["stop + to", "I stopped to drink a coffee.", "Me paré a tomar un café."],
          ["remember + -ing", "I remember locking the door.", "Recuerdo haber cerrado la puerta."],
          ["remember + to", "Remember to lock the door.", "Acuérdate de cerrar la puerta."],
          ["try + -ing", "Try drinking more water.", "Prueba tomar más agua, a ver si funciona."],
          ["try + to", "I tried to sleep, but I couldn't.", "Intenté dormir, pero no pude."],
        ],
      },
    ],
    examples: [
      ["I really enjoy walking in the park on Sundays.", "Disfruto mucho caminar en el parque los domingos."],
      ["We decided to take the bus.", "Decidimos tomar el camión."],
      ["Would you mind closing the door?", "¿Te molestaría cerrar la puerta?"],
      ["She's thinking about changing jobs.", "Está pensando en cambiar de trabajo."],
      ["I hope to finish this course by December.", "Espero terminar este curso para diciembre."],
      ["He stopped eating meat two years ago.", "Dejó de comer carne hace dos años."],
      ["Don't forget to buy tortillas.", "Que no se te olvide comprar tortillas."],
      ["Thanks for inviting me.", "Gracias por invitarme."],
    ],
    mistakes: [
      ["I enjoy to dance.", "I enjoy dancing.", "*Enjoy* siempre va seguido de la forma *-ing*."],
      ["I want learning English.", "I want to learn English.", "*Want* va con *to* + verbo base."],
      ["I'm interested in learn Japanese.", "I'm interested in learning Japanese.", "Después de una preposición el verbo va en *-ing*."],
      ["I stopped to smoke last year.", "I stopped smoking last year.", "Para decir que dejaste un hábito se usa *stop* + *-ing*."],
    ],
    quiz: [
      {
        prompt: "I avoid ___ coffee at night.",
        options: ["to drink", "drinking", "drink", "drank"],
        answer: 1,
        explanation: "*Avoid* siempre va seguido de la forma *-ing*.",
      },
      {
        prompt: "They're planning ___ to Cancún in December.",
        options: ["going", "go", "to go", "went"],
        answer: 2,
        explanation: "*Plan* va seguido de *to* + verbo base.",
      },
      {
        prompt: "She left without ___ goodbye.",
        options: ["saying", "to say", "say", "said"],
        answer: 0,
        explanation: "Después de una preposición como *without* se usa *-ing*.",
      },
      {
        prompt: "Remember ___ the lights before you leave.",
        options: ["turning off", "turn off", "turned off", "to turn off"],
        answer: 3,
        explanation: "Para acordarse de algo pendiente se usa *remember* + *to*.",
      },
      {
        prompt: "¿Qué significa «I stopped smoking»?",
        options: ["Me paré a fumar.", "Dejé de fumar.", "Intenté fumar.", "Recordé fumar."],
        answer: 1,
        explanation: "*Stop* + *-ing* significa dejar de hacer algo.",
      },
    ],
  },
  {
    slug: "used-to",
    level: "B1",
    title: "Hábitos del pasado con used to",
    english: "Used to",
    summary:
      "Sirve para hablar de hábitos y situaciones del pasado que ya cambiaron, como «solía» o «antes jugaba».",
    sections: [
      {
        heading: "¿Cuándo se usa?",
        body: "**Used to** habla de cosas que eran verdad en el pasado y **ya no lo son**:\n- **Hábitos**: *I used to play soccer every weekend.* (ya no juego)\n- **Estados o situaciones**: *She used to live in Tijuana.* / *There used to be a cinema here.*\n\nEquivale a «solía» o al copretérito: «Jugaba futbol todos los fines de semana». El inglés no tiene un tiempo propio para el copretérito, así que *used to* es una de las formas más naturales de expresarlo.",
      },
      {
        heading: "Cómo se forma",
        body: "**used to + verbo base**, igual para todas las personas:\n- Afirmativo: *I used to work at night.*\n- Negativo: *I didn't use to work at night.*\n- Pregunta: *Did you use to work at night?*\n\nCon *did* o *didn't* se escribe **use to**, sin *-d*, porque *did* ya marca el pasado (igual que *did you go*, no *did you went*).\n\n*Used to* solo existe en pasado. Para hábitos actuales usa el presente con *usually*: *I usually wake up at seven*, no *I use to wake up at seven*.",
      },
      {
        heading: "Used to o pasado simple",
        body: "Usa **pasado simple** para algo que pasó una vez o en un momento concreto:\n- *I went to Acapulco in 2015.*\n\nUsa **used to** para algo repetido o duradero que ya terminó:\n- *We used to go to Acapulco every summer.*\n\nCon un número de veces o una duración exacta se prefiere el pasado simple: *I lived in Lima for three years*, mejor que *I used to live in Lima for three years*. El pasado simple también puede expresar hábitos (*We went every summer*), pero *used to* deja más claro que eso ya cambió.",
      },
      {
        heading: "Used to y be used to",
        body: "No confundas *used to* con **be used to + -ing**, que significa «estar acostumbrado a»:\n- *I used to get up early.* = «Antes me levantaba temprano» (ya no).\n- *I'm used to getting up early.* = «Estoy acostumbrado a levantarme temprano».\n\n*Be used to* lleva el verbo *be* y después un sustantivo o la forma *-ing*: *She's used to the cold.* / *We aren't used to driving on the left.*\n\nPara el proceso de acostumbrarse se usa **get used to**: *You'll get used to it.*",
      },
    ],
    tables: [
      {
        caption: "Formas de used to",
        columns: ["Tipo", "Estructura", "Ejemplo"],
        rows: [
          ["Afirmativa", "used to + verb", "I used to bite my nails."],
          ["Negativa", "didn't use to + verb", "He didn't use to like vegetables."],
          ["Pregunta", "Did ... use to + verb?", "Did you use to wear glasses?"],
        ],
      },
      {
        caption: "Used to, be used to y get used to",
        columns: ["Expresión", "Significado", "Ejemplo"],
        rows: [
          ["used to + verb", "solía, antes (ya no)", "I used to live alone."],
          ["be used to + -ing", "estar acostumbrado a", "I'm used to living alone."],
          ["get used to + -ing", "acostumbrarse a", "I'm getting used to living alone."],
        ],
      },
    ],
    examples: [
      ["I used to watch cartoons every morning before school.", "Veía caricaturas todas las mañanas antes de la escuela."],
      ["My grandfather used to tell us scary stories.", "Mi abuelo nos contaba historias de miedo."],
      ["She didn't use to like spicy food, but now she loves it.", "Antes no le gustaba la comida picante, pero ahora le encanta."],
      ["Did you use to have long hair?", "¿Antes tenías el cabello largo?"],
      ["There used to be a market on this corner.", "Antes había un mercado en esta esquina."],
      ["We used to live in Monterrey when I was a kid.", "Vivíamos en Monterrey cuando yo era niño."],
      ["I'm used to working at night, so I'm not tired.", "Estoy acostumbrado a trabajar de noche, así que no estoy cansado."],
    ],
    mistakes: [
      ["I use to go to the gym every day.", "I usually go to the gym every day.", "*Used to* solo habla del pasado; para hábitos actuales usa *usually*."],
      ["I didn't used to drink coffee.", "I didn't use to drink coffee.", "Después de *didn't* se escribe *use to*, sin *-d*."],
      ["I used to living in Mexico City.", "I used to live in Mexico City.", "*Used to* va seguido del verbo base, no de *-ing*."],
      ["I'm used to get up early.", "I'm used to getting up early.", "*Be used to* («estar acostumbrado») va seguido de *-ing*."],
    ],
    quiz: [
      {
        prompt: "When I was a child, I ___ climb trees.",
        options: ["use to", "used to", "was used to", "am used to"],
        answer: 1,
        explanation: "Para un hábito del pasado que ya no existe se usa *used to* + verbo base.",
      },
      {
        prompt: "Did you ___ play an instrument?",
        options: ["used to", "using to", "use to", "uses to"],
        answer: 2,
        explanation: "Con *did* se escribe *use to*, porque *did* ya marca el pasado.",
      },
      {
        prompt: "I'm used to ___ in a big city.",
        options: ["live", "lived", "to live", "living"],
        answer: 3,
        explanation: "*Be used to* significa «estar acostumbrado a» y va seguido de *-ing*.",
      },
      {
        prompt: "¿Qué significa «I used to work at a bank»?",
        options: [
          "Trabajaba en un banco, pero ya no.",
          "Estoy acostumbrado a trabajar en un banco.",
          "Suelo trabajar en un banco.",
          "Me estoy acostumbrando a trabajar en un banco.",
        ],
        answer: 0,
        explanation: "*Used to* describe algo del pasado que ya cambió.",
      },
      {
        prompt: "There ___ a park here, but now it's a parking lot.",
        options: ["use to be", "used to be", "is used to be", "used to being"],
        answer: 1,
        explanation: "*There used to be* indica que antes había algo que ya no existe.",
      },
    ],
  },
];
