<?php

use App\Http\Controllers\CnpjController;

Route::get('/consultar-cnpj/{cnpj}', [CnpjController::class, 'consultarCnpj']);
