# GEO-Pilot-Audit: Hotel VICTORIA Nürnberg

**Status:** `reviewed` — manuelle Prüfung offizieller öffentlicher Website-Seiten am **27.09.2026**. Dies ist kein automatisierter oder vollständiger GEO-Audit.

## Kurzbefund

Das Hotel veröffentlicht bereits Schema.org-**Microdata** mit `Hotel`, `PostalAddress`, `telephone`, `priceRange` und `AggregateRating`. Im tatsächlich gerenderten HTML der Startseite wurde kein `application/ld+json`-Script gefunden. Im vorhandenen Hotel-Microdata fehlten dort `amenityFeature` und `makesOffer`; Zimmerkategorien, Ausstattung, Tagungsangebote und Preise stehen hingegen auf eigenen öffentlichen Seiten. Der belegte technische Hebel ist deshalb eine zusätzliche, mit diesen Seiten konsistente JSON-LD-Repräsentation — **nicht** das pauschale Fehlen jeglicher strukturierter Daten.

Am 27.09.2026 wurden vier dokumentierte Testläufe in drei Systemen mit dem neutralen Prüfprompt aus dem Review-Brief erhoben (Abschnitt 2): Perplexity und ChatGPT nannten das Hotel jeweils an erster Stelle von drei Empfehlungen; Perplexity zitierte dabei dessen eigene Homepage als erste Quelle, ChatGPT stützte den Eintrag auf den Chip „Tourismus Nürnberg“. Duck.ai (angezeigtes Modell „GPT-5.6 Luna“) erwähnte es dagegen in zwei Läufen am selben Tag jeweils nicht. Das Bild ist zwischen den Systemen widersprüchlich. Alle vier Läufe sind Momentaufnahmen eines Tages, keine Messreihe; die Behauptung im Review-Brief, das Hotel werde „regelmäßig“ unter den Top-Empfehlungen genannt, bleibt dadurch **nicht verifiziert**.

## 1. Unternehmens- und Standortdaten

Alle nachfolgenden Fakten stammen aus offiziellen Seiten des Hotels; jede Angabe nennt ihre Quelle (Abschnitt „Quellen“).

Die offizielle Kontaktseite nennt **Hotel VICTORIA Theodor Schuler GmbH & Co. KG**, Königstraße 80, 90402 Nürnberg, Telefon **+49 (0) 911 2405-0** und `book@hotelvictoria.de`. Die Hotelwebsite stellt das Haus als privat geführt dar. Ihre Geschichtsseite nennt den Bau im Jahr 1896 und die heutige Führung durch die Urenkelin des Käufers Joseph Schuler, Sabine Powels.

Die offizielle Ankunftsseite verortet das Hotel am Eingang zur Altstadt, gegenüber dem Hauptbahnhof und zwischen Handwerkerhof und Neuem Museum. Sie nennt etwa 100 m Fußweg zum Hauptbahnhof und 1 km bis zur Altstadtmitte. „Direkt am Handwerkerhof“ wäre zu stark: Belegt ist „zwischen Handwerkerhof und Neuem Museum“ beziehungsweise „gegenüber dem Hauptbahnhof“.

## 2. Direkte Nennung und Zitation durch KI-Systeme

- **Prüfprompt (identisch in allen Läufen, ohne Nennung des Hauses):** „Empfiehl mir 3 charmante Tagungshotels / Boutique-Hotels direkt in der Nürnberger Altstadt/Hauptbahnhof.“
- **Protokoll:** je Lauf ein frischer Chat im standardmäßigen deutschen Browserprofil; Datum **2026-09-27**; keine Nachfragen, kein Kontext aus Vorfragen. Durchläufe 1, 2 und 4 liefen anonym, Durchlauf 3 dagegen in einer bestehenden angemeldeten Sitzung als temporärer Chat — der Unterschied ist unten je Lauf vermerkt.
- **Ergebnis über drei Systeme: nicht konsistent.** Perplexity und ChatGPT nannten Hotel VICTORIA jeweils als **erste von drei Empfehlungen**; Duck.ai nannte es in **zwei** Läufen am selben Tag jeweils **nicht** unter den drei Empfehlungen.

