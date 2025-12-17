import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 8000;

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middlewares
app.use(cors());
app.use(express.json());

// Rota 1: Pegar os Temas
app.get("/topics", async (req, res) => {
  const { data, error } = await supabase.from("topics").select("*").order("id");

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Rota 2: Pegar Subtópicos de um Tema
app.get("/topics/:topicId/subtopics", async (req, res) => {
  const { topicId } = req.params;
  const { data, error } = await supabase
    .from("subtopics")
    .select("*")
    .eq("topic_id", topicId);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Rota 3: Pegar Questões (Com filtro de "não repetir")
app.get("/questions", async (req, res) => {
  const { user_id, topic_id, subtopic_id } = req.query;

  if (!user_id) return res.status(400).json({ error: "user_id obrigatório" });

  try {
    // 1. Buscar IDs das questões que o usuário já ACERTOU
    const { data: progress } = await supabase
      .from("user_progress")
      .select("question_id")
      .eq("user_id", user_id)
      .eq("is_correct", true);

    const answeredIds = progress.map((p) => p.question_id);

    // 2. Montar query das questões
    let query = supabase.from("questions").select("*");

    if (subtopic_id) {
      query = query.eq("subtopic_id", subtopic_id);
    } else if (topic_id) {
      query = query.eq("topic_id", topic_id);
    }

    // Se já respondeu algumas, exclua elas da busca
    if (answeredIds.length > 0) {
      // Nota: O Supabase tem limite de URL, se tiver 1000 IDs pode falhar.
      // Para produção real usariamos uma 'Stored Procedure', mas para este projeto serve.
      query = query.not("id", "in", `(${answeredIds.join(",")})`);
    }

    const { data: questions, error } = await query;

    if (error) throw error;

    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota 4: Estatísticas
app.get("/stats", async (req, res) => {
  const { user_id, topic_id, subtopic_id } = req.query;

  let query = supabase
    .from("user_progress")
    .select("is_correct, question_id, questions!inner(topic_id, subtopic_id)")
    .eq("user_id", user_id);

  if (subtopic_id) {
    query = query.eq("questions.subtopic_id", subtopic_id);
  } else if (topic_id) {
    query = query.eq("questions.topic_id", topic_id);
  }

  const { data, error } = await query;

  if (error) return res.status(500).json({ error: error.message });

  const correct = data.filter((d) => d.is_correct).length;
  const wrong = data.filter((d) => !d.is_correct).length;

  res.json({ correct, wrong });
});

// Rota 5: Salvar Resposta
app.post("/submit", async (req, res) => {
  const { user_id, question_id, is_correct } = req.body;

  const { error } = await supabase
    .from("user_progress")
    .insert({ user_id, question_id, is_correct });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ status: "success" });
});

// Iniciar Servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
