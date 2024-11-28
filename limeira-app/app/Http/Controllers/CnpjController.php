<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use GuzzleHttp\Client;

class CnpjController extends Controller
{
    public function verifyCNPJ($cnpj)
    {
        $client = new Client();

        // URL da API ReceitaWS
        $url = "https://www.receitaws.com.br/v1/cnpj/{$cnpj}";

        try {
            $response = $client->request('GET', $url);
            $data = json_decode($response->getBody()->getContents(), true);

            return response()->json($data);  // Retorna os dados para o front-end
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erro ao acessar a API ReceitaWS.'], 500);
        }
    }
}
