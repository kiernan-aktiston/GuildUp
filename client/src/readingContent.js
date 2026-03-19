// GuildUp — Sharpen the Mind: Reading Content
// 5 Topics × 5 Articles each = 25 total
// Articles unlock sequentially within each topic

export const TOPICS = [
  {
    id: "philosophy",
    name: "Philosophy",
    subtitle: "How to Think",
    emoji: "🏛️",
    color: "#a78bfa",
    articles: [
      {
        id: "phil-1",
        title: "The Examined Life",
        subtitle: "Socrates and the price of wisdom",
        content: `You've probably heard the name Socrates. Most people associate him with ancient Greece, maybe a toga, maybe a vague memory from school. But here's what they usually leave out: the man was executed by his own city for asking too many questions. That should tell you something about how dangerous thinking can be.

Socrates never wrote a single word down. Everything we know about him comes from his students, primarily Plato. What made Socrates different from every philosopher before him was his method. He didn't lecture. He didn't claim to have answers. Instead, he asked questions — relentlessly, publicly, and to people who were absolutely certain they already knew the truth.

His approach was simple. Find someone who claims to be wise — a politician, a general, a poet — and start asking them to define the terms they use so confidently. What is justice? What is courage? What is virtue? Almost without exception, the person would fumble. Their confident definitions would collapse under scrutiny. And Socrates would point out, gently or not so gently, that they didn't actually know what they were talking about.

This was not a popular hobby. Athens was a proud city. Its leaders did not enjoy being embarrassed in the marketplace by a barefoot stonemason's son. But Socrates believed something that most people still resist: that the beginning of wisdom is admitting what you don't know.

He called this his only claim to wisdom — that unlike others, he at least knew that he was ignorant. It sounds humble, maybe even like false modesty. But think about it practically. How many bad decisions in your own life came from acting on assumptions you never questioned? How many arguments have you been in where both sides were operating on definitions they'd never actually examined?

Socrates' method — now called the Socratic method — isn't about being clever or winning debates. It's about clearing away the fog. Most people walk through life with a head full of borrowed opinions, secondhand ideas, and unexamined assumptions. They "know" things they've never actually thought about. Socrates' radical idea was that this kind of unexamined life isn't really a life at all.

"The unexamined life is not worth living," he told the jury at his trial. They sentenced him to death. He accepted it calmly, drank the poison hemlock, and died surrounded by his students.

He was seventy years old. He could have recanted, apologized, gone into exile. He chose death over silence. Not because he was stubborn, but because he believed that a life where you stop questioning is a life where you stop being fully human.

Here's what matters for you right now: you don't need to be Socrates. But the habit he modeled — questioning your own assumptions before you question anyone else's — is the foundation of every good decision you'll ever make. The next time you're certain about something, pause. Ask yourself: how do I actually know this? Where did this belief come from? Can I defend it, or am I just repeating what I've heard?

That pause — that willingness to sit with uncertainty instead of rushing toward false confidence — is where real thinking begins.`,
        questions: [
          {
            q: "Why was Socrates executed by Athens?",
            options: [
              "He committed treason against the city-state",
              "He persistently questioned people's assumptions and embarrassed leaders",
              "He refused to serve in the military",
              "He wrote controversial texts criticizing democracy"
            ],
            answer: 1,
          },
          {
            q: "What did Socrates claim was his only form of wisdom?",
            options: [
              "His ability to win any debate",
              "His knowledge of mathematics and science",
              "His awareness of his own ignorance",
              "His understanding of politics and law"
            ],
            answer: 2,
          },
          {
            q: "Based on the article, what is the practical value of the Socratic method for modern life?",
            options: [
              "It helps you win arguments more effectively",
              "It teaches you to question your own assumptions before making decisions",
              "It proves that all authority figures are wrong",
              "It shows that ancient knowledge is superior to modern thinking"
            ],
            answer: 1,
          },
        ],
      },
      { id: "phil-2", title: "The Obstacle Is the Way", subtitle: "Marcus Aurelius and Stoic resilience", content: null, questions: [] },
      { id: "phil-3", title: "The Golden Mean", subtitle: "Aristotle and the habit of excellence", content: null, questions: [] },
      { id: "phil-4", title: "Reason Meets Faith", subtitle: "Aquinas and natural law", content: null, questions: [] },
      { id: "phil-5", title: "Creating Your Own Meaning", subtitle: "Nietzsche and the will to power", content: null, questions: [] },
    ],
  },
  {
    id: "money",
    name: "Money",
    subtitle: "How to Build Wealth",
    emoji: "💰",
    color: "#f59e0b",
    articles: [
      {
        id: "money-1",
        title: "The Eighth Wonder",
        subtitle: "Compound interest and why time is your weapon",
        content: `Albert Einstein allegedly called compound interest the eighth wonder of the world. Whether or not he actually said it doesn't matter — the math speaks for itself, and it will either work for you or destroy you. There is no middle ground.

Here is the simplest version: compound interest means you earn interest on your interest. If you put $1,000 into an account earning 10% per year, after year one you have $1,100. Normal enough. But in year two, you earn 10% on $1,100 — not $1,000. That's $1,210. Year three: $1,331. The numbers start slow, almost disappointingly slow, and then they explode.

After 10 years, that $1,000 becomes $2,594. After 20 years: $6,727. After 30 years: $17,449. You invested $1,000 once and never touched it. The money made money, and then that money made money. That is the entire secret.

Now here's the part that ruins people: this exact same math works in reverse when you owe money. Credit card debt typically carries interest rates between 20-29%. If you owe $5,000 on a credit card at 24% interest and only make minimum payments, you will pay over $12,000 before it's gone. The bank used the same math on you — except now you're the one funding someone else's wealth.

This is not abstract. This is the single most important financial concept you will ever learn, and most schools never teach it. Every wealthy person understands this. Every person drowning in debt either doesn't understand it or understood it too late.

The variable that matters most is time. A 20-year-old who invests $200 per month at an average 8% return until age 60 will have roughly $698,000. A 30-year-old doing the exact same thing will have about $300,000. Same monthly amount, same return — but starting ten years earlier more than doubles the outcome. Those ten years of compound growth are worth almost $400,000.

This is why starting now matters more than starting perfectly. People spend years waiting until they "know enough" about investing or until they "have enough money" to start. Meanwhile, the most valuable asset they have — time — is evaporating.

You don't need to become a financial expert today. You need to understand one thing: every dollar you save and invest now is a soldier that will fight for you for the rest of your life. And every dollar you borrow at high interest is a soldier fighting against you.

The practical step is embarrassingly simple. Open an investment account — a Roth IRA or a basic brokerage account. Set up an automatic transfer, even if it's $25 a month. Put it in a broad market index fund. And then do the hardest part: leave it alone. Don't check it daily. Don't panic when the market drops. The math works over decades, not days.

You are at the age where time is overwhelmingly on your side. That won't be true forever. The difference between the person who starts at 18 and the person who starts at 35 is not effort or intelligence — it's compound interest doing what it does.`,
        questions: [
          {
            q: "In the example given, how much does $1,000 grow to after 30 years at 10% annual interest?",
            options: [
              "$4,000",
              "$10,000",
              "$17,449",
              "$30,000"
            ],
            answer: 2,
          },
          {
            q: "Why does the article say starting at 20 vs. 30 more than doubles the outcome?",
            options: [
              "Because you invest twice as much money total",
              "Because younger people get better interest rates",
              "Because compound growth accelerates over time, making early years disproportionately valuable",
              "Because the stock market performs better for younger investors"
            ],
            answer: 2,
          },
          {
            q: "What does the article identify as the practical first step?",
            options: [
              "Pay off all debt before investing anything",
              "Open an investment account, automate a small amount into an index fund, and leave it alone",
              "Learn everything about the stock market before starting",
              "Wait until you have at least $5,000 saved to begin"
            ],
            answer: 1,
          },
        ],
      },
      { id: "money-2", title: "The Debt Trap", subtitle: "Credit, interest, and how the system works", content: null, questions: [] },
      { id: "money-3", title: "Owning the Market", subtitle: "Stocks, indexes, and long-term thinking", content: null, questions: [] },
      { id: "money-4", title: "Income vs. Wealth", subtitle: "Why your paycheck isn't the point", content: null, questions: [] },
      { id: "money-5", title: "The Leverage Equation", subtitle: "Starting a business and the economics of ownership", content: null, questions: [] },
    ],
  },
  {
    id: "science",
    name: "Science",
    subtitle: "How the World Works",
    emoji: "🧬",
    color: "#22c55e",
    articles: [
      { id: "sci-1", title: "The Ancient Brain", subtitle: "Evolution and why your brain fights your goals", content: null, questions: [] },
      { id: "sci-2", title: "Everything Falls Apart", subtitle: "Entropy, energy, and why effort matters", content: null, questions: [] },
      { id: "sci-3", title: "Rewiring Yourself", subtitle: "The neuroscience of habit formation", content: null, questions: [] },
      { id: "sci-4", title: "Your Chemical Engine", subtitle: "Testosterone, cortisol, and dopamine — no bro-science", content: null, questions: [] },
      { id: "sci-5", title: "Nature vs. Nurture", subtitle: "Genetics, environment, and what you can change", content: null, questions: [] },
    ],
  },
  {
    id: "history",
    name: "History",
    subtitle: "How Power Works",
    emoji: "⚔️",
    color: "#ef4444",
    articles: [
      { id: "hist-1", title: "The Fall of Rome", subtitle: "What kills empires", content: null, questions: [] },
      { id: "hist-2", title: "The Conqueror", subtitle: "Alexander the Great — ambition, speed, overextension", content: null, questions: [] },
      { id: "hist-3", title: "The Rebirth", subtitle: "When knowledge becomes power", content: null, questions: [] },
      { id: "hist-4", title: "The Experiment", subtitle: "The American founding — designing systems that outlast men", content: null, questions: [] },
      { id: "hist-5", title: "The Shadow War", subtitle: "The Cold War and how your world was built", content: null, questions: [] },
    ],
  },
  {
    id: "strategy",
    name: "Strategy",
    subtitle: "How to Win",
    emoji: "🎯",
    color: "#3b82f6",
    articles: [
      { id: "strat-1", title: "The Art of Positioning", subtitle: "Sun Tzu and winning before the fight", content: null, questions: [] },
      { id: "strat-2", title: "Cooperate or Compete", subtitle: "The Prisoner's Dilemma and when to trust", content: null, questions: [] },
      { id: "strat-3", title: "Reversible Doors", subtitle: "Decision-making under uncertainty", content: null, questions: [] },
      { id: "strat-4", title: "The Unspoken", subtitle: "Negotiation and what silence says", content: null, questions: [] },
      { id: "strat-5", title: "Authority vs. Influence", subtitle: "What real leadership looks like", content: null, questions: [] },
    ],
  },
];
