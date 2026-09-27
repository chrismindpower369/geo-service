# GEO-Pilot-Audit: Hotel VICTORIA Nürnberg

**Status:** `reviewed` — manuelle Prüfung offizieller öffentlicher Website-Seiten am **27.09.2026**. Dies ist kein automatisierter oder vollständiger GEO-Audit.

## Kurzbefund

Das Hotel veröffentlicht bereits Schema.org-**Microdata** mit `Hotel`, `PostalAddress`, `telephone`, `priceRange` und `AggregateRating`. Im tatsächlich gerenderten HTML der Startseite wurde kein `application/ld+json`-Script gefunden. Im vorhandenen Hotel-Microdata fehlten dort `amenityFeature` und `makesOffer`; Zimmerkategorien, Ausstattung, Tagungsangebote und Preise stehen hingegen auf eigenen öffentlichen Seiten. Der belegte technische Hebel ist deshalb eine zusätzliche, mit diesen Seiten konsistente JSON-LD-Repräsentation — **nicht** das pauschale Fehlen jeglicher strukturierter Daten.

Für ChatGPT und Perplexity liegen in den verfügbaren Prüfunterlagen keine verifizierbaren Antwortmitschnitte oder Zitat-URLs vor. Die Behauptung im Review-Brief, Hotel VICTORIA werde dort regelmäßig unter den Top-Empfehlungen genannt, ist daher **nicht verifiziert** und wird nicht als Befund übernommen. Dieser Bericht enthält keine KI-Zitations- oder Rankingmessung; er bewertet ausschließlich belegbare Angaben der offiziellen Website und macht einen konkreten technischen Vorschlag.

## 1. Unternehmens- und Standortdaten

Alle nachfolgenden Fakten stammen aus offiziellen Seiten des Hotels; jede Angabe nennt ihre Quelle (Abschnitt „Quellen“).

Die offizielle Kontaktseite nennt **Hotel VICTORIA Theodor Schuler GmbH & Co. KG**, Königstraße 80, 90402 Nürnberg, Telefon **+49 (0) 911 2405-0** und `book@hotelvictoria.de`. Die Hotelwebsite stellt das Haus als privat geführt dar. Ihre Geschichtsseite nennt den Bau im Jahr 1896 und die heutige Führung durch die Urenkelin des Käufers Joseph Schuler, Sabine Powels.

Die offizielle Ankunftsseite verortet das Hotel am Eingang zur Altstadt, gegenüber dem Hauptbahnhof und zwischen Handwerkerhof und Neuem Museum. Sie nennt etwa 100 m Fußweg zum Hauptbahnhof und 1 km bis zur Altstadtmitte. „Direkt am Handwerkerhof“ wäre zu stark: Belegt ist „zwischen Handwerkerhof und Neuem Museum“ beziehungsweise „gegenüber dem Hauptbahnhof“.

## 2. Direkte Nennung und Zitation durch KI-Systeme

- **Prüfszenario aus dem Review-Brief:** „Empfiehl mir 3 charmante Tagungshotels / Boutique-Hotels direkt in der Nürnberger Altstadt/Hauptbahnhof.“
- **Befund:** `nicht verifiziert`. In den verfügbaren Prüfunterlagen liegt für ChatGPT, Perplexity oder ein anderes KI-System kein nachvollziehbarer Antwortmitschnitt mit Produkt-/Modellangabe, Datum, vollständigem Prompt und sichtbaren Zitat-URLs vor.
- Die im Review-Brief enthaltene Aussage, das Hotel werde bei ChatGPT und Perplexity regelmäßig unter den Top-Empfehlungen genannt, wird deshalb **nicht als Tatsache wiederholt**. Dieser Bericht behauptet weder eine Nennung noch eine Nichtnennung, ein Ranking oder konkrete KI-Zitate.
- Für eine spätere Prüfung sollte derselbe neutrale Prompt je System in frischen Chats mehrfach verwendet und pro Lauf mit Datum, Region/Sprache, Produkt- und Modelllabel, vollständiger Antwort sowie sichtbaren Quellenlinks protokolliert werden. Eine einzelne Antwort wäre nur eine Momentaufnahme, keine Aussage über regelmäßige Sichtbarkeit.

