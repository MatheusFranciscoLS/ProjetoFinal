<?php
namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;

class CnpjController extends Controller
{
    public function consultarCnpj($cnpj)
    {
        try {
            // Validação simples do CNPJ
            if (!preg_match('/^\d{14}$/', $cnpj)) {
                return response()->json(['error' => 'CNPJ inválido'], 400);
            }

            // URL da API ReceitaWS
            $url = "https://www.receitaws.com.br/v1/cnpj/{$cnpj}";

            // Requisição para a API
            $response = Http::get($url);

            // Verifica se a requisição foi bem-sucedida
            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json(['error' => 'Erro ao consultar API ReceitaWS'], $response->status());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erro interno: ' . $e->getMessage()], 500);
        }
    }
}
