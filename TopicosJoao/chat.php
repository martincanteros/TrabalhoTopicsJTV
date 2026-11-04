<?php
header('Content-Type: application/json; charset=utf-8');

const OPENAI_API_KEY = 'COLOQUE_SUA_CHAVE_AQUI';
const OPENAI_MODEL = 'gpt-4o-mini';

function respond(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, ['error' => 'Método não permitido.']);
}

if (OPENAI_API_KEY === 'COLOQUE_SUA_CHAVE_AQUI') {
    respond(503, ['error' => 'Configure sua chave da OpenAI no arquivo chat.php.']);
}

if (!extension_loaded('curl')) {
    respond(500, ['error' => 'A extensão cURL do PHP não está habilitada no servidor.']);
}

$requestBody = file_get_contents('php://input');
$request = json_decode($requestBody, true);

if (!is_array($request) || !isset($request['messages']) || !is_array($request['messages'])) {
    respond(400, ['error' => 'Envie uma lista válida de mensagens.']);
}

if (count($request['messages']) > 20) {
    respond(400, ['error' => 'A conversa excedeu o limite de mensagens. Inicie um novo pedido.']);
}

$messages = [[
    'role' => 'system',
    'content' => 'Você é o GulosoAgent, assistente virtual da FoodDinner. Responda em português brasileiro, com simpatia e clareza. Ajude com cardápios e restrições alimentares. Não afirme que fez pedidos, pagamentos, alterações ou pausas de entrega; explique que o usuário precisa confirmar essas ações com a equipe da FoodDinner.'
]];

foreach ($request['messages'] as $message) {
    if (
        !is_array($message)
        || !isset($message['role'], $message['content'])
        || !in_array($message['role'], ['user', 'assistant'], true)
        || !is_string($message['content'])
        || trim($message['content']) === ''
        || strlen($message['content']) > 4000
    ) {
        respond(400, ['error' => 'Uma mensagem da conversa é inválida.']);
    }

    $messages[] = [
        'role' => $message['role'],
        'content' => $message['content']
    ];
}

$curl = curl_init('https://api.openai.com/v1/chat/completions');
if ($curl === false) {
    respond(500, ['error' => 'Não foi possível iniciar a conexão com a API.']);
}

curl_setopt_array($curl, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . OPENAI_API_KEY
    ],
    CURLOPT_POSTFIELDS => json_encode([
        'model' => OPENAI_MODEL,
        'messages' => $messages,
        'temperature' => 0.7
    ]),
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_TIMEOUT => 45
]);

$apiResponse = curl_exec($curl);
$curlError = curl_error($curl);
$httpStatus = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

if ($apiResponse === false) {
    error_log('Falha na conexão com a OpenAI: ' . $curlError);
    respond(502, ['error' => 'Falha ao conectar com a API da OpenAI.']);
}

$apiData = json_decode($apiResponse, true);
if ($httpStatus < 200 || $httpStatus >= 300) {
    $apiError = $apiData['error']['message'] ?? 'A API da OpenAI recusou a solicitação.';
    error_log('Erro da API OpenAI (' . $httpStatus . '): ' . $apiError);
    respond(502, ['error' => 'A API da OpenAI retornou um erro. Verifique a chave e tente novamente.']);
}

$reply = $apiData['choices'][0]['message']['content'] ?? null;
if (!is_string($reply) || trim($reply) === '') {
    error_log('A API da OpenAI retornou uma resposta vazia ou inválida.');
    respond(502, ['error' => 'A API da OpenAI retornou uma resposta inválida.']);
}

respond(200, ['reply' => trim($reply)]);
