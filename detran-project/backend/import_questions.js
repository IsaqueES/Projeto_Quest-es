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

// Regras para categorizar automaticamente nos subtemas (IDs baseados no seu schema.sql)
const SUBTOPIC_RULES = [
  // TEMA 1: Legislação
  {
    id: 1,
    topic_id: 1,
    keywords: [
      "placa",
      "sinalização",
      "faixa",
      "silvo",
      "apito",
      "luminoso",
      "horizontal",
      "vertical",
    ],
  },
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
    ],
  },
  {
    id: 3,
    topic_id: 1,
    keywords: [
      "habilitação",
      "cnh",
      "ppd",
      "acc",
      "categoria",
      "exame",
      "renovação",
    ],
  },

  // TEMA 2: Direção Defensiva
  {
    id: 4,
    topic_id: 2,
    keywords: [
      "chuva",
      "neblina",
      "aquaplanagem",
      "ofuscamento",
      "condição adversa",
      "tempo",
      "via",
      "luz",
    ],
  },
  {
    id: 5,
    topic_id: 2,
    keywords: ["colisão", "distância", "seguimento", "batida", "impacto"],
  },
  {
    id: 6,
    topic_id: 2,
    keywords: ["cinto", "capacete", "segurança", "cadeirinha", "bebê"],
  },

  // TEMA 3: Mecânica
  {
    id: 7,
    topic_id: 3,
    keywords: [
      "motor",
      "radiador",
      "óleo",
      "bateria",
      "carburador",
      "injeção",
      "filtro",
      "freio",
      "pneu",
    ],
  },
  {
    id: 8,
    topic_id: 3,
    keywords: ["painel", "velocímetro", "termômetro", "luz indicadora"],
  },

  // TEMA 4: Primeiros Socorros
  {
    id: 9,
    topic_id: 4,
    keywords: [
      "sinais vitais",
      "respiração",
      "pulso",
      "desmaio",
      "consciência",
    ],
  },
  {
    id: 10,
    topic_id: 4,
    keywords: [
      "hemorragia",
      "sangramento",
      "fratura",
      "queimadura",
      "imobilização",
    ],
  },

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
      "fumaça",
    ],
  },

  // TEMA 6: Cidadania
  {
    id: 12,
    topic_id: 6,
    keywords: ["cidadania", "convívio", "social", "cortesia", "solidariedade"],
  },
];

async function importQuestions() {
  console.log(`📖 Lendo arquivo ${HTML_FILE}...`);

  if (!fs.existsSync(HTML_FILE)) {
    console.error(
      "❌ Arquivo aa_660_final2.html não encontrado na pasta backend!"
    );
    return;
  }

  const htmlContent = fs.readFileSync(HTML_FILE, "utf-8");

  // Extrai o conteúdo entre as tags <script>
  const scriptMatch = htmlContent.match(/<script[^>]*>([\s\S]*?)<\/script>/i);

  if (!scriptMatch) {
    console.error("❌ Nenhuma tag <script> encontrada no HTML.");
    return;
  }

  let scriptContent = scriptMatch[1];

  // Limpa código de DOM que quebra no Node.js
  if (scriptContent.includes("const quizArea")) {
    scriptContent = scriptContent.split("const quizArea")[0];
  }

  // Truque para exportar as variáveis do script
  scriptContent += `
    this.baseQuestions = baseQuestions;
    this.signImages = signImages;
  `;

  const sandbox = {};
  vm.createContext(sandbox);

  try {
    vm.runInContext(scriptContent, sandbox);
  } catch (e) {
    console.error("❌ Erro ao processar o JavaScript do arquivo:", e.message);
    return;
  }

  const questionsRaw = sandbox.baseQuestions || [];
  const imagesMap = sandbox.signImages || {};

  console.log(
    `🧩 Encontradas ${questionsRaw.length} questões. Iniciando importação...`
  );

  let count = 0;

  for (const q of questionsRaw) {
    const text = q.text.toLowerCase();

    // Tenta identificar o Subtema
    let topicId = 1;
    let subtopicId = null;

    for (const rule of SUBTOPIC_RULES) {
      if (rule.keywords.some((k) => text.includes(k))) {
        topicId = rule.topic_id;
        subtopicId = rule.id;
        break;
      }
    }

    // Se não achou subtema, tenta ao menos acertar o tema principal
    if (!subtopicId) {
      if (text.includes("defensiva")) topicId = 2;
      else if (text.includes("mecânica")) topicId = 3;
      else if (text.includes("socorros")) topicId = 4;
      else if (text.includes("ambiente")) topicId = 5;
      else if (text.includes("cidadania")) topicId = 6;
    }

    // Recupera a URL da imagem se houver código da placa
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
      subtopic_id: subtopicId, // Importante: agora preenchemos o subtema!
      question_text: q.text,
      options: q.options,
      correct_option: q.answer,
      explanation: "Gabarito Oficial Detran.",
      image_url: imageUrl,
    });

    if (!error) {
      count++;
      if (count % 50 === 0) process.stdout.write(`.`);
    } else {
      console.error(`Erro: ${error.message}`);
    }
  }

  console.log(`\n✅ Sucesso! ${count} questões importadas e categorizadas.`);
}

importQuestions();
