<?php

use App\Http\Controllers\CnpjController;

Route::get('verify-cnpj/{cnpj}', [CnpjController::class, 'verifyCnpj']);


