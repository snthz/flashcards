import type { GrammarTopic } from "../types";

export const A1: GrammarTopic[] = [
  {
    slug: "to-be-present",
    level: "A1",
    title: "El verbo to be en presente",
    english: "The verb to be (present)",
    summary: "Sirve para decir quién eres, cómo estás, de dónde eres, cuántos años tienes y dónde está algo.",
    sections: [
      {
        heading: "¿Para qué sirve?",
        body: "En inglés *to be* equivale a **ser** y **estar** a la vez, así que con un solo verbo dices quién eres y cómo estás. Se usa para:\n- Nombre, nacionalidad y origen: *I'm Sofía. I'm from Mexico.*\n- Profesión: *She's a teacher.*\n- Estados de ánimo: *We're tired.*\n- Ubicación: *The keys are in the car.*\n- Descripciones: *The house is big.*\n- Edad: *I'm 25.*",
      },
      {
        heading: "Formas y contracciones",
        body: "El verbo cambia según el sujeto: *I am*, *you are*, *he / she / it is*, *we are*, *they are*. Al hablar y en mensajes casi siempre se contrae: *I'm*, *you're*, *he's*, *she's*, *it's*, *we're*, *they're*.\n\nPara el negativo se agrega **not** después del verbo:\n- *I'm not* (la forma *I amn't* no existe).\n- *He isn't* o *he's not*.\n- *They aren't* o *they're not*.\n\nLas dos contracciones del negativo son correctas y significan lo mismo.",
      },
      {
        heading: "Preguntas y respuestas cortas",
        body: "En español una pregunta puede tener el mismo orden que la afirmación: «¿Estás cansado?». En inglés hay que **invertir** el verbo y el sujeto:\n- *You are tired.* → *Are you tired?*\n- *She is at work.* → *Is she at work?*\n\nLas respuestas cortas repiten el verbo: *Yes, I am.* / *No, I'm not.* En las afirmativas no se contrae: se dice *Yes, she is*, nunca *Yes, she's*. Con palabras interrogativas se usa el mismo orden: *Where are you from?*",
      },
      {
        heading: "El sujeto nunca se omite",
        body: "En español dices «Es doctora» o «Hace frío» sin sujeto. En inglés el sujeto es obligatorio: *She's a doctor*, *It's cold*. Para el clima, la hora y las distancias se usa *it*: *It's 3 o'clock*, *It's far*.\n\nAlgunas ideas que en español van con «tener» en inglés van con *to be*:\n- Edad: *I'm 20* o *I'm 20 years old*.\n- Hambre, sed, frío, calor y miedo: *I'm hungry*, *I'm thirsty*, *I'm cold*, *I'm hot*, *I'm scared*.",
      },
    ],
    tables: [
      {
        caption: "Presente de to be",
        columns: ["Sujeto", "Afirmativo", "Negativo", "Pregunta"],
        rows: [
          ["I", "I am / I'm", "I'm not", "Am I?"],
          ["you", "you are / you're", "you aren't", "Are you?"],
          ["he / she / it", "she is / she's", "she isn't", "Is she?"],
          ["we", "we are / we're", "we aren't", "Are we?"],
          ["they", "they are / they're", "they aren't", "Are they?"],
        ],
      },
      {
        caption: "Respuestas cortas",
        columns: ["Pregunta", "Sí", "No"],
        rows: [
          ["Are you busy?", "Yes, I am.", "No, I'm not."],
          ["Is he Mexican?", "Yes, he is.", "No, he isn't."],
          ["Are they at home?", "Yes, they are.", "No, they aren't."],
        ],
      },
    ],
    examples: [
      ["I'm from Guadalajara.", "Soy de Guadalajara."],
      ["My sister is a nurse.", "Mi hermana es enfermera."],
      ["We're tired today.", "Hoy estamos cansados."],
      ["Is the bank open?", "¿Está abierto el banco?"],
      ["They aren't at home right now.", "No están en casa en este momento."],
      ["How old are you? — I'm 19.", "¿Cuántos años tienes? — Tengo 19."],
      ["It's very hot in Monterrey.", "Hace mucho calor en Monterrey."],
      ["Are you hungry? — Yes, I am.", "¿Tienes hambre? — Sí."],
    ],
    mistakes: [
      ["I have 20 years.", "I'm 20 years old.", "La edad se dice con *to be*, no con *have*."],
      ["Is very cold today.", "It's very cold today.", "El sujeto es obligatorio; para el clima se usa *it*."],
      ["You are ready?", "Are you ready?", "En las preguntas *are* va antes del sujeto; la entonación sola no basta."],
      ["I have hungry.", "I'm hungry.", "Hambre, sed, frío y calor se expresan con *to be* + adjetivo."],
    ],
    quiz: [
      {
        prompt: "My parents ___ from Puebla.",
        options: ["is", "are", "am"],
        answer: 1,
        explanation: "*My parents* es plural (equivale a *they*), así que va con *are*.",
      },
      {
        prompt: "___ you a student?",
        options: ["Do", "Is", "Are", "Am"],
        answer: 2,
        explanation: "Para preguntar con *you* se pone *are* antes del sujeto.",
      },
      {
        prompt: "¿Cómo se dice «Tengo 30 años»?",
        options: ["I'm 30 years old.", "I have 30 years.", "I have 30 years old."],
        answer: 0,
        explanation: "En inglés la edad se expresa con *to be*: *I'm 30 years old*.",
      },
      {
        prompt: "Is your brother at home? — No, he ___.",
        options: ["not", "doesn't", "aren't", "isn't"],
        answer: 3,
        explanation: "La respuesta corta repite el verbo de la pregunta en negativo: *he isn't*.",
      },
      {
        prompt: "___ very hot today.",
        options: ["Is", "It's", "It has", "There is"],
        answer: 1,
        explanation: "Para hablar del clima se necesita el sujeto *it*: *It's very hot*.",
      },
    ],
  },
  {
    slug: "present-simple",
    level: "A1",
    title: "El presente simple",
    english: "Present simple",
    summary: "Sirve para hablar de rutinas, hábitos, gustos y cosas que son verdad en general.",
    sections: [
      {
        heading: "¿Cuándo se usa?",
        body: "El presente simple describe lo que pasa de forma habitual o lo que siempre es cierto:\n- Rutinas y hábitos: *I get up at 7.*\n- Hechos generales: *Water boils at 100 degrees.*\n- Gustos y opiniones: *She likes coffee.*\n- Horarios fijos: *The bus leaves at 8.*\n\nSuele ir con adverbios de frecuencia como *always*, *usually*, *sometimes* y *never*, que se colocan antes del verbo principal: *I usually walk to work.*",
      },
      {
        heading: "La -s de he, she, it",
        body: "Con *he*, *she*, *it* o un sustantivo singular, el verbo lleva **-s** en afirmativo. Es el error más común de los hispanohablantes, así que conviene revisarlo siempre.\n- La mayoría agrega -s: *work* → *works*, *play* → *plays*.\n- Terminados en -s, -sh, -ch, -x u -o agregan **-es**: *watch* → *watches*, *go* → *goes*.\n- Consonante + y cambia a **-ies**: *study* → *studies*.\n- Irregular: *have* → *has*.\n\nEn *watches*, *fixes* o *washes* la terminación se oye como una sílaba extra, parecida a «iz».",
      },
      {
        heading: "Negativos y preguntas con do / does",
        body: "En negativos y preguntas se usa el auxiliar *do*, o *does* con *he*, *she* e *it*. El verbo principal vuelve a su forma base, sin -s:\n- *She works.* → *She doesn't work.* → *Does she work?*\n- *They live here.* → *They don't live here.* → *Do they live here?*\n\nLa -s pasa al auxiliar, por eso nunca se dice *She doesn't works* ni *Does she works?* Las respuestas cortas usan el auxiliar: *Yes, she does.* / *No, she doesn't.*",
      },
      {
        heading: "Diferencias con el español",
        body: "En español el presente también sirve para lo que pasa ahora: «¿Qué haces?» puede significar «¿qué estás haciendo?». En inglés el presente simple no se usa para acciones en curso; para eso está el presente continuo: *What are you doing?*\n\nAdemás, en inglés no basta con poner *not* delante del verbo: «No trabajo» es *I don't work*, no *I not work*. Y las preguntas necesitan *do* o *does* al principio: «¿Hablas inglés?» es *Do you speak English?*",
      },
    ],
    tables: [
      {
        caption: "Presente simple del verbo work",
        columns: ["Sujeto", "Afirmativo", "Negativo", "Pregunta"],
        rows: [
          ["I", "I work", "I don't work", "Do I work?"],
          ["you", "you work", "you don't work", "Do you work?"],
          ["he / she / it", "she works", "she doesn't work", "Does she work?"],
          ["we", "we work", "we don't work", "Do we work?"],
          ["they", "they work", "they don't work", "Do they work?"],
        ],
      },
      {
        caption: "Ortografía con he / she / it",
        columns: ["Regla", "Verbo", "Con he / she / it"],
        rows: [
          ["La mayoría: + s", "read", "reads"],
          ["-s, -sh, -ch, -x, -o: + es", "watch", "watches"],
          ["-s, -sh, -ch, -x, -o: + es", "go", "goes"],
          ["Consonante + y: -ies", "study", "studies"],
          ["Vocal + y: + s", "play", "plays"],
          ["Irregular", "have", "has"],
        ],
      },
    ],
    examples: [
      ["I drink coffee every morning.", "Tomo café todas las mañanas."],
      ["My brother works in a bank.", "Mi hermano trabaja en un banco."],
      ["She doesn't eat meat.", "Ella no come carne."],
      ["Do you speak English?", "¿Hablas inglés?"],
      ["Where does your sister live?", "¿Dónde vive tu hermana?"],
      ["We usually go to the movies on Fridays.", "Normalmente vamos al cine los viernes."],
      ["The store opens at nine.", "La tienda abre a las nueve."],
      ["He never watches TV at night.", "Él nunca ve la tele en la noche."],
    ],
    mistakes: [
      ["He work in an office.", "He works in an office.", "Con *he*, *she* e *it* el verbo lleva -s en afirmativo."],
      ["She doesn't likes pizza.", "She doesn't like pizza.", "Después de *doesn't* el verbo va en forma base, sin -s."],
      ["You like tacos?", "Do you like tacos?", "Una pregunta normal empieza con el auxiliar *do* o *does*."],
      ["I not understand.", "I don't understand.", "Para negar un verbo se usa *don't* o *doesn't*, no solo *not*."],
    ],
    quiz: [
      {
        prompt: "My mom ___ in a hospital.",
        options: ["work", "working", "works"],
        answer: 2,
        explanation: "Con un sujeto singular como *my mom* (*she*) el verbo lleva -s.",
      },
      {
        prompt: "___ your brother play soccer?",
        options: ["Does", "Do", "Is", "Has"],
        answer: 0,
        explanation: "Con *your brother* (*he*) la pregunta se forma con *does* + verbo base.",
      },
      {
        prompt: "They ___ live near here.",
        options: ["doesn't", "don't", "not", "aren't"],
        answer: 1,
        explanation: "Con *they* el negativo se forma con *don't* + verbo base.",
      },
      {
        prompt: "She ___ English every evening.",
        options: ["studys", "studyes", "studis", "studies"],
        answer: 3,
        explanation: "Cuando el verbo termina en consonante + y, la y cambia a -ies.",
      },
      {
        prompt: "Does Carlos ___ Japanese?",
        options: ["speaks", "speak", "speaking"],
        answer: 1,
        explanation: "Después de *does* el verbo va en forma base, sin -s.",
      },
    ],
  },
  {
    slug: "present-continuous",
    level: "A1",
    title: "El presente continuo",
    english: "Present continuous",
    summary: "Sirve para hablar de lo que está pasando ahora mismo o de situaciones temporales.",
    sections: [
      {
        heading: "¿Cuándo se usa?",
        body: "El presente continuo describe acciones en progreso:\n- Lo que pasa en este momento: *I'm cooking.*\n- Situaciones temporales, aunque no sea justo ahora: *She's living with her aunt this month.*\n- Planes ya acordados para el futuro cercano: *We're meeting Ana tomorrow.*\n\nSuele ir con *now*, *right now*, *at the moment*, *today* o *this week*. Compara: *I work in an office* (en general) y *I'm working from home this week* (temporal).",
      },
      {
        heading: "Cómo se forma",
        body: "Se forma con el verbo *to be* (*am*, *is*, *are*) más el verbo con **-ing**:\n- Afirmativo: *He is reading.*\n- Negativo: *He isn't reading.*\n- Pregunta: *Is he reading?*\n- Respuestas cortas: *Yes, he is.* / *No, he isn't.*\n\nEl verbo *be* nunca se omite. En español «estoy trabajando» lleva «estar», y en inglés pasa lo mismo: *I'm working*, no *I working*.",
      },
      {
        heading: "Ortografía de -ing",
        body: "1. La mayoría solo agrega -ing: *eat* → *eating*, *study* → *studying*.\n2. Si termina en -e muda, se quita la e: *make* → *making*, *write* → *writing*.\n3. Si termina en consonante + vocal + consonante y esa sílaba es la acentuada, se duplica la última consonante: *run* → *running*, *sit* → *sitting*, *begin* → *beginning*.\n4. La terminación -ie cambia a -y: *lie* → *lying*, *die* → *dying*.\n\nNunca se duplican la w, la x ni la y: *snow* → *snowing*, *fix* → *fixing*, *play* → *playing*.",
      },
      {
        heading: "Verbos que casi no van con -ing",
        body: "Algunos verbos describen estados, no acciones, y normalmente van en presente simple aunque hablemos de este momento: *like*, *love*, *hate*, *want*, *need*, *know*, *understand*, *believe*, *remember*, *belong*.\n\nPor eso se dice *I know the answer*, no *I'm knowing the answer*, y *I want a coffee*, no *I'm wanting a coffee*.\n\nEn cambio, para acciones que pasan ahora, el inglés sí necesita el continuo: «¿Qué haces?», dicho en este momento, es *What are you doing?*",
      },
    ],
    tables: [
      {
        caption: "Presente continuo del verbo eat",
        columns: ["Sujeto", "Afirmativo", "Negativo", "Pregunta"],
        rows: [
          ["I", "I'm eating", "I'm not eating", "Am I eating?"],
          ["you / we / they", "you're eating", "you aren't eating", "Are you eating?"],
          ["he / she / it", "she's eating", "she isn't eating", "Is she eating?"],
        ],
      },
      {
        caption: "Ortografía de -ing",
        columns: ["Regla", "Verbo", "Con -ing"],
        rows: [
          ["La mayoría: + ing", "read", "reading"],
          ["Termina en -e: se quita", "dance", "dancing"],
          ["Consonante + vocal + consonante: se duplica", "swim", "swimming"],
          ["-ie → -y", "lie", "lying"],
          ["Termina en -y: + ing", "study", "studying"],
        ],
      },
    ],
    examples: [
      ["I'm watching a movie right now.", "Estoy viendo una película ahora mismo."],
      ["She's talking on the phone.", "Está hablando por teléfono."],
      ["We aren't working today.", "Hoy no estamos trabajando."],
      ["What are you doing?", "¿Qué estás haciendo?"],
      ["It's raining again.", "Está lloviendo otra vez."],
      ["My parents are staying at a hotel this week.", "Mis papás se están quedando en un hotel esta semana."],
      ["Is he sleeping? — Yes, he is.", "¿Está durmiendo? — Sí."],
      ["I'm learning English for my new job.", "Estoy aprendiendo inglés para mi nuevo trabajo."],
    ],
    mistakes: [
      ["I working now.", "I'm working now.", "El presente continuo necesita *am*, *is* o *are* antes del verbo con -ing."],
      ["I'm knowing the answer.", "I know the answer.", "*Know* es un verbo de estado y normalmente no va en -ing."],
      ["She is writeing an email.", "She is writing an email.", "Si el verbo termina en -e muda, se quita antes de agregar -ing."],
      ["Look! It rains.", "Look! It's raining.", "Para algo que está pasando en este momento se usa el presente continuo."],
    ],
    quiz: [
      {
        prompt: "Be quiet, the baby ___.",
        options: ["sleeps", "is sleeping", "sleep", "sleeping"],
        answer: 1,
        explanation: "Es algo que pasa ahora mismo, así que se usa *is* + verbo con -ing.",
      },
      {
        prompt: "They ___ playing video games right now.",
        options: ["are", "is", "do"],
        answer: 0,
        explanation: "Con *they* el verbo *to be* es *are*.",
      },
      {
        prompt: "¿Cuál está bien escrito?",
        options: ["runing", "runnig", "running", "runeing"],
        answer: 2,
        explanation: "*Run* termina en consonante + vocal + consonante, así que se duplica la n.",
      },
      {
        prompt: "I ___ your sister. She's in my class.",
        options: ["am knowing", "knowing", "am know", "know"],
        answer: 3,
        explanation: "*Know* es un verbo de estado y normalmente va en presente simple.",
      },
      {
        prompt: "___ she studying for the exam?",
        options: ["Does", "Is", "Are", "Do"],
        answer: 1,
        explanation: "La pregunta del presente continuo empieza con *is* cuando el sujeto es *she*.",
      },
    ],
  },
  {
    slug: "articles",
    level: "A1",
    title: "Los artículos: a, an, the",
    english: "Articles: a / an / the",
    summary: "Sirve para saber cuándo usar artículo indefinido, definido o ninguno antes de un sustantivo.",
    sections: [
      {
        heading: "A y an: uno cualquiera",
        body: "*A* y *an* equivalen a «un» o «una» y solo van con sustantivos contables en singular. Se usan cuando mencionas algo por primera vez o no importa cuál: *I have a dog.* La elección depende del **sonido**, no de la letra:\n- *an* antes de sonido vocal: *an apple*, *an egg*, *an hour* (la h no suena).\n- *a* antes de sonido consonante: *a book*, *a university*, *a European city* (empiezan con sonido «yu»).\n\nNo se usa con plurales ni con incontables: en vez de *a water*, di *some water* o *a glass of water*.",
      },
      {
        heading: "The: algo concreto",
        body: "*The* equivale a «el», «la», «los» y «las», y es igual en singular, plural, masculino y femenino. Se usa cuando los dos saben de qué se habla:\n- Algo que ya se mencionó: *I bought a shirt. The shirt is blue.*\n- Algo único: *the sun*, *the moon*, *the internet*.\n- Algo específico: *the book on the table*.\n\nPronunciación: antes de consonante suena corto, casi «de» (*the car*); antes de sonido vocal suena «di» (*the end*, *the hour*). La *th* se parece a la «d» suave de «nada».",
      },
      {
        heading: "Profesiones con a / an",
        body: "En español dices «Soy maestra» sin artículo, pero en inglés una profesión en singular siempre lleva *a* o *an*: *I'm a teacher*, *She's an engineer*, *He's a doctor*.\n\nLo mismo pasa cuando dices qué es algo o alguien: *It's a good idea*, *She's a nice person*, *It's an old car*.\n\nEn plural no hay artículo: *They're doctors*, *We're students*.",
      },
      {
        heading: "Sin artículo: hablar en general",
        body: "Cuando hablas de algo en general con plurales o incontables, el inglés **no** usa artículo, aunque el español sí:\n- «Me gustan los perros» → *I like dogs*.\n- «El café es caro» → *Coffee is expensive*.\n- «La vida es bella» → *Life is beautiful*.\n\nTampoco se usa con idiomas, materias, comidas del día y algunos lugares de rutina: *I speak Spanish*, *I study math*, *We have breakfast at 8*, *go to work*, *go to bed*, *at home*.",
      },
    ],
    tables: [
      {
        caption: "¿A o an?",
        columns: ["Sonido inicial", "Artículo", "Ejemplos"],
        rows: [
          ["Consonante", "a", "a car, a house, a big apple"],
          ["Vocal", "an", "an orange, an idea, an old car"],
          ["H que no suena", "an", "an hour, an honest man"],
          ["Sonido «yu» o «wa»", "a", "a university, a uniform, a one-way street"],
        ],
      },
      {
        caption: "Español frente a inglés",
        columns: ["Español", "Inglés"],
        rows: [
          ["Soy enfermero.", "I'm a nurse."],
          ["Me gustan los gatos.", "I like cats."],
          ["El sol está muy fuerte.", "The sun is very strong."],
          ["Hablo español.", "I speak Spanish."],
          ["Tengo una idea.", "I have an idea."],
        ],
      },
    ],
    examples: [
      ["She's an architect.", "Es arquitecta."],
      ["I need an umbrella.", "Necesito un paraguas."],
      ["I have a cat and a dog. The cat is black.", "Tengo un gato y un perro. El gato es negro."],
      ["Can you close the door, please?", "¿Puedes cerrar la puerta, por favor?"],
      ["I don't like vegetables.", "No me gustan las verduras."],
      ["We waited for an hour.", "Esperamos una hora."],
      ["He studies at a university in Monterrey.", "Estudia en una universidad en Monterrey."],
      ["Money doesn't buy happiness.", "El dinero no compra la felicidad."],
    ],
    mistakes: [
      ["She is doctor.", "She is a doctor.", "Las profesiones en singular llevan *a* o *an* en inglés."],
      ["I like the dogs.", "I like dogs.", "Para hablar de los perros en general no se usa *the*."],
      ["I'll be back in a hour.", "I'll be back in an hour.", "La h de *hour* no suena, así que la palabra empieza con sonido vocal."],
      ["She studies at an university.", "She studies at a university.", "*University* empieza con sonido «yu», que cuenta como consonante."],
    ],
    quiz: [
      {
        prompt: "My father is ___ engineer.",
        options: ["a", "(sin artículo)", "an"],
        answer: 2,
        explanation: "Las profesiones llevan artículo y *engineer* empieza con sonido vocal, así que va *an*.",
      },
      {
        prompt: "I'll call you in ___ hour.",
        options: ["an", "a", "(sin artículo)"],
        answer: 0,
        explanation: "En *hour* la h no suena, así que empieza con sonido vocal y lleva *an*.",
      },
      {
        prompt: "¿Cómo se dice «Los perros son buenos amigos», hablando de los perros en general?",
        options: ["The dogs are good friends.", "Dogs are good friends.", "A dogs are good friends."],
        answer: 1,
        explanation: "Para hablar en general, los plurales van sin artículo.",
      },
      {
        prompt: "¿Cuál es correcta?",
        options: ["an university", "a hour", "an uniform", "a university"],
        answer: 3,
        explanation: "*University* empieza con sonido «yu», que es consonante, así que lleva *a*.",
      },
      {
        prompt: "Look at ___ moon! It's beautiful.",
        options: ["a", "the", "an"],
        answer: 1,
        explanation: "La luna es única, así que lleva *the*.",
      },
    ],
  },
  {
    slug: "there-is-there-are",
    level: "A1",
    title: "There is y there are",
    english: "There is / there are",
    summary: "Sirve para decir que algo existe o está en un lugar; es el equivalente de «hay».",
    sections: [
      {
        heading: "¿Cuándo se usa?",
        body: "Usa *there is* y *there are* para decir que algo existe o se encuentra en un lugar, igual que «hay» en español: *There's a pharmacy on the corner.*\n\nEs muy común presentar algo nuevo con *there is* y luego describirlo con *it* o *they*: *There's a new café downtown. It's really good.* También sirve para describir lugares: *There are two bedrooms and a small kitchen.*",
      },
      {
        heading: "Singular o plural",
        body: "«Hay» nunca cambia, pero en inglés el verbo concuerda con lo que viene después:\n- Singular o incontable: *there is* (*there's*): *There's a problem.* *There's some milk.*\n- Plural: *there are*: *There are two problems.*\n\nCon una lista, el verbo concuerda con el primer elemento: *There's a sofa and two chairs.* La contracción *there's* es muy común; en plural se escribe completo: *there are*.",
      },
      {
        heading: "Negativos, preguntas y some / any",
        body: "- Afirmativo con plurales e incontables: *some*: *There are some eggs.*\n- Negativo: *any*: *There aren't any eggs.* / *There isn't any milk.*\n- Pregunta: *any*: *Are there any eggs?* / *Is there any milk?*\n\nTambién puedes negar con *no*, sin *not*: *There are no eggs.*\n\nRespuestas cortas: *Yes, there is.* / *No, there aren't.* Para preguntar cantidad: *How many students are there?*",
      },
      {
        heading: "Cuidado con «hay» y «tener»",
        body: "Para decir «hay» nunca uses *it has* ni *have*: *It has a park near my house* es un error típico; lo correcto es *There's a park near my house*.\n\nCuando en español usas «tener» para describir un lugar, en inglés puedes usar *have* con un sujeto claro o *there is*: «El cuarto tiene dos ventanas» → *The room has two windows* o *There are two windows in the room*.\n\nEl sujeto *there* es obligatorio: no se dice *Is a bank here?*, sino *Is there a bank here?*",
      },
    ],
    tables: [
      {
        caption: "Formas de there is / there are",
        columns: ["Forma", "Singular o incontable", "Plural"],
        rows: [
          ["Afirmativo", "There's a bank.", "There are some banks."],
          ["Negativo", "There isn't a bank.", "There aren't any banks."],
          ["Pregunta", "Is there a bank?", "Are there any banks?"],
          ["Respuesta corta", "Yes, there is. / No, there isn't.", "Yes, there are. / No, there aren't."],
        ],
      },
    ],
    examples: [
      ["There's a pharmacy next to the bank.", "Hay una farmacia al lado del banco."],
      ["There are three bedrooms in my apartment.", "Hay tres recámaras en mi departamento."],
      ["There isn't any coffee left.", "Ya no queda café."],
      ["Are there any good restaurants near here?", "¿Hay buenos restaurantes por aquí?"],
      ["Is there a bus to the airport? — Yes, there is.", "¿Hay un camión al aeropuerto? — Sí."],
      ["There aren't many people today.", "Hoy no hay mucha gente."],
      ["How many students are there in your class?", "¿Cuántos alumnos hay en tu clase?"],
      ["There's a new student. She's from Peru.", "Hay una alumna nueva. Es de Perú."],
    ],
    mistakes: [
      ["There is three chairs.", "There are three chairs.", "Con plurales se usa *there are*, aunque en español siempre sea «hay»."],
      ["It has a park near my house.", "There's a park near my house.", "Para decir «hay» se usa *there is*, no *it has*."],
      ["Is a bathroom here?", "Is there a bathroom here?", "La pregunta necesita *there* después de *is*."],
      ["There aren't some apples.", "There aren't any apples.", "En negativos se usa *any*, no *some*."],
    ],
    quiz: [
      {
        prompt: "___ two supermarkets in my neighborhood.",
        options: ["There is", "There are", "They are", "It has"],
        answer: 1,
        explanation: "*Two supermarkets* es plural, así que se usa *there are*.",
      },
      {
        prompt: "There isn't ___ milk in the fridge.",
        options: ["any", "some", "a"],
        answer: 0,
        explanation: "En oraciones negativas se usa *any*, y *milk* es incontable, así que no lleva *a*.",
      },
      {
        prompt: "___ a gym in this hotel?",
        options: ["Has", "Is it", "Are there", "Is there"],
        answer: 3,
        explanation: "*A gym* es singular, así que la pregunta es *Is there...?*",
      },
      {
        prompt: "Are there any questions? — No, there ___.",
        options: ["isn't", "don't", "aren't", "not"],
        answer: 2,
        explanation: "La pregunta usa *are*, así que la respuesta corta negativa es *there aren't*.",
      },
      {
        prompt: "¿Cómo se dice «Hay mucho tráfico hoy»?",
        options: ["There are a lot of traffic today.", "There's a lot of traffic today.", "It has a lot of traffic today."],
        answer: 1,
        explanation: "*Traffic* es incontable, así que va con *there's*, nunca con *it has*.",
      },
    ],
  },
  {
    slug: "possessives",
    level: "A1",
    title: "Los posesivos y el 's",
    english: "Possessive adjectives and possessive 's",
    summary: "Sirve para decir de quién es algo: mi casa, su coche, el carro de Ana.",
    sections: [
      {
        heading: "Los adjetivos posesivos",
        body: "Cada pronombre tiene su posesivo: *I* → *my*, *you* → *your*, *he* → *his*, *she* → *her*, *it* → *its*, *we* → *our*, *they* → *their*.\n\nVan siempre antes del sustantivo y **no cambian** en plural. En español dices «mi amigo» y «mis amigos», pero en inglés es *my friend* y *my friends*.\n\nCon partes del cuerpo y ropa el inglés usa el posesivo, no el artículo: «Me lavo las manos» es *I wash my hands*, y «Ponte la chamarra» es *Put on your jacket*.",
      },
      {
        heading: "His o her: depende del dueño",
        body: "En español «su» sirve para él, ella, usted y ellos, y no dice de quién es. En inglés eliges según el **dueño**, no según la cosa:\n- *Carlos and his sister*: la hermana es de Carlos.\n- *Ana and her brother*: el hermano es de Ana.\n- *The students and their teacher*.\n\nPregúntate «¿de quién es?». Si es de un hombre, *his*; de una mujer, *her*; de varias personas, *their*; de una cosa o un animal, *its*.",
      },
      {
        heading: "El 's para personas",
        body: "Para decir «el carro de Ana», el inglés pone primero al dueño y agrega **'s**: *Ana's car*. El orden es al revés que en español.\n- Dueño singular: *my mom's house*, *the teacher's desk*.\n- Plural terminado en -s, solo apóstrofo: *my parents' house*, *the teachers' room*.\n- Plural irregular, 's completo: *the children's toys*, *women's clothes*.\n\nCon cosas se suele usar *of*: *the end of the movie*, *the name of the street*.",
      },
      {
        heading: "Its o it's",
        body: "Estas dos formas suenan igual pero no significan lo mismo:\n- *its*, sin apóstrofo, es posesivo: *The cat is eating its food.*\n- *it's* es la contracción de *it is* o *it has*: *It's late.*\n\nSi puedes cambiarlo por *it is*, lleva apóstrofo. Lo mismo pasa con *your* / *you're* y *their* / *they're*: *you're* significa *you are* y *they're* significa *they are*.",
      },
    ],
    tables: [
      {
        caption: "Adjetivos posesivos",
        columns: ["Pronombre", "Posesivo", "Ejemplo"],
        rows: [
          ["I", "my", "my phone"],
          ["you", "your", "your keys"],
          ["he", "his", "his car"],
          ["she", "her", "her bag"],
          ["it", "its", "its name"],
          ["we", "our", "our house"],
          ["they", "their", "their kids"],
        ],
      },
      {
        caption: "El posesivo 's",
        columns: ["Dueño", "Forma", "Ejemplo"],
        rows: [
          ["Singular", "+ 's", "my sister's room"],
          ["Plural terminado en -s", "+ '", "my parents' car"],
          ["Plural irregular", "+ 's", "the children's books"],
          ["Dos dueños juntos", "'s al final", "Ana and Luis's wedding"],
        ],
      },
    ],
    examples: [
      ["This is my brother and his wife.", "Este es mi hermano y su esposa."],
      ["Where are your keys?", "¿Dónde están tus llaves?"],
      ["Maria's dad is a mechanic.", "El papá de María es mecánico."],
      ["Our neighbors are very nice.", "Nuestros vecinos son muy amables."],
      ["My grandparents' house is in Oaxaca.", "La casa de mis abuelos está en Oaxaca."],
      ["The cat doesn't like its new bed.", "Al gato no le gusta su cama nueva."],
      ["Ana is talking to her mom.", "Ana está hablando con su mamá."],
      ["It's my friend's birthday today.", "Hoy es el cumpleaños de mi amigo."],
    ],
    mistakes: [
      ["Ana is with his brother.", "Ana is with her brother.", "El posesivo depende del dueño: Ana es mujer, así que es *her*."],
      ["The car of my father is red.", "My father's car is red.", "Con personas se usa *'s* y el dueño va primero."],
      ["The dog is eating it's food.", "The dog is eating its food.", "*Its* es posesivo; *it's* significa *it is*."],
      ["I wash the hands before eating.", "I wash my hands before eating.", "Con partes del cuerpo el inglés usa el posesivo, no *the*."],
    ],
    quiz: [
      {
        prompt: "Laura lives with ___ parents.",
        options: ["his", "their", "her", "its"],
        answer: 2,
        explanation: "Los padres son de Laura, que es mujer, así que se usa *her*.",
      },
      {
        prompt: "¿Cómo se dice «la casa de mis padres»?",
        options: ["my parents's house", "my parents' house", "the house of my parents's"],
        answer: 1,
        explanation: "Si el dueño es un plural terminado en -s, solo se agrega el apóstrofo: *parents'*.",
      },
      {
        prompt: "The restaurant is famous for ___ tacos.",
        options: ["its", "it's", "his"],
        answer: 0,
        explanation: "El dueño es una cosa, así que se usa *its*, sin apóstrofo.",
      },
      {
        prompt: "We love ___ new apartment.",
        options: ["us", "ours", "we", "our"],
        answer: 3,
        explanation: "Antes de un sustantivo, el posesivo de *we* es *our*.",
      },
      {
        prompt: "Mr. and Mrs. López are here with ___ kids.",
        options: ["his", "their", "they're", "her"],
        answer: 1,
        explanation: "Los hijos son de dos personas, así que se usa *their*; *they're* significa *they are*.",
      },
    ],
  },
  {
    slug: "can-ability",
    level: "A1",
    title: "Can y can't: habilidad y permiso",
    english: "Can / can't (ability and permission)",
    summary: "Sirve para decir lo que sabes o puedes hacer y para pedir o dar permiso.",
    sections: [
      {
        heading: "¿Para qué sirve?",
        body: "*Can* equivale a «poder» y también a «saber» cuando hablamos de habilidades:\n- Habilidad: *I can swim* («sé nadar»), *She can speak three languages.*\n- Posibilidad: *You can take the metro.*\n- Permiso: *Can I open the window?*\n- Prohibición: *You can't park here.*\n- Pedir algo: *Can you help me?*\n\nEn español «sé nadar» usa «saber», pero en inglés no se dice *I know swim*: se usa *can*.",
      },
      {
        heading: "Cómo se forma",
        body: "*Can* es igual para todas las personas: no lleva -s con *he*, *she* o *it* y nunca va seguido de *to*. Después de *can* el verbo va en forma base:\n- Afirmativo: *He can drive.*\n- Negativo: *can't* o *cannot* (en una sola palabra): *I can't dance.*\n- Pregunta: *can* va antes del sujeto: *Can you cook?*\n- Respuestas cortas: *Yes, I can.* / *No, I can't.*\n\nCon *can* no se usa *do*: *Do you can...?* es incorrecto.",
      },
      {
        heading: "Pronunciación de can y can't",
        body: "En una oración afirmativa, *can* casi no se oye: la vocal se reduce y suena como «kn». *I can swim* se oye parecido a «ai kn suím».\n\nEn cambio, *can't* se pronuncia completo y con fuerza, aunque la *t* final a veces apenas suena. Por eso la diferencia se nota más en el acento que en la *t*: en *I can go* la fuerza va en *go*; en *I can't go*, en *can't*.\n\nEn las respuestas cortas *can* sí suena completo: *Yes, I can.*",
      },
      {
        heading: "Pedir y dar permiso",
        body: "Para pedir permiso de forma informal se usa *Can I...?*: *Can I use your phone?* Si quieres sonar más cortés, puedes usar *Could I...?* o *May I...?*\n\nPara responder:\n- *Yes, you can.* / *Sure.*\n- *Sorry, you can't.*\n\nCon *can't* también se expresan reglas y prohibiciones: *You can't smoke here*, *You can't use your phone in class*.",
      },
    ],
    tables: [
      {
        caption: "Formas de can",
        columns: ["Sujeto", "Afirmativo", "Negativo", "Pregunta"],
        rows: [
          ["I", "I can swim", "I can't swim", "Can I swim?"],
          ["you", "you can swim", "you can't swim", "Can you swim?"],
          ["he / she / it", "she can swim", "she can't swim", "Can she swim?"],
          ["we / they", "they can swim", "they can't swim", "Can they swim?"],
        ],
      },
      {
        caption: "Usos de can",
        columns: ["Uso", "Ejemplo"],
        rows: [
          ["Habilidad", "I can cook Mexican food."],
          ["Permiso", "Can I sit here?"],
          ["Prohibición", "You can't use your phone in class."],
          ["Petición", "Can you open the door, please?"],
          ["Posibilidad", "You can pay by card."],
        ],
      },
    ],
    examples: [
      ["I can speak English and Spanish.", "Sé hablar inglés y español."],
      ["My little brother can't swim yet.", "Mi hermano menor todavía no sabe nadar."],
      ["Can you help me with my homework?", "¿Me puedes ayudar con mi tarea?"],
      ["Can I pay by card? — Yes, you can.", "¿Puedo pagar con tarjeta? — Sí."],
      ["You can't park here.", "No te puedes estacionar aquí."],
      ["She can play the piano really well.", "Ella toca el piano muy bien."],
      ["I can't hear you. The music is too loud.", "No te oigo. La música está muy fuerte."],
      ["Can your dog do any tricks?", "¿Tu perro sabe hacer trucos?"],
    ],
    mistakes: [
      ["I can to drive.", "I can drive.", "Después de *can* el verbo va sin *to*."],
      ["She cans cook.", "She can cook.", "*Can* nunca lleva -s, ni siquiera con *he*, *she* o *it*."],
      ["Do you can come tomorrow?", "Can you come tomorrow?", "Con *can* no se usa *do*: *can* va antes del sujeto."],
      ["I know swim.", "I can swim.", "Para decir que sabes hacer algo se usa *can* + verbo."],
    ],
    quiz: [
      {
        prompt: "My sister ___ speak French.",
        options: ["can", "cans", "can to", "is can"],
        answer: 0,
        explanation: "*Can* es igual para todos los sujetos y va seguido del verbo sin *to*.",
      },
      {
        prompt: "___ you ride a bike? — Yes, I can.",
        options: ["Do", "Are", "Can", "Does"],
        answer: 2,
        explanation: "La respuesta *Yes, I can* indica que la pregunta se hace con *can*.",
      },
      {
        prompt: "I'm sorry, I ___ come to your party on Saturday.",
        options: ["don't can", "can't", "not can", "can't to"],
        answer: 1,
        explanation: "El negativo de *can* es *can't*, sin *do* y sin *to*.",
      },
      {
        prompt: "¿Cuál es la forma correcta de pedir permiso para usar el baño?",
        options: ["Do I can use your bathroom?", "Can I to use your bathroom?", "I can use your bathroom?", "Can I use your bathroom?"],
        answer: 3,
        explanation: "La pregunta empieza con *can* y el verbo va en forma base, sin *to*.",
      },
      {
        prompt: "Can he play the guitar? — No, he ___.",
        options: ["doesn't", "isn't", "can't"],
        answer: 2,
        explanation: "La respuesta corta repite el verbo de la pregunta: *No, he can't*.",
      },
    ],
  },
  {
    slug: "prepositions-of-time",
    level: "A1",
    title: "In, on y at para hablar del tiempo",
    english: "Prepositions of time: in / on / at",
    summary: "Sirve para decir cuándo pasa algo: a qué hora, qué día, en qué mes o en qué año.",
    sections: [
      {
        heading: "At: momentos precisos",
        body: "Usa *at* con puntos exactos en el tiempo:\n- Horas: *at 7 o'clock*, *at 6:30*.\n- Momentos concretos del día: *at noon*, *at midnight*, *at night*, *at lunchtime*.\n- Fiestas como periodo, sin la palabra *day*: *at Christmas*, *at Easter*.\n- Expresiones fijas: *at the moment*, *at the same time*.\n\nPara preguntar la hora de algo: *What time does the class start? — At nine.*",
      },
      {
        heading: "On: días y fechas",
        body: "Usa *on* con días concretos:\n- Días de la semana: *on Monday*, *on Fridays* (todos los viernes).\n- Fechas: *on May 5th*, *on March 21st*.\n- Días especiales: *on my birthday*, *on Christmas Day*.\n- Un día con su parte del día: *on Sunday morning*, *on Friday night*.\n\nEn español dices «el lunes» con artículo; en inglés es *on Monday*, sin *the*.",
      },
      {
        heading: "In: periodos más largos",
        body: "Usa *in* con periodos de tiempo:\n- Meses: *in July*.\n- Años: *in 2010*.\n- Estaciones: *in summer* o *in the summer*.\n- Décadas y siglos: *in the 90s*, *in the 21st century*.\n- Partes del día: *in the morning*, *in the afternoon*, *in the evening*.\n\nOjo: se dice *in the morning*, pero *at night*. Y si nombras el día, cambia a *on*: *on Monday morning*.",
      },
      {
        heading: "Sin preposición y el fin de semana",
        body: "No se usa preposición antes de *this*, *next*, *last* y *every*, ni con *today*, *tomorrow* o *yesterday*: *See you next Friday*, *I work every day*, *We're leaving tomorrow*.\n\nPara el fin de semana, el inglés británico dice *at the weekend* y el estadounidense *on the weekend*; las dos formas son correctas.\n\nEn español «en» sirve para casi todo, así que fíjate en la palabra que sigue para elegir entre *in*, *on* y *at*.",
      },
    ],
    tables: [
      {
        caption: "Resumen de in, on y at",
        columns: ["Preposición", "Se usa con", "Ejemplos"],
        rows: [
          ["at", "horas y momentos precisos", "at 8:00, at noon, at night"],
          ["on", "días y fechas", "on Tuesday, on June 3rd, on my birthday"],
          ["in", "meses, años, estaciones y partes del día", "in April, in 2025, in winter, in the morning"],
          ["(sin preposición)", "this, next, last, every, today, tomorrow", "next week, every Sunday, tomorrow"],
        ],
      },
      {
        caption: "Partes del día",
        columns: ["Español", "Inglés"],
        rows: [
          ["en la mañana", "in the morning"],
          ["en la tarde", "in the afternoon"],
          ["en la noche (temprano)", "in the evening"],
          ["en la noche (en general)", "at night"],
          ["el lunes en la mañana", "on Monday morning"],
          ["el fin de semana", "at the weekend (UK) / on the weekend (US)"],
        ],
      },
    ],
    examples: [
      ["The class starts at nine.", "La clase empieza a las nueve."],
      ["I was born in 1998.", "Nací en 1998."],
      ["We play soccer on Saturdays.", "Jugamos futbol los sábados."],
      ["My birthday is in October.", "Mi cumpleaños es en octubre."],
      ["I usually read at night.", "Normalmente leo en la noche."],
      ["The store is closed on Sunday afternoons.", "La tienda está cerrada los domingos en la tarde."],
      ["What do you do on the weekend?", "¿Qué haces el fin de semana?"],
      ["I have an English class next Monday.", "Tengo clase de inglés el próximo lunes."],
    ],
    mistakes: [
      ["See you in Monday.", "See you on Monday.", "Con los días de la semana se usa *on*."],
      ["I go to bed in the night.", "I go to bed at night.", "Se dice *in the morning*, pero *at night*."],
      ["The meeting is on next Friday.", "The meeting is next Friday.", "Con *next*, *last*, *this* y *every* no se usa preposición."],
      ["My birthday is on August.", "My birthday is in August.", "Con los meses se usa *in*; *on* es para días y fechas."],
    ],
    quiz: [
      {
        prompt: "The movie starts ___ 8:30.",
        options: ["in", "on", "at"],
        answer: 2,
        explanation: "Con horas exactas se usa *at*.",
      },
      {
        prompt: "My sister was born ___ 2004.",
        options: ["in", "on", "at"],
        answer: 0,
        explanation: "Con años se usa *in*.",
      },
      {
        prompt: "We have a test ___ Thursday.",
        options: ["at", "on", "in"],
        answer: 1,
        explanation: "Con los días de la semana se usa *on*.",
      },
      {
        prompt: "I can't sleep ___ night when it's hot.",
        options: ["in", "on", "for", "at"],
        answer: 3,
        explanation: "La expresión fija es *at night*.",
      },
      {
        prompt: "Elige la frase correcta.",
        options: ["See you on next week.", "See you in next week.", "See you next week.", "See you at next week."],
        answer: 2,
        explanation: "Antes de *next* no se usa preposición.",
      },
    ],
  },
];
