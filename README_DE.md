# Windows-Datenträgerverkleinerungs-Simulator

![License](https://img.shields.io/badge/license-GPLv3-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows-lightgrey)
![Built With](https://img.shields.io/badge/built%20with-HTML%2FCSS%2FJS-orange)
![Status](https://img.shields.io/badge/status-Stable-brightgreen)
![Educational](https://img.shields.io/badge/purpose-Educational-blueviolet)

Dieser Simulator wurde erstellt, um dir zu helfen zu verstehen, was passiert, bevor du etwas Wichtiges auf deinem Computer veränderst. Partitionen zu ändern, ohne zu verstehen, was geschieht, kann riskant sein. Hier kannst du es sicher lernen.

Dies ist ein Lernwerkzeug, das das Verhalten des Fensters **„Volume verkleinern“** aus der Windows-Datenträgerverwaltung simuliert.

Dieses Projekt wurde erstellt, um zu verstehen, wie Windows den verkleinerbaren Speicherplatz berechnet, bevor Linux installiert oder neue Partitionen erstellt werden:

[https://wachin.github.io/windows-disk-shrink-simulator/](https://wachin.github.io/windows-disk-shrink-simulator/)

⚠️ **Wichtig:**
Diese Seite verändert **keine echten Datenträger**. Es handelt sich ausschließlich um eine visuelle und pädagogische Simulation.

---

## 🧩 Was ist eine Partition?

Eine Partition ist eine Unterteilung deiner Festplatte.

Es ist wie ein großer Kuchen, der in Stücke geschnitten wird.
Jedes Stück kann für etwas anderes verwendet werden:

* Ein Teil für Windows
* Ein anderer Teil für Linux
* Ein weiterer Teil zum Speichern von Dateien

Wenn du ein Volume verkleinerst, machst du eines dieser Stücke kleiner, um neuen Speicherplatz zu schaffen.

---

## Ziel

Wenn Windows das Fenster **„Volume verkleinern (C:)“** anzeigt, verstehen viele Menschen nicht:

* Warum sie nicht den gesamten freien Speicherplatz verkleinern können.
* Warum es eine Grenze gibt, die nicht überschritten werden kann.
* Was „nicht verkleinerbarer“ Speicherplatz bedeutet.

Dieser Simulator bildet dieses Verhalten nach, damit du es verstehen kannst, bevor du echte Änderungen an deiner Festplatte vornimmst.

---

## 🖥️ So verwendest du den Simulator

### Schritt 1 — Windows-Datenträgerverwaltung öffnen

Auf deinem Computer:

1. Drücke `Win + X`
2. Wähle **Datenträgerverwaltung**
3. Rechtsklicke auf die Partition **Windows (C:)**
4. Wähle **Volume verkleinern…**

Windows zeigt ein Fenster mit 3 wichtigen Werten an.

---

### Schritt 2 — Die ersten beiden Werte kopieren

Du musst **genau** (in MB und ohne Kommas oder Punkte) kopieren:

* ✅ **Gesamtgröße vor der Verkleinerung**
* ✅ **Größe des verfügbaren Speicherplatzes zur Verkleinerung**

Gib diese beiden Werte in den Web-Simulator ein.

---

### Schritt 3 — Die Datenträgerleiste verstehen

Nach Eingabe der ersten beiden Werte:

Auf der rechten Seite siehst du die simulierte Datenträgerleiste.

Darin erkennst du:

* 🔵 Blauer Bereich → Windows (nach der Verkleinerung)
* ⚪ Grau gestreifter Bereich → Freier Speicher für Linux
* 🎚️ Einen kleinen Schieberegler (Trenner)

Dieses kleine Element wird genannt:

> **Partitions-Trenner** (oder einfach *Trenner* / *Handle* in technischen Begriffen).

---

## 🎚️ So bewegst du den Trenner richtig

Du musst:

1. Auf den Trenner klicken.
2. Die Maustaste gedrückt halten.
3. Ihn nach rechts ziehen.

❗ Du kannst ihn nicht weiter nach links über die Grenze hinaus bewegen (du kannst den reservierten Bereich nicht über den Punkt hinaus verkleinern, an dem sich nicht verschiebbare Dateien befinden).

---

## ❓ Warum kann es nicht weiter verkleinert werden?

Weil Windows bereits seine interne Berechnung durchgeführt hat.

Windows analysiert den Datenträger und erkennt Dateien, die **nicht verschoben werden können**, zum Beispiel:

* Auslagerungsdatei (pagefile.sys)
* Ruhezustandsdatei
* Systemmetadaten
* Nicht verschiebbare Fragmente
* Interne NTFS-Systemstrukturen

Deshalb erscheint eine maximale Grenze.

Diese Grenze ist genau der Wert, den Windows anzeigt als:

> **„Größe des verfügbaren Speicherplatzes zur Verkleinerung“**

Diese Zahl ist das Maximum, das Windows in diesem Moment zulässt.

**Es sei denn**, du verwendest eine Drittanbieter-Partitionssoftware, die versucht, ein Volume mit nicht verschiebbaren Dateien zu verkleinern (indem sie diese automatisch verschiebt) über eine „Partition ändern“-Funktion, wie zum Beispiel AOMEI Partition Assistant.

Für unerfahrene Benutzer kann dies jedoch gefährlich sein, und ich möchte niemanden dazu ermutigen, etwas ohne Verständnis der Risiken zu tun. Ich erwähne dieses Programm, weil ich es selbst verwendet habe, aber um es korrekt zu benutzen, musst du genau wissen, was du tust, über entsprechendes Wissen verfügen und unbedingt vorher ein Backup erstellen.

Es gibt YouTube-Videos, die erklären, wie man es benutzt.

Was mir persönlich nicht gefällt, ist, dass der Verkleinerungsprozess sehr lange dauern kann. In vielen Fällen ist das integrierte Windows-Werkzeug schneller.

---

## 📋 „Copy“-Button

Das Feld:

> „Zu verkleinernder Speicherplatz (MB)“

enthält eine **Copy-Schaltfläche**.

Diese Schaltfläche:

* Kopiert den Wert automatisch in die Zwischenablage.
* Ermöglicht es dir, ihn direkt in das echte Windows-Fenster einzufügen.

---

## 📱 Mobile Nutzung

Das Design ist responsiv:

* Auf Computern → Zwei-Spalten-Layout
* Auf Mobilgeräten → Ein-Spalten-Layout

Der Simulator erscheint zuerst, das Ergebnis darunter.

---

## 🛠️ Technische Umsetzung

* HTML
* CSS (Windows-10-Stil)
* JavaScript (Trenner-Logik und Berechnungen)
* Clipboard API zum Kopieren von Werten

Kein Backend oder Installation erforderlich.

---

## 📘 Wichtiges Konzept

Viele Menschen glauben, dass sie zum Beispiel bei:

Freier Speicherplatz: 250 GB

die gesamten 250 GB verkleinern können.

Windows betrachtet jedoch nicht nur, wie viel freier Speicher vorhanden ist.
Es prüft auch, wo sich die Dateien physisch auf dem Datenträger befinden.

Wenn sich wichtige Dateien nahe am Ende des Datenträgers befinden, kann Windows nicht darüber hinaus verkleinern.

Genau das hilft dieser Simulator visuell zu verstehen.

---

## ⚠️ Erklärung der offiziellen Microsoft-Warnung

Die Microsoft-Dokumentation enthält folgende Warnung:

> „Wenn die Partition eine RAW-Partition ist, die Daten enthält, z. B. eine Datenbankdatei, kann das Verkleinern der Partition die Daten zerstören.“

### Was bedeutet das?

Diese Warnung bezieht sich speziell auf **Partitionen, die Windows nicht erkennen oder interpretieren kann** — also nicht auf das typische „C:“-Laufwerk normaler Benutzer, sondern auf eine andere Partition, die nicht als NTFS formatiert ist.

Beispiel aus dem Serverbereich:

* Der Administrator erstellt eine zusätzliche Festplatte.
* Diese wird NICHT mit NTFS formatiert.
* Sie wird direkt einer Datenbank-Engine bereitgestellt.
* SQL Server schreibt Daten direkt auf Blockebene.

In diesem Fall:

* Windows sieht keine Dateien.
* Es gibt keine MFT (Master File Table).
* Es gibt keine NTFS-Struktur.
* Das Volume erscheint als RAW.

Aber SQL Server weiß, welche Blöcke Daten enthalten.

---

### Warum könnte das Verkleinern Daten zerstören?

Beim Verkleinern einer normalen NTFS-Partition:

1. Liest Windows die Dateisystem-Metadaten (MFT).
2. Weiß, wo sich Dateien befinden.
3. Verschiebt verschiebbare Dateien bei Bedarf.
4. Verkleinert die Partition sicher.

Bei einer RAW-Partition jedoch:

* Gibt es keine Dateisystemstruktur.
* Windows kann nicht erkennen, welche Blöcke kritische Daten enthalten.
* Der Verkleinerungsvorgang kann aktive Datenblöcke abschneiden.
* Dies kann zu irreversiblen Datenverlusten führen.

---

### Betrifft das normale Heimanwender?

Wenn du verkleinerst:

* Die Windows-Systempartition (C:)
* Eine normale NTFS-Datenpartition

Dann betrifft dich diese Warnung nicht.

Sie bezieht sich hauptsächlich auf:

* Datenbankserver mit RAW-Speicher
* Industrielle Systeme
* Embedded-Systeme
* Spezialisierte Speicherkonfigurationen

---

### Empfohlene Praxis

Auch beim Verkleinern normaler NTFS-Partitionen wird dringend empfohlen:

* Ein Backup wichtiger Dateien zu erstellen (z. B. Abschlussarbeiten, Aufgaben, Arbeitsdokumente, Audio-/Video-Projekte usw.).
* Die Systemstabilität sicherzustellen.
* Stromunterbrechungen während des Vorgangs zu vermeiden.

Partitionsänderungen verändern die Struktur des Speichermediums, und unerwartete Ausfälle (z. B. Stromausfall) können Schäden verursachen.

Wenn während der Verkleinerung der Strom ausfällt:

* Kann das System nicht mehr starten.
* Die Partition kann beschädigt werden.
* Dateien können verloren gehen.

Daher wird empfohlen:

* Einen Laptop mit geladener Batterie zu verwenden.
* Oder eine USV (unterbrechungsfreie Stromversorgung) bei einem Desktop-PC zu nutzen.

---

## 📄 Lizenz

Bildungsprojekt zur freien Nutzung, lizenziert unter GPL 3.
