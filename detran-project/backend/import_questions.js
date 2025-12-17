import fs from "fs";
import * as cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
const HTML_FILE = "aa_660_final2.html";

async function importQuestions() {
  console.log(`📖 Lendo arquivo ${HTML_FILE}...`);

  if (!fs.existsSync(HTML_FILE)) {
    console.error("❌ Arquivo HTML não encontrado na pasta backend!");
    return;
  }

  const htmlContent = fs.readFileSync(HTML_FILE, "utf-8");
  // Carrega o HTML no Cheerio (similar ao jQuery)
  const $ = cheerio.load(htmlContent);

  // Extrai todo o texto para processar via Regex, pois a estrutura HTML de simulados
  // costuma ser visual e não semântica
  const textContent = $("body").text();
  const lines = textContent
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l);

  const questionsBuffer = [];
  let currentQ = null;

  // Regex para identificar padrões
  const questionPattern = /^\s*(\d+)[).—-]\s*(.+)/; // Ex: "1) Texto" ou "01. Texto"
  const optionPattern = /^\s*([a-dA-D])[).—-]\s*(.+)/; // Ex: "a) Opção"

  for (const line of lines) {
    // É uma nova pergunta?
    const qMatch = line.match(questionPattern);
    if (qMatch) {
      if (currentQ) questionsBuffer.push(currentQ);

      currentQ = {
        text: qMatch[2],
        options: [],
        correctIndex: 0, // Padrão
      };
      continue;
    }

    // É uma opção?
    const optMatch = line.match(optionPattern);
    if (currentQ && optMatch) {
      currentQ.options.push(optMatch[2]);

      // Tenta achar resposta certa se tiver '*' ou '(x)'
      if (line.includes("*") || line.toLowerCase().includes("(x)")) {
        currentQ.correctIndex = currentQ.options.length - 1;
      }
      continue;
    }

    // Continuação do texto da pergunta
    if (currentQ && currentQ.options.length === 0) {
      currentQ.text += " " + line;
    }
  }
  if (currentQ) questionsBuffer.push(currentQ);

  console.log(`🧩 Encontradas ${questionsBuffer.length} questões potenciais.`);

  // Inserção no Banco
  let count = 0;
  for (const q of questionsBuffer) {
    if (q.options.length < 2) continue; // Pula inválidas

    // Preenche até ter 4 opções para não quebrar layout
    while (q.options.length < 4) q.options.push("-");

    const { error } = await supabase.from("questions").insert({
      topic_id: 1, // Padrão: Legislação (Depois você muda no banco)
      subtopic_id: null,
      question_text: q.text.substring(0, 500),
      options: q.options.slice(0, 4),
      correct_option: q.correctIndex,
      explanation: "Resposta baseada no gabarito oficial.",
      trick_tip: "Leia com atenção.",
    });

    if (!error) {
      count++;
      if (count % 50 === 0) console.log(`Importadas ${count}...`);
    } else {
      console.error("Erro ao inserir:", error.message);
    }
  }

  console.log(`✅ Sucesso! ${count} questões importadas.`);
}

importQuestions();
