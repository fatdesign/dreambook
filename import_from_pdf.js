const WORKER_URL = "https://dreambook.f-klavun.workers.dev/dreams";
const PASSWORD = "coco"; // <--- HIER DEIN PASSWORT EINTRAGEN

const dreams = [
  {
    title: "Der Dieb und die Geldtasche",
    date: "2018-01-24",
    content: "Ich bin draußen, am gehsteig... Ein Fremder klaut meine Geldtasche... Ich entscheide mich ihn zu Faschiertem zu machen.",
    sleepHours: 6,
    vividness: 8,
    isLucid: false,
    mood: "Intense"
  },
  {
    title: "Coco und die Papageien",
    date: "2018-04-26",
    content: "In der Wohnung meiner Großeltern... Die Coco ist in ihrem Käfig... Siamesische Zwillinge Papageien... Coco jaigt die anderen.",
    sleepHours: 9,
    vividness: 7,
    isLucid: false,
    mood: "Curious"
  },
  {
    title: "Kaffeehaus mit Betten",
    date: "2019-01-01", // Anfang 2019
    content: "Ich befinde mich in einem Kaffeehaus. Innenraum ist riesengroß. Statt Tischen waren Betten drinnen. Man konnte sich Decken bestellen.",
    sleepHours: 8,
    vividness: 5,
    isLucid: false,
    mood: "Neutral"
  },
  {
    title: "Schwebender Flug zum HBF",
    date: "2019-01-02", // Anfang 2019
    content: "Ich befinde mich im Tunnel richtung HBF. Fange ich an zu schweben... Über die Dächer der Häuser fliegen. Bombastisches gefühl!",
    sleepHours: 8,
    vividness: 10,
    isLucid: true,
    mood: "Happy"
  },
  {
    title: "Cem Yilmaz in der Türkei",
    date: "2019-01-03", // Anfang 2019
    content: "Ich befinde mich gefühlt in der Türkei in einer Wohngegend. In der Wohnung war Cem Yilmaz und sein Sohn. Wir haben gesprochen. Er hat mich zur Verabschiedung umarmt.",
    sleepHours: 8,
    vividness: 9,
    isLucid: false,
    mood: "Happy"
  },
  {
    title: "Der Traurige alte Mann",
    date: "2019-04-07",
    content: "Ich war in einem Bus voller Kinder. Ein älterer Mann war sehr Traurig, weil er seine jüngere Tochter verloren hatte, sie war tot. Wollte unbedingt Mayonaise machen.",
    sleepHours: 9,
    vividness: 8,
    isLucid: false,
    mood: "Scared"
  },
  {
    title: "Wilde Tiere und Bienen",
    date: "2019-04-08",
    content: "Coco und ich in einer Wildnisartigen gegend. Coco auf einem Auge blind... See mit Schiff... VR Computer Spiel gespielt.",
    sleepHours: 8,
    vividness: 9,
    isLucid: false,
    mood: "Curious"
  },
  {
    title: "Schwimmbecken Shop & Stacheltier",
    date: "2019-04-12",
    content: "In einem Geschäft voll mit Wasser. Ein seltsames Tier (Kamäleon mit Stacheln). Jemand muss sich sein Augenlied verbrennen lassen.",
    sleepHours: 6,
    vividness: 8,
    isLucid: false,
    mood: "Intense"
  },
  {
    title: "Keller Treffen & Glas-WC",
    date: "2019-04-19",
    content: "Im Keller Treffen. Ich geh rauf WC, kacken, die wände sind aus glas. Vier junge frauen legen sich in ein bett.",
    sleepHours: 8,
    vividness: 7,
    isLucid: false,
    mood: "Curious"
  },
  {
    title: "Die metergroße Vase",
    date: "2019-04-20",
    content: "Mit Motorrad unterwegs. Metergroße Vase gekauft. Dorf mit Chinesen. Ritual am Strommast... Nebelartige Qualle.",
    sleepHours: 8,
    vividness: 9,
    isLucid: false,
    mood: "Happy"
  },
  {
    title: "Kriminale Bürger & U-Bahn Raub",
    date: "2020-05-23",
    content: "In einer U-Bahnstation. Ich bin bewaffnet und richte eine Waffe auf eine Frau. Jemand anderes richtet Waffe auf mich.",
    sleepHours: 7,
    vividness: 8,
    isLucid: false,
    mood: "Scared"
  },
  {
    title: "Burgfeier & Steile Treppen",
    date: "2020-06-25",
    content: "Viele Menschen kostümiert auf einer Burg. Steile Pflastersteintreppen... Erinnert mich an Haus von Oma und Opa.",
    sleepHours: 9,
    vividness: 6,
    isLucid: false,
    mood: "Curious"
  },
  {
    title: "Biene auf der Stirn & Berg-Gipfel",
    date: "2020-06-30",
    content: "Biene flog auf meine Stirn, fühlte sich unheimlich realistisch an. Mit Fahrrad auf einem Berg. Woo Woo Woo!",
    sleepHours: 8,
    vividness: 10,
    isLucid: true,
    mood: "Happy"
  },
  {
    title: "Action Paris & Parasite-Zug",
    date: "2020-07-01",
    content: "Plakette erneuern. Mann konnte Zähne rausnehmen (Holzzahnbürsten). Im Zug einen Mann aus dem Film 'Parasite' verfolgen.",
    sleepHours: 6,
    vividness: 9,
    isLucid: false,
    mood: "Intense"
  },
  {
    title: "Jessica Lopez & Polizeijagd",
    date: "2020-07-12",
    content: "Im Cabrio Audio A4. Polizei sucht mich. Jennifer Lopez ist dabei. Hubschrauber-Verfolgung im Tiefflug. Kennzeichen 'Jessica'.",
    sleepHours: 8,
    vividness: 10,
    isLucid: false,
    mood: "Intense"
  },
  {
    title: "Zweitausend-Euro Stift",
    date: "2020-07-13",
    content: "Nebelige Landstraße. Gelber Lamborghini fährt über Feld. Unfall mit Pferd. Reisebus mit Mitschülern. 2000€ teurer Stift.",
    sleepHours: 8,
    vividness: 9,
    isLucid: false,
    mood: "Neutral"
  }
];

async function importDreams() {
  if (!PASSWORD) {
    console.error("FEHLER: Bitte trage dein Passwort in Zeile 4 des Skripts ein.");
    return;
  }

  console.log(`Starte Import von ${dreams.length} Träumen...`);

  for (const dream of dreams) {
    try {
      const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": PASSWORD
        },
        body: JSON.stringify(dream)
      });

      if (response.ok) {
        console.log(`Erfolg: "${dream.title}" wurde importiert.`);
      } else {
        const err = await response.json();
        console.error(`Fehler bei "${dream.title}":`, err);
      }
    } catch (e) {
      console.error(`Netzwerkfehler bei "${dream.title}":`, e.message);
    }
  }

  console.log("Import abgeschlossen!");
}

importDreams();
