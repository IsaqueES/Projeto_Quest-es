import os
import re
from bs4 import BeautifulSoup
from supabase import create_client
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

# Configuração do Supabase
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("ERRO: Configure o .env com SUPABASE_URL e SUPABASE_KEY antes de rodar.")
    exit()

supabase = create_client(url, key)

FILENAME = "aa_660_final2.html"

def clean_text(text):
    return re.sub(r'\s+', ' ', text).strip()

def import_questions():
    print(f"--- Iniciando importação de {FILENAME} ---")
    
    if not os.path.exists(FILENAME):
        print(f"ERRO: Arquivo {FILENAME} não encontrado na pasta backend.")
        return

    with open(FILENAME, 'r', encoding='utf-8', errors='ignore') as f:
        soup = BeautifulSoup(f, 'html.parser')

    # Remove scripts e estilos para limpar o texto
    for script in soup(["script", "style"]):
        script.extract()

    # Estratégia: O HTML de simulados geralmente é uma lista visual.
    # Vamos percorrer o texto e identificar padrões regex.
    # Padrão de pergunta: Começa com número seguido de ponto ou parêntese. Ex: "1." ou "1)"
    # Padrão de resposta: Começa com letra seguida de parêntese. Ex: "a)"
    
    text_content = soup.get_text(separator="\n")
    lines = text_content.split('\n')
    
    questions_buffer = []
    current_q = None
    
    # Regex para identificar início de pergunta (Ex: "1)", "01.", "1 -")
    question_pattern = re.compile(r'^\s*(\d+)\s?[).—-]\s*(.+)')
    # Regex para identificar alternativas (Ex: "a)", "A.", "a -")
    option_pattern = re.compile(r'^\s*([a-dA-D])\s?[).—-]\s*(.+)')

    for line in lines:
        line = clean_text(line)
        if not line: continue

        # Verifica se é uma nova pergunta
        q_match = question_pattern.match(line)
        if q_match:
            # Salva a anterior se existir
            if current_q:
                questions_buffer.append(current_q)
            
            # Inicia nova pergunta
            current_q = {
                "num": q_match.group(1),
                "text": q_match.group(2),
                "options": [],
                "correct_index": 0, # Default
                "raw_correct_letter": None
            }
            continue

        # Verifica se é uma alternativa
        opt_match = option_pattern.match(line)
        if current_q and opt_match:
            letter = opt_match.group(1).lower()
            text = opt_match.group(2)
            current_q["options"].append(text)
            
            # TENTATIVA DE IDENTIFICAR A CORRETA:
            # Muitas vezes o HTML tem a resposta certa marcada. 
            # Como estamos lendo texto puro aqui, verifique se no seu HTML 
            # a resposta certa tem algum caractere especial como "*" ou "(x)"
            if "*" in line or "(x)" in line.lower():
                current_q["correct_index"] = len(current_q["options"]) - 1
            
            continue
            
        # Se não é nem pergunta nem resposta, pode ser continuação do texto da pergunta
        if current_q and len(current_q["options"]) == 0:
            current_q["text"] += " " + line

    # Adiciona a última
    if current_q:
        questions_buffer.append(current_q)

    print(f"Encontradas {len(questions_buffer)} questões possíveis.")

    # --- INSERÇÃO NO BANCO ---
    # Vamos inserir no tópico "Legislação" (ID 1) por padrão, pois o HTML não separa.
    
    count = 0
    for q in questions_buffer:
        # Validação básica: precisa ter texto e pelo menos 2 opções
        if not q["text"] or len(q["options"]) < 2:
            continue

        # Garante que tenha 4 opções (preenche com vazio se faltar para não quebrar o front)
        while len(q["options"]) < 4:
            q["options"].append("-")

        data = {
            "topic_id": 1, # ID 1 = Legislação (Padrão)
            "subtopic_id": None, # Sem subtema definido
            "question_text": q["text"][:500], # Limite de segurança
            "options": q["options"][:4], # Pega as 4 primeiras
            "correct_option": q["correct_index"],
            "explanation": "Resposta baseada no gabarito oficial.",
            "trick_tip": "Leia com atenção o enunciado." 
        }
        
        try:
            supabase.table("questions").insert(data).execute()
            count += 1
            print(f"Importada questão {q['num']}...")
        except Exception as e:
            print(f"Erro ao inserir {q['num']}: {e}")

    print(f"--- Sucesso! {count} questões importadas para o banco de dados. ---")

if __name__ == "__main__":
    import_questions()