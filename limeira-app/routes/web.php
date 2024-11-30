<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FirebaseController;
use App\Models\Loja;

use App\Http\Controllers\GeocodingController;
// Rotas existentes
Route::get('/', function () {
    return view('welcome');
});

Route::get('/usuarios', [FirebaseController::class, 'listarUsuarios']);

Route::get('/lojas', function () {
    return Loja::all(['nome', 'latitude', 'longitude', 'descricao']);
});


Route::get('/api/geocode', [GeocodingController::class, 'geocode']);


