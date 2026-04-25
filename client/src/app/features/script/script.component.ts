import { Component, signal } from '@angular/core';

interface ScriptItem {
  title: string;
  subtitle: string;
  text: string;
  tip?: string;
}

interface Phase {
  name: string;
  items: ScriptItem[];
}

const PHASES: Phase[] = [
  {
    name: 'Phase 1 — Smalltalk & Fragen',
    items: [
      {
        title: 'Begrüßung',
        subtitle: 'Erster Eindruck',
        text: `Guten Tag, vielen Dank für die Einladung zum Gespräch. Ich freue mich sehr, hier zu sein.

Ja, ich habe gut hergefunden, vielen Dank. Die Anfahrt war angenehm.

Mir geht es sehr gut, danke der Nachfrage. Ich bin gespannt auf unser Gespräch.`,
        tip: 'Lächle, sei entspannt, gib einen festen Händedruck.'
      },
      {
        title: 'Smalltalk-Themen',
        subtitle: 'Lockere Gesprächsthemen',
        text: `Das Büro ist sehr schön. Seit wann sind Sie an diesem Standort?

Ich habe gesehen, dass Ihr Unternehmen kürzlich [Projekt/Nachricht] veröffentlicht hat. Das fand ich sehr interessant.

Arbeiten die meisten Mitarbeiter vor Ort oder gibt es auch Remote-Möglichkeiten?`,
        tip: 'Zeige echtes Interesse am Unternehmen.'
      },
      {
        title: 'Typische Fragen',
        subtitle: 'Vorbereitung auf häufige Fragen',
        text: `"Warum möchten Sie bei uns arbeiten?"
→ Ich bin begeistert von Ihrer Technologie und Unternehmenskultur. Ich möchte mein Wissen in einem innovativen Umfeld einbringen und weiterentwickeln.

"Was sind Ihre Stärken?"
→ Ich bin sehr lernfähig, arbeite strukturiert und kann gut im Team kommunizieren. Ich bringe eine starke Problemlösungskompetenz mit.

"Wo sehen Sie sich in 5 Jahren?"
→ Ich möchte mich zum Senior Developer entwickeln und mehr Verantwortung in der Architekturentscheidung übernehmen.`
      }
    ]
  },
  {
    name: 'Phase 2 — Selbstvorstellung',
    items: [
      {
        title: 'Persönlicher Hintergrund',
        subtitle: 'Teil 1: Wer bin ich?',
        text: `Mein Name ist [Name]. Ich komme ursprünglich aus Ägypten und lebe seit [Zeitraum] in Deutschland.

Ich habe mein Studium in Informatik / Software Engineering abgeschlossen und interessiere mich besonders für Webentwicklung und moderne Softwarearchitektur.`,
      },
      {
        title: 'Technische Erfahrung',
        subtitle: 'Teil 2: Was kann ich?',
        text: `Ich habe Erfahrung mit dem MEAN-Stack: MongoDB, Express, Angular und Node.js.

Außerdem arbeite ich mit TypeScript, REST-APIs, Git und CI/CD-Pipelines.

In meinen Projekten habe ich skalierbare Webanwendungen entwickelt und dabei auf Clean Code und Testbarkeit geachtet.`,
        tip: 'Konkrete Technologien nennen, die in der Stellenausschreibung stehen.'
      },
      {
        title: 'Projekterfahrung',
        subtitle: 'Teil 3: Was habe ich gemacht?',
        text: `In einem meiner letzten Projekte habe ich eine vollständige Webanwendung mit Angular und Node.js entwickelt.

Das Projekt umfasste eine REST-API mit Express, eine MongoDB-Datenbank und ein responsives Frontend.

Ich war verantwortlich für die gesamte Architektur, von der Datenbankmodellierung bis zum Deployment.`,
      },
      {
        title: 'Deutschkenntnisse',
        subtitle: 'Teil 4: Sprache',
        text: `Meine Deutschkenntnisse sind auf dem Niveau [B1/B2]. Ich arbeite aktiv daran, mein technisches Deutsch zu verbessern.

Ich kann an Meetings teilnehmen, technische Dokumentation lesen und mich mit Kollegen auf Deutsch austauschen.

Ich bin motiviert, meine Sprachkenntnisse im Berufsalltag weiter auszubauen.`,
        tip: 'Ehrlich sein über das Sprachniveau, Lernbereitschaft betonen.'
      },
      {
        title: 'Motivation',
        subtitle: 'Teil 5: Warum diese Stelle?',
        text: `Diese Stelle interessiert mich besonders, weil sie meine technischen Fähigkeiten mit der Möglichkeit verbindet, in einem professionellen deutschsprachigen Umfeld zu arbeiten.

Ich schätze die Unternehmenskultur und die technischen Herausforderungen, die diese Position bietet.

Ich bin überzeugt, dass ich mit meinen Kenntnissen einen wertvollen Beitrag leisten kann.`,
      }
    ]
  },
  {
    name: 'Phase 3 — CEO-Rückfragen',
    items: [
      {
        title: 'Teamstruktur',
        subtitle: 'Frage über das Team',
        text: `Wie ist das Entwicklerteam aufgebaut? Wie viele Entwickler arbeiten im Team?

Gibt es feste Zuständigkeiten oder arbeiten alle Full-Stack?`,
      },
      {
        title: 'Tech-Stack',
        subtitle: 'Frage über Technologie',
        text: `Welche Technologien und Frameworks setzen Sie aktuell ein?

Planen Sie in naher Zukunft Änderungen am Tech-Stack?`,
      },
      {
        title: 'Entwicklungsprozess',
        subtitle: 'Frage über Arbeitsweise',
        text: `Wie sieht Ihr Entwicklungsprozess aus? Arbeiten Sie agil nach Scrum oder Kanban?

Wie oft deployen Sie? Haben Sie eine CI/CD-Pipeline?`,
      },
      {
        title: 'Einarbeitung',
        subtitle: 'Frage über Onboarding',
        text: `Wie sieht der Einarbeitungsprozess für neue Entwickler aus?

Gibt es einen Mentor oder Buddy, der mich in den ersten Wochen unterstützt?`,
      },
      {
        title: 'Weiterbildung',
        subtitle: 'Frage über Entwicklungsmöglichkeiten',
        text: `Welche Möglichkeiten zur Weiterbildung gibt es?

Unterstützen Sie Konferenzbesuche oder Zertifizierungen?`,
      },
      {
        title: 'Nächste Schritte',
        subtitle: 'Frage über den Prozess',
        text: `Was sind die nächsten Schritte im Bewerbungsprozess?

Bis wann kann ich mit einer Rückmeldung rechnen?`,
      }
    ]
  },
  {
    name: 'Phase 4 — Abschluss',
    items: [
      {
        title: 'Verabschiedung',
        subtitle: 'Professioneller Abschluss',
        text: `Vielen Dank für das sehr informative Gespräch. Ich habe einen tollen Eindruck vom Team und der Arbeitsweise gewonnen.

Ich bin sehr motiviert und freue mich auf die Möglichkeit, Teil Ihres Teams zu werden.

Ich wünsche Ihnen noch einen schönen Tag. Auf Wiedersehen!`,
        tip: 'Nochmals Begeisterung zeigen, fester Händedruck, Blickkontakt.'
      }
    ]
  }
];

