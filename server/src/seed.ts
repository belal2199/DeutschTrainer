import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Verb from './models/Verb';
import Noun from './models/Noun';
import Adjective from './models/Adjective';
import Sentence from './models/Sentence';
import Refemittel from './models/Refemittel';

const verbs = [
  // Entwicklung (Development)
  { infinitiv: 'entwickeln', english: 'develop', perfekt: 'hat entwickelt', category: 'Entwicklung', example: 'Ich entwickle skalierbare Systeme.' },
  { infinitiv: 'programmieren', english: 'program', perfekt: 'hat programmiert', category: 'Entwicklung', example: 'Wir programmieren in TypeScript.' },
  { infinitiv: 'implementieren', english: 'implement', perfekt: 'hat implementiert', category: 'Entwicklung', example: 'Ich habe das Feature implementiert.' },
  { infinitiv: 'kompilieren', english: 'compile', perfekt: 'hat kompiliert', category: 'Entwicklung', example: 'Der Code kompiliert ohne Fehler.' },
  { infinitiv: 'debuggen', english: 'debug', perfekt: 'hat debuggt', category: 'Entwicklung', example: 'Ich debugge den Fehler gerade.' },
  { infinitiv: 'refaktorisieren', english: 'refactor', perfekt: 'hat refaktorisiert', category: 'Entwicklung', example: 'Wir refaktorisieren den Legacy-Code.' },
  { infinitiv: 'coden', english: 'code', perfekt: 'hat gecodet', category: 'Entwicklung', example: 'Ich code seit drei Stunden.' },
  { infinitiv: 'erstellen', english: 'create', perfekt: 'hat erstellt', category: 'Entwicklung', example: 'Ich erstelle eine neue Komponente.' },
  { infinitiv: 'schreiben', english: 'write', perfekt: 'hat geschrieben', category: 'Entwicklung', example: 'Ich schreibe sauberen Code.' },
  { infinitiv: 'lesen', english: 'read', perfekt: 'hat gelesen', category: 'Entwicklung', example: 'Ich lese die Dokumentation.' },
  { infinitiv: 'ändern', english: 'change/modify', perfekt: 'hat geändert', category: 'Entwicklung', example: 'Ich ändere die Konfiguration.' },
  { infinitiv: 'löschen', english: 'delete', perfekt: 'hat gelöscht', category: 'Entwicklung', example: 'Ich lösche die alte Datei.' },
  { infinitiv: 'hinzufügen', english: 'add', perfekt: 'hat hinzugefügt', category: 'Entwicklung', example: 'Ich füge eine neue Funktion hinzu.' },
  { infinitiv: 'aktualisieren', english: 'update', perfekt: 'hat aktualisiert', category: 'Entwicklung', example: 'Ich aktualisiere die Abhängigkeiten.' },
  { infinitiv: 'konfigurieren', english: 'configure', perfekt: 'hat konfiguriert', category: 'Entwicklung', example: 'Ich konfiguriere den Server.' },
  { infinitiv: 'optimieren', english: 'optimize', perfekt: 'hat optimiert', category: 'Entwicklung', example: 'Wir optimieren die Ladezeit.' },
  { infinitiv: 'integrieren', english: 'integrate', perfekt: 'hat integriert', category: 'Entwicklung', example: 'Wir integrieren die neue API.' },
  { infinitiv: 'automatisieren', english: 'automate', perfekt: 'hat automatisiert', category: 'Entwicklung', example: 'Ich automatisiere den Build-Prozess.' },
  { infinitiv: 'versionieren', english: 'version', perfekt: 'hat versioniert', category: 'Entwicklung', example: 'Wir versionieren mit Git.' },
  { infinitiv: 'committen', english: 'commit', perfekt: 'hat committet', category: 'Entwicklung', example: 'Ich committe meine Änderungen.' },
  { infinitiv: 'mergen', english: 'merge', perfekt: 'hat gemergt', category: 'Entwicklung', example: 'Ich merge den Feature-Branch.' },
  { infinitiv: 'pushen', english: 'push', perfekt: 'hat gepusht', category: 'Entwicklung', example: 'Ich pushe den Code zum Remote.' },
  { infinitiv: 'pullen', english: 'pull', perfekt: 'hat gepullt', category: 'Entwicklung', example: 'Ich pulle die neuesten Änderungen.' },
  { infinitiv: 'forken', english: 'fork', perfekt: 'hat geforkt', category: 'Entwicklung', example: 'Ich forke das Repository.' },
  { infinitiv: 'klonen', english: 'clone', perfekt: 'hat geklont', category: 'Entwicklung', example: 'Ich klone das Repo.' },
  { infinitiv: 'initialisieren', english: 'initialize', perfekt: 'hat initialisiert', category: 'Entwicklung', example: 'Ich initialisiere das Projekt.' },
  { infinitiv: 'iterieren', english: 'iterate', perfekt: 'hat iteriert', category: 'Entwicklung', example: 'Wir iterieren über das Array.' },
  { infinitiv: 'instanziieren', english: 'instantiate', perfekt: 'hat instanziiert', category: 'Entwicklung', example: 'Ich instanziiere die Klasse.' },
  { infinitiv: 'parsen', english: 'parse', perfekt: 'hat geparst', category: 'Entwicklung', example: 'Wir parsen die JSON-Daten.' },
  { infinitiv: 'rendern', english: 'render', perfekt: 'hat gerendert', category: 'Entwicklung', example: 'Die Komponente rendert korrekt.' },

  // Testing
  { infinitiv: 'testen', english: 'test', perfekt: 'hat getestet', category: 'Testing', example: 'Ich teste die neue Funktion.' },
  { infinitiv: 'prüfen', english: 'check/verify', perfekt: 'hat geprüft', category: 'Testing', example: 'Ich prüfe den Code-Review.' },
  { infinitiv: 'validieren', english: 'validate', perfekt: 'hat validiert', category: 'Testing', example: 'Ich validiere die Eingaben.' },
  { infinitiv: 'verifizieren', english: 'verify', perfekt: 'hat verifiziert', category: 'Testing', example: 'Ich verifiziere das Ergebnis.' },
  { infinitiv: 'simulieren', english: 'simulate', perfekt: 'hat simuliert', category: 'Testing', example: 'Wir simulieren Benutzeraktionen.' },
  { infinitiv: 'mocken', english: 'mock', perfekt: 'hat gemockt', category: 'Testing', example: 'Ich mocke die API-Antwort.' },
  { infinitiv: 'erwarten', english: 'expect', perfekt: 'hat erwartet', category: 'Testing', example: 'Ich erwarte einen Statuscode 200.' },
  { infinitiv: 'bestätigen', english: 'confirm/assert', perfekt: 'hat bestätigt', category: 'Testing', example: 'Der Test bestätigt das Ergebnis.' },
  { infinitiv: 'fehlschlagen', english: 'fail', perfekt: 'ist fehlgeschlagen', category: 'Testing', example: 'Der Test ist fehlgeschlagen.' },
  { infinitiv: 'bestehen', english: 'pass (a test)', perfekt: 'hat bestanden', category: 'Testing', example: 'Alle Tests haben bestanden.' },
  { infinitiv: 'abdecken', english: 'cover', perfekt: 'hat abgedeckt', category: 'Testing', example: 'Die Tests decken 90% ab.' },
  { infinitiv: 'reproduzieren', english: 'reproduce', perfekt: 'hat reproduziert', category: 'Testing', example: 'Ich kann den Bug reproduzieren.' },
  { infinitiv: 'isolieren', english: 'isolate', perfekt: 'hat isoliert', category: 'Testing', example: 'Ich isoliere den Fehler.' },
  { infinitiv: 'überwachen', english: 'monitor', perfekt: 'hat überwacht', category: 'Testing', example: 'Wir überwachen die Systemleistung.' },
  { infinitiv: 'protokollieren', english: 'log', perfekt: 'hat protokolliert', category: 'Testing', example: 'Ich protokolliere die Fehler.' },
  { infinitiv: 'beheben', english: 'fix (a bug)', perfekt: 'hat behoben', category: 'Testing', example: 'Ich habe den Bug behoben.' },
  { infinitiv: 'nachverfolgen', english: 'track', perfekt: 'hat nachverfolgt', category: 'Testing', example: 'Ich verfolge den Fehler nach.' },
  { infinitiv: 'analysieren', english: 'analyze', perfekt: 'hat analysiert', category: 'Testing', example: 'Ich analysiere die Logdateien.' },
  { infinitiv: 'bewerten', english: 'evaluate', perfekt: 'hat bewertet', category: 'Testing', example: 'Ich bewerte die Code-Qualität.' },
  { infinitiv: 'messen', english: 'measure', perfekt: 'hat gemessen', category: 'Testing', example: 'Ich messe die Antwortzeit.' },

  // Deployment
  { infinitiv: 'bereitstellen', english: 'deploy/provide', perfekt: 'hat bereitgestellt', category: 'Deployment', example: 'Ich stelle die App bereit.' },
  { infinitiv: 'deployen', english: 'deploy', perfekt: 'hat deployt', category: 'Deployment', example: 'Wir deployen auf AWS.' },
  { infinitiv: 'veröffentlichen', english: 'publish/release', perfekt: 'hat veröffentlicht', category: 'Deployment', example: 'Wir veröffentlichen Version 2.0.' },
  { infinitiv: 'skalieren', english: 'scale', perfekt: 'hat skaliert', category: 'Deployment', example: 'Wir skalieren die Infrastruktur.' },
  { infinitiv: 'migrieren', english: 'migrate', perfekt: 'hat migriert', category: 'Deployment', example: 'Wir migrieren zur Cloud.' },
  { infinitiv: 'containerisieren', english: 'containerize', perfekt: 'hat containerisiert', category: 'Deployment', example: 'Ich containerisiere die Anwendung.' },
  { infinitiv: 'orchestrieren', english: 'orchestrate', perfekt: 'hat orchestriert', category: 'Deployment', example: 'Kubernetes orchestriert die Container.' },
  { infinitiv: 'provisionieren', english: 'provision', perfekt: 'hat provisioniert', category: 'Deployment', example: 'Ich provisioniere neue Server.' },
  { infinitiv: 'laden', english: 'load', perfekt: 'hat geladen', category: 'Deployment', example: 'Die Seite lädt schnell.' },
  { infinitiv: 'starten', english: 'start/launch', perfekt: 'hat gestartet', category: 'Deployment', example: 'Ich starte den Server.' },
  { infinitiv: 'stoppen', english: 'stop', perfekt: 'hat gestoppt', category: 'Deployment', example: 'Ich stoppe den Dienst.' },
  { infinitiv: 'neustarten', english: 'restart', perfekt: 'hat neugestartet', category: 'Deployment', example: 'Ich starte den Server neu.' },
  { infinitiv: 'sichern', english: 'back up / secure', perfekt: 'hat gesichert', category: 'Deployment', example: 'Ich sichere die Datenbank.' },
  { infinitiv: 'wiederherstellen', english: 'restore', perfekt: 'hat wiederhergestellt', category: 'Deployment', example: 'Ich stelle das Backup wieder her.' },
  { infinitiv: 'ausführen', english: 'execute/run', perfekt: 'hat ausgeführt', category: 'Deployment', example: 'Ich führe das Skript aus.' },
  { infinitiv: 'installieren', english: 'install', perfekt: 'hat installiert', category: 'Deployment', example: 'Ich installiere die Pakete.' },
  { infinitiv: 'hochladen', english: 'upload', perfekt: 'hat hochgeladen', category: 'Deployment', example: 'Ich lade das Artefakt hoch.' },
  { infinitiv: 'herunterladen', english: 'download', perfekt: 'hat heruntergeladen', category: 'Deployment', example: 'Ich lade die Datei herunter.' },
  { infinitiv: 'einrichten', english: 'set up', perfekt: 'hat eingerichtet', category: 'Deployment', example: 'Ich richte die CI/CD-Pipeline ein.' },
  { infinitiv: 'zurückrollen', english: 'roll back', perfekt: 'hat zurückgerollt', category: 'Deployment', example: 'Wir rollen das Deployment zurück.' },

  // Datenbank (Database)
  { infinitiv: 'abfragen', english: 'query', perfekt: 'hat abgefragt', category: 'Datenbank', example: 'Ich frage die Datenbank ab.' },
  { infinitiv: 'speichern', english: 'save/store', perfekt: 'hat gespeichert', category: 'Datenbank', example: 'Ich speichere die Daten.' },
  { infinitiv: 'einfügen', english: 'insert', perfekt: 'hat eingefügt', category: 'Datenbank', example: 'Ich füge einen Datensatz ein.' },
  { infinitiv: 'abrufen', english: 'retrieve/fetch', perfekt: 'hat abgerufen', category: 'Datenbank', example: 'Ich rufe die Daten ab.' },
  { infinitiv: 'sortieren', english: 'sort', perfekt: 'hat sortiert', category: 'Datenbank', example: 'Ich sortiere nach Datum.' },
  { infinitiv: 'filtern', english: 'filter', perfekt: 'hat gefiltert', category: 'Datenbank', example: 'Ich filtere nach Kategorie.' },
  { infinitiv: 'verknüpfen', english: 'join/link', perfekt: 'hat verknüpft', category: 'Datenbank', example: 'Ich verknüpfe die Tabellen.' },
  { infinitiv: 'indizieren', english: 'index', perfekt: 'hat indiziert', category: 'Datenbank', example: 'Ich indiziere die Spalte.' },
  { infinitiv: 'normalisieren', english: 'normalize', perfekt: 'hat normalisiert', category: 'Datenbank', example: 'Ich normalisiere die Datenbank.' },
  { infinitiv: 'cachen', english: 'cache', perfekt: 'hat gecacht', category: 'Datenbank', example: 'Wir cachen die Ergebnisse.' },
  { infinitiv: 'synchronisieren', english: 'synchronize', perfekt: 'hat synchronisiert', category: 'Datenbank', example: 'Ich synchronisiere die Daten.' },
  { infinitiv: 'replizieren', english: 'replicate', perfekt: 'hat repliziert', category: 'Datenbank', example: 'Die Datenbank repliziert automatisch.' },
  { infinitiv: 'exportieren', english: 'export', perfekt: 'hat exportiert', category: 'Datenbank', example: 'Ich exportiere die Daten als CSV.' },
  { infinitiv: 'importieren', english: 'import', perfekt: 'hat importiert', category: 'Datenbank', example: 'Ich importiere die Seed-Daten.' },
  { infinitiv: 'verschlüsseln', english: 'encrypt', perfekt: 'hat verschlüsselt', category: 'Datenbank', example: 'Ich verschlüssele die Passwörter.' },
  { infinitiv: 'entschlüsseln', english: 'decrypt', perfekt: 'hat entschlüsselt', category: 'Datenbank', example: 'Ich entschlüssele die Daten.' },
  { infinitiv: 'transformieren', english: 'transform', perfekt: 'hat transformiert', category: 'Datenbank', example: 'Ich transformiere die Datenstruktur.' },
  { infinitiv: 'aggregieren', english: 'aggregate', perfekt: 'hat aggregiert', category: 'Datenbank', example: 'Ich aggregiere die Statistiken.' },
  { infinitiv: 'paginieren', english: 'paginate', perfekt: 'hat paginiert', category: 'Datenbank', example: 'Ich paginiere die Ergebnisse.' },
  { infinitiv: 'serialisieren', english: 'serialize', perfekt: 'hat serialisiert', category: 'Datenbank', example: 'Ich serialisiere das Objekt.' },

  // Allgemein (General / Teamwork)
  { infinitiv: 'besprechen', english: 'discuss', perfekt: 'hat besprochen', category: 'Allgemein', example: 'Wir besprechen die Anforderungen.' },
  { infinitiv: 'planen', english: 'plan', perfekt: 'hat geplant', category: 'Allgemein', example: 'Wir planen den Sprint.' },
  { infinitiv: 'dokumentieren', english: 'document', perfekt: 'hat dokumentiert', category: 'Allgemein', example: 'Ich dokumentiere die API.' },
  { infinitiv: 'schätzen', english: 'estimate', perfekt: 'hat geschätzt', category: 'Allgemein', example: 'Ich schätze den Aufwand.' },
  { infinitiv: 'priorisieren', english: 'prioritize', perfekt: 'hat priorisiert', category: 'Allgemein', example: 'Wir priorisieren die Tickets.' },
  { infinitiv: 'zuweisen', english: 'assign', perfekt: 'hat zugewiesen', category: 'Allgemein', example: 'Ich weise das Ticket zu.' },
  { infinitiv: 'reviewen', english: 'review', perfekt: 'hat reviewt', category: 'Allgemein', example: 'Ich reviewe den Pull Request.' },
  { infinitiv: 'genehmigen', english: 'approve', perfekt: 'hat genehmigt', category: 'Allgemein', example: 'Ich genehmige den PR.' },
  { infinitiv: 'ablehnen', english: 'reject', perfekt: 'hat abgelehnt', category: 'Allgemein', example: 'Ich lehne den Vorschlag ab.' },
  { infinitiv: 'vorschlagen', english: 'suggest/propose', perfekt: 'hat vorgeschlagen', category: 'Allgemein', example: 'Ich schlage eine Lösung vor.' },
  { infinitiv: 'umsetzen', english: 'implement/realize', perfekt: 'hat umgesetzt', category: 'Allgemein', example: 'Wir setzen das Design um.' },
  { infinitiv: 'zusammenarbeiten', english: 'collaborate', perfekt: 'hat zusammengearbeitet', category: 'Allgemein', example: 'Wir arbeiten im Team zusammen.' },
  { infinitiv: 'kommunizieren', english: 'communicate', perfekt: 'hat kommuniziert', category: 'Allgemein', example: 'Ich kommuniziere den Status.' },
  { infinitiv: 'präsentieren', english: 'present', perfekt: 'hat präsentiert', category: 'Allgemein', example: 'Ich präsentiere die Ergebnisse.' },
  { infinitiv: 'entscheiden', english: 'decide', perfekt: 'hat entschieden', category: 'Allgemein', example: 'Wir entscheiden über die Architektur.' },
  { infinitiv: 'verbessern', english: 'improve', perfekt: 'hat verbessert', category: 'Allgemein', example: 'Wir verbessern die Performance.' },
  { infinitiv: 'lernen', english: 'learn', perfekt: 'hat gelernt', category: 'Allgemein', example: 'Ich lerne eine neue Technologie.' },
  { infinitiv: 'unterstützen', english: 'support', perfekt: 'hat unterstützt', category: 'Allgemein', example: 'Ich unterstütze das Team.' },
  { infinitiv: 'liefern', english: 'deliver', perfekt: 'hat geliefert', category: 'Allgemein', example: 'Wir liefern pünktlich.' },
  { infinitiv: 'anpassen', english: 'adapt/customize', perfekt: 'hat angepasst', category: 'Allgemein', example: 'Ich passe die Einstellungen an.' },
  { infinitiv: 'aufteilen', english: 'split/divide', perfekt: 'hat aufgeteilt', category: 'Allgemein', example: 'Ich teile die Aufgabe auf.' },
  { infinitiv: 'vereinfachen', english: 'simplify', perfekt: 'hat vereinfacht', category: 'Allgemein', example: 'Ich vereinfache den Algorithmus.' },
  { infinitiv: 'erweitern', english: 'extend/expand', perfekt: 'hat erweitert', category: 'Allgemein', example: 'Ich erweitere die Funktionalität.' },
  { infinitiv: 'abstimmen', english: 'coordinate/align', perfekt: 'hat abgestimmt', category: 'Allgemein', example: 'Wir stimmen uns im Daily ab.' },
  { infinitiv: 'einarbeiten', english: 'onboard/familiarize', perfekt: 'hat eingearbeitet', category: 'Allgemein', example: 'Ich arbeite mich in das Projekt ein.' },
  { infinitiv: 'abschließen', english: 'complete/finish', perfekt: 'hat abgeschlossen', category: 'Allgemein', example: 'Ich schließe das Ticket ab.' },
  { infinitiv: 'übernehmen', english: 'take over', perfekt: 'hat übernommen', category: 'Allgemein', example: 'Ich übernehme die Aufgabe.' },
  { infinitiv: 'verantworten', english: 'be responsible for', perfekt: 'hat verantwortet', category: 'Allgemein', example: 'Ich verantworte das Backend.' },
  { infinitiv: 'definieren', english: 'define', perfekt: 'hat definiert', category: 'Allgemein', example: 'Ich definiere die Schnittstelle.' },
  { infinitiv: 'strukturieren', english: 'structure', perfekt: 'hat strukturiert', category: 'Allgemein', example: 'Ich strukturiere den Code.' },
];

