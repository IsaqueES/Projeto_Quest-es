import { createClient } from "@supabase/supabase-js";

// As variáveis virão do arquivo .env na raiz do frontend (se configurado)
// ou você pode colocar as strings diretamente aqui para testar rápido.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