@Component({
  selector: 'app-script',
  standalone: true,
  template: `
    <h1 class="page-title">Interview Script</h1>
    <p class="page-sub">Dein Leitfaden für das Vorstellungsgespräch</p>

    <div class="phase-tabs">
      @for (phase of phases; track phase.name; let i = $index) {
        <button class="phase-tab" [class.active]="activePhase() === i" (click)="activePhase.set(i)">
          {{ phase.name }}
        </button>
      }
    </div>

    <div class="accordion">
      @for (item of phases[activePhase()].items; track item.title; let i = $index) {
        <div class="acc-item" [class.open]="openItem() === i">
          <button class="acc-header" (click)="toggleItem(i)">
            <div>
              <span class="acc-title">{{ item.title }}</span>
              <span class="acc-sub">{{ item.subtitle }}</span>
            </div>
            <span class="acc-arrow">{{ openItem() === i ? '−' : '+' }}</span>
          </button>
          @if (openItem() === i) {
            <div class="acc-body">
              <pre class="script-text">{{ item.text }}</pre>
              @if (item.tip) {
                <div class="tip">{{ item.tip }}</div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './script.component.css'
})
export class ScriptComponent {
  phases = PHASES;
  activePhase = signal(0);
  openItem = signal(0);

  toggleItem(i: number) {
    this.openItem.set(this.openItem() === i ? -1 : i);
  }
}
