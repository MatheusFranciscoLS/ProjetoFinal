<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use GuzzleHttp\Client;

class CnpjController extends Controller
{
    public function verifyCnpj($cnpj)
    {
        try {
            $client = new Client();
            $response = $client->get("https://www.receitaws.com.br/v1/cnpj/{$cnpj}");

            $data = json_decode($response->getBody()->getContents(), true);

            if (isset($data['status']) && $data['status'] == 'ERROR') {
                return response()->json(['error' => 'CNPJ não encontrado'], 400);
            }

            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erro ao consultar o CNPJ'], 500);
        }
    }
}
