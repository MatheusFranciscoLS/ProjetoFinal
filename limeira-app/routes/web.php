<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FirebaseController;

Route::get('/', function () {
    return view('welcome');
});


Route::get('/usuarios', [FirebaseController::class, 'listarUsuarios']);

use App\Models\Loja;


Route::get('/lojas', function () {
    return Loja::all(['nome', 'latitude', 'longitude', 'descricao']);
});