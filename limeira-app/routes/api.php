<?php

use App\Http\Controllers\CNPJController;

Route::get('/verificar-cnpj/{cnpj}', [CnpjController::class, 'verifyCNPJ']);


