<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FirebaseController;
use App\Models\Loja;
use App\Http\Controllers\EnsureAuthenticated;

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

Route::middleware(['auth.middleware'])->group(function () {
    Route::get('/business-question', [EnsureAuthenticated::class, 'businessQuestion']);
    Route::post('/register-business', [EnsureAuthenticated::class, 'registerBusiness']);
    Route::get('/lojas', [EnsureAuthenticated::class, 'lojasList']);
    Route::get('/loja/{id}', [EnsureAuthenticated::class, 'lojaDetails']);
    Route::get('/rota-endereco/{endereco}', [EnsureAuthenticated::class, 'enderecoDetails']);
});