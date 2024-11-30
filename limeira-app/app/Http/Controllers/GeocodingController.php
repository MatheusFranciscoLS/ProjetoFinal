<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class GeocodingController extends Controller
{
    public function geocode(Request $request)
    {
        $address = $request->query('address');
        $apiKey = env('GEOCODING_API_KEY');
        
        // Validação básica
        if (!$address) {
            return response()->json(['error' => 'Endereço é obrigatório'], 400);
        }

        // API de Geocodificação (Google Maps ou OpenCage)
        $response = Http::get("https://maps.googleapis.com/maps/api/geocode/json", [
            'address' => $address,
            'key' => $apiKey,
        ]);

        if ($response->successful()) {
            $data = $response->json();

            if (!empty($data['results'])) {
                return response()->json([
                    'coordinates' => $data['results'][0]['geometry']['location'],
                ]);
            } else {
                return response()->json(['error' => 'Coordenadas não encontradas'], 404);
            }
        }

        return response()->json(['error' => 'Erro ao processar solicitação'], 500);
    }
}