const nouns = [
  // Code
  { word: 'die Funktion', plural: '-en', english: 'function', category: 'Code', example: 'Die Funktion gibt einen Wert zurück.' },
  { word: 'die Variable', plural: '-n', english: 'variable', category: 'Code', example: 'Die Variable speichert den Zustand.' },
  { word: 'die Klasse', plural: '-n', english: 'class', category: 'Code', example: 'Die Klasse erbt von einer Basisklasse.' },
  { word: 'das Objekt', plural: '-e', english: 'object', category: 'Code', example: 'Das Objekt enthält Eigenschaften.' },
  { word: 'die Schnittstelle', plural: '-n', english: 'interface', category: 'Code', example: 'Die Schnittstelle definiert den Vertrag.' },
  { word: 'die Methode', plural: '-n', english: 'method', category: 'Code', example: 'Die Methode verarbeitet die Eingabe.' },
  { word: 'der Parameter', plural: '-', english: 'parameter', category: 'Code', example: 'Der Parameter ist optional.' },
  { word: 'der Rückgabewert', plural: '-e', english: 'return value', category: 'Code', example: 'Der Rückgabewert ist ein Array.' },
  { word: 'die Schleife', plural: '-n', english: 'loop', category: 'Code', example: 'Die Schleife iteriert über die Liste.' },
  { word: 'die Bedingung', plural: '-en', english: 'condition', category: 'Code', example: 'Die Bedingung prüft den Wert.' },
  { word: 'die Eigenschaft', plural: '-en', english: 'property', category: 'Code', example: 'Die Eigenschaft ist schreibgeschützt.' },
  { word: 'der Typ', plural: '-en', english: 'type', category: 'Code', example: 'Der Typ ist String.' },
  { word: 'die Konstante', plural: '-n', english: 'constant', category: 'Code', example: 'Die Konstante wird nicht verändert.' },
  { word: 'der Algorithmus', plural: 'Algorithmen', english: 'algorithm', category: 'Code', example: 'Der Algorithmus sortiert die Daten.' },
  { word: 'die Bibliothek', plural: '-en', english: 'library', category: 'Code', example: 'Die Bibliothek bietet viele Funktionen.' },
  { word: 'das Framework', plural: '-s', english: 'framework', category: 'Code', example: 'Das Framework vereinfacht die Entwicklung.' },
  { word: 'das Modul', plural: '-e', english: 'module', category: 'Code', example: 'Das Modul wird importiert.' },
  { word: 'die Komponente', plural: '-n', english: 'component', category: 'Code', example: 'Die Komponente rendert die UI.' },
  { word: 'der Fehler', plural: '-', english: 'error/bug', category: 'Code', example: 'Der Fehler tritt beim Login auf.' },
  { word: 'die Ausnahme', plural: '-n', english: 'exception', category: 'Code', example: 'Die Ausnahme wird abgefangen.' },

  // Infrastruktur
  { word: 'der Server', plural: '-', english: 'server', category: 'Infrastruktur', example: 'Der Server läuft auf Port 3000.' },
  { word: 'die Datenbank', plural: '-en', english: 'database', category: 'Infrastruktur', example: 'Die Datenbank speichert alle Einträge.' },
  { word: 'die Schicht', plural: '-en', english: 'layer/tier', category: 'Infrastruktur', example: 'Die Datenbankschicht ist abstrakt.' },
  { word: 'die Pipeline', plural: '-s', english: 'pipeline', category: 'Infrastruktur', example: 'Die Pipeline läuft automatisch.' },
  { word: 'der Container', plural: '-', english: 'container', category: 'Infrastruktur', example: 'Der Container läuft in Docker.' },
  { word: 'die Umgebung', plural: '-en', english: 'environment', category: 'Infrastruktur', example: 'Die Staging-Umgebung ist bereit.' },
  { word: 'das Netzwerk', plural: '-e', english: 'network', category: 'Infrastruktur', example: 'Das Netzwerk ist konfiguriert.' },
  { word: 'der Endpunkt', plural: '-e', english: 'endpoint', category: 'Infrastruktur', example: 'Der Endpunkt gibt JSON zurück.' },
  { word: 'die Cloud', plural: '-s', english: 'cloud', category: 'Infrastruktur', example: 'Wir hosten in der Cloud.' },
  { word: 'der Speicher', plural: '-', english: 'storage/memory', category: 'Infrastruktur', example: 'Der Speicher ist fast voll.' },

  // Prozess
  { word: 'die Anforderung', plural: '-en', english: 'requirement', category: 'Prozess', example: 'Die Anforderung ist definiert.' },
  { word: 'das Ticket', plural: '-s', english: 'ticket', category: 'Prozess', example: 'Das Ticket ist im Sprint.' },
  { word: 'der Sprint', plural: '-s', english: 'sprint', category: 'Prozess', example: 'Der Sprint dauert zwei Wochen.' },
  { word: 'das Meeting', plural: '-s', english: 'meeting', category: 'Prozess', example: 'Das Daily Meeting ist um 9 Uhr.' },
  { word: 'die Aufgabe', plural: '-n', english: 'task', category: 'Prozess', example: 'Die Aufgabe ist zugewiesen.' },
  { word: 'das Projekt', plural: '-e', english: 'project', category: 'Prozess', example: 'Das Projekt hat einen engen Zeitplan.' },
  { word: 'die Frist', plural: '-en', english: 'deadline', category: 'Prozess', example: 'Die Frist ist am Freitag.' },
  { word: 'der Meilenstein', plural: '-e', english: 'milestone', category: 'Prozess', example: 'Der Meilenstein wurde erreicht.' },
  { word: 'die Dokumentation', plural: '-en', english: 'documentation', category: 'Prozess', example: 'Die Dokumentation ist aktuell.' },
  { word: 'die Besprechung', plural: '-en', english: 'discussion/meeting', category: 'Prozess', example: 'Die Besprechung dauert 30 Minuten.' },

  // Technik (Technical)
  { word: 'die API', plural: '-s', english: 'API', category: 'Technik', example: 'Die API ist RESTful.' },
  { word: 'die Architektur', plural: '-en', english: 'architecture', category: 'Technik', example: 'Die Architektur ist Microservices-basiert.' },
  { word: 'das Design Pattern', plural: '-s', english: 'design pattern', category: 'Technik', example: 'Das Observer-Pattern ist nützlich.' },
  { word: 'die Abhängigkeit', plural: '-en', english: 'dependency', category: 'Technik', example: 'Die Abhängigkeit ist veraltet.' },
  { word: 'die Authentifizierung', plural: '-en', english: 'authentication', category: 'Technik', example: 'Die Authentifizierung nutzt JWT.' },
  { word: 'die Autorisierung', plural: '-en', english: 'authorization', category: 'Technik', example: 'Die Autorisierung prüft die Rolle.' },
  { word: 'das Protokoll', plural: '-e', english: 'protocol', category: 'Technik', example: 'HTTPS ist ein sicheres Protokoll.' },
  { word: 'die Middleware', plural: '-s', english: 'middleware', category: 'Technik', example: 'Die Middleware loggt Anfragen.' },
  { word: 'der Cache', plural: '-s', english: 'cache', category: 'Technik', example: 'Der Cache beschleunigt die Abfragen.' },
  { word: 'die Versionsverwaltung', plural: '-en', english: 'version control', category: 'Technik', example: 'Wir nutzen Git als Versionsverwaltung.' },

  // Sicherheit (Security)
  { word: 'die Sicherheit', plural: '-en', english: 'security', category: 'Sicherheit', example: 'Die Sicherheit hat höchste Priorität.' },
  { word: 'das Passwort', plural: '-wörter', english: 'password', category: 'Sicherheit', example: 'Das Passwort wird gehasht.' },
  { word: 'der Token', plural: '-', english: 'token', category: 'Sicherheit', example: 'Der Token läuft nach einer Stunde ab.' },
  { word: 'die Berechtigung', plural: '-en', english: 'permission', category: 'Sicherheit', example: 'Die Berechtigung wird geprüft.' },
  { word: 'die Verschlüsselung', plural: '-en', english: 'encryption', category: 'Sicherheit', example: 'Die Verschlüsselung ist AES-256.' },
  { word: 'die Schwachstelle', plural: '-n', english: 'vulnerability', category: 'Sicherheit', example: 'Die Schwachstelle wurde gepatcht.' },
  { word: 'der Zugriff', plural: '-e', english: 'access', category: 'Sicherheit', example: 'Der Zugriff ist beschränkt.' },
  { word: 'die Firewall', plural: '-s', english: 'firewall', category: 'Sicherheit', example: 'Die Firewall blockiert den Port.' },
  { word: 'das Zertifikat', plural: '-e', english: 'certificate', category: 'Sicherheit', example: 'Das SSL-Zertifikat ist gültig.' },
  { word: 'die Sicherung', plural: '-en', english: 'backup', category: 'Sicherheit', example: 'Die Sicherung läuft täglich.' },

  // UI
  { word: 'die Benutzeroberfläche', plural: '-n', english: 'user interface', category: 'UI', example: 'Die Benutzeroberfläche ist intuitiv.' },
  { word: 'das Layout', plural: '-s', english: 'layout', category: 'UI', example: 'Das Layout ist responsiv.' },
  { word: 'die Ansicht', plural: '-en', english: 'view', category: 'UI', example: 'Die Ansicht zeigt eine Tabelle.' },
  { word: 'der Stil', plural: '-e', english: 'style', category: 'UI', example: 'Der Stil ist dunkel.' },
  { word: 'das Formular', plural: '-e', english: 'form', category: 'UI', example: 'Das Formular validiert die Eingabe.' },
  { word: 'die Eingabe', plural: '-n', english: 'input', category: 'UI', example: 'Die Eingabe wird geprüft.' },
  { word: 'die Ausgabe', plural: '-n', english: 'output', category: 'UI', example: 'Die Ausgabe wird formatiert.' },
  { word: 'die Schaltfläche', plural: '-n', english: 'button', category: 'UI', example: 'Die Schaltfläche löst eine Aktion aus.' },
  { word: 'die Navigation', plural: '-en', english: 'navigation', category: 'UI', example: 'Die Navigation ist übersichtlich.' },
  { word: 'die Tabelle', plural: '-n', english: 'table', category: 'UI', example: 'Die Tabelle zeigt alle Verben.' },
];

