import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  suggestions?: string[];
}

@Component({
  selector: 'app-chatbot',
  template: `
    <!-- Floating button -->
    <button
      mat-fab
      class="chat-fab"
      color="primary"
      (click)="toggleChat()"
      [matTooltip]="isOpen ? 'Close' : 'OleaCare Assistant'"
      matTooltipPosition="left">
      <mat-icon>{{ isOpen ? 'close' : 'eco' }}</mat-icon>
      <span class="unread-dot" *ngIf="!isOpen && hasNewMessage"></span>
    </button>

    <!-- Chat window -->
    <div class="chat-window" [@slideInOut]="isOpen ? 'open' : 'closed'">
      <!-- Header -->
      <div class="chat-header">
        <div class="bot-avatar">
          <mat-icon>eco</mat-icon>
        </div>
        <div class="bot-info">
          <span class="bot-name">OleaCare Assistant</span>
          <span class="bot-status">
            <span class="status-dot"></span> Online
          </span>
        </div>
        <button mat-icon-button (click)="toggleChat()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Messages -->
      <div class="messages-container" #messagesContainer>
        <div
          *ngFor="let msg of messages"
          class="message-row"
          [class.user-row]="msg.sender === 'user'"
          [class.bot-row]="msg.sender === 'bot'">

          <div class="bot-avatar-small" *ngIf="msg.sender === 'bot'">
            <mat-icon>eco</mat-icon>
          </div>

          <div class="bubble-wrapper">
            <div class="message-bubble" [class.user-bubble]="msg.sender === 'user'" [class.bot-bubble]="msg.sender === 'bot'">
              <span [innerHTML]="msg.text"></span>
            </div>
            <div class="message-time">{{ msg.timestamp | date:'HH:mm' }}</div>

            <!-- Suggestions rapides -->
            <div class="suggestions" *ngIf="msg.suggestions && msg.sender === 'bot'">
              <button
                *ngFor="let s of msg.suggestions"
                mat-stroked-button
                class="suggestion-btn"
                (click)="sendMessage(s)">
                {{ s }}
              </button>
            </div>
          </div>
        </div>

        <!-- Typing indicator -->
        <div class="message-row bot-row" *ngIf="isTyping">
          <div class="bot-avatar-small"><mat-icon>spa</mat-icon></div>
          <div class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="chat-input-area">
        <mat-form-field appearance="outline" class="input-field">
          <input
            matInput
            [(ngModel)]="userInput"
            placeholder="Ask your question..."
            (keydown.enter)="sendMessage()"
            [disabled]="isTyping">
        </mat-form-field>
        <button
          mat-icon-button
          color="primary"
          (click)="sendMessage()"
          [disabled]="!userInput.trim() || isTyping"
          class="send-btn">
          <mat-icon>send</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 1000;
    }

    .chat-fab {
      position: relative;
      background: linear-gradient(135deg, #4d6d2d, #7a9252) !important;
      color: white !important;
      box-shadow: 0 10px 30px rgba(77, 109, 45, 0.28);
    }

    .unread-dot {
      position: absolute;
      top: 4px; right: 4px;
      width: 12px; height: 12px;
      background: #f44336;
      border-radius: 50%;
      border: 2px solid white;
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.3); }
      100% { transform: scale(1); }
    }

    .chat-window {
      position: absolute;
      bottom: 72px;
      right: 0;
      width: 380px;
      height: 520px;
      background: #f7f9f0;
      border-radius: 20px;
      box-shadow: 0 18px 52px rgba(0,0,0,0.16);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* Header */
    .chat-header {
      background: linear-gradient(135deg, #4f6d39 0%, #7f9d5c 100%);
      color: white;
      padding: 16px 18px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .bot-avatar {
      width: 42px; height: 42px;
      background: rgba(255,255,255,0.28);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 22px; color: #ffffff; }
    }

    .bot-info { flex: 1; }
    .bot-name { display: block; font-weight: 600; font-size: 15px; }
    .bot-status { display: flex; align-items: center; gap: 6px; font-size: 12px; opacity: 0.85; }
    .status-dot {
      width: 8px; height: 8px;
      background: #4caf50;
      border-radius: 50%;
      display: inline-block;
      box-shadow: 0 0 6px #4caf50;
    }

    .close-btn { color: white !important; }

    /* Messages */
    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 18px 14px;
      background: #eef1e6;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .message-row {
      display: flex;
      align-items: flex-end;
      gap: 8px;
    }

    .user-row { flex-direction: row-reverse; }

    .bot-avatar-small {
      width: 28px; height: 28px;
      background: linear-gradient(135deg, #4d6d2d, #7a9252);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      mat-icon { font-size: 16px; color: white; width: 16px; height: 16px; }
    }

    .bubble-wrapper { max-width: 80%; display: flex; flex-direction: column; }
    .user-row .bubble-wrapper { align-items: flex-end; }

    .message-bubble {
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 13.5px;
      line-height: 1.5;
      word-break: break-word;
    }

    .bot-bubble {
      background: #ffffff;
      color: #2c3c24;
      border-bottom-left-radius: 4px;
      box-shadow: 0 2px 10px rgba(76, 96, 52, 0.08);
    }

    .user-bubble {
      background: linear-gradient(135deg, #4d6d2d, #7a9252);
      color: white;
      border-bottom-right-radius: 4px;
    }

    .message-time { font-size: 10px; color: #aaa; margin-top: 3px; padding: 0 2px; }

    /* Suggestions */
    .suggestions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .suggestion-btn {
      font-size: 11.5px !important;
      padding: 2px 10px !important;
      height: 28px !important;
      border-radius: 20px !important;
      border-color: #4d6d2d !important;
      color: #4d6d2d !important;
      line-height: 24px !important;
      min-width: unset !important;
    }

    /* Typing */
    .typing-indicator {
      background: white;
      padding: 12px 16px;
      border-radius: 16px;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
      display: flex; align-items: center; gap: 4px;
    }

    .typing-indicator span {
      width: 8px; height: 8px;
      background: #bbb;
      border-radius: 50%;
      display: inline-block;
      animation: bounce 1.2s infinite;
    }
    .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
    .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes bounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-8px); }
    }

    /* Input */
    .chat-input-area {
      display: flex;
      align-items: center;
      padding: 10px 14px;
      border-top: 1px solid rgba(76, 96, 52, 0.12);
      background: #ffffff;
      gap: 10px;
    }

    .input-field { flex: 1; font-size: 13px; }
    .input-field ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
    .input-field ::ng-deep .mat-mdc-text-field-wrapper { padding: 0 8px; }

    .send-btn { flex-shrink: 0; }
  `],
  animations: [
    trigger('slideInOut', [
      state('open', style({ opacity: 1, transform: 'translateY(0) scale(1)', pointerEvents: 'all' })),
      state('closed', style({ opacity: 0, transform: 'translateY(20px) scale(0.95)', pointerEvents: 'none' })),
      transition('closed => open', animate('200ms ease-out')),
      transition('open => closed', animate('150ms ease-in')),
    ])
  ]
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  isOpen = false;
  isTyping = false;
  hasNewMessage = false;
  userInput = '';
  messages: ChatMessage[] = [];

  private readonly KB: { keywords: string[]; answer: string; suggestions?: string[] }[] = [
    {
      keywords: ['bonjour', 'salut', 'hello', 'bonsoir', 'hey'],
      answer: '👋 Bonjour ! Je suis l\'assistant <strong>OleaCare</strong>.<br>Je peux vous aider sur la gestion de vos terrains, vos kits IoT, vos prévisions de récolte et bien plus.',
      suggestions: ['Créer un terrain', 'Mes kits IoT', 'Prévisions récolte', 'Comment ça marche ?']
    },
    {
      keywords: ['terrain', 'parcelle', 'créer terrain', 'nouveau terrain', 'ajouter terrain'],
      answer: '🌿 <strong>Créer un terrain :</strong><br>1. Rendez-vous sur le <strong>Tableau de bord</strong><br>2. Cliquez sur <strong>Nouveau Terrain</strong><br>3. Renseignez le nom, la surface (ha), la latitude/longitude et la variété d\'olive.<br><br>Le terrain est ensuite visible dans votre liste avec ses données capteurs.',
      suggestions: ['Variétés d\'olive', 'Supprimer un terrain', 'Affecter un kit']
    },
    {
      keywords: ['supprimer terrain', 'effacer terrain', 'enlever terrain'],
      answer: '🗑️ Pour <strong>supprimer un terrain</strong> :<br>Dans la liste de vos terrains, cliquez sur l\'icône <mat-icon style="font-size:14px">delete</mat-icon> à droite du terrain concerné.<br>Une confirmation vous sera demandée avant la suppression définitive.',
      suggestions: ['Créer un terrain', 'Modifier un terrain']
    },
    {
      keywords: ['variété', 'olive', 'varietes', 'chemlali', 'koroneiki', 'arbequina', 'frantoio'],
      answer: '🫒 <strong>Variétés d\'olive disponibles :</strong><br>• <strong>Chemlali</strong> — variété tunisienne, rustique et productive<br>• <strong>Koroneiki</strong> — grecque, haute teneur en huile<br>• <strong>Arbequina</strong> — espagnole, douce et fruitée<br>• <strong>Frantoio</strong> — italienne, arôme intense<br>• <strong>Autre</strong> — pour les variétés locales',
      suggestions: ['Créer un terrain', 'Prévisions récolte']
    },
    {
      keywords: ['kit', 'capteur', 'iot', 'kits', 'device', 'capteurs'],
      answer: '📡 <strong>Vos kits IoT</strong> collectent en temps réel :<br>• Température & humidité<br>• Luminosité<br>• Humidité du sol<br><br>Un kit assigné à votre terrain enverra des données toutes les heures. Consultez les courbes dans les <strong>Détails du terrain</strong>.',
      suggestions: ['Voir données capteurs', 'Prévisions récolte', 'Alertes']
    },
    {
      keywords: ['capteur', 'données', 'mesure', 'temperature', 'humidité', 'sol', 'luminosité'],
      answer: '🌡️ <strong>Données capteurs :</strong><br>Cliquez sur un terrain puis sur l\'onglet <strong>Capteurs</strong> pour voir :<br>• Les 24 dernières heures en graphique<br>• Les valeurs actuelles<br>• Les tendances<br><br>Des <strong>alertes automatiques</strong> se déclenchent si les seuils sont dépassés.',
      suggestions: ['Alertes', 'Prévisions récolte', 'Kits IoT']
    },
    {
      keywords: ['prévision', 'prediction', 'récolte', 'prévoir', 'quantité', 'qualité'],
      answer: '🤖 <strong>Prévisions de récolte IA :</strong><br>Notre modèle ML analyse vos données capteurs pour prédire :<br>• 📊 <strong>La qualité</strong> de l\'huile (score 0-100)<br>• 🫒 <strong>La quantité</strong> estimée en litres<br><br>Depuis les détails d\'un terrain, cliquez sur <strong>Générer une prévision</strong>.',
      suggestions: ['Comment améliorer la qualité ?', 'Données capteurs', 'Alertes']
    },
    {
      keywords: ['qualité', 'améliorer', 'score', 'huile'],
      answer: '✨ <strong>Améliorer la qualité de l\'huile :</strong><br>• Maintenez l\'humidité du sol entre <strong>40-60%</strong><br>• Récoltez quand l\'indice de maturité est optimal (fin Oct – début Nov)<br>• Évitez le stress hydrique en été<br>• Traitez rapidement les alertes de températures extrêmes',
      suggestions: ['Prévisions récolte', 'Alertes', 'Données capteurs']
    },
    {
      keywords: ['alerte', 'notification', 'alertes', 'warning'],
      answer: '🔔 <strong>Alertes automatiques :</strong><br>Le système génère des alertes pour :<br>• Température hors seuil (< 0°C ou > 40°C)<br>• Humidité sol critique (< 20%)<br>• Kit déconnecté<br>• Prévision de récolte disponible<br><br>Consultez tous vos alertes depuis le menu <strong>Alertes</strong>.',
      suggestions: ['Kits IoT', 'Prévisions récolte']
    },
    {
      keywords: ['fonctionnement', 'comment', 'utilisation', 'aide', 'help', 'fonctionne'],
      answer: '📖 <strong>Comment fonctionne OleaCare ?</strong><br><br>1️⃣ <strong>Créez vos terrains</strong> (parcelles d\'oliviers)<br>2️⃣ <strong>Un kit IoT</strong> est assigné à chaque terrain par l\'admin<br>3️⃣ Les capteurs collectent les données en temps réel<br>4️⃣ L\'<strong>IA génère des prévisions</strong> de qualité et quantité<br>5️⃣ Recevez des <strong>alertes</strong> automatiques',
      suggestions: ['Créer un terrain', 'Kits IoT', 'Prévisions récolte', 'Alertes']
    },
    {
      keywords: ['contact', 'support', 'problème', 'bug', 'erreur'],
      answer: '🛠️ <strong>Support technique :</strong><br>Pour tout problème technique :<br>• Vérifiez votre connexion internet<br>• Actualisez la page (F5)<br>• Si le problème persiste, contactez l\'administrateur de votre plateforme OleaCare.<br><br>Les erreurs API apparaissent généralement dans les barres de notification rouges.',
      suggestions: ['Comment ça marche ?', 'Kits IoT']
    },
    {
      keywords: ['météo', 'pluie', 'vent', 'climate', 'saison'],
      answer: '🌤️ <strong>Conditions climatiques :</strong><br>OleaCare intègre les données climatiques locales via les capteurs IoT.<br>Pour la culture de l\'olivier :<br>• Besoin : 300-600 mm de pluie/an<br>• Optimal : 15-25°C (floraison en avril-mai)<br>• Récolte : octobre à décembre selon la variété',
      suggestions: ['Données capteurs', 'Prévisions récolte']
    },
    {
      keywords: ['merci', 'super', 'parfait', 'excellent', 'bien', 'ok'],
      answer: '😊 Avec plaisir ! N\'hésitez pas si vous avez d\'autres questions sur la gestion de vos olivaies. Bonne récolte ! 🫒',
      suggestions: ['Prévisions récolte', 'Créer un terrain']
    }
  ];

  ngOnInit(): void {
    // Message de bienvenue
    setTimeout(() => {
      this.addBotMessage(
        '👋 Bonjour ! Je suis l\'assistant <strong>OleaCare</strong>. Comment puis-je vous aider aujourd\'hui ?',
        ['Créer un terrain', 'Kits IoT', 'Prévisions récolte', 'Comment ça marche ?']
      );
    }, 600);
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.hasNewMessage = false;
    }
  }

  sendMessage(text?: string): void {
    const msg = (text || this.userInput).trim();
    if (!msg) return;

    this.messages.push({ text: msg, sender: 'user', timestamp: new Date() });
    this.userInput = '';
    this.isTyping = true;

    const delay = 700 + Math.random() * 600;
    setTimeout(() => {
      this.isTyping = false;
      const response = this.getBotResponse(msg);
      this.addBotMessage(response.answer, response.suggestions);
      if (!this.isOpen) {
        this.hasNewMessage = true;
      }
    }, delay);
  }

  private addBotMessage(text: string, suggestions?: string[]): void {
    this.messages.push({ text, sender: 'bot', timestamp: new Date(), suggestions });
  }

  private getBotResponse(input: string): { answer: string; suggestions?: string[] } {
    const lower = input.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    for (const entry of this.KB) {
      if (entry.keywords.some(k => lower.includes(k.normalize('NFD').replace(/[\u0300-\u036f]/g, '')))) {
        return { answer: entry.answer, suggestions: entry.suggestions };
      }
    }

    return {
      answer: '🤔 Je n\'ai pas compris votre question. Voici ce que je peux faire :',
      suggestions: ['Créer un terrain', 'Kits IoT', 'Prévisions récolte', 'Alertes', 'Comment ça marche ?']
    };
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch {}
  }
}