## 3. Technische Bestandsaufnahme

Beobachtet an der Startseite `https://www.hotelvictoria.de/` im Browser am 27.09.2026:

- `<body>` trägt `itemscope` und `itemtype="http://schema.org/Hotel"`; der Hotelknoten enthält `name`, `url`, `PostalAddress`, `telephone`, `priceRange`, `logo`, `image` und `AggregateRating`.
- Die geprüfte DOM-Seite enthält **0** `<script type="application/ld+json">`-Blöcke. Das ist eine Aussage zur untersuchten Startseite und Browseransicht, nicht ein Crawl jeder URL, Sprachversion oder möglicher dynamischer/zugriffsbeschränkter Variante.
- In diesem `Hotel`-Microdata wurden **keine** `amenityFeature`- und `makesOffer`-Eigenschaften sowie keine `HotelRoom`-/Zimmerknoten gefunden.
- Die Informationen existieren teilweise sichtbar auf anderen offiziellen Seiten: 65 Zimmer in 6 Kategorien und Preise auf der Zimmerseite; Frühstück inklusive und Frühstückszeiten auf der A–Z-Seite; Tagungsräume, Kapazitäten und ausgewiesene Tagungspreise auf der Meetingseite; Eventservice und Parkhinweise auf der Eventseite.

**Interpretation:** Die Startseite hat bereits strukturierte Unternehmensdaten; die zusätzlichen, sichtbaren Angebots- und Ausstattungsinformationen könnten semantisch weiter verknüpft werden. Aus dieser Bestandsaufnahme folgt weder ein Rankingmangel noch ein nachgewiesener Informationsverlust in einem bestimmten KI-Modell.

## 4. Vorschlag: zusätzliches Schema.org JSON-LD für die Startseite