const adjectives = [
  // Technik
  { word: 'skalierbar', english: 'scalable', opposite: 'nicht skalierbar', category: 'Technik', example: 'Das System ist skalierbar.' },
  { word: 'performant', english: 'performant', opposite: 'langsam', category: 'Technik', example: 'Die Lösung ist performant.' },
  { word: 'responsiv', english: 'responsive', opposite: 'starr', category: 'Technik', example: 'Das Layout ist responsiv.' },
  { word: 'asynchron', english: 'asynchronous', opposite: 'synchron', category: 'Technik', example: 'Der Aufruf ist asynchron.' },
  { word: 'synchron', english: 'synchronous', opposite: 'asynchron', category: 'Technik', example: 'Die Operation ist synchron.' },
  { word: 'statisch', english: 'static', opposite: 'dynamisch', category: 'Technik', example: 'Die Methode ist statisch.' },
  { word: 'dynamisch', english: 'dynamic', opposite: 'statisch', category: 'Technik', example: 'Die Seite wird dynamisch geladen.' },
  { word: 'modular', english: 'modular', opposite: 'monolithisch', category: 'Technik', example: 'Die Architektur ist modular.' },
  { word: 'monolithisch', english: 'monolithic', opposite: 'modular', category: 'Technik', example: 'Die alte App ist monolithisch.' },
  { word: 'kompatibel', english: 'compatible', opposite: 'inkompatibel', category: 'Technik', example: 'Die Versionen sind kompatibel.' },
  { word: 'plattformunabhängig', english: 'platform-independent', opposite: 'plattformabhängig', category: 'Technik', example: 'Java ist plattformunabhängig.' },
  { word: 'robust', english: 'robust', opposite: 'fragil', category: 'Technik', example: 'Die Fehlerbehandlung ist robust.' },
  { word: 'verschlüsselt', english: 'encrypted', opposite: 'unverschlüsselt', category: 'Technik', example: 'Die Verbindung ist verschlüsselt.' },
  { word: 'zustandslos', english: 'stateless', opposite: 'zustandsbehaftet', category: 'Technik', example: 'Die API ist zustandslos.' },
  { word: 'zustandsbehaftet', english: 'stateful', opposite: 'zustandslos', category: 'Technik', example: 'Die Komponente ist zustandsbehaftet.' },

  // Qualität
  { word: 'zuverlässig', english: 'reliable', opposite: 'unzuverlässig', category: 'Qualität', example: 'Der Service ist zuverlässig.' },
  { word: 'wartbar', english: 'maintainable', opposite: 'unwartbar', category: 'Qualität', example: 'Der Code ist gut wartbar.' },
  { word: 'lesbar', english: 'readable', opposite: 'unlesbar', category: 'Qualität', example: 'Der Code ist lesbar.' },
  { word: 'testbar', english: 'testable', opposite: 'schwer testbar', category: 'Qualität', example: 'Die Funktion ist leicht testbar.' },
  { word: 'wiederverwendbar', english: 'reusable', opposite: 'einmalig', category: 'Qualität', example: 'Die Komponente ist wiederverwendbar.' },
  { word: 'fehlerfrei', english: 'bug-free', opposite: 'fehlerhaft', category: 'Qualität', example: 'Der Code ist fehlerfrei.' },
  { word: 'fehlerhaft', english: 'buggy/faulty', opposite: 'fehlerfrei', category: 'Qualität', example: 'Die Version ist fehlerhaft.' },
  { word: 'effizient', english: 'efficient', opposite: 'ineffizient', category: 'Qualität', example: 'Der Algorithmus ist effizient.' },
  { word: 'stabil', english: 'stable', opposite: 'instabil', category: 'Qualität', example: 'Das Release ist stabil.' },
  { word: 'veraltet', english: 'deprecated/outdated', opposite: 'aktuell', category: 'Qualität', example: 'Die Methode ist veraltet.' },
  { word: 'aktuell', english: 'current/up-to-date', opposite: 'veraltet', category: 'Qualität', example: 'Die Dokumentation ist aktuell.' },
  { word: 'sauber', english: 'clean', opposite: 'unsauber', category: 'Qualität', example: 'Der Code ist sauber.' },
  { word: 'komplex', english: 'complex', opposite: 'einfach', category: 'Qualität', example: 'Die Logik ist komplex.' },
  { word: 'einfach', english: 'simple', opposite: 'komplex', category: 'Qualität', example: 'Die Lösung ist einfach.' },
  { word: 'sicher', english: 'secure/safe', opposite: 'unsicher', category: 'Qualität', example: 'Die Verbindung ist sicher.' },

  // Prozess / Zusammenarbeit
  { word: 'agil', english: 'agile', opposite: 'wasserfall-basiert', category: 'Prozess', example: 'Wir arbeiten agil.' },
  { word: 'iterativ', english: 'iterative', opposite: 'einmalig', category: 'Prozess', example: 'Der Prozess ist iterativ.' },
  { word: 'produktiv', english: 'productive', opposite: 'unproduktiv', category: 'Prozess', example: 'Das Team ist sehr produktiv.' },
  { word: 'dringend', english: 'urgent', opposite: 'nicht dringend', category: 'Prozess', example: 'Der Bugfix ist dringend.' },
  { word: 'optional', english: 'optional', opposite: 'erforderlich', category: 'Prozess', example: 'Der Parameter ist optional.' },
  { word: 'erforderlich', english: 'required', opposite: 'optional', category: 'Prozess', example: 'Das Feld ist erforderlich.' },
  { word: 'verfügbar', english: 'available', opposite: 'nicht verfügbar', category: 'Prozess', example: 'Der Service ist verfügbar.' },
  { word: 'blockiert', english: 'blocked', opposite: 'frei', category: 'Prozess', example: 'Das Ticket ist blockiert.' },
  { word: 'abgeschlossen', english: 'completed', opposite: 'offen', category: 'Prozess', example: 'Die Aufgabe ist abgeschlossen.' },
  { word: 'offen', english: 'open', opposite: 'abgeschlossen', category: 'Prozess', example: 'Das Issue ist noch offen.' },

  // Daten
  { word: 'persistent', english: 'persistent', opposite: 'flüchtig', category: 'Daten', example: 'Die Daten sind persistent.' },
  { word: 'flüchtig', english: 'volatile/transient', opposite: 'persistent', category: 'Daten', example: 'Der Cache-Eintrag ist flüchtig.' },
  { word: 'unveränderlich', english: 'immutable', opposite: 'veränderlich', category: 'Daten', example: 'Das Objekt ist unveränderlich.' },
  { word: 'veränderlich', english: 'mutable', opposite: 'unveränderlich', category: 'Daten', example: 'Die Variable ist veränderlich.' },
  { word: 'sortiert', english: 'sorted', opposite: 'unsortiert', category: 'Daten', example: 'Die Liste ist sortiert.' },
  { word: 'eindeutig', english: 'unique', opposite: 'dupliziert', category: 'Daten', example: 'Der Schlüssel ist eindeutig.' },
  { word: 'gültig', english: 'valid', opposite: 'ungültig', category: 'Daten', example: 'Die Eingabe ist gültig.' },
  { word: 'ungültig', english: 'invalid', opposite: 'gültig', category: 'Daten', example: 'Das Token ist ungültig.' },
  { word: 'leer', english: 'empty', opposite: 'voll', category: 'Daten', example: 'Das Array ist leer.' },
  { word: 'typsicher', english: 'type-safe', opposite: 'nicht typsicher', category: 'Daten', example: 'TypeScript ist typsicher.' },

  // Allgemein
  { word: 'wichtig', english: 'important', opposite: 'unwichtig', category: 'Allgemein', example: 'Die Aufgabe ist wichtig.' },
  { word: 'möglich', english: 'possible', opposite: 'unmöglich', category: 'Allgemein', example: 'Das ist technisch möglich.' },
  { word: 'notwendig', english: 'necessary', opposite: 'unnötig', category: 'Allgemein', example: 'Das Refactoring ist notwendig.' },
  { word: 'bereit', english: 'ready', opposite: 'nicht bereit', category: 'Allgemein', example: 'Das Feature ist bereit zum Deployen.' },
  { word: 'neu', english: 'new', opposite: 'alt', category: 'Allgemein', example: 'Das neue Feature ist live.' },
  { word: 'schnell', english: 'fast', opposite: 'langsam', category: 'Allgemein', example: 'Die Abfrage ist schnell.' },
  { word: 'langsam', english: 'slow', opposite: 'schnell', category: 'Allgemein', example: 'Die Seite lädt langsam.' },
  { word: 'groß', english: 'large/big', opposite: 'klein', category: 'Allgemein', example: 'Die Datei ist sehr groß.' },
  { word: 'klein', english: 'small', opposite: 'groß', category: 'Allgemein', example: 'Der Bugfix ist klein.' },
  { word: 'vollständig', english: 'complete', opposite: 'unvollständig', category: 'Allgemein', example: 'Die Migration ist vollständig.' },
];

