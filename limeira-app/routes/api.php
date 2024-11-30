<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CnpjController;

// Rota pública para verificação de CNPJ (temporariamente sem autenticação para teste)
Route::get('/cnpj/{cnpj}', [CnpjController::class, 'verifyCNPJ']);