### Durchlauf 1 — Perplexity (Website-Antwort mit Quellenverzeichnis)

- **Zeit/Produkt:** 20:49 laut Antwortseite (Europe/Berlin); Modelllabel im Antwortkopf nicht angezeigt; anonym; Antwort-URL: https://www.perplexity.ai/search/f8a8111c-7651-463f-afda-76ececaeb5cc
- **Ergebnis:** Tabelle mit drei Empfehlungen — 1. **Hotel Victoria Nürnberg** („Direkt am Tor zur Altstadt, wenige Schritte vom Hauptbahnhof“; „Besonders charmantes Boutique-Hotel in einem denkmalgeschützten Gebäude von 1896; 65 individuell gestaltete Zimmer und passende Räume für kleinere Tagungen. Das Hotel bezeichnet sich selbst ausdrücklich als Tagungshotel.“), 2. Hotel Drei Raben, 3. Hotel Elch Boutique. In der Einordnung: „Für eine echte Tagung mit professionellem Rahmen: Hotel Victoria.“ Für mehr als etwa 20–30 Personen nannte die Antwort zusätzlich Scandic Nürnberg Central und Le Méridien Grand Hotel Nürnberg.
- **Zitat-URLs (Auswahl aus „25 Quellen“, das Hotel betreffend):** https://www.hotelvictoria.de/ (erste Quelle) · https://tourismus.nuernberg.de/themen/tagung-kongress/tagungshotels/ · https://www.scandichotels.com/de/tagungen-events/nuernberg
- **Sachliche Prüfung:** Lage- und Zimmerangaben stimmen mit den offiziellen Seiten überein (65 Zimmer, Gebäude von 1896, Altstadtlage am Hauptbahnhof); im Befundtext ist kein Widerspruch erkennbar.
- **Rohbeleg:** vollständiger Antworttext, Inline-Zitat-Chips und Quellenpanel: `outbox/evidence/2026-09-27-perplexity-run1.md`

### Durchlauf 2 — Duck.ai (angezeigtes Modell „GPT-5.6 Luna“, anonymer Chat)

- **Zeit/Produkt:** 2026-09-27, Abend; der Chat zeigt selbst keine Uhrzeit an; Modelllabel wie angezeigt „GPT-5.6 Luna“.
- **Ergebnis:** drei nummerierte Empfehlungen — 1. Hotel Elch Boutique (Quelle „nuernberg.de“), 2. Leonardo Royal Hotel Nürnberg („tagungshotels.com“), 3. Scandic Nürnberg Central („scandichotels.com“); das Kurzfazit empfiehlt je nach Anlass genau diese drei. **Hotel VICTORIA wird nicht genannt**, auch nicht im Fazit.
- **Zitat-URLs der Antwort:** https://tourismus.nuernberg.de/themen/tagung-kongress/tagungshotels/ · https://www.tagungshotels.com/index.php?hotel=1580&seite=hotel&sprache=de · https://www.scandichotels.com/de/tagungen-events/nuernberg; außerdem auf der Antwortseite verlinkt u. a. https://www.tagungshotel.net/de/tagungshotel/nuernberg und https://www.art-business-hotel.com/hauptbahnhof-nuernberg/

### Durchlauf 3 — ChatGPT (angemeldete Sitzung, temporärer Chat)

