// Função de servidor (roda na Vercel, nunca no navegador do cliente).
// Mantém a chave da IA em segredo — o site nunca vê ANTHROPIC_API_KEY.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido.' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada nas variáveis de ambiente da Vercel.' });
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
    const resposta = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!resposta.ok) {
      const textoErro = await resposta.text();
      res.status(502).json({ error: 'Erro ao consultar a IA: ' + textoErro.slice(0, 300) });
      return;
    }

    const dados = await resposta.json();
    const texto = (dados.content || []).map((bloco) => bloco.text || '').join('').trim();
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