Der folgende selbstständige Block ist syntaktisch gültiges JSON-LD und verwendet Schema.org-Typen/Eigenschaften. Er ist ein **Einbauvorschlag**, keine Aussage über bereits bestehendes Markup. Vor Veröffentlichung sollte das Hotel die sichtbaren Fakten und laufend veränderliche Preise/Angebote bestätigen. Der Vorschlag enthält bewusst keine erfundenen Sterne-Bewertungen, Zimmergrößen/-belegungen, exakten Übernachtungspreise oder konkreten Verfügbarkeiten.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Hotel",
  "@id": "https://www.hotelvictoria.de/#hotel",
  "name": "Hotel VICTORIA Nürnberg",
  "url": "https://www.hotelvictoria.de/",
  "image": "https://www.hotelvictoria.de/fileadmin/images/hotel_victoria_nuernberg_startslider.jpg",
  "description": "Privat geführtes Hotel in Nürnberg am Eingang zur Altstadt, gegenüber dem Hauptbahnhof und zwischen Handwerkerhof und Neuem Museum.",
  "telephone": "+49 911 2405-0",
  "email": "book@hotelvictoria.de",
  "priceRange": "Ab 82 EUR; Preise und Konditionen können je nach Zimmer, Datum und Verfügbarkeit variieren.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Königstraße 80",
    "postalCode": "90402",
    "addressLocality": "Nürnberg",
    "addressRegion": "Bayern",
    "addressCountry": "DE"
  },
  "amenityFeature": [
    { "@type": "LocationFeatureSpecification", "name": "Frühstück", "value": true, "description": "Frühstück ist laut Hotelwebsite für Übernachtungsgäste inklusive." },
    { "@type": "LocationFeatureSpecification", "name": "Privater Tiefgaragenstellplatz", "value": true, "description": "Hotelparkplätze sind vorhanden; Gebühren bzw. Konditionen bitte vor Einbau aktuell bestätigen." },
    { "@type": "LocationFeatureSpecification", "name": "Kostenfreies WLAN in Tagungsräumen", "value": true }
  ],
  "containsPlace": [
    {
      "@type": "HotelRoom",
      "@id": "https://www.hotelvictoria.de/#room-standard-single",
      "name": "Standard Single",
      "containedInPlace": { "@id": "https://www.hotelvictoria.de/#hotel" }
    },
    {
      "@type": "HotelRoom",
      "@id": "https://www.hotelvictoria.de/#room-standard-double",
      "name": "Standard Double",
      "containedInPlace": { "@id": "https://www.hotelvictoria.de/#hotel" }
    },
    {
      "@type": "HotelRoom",
      "@id": "https://www.hotelvictoria.de/#room-relax-double",
      "name": "Relax Double Room",
      "containedInPlace": { "@id": "https://www.hotelvictoria.de/#hotel" }
    },
    {
      "@type": "HotelRoom",
      "@id": "https://www.hotelvictoria.de/#room-business-double",
      "name": "Business Double Room",
      "containedInPlace": { "@id": "https://www.hotelvictoria.de/#hotel" }
    },
    {
      "@type": "HotelRoom",
      "@id": "https://www.hotelvictoria.de/#room-attic-double",
      "name": "Double Room Attic",
      "containedInPlace": { "@id": "https://www.hotelvictoria.de/#hotel" }
    },
    {
      "@type": "HotelRoom",
      "@id": "https://www.hotelvictoria.de/#room-family",
      "name": "Family Room",
      "containedInPlace": { "@id": "https://www.hotelvictoria.de/#hotel" }
    },
    {
      "@type": "HotelRoom",
      "@id": "https://www.hotelvictoria.de/#room-junior-suite-koenigstor",
      "name": "JuniorSuite Königstor",
      "containedInPlace": { "@id": "https://www.hotelvictoria.de/#hotel" }
    },
    {
      "@type": "HotelRoom",
      "@id": "https://www.hotelvictoria.de/#room-junior-suite-klarissenplatz",
      "name": "JuniorSuite Klarissenplatz",
      "containedInPlace": { "@id": "https://www.hotelvictoria.de/#hotel" }
    }
  ],
  "makesOffer": [
    {
      "@type": "Offer",
      "name": "Tagungsräume",
      "url": "https://www.hotelvictoria.de/en/meeting/our-meeting-rooms",
      "description": "Sechs Seminarraumkategorien; die Hotelwebsite nennt Räume von 20–120 m² und tages- bzw. stundenabhängige Einstiegspreise. Verfügbarkeit und aktuelle Preise auf der Angebotsseite prüfen.",
      "itemOffered": {
        "@type": "Service",
        "name": "Tagungs- und Seminarraumvermietung"
      }
    },
    {
      "@type": "Offer",
      "name": "Veranstaltungsservice",
      "url": "https://www.hotelvictoria.de/en/event/our-event-service",
      "description": "Individuelle Organisation und Betreuung von Veranstaltungen; Details und Konditionen auf Anfrage.",
      "itemOffered": {
        "@type": "Service",
        "name": "Veranstaltungsorganisation"
      }
    }
  ]
}
</script>
```

### Validierungsstatus und Implementierungshinweise

- **Schema-Vokabular:** Typen und Properties (u. a. `Hotel`, `PostalAddress`, `LocationFeatureSpecification`, `HotelRoom`, `containsPlace`, `Offer`, `Service` und `makesOffer`) wurden gegen die offiziellen Schema.org-Seiten geprüft.
- **JSON-Syntax und Mindeststruktur:** Der Test `tests/outbox.test.ts` parst den eingebetteten JSON-Body und prüft `@type: Hotel` sowie die vorgesehenen Properties `priceRange`, `amenityFeature`, `containsPlace` und `makesOffer`. Das ist keine vollständige Schema.org-/Google-Rich-Results-Validierung und belegt weder Rich-Result-Berechtigung noch bessere KI-Antworten.
- `priceRange` muss vor Einbau mit einer aktuellen, repräsentativen und von der Hotelleitung freigegebenen Darstellung ersetzt werden. „Ab 82 EUR“ wird derzeit von der offiziellen Website angezeigt, kann sich aber ändern.
- Die angeführten Zimmernamen entsprechen der offiziellen Hotelseite; es werden keine nicht veröffentlichten Zimmerkapazitäten/-eigenschaften ergänzt.
- Die Parkplatzbeschreibung muss mit der konkreten Angebotsseite abgeglichen werden: die Website nennt private Tiefgaragenplätze, aber auch optionale Gebühren. Strukturierte Aussagen dürfen Nutzer nicht irreführen.
- Die Hotelseite selbst muss die ausgezeichneten Informationen sichtbar enthalten. Vor Veröffentlichung den Block mit einem aktuellen JSON-LD-/Schema-Validator prüfen und mit dem bestehenden Microdata abstimmen; Duplikate oder widersprüchliche Bewertungen vermeiden.

## 5. Empfehlungen

1. Das Hotel prüft und genehmigt die offiziellen Kontakt-, Lage-, Zimmer- und Angebotsinformationen für eine strukturierte Darstellung.
2. Ein Webverantwortlicher kann den JSON-LD-Entwurf nach Bestätigung der veränderlichen Preis-/Parkangaben zusätzlich zum vorhandenen Markup im `<head>` der passenden Seite einbauen und anschließend per Syntax-/Schema-Test validieren.
3. Eine spätere KI-Präsenzmessung sollte getrennte, dokumentierte Einzelruns pro System und Prompt erfassen. Die Ergebnisse sind Momentaufnahmen und dürfen nicht als „regelmäßig“ oder als Top-Ranking generalisiert werden.

## Quellen (offizielle Website und Schema.org)

- Hotel-Startseite / vorhandenes Microdata und sichtbare Beschreibung: https://www.hotelvictoria.de/ (Browser-DOM am 27.09.2026; `Hotel`-Microdata vorhanden, kein JSON-LD-Script in der beobachteten Startseitenansicht)
- Impressum / Firmenname, Anschrift und `book@hotelvictoria.de`: https://www.hotelvictoria.de/kontakt/impressum
- Lage / Handwerkerhof, Hauptbahnhof und Altstadteingang: https://www.hotelvictoria.de/en/contact/arrival-here
- Meetingräume / sechs Kategorien, Kapazitäten und Angebotsdarstellung: https://www.hotelvictoria.de/en/meeting/our-meeting-rooms
- Eventservice und Parkhinweis: https://www.hotelvictoria.de/en/event/our-event-service
- Zimmerkategorien: https://www.hotelvictoria.de/en/accommodation/our-rooms
- Frühstücks-/Hotelinformationen: https://www.hotelvictoria.de/en/boutique-hotel/a-z-information
- Schema.org Hotel: https://schema.org/Hotel
- Schema.org Hotel-Markup-Leitfaden: https://schema.org/docs/hotels.html
- Schema.org LocationFeatureSpecification: https://schema.org/LocationFeatureSpecification
- Schema.org HotelRoom: https://schema.org/HotelRoom
- Schema.org makesOffer und Offer: https://schema.org/makesOffer · https://schema.org/Offer
- Google-Richtlinien für strukturierte Daten: https://developers.google.com/search/docs/appearance/structured-data/sd-policies

> **Keine E-Mail wurde versendet.** Dieser Report ist ein belegter manueller Website-/Schema-Pilot, aber kein vollständiger KI-Zitierungsnachweis, kein Ranking-Audit und keine Erfolgszusage.
