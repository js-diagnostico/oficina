// Função de servidor (roda na Vercel, nunca no navegador do cliente).
// Usa a API do Google Gemini (tem nível gratuito, sem cartão de crédito).
// Mantém a chave em segredo — o site nunca vê GEMINI_API_KEY.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'GEMINI_API_KEY não configurada nas variáveis de ambiente da Vercel.' });
    return;
  }

  const { descricao, categoria, veiculo } = req.body || {};
  if (!descricao || !String(descricao).trim()) {
    res.status(400).json({ error: 'Descreva o problema relatado antes de pedir a sugestão.' });
    return;
  }

  const prompt = `Você é um assistente de precificação para uma oficina de diagnóstico automotivo elétrico no Brasil.
Com base na descrição do problema abaixo, sugira um valor de mão de obra em reais (BRL), realista para o mercado brasileiro atual, para um serviço desse tipo numa oficina especializada em diagnóstico e elétrica automotiva.

Problema relatado: ${String(descricao).slice(0, 800)}
Categoria do veículo: ${categoria || 'não informada'}
Veículo: ${veiculo || 'não informado'}

Responda SOMENTE em JSON válido, sem nenhum texto antes ou depois, exatamente neste formato:
{"valorSugerido": 000, "faixaMin": 000, "faixaMax": 000, "justificativa": "explicação breve em até 2 frases, em português"}`;

  try {
    const resposta = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 300 },
        }),
      }
    );

    if (!resposta.ok) {
      const textoErro = await resposta.text();
      res.status(502).json({ error: 'Erro ao consultar a IA: ' + textoErro.slice(0, 300) });
      return;
    }

    const dados = await resposta.json();
    const texto = dados?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('').trim() || '';
    if (!texto) { res.status(502).json({ error: 'A IA não retornou nenhum texto.' }); return; }
    const limpo = texto.replace(/```json/gi, '').replace(/```/g, '').trim();
    const sugestao = JSON.parse(limpo);

    res.status(200).json({
      valorSugerido: Number(sugestao.valorSugerido) || 0,
      faixaMin: Number(sugestao.faixaMin) || 0,
      faixaMax: Number(sugestao.faixaMax) || 0,
      justificativa: String(sugestao.justificativa || ''),
    });
  } catch (e) {
    res.status(500).json({ error: 'Erro inesperado ao gerar a sugestão: ' + (e.message || String(e)) });
  }
}