const sentences = [
  // Entwicklung
  { german: 'Ich entwickle eine REST-API mit Express und TypeScript.', english: 'I am developing a REST API with Express and TypeScript.', verbUsed: 'entwickeln', nounUsed: 'die API', adjUsed: '', category: 'Entwicklung' },
  { german: 'Wir implementieren das neue Feature im aktuellen Sprint.', english: 'We are implementing the new feature in the current sprint.', verbUsed: 'implementieren', nounUsed: 'der Sprint', adjUsed: 'aktuell', category: 'Entwicklung' },
  { german: 'Ich habe den Code refaktorisiert, um die Lesbarkeit zu verbessern.', english: 'I refactored the code to improve readability.', verbUsed: 'refaktorisieren', nounUsed: '', adjUsed: 'lesbar', category: 'Entwicklung' },
  { german: 'Die Komponente rendert die Daten dynamisch.', english: 'The component renders the data dynamically.', verbUsed: 'rendern', nounUsed: 'die Komponente', adjUsed: 'dynamisch', category: 'Entwicklung' },
  { german: 'Ich parse die JSON-Antwort und validiere die Daten.', english: 'I parse the JSON response and validate the data.', verbUsed: 'parsen', nounUsed: '', adjUsed: 'gültig', category: 'Entwicklung' },
  { german: 'Wir nutzen Git als Versionsverwaltung für das Projekt.', english: 'We use Git as version control for the project.', verbUsed: 'versionieren', nounUsed: 'die Versionsverwaltung', adjUsed: '', category: 'Entwicklung' },
  { german: 'Ich merge den Feature-Branch in den Hauptbranch.', english: 'I merge the feature branch into the main branch.', verbUsed: 'mergen', nounUsed: '', adjUsed: '', category: 'Entwicklung' },
  { german: 'Das Framework vereinfacht die Entwicklung erheblich.', english: 'The framework simplifies development significantly.', verbUsed: 'vereinfachen', nounUsed: 'das Framework', adjUsed: 'einfach', category: 'Entwicklung' },
  { german: 'Ich erstelle wiederverwendbare Komponenten in Angular.', english: 'I create reusable components in Angular.', verbUsed: 'erstellen', nounUsed: 'die Komponente', adjUsed: 'wiederverwendbar', category: 'Entwicklung' },
  { german: 'Die Bibliothek bietet viele nützliche Funktionen.', english: 'The library offers many useful functions.', verbUsed: '', nounUsed: 'die Bibliothek', adjUsed: '', category: 'Entwicklung' },

  // Testing
  { german: 'Ich schreibe Unit-Tests für jede neue Funktion.', english: 'I write unit tests for every new function.', verbUsed: 'testen', nounUsed: 'die Funktion', adjUsed: 'testbar', category: 'Testing' },
  { german: 'Die Tests decken 90 Prozent des Codes ab.', english: 'The tests cover 90 percent of the code.', verbUsed: 'abdecken', nounUsed: '', adjUsed: '', category: 'Testing' },
  { german: 'Ich kann den Bug in der Staging-Umgebung reproduzieren.', english: 'I can reproduce the bug in the staging environment.', verbUsed: 'reproduzieren', nounUsed: 'die Umgebung', adjUsed: '', category: 'Testing' },
  { german: 'Alle Tests haben bestanden, das Release ist stabil.', english: 'All tests passed, the release is stable.', verbUsed: 'bestehen', nounUsed: '', adjUsed: 'stabil', category: 'Testing' },
  { german: 'Wir mocken die externe API in den Integrationstests.', english: 'We mock the external API in the integration tests.', verbUsed: 'mocken', nounUsed: 'die API', adjUsed: '', category: 'Testing' },
  { german: 'Der Fehler ist behoben und verifiziert.', english: 'The bug is fixed and verified.', verbUsed: 'beheben', nounUsed: 'der Fehler', adjUsed: 'fehlerfrei', category: 'Testing' },
  { german: 'Ich analysiere die Logdateien, um den Fehler zu finden.', english: 'I analyze the log files to find the error.', verbUsed: 'analysieren', nounUsed: 'der Fehler', adjUsed: '', category: 'Testing' },
  { german: 'Die Fehlerbehandlung ist robust und zuverlässig.', english: 'The error handling is robust and reliable.', verbUsed: '', nounUsed: '', adjUsed: 'robust', category: 'Testing' },
  { german: 'Ich messe die Antwortzeit des Endpunkts.', english: 'I measure the response time of the endpoint.', verbUsed: 'messen', nounUsed: 'der Endpunkt', adjUsed: 'performant', category: 'Testing' },
  { german: 'Wir überwachen die Systemleistung in Echtzeit.', english: 'We monitor system performance in real time.', verbUsed: 'überwachen', nounUsed: '', adjUsed: 'zuverlässig', category: 'Testing' },

  // Deployment
  { german: 'Ich stelle die Anwendung auf AWS bereit.', english: 'I deploy the application on AWS.', verbUsed: 'bereitstellen', nounUsed: 'die Cloud', adjUsed: 'skalierbar', category: 'Deployment' },
  { german: 'Die CI/CD-Pipeline läuft automatisch nach jedem Push.', english: 'The CI/CD pipeline runs automatically after each push.', verbUsed: 'einrichten', nounUsed: 'die Pipeline', adjUsed: '', category: 'Deployment' },
  { german: 'Ich containerisiere die Anwendung mit Docker.', english: 'I containerize the application with Docker.', verbUsed: 'containerisieren', nounUsed: 'der Container', adjUsed: 'modular', category: 'Deployment' },
  { german: 'Wir skalieren die Infrastruktur horizontal.', english: 'We scale the infrastructure horizontally.', verbUsed: 'skalieren', nounUsed: '', adjUsed: 'skalierbar', category: 'Deployment' },
  { german: 'Ich sichere die Datenbank täglich automatisch.', english: 'I back up the database automatically every day.', verbUsed: 'sichern', nounUsed: 'die Datenbank', adjUsed: 'zuverlässig', category: 'Deployment' },
  { german: 'Wir migrieren von einer lokalen Umgebung zur Cloud.', english: 'We are migrating from a local environment to the cloud.', verbUsed: 'migrieren', nounUsed: 'die Umgebung', adjUsed: '', category: 'Deployment' },
  { german: 'Ich richte die Produktionsumgebung ein.', english: 'I am setting up the production environment.', verbUsed: 'einrichten', nounUsed: 'die Umgebung', adjUsed: 'bereit', category: 'Deployment' },
  { german: 'Wir veröffentlichen Version 3.0 nächste Woche.', english: 'We release version 3.0 next week.', verbUsed: 'veröffentlichen', nounUsed: '', adjUsed: 'neu', category: 'Deployment' },

  // Datenbank
  { german: 'Ich frage die Datenbank mit einer aggregierten Pipeline ab.', english: 'I query the database with an aggregation pipeline.', verbUsed: 'abfragen', nounUsed: 'die Datenbank', adjUsed: 'effizient', category: 'Datenbank' },
  { german: 'Die Daten werden persistent in MongoDB gespeichert.', english: 'The data is stored persistently in MongoDB.', verbUsed: 'speichern', nounUsed: 'die Datenbank', adjUsed: 'persistent', category: 'Datenbank' },
  { german: 'Ich verschlüssele alle sensiblen Daten vor dem Speichern.', english: 'I encrypt all sensitive data before storing.', verbUsed: 'verschlüsseln', nounUsed: '', adjUsed: 'verschlüsselt', category: 'Datenbank' },
  { german: 'Der Index beschleunigt die Abfrage erheblich.', english: 'The index significantly speeds up the query.', verbUsed: 'indizieren', nounUsed: '', adjUsed: 'schnell', category: 'Datenbank' },
  { german: 'Wir cachen häufig abgerufene Daten mit Redis.', english: 'We cache frequently fetched data with Redis.', verbUsed: 'cachen', nounUsed: 'der Cache', adjUsed: 'performant', category: 'Datenbank' },
  { german: 'Ich sortiere die Ergebnisse nach dem Erstellungsdatum.', english: 'I sort the results by creation date.', verbUsed: 'sortieren', nounUsed: '', adjUsed: 'sortiert', category: 'Datenbank' },
  { german: 'Die Datenstruktur ist unveränderlich und typsicher.', english: 'The data structure is immutable and type-safe.', verbUsed: '', nounUsed: '', adjUsed: 'unveränderlich', category: 'Datenbank' },

  // Allgemein / Teamwork
  { german: 'Wir besprechen die Architektur im nächsten Meeting.', english: 'We will discuss the architecture in the next meeting.', verbUsed: 'besprechen', nounUsed: 'die Architektur', adjUsed: '', category: 'Allgemein' },
  { german: 'Ich schätze den Aufwand auf etwa fünf Story Points.', english: 'I estimate the effort at about five story points.', verbUsed: 'schätzen', nounUsed: '', adjUsed: '', category: 'Allgemein' },
  { german: 'Wir planen den Sprint mit dem gesamten Team.', english: 'We plan the sprint with the entire team.', verbUsed: 'planen', nounUsed: 'der Sprint', adjUsed: 'agil', category: 'Allgemein' },
  { german: 'Ich dokumentiere die API-Endpunkte mit Swagger.', english: 'I document the API endpoints with Swagger.', verbUsed: 'dokumentieren', nounUsed: 'die Dokumentation', adjUsed: 'vollständig', category: 'Allgemein' },
  { german: 'Das Ticket ist blockiert, weil die Abhängigkeit fehlt.', english: 'The ticket is blocked because the dependency is missing.', verbUsed: '', nounUsed: 'das Ticket', adjUsed: 'blockiert', category: 'Allgemein' },
  { german: 'Ich reviewe den Pull Request meines Kollegen.', english: 'I review my colleague\'s pull request.', verbUsed: 'reviewen', nounUsed: '', adjUsed: 'sauber', category: 'Allgemein' },
  { german: 'Die Aufgabe ist erforderlich für den Meilenstein.', english: 'The task is required for the milestone.', verbUsed: '', nounUsed: 'die Aufgabe', adjUsed: 'erforderlich', category: 'Allgemein' },
  { german: 'Wir arbeiten agil nach Scrum-Methodik.', english: 'We work in an agile manner following Scrum methodology.', verbUsed: 'zusammenarbeiten', nounUsed: '', adjUsed: 'agil', category: 'Allgemein' },
  { german: 'Ich passe die Konfiguration an die neue Umgebung an.', english: 'I adapt the configuration to the new environment.', verbUsed: 'anpassen', nounUsed: 'die Umgebung', adjUsed: 'kompatibel', category: 'Allgemein' },
  { german: 'Ich arbeite mich in das bestehende Projekt ein.', english: 'I am familiarizing myself with the existing project.', verbUsed: 'einarbeiten', nounUsed: 'das Projekt', adjUsed: '', category: 'Allgemein' },
];

