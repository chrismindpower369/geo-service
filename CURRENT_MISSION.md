# Freebuff Mission: GEO-Service MVP & Nürnberg B2B Leads

**Modell:** DeepSeek V4.1 Flash  
**Dauer:** ~4–5 Stunden (Autonom / Stündliche Erneuerung)  
**Ziel:** Cloudflare Pages/Worker Struktur + Audit-Logik + 5 B2B-Leads in Nürnberg vorbereiten  
**Notion-Projekt:** https://app.notion.com/p/3e8cc2f61fc181dda40ec4b174e481f8

---

## 1. Missionsziel
Erstelle das erste vollständige, lauffähige Fundament für den **GEO-Service** (AI Visibility Audit für KMU im DACH-Markt).

**Regeln:**
- Keine erfundenen Erfolgsgarantien.
- Reines Vorbereitungs- und Code-Paket: **Keine echten E-Mails versenden, keine Live-APIs belasten**.
- Änderungen auf dem Branch `feat/geo-mvp-nuernberg` isolieren.

---

## 2. Arbeitsplan (Block 1 bis 5)

### Block 1: Architektur & Cloudflare Worker Basis (Stunde 1)
- [ ] `src/index.ts` (API-Router)
- [ ] `src/audit.ts` (Audit-Engine)
- [ ] `wrangler.toml` (Cloudflare-Konfiguration)
- [ ] GET `/health` und POST `/api/audit/simulate`
- [ ] Tests mit Vitest/Jest schreiben

### Block 2: Audit-Logik & Markdown-Report (Stunde 2)
- [ ] 3-Stufen-Prüfung: Direkte Nennung, Mitbewerber, technische Hebel (Schema.org / JSON-LD)
- [ ] Generator für 1-Seiten-Markdown-Reports (`outbox/reports/`)

### Block 3: Nürnberg Leads (Stunde 3)
- [ ] 5 reale B2B-Kandidaten im Raum Nürnberg recherchieren
- [ ] `outbox/nuernberg-leads.json` anlegen mit Kontaktdaten
- [ ] Probe-Audits für alle 5 Kandidaten erzeugen

### Block 4: E-Mail-Entwürfe (Stunde 4)
- [ ] `outbox/email-drafts.md` mit 5 individuellen E-Mails anlegen (kein automatischer Versand!)

### Block 5: Tests & SUMMARY.md (Stunde 5)
- [ ] Tests ausführen (`npm test`)
- [ ] `SUMMARY.md` erstellen und Commit setzen
