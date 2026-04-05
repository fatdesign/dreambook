const WORKER_URL = "https://dreambook.f-klavun.workers.dev/dreams";
const PASSWORD = "coco";

const extraDreams = [
  {
    title: "Windows Neuinstallation",
    date: "2019-04-27",
    content: "Ich bin am Pc, und bin damit beschäftigt, Windows neu zu installieren. Restart.",
    sleepHours: 8,
    vividness: 5,
    isLucid: false,
    mood: "Neutral"
  },
  {
    title: "Honig beim Türken",
    date: "2020-06-22",
    content: "Esad, ein Ex-Kollege von Foto Sulzer und ich stehen in einem Supermarkt. Er hat in der Hand ca. ein Kilo Honig in einer blauen Plastiktüte verpackt. Ich erzähle ihm über den Honig, den ich beim Türken (Kavak) gekauft habe, und dass es ein Honiggemisch aus EU-Ländern ist.",
    sleepHours: 7,
    vividness: 6,
    isLucid: false,
    mood: "Neutral"
  },
  {
    title: "Krankenhaus & McDonald's",
    date: "2020-06-16",
    content: "In dieser Nacht war ich an drei verschiedenen Orten: ein Krankenhaus, das Fast Food Restaurant McDonald's (wo ich gearbeitet habe) und ein dritter Ort. Ich bin wie ein Krankenhausmitarbeiter gekleidet, als ob ich in eine OP gehe. Eine vertraute Frau ist bei mir. Die Gänge scheinen leer, aber hin und wieder laufen mir Menschen in Uniformen entgegen.",
    sleepHours: 6,
    vividness: 8,
    isLucid: false,
    mood: "Curious"
  },
  {
    title: "YouTube Link Traum",
    date: "2020-06-11",
    content: "Klarheit: +++++ Erinnerung: +++++. Youtube link: https://www.youtube.com/watch?v=uC_zKBSNQOQ",
    sleepHours: 8,
    vividness: 10,
    isLucid: false,
    mood: "Happy"
  },
  {
    title: "Flugzeug-Cockpit & Lift",
    date: "2020-07-11",
    content: "Ein Gebäude eingestiegen, das von innen wie ein Flugzeugcockpit aussah. Wir sind geflogen. Der Pilot war ein Anfänger. Eine Bremsung findet statt. Der Apparat im Cockpit hatte die Form eines Gesichts mit Schaltern für Nase, Ohren, Wangen. Danach befand ich mich an einem Parkplatz einer Wohnsiedlung.",
    sleepHours: 8,
    vividness: 9,
    isLucid: true,
    mood: "Happy"
  },
  {
    title: "Das Elchmammutpferd",
    date: "2020-07-11",
    content: "In einem riesigen Stall beobachte ich aus der Entfernung, wie ein 'Elchmammutpferd' seinen Darm auf ein Mädchen mit Kopftuch entleert. Ich kichere und lache.",
    sleepHours: 8,
    vividness: 7,
    isLucid: false,
    mood: "Funny"
  },
  {
    title: "Toilettendrang & Schmutzige WC",
    date: "2020-07-13",
    content: "Traum handelt von einem Toilettendrang. Es war eine schmutzige öffentliche Toilette. Ich wollte nicht auf den Boden steigen, bin aber auf Zehenspitzen (mit Schuhen) auf weniger schmutzige Stellen gestiegen. Bin dann aufgewacht und musste wirklich zur Toilette.",
    sleepHours: 8,
    vividness: 9,
    isLucid: false,
    mood: "Neutral"
  }
];

async function importExtraDreams() {
  console.log(`Starte Import von ${extraDreams.length} zusätzlichen Träumen...`);

  for (const dream of extraDreams) {
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

  console.log("Import der zusätzlichen Träume abgeschlossen!");
}

importExtraDreams();