const refemittel = [
  { phrase: 'Meiner Meinung nach ...', english: 'In my opinion ...', useCase: 'Eigene Meinung ausdrücken', category: 'Meinung' },
  { phrase: 'Ich denke, dass ...', english: 'I think that ...', useCase: 'Einschätzung geben', category: 'Meinung' },
  { phrase: 'Aus meiner Sicht ...', english: 'From my perspective ...', useCase: 'Perspektive darstellen', category: 'Meinung' },
  { phrase: 'Ich würde vorschlagen, dass ...', english: 'I would suggest that ...', useCase: 'Vorschlag machen', category: 'Vorschlag' },
  { phrase: 'Eine mögliche Lösung wäre ...', english: 'One possible solution would be ...', useCase: 'Lösung anbieten', category: 'Vorschlag' },
  { phrase: 'Wir könnten auch ...', english: 'We could also ...', useCase: 'Alternative nennen', category: 'Vorschlag' },
  { phrase: 'Könnten Sie das bitte genauer erklären?', english: 'Could you explain that in more detail, please?', useCase: 'Nachfragen', category: 'Rückfrage' },
  { phrase: 'Habe ich Sie richtig verstanden, dass ...?', english: 'Did I understand you correctly that ...?', useCase: 'Verständnis prüfen', category: 'Rückfrage' },
  { phrase: 'Darf ich kurz nachfragen?', english: 'May I quickly ask a follow-up?', useCase: 'Höflich unterbrechen', category: 'Rückfrage' },
  { phrase: 'Ich stimme Ihnen zu.', english: 'I agree with you.', useCase: 'Zustimmung', category: 'Diskussion' },
  { phrase: 'Da bin ich anderer Meinung.', english: 'I have a different opinion on that.', useCase: 'Höflich widersprechen', category: 'Diskussion' },
  { phrase: 'Das hängt vom Anwendungsfall ab.', english: 'That depends on the use case.', useCase: 'Abwägung', category: 'Diskussion' },
  { phrase: 'Lassen Sie mich das kurz zusammenfassen.', english: 'Let me summarize that briefly.', useCase: 'Zusammenfassung', category: 'Moderation' },
  { phrase: 'Wenn ich das zusammenfasse ...', english: 'If I summarize that ...', useCase: 'Zwischenfazit', category: 'Moderation' },
  { phrase: 'Kommen wir zum nächsten Punkt.', english: 'Let us move to the next point.', useCase: 'Thema wechseln', category: 'Moderation' },
  { phrase: 'Ich habe Erfahrung mit ...', english: 'I have experience with ...', useCase: 'Erfahrung darstellen', category: 'Interview' },
  { phrase: 'In meinem letzten Projekt habe ich ...', english: 'In my last project, I ...', useCase: 'Projektbeispiel geben', category: 'Interview' },
  { phrase: 'Ich bin verantwortlich für ...', english: 'I am responsible for ...', useCase: 'Rolle erklären', category: 'Interview' },
  { phrase: 'Vielen Dank für Ihre Zeit.', english: 'Thank you very much for your time.', useCase: 'Höflicher Abschluss', category: 'Abschluss' },
  { phrase: 'Ich freue mich auf Ihre Rückmeldung.', english: 'I look forward to your feedback.', useCase: 'Abschlussformulierung', category: 'Abschluss' },
];

