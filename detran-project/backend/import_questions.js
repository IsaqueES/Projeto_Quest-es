import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import vm from "vm";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const HTML_FILE = "aa_660_final2.html";

// Mapeamento baseado no seu schema.sql
// Certifique-se que os IDs batem com a ordem de inserção no banco
const SUBTOPIC_RULES = [
  // TEMA 1: Legislação
  {
    id: 1,
    topic_id: 1,
    keywords: [
      "placa",
      "sinalização",
      "faixa",
      "cor",
      "silvo",
      "apito",
      "gesto",
      "luminoso",
      "horizontal",
      "vertical",
    ],
  }, // Sinalização
  {
    id: 2,
    topic_id: 1,
    keywords: [
      "infração",
      "penalidade",
      "multa",
      "apreensão",
      "cassação",
      "suspensão",
      "crime",
      "pontos",
      "recurso",
    ],
  }, // Infrações
  {
    id: 3,
    topic_id: 1,
    keywords: [
      "habilitação",
      "cnh",
      "ppd",
      "acc",
      "categoria",
      "renovação",
      "exame",
      "psicológico",
    ],
  }, // Habilitação

  // TEMA 2: Direção Defensiva
  {
    id: 4,
    topic_id: 2,
    keywords: [
      "chuva",
      "neblina",
      "aquaplanagem",
      "noite",
      "luz",
      "ofuscamento",
      "condição adversa",
      "tempo",
      "via",
      "granizo",
    ],
  }, // Condições Adversas
  {
    id: 5,
    topic_id: 2,
    keywords: [
      "colisão",
      "distância",
      "seguimento",
      "frente",
      "traseira",
      "misteriosa",
      "batida",
      "abalroamento",
    ],
  }, // Colisão
  {
    id: 6,
    topic_id: 2,
    keywords: ["cinto", "capacete", "segurança", "bebê", "cadeirinha"],
  }, // Cinto/Segurança

  // TEMA 3: Mecânica
  {
    id: 7,
    topic_id: 3,
    keywords: [
      "motor",
      "radiador",
      "óleo",
      "lubrificação",
      "arrefecimento",
      "água",
      "bateria",
      "carburador",
      "injeção",
      "filtro",
    ],
  }, // Motor
  {
    id: 8,
    topic_id: 3,
    keywords: [
      "painel",
      "instrumento",
      "velocímetro",
      "termômetro",
      "luz indicadora",
      "odômetro",
    ],
  }, // Painel

  // TEMA 4: Primeiros Socorros
  {
    id: 9,
    topic_id: 4,
    keywords: [
      "sinais vitais",
      "avaliação",
      "respiração",
      "pulso",
      "consciência",
      "desmaio",
      "convulsão",
    ],
  }, // Avaliação Inicial
  {
    id: 10,
    topic_id: 4,
    keywords: [
      "hemorragia",
      "sangue",
      "sangramento",
      "fratura",
      "queimadura",
      "imobilização",
    ],
  }, // Hemorragias/Fraturas

  // TEMA 5: Meio Ambiente
  {
    id: 11,
    topic_id: 5,
    keywords: [
      "poluição",
      "gases",
      "sonora",
      "ruído",
      "catalisador",
      "escapamento",
      "lixo",
      "ambiental",
    ],
  }, // Poluição

  // TEMA 6: Cidadania
  {
    id: 12,
    topic_id: 6,
    keywords: [
      "cidadania",
      "convívio",
      "social",
      "comportamento",
      "solidariedade",
      "cortesia",
      "idoso",
      "deficiente",
    ],
  }, // Convívio
];

async function importQuestions() {
  console.log(`📖 Lendo arquivo ${HTML_FILE}...`);

  if (!fs.existsSync(HTML_FILE)) {
    console.error("❌ Arquivo não encontrado!");
    return;
  }

  const htmlContent = fs.readFileSync(HTML_FILE, "utf-8");

  // Extrai JS do HTML (Mesma lógica segura da versão anterior)
  const scriptMatch = htmlContent.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
  if (!scriptMatch) return;

  let scriptContent = scriptMatch[1];
  if (scriptContent.includes("const quizArea")) {
    scriptContent = scriptContent.split("const quizArea")[0];
  }
  scriptContent += `
    this.baseQuestions = baseQuestions;
    this.signImages = signImages;
  `;

  const sandbox = {};
  vm.createContext(sandbox);
  try {
    vm.runInContext(scriptContent, sandbox);
  } catch (e) {
    console.error("❌ Erro JS:", e.message);
    return;
  }

  const questionsRaw = sandbox.baseQuestions || [];
  const imagesMap = sandbox.signImages || {};

  console.log(`🧩 Processando ${questionsRaw.length} questões com Subtemas...`);

  let count = 0;

  for (const q of questionsRaw) {
    const text = q.text.toLowerCase();

    // Lógica Inteligente: Define Tópico e Subtópico baseado no texto
    let topicId = 1; // Default: Legislação
    let subtopicId = null; // Default: null

    // Tenta encontrar um subtema que bata com as palavras-chave
    for (const rule of SUBTOPIC_RULES) {
      const match = rule.keywords.some((k) => text.includes(k));
      if (match) {
        topicId = rule.topic_id;
        subtopicId = rule.id;
        break; // Achou o primeiro match, para.
      }
    }

    // Se não achou subtema, mas é de um tema geral, ajusta o tema principal
    if (!subtopicId) {
      if (text.includes("defensiva")) topicId = 2;
      else if (text.includes("mecânica")) topicId = 3;
      else if (text.includes("socorros")) topicId = 4;
      else if (text.includes("ambiente")) topicId = 5;
      else if (text.includes("cidadania")) topicId = 6;
    }

    // Recupera Imagem
    let imageUrl = null;
    if (q.code) {
      const codes = q.code.split(",").map((c) => c.trim());
      for (const code of codes) {
        if (imagesMap[code]) {
          imageUrl = imagesMap[code];
          break;
        }
      }
    }

    const { error } = await supabase.from("questions").insert({
      topic_id: topicId,
      subtopic_id: subtopicId, // AGORA ESTAMOS PREENCHENDO ISSO!
      question_text: q.text,
      options: q.options,
      correct_option: q.answer,
      explanation: "Gabarito Oficial.",
      image_url: imageUrl,
    });

    if (!error) {
      count++;
      if (count % 50 === 0) process.stdout.write(`.`);
    }
  }

  console.log(`\n✅ Sucesso! ${count} questões importadas e categorizadas.`);
}

importQuestions();