- **Zeit/Produkt:** 2026-09-27, 21:28 lokale Rechnerzeit; Standardprofil mit angemeldetem Konto (also **nicht anonym**), temporärer Chat ohne Verlauf; angezeigtes Modelllabel „ChatGPT“ (Menüeintrag „ChatGPT – Ideal für alltägliche Aufgaben“), keine Versionsnummer sichtbar; keine addressierbare Antwort-URL.
- **Ergebnis:** Überschrift „Meine 3 Empfehlungen“ mit **1. Hotel VICTORIA** („Königstraße 80, 90402 Nürnberg, Deutschland“; „Inhabergeführtes 4★-Hotel mit viel Persönlichkeit – ideal für Geschäftsreisende. Wintergarten, stilvolle Lobby und nur 2 Gehminuten vom Hauptbahnhof entfernt.“), 2. Hotel Elch Boutique, 3. Karl August - a Neighborhood Hotel. Ein vorgeschaltetes Karten-/Listenmodul nannte dieselben drei Häuser, dort mit Preisen in US-Dollar.
- **Zitat-Chips:** „Tourismus Nürnberg“ am Eintrag Hotel VICTORIA und am Eintrag Hotel Elch Boutique, „Booking“ am Eintrag Karl August, zusätzlich „Tourismus Nürnberg +1“ am Preisniveau. Die Chips sind Schaltflächen; ihre Ziel-URLs waren im DOM nicht auslesbar.
- **Sachliche Prüfung:** Die Adressangabe entspricht der offiziellen Kontaktseite. Die gezeigte Bewertung (4,7 aus 1.330 Rezensionen) stammt aus dem Modul und wurde nicht gegen eine Quelle geprüft.
- **Rohbeleg:** vollständiger Antworttext, Chip-Beschriftungen und Einordnung des Seitengerüsts: `outbox/evidence/2026-09-27-chatgpt-run1.md`

### Durchlauf 4 — Duck.ai, zweiter Lauf (anonymer Chat, mit Rohbeleg)

