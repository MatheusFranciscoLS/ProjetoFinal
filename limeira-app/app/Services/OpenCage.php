<?php
namespace App\Services;

use GuzzleHttp\Client;

class GeocodingService {
    protected $client;

    public function __construct() {
        $this->client = new Client();
    }

    public function getCoordinates($address) {
        $apiKey = env('OPENCAGE_API_KEY');
        $response = $this->client->get("https://api.opencagedata.com/geocode/v1/json", [
            'query' => [
                'q' => $address,
                'key' => $apiKey,
            ]
        ]);

        $data = json_decode($response->getBody(), true);
        return $data['results'][0]['geometry'] ?? null;
    }
}
