<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class CnpjController extends Controller
{
    public function verifyCNPJ($cnpj)
    {
        try {
            // Remove caracteres especiais do CNPJ
            $cnpj = preg_replace('/[^0-9]/', '', $cnpj);

            // Valida o tamanho do CNPJ
            if (strlen($cnpj) !== 14) {
                return response()->json([
                    'error' => true,
                    'message' => 'CNPJ inválido: deve conter 14 dígitos'
                ], 400);
            }

            // Valida se todos os dígitos são iguais
            if (preg_match('/^(\d)\1+$/', $cnpj)) {
                return response()->json([
                    'error' => true,
                    'message' => 'CNPJ inválido: todos os dígitos são iguais'
                ], 400);
            }

            // Consulta dados na Brasil API
            $response = Http::withoutVerifying()
                ->get("https://brasilapi.com.br/api/cnpj/v1/{$cnpj}");

            if (!$response->successful()) {
                return response()->json([
                    'error' => true,
                    'message' => 'CNPJ não encontrado ou erro na consulta'
                ], $response->status());
            }

            $data = $response->json();

            // Formata os dados
           $formattedData = [
    'cnpj' => $data['cnpj'] ?? '',
    'nome' => $data['razao_social'] ?? '',
    'fantasia' => $data['nome_fantasia'] ?? '',
    'telefone' => $data['ddd_telefone_1'] ?? '',
    'email' => $data['email'] ?? '',
    'logradouro' => $data['logradouro'] ?? '',
    'numero' => $data['numero'] ?? '',
    'complemento' => $data['complemento'] ?? '',
    'bairro' => $data['bairro'] ?? '',
    'municipio' => $data['municipio'] ?? '',
    'uf' => $data['uf'] ?? '',
    'cep' => $data['cep'] ?? '',
    'situacao_cadastral' => $data['descricao_situacao_cadastral'] ?? '',
    'data_situacao_cadastral' => $data['data_situacao_cadastral'] ?? '',
    'opcao_pelo_simples' => $data['opcao_pelo_simples'] ?? null, // Campo correto
    'data_opcao_pelo_simples' => $data['data_opcao_pelo_simples'] ?? null,
    'opcao_pelo_mei' => $data['opcao_pelo_mei'] ?? null, // Campo correto
    'data_opcao_pelo_mei' => $data['data_opcao_pelo_mei'] ?? null,
    'natureza_juridica' => $data['natureza_juridica'] ?? '',
    'porte' => $data['porte'] ?? '',
    'capital_social' => $data['capital_social'] ?? 0,
];

            return response()->json($formattedData);

        } catch (\Exception $e) {
            \Log::error('Erro na consulta de CNPJ: ' . $e->getMessage());
            return response()->json([
                'error' => true,
                'message' => 'Erro ao consultar CNPJ: ' . $e->getMessage()
            ], 500);
        }
    }
}