- **Zeit/Produkt:** 2026-09-27, 22:15 lokale Rechnerzeit; anonymer Chat (DuckDuckGo weist Anonymisierung, keine Datenspeicherung für diesen Chat und kein KI-Training aus); angezeigtes Modelllabel „GPT-5.6 Luna“; keine addressierbare Antwort-URL.
- **Ergebnis:** drei Empfehlungen in dieser Reihenfolge — 1. Hotel Elch Boutique („Ein besonders individuelles Boutique-Hotel in einem Fachwerkhaus aus dem 14. Jahrhundert … die Kapazität liegt laut Tourismusseite bei bis zu 20 Personen.“), 2. Scandic Nürnberg Central, 3. Leonardo Royal Hotel Nürnberg. **Hotel VICTORIA wird nicht genannt**, auch nicht in der Kurzentscheidung. Der Lauf nennt dieselben drei Häuser wie Durchlauf 2, aber in anderer Reihenfolge.
- **Zitat-Chips:** „nuernberg.de“, „scandichotels.com“, „tagungshotels.com“; insgesamt fünf Quellenlinks (u. a. https://tourismus.nuernberg.de/themen/tagung-kongress/tagungshotels/ und https://www.tagungshotel.net/de/tagungshotel/nuernberg).
- **Rohbeleg:** vollständiger Antworttext, Chip-Beschriftungen und alle fünf Quellenlinks: `outbox/evidence/2026-09-27-duck-ai-run1.md`

### Grenzen dieses Befunds

- Vier Läufe an einem Tag, je ein Produkt, zwei davon bei Duck.ai: Das belegt **keine zeitliche Stabilität** und keine „regelmäßige“ Nennung; eine Messreihe über mehrere Tage (wiederholte Läufe je System und Prompt mit Protokoll) fehlt weiterhin.
- Zwei Duck.ai-Läufe am selben Tag nennen dieselben drei Häuser, aber in unterschiedlicher Reihenfolge: Die Reihenfolge eines Systems ist damit nicht einmal innerhalb eines Tages stabil. Über Tage sagt das nichts.
- Die Auswahlkriterien der Systeme sind nicht einsehbar; Perplexity zeigte zusätzlich ein Karten-/Places-Modul mit zehn Hotels, die Empfehlung selbst war eine Top-3-Tabelle.
- Durchlauf 2 ist nicht mehr im Original abrufbar: der anonyme Duck.ai-Chat hatte keinen Verlaufslink und ist nach dem Schließen nicht wieder aufrufbar. Belegt sind dort die wörtlich zitierten Passagen und die vollständigen Quellen-URLs, nicht der komplette Antworttext. Durchlauf 1 ist dagegen über die Antwort-URL und den Rohbeleg vollständig nachprüfbar.
- Durchläufe 2, 3 und 4 haben keine addressierbare Antwort-URL. Für Durchlauf 4 liegt der vollständige Text als Rohbeleg vor, für Durchlauf 2 nur die im Bericht zitierten Passagen.
- Durchlauf 3 lief **nicht anonym**, sondern in einer angemeldeten Sitzung (temporärer Chat) und ist daher nicht mit den beiden anonymen Läufen gleichzusetzen. Eine anonyme ChatGPT-Prüfung war nicht möglich, weil chatgpt.com eine Anmeldung verlangt.
- Die in Durchlauf 3 gezeigten Preise stehen in US-Dollar, obwohl die Antwort deutsch ist; Preisangaben aus KI-Modulen sind nicht als Hotelpreise gesichert.
- Die Nennung bei Perplexity stützt sich u. a. auf die eigene Website des Hotels („bezeichnet sich selbst ausdrücklich als Tagungshotel“) — das stützt den technischen Hebel aus Abschnitt 4 (vollständige, strukturierte Angebotsdaten), ist aber kein Wirkungsnachweis des JSON-LD-Vorschlags.

### Mitbewerber (nicht Teil dieses Piloten)

Eine systematische Mitbewerberrecherche war nicht Teil dieses Piloten. Die Häuser, die die drei Testläufe zusätzlich nannten — Hotel Drei Raben, Hotel Elch Boutique, Karl August - a Neighborhood Hotel, Leonardo Royal Hotel Nürnberg, Scandic Nürnberg Central und Le Méridien Grand Hotel Nürnberg — stammen aus drei Antworten und sind keine geprüften Mitbewerberaussagen.

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
3. Die drei dokumentierten Testläufe sind eine Momentaufnahme. Für belastbare Aussagen sollte dasselbe Protokoll (Datum, System/Modell, Region, Prompt, vollständige Antwort, Zitat-URLs) über mehrere Tage und Systeme wiederholt werden; „regelmäßige“ Nennungen bleiben ohne solche Messreihe unbelegt.

## Quellen (offizielle Website und Schema.org)

- Perplexity-Antwort (Durchlauf 1, 20:49): https://www.perplexity.ai/search/f8a8111c-7651-463f-afda-76ececaeb5cc — vollständiger Antworttext und Quellenangaben im Rohbeleg `outbox/evidence/2026-09-27-perplexity-run1.md`
- Duck.ai-Antwort (Durchlauf 2): anonymer Chat ohne addressierbaren Verlaufslink; im Bericht stehen Prompt, wörtliche Zitate und die Quellen-URLs, der vollständige Antworttext liegt nicht vor
- ChatGPT-Antwort (Durchlauf 3): temporärer Chat ohne addressierbare URL; vollständiger Antworttext, Chip-Beschriftungen und Einordnung des Seitengerüsts im Rohbeleg `outbox/evidence/2026-09-27-chatgpt-run1.md`
- Duck.ai-Antwort (Durchlauf 4): anonymer Chat ohne addressierbare URL; vollständiger Antworttext, Chip-Beschriftungen und fünf Quellenlinks im Rohbeleg `outbox/evidence/2026-09-27-duck-ai-run1.md`
- Hotel-Startseite / vorhandenes Microdata und sichtbare Beschreibung: https://www.hotelvictoria.de/ (Browser-DOM am 27.09.2026; `Hotel`-Microdata vorhanden, kein JSON-LD-Script in der beobachteten Startseitenansicht; in Durchlauf 1 des KI-Tests als erste Quelle zitiert)
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