async function seed() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/deutsch_trainer';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  // Upsert verbs
  for (const v of verbs) {
    await Verb.findOneAndUpdate(
      { infinitiv: v.infinitiv },
      { $setOnInsert: { practiced: false, lastPracticed: null }, ...v },
      { upsert: true, new: true }
    );
  }
  console.log(`Seeded ${verbs.length} verbs`);

  // Upsert nouns
  for (const n of nouns) {
    await Noun.findOneAndUpdate(
      { word: n.word },
      { $setOnInsert: { practiced: false, lastPracticed: null }, ...n },
      { upsert: true, new: true }
    );
  }
  console.log(`Seeded ${nouns.length} nouns`);

  // Upsert adjectives
  for (const a of adjectives) {
    await Adjective.findOneAndUpdate(
      { word: a.word },
      { $setOnInsert: { practiced: false, lastPracticed: null }, ...a },
      { upsert: true, new: true }
    );
  }
  console.log(`Seeded ${adjectives.length} adjectives`);

  // Upsert sentences
  for (const s of sentences) {
    await Sentence.findOneAndUpdate(
      { german: s.german },
      { $setOnInsert: { practiced: false, lastPracticed: null }, ...s },
      { upsert: true, new: true }
    );
  }
  console.log(`Seeded ${sentences.length} sentences`);

  // Upsert refemittel
  for (const r of refemittel) {
    await Refemittel.findOneAndUpdate(
      { phrase: r.phrase },
      { $setOnInsert: { practiced: false, lastPracticed: null }, ...r },
      { upsert: true, new: true }
    );
  }
  console.log(`Seeded ${refemittel.length} refemittel`);

  await mongoose.disconnect();
  console.log('Seed complete!');
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
